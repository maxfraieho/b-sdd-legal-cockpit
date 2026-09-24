#!/usr/bin/env python3
"""
B-SDD LEGAL Autonomous MCP Gateway v1.0.
Dedicated Legal MCP Gateway on Node 192.168.3.234 (Raspberry Pi 4B).
Port: 8766 (isolated from general B-SDD :8765).
Supports:
  - SSE Transport (GET /sse)
  - JSON-RPC 2.0 (POST /rpc, POST /, POST /messages)
  - REST Direct API (GET /api/tools, POST /api/tools/{tool_name})
  - Health Endpoint (GET /health)
100% Pure Python Standard Library (ADR-002, Invariant L-02).
"""
import os
import sys
import json
import time
import uuid
import re
import socket
import logging
import subprocess
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
from pathlib import Path
from typing import Dict, Any, List, Optional

PORT = int(os.environ.get("LEGAL_MCP_PORT", "8766"))
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DOSSIER_DIR = PROJECT_ROOT / "dossier_benchmark" / "DOSSIER_LEGAL_UA_ED10"
TRANSCRIPTS_FILE = PROJECT_ROOT / "dossier_benchmark" / "АРХІВ_61_ЧОРНОВИХ_ТРАНСКРИПЦІЙ_ТАЙМКОДИ.md"
EVIDENCE_REGISTRY_FILE = DOSSIER_DIR / "ED10_02_Реєстр_речових_доказів_SHA256.md"
SUPERVISOR_URL = "http://127.0.0.1:8162"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [LEGAL-MCP] %(message)s"
)

# Active SSE sessions: session_id -> message queue
active_sessions: Dict[str, Any] = {}


# --- Tool Implementations ---

def tool_legal_dossier_search(query: str, chapter: str = "") -> str:
    """Searches chapters in the Ukrainian/Swiss Legal Dossier (ED10)."""
    if not DOSSIER_DIR.exists():
        return f"ERROR: Dossier directory {DOSSIER_DIR} not found."
    
    results = []
    files_to_search = []
    if chapter:
        for f in DOSSIER_DIR.glob(f"*{chapter}*.md"):
            files_to_search.append(f)
    if not files_to_search:
        files_to_search = sorted(list(DOSSIER_DIR.glob("*.md")))

    query_lower = query.lower()
    for f in files_to_search:
        try:
            content = f.read_text(encoding="utf-8")
            if query_lower in content.lower():
                matches = []
                lines = content.splitlines()
                for idx, line in enumerate(lines):
                    if query_lower in line.lower():
                        start = max(0, idx - 2)
                        end = min(len(lines), idx + 3)
                        snippet = "\n".join(lines[start:end])
                        matches.append(f"--- Line {idx+1} ---\n{snippet}")
                        if len(matches) >= 3:
                            break
                results.append(f"### File: {f.name}\n" + "\n\n".join(matches))
        except Exception as e:
            results.append(f"Error reading {f.name}: {e}")

    if not results:
        return f"No matches found for query '{query}' in dossier."
    return f"Found {len(results)} matching chapter(s):\n\n" + "\n\n".join(results[:5])


def tool_legal_transcripts_query(recording_id: str = "", keyword: str = "") -> str:
    """Queries the 61 raw voice and audio message transcripts with timecodes."""
    if not TRANSCRIPTS_FILE.exists():
        return f"ERROR: Transcripts file not found at {TRANSCRIPTS_FILE}"
    try:
        content = TRANSCRIPTS_FILE.read_text(encoding="utf-8")
        lines = content.splitlines()
        matches = []
        filter_str = (recording_id or keyword).lower()

        current_block = []
        is_matching = False

        for line in lines:
            if line.startswith("## ") or line.startswith("### "):
                if is_matching and current_block:
                    matches.append("\n".join(current_block))
                current_block = [line]
                is_matching = (filter_str in line.lower())
            else:
                current_block.append(line)
                if filter_str and filter_str in line.lower():
                    is_matching = True

        if is_matching and current_block:
            matches.append("\n".join(current_block))

        if not matches:
            return f"No transcript entries matching '{filter_str}'."
        return f"Found {len(matches)} matching transcript block(s):\n\n" + "\n\n".join(matches[:4])
    except Exception as e:
        return f"Error reading transcripts: {e}"


def tool_legal_actor_matrix_get() -> str:
    """Returns the legal procedural actor matrix with Invariant L-03 immunity protection."""
    actors_py = PROJECT_ROOT / "src" / "legal" / "actors.py"
    if not actors_py.exists():
        return "ERROR: src/legal/actors.py not found."
    try:
        content = actors_py.read_text(encoding="utf-8")
        # Extract actor summaries or return file content
        return f"### Active Actor Matrix (B-SDD Invariant L-03 & ADR-002 Compliance):\n\n```python\n{content}\n```"
    except Exception as e:
        return f"Error reading actors: {e}"


def tool_legal_evidence_get(evidence_id: str = "") -> str:
    """Queries the SHA-256 physical evidence and digital artifact registry."""
    if not EVIDENCE_REGISTRY_FILE.exists():
        return f"ERROR: Evidence registry file not found at {EVIDENCE_REGISTRY_FILE}"
    try:
        content = EVIDENCE_REGISTRY_FILE.read_text(encoding="utf-8")
        if not evidence_id:
            return content[:3000] + ("\n... [truncated]" if len(content) > 3000 else "")
        
        matches = [line for line in content.splitlines() if evidence_id.lower() in line.lower()]
        if not matches:
            return f"Evidence ID '{evidence_id}' not found in registry."
        return f"Evidence matches for '{evidence_id}':\n" + "\n".join(matches)
    except Exception as e:
        return f"Error reading evidence registry: {e}"


def tool_legal_sprint_dispatch(sprint_id: str, instruction: str, prompt: str = "") -> str:
    """Dispatches an autonomous legal sprint to the local Legal Supervisor (:8162)."""
    try:
        payload = json.dumps({
            "sprint_id": sprint_id,
            "instruction": instruction,
            "prompt": prompt,
            "source": "legal_mcp_spark"
        }).encode("utf-8")
        req = urllib.request.Request(
            f"{SUPERVISOR_URL}/dispatch",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return f"SUCCESS: Sprint dispatched. Details: {json.dumps(data, indent=2, ensure_ascii=False)}"
    except urllib.error.URLError as e:
        return f"ERROR: Could not connect to Legal Supervisor at {SUPERVISOR_URL}: {e}"
    except Exception as e:
        return f"ERROR: Failed to dispatch sprint: {e}"


def tool_legal_supervisor_status() -> str:
    """Queries the current status of the Legal Supervisor daemon."""
    try:
        req = urllib.request.Request(f"{SUPERVISOR_URL}/status")
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return json.dumps(data, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Supervisor Status: DOWN or Unreachable ({e})"


def tool_legal_epub_rebuild() -> str:
    """Recompiles the legal dossier into a standard EPUB 3.0 book."""
    script = PROJECT_ROOT / "scripts" / "generate_legal_book.py"
    if not script.exists():
        return f"ERROR: {script} does not exist."
    try:
        proc = subprocess.run(
            ["python3", str(script)],
            cwd=str(PROJECT_ROOT),
            capture_output=True,
            text=True,
            timeout=60
        )
        if proc.returncode == 0:
            epub_file = PROJECT_ROOT / "test_dossier.epub"
            size_kb = round(epub_file.stat().st_size / 1024, 1) if epub_file.exists() else 0
            return f"SUCCESS: Legal EPUB recompiled successfully. Artifact size: {size_kb} KB. Output:\n{proc.stdout}"
        else:
            return f"FAILED ({proc.returncode}):\n{proc.stderr}"
    except Exception as e:
        return f"ERROR compiling EPUB: {e}"


def tool_utopia_db_query(sql_query: str) -> str:
    """Queries Utopia DB on 192.168.3.251:9922."""
    script = PROJECT_ROOT / "scripts" / "utopia_mcp_server.py"
    if not script.exists():
        return f"ERROR: {script} not found."
    try:
        cmd = [
            "sshpass", "-p", "podroid",
            "ssh", "-p", "9922",
            "-o", "StrictHostKeyChecking=no",
            "-o", "ConnectTimeout=5",
            "root@192.168.3.251",
            "docker exec -i utopia-db psql -U utopia -d utopia"
        ]
        p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = p.communicate(input=sql_query + "\n", timeout=12)
        if p.returncode != 0:
            return f"ERROR ({p.returncode}): {stderr.strip()}"
        return stdout.strip()
    except Exception as e:
        return f"Utopia DB query error: {e}"


# --- Tool Registry ---
TOOLS_REGISTRY = {
    "legal_dossier_search": {
        "description": "Searches chapters in the Ukrainian/Swiss Legal Criminal Dossier (ED10 chapters 1 to 18).",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Text query, law article (e.g. Art. 146 CP), or actor name."},
                "chapter": {"type": "string", "description": "Optional chapter filter (e.g. '01', '03', '12')."}
            },
            "required": ["query"]
        },
        "handler": tool_legal_dossier_search
    },
    "legal_transcripts_query": {
        "description": "Queries the 61 audio and phone message transcripts with exact timecodes and evidentiary tags.",
        "parameters": {
            "type": "object",
            "properties": {
                "recording_id": {"type": "string", "description": "ID of the recording or timecode."},
                "keyword": {"type": "string", "description": "Keyword search across conversation text."}
            }
        },
        "handler": tool_legal_transcripts_query
    },
    "legal_actor_matrix_get": {
        "description": "Returns all actors and formal procedural roles under Swiss CPP with Jean-Paul Vernon bona fide shield.",
        "parameters": {"type": "object", "properties": {}},
        "handler": lambda: tool_legal_actor_matrix_get()
    },
    "legal_evidence_get": {
        "description": "Retrieves physical and digital evidence records with SHA-256 hashes.",
        "parameters": {
            "type": "object",
            "properties": {
                "evidence_id": {"type": "string", "description": "Specific evidence ID (e.g. 'REC-001', 'DOC-012') or keyword."}
            }
        },
        "handler": tool_legal_evidence_get
    },
    "legal_sprint_dispatch": {
        "description": "Dispatches an autonomous legal task/sprint for agy execution on Node .234.",
        "parameters": {
            "type": "object",
            "properties": {
                "sprint_id": {"type": "string", "description": "Identifier for the sprint (e.g. 'sprint_003_legal')."},
                "instruction": {"type": "string", "description": "Instruction for the sprint."},
                "prompt": {"type": "string", "description": "Detailed prompt or context requirements."}
            },
            "required": ["sprint_id", "instruction"]
        },
        "handler": tool_legal_sprint_dispatch
    },
    "legal_supervisor_status": {
        "description": "Checks the operational status and active tasks of the Legal Supervisor daemon.",
        "parameters": {"type": "object", "properties": {}},
        "handler": lambda: tool_legal_supervisor_status()
    },
    "legal_epub_rebuild": {
        "description": "Rebuilds test_dossier.epub containing full verified legal chapters.",
        "parameters": {"type": "object", "properties": {}},
        "handler": lambda: tool_legal_epub_rebuild()
    },
    "utopia_db_query": {
        "description": "Executes SQL query against the Utopia Bitemporal DB on host 192.168.3.251.",
        "parameters": {
            "type": "object",
            "properties": {
                "sql_query": {"type": "string", "description": "SQL statement (SELECT only recommended)."}
            },
            "required": ["sql_query"]
        },
        "handler": tool_utopia_db_query
    }
}


def handle_jsonrpc(req_data: Dict[str, Any]) -> Dict[str, Any]:
    """Processes JSON-RPC 2.0 requests for MCP protocol."""
    method = req_data.get("method")
    req_id = req_data.get("id")
    params = req_data.get("params", {})

    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {"listChanged": False}
                },
                "serverInfo": {
                    "name": "b-sdd-legal-mcp",
                    "version": "1.0.0",
                    "node": "192.168.3.234"
                }
            }
        }
    elif method == "tools/list":
        tools_list = []
        for name, spec in TOOLS_REGISTRY.items():
            tools_list.append({
                "name": name,
                "description": spec["description"],
                "inputSchema": spec["parameters"]
            })
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {"tools": tools_list}
        }
    elif method == "tools/call":
        tool_name = params.get("name")
        tool_args = params.get("arguments", {})
        if tool_name not in TOOLS_REGISTRY:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {"code": -32601, "message": f"Tool '{tool_name}' not found"}
            }
        
        handler = TOOLS_REGISTRY[tool_name]["handler"]
        try:
            if callable(handler):
                # Call with args if function takes params, or zero args
                if tool_args:
                    output = handler(**tool_args)
                else:
                    output = handler()
            else:
                output = str(handler)
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [{"type": "text", "text": str(output)}]
                }
            }
        except Exception as e:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [{"type": "text", "text": f"Tool Execution Error: {e}"}],
                    "isError": True
                }
            }
    elif method == "notifications/initialized":
        return {"jsonrpc": "2.0", "id": req_id, "result": {}}
    else:
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "error": {"code": -32601, "message": f"Method '{method}' not implemented"}
        }


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


class LegalMCPHandler(BaseHTTPRequestHandler):
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
                "service": "b-sdd-legal-mcp",
                "node": "192.168.3.234",
                "tailscale": "100.80.16.33",
                "port": PORT,
                "tools_count": len(TOOLS_REGISTRY)
            })
        elif self.path == "/api/tools":
            tools_list = [{"name": k, "description": v["description"], "parameters": v["parameters"]} for k, v in TOOLS_REGISTRY.items()]
            self._send_json(200, {"tools": tools_list})
        elif self.path == "/sse":
            session_id = str(uuid.uuid4())
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            # MCP SSE initiation event
            endpoint_msg = f"event: endpoint\ndata: /messages?session_id={session_id}\n\n"
            self.wfile.write(endpoint_msg.encode("utf-8"))
            self.wfile.flush()

            # Keep alive loop
            try:
                while True:
                    time.sleep(15)
                    self.wfile.write(b": keepalive\n\n")
                    self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError):
                pass
        else:
            self._send_json(404, {"error": "Not Found"})

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_length)

        if self.path.startswith("/messages") or self.path in ("/rpc", "/"):
            try:
                req_data = json.loads(raw_body.decode("utf-8"))
                resp_data = handle_jsonrpc(req_data)
                self._send_json(200, resp_data)
            except Exception as e:
                self._send_json(400, {"jsonrpc": "2.0", "error": {"code": -32700, "message": f"Parse error: {e}"}})
        elif self.path.startswith("/api/tools/"):
            tool_name = self.path.replace("/api/tools/", "").strip()
            if tool_name not in TOOLS_REGISTRY:
                self._send_json(404, {"error": f"Tool '{tool_name}' not found"})
                return
            try:
                args = json.loads(raw_body.decode("utf-8")) if raw_body else {}
                handler = TOOLS_REGISTRY[tool_name]["handler"]
                res = handler(**args) if args else handler()
                self._send_json(200, {"result": res})
            except Exception as e:
                self._send_json(500, {"error": str(e)})
        else:
            self._send_json(404, {"error": "Endpoint not found"})


def run_server():
    server_address = ("0.0.0.0", PORT)
    httpd = ThreadedHTTPServer(server_address, LegalMCPHandler)
    logging.info(f"Legal MCP Gateway listening on 0.0.0.0:{PORT} (Node: 192.168.3.234 / 100.80.16.33)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logging.info("Shutting down MCP Gateway.")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
