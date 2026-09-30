#!/usr/bin/env python3
"""
Integration Test for Remote Sovereign Legal MCP Gateway over SSE.
Validates MCP protocol over SSE with token authentication (T2: Sovereign Gateway Hardening).
"""
import json
import os
import sys
import threading
import time
import urllib.request
import urllib.error
import unittest

# Read gateway URL and token strictly from environment variables (T2 compliance)
SSE_URL = os.environ.get("LEGAL_MCP_URL", "").strip()
BEARER_TOKEN = os.environ.get("LEGAL_MCP_TOKEN", "").strip()


class TestRemoteLegalMCPGateway(unittest.TestCase):
    def setUp(self):
        if not SSE_URL:
            self.skipTest("LEGAL_MCP_URL not set in environment (skipped for sovereign isolation)")

    def test_unauthenticated_request_rejected(self):
        """Verifies that an unauthenticated request receives 401 Unauthorized (T2)."""
        req = urllib.request.Request(
            SSE_URL,
            headers={
                "Accept": "text/event-stream",
                "User-Agent": "Mozilla/5.0 (Security-Guard-Test)"
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                self.assertNotEqual(resp.status, 200, "Unauthenticated access must be rejected")
        except urllib.error.HTTPError as e:
            self.assertIn(e.code, (401, 403), f"Expected 401 or 403, got {e.code}")

    def test_sse_and_jsonrpc_handshake(self):
        """Validates authenticated MCP handshake over SSE when token is configured."""
        if not BEARER_TOKEN:
            self.skipTest("LEGAL_MCP_TOKEN not set; skipping authenticated handshake test")

        req = urllib.request.Request(
            SSE_URL,
            headers={
                "Accept": "text/event-stream",
                "Authorization": f"Bearer {BEARER_TOKEN}",
                "User-Agent": "Mozilla/5.0 (Gemini-Spark-Test)"
            }
        )
        try:
            resp = urllib.request.urlopen(req, timeout=10)
        except urllib.error.HTTPError as e:
            self.fail(f"Authenticated connection failed with HTTP {e.code}: {e.reason}")

        self.assertEqual(resp.status, 200)

        endpoint_url = None
        sse_messages = []
        stop_event = threading.Event()

        def reader():
            nonlocal endpoint_url
            current_event = None
            while not stop_event.is_set():
                try:
                    line = resp.readline().decode("utf-8")
                    if not line:
                        break
                    line = line.strip()
                    if not line:
                        continue
                    if line.startswith("event:"):
                        current_event = line[len("event:"):].strip()
                    elif line.startswith("data:"):
                        data_val = line[len("data:"):].strip()
                        if current_event == "endpoint":
                            endpoint_url = data_val
                        elif current_event == "message":
                            sse_messages.append(json.loads(data_val))
                except Exception:
                    break

        t = threading.Thread(target=reader, daemon=True)
        t.start()

        # Wait for endpoint
        for _ in range(50):
            if endpoint_url:
                break
            time.sleep(0.1)

        self.assertIsNotNone(endpoint_url, "Did not receive 'endpoint' event from SSE stream")

        # Resolve relative endpoint URL if necessary
        if endpoint_url.startswith("/"):
            from urllib.parse import urljoin
            endpoint_url = urljoin(SSE_URL, endpoint_url)

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {BEARER_TOKEN}",
            "User-Agent": "Mozilla/5.0 (Gemini-Spark-Test)"
        }

        # 1. Initialize
        mcp_proto_version = f"{2024}-11-05"
        init_payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {"protocolVersion": mcp_proto_version, "capabilities": {}, "clientInfo": {"name": "test"}}
        }
        init_req = urllib.request.Request(endpoint_url, data=json.dumps(init_payload).encode("utf-8"), headers=headers)
        with urllib.request.urlopen(init_req, timeout=10) as r:
            self.assertIn(r.status, (200, 202))

        init_msg = None
        for _ in range(50):
            for m in sse_messages:
                if m.get("id") == 1:
                    init_msg = m
                    break
            if init_msg:
                break
            time.sleep(0.1)

        if init_msg:
            self.assertEqual(init_msg.get("result", {}).get("protocolVersion"), mcp_proto_version)

        stop_event.set()


if __name__ == "__main__":
    unittest.main()
