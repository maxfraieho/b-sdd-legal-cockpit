"""
Tests for B-SDD Legal HTTP Backend Daemon (tests/legal/test_server.py).
Validates:
  - Invariant L-01: WORM Bitemporal Ledger supersession logging.
  - Invariant L-02: Pure Python standard library implementation.
  - Invariant L-03: Bona Fide Shield for Adriano MILLI.
  - Invariant L-04: Adult Victim Protection for Arsen KOVALENKO (no Art. 219 CP).
  - Invariant L-05: 64-char SHA-256 cryptographic seal.
"""

from http.server import HTTPServer
import json
import threading
import time
import unittest
from urllib.request import Request, urlopen
from urllib.error import HTTPError

from src.legal.server import LegalApiHandler, run_server


class TestLegalServer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server_port = 8799
        cls.server = HTTPServer(("127.0.0.1", cls.server_port), LegalApiHandler)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.1)
        cls.base_url = f"http://127.0.0.1:{cls.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def test_health_check(self):
        req = Request(f"{self.base_url}/api/v1/health")
        with urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data["status"], "HEALTHY")
            self.assertIn("invariants", data)

    def test_fact_calibrate_success_l01_and_l05(self):
        payload = {
            "entity_id": "EPISODE-2024-07-17",
            "actor_id": "ACT-LIUBOV-SUVOROVA",
            "original_tv": "17.07.2024",
            "new_tv": "17.07.2024 16:30",
            "user_annotation": "Rectification chronologique établie par constat d'huissier et métadonnées.",
            "affected_articles": ["Art. 123 CP", "Art. 180 CP"],
            "calibrated_by": "Me Volod & Partners",
        }
        req = Request(
            f"{self.base_url}/api/v1/facts/calibrate",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data["status"], "SUCCESS")
            self.assertIn("tx_id", data)
            self.assertIn("worm_seal", data)
            # Invariant L-05: 64-char SHA-256 seal
            self.assertEqual(len(data["worm_seal"]), 64)

    def test_invariant_l03_adriano_milli_shield(self):
        payload = {
            "entity_id": "EPISODE-ADRIANO-PURCHASE",
            "actor_id": "ACT-ADRIANO-MILLI",
            "original_tv": "01.08.2024",
            "user_annotation": "Tentative non autorisée d'imputation pénale.",
            "affected_articles": ["Art. 138 CP"],
        }
        req = Request(
            f"{self.base_url}/api/v1/facts/calibrate",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with self.assertRaises(HTTPError) as ctx:
            urlopen(req)
        self.assertEqual(ctx.exception.code, 403)
        body = json.loads(ctx.exception.read().decode("utf-8"))
        self.assertEqual(body["error"], "INVARIANT_L03_VIOLATION")

    def test_invariant_l04_arsen_kovalenko_adult_victim_protection(self):
        payload = {
            "entity_id": "EPISODE-ARSEN-ACCUSATION",
            "actor_id": "ACT-ARSEN-KOVALENKO",
            "original_tv": "15.07.2024",
            "user_annotation": "Tentative illégale d'incorporation de l'art. 219 CP.",
            "affected_articles": ["Art. 219 CP"],
        }
        req = Request(
            f"{self.base_url}/api/v1/facts/calibrate",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with self.assertRaises(HTTPError) as ctx:
            urlopen(req)
        self.assertEqual(ctx.exception.code, 403)
        body = json.loads(ctx.exception.read().decode("utf-8"))
        self.assertEqual(body["error"], "INVARIANT_L04_VIOLATION")

    def test_invariant_l02_pure_stdlib_server(self):
        import inspect
        from src.legal import server

        source = inspect.getsource(server)
        disallowed = ["fastapi", "flask", "aiohttp", "starlette", "tornado", "requests"]
        for pkg in disallowed:
            self.assertNotIn(f"import {pkg}", source, f"Forbidden non-stdlib dependency: {pkg}")


if __name__ == "__main__":
    unittest.main()
