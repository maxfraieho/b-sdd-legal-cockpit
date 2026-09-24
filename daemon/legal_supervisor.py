#!/usr/bin/env python3
"""
B-SDD LEGAL Autonomous Supervisor Daemon v1.0.
Dedicated Legal Execution & Telemetry Node: 192.168.3.234 (Raspberry Pi 4B).
Port: 8162 (isolated from general B-SDD :8161).
100% Pure Python Standard Library (ADR-002).

Coordinates legal sprints, runs test gates, notifies Telegram bot (@bsdd_legal_cockpit_bot),
reports telemetry to n8n webhook, and synchronizes legal dossier with NotebookLM.
"""
import os
import sys
import json
import time
import socket
import logging
import threading
import subprocess
import urllib.request
import urllib.parse
import urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from typing import Dict, Any, Optional

# --- Configuration ---
PORT = int(os.environ.get("LEGAL_SUPERVISOR_PORT", "8162"))
PROJECT_ROOT = Path(__file__).resolve().parent.parent
NOTEBOOK_ID = "6813ab1c-ac22-4c3c-9c8e-9dd67e35da99"
N8N_RESULT_WEBHOOK = "https://n8n.exodus.pp.ua/webhook/bsdd-legal-result"
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "8942331406:AAHZ-MhlOfO3vWWiR3y9sQrSUQbP7U-ar28")
CHAT_ID_FILE = PROJECT_ROOT / "daemon" / ".chat_id"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [LEGAL-SUPERVISOR] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(PROJECT_ROOT / "logs" / "legal_supervisor.log", encoding="utf-8")
    ]
)

# Mutex & State
execution_lock = threading.Lock()
current_state = {
    "status": "IDLE",
    "current_sprint": None,
    "last_sprint": None,
    "last_result": None,
    "last_completed_at": None,
    "node_ip": "192.168.3.234",
    "tailscale_ip": "100.80.16.33"
}


def get_telegram_chat_id() -> Optional[str]:
    """Reads cached chat_id or queries getUpdates dynamically."""
    if CHAT_ID_FILE.exists():
        try:
            cid = CHAT_ID_FILE.read_text(encoding="utf-8").strip()
            if cid:
                return cid
        except Exception:
            pass

    # Try resolving via getUpdates
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates"
        req = urllib.request.Request(url, headers={"User-Agent": "BSDDLegalSupervisor/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("ok") and data.get("result"):
                last_msg = data["result"][-1]
                chat = last_msg.get("message", {}).get("chat", {})
                cid = str(chat.get("id"))
                if cid:
                    CHAT_ID_FILE.write_text(cid, encoding="utf-8")
                    logging.info(f"Discovered and cached Telegram chat_id: {cid}")
                    return cid
    except Exception as e:
        logging.warning(f"Failed to auto-resolve Telegram chat_id: {e}")
    return None


def send_telegram_alert(text: str) -> bool:
    """Dispatches a message to @bsdd_legal_cockpit_bot."""
    chat_id = get_telegram_chat_id()
    if not chat_id:
        logging.warning("Telegram alert skipped: chat_id not yet discovered (user needs to press /start).")
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
            headers={"Content-Type": "application/json", "User-Agent": "BSDDLegalSupervisor/1.0"}
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            return resp.status == 200
    except Exception as e:
        logging.error(f"Telegram dispatch error: {e}")
        return False


def run_sprint_task(sprint_id: str, instruction: str, prompt: str, source: str):
    """Executes the legal sprint asynchronously inside execution_lock."""
    global current_state
    with execution_lock:
        current_state["status"] = "RUNNING"
        current_state["current_sprint"] = sprint_id
        start_time = time.time()
        logging.info(f"Initiating Sprint {sprint_id} (Source: {source}) | Instruction: {instruction}")

        send_telegram_alert(
            f"⚖️ <b>[B-SDD-LEGAL] Новий юридичний спринт запущено</b>\n"
            f"📌 <b>Спринт:</b> <code>{sprint_id}</code>\n"
            f"🎯 <b>Задача:</b> {instruction}\n"
            f"📡 <b>Джерело:</b> {source}\n"
            f"🖥 <b>Вузол:</b> 192.168.3.234 (:8162)"
        )

        script_path = PROJECT_ROOT / "scripts" / "run_legal_sprint.sh"
        cmd = ["bash", str(script_path), sprint_id, instruction]

        try:
            proc = subprocess.run(
                cmd,
                cwd=str(PROJECT_ROOT),
                capture_output=True,
                text=True,
                timeout=300
            )
            success = (proc.returncode == 0)
            elapsed = round(time.time() - start_time, 2)
            stdout = proc.stdout
            stderr = proc.stderr
        except subprocess.TimeoutExpired:
            success = False
            elapsed = 300.0
            stdout = ""
            stderr = "TIMEOUT_EXPIRED_AFTER_300S"
        except Exception as e:
            success = False
            elapsed = round(time.time() - start_time, 2)
            stdout = ""
            stderr = str(e)

        result_status = "SUCCESS" if success else "FAILED"
        current_state["status"] = "IDLE"
        current_state["last_sprint"] = sprint_id
        current_state["current_sprint"] = None
        current_state["last_completed_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        current_state["last_result"] = {
            "status": result_status,
            "elapsed_seconds": elapsed,
            "instruction": instruction,
            "source": source
        }

        # Telegram notification
        status_icon = "✅" if success else "❌"
        send_telegram_alert(
            f"{status_icon} <b>[B-SDD-LEGAL] Спринт завершено: {result_status}</b>\n"
            f"📌 <b>Спринт:</b> <code>{sprint_id}</code>\n"
            f"⏱ <b>Тривалість:</b> {elapsed}s\n"
            f"📑 <b>Результат тестів:</b> {'Всі інваріанти L-01..L-05 пройдено' if success else 'Помилка виконання'}"
        )

        # Telemetry to n8n webhook
        try:
            telemetry_payload = json.dumps({
                "project_tag": "[PROJECT: B-SDD-LEGAL]",
                "host": "192.168.3.234",
                "sprint_id": sprint_id,
                "instruction": instruction,
                "status": result_status,
                "elapsed": elapsed,
                "timestamp": current_state["last_completed_at"],
                "source": source,
                "notebook_id": NOTEBOOK_ID
            }).encode("utf-8")
            req = urllib.request.Request(
                N8N_RESULT_WEBHOOK,
                data=telemetry_payload,
                headers={"Content-Type": "application/json", "User-Agent": "BSDDLegalSupervisor/1.0"}
            )
            urllib.request.urlopen(req, timeout=5)
        except Exception as e:
            logging.warning(f"Failed to post to n8n webhook: {e}")

        logging.info(f"Sprint {sprint_id} finalized with status {result_status} in {elapsed}s")


class LegalSupervisorHandler(BaseHTTPRequestHandler):
    def _send_json(self, status_code: int, data: Dict[str, Any]):
        body = json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def do_GET(self):
        if self.path in ("/health", "/"):
            self._send_json(200, {
                "status": "UP",
                "service": "bsdd-legal-supervisor",
                "node": "192.168.3.234",
                "tailscale": "100.80.16.33",
                "port": PORT,
                "active_state": current_state["status"]
            })
        elif self.path == "/status":
            self._send_json(200, current_state)
        else:
            self._send_json(404, {"error": "Not Found"})

    def do_POST(self):
        if self.path == "/dispatch":
            content_length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(content_length)
            try:
                payload = json.loads(raw_body.decode("utf-8")) if raw_body else {}
            except Exception:
                payload = {}

            sprint_id = payload.get("sprint_id") or f"sprint_{int(time.time())}_legal"
            instruction = payload.get("instruction") or "LEGAL_VERIFICATION_PASS"
            prompt = payload.get("prompt") or ""
            source = payload.get("source") or "api_dispatch"

            if execution_lock.locked():
                self._send_json(429, {
                    "error": "LOCKED",
                    "message": "Another legal sprint is currently running.",
                    "running_sprint": current_state.get("current_sprint")
                })
                return

            # Launch background thread
            t = threading.Thread(
                target=run_sprint_task,
                args=(sprint_id, instruction, prompt, source),
                daemon=True
            )
            t.start()

            self._send_json(202, {
                "status": "ACCEPTED",
                "message": f"Legal Sprint {sprint_id} scheduled for execution.",
                "sprint_id": sprint_id,
                "node": "192.168.3.234:8162"
            })
        else:
            self._send_json(404, {"error": "Endpoint not found"})


def run_server():
    server_address = ("0.0.0.0", PORT)
    httpd = HTTPServer(server_address, LegalSupervisorHandler)
    logging.info(f"Legal Supervisor listening on 0.0.0.0:{PORT} (Node: 192.168.3.234 / 100.80.16.33)")
    get_telegram_chat_id()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logging.info("Shutting down supervisor.")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
