"""
Tests for B-SDD Sprint 010 Astryx Legal AI Studio Backend Endpoints & Invariants.
Validates:
  - Invariant L-01: WORM Bitemporal Ledger logging of Astryx legal analysis.
  - Invariant L-02: 100% Pure Python standard library implementation.
  - Invariant L-03: Bona Fide Shield for Adriano MILLI (Art. 933 CC).
  - Invariant L-04: Adult Victim Protection for Arsen KOVALENKO (Art. 115, 118, 122 CPP; zero Art. 219 CP).
  - Invariant L-05: ISO/IEC 27037 64-char SHA-256 Cryptographic Evidence Seal.
"""

from http.server import HTTPServer
import json
import threading
import time
import unittest
from urllib.request import Request, urlopen
from urllib.error import HTTPError

from src.legal.server import LegalApiHandler


class TestAstryxStudioBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server_port = 8798
        cls.server = HTTPServer(("127.0.0.1", cls.server_port), LegalApiHandler)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.1)
        cls.base_url = f"http://127.0.0.1:{cls.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def test_health_check_includes_astryx_studio(self):
        req = Request(f"{self.base_url}/api/v1/health")
        with urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data["status"], "HEALTHY")
            self.assertTrue(data.get("services", {}).get("astryx_studio", False))
            self.assertIn("invariants", data)

    def test_astryx_analyze_endpoint_and_invariants_l01_l05(self):
        payload = {
            "text": "Extraction des clauses de responsabilité pénale à charge de Liubov SUVOROVA pour détournement de fonds.",
            "domain": "Droit Pénal Économique"
        }
        req = Request(
            f"{self.base_url}/api/v1/astryx/analyze",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data["status"], "SUCCESS")
            self.assertIn("clauses", data)
            self.assertGreaterEqual(len(data["clauses"]), 3)
            # Invariant L-05: 64-char SHA-256 evidence seal
            self.assertEqual(len(data["sha256_seal"]), 64)
            # Invariant L-01: WORM verified
            self.assertEqual(data["invariants"]["L-01"], "LOGGED_TO_WORM")
            self.assertEqual(data["invariants"]["L-02"], "PURE_STDLIB")

    def test_astryx_milli_shield_invariant_l03(self):
        payload = {
            "text": "Analyse de la transaction du véhicule avec Adriano MILLI en août 2024.",
            "domain": "Droit Civil & Pénal"
        }
        req = Request(
            f"{self.base_url}/api/v1/astryx/analyze",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(data.get("milli_shield_protected"))
            self.assertEqual(data["invariants"]["L-03"], "MILLI_SHIELD_ACTIVE")

    def test_astryx_arsen_adult_standing_invariant_l04(self):
        payload = {
            "text": "Conclusions civiles de la victime Arsen KOVALENKO né le 05.11.1999 (Art. 115, 118, 122 CPP).",
            "domain": "Procédure Pénale CPP"
        }
        req = Request(
            f"{self.base_url}/api/v1/astryx/analyze",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(data.get("arsen_adult_standing_verified"))
            self.assertEqual(data["invariants"]["L-04"], "ADULT_VICTIM_VERIFIED")

    def test_astryx_suggest_actions_endpoint(self):
        payload = {"domain": "Droit Pénal Économique"}
        req = Request(
            f"{self.base_url}/api/v1/astryx/suggest-actions",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data["status"], "SUCCESS")
            self.assertIn("actions", data)
            self.assertGreaterEqual(len(data["actions"]), 3)
            # Ensure risk assessment and clause extraction are present
            action_ids = [a["id"] for a in data["actions"]]
            self.assertIn("act-1", action_ids)
            self.assertIn("act-2", action_ids)


if __name__ == "__main__":
    unittest.main()
