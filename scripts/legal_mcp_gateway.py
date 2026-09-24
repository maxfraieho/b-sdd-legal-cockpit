#!/usr/bin/env python3
"""
B-SDD Legal Sovereign Remote MCP Gateway (HTTP/SSE & JSON-RPC 2.0).
Pure Python Standard Library (0 pip dependencies).

Provides a publicly accessible Model Context Protocol (MCP) server for
Google AI Studio, Gemini Spark, NotebookLM, and AI Agents to query
Utopia DB (:251), Swiss Criminal Case CASE-SAMPLE-2026-CH facts, evidence,
bitemporal timelines, and legal invariants.
"""

import json
import os
import queue
import sys
import threading
import time
import urllib.parse
import uuid
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from typing import Any, Dict, List, Optional

# Ensure repository root is on sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from src.legal.utopia_client import run_psql
from src.legal.claim_chart import SwissClaimChartManager
from src.legal.actors import create_swiss_benchmark_matrix
from src.legal.timeline_calibrator import create_swiss_benchmark_timeline
from src.legal.preflight_compiler import LegalPreflightCompiler

GATEWAY_PORT = int(os.environ.get("LEGAL_MCP_PORT", "8770"))
GATEWAY_HOST = os.environ.get("LEGAL_MCP_HOST", "0.0.0.0")

# Session registry for Server-Sent Events (SSE)
# session_id -> queue.Queue of SSE messages
SSE_SESSIONS: Dict[str, queue.Queue] = {}
SSE_LOCK = threading.Lock()

# ==============================================================================
# TOOL DEFINITIONS & SCHEMAS (MCP Protocol 2024-11-05)
# ==============================================================================

TOOLS_CATALOG: List[Dict[str, Any]] = [
    {
        "name": "utopia_status",
        "description": "Check connection status and PostgreSQL version of Utopia DB on 192.168.3.251:9922 (Case CASE-SAMPLE-2026-CH).",
        "inputSchema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "utopia_query",
        "description": "Execute a SQL query against Utopia DB bitemporal knowledge base.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "SQL query to execute."
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "utopia_list_contradictions",
        "description": "Retrieve active forensic bitemporal contradictions from vaud_forensic_bitemporal_contradictions table.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "limit": {
                    "type": "integer",
                    "description": "Max rows to return (default 20)."
                }
            },
            "required": []
        }
    },
    {
        "name": "legal_get_charges",
        "description": "Retrieve all 6 qualified criminal charges under Swiss Criminal Code (CP) and LEI with statutory elements and ATF 146 IV 9 jurisprudence.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "charge_code": {
                    "type": "string",
                    "description": "Optional filter by charge code, e.g. 'Art. 180' or 'Art. 138'."
                }
            },
            "required": []
        }
    },
    {
        "name": "legal_get_actors",
        "description": "Retrieve all 6 qualified actors in Vaud criminal proceeding CASE-SAMPLE-2026-CH, including Invariant L-03 absolute immunity for Jean-Paul Vernon.",
        "inputSchema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "legal_get_timeline",
        "description": "Retrieve calibrated bitemporal timeline facts (Tv reality vs Tt recording) and detected contradiction conflicts.",
        "inputSchema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "legal_get_evidence_index",
        "description": "Retrieve calibrated evidence index, SHA-256 fingerprints, and procedural admissibility under ATF 146 IV 9.",
        "inputSchema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "legal_verify_invariants",
        "description": "Execute pre-flight audit of all B-SDD architectural invariants (L-01 WORM, L-02 Stdlib, L-03 Jean-Paul Vernon Shield, L-04 Child Protection Art. 122 CPP, L-05 Cryptographic Integrity).",
        "inputSchema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    }
]

# ==============================================================================
# TOOL DISPATCHER LOGIC
# ==============================================================================

def execute_tool(tool_name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    try:
        if tool_name == "utopia_status":
            out = run_psql("SELECT version(), current_database(), now();")
            return {
                "content": [{"type": "text", "text": f"UTOPIA DB STATUS (192.168.3.251:9922):\n{out}"}],
                "isError": "ERROR" in out
            }

        elif tool_name == "utopia_query":
            query = args.get("query", "")
            if not query.strip():
                return {"content": [{"type": "text", "text": "Error: query parameter is empty."}], "isError": True}
            out = run_psql(query)
            return {
                "content": [{"type": "text", "text": out}],
                "isError": "ERROR" in out
            }

        elif tool_name == "utopia_list_contradictions":
            limit = int(args.get("limit", 20))
            out = run_psql(f"SELECT * FROM vaud_forensic_bitemporal_contradictions LIMIT {limit};")
            return {
                "content": [{"type": "text", "text": out}],
                "isError": "ERROR" in out
            }

        elif tool_name == "legal_get_charges":
            manager = SwissClaimChartManager()
            charges = manager.list_charges()
            filter_code = args.get("charge_code", "").strip().lower()
            if filter_code and filter_code != "all":
                charges = [c for c in charges if filter_code in str(c.get("statute_code", "")).lower() or filter_code in str(c.get("statute_title_fr", "")).lower()]
            return {
                "content": [{"type": "text", "text": json.dumps({"case": "CASE-SAMPLE-2026-CH", "charges_count": len(charges), "charges": charges}, ensure_ascii=False, indent=2)}],
                "isError": False
            }

        elif tool_name == "legal_get_actors":
            matrix = create_swiss_benchmark_matrix()
            actors = matrix.list_actors()
            return {
                "content": [{"type": "text", "text": json.dumps({"case": "CASE-SAMPLE-2026-CH", "actors_count": len(actors), "actors": actors}, ensure_ascii=False, indent=2)}],
                "isError": False
            }

        elif tool_name == "legal_get_timeline":
            timeline = create_swiss_benchmark_timeline()
            facts = timeline.list_facts()
            conflicts = timeline.detect_conflicts()
            return {
                "content": [{"type": "text", "text": json.dumps({"case": "CASE-SAMPLE-2026-CH", "facts_count": len(facts), "facts": [f.to_dict() for f in facts], "conflicts": conflicts}, ensure_ascii=False, indent=2)}],
                "isError": False
            }

        elif tool_name == "legal_get_evidence_index":
            timeline = create_swiss_benchmark_timeline()
            facts = timeline.list_facts()
            evidence_links = []
            for f in facts:
                for h in f.source_evidence_hashes:
                    evidence_links.append({
                        "fact_id": f.fact_id,
                        "label": f.label,
                        "t_v": f.t_v,
                        "sha256": h,
                        "admissibility": "ATF 146 IV 9 al. 2 (Admissible)"
                    })
            return {
                "content": [{"type": "text", "text": json.dumps({"case": "CASE-SAMPLE-2026-CH", "evidence_links": evidence_links}, ensure_ascii=False, indent=2)}],
                "isError": False
            }

        elif tool_name == "legal_verify_invariants":
            compiler = LegalPreflightCompiler()
            snapshot = compiler.compile(use_live_db=False)
            return {
                "content": [{"type": "text", "text": json.dumps(snapshot.to_dict(), ensure_ascii=False, indent=2)}],
                "isError": False
            }

        else:
            return {
                "content": [{"type": "text", "text": f"Tool '{tool_name}' not recognized."}],
                "isError": True
            }
    except Exception as e:
        return {
            "content": [{"type": "text", "text": f"Tool execution failed: {str(e)}"}],
            "isError": True
        }


# ==============================================================================
# JSON-RPC 2.0 PROTOCOL PROCESSOR
# ==============================================================================

def process_jsonrpc(req: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    req_id = req.get("id")
    method = req.get("method")
    params = req.get("params", {})

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
                    "version": "2.4.0",
                    "title": "B-SDD Legal Sovereign MCP Gateway · Canton de Vaud"
                }
            }
        }

    elif method == "notifications/initialized":
        return None

    elif method == "ping":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {}
        }

    elif method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "tools": TOOLS_CATALOG
            }
        }

    elif method == "tools/call":
        tool_name = params.get("name", "")
        tool_args = params.get("arguments", {})
        res = execute_tool(tool_name, tool_args)
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": res
        }

    else:
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "error": {
                "code": -32601,
                "message": f"Method '{method}' not implemented."
            }
        }


# ==============================================================================
# HTTP & SSE SERVER HANDLER
# ==============================================================================

class LegalMCPRequestHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _set_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Expose-Headers", "*")

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # 1. Health / Root metadata
        if path in ("/", ""):
            meta = {
                "service": "b-sdd-legal-mcp-gateway",
                "protocol": "mcp",
                "version": "2.4.0",
                "jurisdiction": "Ministère public du canton de Vaud",
                "case_ref": "CASE-SAMPLE-2026-CH",
                "status": "online",
                "endpoints": {
                    "sse": "/sse",
                    "messages": "/messages",
                    "direct_mcp": "/mcp",
                    "tools": "/tools"
                },
                "tools_count": len(TOOLS_CATALOG)
            }
            body = json.dumps(meta, indent=2).encode("utf-8")
            self.send_response(200)
            self._set_cors()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        # 2. Tools catalog in JSON / OpenAPI schema format
        elif path == "/tools":
            body = json.dumps({"tools": TOOLS_CATALOG}, indent=2).encode("utf-8")
            self.send_response(200)
            self._set_cors()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        # 3. Server-Sent Events (SSE) Stream
        elif path == "/sse":
            session_id = str(uuid.uuid4())
            msg_queue = queue.Queue()

            with SSE_LOCK:
                SSE_SESSIONS[session_id] = msg_queue

            self.send_response(200)
            self._set_cors()
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.send_header("X-Accel-Buffering", "no")
            self.end_headers()

            # Announce endpoint event to client (standard MCP SSE pattern)
            endpoint_event = f"event: endpoint\ndata: /messages?session_id={session_id}\n\n"
            try:
                self.wfile.write(endpoint_event.encode("utf-8"))
                self.wfile.flush()
            except Exception as e:
                with SSE_LOCK:
                    SSE_SESSIONS.pop(session_id, None)
                return

            print(f"[SSE] Client connected. Session ID: {session_id}", file=sys.stderr)

            # Stream loop
            try:
                while True:
                    try:
                        msg = msg_queue.get(timeout=15.0)
                        event_payload = f"event: message\ndata: {json.dumps(msg)}\n\n"
                        self.wfile.write(event_payload.encode("utf-8"))
                        self.wfile.flush()
                    except queue.Empty:
                        # Keep-alive ping
                        try:
                            self.wfile.write(b": ping\n\n")
                            self.wfile.flush()
                        except Exception:
                            break
            except (ConnectionResetError, BrokenPipeError):
                pass
            finally:
                with SSE_LOCK:
                    SSE_SESSIONS.pop(session_id, None)
                print(f"[SSE] Client disconnected. Session ID: {session_id}", file=sys.stderr)
            return

        else:
            self.send_response(404)
            self._set_cors()
            self.end_headers()
            self.wfile.write(b'{"error": "Endpoint not found"}')

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(length)

        try:
            req_data = json.loads(body_bytes.decode("utf-8"))
        except Exception:
            self.send_response(400)
            self._set_cors()
            self.end_headers()
            self.wfile.write(b'{"error": "Invalid JSON"}')
            return

        # Handle POST /messages?session_id=... (SSE reply routing)
        if path == "/messages":
            query_params = urllib.parse.parse_qs(parsed.query)
            session_id = query_params.get("session_id", [None])[0]

            res_data = process_jsonrpc(req_data)

            if session_id and res_data:
                with SSE_LOCK:
                    target_q = SSE_SESSIONS.get(session_id)
                if target_q:
                    target_q.put(res_data)

            # Acknowledge HTTP 202 Accepted
            self.send_response(202)
            self._set_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status": "accepted"}')
            return

        # Handle POST /mcp (Direct HTTP JSON-RPC 2.0 without SSE)
        elif path == "/mcp":
            res_data = process_jsonrpc(req_data)
            res_bytes = json.dumps(res_data or {}).encode("utf-8")
            self.send_response(200)
            self._set_cors()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(res_bytes)))
            self.end_headers()
            self.wfile.write(res_bytes)
            return

        else:
            self.send_response(404)
            self._set_cors()
            self.end_headers()
            self.wfile.write(b'{"error": "Endpoint not found"}')

    def log_message(self, format, *args):
        # Concise logging
        sys.stderr.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {self.address_string()} - {format % args}\n")


def run_server():
    server = HTTPServer((GATEWAY_HOST, GATEWAY_PORT), LegalMCPRequestHandler)
    print(f"==================================================================", file=sys.stderr)
    print(f" B-SDD Legal Sovereign MCP Gateway running on http://{GATEWAY_HOST}:{GATEWAY_PORT}", file=sys.stderr)
    print(f" SSE Endpoint:       http://{GATEWAY_HOST}:{GATEWAY_PORT}/sse", file=sys.stderr)
    print(f" Direct MCP POST:    http://{GATEWAY_HOST}:{GATEWAY_PORT}/mcp", file=sys.stderr)
    print(f" Tools Catalog:      http://{GATEWAY_HOST}:{GATEWAY_PORT}/tools", file=sys.stderr)
    print(f" Active Tools:       {len(TOOLS_CATALOG)} tools registered", file=sys.stderr)
    print(f"==================================================================", file=sys.stderr)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    run_server()
