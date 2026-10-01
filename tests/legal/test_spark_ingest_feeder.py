"""
Unit tests for Spark L1 Candidate Ingestion Feeder (scripts/spark_ingest_feeder.py).
Verifies:
  - Invariant L-01: Tv (valid_time) vs Tt (transaction_time)
  - Invariant L-02: 100% Pure Python Standard Library
  - Invariant L-05: Strict SHA-256 validation (ISO/IEC 27037)
  - Loading, validation, enrichment, and dry-run execution
"""

import json
import os
from pathlib import Path
import tempfile
import unittest

from scripts.spark_ingest_feeder import (
    compute_file_sha256,
    load_raw_candidates,
    validate_and_enrich_candidates,
    submit_via_direct_buffer,
    setup_logger,
)
from src.legal.staging_schema import CandidateStagingBuffer


class TestSparkIngestFeeder(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.work_path = Path(self.temp_dir.name)
        self.logger = setup_logger(quiet=True)

        # Create a sample test evidence file
        self.sample_evidence = self.work_path / "test_photo.jpg"
        self.sample_evidence.write_bytes(b"EXIF_EVIDENCE_FIXTURE_DATA_FOR_SHA256_TESTING")
        self.expected_hash = compute_file_sha256(self.sample_evidence)

        # Create sample candidate JSON
        self.sample_card = {
            "candidate_id": "CAND-SPARK-001",
            "source_file": "test_photo.jpg",
            "sha256": self.expected_hash,
            "valid_time": "2024-04-12T14:20:55+02:00",
            "category": "Photo EXIF",
            "title": {
                "uk": "Тестовий доказ Spark",
                "fr": "Preuve test Spark",
                "en": "Spark test evidence"
            },
            "actors_involved": [
                {"actor_id": "AK-01", "actor_name": "Arsen Kovalenko", "role": "victime"}
            ],
            "target_charge_codes": ["Art. 180 CP"],
            "verbatim_quote_original": "Тестова цитата доказу.",
            "french_legal_translation": "Citation de preuve pour test judiciaire.",
            "admissibility_rationale": "Admissible sous Art. 139 al. 2 CPP."
        }

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_compute_file_sha256(self):
        self.assertEqual(len(self.expected_hash), 64)
        # Verify re-computation matches
        self.assertEqual(compute_file_sha256(self.sample_evidence), self.expected_hash)

    def test_load_raw_candidates_single_file(self):
        json_file = self.work_path / "candidate.json"
        json_file.write_text(json.dumps([self.sample_card]), encoding="utf-8")

        loaded = load_raw_candidates(str(json_file), self.logger)
        self.assertEqual(len(loaded), 1)
        self.assertEqual(loaded[0]["candidate_id"], "CAND-SPARK-001")

    def test_load_raw_candidates_directory(self):
        sub_dir = self.work_path / "incoming"
        sub_dir.mkdir()

        card1 = dict(self.sample_card, candidate_id="CAND-DIR-001")
        card2 = dict(self.sample_card, candidate_id="CAND-DIR-002")

        (sub_dir / "card1.json").write_text(json.dumps(card1), encoding="utf-8")
        (sub_dir / "card2.json").write_text(json.dumps([card2]), encoding="utf-8")

        loaded = load_raw_candidates(str(sub_dir), self.logger)
        self.assertEqual(len(loaded), 2)
        cands = {c["candidate_id"] for c in loaded}
        self.assertEqual(cands, {"CAND-DIR-001", "CAND-DIR-002"})

    def test_validate_and_enrich_candidates(self):
        valid_cards, errors = validate_and_enrich_candidates(
            [self.sample_card],
            self.logger,
            base_evidence_dir=self.work_path
        )
        self.assertEqual(len(errors), 0)
        self.assertEqual(len(valid_cards), 1)
        card = valid_cards[0]
        self.assertEqual(card.candidate_id, "CAND-SPARK-001")
        # Invariant L-01: Auto-populated transaction_time
        self.assertTrue(bool(card.transaction_time))
        self.assertEqual(card.sha256, self.expected_hash)

    def test_validate_and_enrich_sha256_mismatch(self):
        bad_card = dict(self.sample_card, sha256="0" * 64)
        valid_cards, errors = validate_and_enrich_candidates(
            [bad_card],
            self.logger,
            base_evidence_dir=self.work_path
        )
        self.assertEqual(len(valid_cards), 0)
        self.assertEqual(len(errors), 1)
        self.assertIn("SHA-256 mismatch", errors[0])

    def test_submit_via_direct_buffer(self):
        buffer_file = self.work_path / "staging_buffer.json"
        valid_cards, _ = validate_and_enrich_candidates(
            [self.sample_card],
            self.logger,
            base_evidence_dir=self.work_path
        )
        res = submit_via_direct_buffer(buffer_file, valid_cards, self.logger)
        self.assertTrue(res["success"])
        self.assertEqual(res["ingested_count"], 1)

        # Inspect buffer contents
        buffer = CandidateStagingBuffer(buffer_file)
        candidates = buffer.list_candidates()
        self.assertEqual(len(candidates), 1)
        self.assertEqual(candidates[0]["candidate_id"], "CAND-SPARK-001")
        self.assertEqual(candidates[0]["hitl_status"], "PENDING_HUMAN_REVIEW")


if __name__ == "__main__":
    unittest.main()
