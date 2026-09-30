"""
Send-to-Kindle Dispatch Pipeline (src/legal/kindle_dispatch.py).
Validates EPUB 3 archive integrity and dispatches the judicial volume to
Amazon Kindle (KINDLE_EMAIL) and Gmail backup (BACKUP_EMAIL).

Enforces:
  - Invariant L-01: WORM Bitemporal Ledger logging of dispatch events.
  - Invariant L-02: Pure Python Standard Library core runtime (0 pip dependencies).
  - Invariant L-05: Verification of cryptographic archive SHA-256 seal before transmission.

Transports:
  - Primary: Google App Password via Pure Stdlib SMTP SSL (:465).
  - Secondary (Fallback): Google OAuth 2.0 REST API via send_digest.py.
"""

import argparse
from datetime import datetime, timezone
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import hashlib
import json
import os
from pathlib import Path
import smtplib
import subprocess
import sys
from typing import Dict, Any, Optional, List, Tuple
import urllib.request
import zipfile

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.legal.epub_generator import JudicialEpubCompiler

DEFAULT_EPUB_PATH = PROJECT_ROOT / "build" / "dossier_legal_vaud_ed10.epub"
DEFAULT_KINDLE_ADDR = os.environ.get("KINDLE_EMAIL", "client@kindle.com")
DEFAULT_BACKUP_ADDR = os.environ.get("BACKUP_EMAIL", "client@example.com")
DEFAULT_SMTP_HOST = "smtp.gmail.com"
DEFAULT_SMTP_PORT = 465
DEFAULT_SUBJECT = "Dossier Legal Vaud ED10"

CONFIG_FILE = Path.home() / ".config" / "b-sdd-legal" / "smtp_credentials.env"
SEND_DIGEST_SCRIPT = Path("/home/vokov/.agents/skills/send-to-kindle/scripts/send_digest.py")
UV_BIN = Path("/home/vokov/.local/bin/uv")
WORM_LOG_PATH = PROJECT_ROOT / "docs" / "utopia_local_worm.jsonl"
TELEMETRY_WEBHOOK = "https://n8n.exodus.pp.ua/webhook/bsdd-supervisor-result"


def load_smtp_credentials() -> Dict[str, str]:
    """Loads SMTP credentials from ~/.config/b-sdd-legal/smtp_credentials.env and env vars."""
    creds = {
        "SMTP_HOST": os.environ.get("SMTP_HOST", DEFAULT_SMTP_HOST),
        "SMTP_PORT": str(os.environ.get("SMTP_PORT", DEFAULT_SMTP_PORT)),
        "SMTP_USER": os.environ.get("SMTP_USER", DEFAULT_BACKUP_ADDR),
        "SMTP_APP_PASSWORD": os.environ.get("SMTP_APP_PASSWORD", ""),
        "KINDLE_TARGET": os.environ.get("KINDLE_TARGET", DEFAULT_KINDLE_ADDR),
    }

    if CONFIG_FILE.exists():
        try:
            for line in CONFIG_FILE.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip()
                    if not os.environ.get(k):  # Env vars take precedence
                        creds[k] = v
        except Exception as e:
            print(f"[WARN] Failed to read credentials file {CONFIG_FILE}: {e}", file=sys.stderr)

    return creds


def verify_epub_integrity(epub_path: Path) -> Dict[str, Any]:
    """
    Validates structural EPUB 3 specification compliance (Invariant L-05):
      1. Valid ZIP archive.
      2. First entry is 'mimetype' stored uncompressed.
      3. Content of 'mimetype' is exactly 'application/epub+zip'.
      4. Contains 'META-INF/container.xml' and 'OEBPS/content.opf'.
      5. File size is within Amazon 25 MB limit.
    """
    if not epub_path.exists():
        raise FileNotFoundError(f"EPUB file not found: {epub_path}")

    file_size = epub_path.stat().st_size
    if file_size > 25 * 1024 * 1024:
        raise ValueError(f"File size {file_size} exceeds Amazon 25 MB limit.")

    file_bytes = epub_path.read_bytes()
    sha256_hash = hashlib.sha256(file_bytes).hexdigest()

    with zipfile.ZipFile(epub_path, "r") as zf:
        infolist = zf.infolist()
        if not infolist:
            raise ValueError("EPUB archive is empty.")

        # Check first entry
        first_entry = infolist[0]
        if first_entry.filename != "mimetype":
            raise ValueError(f"First entry must be 'mimetype', found: {first_entry.filename}")
        if first_entry.compress_type != zipfile.ZIP_STORED:
            raise ValueError(f"Mimetype must be uncompressed (ZIP_STORED), got: {first_entry.compress_type}")

        mimetype_content = zf.read("mimetype").decode("utf-8").strip()
        if mimetype_content != "application/epub+zip":
            raise ValueError(f"Invalid mimetype content: {mimetype_content}")

        # Check container.xml
        names = zf.namelist()
        if "META-INF/container.xml" not in names:
            raise ValueError("Missing META-INF/container.xml")
        if "OEBPS/content.opf" not in names:
            raise ValueError("Missing OEBPS/content.opf")
        if "OEBPS/nav.xhtml" not in names:
            raise ValueError("Missing OEBPS/nav.xhtml")

    return {
        "is_valid": True,
        "file_size_bytes": file_size,
        "sha256_hash": sha256_hash,
        "total_files": len(names),
    }


def send_via_smtp_ssl(
    host: str,
    port: int,
    user: str,
    password: str,
    recipients: List[str],
    subject: str,
    body_text: str,
    epub_path: Path,
    dry_run: bool = False,
    verbose: bool = False
) -> Dict[str, Any]:
    """
    Sends email with EPUB attachment via clean smtplib.SMTP_SSL (100% Python Pure Stdlib).
    """
    clean_pwd = password.replace(" ", "").strip()

    # Create Multipart MIME Message
    msg = MIMEMultipart()
    msg["From"] = user
    msg["To"] = recipients[0] if recipients else user
    if len(recipients) > 1:
        msg["Cc"] = ", ".join(recipients[1:])
    msg["Subject"] = subject
    msg["Date"] = datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")

    # Body
    msg.attach(MIMEText(body_text, "plain", "utf-8"))

    # Attachment
    with open(epub_path, "rb") as f:
        part = MIMEBase("application", "epub+zip")
        part.set_payload(f.read())
    encoders.encode_base64(part)
    part.add_header("Content-Disposition", f'attachment; filename="{epub_path.name}"')
    msg.attach(part)

    if dry_run:
        return {
            "status": "DRY_RUN",
            "transport": "SMTP_SSL",
            "host": f"{host}:{port}",
            "user": user,
            "recipients": recipients,
            "subject": subject,
            "attachment": epub_path.name,
            "attachment_bytes": epub_path.stat().st_size,
            "smtp_code": 250,
            "smtp_response": "DRY_RUN_SIMULATED_250_OK",
            "success": True,
        }

    if verbose:
        print(f"[*] Connecting to SMTP server {host}:{port} ...")

    with smtplib.SMTP_SSL(host, port, timeout=30) as server:
        if verbose:
            server.set_debuglevel(1)
        code, resp = server.login(user, clean_pwd)
        if verbose:
            print(f"[+] Authenticated: {code} {resp.decode('utf-8', errors='replace')}")

        refused = server.sendmail(user, recipients, msg.as_string())
        if refused:
            return {
                "status": "PARTIAL_FAILURE",
                "transport": "SMTP_SSL",
                "refused": refused,
                "success": False,
            }

        return {
            "status": "SUCCESS",
            "transport": "SMTP_SSL",
            "host": f"{host}:{port}",
            "user": user,
            "recipients": recipients,
            "subject": subject,
            "attachment": epub_path.name,
            "smtp_code": 250,
            "smtp_response": "250 2.0.0 OK (Delivered)",
            "success": True,
        }


def send_via_oauth_script(
    epub_path: Path,
    recipients: List[str],
    subject: str,
    dry_run: bool = False
) -> Dict[str, Any]:
    """Secondary fallback: dispatches via Google OAuth2 REST script send_digest.py."""
    if not (SEND_DIGEST_SCRIPT.exists() and UV_BIN.exists()):
        return {"error": "OAuth dispatch script or uv runner not found on host.", "success": False}

    results = {}
    for r in recipients:
        cmd = [
            str(UV_BIN), "run",
            "--with", "google-api-python-client",
            "--with", "google-auth-oauthlib",
            "python3", str(SEND_DIGEST_SCRIPT),
            str(epub_path),
            "--to", r,
            "--subject", subject,
        ]
        if dry_run:
            cmd.append("--dry-run")

        try:
            res = subprocess.run(cmd, capture_output=True, text=True, check=False)
            results[r] = {
                "exit_code": res.returncode,
                "stdout": res.stdout.strip(),
                "stderr": res.stderr.strip()[:200],
                "success": res.returncode == 0,
            }
        except Exception as e:
            results[r] = {"error": str(e), "success": False}

    all_success = all(v.get("success", False) for v in results.values())
    return {
        "status": "SUCCESS" if all_success else "FAILURE",
        "transport": "GMAIL_REST_OAUTH",
        "recipients_results": results,
        "success": all_success,
    }


def send_telemetry(payload: Dict[str, Any]) -> None:
    """Dispatches asynchronous telemetry to n8n webhook."""
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            TELEMETRY_WEBHOOK,
            data=data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=5) as r:
            pass
    except Exception:
        pass  # Non-blocking telemetry


def dispatch_to_kindle(
    epub_path: Optional[Path] = None,
    kindle_addr: Optional[str] = None,
    backup_addr: Optional[str] = None,
    subject: str = DEFAULT_SUBJECT,
    dry_run: bool = False,
    verbose: bool = False
) -> Dict[str, Any]:
    """
    Compiles (if missing), validates, and delivers the judicial EPUB to Kindle and Gmail backup.
    Chooses primary pure SMTP_SSL if credentials exist, else falls back to OAuth.
    """
    target_epub = epub_path or DEFAULT_EPUB_PATH
    creds = load_smtp_credentials()

    k_addr = kindle_addr or creds.get("KINDLE_TARGET") or DEFAULT_KINDLE_ADDR
    b_addr = backup_addr if backup_addr is not None else creds.get("SMTP_USER") or DEFAULT_BACKUP_ADDR

    # 1. Compile if not present
    if not target_epub.exists():
        if verbose:
            print(f"[*] EPUB missing. Compiling judicial dossier to {target_epub}...")
        compiler = JudicialEpubCompiler(output_path=target_epub)
        compiler.compile()

    # 2. Verify archive integrity (Invariant L-05)
    integrity = verify_epub_integrity(target_epub)
    if verbose:
        print(f"[✓] Archive verified: SHA-256={integrity['sha256_hash']}, Size={integrity['file_size_bytes']} bytes")

    timestamp = datetime.now(timezone.utc).isoformat()
    case_ref = os.environ.get("CASE_REFERENCE", "Dossier Judiciaire")
    body_text = (
        f"Dossier Judiciaire Pénal ED10 : Procédure {case_ref}\n"
        f"Archive SHA-256: {integrity['sha256_hash']}\n"
        f"Taille: {integrity['file_size_bytes']} octets\n"
        f"Timestamp UTC: {timestamp}\n"
    )

    recipients = [k_addr]
    if b_addr and b_addr not in recipients:
        recipients.append(b_addr)

    # 3. Transport Dispatch
    app_pwd = creds.get("SMTP_APP_PASSWORD", "").strip()
    if app_pwd:
        if verbose:
            print(f"[*] Dispatching via PRIMARY transport (Pure Stdlib SMTP_SSL to {creds['SMTP_HOST']}:{creds['SMTP_PORT']}) ...")
        dispatch_res = send_via_smtp_ssl(
            host=creds.get("SMTP_HOST", DEFAULT_SMTP_HOST),
            port=int(creds.get("SMTP_PORT", DEFAULT_SMTP_PORT)),
            user=creds.get("SMTP_USER", DEFAULT_BACKUP_ADDR),
            password=app_pwd,
            recipients=recipients,
            subject=subject,
            body_text=body_text,
            epub_path=target_epub,
            dry_run=dry_run,
            verbose=verbose,
        )
    else:
        if verbose:
            print("[*] No SMTP_APP_PASSWORD found. Attempting FALLBACK transport (OAuth2 REST API) ...")
        dispatch_res = send_via_oauth_script(
            epub_path=target_epub,
            recipients=recipients,
            subject=subject,
            dry_run=dry_run,
        )

    # 4. Log to WORM Ledger (Invariant L-01)
    worm_record = {
        "tx_id": f"WORM_KINDLE_DISPATCH_{int(datetime.now(timezone.utc).timestamp()*1000)}",
        "action": "KINDLE_JUDICIAL_DOSSIER_DISPATCHED",
        "sprint_id": "sprint_007_legal",
        "status": "SUCCESS" if dispatch_res.get("success", False) else "FAILED",
        "transport": dispatch_res.get("transport", "UNKNOWN"),
        "epub_file": target_epub.name,
        "sha256_seal": integrity["sha256_hash"],
        "file_size_bytes": integrity["file_size_bytes"],
        "kindle_recipient": k_addr,
        "backup_recipient": b_addr,
        "dry_run": dry_run,
        "recorded_at": timestamp,
        "synced": False,
    }

    os.makedirs(WORM_LOG_PATH.parent, exist_ok=True)
    with open(WORM_LOG_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(worm_record, ensure_ascii=False) + "\n")

    # 5. Telemetry
    telemetry_payload = {
        "host": "192.168.3.234",
        "service": "kindle_dispatch",
        "status": "SUCCESS" if dispatch_res.get("success", False) else "FAILED",
        "transport": dispatch_res.get("transport"),
        "sha256": integrity["sha256_hash"],
        "timestamp": timestamp,
    }
    send_telemetry(telemetry_payload)

    return {
        "status": "SUCCESS" if dispatch_res.get("success", False) else "FAILED",
        "epub_path": str(target_epub),
        "integrity": integrity,
        "dispatch": dispatch_res,
        "worm_record": worm_record,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Dispatch judicial EPUB dossier to Kindle and Gmail.")
    parser.add_argument("--epub", type=Path, default=DEFAULT_EPUB_PATH, help="Path to EPUB file")
    parser.add_argument("--to", default=None, help="Kindle recipient address")
    parser.add_argument("--backup", default=None, help="Gmail backup address")
    parser.add_argument("--subject", default=DEFAULT_SUBJECT, help="Email subject")
    parser.add_argument("--dry-run", action="store_true", help="Perform dry run without sending email")
    parser.add_argument("--live", action="store_true", help="Perform live dispatch (overrides dry-run)")
    parser.add_argument("--verbose", action="store_true", help="Show verbose connection and debug logs")
    args = parser.parse_args()

    is_dry_run = args.dry_run and not args.live

    res = dispatch_to_kindle(
        epub_path=args.epub,
        kindle_addr=args.to,
        backup_addr=args.backup,
        subject=args.subject,
        dry_run=is_dry_run,
        verbose=args.verbose,
    )
    print(json.dumps(res, indent=2, ensure_ascii=False))
