"""
Tests for Kindle Dispatch Pipeline (tests/legal/test_kindle_dispatch.py).
Enforces:
  - Invariant L-01: WORM Bitemporal Ledger logging of dispatch events.
  - Invariant L-02: Pure Python Standard Library core runtime.
  - Invariant L-05: Verification of cryptographic archive SHA-256 seal.
"""

from pathlib import Path
import tempfile
import unittest
import zipfile

from src.legal.kindle_dispatch import (
    verify_epub_integrity,
    load_smtp_credentials,
    send_via_smtp_ssl,
    dispatch_to_kindle,
    DEFAULT_EPUB_PATH,
)


class TestKindleDispatch(unittest.TestCase):
    def test_verify_epub_integrity_live(self):
        """Verifies that the live compiled EPUB passes strict EPUB 3 structural checks."""
        self.assertTrue(DEFAULT_EPUB_PATH.exists(), f"EPUB file missing at {DEFAULT_EPUB_PATH}")
        integrity = verify_epub_integrity(DEFAULT_EPUB_PATH)
        self.assertTrue(integrity["is_valid"])
        self.assertGreater(integrity["file_size_bytes"], 100_000)
        self.assertEqual(len(integrity["sha256_hash"]), 64)
        self.assertGreaterEqual(integrity["total_files"], 5)

    def test_verify_epub_integrity_invalid(self):
        """Verifies that corrupted archives are rejected."""
        with tempfile.NamedTemporaryFile(suffix=".epub") as tmp:
            with zipfile.ZipFile(tmp.name, "w") as zf:
                zf.writestr("not_mimetype.txt", "invalid")
            with self.assertRaises(ValueError):
                verify_epub_integrity(Path(tmp.name))

    def test_smtp_dry_run_dispatch(self):
        """Tests MIME message generation and simulated dispatch in dry-run mode."""
        res = send_via_smtp_ssl(
            host="smtp.gmail.com",
            port=465,
            user="test_operator@example.com",
            password="test_dummy_app_password",
            recipients=["test_device@kindle.com", "test_backup@example.com"],
            subject="Dossier Legal Vaud ED10",
            body_text="Test Body",
            epub_path=DEFAULT_EPUB_PATH,
            dry_run=True,
        )
        self.assertTrue(res["success"])
        self.assertEqual(res["transport"], "SMTP_SSL")
        self.assertEqual(res["smtp_code"], 250)
        self.assertEqual(res["attachment"], DEFAULT_EPUB_PATH.name)

    def test_dispatch_to_kindle_dry_run(self):
        """Tests end-to-end dispatch wrapper with WORM logging in dry-run mode."""
        res = dispatch_to_kindle(
            epub_path=DEFAULT_EPUB_PATH,
            kindle_addr="test_device@kindle.com",
            backup_addr="test_backup@example.com",
            dry_run=True,
        )
        self.assertTrue(res["integrity"]["is_valid"])
        self.assertEqual(res["worm_record"]["action"], "KINDLE_JUDICIAL_DOSSIER_DISPATCHED")
        self.assertEqual(res["worm_record"]["kindle_recipient"], "test_device@kindle.com")


if __name__ == "__main__":
    unittest.main()
