"""
Test Suite for Admissibility Engine and ATF 146 IV 9 Balancing (tests/legal/test_admissibility.py).
Validates Invariants L-01, L-02, and L-05, Swiss Case Law Criteria (ATF 146 IV 9 / 147 IV 9),
and the Planar DRAKON Invariant (C=0, X=0).
"""

import ast
from pathlib import Path
import sys
import pytest

from src.legal.admissibility import (
    AdmissibilityEngine,
    AdmissibilityStatus,
    PeseeDesInterets,
    AdmissibilityEvaluation,
)
from src.legal.transcript_ingest import parse_61_transcripts

ROOT = Path(__file__).resolve().parent.parent.parent


class TestAdmissibilityEngine:
    """Test suite validating ATF 146 IV 9 proportionality, subsidiarity, and DRAKON C=0 rules."""

    def test_pure_stdlib_invariant_l02(self):
        """Invariant L-02: admissibility.py must use 100% Python standard library."""
        module_path = ROOT / "src" / "legal" / "admissibility.py"
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
                    assert root_mod in stdlib_modules or root_mod in internal_pkgs, (
                        f"External dependency '{alias.name}' detected in {module_path.name}"
                    )
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    root_mod = node.module.split(".")[0]
                    assert root_mod in stdlib_modules or root_mod in internal_pkgs, (
                        f"External from-import '{node.module}' detected in {module_path.name}"
                    )

    def test_atf_146_iv_9_admissibility_criteria(self):
        """
        Validates that recordings containing explicit death threats (Art. 180 CP)
        or large financial fraud (Art. 146 CP) pass the 3-tier judicial test.
        """
        engine = AdmissibilityEngine()
        sha_example = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

        # Case 1: Death threat against child/victim (Art. 180 CP)
        eval_threat = engine.evaluate_recording(
            evidence_id="DRAWER-TR-32",
            filename="enhanced_audio-lena01-ганна-їде-вбивати-арсена.mp3",
            sha256_hash=sha_example,
            text_content="Ганна їде вбивати Арсена, виб'є зуби, втопить у воді"
        )
        assert eval_threat.status == AdmissibilityStatus.ADMISSIBLE_ATF_146_IV_9
        assert eval_threat.pesee.infraction_grave is True
        assert eval_threat.pesee.subsidiarite_reconnue is True
        assert eval_threat.pesee.proportionnalite_favorable is True
        assert eval_threat.drakon_x == 0
        assert eval_threat.drakon_step == "CANONICAL_SKEWER_ADMISSIBLE"

        # Case 2: Escroquerie $15'000 USD (Art. 146 CP)
        eval_fraud = engine.evaluate_recording(
            evidence_id="DRAWER-TR-01",
            filename="02_1.mp4",
            sha256_hash="a" * 64,
            text_content="схема фіктивного шлюбу за 25 000 франків і 15 000 доларів"
        )
        assert eval_fraud.status == AdmissibilityStatus.ADMISSIBLE_ATF_146_IV_9
        assert eval_fraud.pesee.infraction_grave is True
        assert eval_fraud.drakon_x == 0

    def test_inadmissibility_and_fallback(self):
        """
        Validates that trivial/irrelevant non-grave conversations are excluded under Art. 141 CPP
        and diverted to the degradation branch (X=240) with fallback documents.
        """
        engine = AdmissibilityEngine()
        sha_example = "b" * 64

        eval_trivial = engine.evaluate_recording(
            evidence_id="DRAWER-TR-TRIVIAL",
            filename="casual_chat.mp3",
            sha256_hash=sha_example,
            text_content="сьогодні гарна погода, пили чай на терасі без будь-яких претензій",
            statute_hint=None
        )
        # Should degrade to INADMISSIBLE_ART_141_CPP
        assert eval_trivial.status == AdmissibilityStatus.INADMISSIBLE_ART_141_CPP
        assert eval_trivial.pesee.proportionnalite_favorable is False
        assert eval_trivial.drakon_x == 240
        assert len(eval_trivial.fallback_documents) > 0
        assert "Unisanté Consultation FOR597" in eval_trivial.fallback_documents

    def test_planar_drakon_schema_c0(self):
        """Validates that the generated DRAKON admissibility tree satisfies C=0 and skewer X=0."""
        engine = AdmissibilityEngine()
        drakon = engine.generate_planar_drakon_tree()

        assert drakon["invariant_c0_satisfied"] is True
        assert drakon["crossings_count"] == 0
        assert drakon["skewer_x"] == 0
        assert drakon["degradation_x"] == 240
        assert len(drakon["nodes"]) >= 6
        assert len(drakon["edges"]) >= 8

    def test_sha256_invariant_l05_enforcement(self):
        """Validates that missing or truncated SHA-256 seal is rejected (Invariant L-05)."""
        engine = AdmissibilityEngine()
        with pytest.raises(ValueError) as excinfo:
            engine.evaluate_recording(
                evidence_id="DRAWER-FAIL",
                filename="invalid.mp3",
                sha256_hash="invalid_short_hash",
                text_content="content"
            )
        assert "Invariant L-05" in str(excinfo.value)

    def test_batch_corpus_evaluation(self):
        """Validates evaluation across the 61 parsed transcripts."""
        engine = AdmissibilityEngine()
        transcripts = parse_61_transcripts()
        assert len(transcripts) == 61

        batch_result = engine.evaluate_batch(transcripts)
        assert batch_result["total_evaluated"] == 61
        assert batch_result["admissible_atf_146_iv_9"] >= 55
        assert batch_result["admissibility_rate"] >= 0.90
