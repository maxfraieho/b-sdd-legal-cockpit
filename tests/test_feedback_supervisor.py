"""
Unit and Invariant Tests for Autonomous Feedback & Reconciliation Supervisor.
Validates:
- ADR-002: Pure Python Standard Library in src/legal/.
- Sequential Thinking multi-step validation logic.
- Accurate birthdate calibration for Volodymyr Anatoliiovych Kovalenko (16.04.1975).
- Blast Radius computation across the 18 chapters of the Swiss Legal Dossier.
- Invariants L-01 to L-05 compliance under both GEMINI and AGY handlers.
"""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.legal.feedback_supervisor import (
    ReconciliationSupervisor,
    ReconciliationRequest,
    ReconciliationVerdict,
    HandlerType,
    ReconciliationStatus,
)


class TestFeedbackSupervisor(unittest.TestCase):
    def setUp(self):
        self.supervisor = ReconciliationSupervisor()

    def test_volodymyr_kovalenko_birthdate_calibration(self):
        """Verifies exact calibration of Volodymyr Kovalenko's birthdate (16.04.1975)."""
        req = ReconciliationRequest(
            text="Я, Володимир Коваленко народився 16.04.1975 року а не як в звіті.",
            handler=HandlerType.GEMINI_SPARK,
            use_sequential_thinking=True,
            use_utopia_db=True,
            use_mempalace=True,
        )
        verdict = self.supervisor.process(req)

        # Basic status
        self.assertEqual(verdict.status, ReconciliationStatus.VERIFIED)
        self.assertEqual(verdict.handler, "gemini")

        # Check calibrated entity
        self.assertEqual(len(verdict.calibrated_entities), 1)
        entity = verdict.calibrated_entities[0]
        self.assertEqual(entity["entity_id"], "ACT-VOLODYMYR-KOVALENKO")
        self.assertEqual(entity["calibrated_value"], "1975-04-16")
        self.assertEqual(entity["display_uk"], "16.04.1975")

        # Check sequential thinking steps
        self.assertEqual(len(verdict.sequential_steps), 5)
        self.assertIn("1975", verdict.sequential_steps[1].reasoning)
        self.assertIn("24.5 years", verdict.sequential_steps[1].reasoning)

        # Check blast radius
        self.assertIn("CH-01", verdict.blast_radius_chapters)
        self.assertIn("CH-03", verdict.blast_radius_chapters)
        self.assertIn("CH-05", verdict.blast_radius_chapters)
        self.assertIn("CH-12", verdict.blast_radius_chapters)

        # Check invariants audit
        self.assertTrue(all(verdict.invariants_audit.values()))
        self.assertIsNotNone(verdict.worm_record)
        self.assertIsNotNone(verdict.sha256_seal)

    def test_handler_selection_agy(self):
        """Verifies supervisor runs cleanly under AGY autonomous handler."""
        req = ReconciliationRequest(
            text="Уточнення до розділу CH-04: погрози вбивством лунали не тільки вдень, але й уночі.",
            handler=HandlerType.AGY_AUTONOMOUS,
            target_chapter="CH-04",
        )
        verdict = self.supervisor.process(req)
        self.assertEqual(verdict.status, ReconciliationStatus.VERIFIED)
        self.assertEqual(verdict.handler, "agy")
        self.assertIn("CH-04", verdict.blast_radius_chapters)

    def test_invariant_l03_guard_against_incrimination_milli(self):
        """Invariant L-03: Rejects and flags any review note attempting to qualify Adriano Milli as prévenu."""
        req = ReconciliationRequest(
            text="Вважаю, що Adriano Milli є винним і має бути оголошений як prévenu.",
            handler=HandlerType.GEMINI_SPARK,
        )
        verdict = self.supervisor.process(req)
        self.assertEqual(verdict.status, ReconciliationStatus.INVARIANT_VIOLATION)
        self.assertFalse(verdict.invariants_audit["L-03_Adriano_Milli_Shield"])

    def test_invariant_l04_guard_against_minor_article_for_arsen(self):
        """Invariant L-04: Rejects inappropriate Art. 219 CP reference for adult victim Arsen Kovalenko."""
        req = ReconciliationRequest(
            text="Слід додати кваліфікацію Art. 219 CP щодо неповнолітнього Арсена.",
            handler=HandlerType.AGY_AUTONOMOUS,
        )
        verdict = self.supervisor.process(req)
        self.assertEqual(verdict.status, ReconciliationStatus.INVARIANT_VIOLATION)
        self.assertFalse(verdict.invariants_audit["L-04_Adult_Victim_Protection"])


if __name__ == "__main__":
    unittest.main()
