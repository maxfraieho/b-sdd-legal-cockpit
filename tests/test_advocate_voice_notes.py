"""
Unit and Invariant Tests for Advocate Voice Notes & Deposition Ingestion Engine.
Validates:
- ADR-002: Pure Python Standard Library in src/legal/.
- Invariant L-01: WORM Bitemporal Consistency (Tv vs Tt, supersession without in-place edits).
- Invariant L-03: Absolute Bona Fide Immunity Shield for Adriano MILLI (Art. 933 CC / Art. 105 CPP).
- Invariant L-04: Adult Victim Protection for Arsen KOVALENKO (b. 1999, strictly no Art. 219 CP).
- Invariant L-05: Cryptographic Evidence Sealing (SHA-256 chaining).
"""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.legal.advocate_voice_notes import (
    AdvocateVoiceNote,
    AdvocateVoiceNoteEngine,
    AudioSegment,
    SwissArticleSubsumption,
    NoteStatus,
    BonaFideProtectionViolation,
    AdultVictimProtectionViolation,
    CryptographicSealMismatchError,
)


class TestAdvocateVoiceNotes(unittest.TestCase):
    def setUp(self):
        self.engine = AdvocateVoiceNoteEngine()
        self.sample_note = AdvocateVoiceNote(
            note_id="AVN-20260928-001",
            dossier_id="PE24.014624-SBA",
            title="Debriefing audience menaces et extorsion",
            author_id="counsel.vaud.vd@gmail.com",
            raw_transcript="La prévenue Suvorova a explicitement menacé la victime de mort avec cris répétés.",
            audio_sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            audio_duration_seconds=142.5,
            t_v="2024-07-19T16:45:00Z",
            target_actor_ids=["ACT-LIUBOV-SUVOROVA", "ACT-ARSEN-KOVALENKO"],
            legal_observations="Éléments constitutifs de l'Art. 180 al. 1 CP réunis sans équivoque.",
            subsumptions=[
                SwissArticleSubsumption(
                    article="Art. 180 al. 1 CP",
                    offense_name="Menaces graves",
                    accused_actor_id="ACT-LIUBOV-SUVOROVA",
                    victim_actor_id="ACT-ARSEN-KOVALENKO",
                    qualifying_facts=["Menaces de mort réitérées verbalisées à l'encontre de la victime"],
                    confidence=0.98,
                )
            ],
        )

    def test_note_registration_and_cryptographic_seal(self):
        """Invariant L-05: Every registered note must receive a verifiable SHA-256 seal."""
        registered = self.engine.register_note(self.sample_note)
        self.assertIsNotNone(registered.sha256_seal)
        self.assertEqual(len(registered.sha256_seal), 64)
        self.assertTrue(registered.verify_seal())

        # Verify that altering content invalidates seal
        tampered_dict = registered.to_dict()
        tampered_dict["raw_transcript"] = "Altered fraudulent transcript"
        tampered_note = AdvocateVoiceNote.from_dict(tampered_dict)
        self.assertFalse(tampered_note.verify_seal())

    def test_invariant_l03_bona_fide_immunity_shield(self):
        """Invariant L-03: Adriano MILLI cannot be designated as accused or prévenu under any circumstance."""
        # Attempt 1: Designated in subsumption accused
        violating_note = AdvocateVoiceNote(
            note_id="AVN-VIOLATION-001",
            dossier_id="PE24.014624-SBA",
            title="Tentative d'accusation illicite de tiers",
            author_id="counsel.vaud.vd@gmail.com",
            raw_transcript="Déposition concernant le rôle de M. Milli.",
            audio_sha256="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
            audio_duration_seconds=60.0,
            t_v="2024-07-20T10:00:00Z",
            target_actor_ids=["ACT-ADRIANO-MILLI"],
            subsumptions=[
                SwissArticleSubsumption(
                    article="Art. 138 CP",
                    offense_name="Abus de confiance",
                    accused_actor_id="ACT-ADRIANO-MILLI",
                    victim_actor_id="ACT-ARSEN-KOVALENKO",
                    confidence=0.5,
                )
            ],
        )
        with self.assertRaises(BonaFideProtectionViolation):
            self.engine.register_note(violating_note)

        # Attempt 2: Qualifying Adriano Milli as prévenu in raw transcript
        violating_transcript_note = AdvocateVoiceNote(
            note_id="AVN-VIOLATION-002",
            dossier_id="PE24.014624-SBA",
            title="Audition témoin",
            author_id="counsel.vaud.vd@gmail.com",
            raw_transcript="Adriano Milli est considéré comme prévenu dans cette affaire.",
            audio_sha256="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
            audio_duration_seconds=30.0,
            t_v="2024-07-20T10:00:00Z",
            target_actor_ids=["ACT-ADRIANO-MILLI"],
            subsumptions=[],
        )
        with self.assertRaises(BonaFideProtectionViolation):
            self.engine.register_note(violating_transcript_note)

    def test_invariant_l04_adult_victim_protection(self):
        """Invariant L-04: Arsen KOVALENKO (b. 1999) cannot be accused, nor associated with Art. 219 CP (minor offense)."""
        # Attempt 1: Subsumption with Art. 219 CP
        minor_art_note = AdvocateVoiceNote(
            note_id="AVN-VIOLATION-003",
            dossier_id="PE24.014624-SBA",
            title="Qualification erronée minorité",
            author_id="counsel.vaud.vd@gmail.com",
            raw_transcript="Faits de maltraitance allégués.",
            audio_sha256="1111111111111111111111111111111111111111111111111111111111111111",
            audio_duration_seconds=45.0,
            t_v="2024-07-20T10:00:00Z",
            target_actor_ids=["ACT-ARSEN-KOVALENKO"],
            subsumptions=[
                SwissArticleSubsumption(
                    article="Art. 219 CP (Infractions contre les mineurs)",
                    offense_name="Violation du devoir d'assistance ou d'éducation",
                    accused_actor_id="ACT-LIUBOV-SUVOROVA",
                    victim_actor_id="ACT-ARSEN-KOVALENKO",
                    confidence=0.7,
                )
            ],
        )
        with self.assertRaises(AdultVictimProtectionViolation):
            self.engine.register_note(minor_art_note)

        # Attempt 2: Arsen Kovalenko set as accused
        accused_victim_note = AdvocateVoiceNote(
            note_id="AVN-VIOLATION-004",
            dossier_id="PE24.014624-SBA",
            title="Inversion victime-prévenu",
            author_id="counsel.vaud.vd@gmail.com",
            raw_transcript="Allégations de la partie adverse.",
            audio_sha256="2222222222222222222222222222222222222222222222222222222222222222",
            audio_duration_seconds=50.0,
            t_v="2024-07-20T10:00:00Z",
            target_actor_ids=["ACT-ARSEN-KOVALENKO"],
            subsumptions=[
                SwissArticleSubsumption(
                    article="Art. 180 CP",
                    offense_name="Menaces",
                    accused_actor_id="ACT-ARSEN-KOVALENKO",
                    victim_actor_id="ACT-LIUBOV-SUVOROVA",
                    confidence=0.5,
                )
            ],
        )
        with self.assertRaises(AdultVictimProtectionViolation):
            self.engine.register_note(accused_victim_note)

    def test_invariant_l01_worm_bitemporal_supersession(self):
        """Invariant L-01: Supersession archives historical note without destructive mutation."""
        self.engine.register_note(self.sample_note)
        self.assertEqual(self.sample_note.status, NoteStatus.ACTIVE)

        # Create calibrated superseding note
        updated_note = AdvocateVoiceNote(
            note_id="AVN-20260928-002",
            dossier_id="PE24.014624-SBA",
            title="Debriefing révisé avec précision horodatée",
            author_id="counsel.vaud.vd@gmail.com",
            raw_transcript="Précision: les menaces de mort ont eu lieu à 16h45 et 18h20.",
            audio_sha256="f5a79854e3fa338a0a80e06001099684348680d21057e95fcfef0f8457018c15",
            audio_duration_seconds=198.0,
            t_v="2024-07-19T18:20:00Z",
            target_actor_ids=["ACT-LIUBOV-SUVOROVA", "ACT-ARSEN-KOVALENKO"],
            legal_observations="Cumul réel d'infractions Art. 180 et Art. 181 CP.",
            subsumptions=[
                SwissArticleSubsumption(
                    article="Art. 180 al. 1 CP",
                    offense_name="Menaces graves réitérées",
                    accused_actor_id="ACT-LIUBOV-SUVOROVA",
                    victim_actor_id="ACT-ARSEN-KOVALENKO",
                    qualifying_facts=["Récidive le même après-midi"],
                    confidence=0.99,
                )
            ],
        )

        superseded_res = self.engine.supersede_note("AVN-20260928-001", updated_note)

        # Check historical preservation
        old_note = self.engine.get_note("AVN-20260928-001")
        self.assertIsNotNone(old_note)
        self.assertEqual(old_note.status, NoteStatus.SUPERSEDED)
        self.assertEqual(old_note.superseded_by, "AVN-20260928-002")
        self.assertEqual(old_note.valid_to, "2024-07-19T18:20:00Z")
        self.assertIsNotNone(old_note.tx_superseded)

        # Check new note linkage
        self.assertEqual(superseded_res.status, NoteStatus.ACTIVE)
        self.assertEqual(superseded_res.supersedes_id, "AVN-20260928-001")

        # Check active query
        active_notes = self.engine.query_active_notes()
        self.assertEqual(len(active_notes), 1)
        self.assertEqual(active_notes[0].note_id, "AVN-20260928-002")

    def test_blast_radius_calculation(self):
        """Calculates correct dossier chapter blast radius according to statutory mapping."""
        registered = self.engine.register_note(self.sample_note)
        # Menaces graves -> CH-04, general -> CH-01, CH-02, depositions -> CH-14
        self.assertIn("CH-04", registered.blast_radius_chapters)
        self.assertIn("CH-01", registered.blast_radius_chapters)
        self.assertIn("CH-14", registered.blast_radius_chapters)

        # Test note with financial abuse and lock tampering
        complex_note = AdvocateVoiceNote(
            note_id="AVN-COMPLEX-001",
            dossier_id="PE24.014624-SBA",
            title="Vol de fonds et dégradation de serrure",
            author_id="counsel.vaud.vd@gmail.com",
            raw_transcript="Détournement des 15'000 USD et effraction de serrure constatée par serrurier.",
            audio_sha256="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            audio_duration_seconds=80.0,
            t_v="2024-07-22T10:00:00Z",
            target_actor_ids=["ACT-LIUBOV-SUVOROVA"],
            subsumptions=[],
        )
        reg_complex = self.engine.register_note(complex_note)
        self.assertIn("CH-05", reg_complex.blast_radius_chapters)  # Financial misappropriation
        self.assertIn("CH-07", reg_complex.blast_radius_chapters)  # Lock / dwelling violation
        self.assertIn("CH-12", reg_complex.blast_radius_chapters)  # Civil claims (15'000 USD)

    def test_transcript_heuristic_analysis(self):
        """Verifies regex/keyword pattern recognition for Swiss Penal Code articles."""
        transcript = (
            "La prévenue a proféré des menaces d'abattre mon client, puis a bloqué l'accès "
            "en forçant la serrure de la chambre et s'est livrée à un chantage pour obtenir des virements."
        )
        subsumptions = self.engine.analyze_transcript_heuristics(transcript)
        articles = [s.article for s in subsumptions]

        self.assertIn("Art. 180 al. 1 CP", articles)   # Menaces
        self.assertIn("Art. 186 CP", articles)          # Serrure / Violation de domicile
        self.assertIn("Art. 156 ch. 1 CP", articles)   # Chantage / Extorsion

    def test_extract_bitemporal_facts_and_worm_audit_record(self):
        """Verifies integration with TimelineCalibrator and WORM audit ledger."""
        registered = self.engine.register_note(self.sample_note)

        # Fact extraction
        facts = self.engine.extract_bitemporal_facts(registered)
        self.assertEqual(len(facts), 1)
        self.assertEqual(facts[0].fact_id, "FACT-AVN-20260928-001-01")
        self.assertEqual(facts[0].t_v, registered.t_v)
        self.assertIn("ACT-LIUBOV-SUVOROVA", facts[0].actor_ids)
        self.assertIn("ACT-ARSEN-KOVALENKO", facts[0].actor_ids)

        # WORM audit export
        worm_record = self.engine.export_worm_audit_record(registered)
        self.assertEqual(worm_record["record_id"], "WORM-VOICE-AVN-20260928-001")
        self.assertEqual(worm_record["sha256_hash"], registered.sha256_seal)
        self.assertEqual(worm_record["valid_from"], registered.t_v)
        self.assertEqual(worm_record["status"], "active")


if __name__ == "__main__":
    unittest.main()
