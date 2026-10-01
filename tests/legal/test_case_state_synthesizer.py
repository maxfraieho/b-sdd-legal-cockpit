#!/usr/bin/env python3
"""
Unit tests for B-SDD Legal Case State Synthesizer and Sequential AI Sync.
Verifies:
  - 5-step Sequential Thinking analytical pipeline
  - 35 Swiss statutes & 9 rooms in KùzuDB MemPalace
  - Invariant L-01 (WORM interval), L-03 (Adriano Milli absolute immunity), L-04 (Arsen compos mentis adult), L-05 (SHA-256 seals)
  - Olena Kovalenko's procedural protection (Art. 18 & 48 CP / PADR)
  - Sequestration total target CHF 46'850.00
  - Gemini Spark task payload structure [SPARK-TASK:CASE-SYNC]
"""

import os
import sys
import unittest

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from scripts.case_state_synthesizer import CaseStateSynthesizer


class TestCaseStateSynthesizer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.synthesizer = CaseStateSynthesizer()
        cls.sync_data = cls.synthesizer.run_sequential_sync()

    def test_overall_court_readiness(self):
        """Validates that the case state satisfies all preconditions for court transmission."""
        self.assertTrue(self.sync_data["is_court_ready"], "Case state should be court ready.")
        self.assertEqual(self.sync_data["case_id"], "PE24.014624-SBA")

    def test_five_sequential_steps_present(self):
        """Validates that all 5 Sequential Thinking steps are computed."""
        steps = self.sync_data["sequential_steps"]
        self.assertEqual(len(steps), 5)
        for i, step in enumerate(steps, 1):
            self.assertEqual(step["step_number"], i)

    def test_step1_worm_and_sha256_invariants(self):
        """Validates Step 1: Fact Ingestion, WORM L-01 and SHA-256 L-05 integrity."""
        step1 = self.sync_data["sequential_steps"][0]
        self.assertTrue(step1["valid"])
        self.assertTrue(step1["l01_worm_valid"], "WORM intervals must be valid.")
        self.assertTrue(step1["l05_seals_valid"], "All SHA-256 seals must be valid.")
        self.assertEqual(step1["drawers_count"], 61)
        self.assertEqual(step1["evidence_count"], 41)
        self.assertEqual(len(step1["invalid_seals"]), 0)

    def test_step2_statutes_coverage(self):
        """Validates Step 2: 35 Swiss and Cantonal Vaud statutes loaded and mapped."""
        step2 = self.sync_data["sequential_steps"][1]
        self.assertEqual(step2["total_statutes"], 35)
        self.assertGreaterEqual(step2["mapped_count"], 35)
        self.assertEqual(step2["rooms_count"], 9)

    def test_step3_evidentiary_admissibility(self):
        """Validates Step 3: 100% evidentiary admissibility under ATF 147 IV 9."""
        step3 = self.sync_data["sequential_steps"][2]
        self.assertEqual(step3["admissible_ratio"], 1.0)
        self.assertEqual(step3["atf_precedent"], "ATF 147 IV 9 (confirmant ATF 146 IV 9)")
        for test in step3["test_results"]:
            self.assertEqual(test["status"], "PASS")

    def test_step4_actor_invariants_and_olena_protection(self):
        """Validates Step 4: Invariants L-03 and L-04, and Olena Kovalenko's Art. 18/48 CP protection."""
        step4 = self.sync_data["sequential_steps"][3]
        self.assertTrue(step4["l03_immunity_secured"], "Invariant L-03 Adriano Milli immunity must be secured.")
        self.assertTrue(step4["l04_arsen_compos_mentis"], "Invariant L-04 Arsen compos mentis must be confirmed.")

        actors = step4["actors_assessment"]
        # Adriano Milli
        self.assertIn("ACT-ADRIANO-MILLI", actors)
        self.assertEqual(actors["ACT-ADRIANO-MILLI"]["status"], "SECURED")

        # Arsen Kovalenko
        self.assertIn("ACT-ARSEN-KOVALENKO", actors)
        self.assertEqual(actors["ACT-ARSEN-KOVALENKO"]["status"], "CONFIRMED")

        # Olena Kovalenko
        self.assertIn("ACT-OLENA-KOVALENKO", actors)
        self.assertEqual(actors["ACT-OLENA-KOVALENKO"]["status"], "PROTECTED")
        self.assertIn("Art. 18", actors["ACT-OLENA-KOVALENKO"]["statute"])
        self.assertIn("Art. 48", actors["ACT-OLENA-KOVALENKO"]["statute"])

        # Liubov Suvorova (Accused)
        self.assertIn("ACT-LIUBOV-SUVOROVA", actors)
        self.assertEqual(actors["ACT-LIUBOV-SUVOROVA"]["status"], "ACCUSED_PRIMARY")

    def test_step5_civil_claims_and_sequestration_target(self):
        """Validates Step 5: Sequestration target amount equals exactly CHF 46'850.00."""
        step5 = self.sync_data["sequential_steps"][4]
        self.assertEqual(step5["total_sequestration_chf"], 46850.00)
        self.assertEqual(step5["target_formatted"], "CHF 46'850.00")

    def test_spark_task_payload_generation(self):
        """Validates generation of Gemini Spark task payload with all headers."""
        payload = self.synthesizer.generate_spark_task_payload(self.sync_data)
        self.assertIn("[SPARK-TASK:CASE-SYNC]", payload)
        self.assertIn("INVARIANT L-01", payload)
        self.assertIn("INVARIANT L-03", payload)
        self.assertIn("INVARIANT L-04", payload)
        self.assertIn("INVARIANT L-05", payload)
        self.assertIn("ACT-OLENA-KOVALENKO", payload)
        self.assertIn("Art. 18 Swiss Criminal Code", payload)
        self.assertIn("CHF 46'850.00", payload)
        self.assertIn("[SPARK-RES:CASE-SYNC]", payload)


if __name__ == "__main__":
    unittest.main()
