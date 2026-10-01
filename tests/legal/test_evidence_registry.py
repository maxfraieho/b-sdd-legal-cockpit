"""
Test Suite for Judicial Evidence Registry (tests/legal/test_evidence_registry.py).
Validates:
  - Series A, B, C, D, E official counts (41 items total: 4 + 8 + 15 + 9 + 5).
  - Invariant L-02: 100% Pure Python Standard Library (no external pip dependencies).
  - Invariant L-05: Strict 64-char SHA-256 cryptographic seal on every item.
  - Transcript mapping integration with 61 raw transcripts.
  - Room linkage and judicial series queries.
"""

import ast
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.legal.evidence_registry import (
    JudicialEvidenceRegistry,
    JudicialEvidenceItem,
    EvidenceSeries,
    EvidenceCategory,
)
from src.legal.transcript_ingest import parse_61_transcripts


class TestJudicialEvidenceRegistry(unittest.TestCase):
    """Test suite validating official evidence series and compliance under Swiss standards."""

    def setUp(self):
        self.registry = JudicialEvidenceRegistry()

    def test_pure_stdlib_compliance_invariant_l02(self):
        """Invariant L-02: evidence_registry.py must use 100% Python standard library."""
        module_path = ROOT / "src" / "legal" / "evidence_registry.py"
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

    def test_canonical_series_counts(self):
        """Validates that exactly 41 items are categorized across Series A, B, C, D, E."""
        self.assertEqual(len(self.registry.items), 41, "Must contain exactly 41 primary evidence items")

        series_a = self.registry.get_by_series("A")
        series_b = self.registry.get_by_series("B")
        series_c = self.registry.get_by_series("C")
        series_d = self.registry.get_by_series("D")
        series_e = self.registry.get_by_series("E")

        self.assertEqual(len(series_a), 4, "Series A must contain 4 items (A-01 .. A-04)")
        self.assertEqual(len(series_b), 8, "Series B must contain 8 items (B-01 .. B-08)")
        self.assertEqual(len(series_c), 15, "Series C must contain 15 items (C-01 .. C-15)")
        self.assertEqual(len(series_d), 9, "Series D must contain 9 items (D-01 .. D-09)")
        self.assertEqual(len(series_e), 5, "Series E must contain 5 items (E-01 .. E-05)")

    def test_invariant_l05_cryptographic_seal_integrity(self):
        """Invariant L-05: Every single evidence item must have a verified 64-char SHA-256 seal."""
        for code, item in self.registry.items.items():
            self.assertTrue(len(item.sha256_hash) == 64, f"Item {code} has invalid hash length: {len(item.sha256_hash)}")
            self.assertTrue(
                all(c in "0123456789abcdef" for c in item.sha256_hash),
                f"Item {code} has non-hex characters in SHA-256 seal: {item.sha256_hash}"
            )
            self.assertTrue(item.filename != "", f"Item {code} has empty filename")
            self.assertTrue(item.date_or_period != "", f"Item {code} has empty date/period")
            self.assertTrue(len(item.statutory_targets) > 0, f"Item {code} has no statutory targets")

    def test_series_e_photographic_forensics(self):
        """Verifies specific Series E photographic and forensic medical evidence items."""
        e01 = self.registry.get_item("[ФОТО E-01]")
        self.assertIsNotNone(e01)
        self.assertEqual(e01.category, EvidenceCategory.PHOTOGRAPHIC_EXIF)
        self.assertIn("Art. 123 CP", e01.statutory_targets)
        self.assertEqual(e01.room_id, "ROOM-123-CP")

        e03 = self.registry.get_item("[ФОТО E-03]")
        self.assertIsNotNone(e03)
        self.assertEqual(e03.sha256_hash, "057c6a5bdd3d90d9e8015637bda94f9e5a2fd54937cc1368daeb356bf2463f1a")
        self.assertEqual(e03.room_id, "ROOM-144-CP")
        self.assertIn("Art. 144 CP", e03.statutory_targets)

        e05 = self.registry.get_item("[ДОКАЗ E-05]")
        self.assertIsNotNone(e05)
        self.assertEqual(e05.category, EvidenceCategory.MEDICAL_REPORT)
        self.assertIn("Art. 139 CPP", e05.statutory_targets)

    def test_transcript_mapping_pipeline(self):
        """Validates mapping of the 61 raw transcripts to official Series codes."""
        transcripts = parse_61_transcripts()
        self.assertEqual(len(transcripts), 61)

        mapping_result = self.registry.map_transcripts(transcripts)
        self.assertEqual(mapping_result["total_transcripts"], 61)
        self.assertGreater(mapping_result["matched_official_count"], 0)

        # Verify key admissions are mapped
        mappings = mapping_result["mappings"]
        self.assertTrue(any(v["official_code"] == "[АУДІО D-01]" for v in mappings.values()))
        self.assertTrue(any(v["official_code"] == "[АУДІО B-01]" for v in mappings.values()))
        self.assertTrue(any(v["official_code"] == "[АУДІО C-01]" for v in mappings.values()))

    def test_json_export_and_serialization(self):
        """Validates JSON export structure and metadata."""
        json_str = self.registry.export_to_json()
        parsed = json.loads(json_str)

        self.assertIn("metadata", parsed)
        self.assertIn("items", parsed)
        self.assertEqual(parsed["metadata"]["total_items"], 41)
        self.assertEqual(parsed["metadata"]["series_counts"]["A"], 4)
        self.assertEqual(parsed["metadata"]["series_counts"]["B"], 8)
        self.assertEqual(parsed["metadata"]["series_counts"]["C"], 15)
        self.assertEqual(parsed["metadata"]["series_counts"]["D"], 9)
        self.assertEqual(parsed["metadata"]["series_counts"]["E"], 5)
        self.assertEqual(len(parsed["items"]), 41)


if __name__ == "__main__":
    unittest.main()
