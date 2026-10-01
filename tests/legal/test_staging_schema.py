"""
Unit tests for Candidate Evidence Staging Schema & Buffer Manager (Sprint S016).
Verifies:
  - Invariant L-01: Tv (valid_time) vs Tt (transaction_time)
  - Invariant L-02: Pure Python Standard Library
  - Invariant L-05: Strict SHA-256 validation
  - Ingestion, deduplication, and HITL approval / quarantine flows
"""

import json
import os
import tempfile
import unittest
from pathlib import Path

from src.legal.staging_schema import (
    CandidateEvidenceCard,
    ForensicDetails,
    ActorInvolvement,
    CandidateStagingBuffer,
    validate_candidate_dict,
)


class TestCandidateStagingSchema(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.buffer_file = Path(self.temp_dir.name) / "test_candidates.json"
        self.buffer = CandidateStagingBuffer(self.buffer_file)

        self.sample_card_dict = {
            "candidate_id": "CAND-P-001",
            "source_file": "IMG_20240412_142055.jpg",
            "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "valid_time": "2024-04-12T14:20:55+02:00",
            "transaction_time": "2026-09-30T10:00:00Z",
            "category": "Photo EXIF",
            "title": {
                "uk": "Фото-алібі: перебування на робочому місці",
                "fr": "Photo-alibi: présence attestée sur le lieu de travail",
                "en": "Alibi photo: verified presence at workplace"
            },
            "actors_involved": [
                {"actor_id": "AK-01", "actor_name": "Arsen Kovalenko", "role": "victime"}
            ],
            "target_charge_codes": ["Art. 180 CP", "Art. 181 CP"],
            "forensic_details": {
                "camera_model": "iPhone 13 Pro",
                "gps_coordinates": "46.5197° N, 6.6323° E",
                "visual_findings": "Timestamp and physical background confirms absence from alleged altercation location."
            },
            "verbatim_quote_original": "Фотографія робочого столу о 14:20, що виключає присутність на місці конфлікту.",
            "french_legal_translation": "Photographie du bureau à 14h20 attestant l'impossibilité matérielle de présence sur le lieu litigieux.",
            "admissibility_rationale": "Admissible sous Art. 139 al. 2 CPP (ATF 146 IV 9)."
        }

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_validation_success(self):
        valid, errs = validate_candidate_dict(self.sample_card_dict)
        self.assertTrue(valid, f"Validation failed with errors: {errs}")
        self.assertEqual(len(errs), 0)

    def test_validation_invalid_sha256(self):
        bad_card = dict(self.sample_card_dict)
        bad_card["sha256"] = "invalid_hash"
        valid, errs = validate_candidate_dict(bad_card)
        self.assertFalse(valid)
        self.assertTrue(any("sha256" in e for e in errs))

    def test_validation_missing_times(self):
        bad_card = dict(self.sample_card_dict)
        bad_card["valid_time"] = ""
        valid, errs = validate_candidate_dict(bad_card)
        self.assertFalse(valid)
        self.assertTrue(any("valid_time" in e for e in errs))

    def test_ingest_and_deduplication(self):
        res = self.buffer.ingest_batch([self.sample_card_dict])
        self.assertEqual(res["accepted_count"], 1)
        self.assertEqual(res["rejected_count"], 0)

        # Ingest again -> should reject duplicate ID and duplicate hash
        res2 = self.buffer.ingest_batch([self.sample_card_dict])
        self.assertEqual(res2["accepted_count"], 0)
        self.assertEqual(res2["rejected_count"], 1)

    def test_review_approval_flow(self):
        self.buffer.ingest_batch([self.sample_card_dict])
        candidates = self.buffer.load_candidates(status_filter="PENDING_HUMAN_REVIEW")
        self.assertEqual(len(candidates), 1)

        review_res = self.buffer.review_candidate(
            candidate_id="CAND-P-001",
            action="APPROVE",
            assigned_cote="P-01",
            notes="Vérifié par l'avocat mandataire avec rapport d'expertise EXIF.",
            lawyer_id="AVOCAT_VAUD_01"
        )
        self.assertTrue(review_res["success"])
        self.assertEqual(review_res["hitl_status"], "APPROVED_SEALED")
        self.assertEqual(review_res["assigned_cote"], "P-01")

        # Check that it moves to approved list
        pending = self.buffer.load_candidates(status_filter="PENDING_HUMAN_REVIEW")
        self.assertEqual(len(pending), 0)

        approved = self.buffer.load_candidates(status_filter="APPROVED_SEALED")
        self.assertEqual(len(approved), 1)

        # Check conversion to Cockpit BordereauPiece
        piece = approved[0].to_bordereau_piece()
        self.assertEqual(piece["cote"], "P-01")
        self.assertEqual(piece["categorie"], "Photo EXIF")
        self.assertIn("exif_meta", piece)
        self.assertEqual(piece["exif_meta"]["camera"], "iPhone 13 Pro")

    def test_review_quarantine_flow(self):
        self.buffer.ingest_batch([self.sample_card_dict])
        review_res = self.buffer.review_candidate(
            candidate_id="CAND-P-001",
            action="REJECT",
            notes="Art. 141 CPP: absence de chaîne de garde.",
            lawyer_id="AVOCAT_VAUD_01"
        )
        self.assertTrue(review_res["success"])
        self.assertEqual(review_res["hitl_status"], "REJECTED_QUARANTINE")

        quarantined = self.buffer.load_candidates(status_filter="REJECTED_QUARANTINE")
        self.assertEqual(len(quarantined), 1)


if __name__ == "__main__":
    unittest.main()
