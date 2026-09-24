#!/usr/bin/env python3
"""
Utopia DB Bitemporal MCP Server (Stdio JSON-RPC 2.0).
Pure Python Standard Library.
Provides direct access to Utopia DB (192.168.3.251:9922) for legal co-pilot and bitemporal analysis.
"""
import json
import os
import subprocess
import sys
from typing import Any, Dict, List

from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.legal.utopia_client import run_psql


def handle_initialize(req_id: Any) -> Dict[str, Any]:
    return {
        "jsonrpc": "2.0",
        "id": req_id,
        "result": {
            "protocolVersion": "2024-11-05",
            "capabilities": {"tools": {}},
            "serverInfo": {"name": "utopia-db", "version": "1.0.0"}
        }
    }


def handle_tools_list(req_id: Any) -> Dict[str, Any]:
    return {
        "jsonrpc": "2.0",
        "id": req_id,
        "result": {
            "tools": [
                {
                    "name": "utopia_status",
                    "description": "Check connection status and PostgreSQL version of Utopia DB on 192.168.3.251:9922.",
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
                }
            ]
        }
    }


def handle_tools_call(req_id: Any, params: Dict[str, Any]) -> Dict[str, Any]:
    tool_name = params.get("name")
    args = params.get("arguments", {})

    if tool_name == "utopia_status":
        out = run_psql("SELECT version(), current_database(), now();")
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "content": [{"type": "text", "text": f"UTOPIA DB STATUS:\n{out}"}],
                "isError": "ERROR" in out
            }
        }

    elif tool_name == "utopia_query":
        query = args.get("query", "")
        out = run_psql(query)
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "content": [{"type": "text", "text": out}],
                "isError": "ERROR" in out
            }
        }

    elif tool_name == "utopia_list_contradictions":
        limit = args.get("limit", 20)
        out = run_psql(f"SELECT * FROM vaud_forensic_bitemporal_contradictions LIMIT {limit};")
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "content": [{"type": "text", "text": out}],
                "isError": "ERROR" in out
            }
        }

    return {
        "jsonrpc": "2.0",
        "id": req_id,
        "error": {"code": -32601, "message": f"Tool '{tool_name}' not found."}
    }


def main():
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            req_id = req.get("id")
            method = req.get("method")

            if method == "initialize":
                res = handle_initialize(req_id)
            elif method == "notifications/initialized":
                continue
            elif method == "tools/list":
                res = handle_tools_list(req_id)
            elif method == "tools/call":
                res = handle_tools_call(req_id, req.get("params", {}))
            else:
                res = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {"code": -32601, "message": f"Method '{method}' not found."}
                }

            sys.stdout.write(json.dumps(res) + "\n")
            sys.stdout.flush()
        except Exception as e:
            err_res = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {"code": -32603, "message": f"Internal error: {str(e)}"}
            }
            sys.stdout.write(json.dumps(err_res) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
