#!/usr/bin/env python3
"""
B-SDD Legal Advocate Cockpit: Code & Documentation Dumps Generator for NotebookLM.
Generates full-text structured dumps for Frontend, Backend, and Canonical Documentation.
Standard: B-SDD Methodology v1.3 (Invariants L-01..L-05).
"""
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = PROJECT_ROOT / "dist" / "dumps"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

FRONTEND_ROOT = PROJECT_ROOT / "b-sdd-legal-ui" / "src"
BACKEND_DIRS = [
    PROJECT_ROOT / "src" / "legal",
    PROJECT_ROOT / "tests",
    PROJECT_ROOT / "daemon",
    PROJECT_ROOT / "deploy" / "mcp_gateway",
    PROJECT_ROOT / "scripts",
]

IGNORE_DIRS = {
    "node_modules", ".git", ".gitnexus", "dist", "build", "__pycache__", ".pytest_cache"
}
IGNORE_EXTS = {
    ".png", ".jpg", ".jpeg", ".mp3", ".wav", ".m4a", ".epub", ".pdf", ".pyc"
}

def dump_files(base_dir: Path, target_paths: list[Path], output_file: Path, title: str):
    collected_files = []
    for p in target_paths:
        if p.is_file():
            collected_files.append(p)
        elif p.is_dir():
            for root, dirs, files in os.walk(p):
                dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
                for f in sorted(files):
                    fp = Path(root) / f
                    if fp.suffix.lower() not in IGNORE_EXTS and not f.startswith("."):
                        collected_files.append(fp)

    collected_files = sorted(list(set(collected_files)))
    
    with open(output_file, "w", encoding="utf-8") as out:
        out.write(f"# {title}\n")
        out.write(f"# Project: B-SDD Legal Advocate Cockpit (v2.7.0)\n")
        out.write(f"# Files Count: {len(collected_files)}\n\n")
        out.write("=" * 80 + "\n\n")

        for fp in collected_files:
            try:
                rel_path = fp.relative_to(PROJECT_ROOT)
            except ValueError:
                rel_path = fp.name
            
            out.write(f"// FILE: {rel_path}\n")
            out.write("-" * 80 + "\n")
            try:
                content = fp.read_text(encoding="utf-8", errors="replace")
                out.write(content)
                if not content.endswith("\n"):
                    out.write("\n")
            except Exception as e:
                out.write(f"// Error reading file: {e}\n")
            out.write("\n\n" + "=" * 80 + "\n\n")

    size_kb = output_file.stat().st_size / 1024
    print(f"[OK] Generated {output_file.name} ({len(collected_files)} files, {size_kb:.1f} KB)")


def main():
    print("==============================================================================")
    print(" [B-SDD] Generating Canonical Dumps for NotebookLM")
    print("==============================================================================")

    # 1. Frontend Dump
    frontend_dump = OUTPUT_DIR / "b-sdd-legal-frontend-dump-v2.7.txt"
    dump_files(
        base_dir=PROJECT_ROOT,
        target_paths=[FRONTEND_ROOT, PROJECT_ROOT / "b-sdd-legal-ui" / "package.json", PROJECT_ROOT / "b-sdd-legal-ui" / "vite.config.ts"],
        output_file=frontend_dump,
        title="B-SDD Legal Advocate Cockpit: Full Frontend Source Code Dump (v2.7.0 React 19 / TypeScript / Appwrite Cloud)"
    )

    # 2. Backend Dump
    backend_dump = OUTPUT_DIR / "b-sdd-legal-backend-dump-v2.7.txt"
    dump_files(
        base_dir=PROJECT_ROOT,
        target_paths=BACKEND_DIRS,
        output_file=backend_dump,
        title="B-SDD Legal Advocate Cockpit: Full Backend Source Code Dump (v2.7.0 Pure Python Core / Invariants / Daemon / MCP)"
    )

    print("\nAll code dumps compiled successfully in dist/dumps/")

if __name__ == "__main__":
    main()
