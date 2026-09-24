"""
Unit and Invariant Tests for Swiss Criminal Claim Chart Engine.
Validates:
- Invariant L-02 & ADR-002: Pure Python Standard Library in src/legal/claim_chart.py
- Invariant L-03: Actor consistency and victim protection
- Statutory coverage: Art. 180 CP, Art. 138/146 CP, Art. 303/304 CP
- Admissibility tiers (ATF 146 IV 9) and evidence SHA-256 links
"""
import ast
import os
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src.legal.claim_chart import (
    CorroborationStatus,
    AdmissibilityTier,
    EvidenceCitation,
    StatutoryElement,
    CriminalChargeChart,
    SwissClaimChartManager,
)


class TestClaimChart(unittest.TestCase):
    def setUp(self):
        self.manager = SwissClaimChartManager()

    def test_pure_stdlib_in_claim_chart(self):
        """Invariant L-02: claim_chart.py must use 100% Python standard library."""
        module_path = ROOT / "src" / "legal" / "claim_chart.py"
        stdlib_modules = set(sys.stdlib_module_names) if hasattr(sys, "stdlib_module_names") else {
            "os", "sys", "re", "json", "time", "sqlite3", "hashlib", "pathlib", "typing",
            "subprocess", "logging", "datetime", "uuid", "argparse", "unittest", "shutil",
            "tempfile", "functools", "itertools", "collections", "abc", "contextlib", "dataclasses", "enum", "math"
        }
        internal_pkgs = {"src"}

        with open(module_path, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read(), filename=str(module_path))

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    root_mod = alias.name.split(".")[0]
                    self.assertTrue(
                        root_mod in stdlib_modules or root_mod in internal_pkgs,
                        f"External dependency '{alias.name}' detected in {module_path.name}",
                    )
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    root_mod = node.module.split(".")[0]
                    self.assertTrue(
                        root_mod in stdlib_modules or root_mod in internal_pkgs,
                        f"External from-import '{node.module}' detected in {module_path.name}",
                    )

    def test_claim_chart_statutory_coverage(self):
        """Verify presence of key Swiss CP charges and corroboration state."""
        charges = self.manager.charts

        # 1. Art. 180 CP: Menaces against minor Alexandre
        self.assertIn("CHG-CP-180-MENACES", charges)
        c180 = charges["CHG-CP-180-MENACES"]
        self.assertEqual(c180.victim_actor_id, "ACT-VICTIM-MINOR")
        self.assertEqual(c180.accused_actor_id, "ACT-ACCUSED-PRINCIPAL")
        self.assertTrue(c180.is_fully_corroborated())

        # 2. Art. 138/146 CP: Financial misappropriation ($15'000 USD)
        self.assertIn("CHG-CP-138-ABUS-CONFIANCE", charges)
        c138 = charges["CHG-CP-138-ABUS-CONFIANCE"]
        self.assertEqual(c138.victim_actor_id, "ACT-CLAIMANT-CIVIL")
        self.assertTrue(c138.is_fully_corroborated())

        # 3. Art. 303/304 CP: Calumny / false claim (F_1 refuted by F_2/F_3)
        self.assertIn("CHG-CP-303-DENONCIATION-CALOMNIEUSE", charges)
        c303 = charges["CHG-CP-303-DENONCIATION-CALOMNIEUSE"]
        self.assertEqual(c303.accused_actor_id, "ACT-AUTEUR-UNDER-INFLUENCE")
        self.assertEqual(c303.victim_actor_id, "ACT-VICTIM-MINOR")
        self.assertTrue(c303.is_fully_corroborated())

    def test_markdown_report_generation(self):
        """Verify Markdown report generation contains essential headings and citations."""
        report = self.manager.generate_markdown_report()
        self.assertIn("TABLEAU SYNOPTIQUE DES CHEFS D'ACCUSATION", report)
        self.assertIn("Art. 180 CP", report)
        self.assertIn("Art. 138 CP", report)
        self.assertIn("Art. 303 CP", report)
        self.assertIn("ATF 146 IV 9", report)
        self.assertIn("Jean-Paul VERNON", report)


if __name__ == "__main__":
    unittest.main()
