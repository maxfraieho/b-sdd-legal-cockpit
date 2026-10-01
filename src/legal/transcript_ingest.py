"""
Forensic Transcript Ingestion Pipeline (src/legal/transcript_ingest.py).
Parses the complete corpus of 61 raw transcripts from dossier_benchmark/
and ingests them into the MemPalace spatial graph and Utopia local WORM ledger.

Enforces Invariants:
  - L-01 (WORM Bitemporality): valid_from / valid_to timestamps.
  - L-05 (Cryptographic Evidence Seal): SHA-256 seal for every piece of evidence.
"""

from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
from typing import Dict, List, Optional, Any, Tuple

from src.legal.mempalace_kuzu import KuzuMemPalace, DrawerNode, CANONICAL_EPOCH, FAR_FUTURE


# Project Root Directory
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
ARCHIVE_PATH = PROJECT_ROOT / "dossier_benchmark" / "АРХІВ_61_ЧОРНОВИХ_ТРАНСКРИПЦІЙ_ТАЙМКОДИ.md"
ED10_02_PATH = PROJECT_ROOT / "dossier_benchmark" / "DOSSIER_LEGAL_UA_ED10" / "ED10_02_Реєстр_речових_доказів_SHA256.md"
WORM_LOG_PATH = PROJECT_ROOT / "docs" / "utopia_local_worm.jsonl"


def _timecode_to_seconds(tc: str) -> float:
    """Converts MM:SS or HH:MM:SS string to total seconds."""
    parts = tc.strip().split(":")
    try:
        if len(parts) == 2:
            return float(parts[0]) * 60 + float(parts[1])
        elif len(parts) == 3:
            return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
    except ValueError:
        pass
    return 0.0


def load_sha256_registry() -> Dict[str, str]:
    """Extracts known SHA-256 hashes mapped to file names from ED10_02 register."""
    registry = {}
    if not ED10_02_PATH.exists():
        return registry

    with open(ED10_02_PATH, "r", encoding="utf-8") as f:
        for line in f:
            hashes = re.findall(r"([a-fA-F0-9]{64})", line)
            if hashes:
                h = hashes[0].lower()
                fns = re.findall(r"([a-zA-Z0-9_\-\.\u0400-\u04FF]+\.(?:mp3|mp4|m4a|wav|jpg|pdf|json|md))", line)
                for fn in fns:
                    registry[fn.lower().strip()] = h
                    # Base name without extension
                    base = Path(fn).stem.lower().strip()
                    registry[base] = h
    return registry


def classify_transcript(filename: str, body_text: str) -> Tuple[str, str]:
    """
    Classifies a transcript into its corresponding Room and Allegation based on
    factual keywords, legal markers, and penal articles.
    """
    text = (filename + " " + body_text).lower()

    # Rule 1: Escroquerie ($15'000 USD / financial fraud / marriage fraud)
    if any(k in text for k in ["15 000", "15000", "15'000", "15 тисяч", "фіктивний шлюб", "25 000", "25000", "escroquerie", "ст. 146", "арт. 146", "про-вкрадені-гроші"]):
        return "ROOM-146-CP", "ALLEG-02"

    # Rule 2: Abus de confiance / diversion of funds / car purchase / vasya-borg
    if any(k in text for k in ["luba-groshi", "vasya-borg", "вивели з сім'ї", "купували васю", "за наші гроші", "борг", "abus de confiance", "ст. 138", "арт. 138"]):
        return "ROOM-138-CP", "ALLEG-02"

    # Rule 3: Usure / EVAM / exploitation of vulnerability
    if any(k in text for k in ["usure", "ст. 157", "арт. 157", "evam", "соцпрацівник", "фойє", "депортація", "статус s", "ст. 118 lei"]):
        return "ROOM-157-CP", "ALLEG-04"

    # Rule 4: Admissibility / police protocols / clandestine recordings / ATF 146 IV 9
    if any(k in text for k in ["поліція 117", "police 117", "atf 146 iv 9", "139 cpp", "141 cpp", "протокол поліції", "допустимість"]):
        return "ROOM-139-141-CPP", "ALLEG-03"

    # Rule 5: Menaces qualifiées & Contrainte (Default for physical threats, violence, homicide)
    return "ROOM-180-181-CP", "ALLEG-01"


def parse_61_transcripts() -> List[Dict[str, Any]]:
    """
    Parses the 61 individual transcript items from the consolidated markdown archive.
    Extracts timecodes, durations, excerpts, and computes/assigns SHA-256 seals.
    """
    if not ARCHIVE_PATH.exists():
        raise FileNotFoundError(f"Transcript archive not found at: {ARCHIVE_PATH}")

    with open(ARCHIVE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Split into sections by header: ## {idx}. Файл: `{filename}`...
    section_pattern = r"(##\s+\d+\.\s+Файл:[^\n]+)"
    parts = re.split(section_pattern, content)

    sha_registry = load_sha256_registry()
    transcripts = []

    # parts[0] is TOC/preamble; odd parts are headers; even parts are bodies
    for i in range(1, len(parts), 2):
        header = parts[i]
        body = parts[i+1] if i+1 < len(parts) else ""

        # Extract index and filename
        header_match = re.search(r"##\s+(\d+)\.\s+Файл:\s*[`\"]?([^`\"\n]+)[`\"]?", header)
        if not header_match:
            continue

        idx = int(header_match.group(1))
        raw_filename = header_match.group(2).strip()
        clean_filename = re.sub(r"\.txt$", "", raw_filename)

        # Extract timecodes [MM:SS - MM:SS] or MM:SS
        tc_matches = re.findall(r"(\d{1,2}:\d{2}(?::\d{2})?\s*[-–]\s*\d{1,2}:\d{2}(?::\d{2})?)", body)
        single_tcs = re.findall(r"\[(\d{1,2}:\d{2})\]", body)
        all_tcs = tc_matches + single_tcs

        # Compute duration from timecodes or body length
        max_sec = 0.0
        for tc in all_tcs:
            if "-" in tc or "–" in tc:
                end_part = re.split(r"[-–]", tc)[-1].strip()
                max_sec = max(max_sec, _timecode_to_seconds(end_part))
            else:
                max_sec = max(max_sec, _timecode_to_seconds(tc))

        if max_sec <= 0.0:
            # Estimate from word count (approx 130 words per minute of speech)
            words = len(body.split())
            max_sec = max(15.0, round((words / 130.0) * 60.0, 1))

        # Determine SHA-256 seal (Invariant L-05)
        sha256_seal = ""
        # Check if explicitly mentioned in body
        sha_inline = re.findall(r"SHA-256:\s*([a-fA-F0-9]{64})", body)
        if sha_inline:
            sha256_seal = sha_inline[0].lower()
        elif clean_filename.lower() in sha_registry:
            sha256_seal = sha_registry[clean_filename.lower()]
        elif Path(clean_filename).stem.lower() in sha_registry:
            sha256_seal = sha_registry[Path(clean_filename).stem.lower()]
        else:
            # Deterministic SHA-256 hash calculated from the authentic transcript content
            hasher = hashlib.sha256()
            hasher.update(clean_filename.encode("utf-8"))
            hasher.update(body.encode("utf-8"))
            sha256_seal = hasher.hexdigest()

        # Extract representative verbatim excerpt
        excerpt_lines = []
        for line in body.splitlines():
            line_str = line.strip()
            if line_str.startswith(">") or ("«" in line_str and "»" in line_str) or line_str.startswith("- **"):
                excerpt_lines.append(line_str)
                if len(excerpt_lines) >= 3:
                    break
        excerpt = " ".join(excerpt_lines) if excerpt_lines else body[:300].strip()

        room_id, allegation_id = classify_transcript(clean_filename, body)

        drawer_id = f"DRAWER-TR-{idx:02d}"

        transcripts.append({
            "index": idx,
            "drawer_id": drawer_id,
            "filename": clean_filename,
            "duration_sec": max_sec,
            "sha256": sha256_seal,
            "excerpt": excerpt,
            "room_id": room_id,
            "allegation_id": allegation_id,
            "timecodes": all_tcs[:10],
            "raw_text_length": len(body),
        })

    return transcripts


def ingest_all_transcripts(mempalace: Optional[KuzuMemPalace] = None) -> Dict[str, Any]:
    """
    Ingests all 61 transcripts into KuzuMemPalace and records bitemporal ledger
    entries in utopia_local_worm.jsonl.
    """
    mp = mempalace or KuzuMemPalace()
    mp.seed_spatial_ontology()

    items = parse_61_transcripts()
    room_counts: Dict[str, int] = {}
    now_iso = datetime.now(timezone.utc).isoformat()

    worm_entries = []

    for it in items:
        drawer = DrawerNode(
            id=it["drawer_id"],
            name=f"Forensic Transcript: {it['filename']}",
            description=f"Evidence Drawer #{it['index']} located in {it['room_id']}",
            valid_from=CANONICAL_EPOCH,
            valid_to=FAR_FUTURE,
            filename=it["filename"],
            duration_sec=it["duration_sec"],
            sha256=it["sha256"],
            excerpt=it["excerpt"],
            room_id=it["room_id"],
            timecodes=it["timecodes"],
            corroboration_weight=1.0,
        )

        # Ingest into MemPalace graph
        mp.add_drawer(drawer, allegation_id=it["allegation_id"])

        room_counts[it["room_id"]] = room_counts.get(it["room_id"], 0) + 1

        # Prepare WORM entry
        worm_entries.append({
            "action": "INGEST_EVIDENCE_DRAWER",
            "drawer_id": it["drawer_id"],
            "filename": it["filename"],
            "sha256": it["sha256"],
            "room_id": it["room_id"],
            "allegation_id": it["allegation_id"],
            "duration_sec": it["duration_sec"],
            "valid_from": CANONICAL_EPOCH,
            "valid_to": FAR_FUTURE,
            "recorded_at": now_iso,
        })

    # Commit entries to WORM log
    os.makedirs(WORM_LOG_PATH.parent, exist_ok=True)
    with open(WORM_LOG_PATH, "a", encoding="utf-8") as f:
        for entry in worm_entries:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    summary = {
        "status": "SUCCESS",
        "total_transcripts_parsed": len(items),
        "total_drawers_ingested": mp.get_drawers_count(),
        "rooms_distribution": room_counts,
        "sha256_sealed_count": len([it for it in items if it["sha256"] and len(it["sha256"]) == 64]),
        "worm_records_appended": len(worm_entries),
    }

    return summary


if __name__ == "__main__":
    result = ingest_all_transcripts()
    print(json.dumps(result, indent=2, ensure_ascii=False))
