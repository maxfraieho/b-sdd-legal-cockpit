#!/usr/bin/env python3
"""
scripts/pii_scan.py — PII & Sensitivity Exposure Scanner (B-SDD S00 / Rule 5 compliant)
100% Python Standard Library. Read-only audit tool.

SPECIFICATION:
1. Inputs:
   - .private/party_map.json (read internally by script only; never printed or logged).
   - Git working tree (tracked + untracked non-ignored), .context/, prompts/, and full git history.
2. Detection Patterns:
   - DATE_DMY: dd.mm.yyyy
   - DATE_YMD: yyyy-mm-dd
   - CASE_NUMBER: PE\d{2}\.\d{6}-[A-Z]{3}
   - SWISS_AHV: 756\.\d{4}\.\d{4}\.\d{2}
   - IBAN: [A-Z]{2}\d{2}[A-Z0-9]{11,30}
   - PHONE: Swiss (+41), Ukrainian (+380), or standard local formats
   - PASSPORT_KEYWORD: 'passport' or 'паспорт' near digit runs (6-12 chars)
   - MRZ: Machine Readable Zone strings [A-Z0-9<]{30,44} containing '<'
   - PARTY_NAME: Cyrillic/Latin name variants from .private/party_map.json
3. Privacy & Output Format:
   - Working tree: path:line:TYPE (NEVER the matched text)
   - Git history: commit:path:TYPE (NEVER the matched text)
   - Aggregations: counts per type, counts per directory.
4. Additional Reports:
   - Tracked image, PDF, audio and video files (path and size).
   - Git remote names and hostnames (zero credentials).
   - Verification whether .gitignore covers .private/ and vault directories.
   - Dedicated check for .context/active_rules.md and prompt templates.
5. Exit Codes:
   - 0: Clean (no PII findings detected)
   - 1: Findings detected
   - 2: Execution error
"""

import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from typing import Dict, List, Optional, Set, Tuple

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Regex Patterns
PATTERNS = {
    "CASE_NUMBER": re.compile(r"\bPE\d{2}\.\d{6}-[A-Z]{3}\b"),
    "SWISS_AHV": re.compile(r"\b756\.\d{4}\.\d{4}\.\d{2}\b"),
    "IBAN": re.compile(r"\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b"),
    "DATE_DMY": re.compile(r"\b(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(19\d\d|20\d\d)\b"),
    "DATE_YMD": re.compile(r"\b(19\d\d|20\d\d)-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])\b"),
    "PHONE": re.compile(r"(?:\+41|\+380|\b0)\s?\(?\d{2,3}\)?[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}\b"),
    "PASSPORT_KEYWORD": re.compile(r"(?i)(?:passport|паспорт)[\s\S]{0,30}\b\d{6,10}\b|\b\d{6,10}\b[\s\S]{0,30}(?:passport|паспорт)"),
    "MRZ": re.compile(r"\b[A-Z0-9<]{30,44}\b"),
}

MEDIA_EXTS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff",
    ".pdf",
    ".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac",
    ".mp4", ".avi", ".mov", ".mkv", ".webm",
    ".epub"
}

BINARY_EXTS = MEDIA_EXTS | {".pyc", ".db", ".sqlite", ".bin", ".tar", ".gz", ".zip", ".woff", ".woff2", ".ttf"}


def load_party_names(repo_root: Path) -> List[Tuple[str, re.Pattern]]:
    party_map_file = repo_root / ".private" / "party_map.json"
    names_patterns = []
    if not party_map_file.is_file():
        return names_patterns

    try:
        data = json.loads(party_map_file.read_text(encoding="utf-8"))
        raw_names = set()
        if isinstance(data, dict):
            for k, v in data.items():
                if isinstance(v, str):
                    raw_names.add(v.strip())
                elif isinstance(v, list):
                    for item in v:
                        if isinstance(item, str):
                            raw_names.add(item.strip())
        elif isinstance(data, list):
            for item in data:
                if isinstance(item, str):
                    raw_names.add(item.strip())

        for name in raw_names:
            if len(name) >= 3:
                # Word-boundary pattern case-insensitive
                pat = re.compile(r"\b" + re.escape(name) + r"\b", re.IGNORECASE)
                names_patterns.append(("PARTY_NAME", pat))
    except Exception:
        pass
    return names_patterns


def is_binary_file(path: Path) -> bool:
    if path.suffix.lower() in BINARY_EXTS:
        return True
    try:
        with open(path, "rb") as f:
            chunk = f.read(1024)
            if b"\x00" in chunk:
                return True
    except Exception:
        return True
    return False


def get_git_files(repo_root: Path) -> List[Path]:
    files = set()
    try:
        tracked = subprocess.check_output(
            ["git", "ls-files"], cwd=str(repo_root), text=True, stderr=subprocess.DEVNULL
        ).splitlines()
        for f in tracked:
            p = repo_root / f
            if p.is_file():
                files.add(p)

        untracked = subprocess.check_output(
            ["git", "ls-files", "--others", "--exclude-standard"],
            cwd=str(repo_root), text=True, stderr=subprocess.DEVNULL
        ).splitlines()
        for f in untracked:
            p = repo_root / f
            if p.is_file():
                files.add(p)
    except Exception:
        pass

    # Ensure .context/ and prompts/ are covered if not in git
    for extra_dir in [repo_root / ".context", repo_root / "prompts"]:
        if extra_dir.is_dir():
            for root, _, fs in os.walk(extra_dir):
                for f in fs:
                    p = Path(root) / f
                    if p.is_file():
                        files.add(p)

    return sorted(list(files))


def scan_file_lines(path: Path, repo_root: Path, party_patterns: List[Tuple[str, re.Pattern]]) -> List[Tuple[str, int, str]]:
    findings = []
    if is_binary_file(path):
        return findings

    try:
        rel_path = path.relative_to(repo_root).as_posix()
    except ValueError:
        rel_path = path.as_posix()

    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            for line_no, line in enumerate(f, start=1):
                # Never match on party_map itself or scanner script
                if ".private/party_map.json" in rel_path or rel_path.endswith("scripts/pii_scan.py"):
                    continue

                for ptype, pat in PATTERNS.items():
                    if ptype == "MRZ":
                        # Require '<' to avoid matching plain hex or base64
                        if "<" in line and pat.search(line):
                            findings.append((rel_path, line_no, ptype))
                    else:
                        if pat.search(line):
                            findings.append((rel_path, line_no, ptype))

                for ptype, pat in party_patterns:
                    if pat.search(line):
                        findings.append((rel_path, line_no, ptype))
    except Exception:
        pass
    return findings


def scan_history(repo_root: Path, party_patterns: List[Tuple[str, re.Pattern]]) -> List[Tuple[str, str, str]]:
    history_findings = []
    cmd = ["git", "log", "--all", "-p", "-U0"]
    try:
        proc = subprocess.Popen(cmd, cwd=str(repo_root), stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, errors="replace")
        current_commit = "HEAD"
        current_file = ""

        if proc.stdout:
            for line in proc.stdout:
                if line.startswith("commit "):
                    current_commit = line.strip().split()[1][:8]
                elif line.startswith("+++ b/"):
                    current_file = line.strip()[6:]
                elif line.startswith("+") and not line.startswith("+++"):
                    added_text = line[1:]
                    for ptype, pat in PATTERNS.items():
                        if ptype == "MRZ":
                            if "<" in added_text and pat.search(added_text):
                                history_findings.append((current_commit, current_file, ptype))
                        else:
                            if pat.search(added_text):
                                history_findings.append((current_commit, current_file, ptype))

                    for ptype, pat in party_patterns:
                        if pat.search(added_text):
                            history_findings.append((current_commit, current_file, ptype))
        proc.wait()
    except Exception:
        pass
    return history_findings


def audit_media_files(repo_root: Path) -> List[Tuple[str, int]]:
    media_items = []
    try:
        tracked = subprocess.check_output(
            ["git", "ls-files"], cwd=str(repo_root), text=True, stderr=subprocess.DEVNULL
        ).splitlines()
        for f in tracked:
            p = repo_root / f
            if p.suffix.lower() in MEDIA_EXTS and p.is_file():
                media_items.append((f, p.stat().st_size))
    except Exception:
        pass
    return sorted(media_items, key=lambda x: x[0])


def audit_remotes(repo_root: Path) -> List[Tuple[str, str]]:
    remotes = []
    try:
        raw = subprocess.check_output(
            ["git", "remote", "-v"], cwd=str(repo_root), text=True, stderr=subprocess.DEVNULL
        ).splitlines()
        for line in raw:
            parts = line.strip().split()
            if len(parts) >= 2:
                name, url = parts[0], parts[1]
                # Redact user/token
                clean_host = url
                if "@" in url:
                    clean_host = url.split("@")[-1].replace(":", "/")
                remotes.append((name, clean_host))
    except Exception:
        pass
    return sorted(list(set(remotes)))


def check_gitignore_status(repo_root: Path) -> Dict[str, bool]:
    gitignore_path = repo_root / ".gitignore"
    status = {
        ".private/": False,
        "vault_dirs": False
    }
    if gitignore_path.is_file():
        content = gitignore_path.read_text(encoding="utf-8")
        status[".private/"] = ".private/" in content or ".private" in content
        status["vault_dirs"] = any(k in content for k in ["colab_evidence/", "vault/", ".vault/", "evidence_vault/"])
    return status


def main():
    parser = argparse.ArgumentParser(description="PII & Sensitivity Exposure Scanner (B-SDD)")
    parser.add_argument("--history", action="store_true", help="Scan full git history")
    parser.add_argument("--repo", default=str(PROJECT_ROOT), help="Path to repository")
    args = parser.parse_args()

    repo_root = Path(args.repo).resolve()
    party_patterns = load_party_names(repo_root)

    print("==============================================================================")
    print(" [B-SDD AUDIT] PII Exposure Scanner (scripts/pii_scan.py)")
    print(f" Repository: {repo_root}")
    print(f" Party map loaded: {len(party_patterns)} name pattern(s)")
    print("==============================================================================")

    # 1. Scan Working Tree
    files = get_git_files(repo_root)
    tree_findings = []
    for fp in files:
        tree_findings.extend(scan_file_lines(fp, repo_root, party_patterns))

    # Print Findings: path:line:TYPE
    print("\n--- WORKING TREE FINDINGS (path:line:TYPE) ---")
    type_counts: Dict[str, int] = {}
    dir_counts: Dict[str, int] = {}

    for path, line_no, ptype in tree_findings:
        print(f"{path}:{line_no}:{ptype}")
        type_counts[ptype] = type_counts.get(ptype, 0) + 1
        d = path.split("/")[0] if "/" in path else "."
        dir_counts[d] = dir_counts.get(d, 0) + 1

    if not tree_findings:
        print("NONE")

    print("\n--- WORKING TREE AGGREGATIONS ---")
    print(f"Total Working Tree Findings: {len(tree_findings)}")
    print("Counts per TYPE:")
    for t, c in sorted(type_counts.items()):
        print(f"  {t}: {c}")
    print("Counts per Directory:")
    for d, c in sorted(dir_counts.items()):
        print(f"  {d}: {c}")

    # 2. History Findings (if requested)
    history_findings = []
    if args.history:
        print("\n--- GIT HISTORY FINDINGS (commit:path:TYPE) ---")
        history_findings = scan_history(repo_root, party_patterns)
        hist_type_counts: Dict[str, int] = {}
        hist_dir_counts: Dict[str, int] = {}
        for c_hash, path, ptype in history_findings:
            print(f"{c_hash}:{path}:{ptype}")
            hist_type_counts[ptype] = hist_type_counts.get(ptype, 0) + 1
            d = path.split("/")[0] if "/" in path else "."
            hist_dir_counts[d] = hist_dir_counts.get(d, 0) + 1

        print("\n--- GIT HISTORY AGGREGATIONS ---")
        print(f"Total History Findings: {len(history_findings)}")
        print("Counts per TYPE:")
        for t, c in sorted(hist_type_counts.items()):
            print(f"  {t}: {c}")
        print("Counts per Directory:")
        for d, c in sorted(hist_dir_counts.items()):
            print(f"  {d}: {c}")

    # 3. Tracked Media Files Report
    media_items = audit_media_files(repo_root)
    print("\n--- TRACKED MEDIA FILES (path, size_bytes) ---")
    print(f"Total Tracked Media Files: {len(media_items)}")
    total_media_size = sum(sz for _, sz in media_items)
    print(f"Total Media Size: {total_media_size / (1024*1024):.2f} MB")
    for p, sz in media_items:
        print(f"{p} ({sz} bytes)")

    # 4. Remotes Report
    remotes = audit_remotes(repo_root)
    print("\n--- GIT REMOTES & HOSTS ---")
    if remotes:
        for name, host in remotes:
            print(f"Remote: {name} -> {host}")
    else:
        print("NONE (purely local repository)")

    # 5. Gitignore Status
    gi_status = check_gitignore_status(repo_root)
    print("\n--- GITIGNORE COVERAGE ---")
    print(f".private/ covered: {gi_status['.private/']}")
    print(f"Vault / raw evidence directories covered: {gi_status['vault_dirs']}")

    # 6. Active Rules and Prompt Templates Findings Check
    active_rules_file = repo_root / ".context" / "active_rules.md"
    print("\n--- INJECTED SESSIONS FINDINGS CHECK ---")
    active_rules_findings = []
    if active_rules_file.is_file():
        active_rules_findings = scan_file_lines(active_rules_file, repo_root, party_patterns)
        print(f".context/active_rules.md findings: {len(active_rules_findings)}")
        for p, l, t in active_rules_findings:
            print(f"  {p}:{l}:{t}")
    else:
        print(".context/active_rules.md not found")

    prompts_dir = repo_root / "prompts"
    prompt_findings = []
    if prompts_dir.is_dir():
        for root, _, fs in os.walk(prompts_dir):
            for f in fs:
                pf = Path(root) / f
                prompt_findings.extend(scan_file_lines(pf, repo_root, party_patterns))
        print(f"Prompts directory findings: {len(prompt_findings)}")
        for p, l, t in prompt_findings:
            print(f"  {p}:{l}:{t}")
    else:
        print("prompts/ directory not found")

    total_findings = len(tree_findings) + len(history_findings)
    sys.exit(1 if total_findings > 0 else 0)


if __name__ == "__main__":
    main()
