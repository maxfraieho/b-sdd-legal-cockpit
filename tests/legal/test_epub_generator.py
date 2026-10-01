"""
Unit and Invariant Tests for EPUB 3.2 Judicial Dossier Generator (tests/legal/test_epub_generator.py).
Validates:
  - Invariant L-01: WORM Bitemporal Ledger logging of build events.
  - Invariant L-02: 100% Pure Python Standard Library in src/legal/epub_generator.py.
  - Invariant L-03: Bona Fide Shield for Adriano MILLI (Art. 933 CC, bona_fide_protection = True).
  - Invariant L-04: Adult Victim Protection for Arsen KOVALENKO (05.11.1999). Zero Art. 219 CP.
  - Invariant L-05: Inclusion of authentic 64-char SHA-256 seals for all 41 Series A-E items.
  - Standard EPUB 3.2 structure (mimetype first/uncompressed, container.xml, content.opf, nav.xhtml).
  - Civil Claim Chart totals: CHF 46'850.00 and CHF 46'000.00 sequestration.
"""

import ast
import json
from pathlib import Path
import re
import sys
import unittest
import zipfile

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.legal.epub_generator import JudicialEpubCompiler
from src.legal.evidence_registry import JudicialEvidenceRegistry


class TestJudicialEpubGenerator(unittest.TestCase):
    """Test suite validating EPUB 3.2 judicial compilation and norm invariants."""

    @classmethod
    def setUpClass(cls):
        cls.epub_path = ROOT / "build" / "dossier_legal_vaud_ed10.epub"
        cls.compiler = JudicialEpubCompiler(output_path=cls.epub_path)
        cls.meta = cls.compiler.compile()

    def test_pure_stdlib_compliance_invariant_l02(self):
        """Invariant L-02: epub_generator.py must use 100% Python standard library."""
        module_path = ROOT / "src" / "legal" / "epub_generator.py"
        stdlib_modules = set(sys.stdlib_module_names) if hasattr(sys, "stdlib_module_names") else {
            "os", "sys", "re", "json", "time", "sqlite3", "hashlib", "pathlib", "typing",
            "subprocess", "logging", "datetime", "uuid", "argparse", "unittest", "shutil",
            "tempfile", "functools", "itertools", "collections", "abc", "contextlib", "dataclasses",
            "enum", "math", "zipfile", "html", "xml"
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

    def test_epub_archive_structure_and_mimetype(self):
        """Validates EPUB 3.2 specification rules for the archive package."""
        self.assertTrue(self.epub_path.exists(), "EPUB file was not created.")
        self.assertTrue(zipfile.is_zipfile(self.epub_path), "Generated file is not a valid zip archive.")

        with zipfile.ZipFile(self.epub_path, "r") as zf:
            infolist = zf.infolist()
            self.assertGreater(len(infolist), 0, "ZIP archive is empty.")

            # Rule 1: 'mimetype' MUST be the very first file
            first_entry = infolist[0]
            self.assertEqual(first_entry.filename, "mimetype", "First file must be 'mimetype'")
            
            # Rule 2: 'mimetype' MUST be uncompressed (ZIP_STORED)
            self.assertEqual(first_entry.compress_type, zipfile.ZIP_STORED, "Mimetype must be uncompressed (ZIP_STORED)")
            
            # Rule 3: Content of 'mimetype' MUST be exactly 'application/epub+zip'
            mimetype_bytes = zf.read("mimetype").strip()
            self.assertEqual(mimetype_bytes, b"application/epub+zip")

            # Rule 4: Required container, manifest, and navigation files
            namelist = zf.namelist()
            self.assertIn("META-INF/container.xml", namelist)
            self.assertIn("OEBPS/content.opf", namelist)
            self.assertIn("OEBPS/nav.xhtml", namelist)
            self.assertIn("OEBPS/toc.ncx", namelist)
            self.assertIn("OEBPS/style.css", namelist)
            self.assertIn("OEBPS/title.xhtml", namelist)
            self.assertIn("OEBPS/part1_plainte.xhtml", namelist)
            self.assertIn("OEBPS/part3_pieces_series.xhtml", namelist)
            self.assertIn("OEBPS/part4_claim_chart.xhtml", namelist)
            self.assertIn("OEBPS/part5_drakon_admissibility.xhtml", namelist)

    def test_invariant_l03_bona_fide_shield_in_book(self):
        """Invariant L-03: Adriano Milli must be protected with absolute bona fide shield in book chapters."""
        with zipfile.ZipFile(self.epub_path, "r") as zf:
            title_text = zf.read("OEBPS/title.xhtml").decode("utf-8")
            part1_text = zf.read("OEBPS/part1_plainte.xhtml").decode("utf-8")

        self.assertIn("Adriano MILLI", title_text)
        self.assertIn("933 CC", title_text)
        self.assertIn("bona_fide_protection = True", title_text)

        self.assertIn("Adriano MILLI", part1_text)
        self.assertIn("933 CC", part1_text)
        self.assertIn("bona_fide_protection = True", part1_text)

    def test_invariant_l04_adult_victim_standing_in_book(self):
        """Invariant L-04: Arsen Kovalenko (05.11.1999) adult victim standing; zero occurrences of Art. 219 CP."""
        with zipfile.ZipFile(self.epub_path, "r") as zf:
            title_text = zf.read("OEBPS/title.xhtml").decode("utf-8")
            part1_text = zf.read("OEBPS/part1_plainte.xhtml").decode("utf-8")

        self.assertIn("Arsen KOVALENKO", title_text)
        self.assertIn("05.11.1999", title_text)
        self.assertIn("Art. 115, 118, 122 CPP", title_text)

        self.assertIn("05.11.1999", part1_text)
        self.assertIn("victime et partie plaignante majeure", part1_text)

        # Ensure no Art. 219 CP exists
        self.assertNotIn("219 CP", part1_text)
        self.assertNotIn("219", title_text)

    def test_invariant_l05_evidence_sha256_seals_in_register(self):
        """Invariant L-05: All 41 judicial items across Series A..E must appear with 64-char SHA-256 seals."""
        with zipfile.ZipFile(self.epub_path, "r") as zf:
            part3_text = zf.read("OEBPS/part3_pieces_series.xhtml").decode("utf-8")

        registry = JudicialEvidenceRegistry()
        self.assertEqual(len(registry.items), 41)

        for code, item in registry.items.items():
            self.assertIn(item.code, part3_text, f"Evidence item {item.code} missing from EPUB register")
            self.assertIn(item.sha256_hash, part3_text, f"SHA-256 seal for {item.code} missing from EPUB register")
            self.assertEqual(len(item.sha256_hash), 64)

    def test_claim_chart_totals_in_book(self):
        """Validates that Part IV contains harmonized civil claims of CHF 46'850.00 and CHF 46'000.00 sequestration."""
        with zipfile.ZipFile(self.epub_path, "r") as zf:
            part4_text = zf.read("OEBPS/part4_claim_chart.xhtml").decode("utf-8")

        self.assertIn("46,850.00", part4_text)
        self.assertIn("46,000.00", part4_text)
        self.assertIn("CIV-REST-15K-USD", part4_text)
        self.assertIn("CIV-DIR-DAMAGES-7500", part4_text)
        self.assertIn("CIV-TORT-MORAL-ARSEN", part4_text)
        self.assertIn("CIV-TORT-MORAL-VOLODYMYR", part4_text)
        self.assertIn("CIV-MAT-GLASSES-850", part4_text)

    def test_worm_logging_invariant_l01(self):
        """Invariant L-01: Verifies that compilation event is logged in utopia_local_worm.jsonl."""
        worm_file = ROOT / "docs" / "utopia_local_worm.jsonl"
        self.assertTrue(worm_file.exists())

        found_build = False
        with open(worm_file, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    data = json.loads(line)
                    if data.get("action") == "EPUB_JUDICIAL_DOSSIER_COMPILED" and data.get("status") == "SUCCESS":
                        self.assertEqual(len(data.get("sha256_seal", "")), 64)
                        self.assertEqual(data.get("claims_total_chf"), 46850.0)
                        self.assertEqual(data.get("sequestration_chf"), 46000.0)
                        found_build = True
                        break
                except json.JSONDecodeError:
                    continue

        self.assertTrue(found_build, "WORM build record not found in utopia_local_worm.jsonl")


if __name__ == "__main__":
    unittest.main()
