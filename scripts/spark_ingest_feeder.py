#!/usr/bin/env python3
"""
scripts/spark_ingest_feeder.py — Automated Ingestion Feeder for Google Spark L1 Forensic Pipeline.
B-SDD Legal Framework (Canton de Vaud, PE24.014624-SBA).

Integrates:
- L-01: WORM Bitemporality (Tv valid_time vs Tt transaction_time)
- L-02: 100% Pure Python Standard Library (0 external pip dependencies)
- L-05: Strict SHA-256 verification (ISO/IEC 27037)
- Dual-mode delivery: HTTP via Legal MCP Gateway (:8766) OR direct local CandidateStagingBuffer.
- Optional Telegram alert to @bsdd_legal_cockpit_bot when new candidates queue for HITL review.
"""

import argparse
import hashlib
import json
import logging
import os
from pathlib import Path
import sys
import time
from typing import Any, Dict, List, Optional, Tuple, Union
import urllib.request
import urllib.error

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

try:
    from src.legal.staging_schema import (
        CandidateEvidenceCard,
        CandidateStagingBuffer,
        validate_candidate_dict,
        DEFAULT_STAGING_BUFFER_PATH,
    )
except ImportError:
    CandidateEvidenceCard = None
    CandidateStagingBuffer = None
    validate_candidate_dict = None
    DEFAULT_STAGING_BUFFER_PATH = PROJECT_ROOT / "dossier_benchmark" / "evidence_staging_candidates.json"

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "8942331406:AAHZ-MhlOfO3vWWiR3y9sQrSUQbP7U-ar28")
CHAT_ID_FILE = PROJECT_ROOT / "daemon" / ".chat_id"


def setup_logger(quiet: bool = False) -> logging.Logger:
    logger = logging.getLogger("spark_ingest_feeder")
    logger.setLevel(logging.WARNING if quiet else logging.INFO)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stderr)
        formatter = logging.Formatter("[SPARK-FEEDER] %(asctime)s [%(levelname)s] %(message)s")
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger


def compute_file_sha256(filepath: Path) -> str:
    """Computes SHA-256 in 64KB blocks."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def get_telegram_chat_id() -> Optional[str]:
    """Reads cached chat_id or queries getUpdates dynamically."""
    if CHAT_ID_FILE.exists():
        try:
            cid = CHAT_ID_FILE.read_text(encoding="utf-8").strip()
            if cid:
                return cid
        except Exception:
            pass

    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates"
        req = urllib.request.Request(url, headers={"User-Agent": "SparkIngestFeeder/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("ok") and data.get("result"):
                last_msg = data["result"][-1]
                chat = last_msg.get("message", {}).get("chat", {})
                cid = str(chat.get("id"))
                if cid:
                    CHAT_ID_FILE.write_text(cid, encoding="utf-8")
                    return cid
    except Exception:
        pass
    return None


def send_telegram_alert(text: str) -> bool:
    """Dispatches a notification to @bsdd_legal_cockpit_bot."""
    chat_id = get_telegram_chat_id()
    if not chat_id:
        return False
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = json.dumps({
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": True
        }).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=payload,
            headers={"Content-Type": "application/json", "User-Agent": "SparkIngestFeeder/1.0"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status == 200
    except Exception:
        return False


def load_raw_candidates(input_target: str, logger: logging.Logger) -> List[Dict[str, Any]]:
    """Loads candidate dictionaries from a file, directory, or stdin."""
    results: List[Dict[str, Any]] = []

    if input_target == "-":
        logger.info("Reading candidates from standard input (stdin)...")
        raw = sys.stdin.read().strip()
        if not raw:
            return []
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                results.extend(parsed)
            elif isinstance(parsed, dict):
                results.append(parsed)
        except Exception as e:
            logger.error(f"Failed to parse JSON from stdin: {e}")
            return []
        return results

    path = Path(input_target).resolve()
    if not path.exists():
        logger.error(f"Input path does not exist: {path}")
        return []

    if path.is_file():
        try:
            raw = path.read_text(encoding="utf-8").strip()
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                results.extend(parsed)
            elif isinstance(parsed, dict):
                results.append(parsed)
            logger.info(f"Loaded {len(results)} candidate(s) from {path.name}")
        except Exception as e:
            logger.error(f"Failed to parse JSON from {path}: {e}")
            return []
    elif path.is_dir():
        json_files = sorted(path.glob("*.json"))
        logger.info(f"Scanning directory {path} ({len(json_files)} .json files found)...")
        for jf in json_files:
            try:
                raw = jf.read_text(encoding="utf-8").strip()
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    results.extend(parsed)
                elif isinstance(parsed, dict):
                    results.append(parsed)
            except Exception as e:
                logger.warning(f"Skipping malformed file {jf.name}: {e}")
        logger.info(f"Loaded total {len(results)} raw candidate(s) from {path}")

    return results


def validate_and_enrich_candidates(
    raw_candidates: List[Dict[str, Any]],
    logger: logging.Logger,
    base_evidence_dir: Optional[Path] = None,
) -> Tuple[List[CandidateEvidenceCard], List[str]]:
    """Validates raw candidate dicts and creates typed CandidateEvidenceCard instances."""
    valid_cards: List[CandidateEvidenceCard] = []
    errors: List[str] = []

    for idx, item in enumerate(raw_candidates):
        cand_id = item.get("candidate_id") or f"CAND-AUTOGEN-{idx+1:03d}"
        item["candidate_id"] = cand_id

        # Verify or compute SHA-256 if local file exists
        src_file = item.get("source_file", "")
        if base_evidence_dir and src_file:
            cand_file_path = base_evidence_dir / src_file
            if cand_file_path.exists() and cand_file_path.is_file():
                computed_hash = compute_file_sha256(cand_file_path)
                if not item.get("sha256"):
                    item["sha256"] = computed_hash
                    logger.debug(f"Computed SHA-256 for {src_file}: {computed_hash}")
                elif item.get("sha256").lower() != computed_hash.lower():
                    errors.append(
                        f"SHA-256 mismatch for {cand_id} ({src_file}): "
                        f"expected {item.get('sha256')} vs computed {computed_hash}"
                    )
                    continue

        # Invariant L-01: Auto-populate transaction_time if missing
        if not item.get("transaction_time"):
            item["transaction_time"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # Validate schema
        if validate_candidate_dict:
            is_valid, validation_errors = validate_candidate_dict(item)
            if not is_valid:
                errors.append(f"Candidate {cand_id} validation failed: {'; '.join(validation_errors)}")
                continue

        try:
            card = CandidateEvidenceCard.from_dict(item)
            valid_cards.append(card)
        except Exception as e:
            errors.append(f"Failed to instantiate CandidateEvidenceCard for {cand_id}: {e}")

    return valid_cards, errors


def submit_via_gateway(
    gateway_url: str,
    cards: List[CandidateEvidenceCard],
    logger: logging.Logger
) -> Dict[str, Any]:
    """Posts candidates to the Legal MCP Gateway HTTP endpoint."""
    endpoint = f"{gateway_url.rstrip('/')}/api/tools/legal_staging_ingest"
    payload = json.dumps({"candidates": [c.to_dict() for c in cards]}).encode("utf-8")

    try:
        req = urllib.request.Request(
            endpoint,
            data=payload,
            headers={"Content-Type": "application/json", "User-Agent": "SparkIngestFeeder/1.0"}
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data
    except urllib.error.URLError as e:
        logger.error(f"Failed to reach MCP Gateway at {endpoint}: {e}")
        return {"success": False, "error": f"Gateway unreachable: {e}"}
    except Exception as e:
        logger.error(f"Error submitting to MCP Gateway: {e}")
        return {"success": False, "error": str(e)}


def submit_via_direct_buffer(
    buffer_path: Path,
    cards: List[CandidateEvidenceCard],
    logger: logging.Logger
) -> Dict[str, Any]:
    """Writes candidates directly into the local staging buffer."""
    if not CandidateStagingBuffer:
        return {"success": False, "error": "CandidateStagingBuffer module unavailable"}

    buffer = CandidateStagingBuffer(buffer_path)
    result = buffer.ingest_candidates(cards)
    return result


def main():
    parser = argparse.ArgumentParser(
        description="Spark L1 Forensic Candidate Feeder for B-SDD Legal Staging & HITL Queue."
    )
    parser.add_argument(
        "-i", "--input",
        required=True,
        help="Path to JSON file, directory of JSON candidate cards, or '-' for stdin."
    )
    parser.add_argument(
        "--gateway-url",
        default=os.environ.get("LEGAL_MCP_GATEWAY_URL", "http://127.0.0.1:8766"),
        help="URL of the Legal MCP Gateway (default: http://127.0.0.1:8766)."
    )
    parser.add_argument(
        "--direct-buffer",
        action="store_true",
        help="Bypass MCP Gateway and write directly to the local staging buffer."
    )
    parser.add_argument(
        "--buffer-path",
        default=str(DEFAULT_STAGING_BUFFER_PATH),
        help=f"Path to local staging buffer JSON (default: {DEFAULT_STAGING_BUFFER_PATH})."
    )
    parser.add_argument(
        "--evidence-dir",
        default=None,
        help="Optional path to directory containing physical evidence files for SHA-256 verification."
    )
    parser.add_argument(
        "--notify-telegram",
        action="store_true",
        help="Send Telegram alert to @bsdd_legal_cockpit_bot upon successful candidate ingestion."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate and check candidates without committing to the staging buffer."
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress informational log messages (output JSON result only)."
    )

    args = parser.parse_args()
    logger = setup_logger(args.quiet)

    evidence_dir = Path(args.evidence_dir).resolve() if args.evidence_dir else None

    # Step 1: Load raw candidate records
    raw_records = load_raw_candidates(args.input, logger)
    if not raw_records:
        output = {
            "success": False,
            "error": "No candidate records loaded from specified input.",
            "loaded_count": 0,
            "valid_count": 0,
        }
        print(json.dumps(output, indent=2, ensure_ascii=False))
        sys.exit(1)

    # Step 2: Validate and enrich
    valid_cards, errors = validate_and_enrich_candidates(raw_records, logger, evidence_dir)
    logger.info(f"Validated {len(valid_cards)} card(s) out of {len(raw_records)} (Errors: {len(errors)})")

    if errors:
        for err in errors:
            logger.warning(f"  [VALIDATION-ERR] {err}")

    if not valid_cards:
        output = {
            "success": False,
            "error": "All candidate records failed validation.",
            "validation_errors": errors,
            "loaded_count": len(raw_records),
            "valid_count": 0,
        }
        print(json.dumps(output, indent=2, ensure_ascii=False))
        sys.exit(2)

    # Step 3: Dry-run check
    if args.dry_run:
        logger.info("DRY-RUN mode enabled: skipping persistence.")
        output = {
            "success": True,
            "dry_run": True,
            "loaded_count": len(raw_records),
            "valid_count": len(valid_cards),
            "candidates": [c.to_dict() for c in valid_cards],
            "validation_errors": errors,
        }
        print(json.dumps(output, indent=2, ensure_ascii=False))
        sys.exit(0)

    # Step 4: Submission
    if args.direct_buffer:
        logger.info(f"Submitting {len(valid_cards)} candidate(s) directly to local buffer: {args.buffer_path}")
        result = submit_via_direct_buffer(Path(args.buffer_path), valid_cards, logger)
    else:
        logger.info(f"Submitting {len(valid_cards)} candidate(s) via MCP Gateway: {args.gateway_url}")
        result = submit_via_gateway(args.gateway_url, valid_cards, logger)

    result["loaded_count"] = len(raw_records)
    result["valid_count"] = len(valid_cards)
    if errors:
        result["validation_errors"] = errors

    # Step 5: Telegram Notification
    ingested_count = result.get("ingested_count", len(valid_cards))
    if args.notify_telegram and result.get("success") and ingested_count > 0:
        candi_cotes = ", ".join([c.candidate_id for c in valid_cards[:5]])
        if len(valid_cards) > 5:
            candi_cotes += f" (+{len(valid_cards)-5} autres)"
        tg_text = (
            f"📥 <b>[SPARK L1] Нові кандидати в черзі HITL</b>\n"
            f"🔢 <b>Кількість:</b> {ingested_count} нових карток\n"
            f"📋 <b>Кандидати:</b> <code>{candi_cotes}</code>\n"
            f"⚖️ <b>Статус:</b> Очікує верифікації адвокатом ( ст. 139 al. 2 CPP )\n"
            f"🌐 <b>Черга перевірки:</b> <a href=\"https://b-sdd-legal-ui.pages.dev/\">Advocate Cockpit</a>"
        )
        notified = send_telegram_alert(tg_text)
        result["telegram_alert_sent"] = notified
        if notified:
            logger.info("Telegram alert successfully sent to @bsdd_legal_cockpit_bot.")

    print(json.dumps(result, indent=2, ensure_ascii=False))
    sys.exit(0 if result.get("success") else 1)


if __name__ == "__main__":
    main()
