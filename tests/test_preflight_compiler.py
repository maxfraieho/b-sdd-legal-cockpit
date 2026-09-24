"""
Unit and Invariant Tests for B-SDD-LEGAL Pre-Flight Context Compiler.
Validates:
- ADR-002 / Invariant L-02: Pure Python Standard Library in src/legal/preflight_compiler.py
- Invariant L-03: Strict Bona Fide Shield & Sanitized Procedural Statuses
- Invariant L-01 & L-04: Utopia Contradiction Reconciliation & Timeline Conflict Detection
- Performance Benchmark: Deterministic execution time < 20 ms
- Budget Constraint: Output length <= 500 words
"""
import ast
import os
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src.legal.actors import ProceduralStatus, create_swiss_benchmark_matrix
from src.legal.timeline_calibrator import create_swiss_benchmark_timeline
from src.legal.preflight_compiler import LegalPreflightCompiler, LegalSnapshot


class TestPreflightCompiler(unittest.TestCase):
    def setUp(self):
        self.compiler = LegalPreflightCompiler()

    def test_pure_stdlib_in_preflight_compiler(self):
        """Invariant L-02: Compiler module must use 100% Python standard library."""
        compiler_path = ROOT / "src" / "legal" / "preflight_compiler.py"
        stdlib_modules = set(sys.stdlib_module_names) if hasattr(sys, "stdlib_module_names") else {
            "os", "sys", "re", "json", "time", "sqlite3", "hashlib", "pathlib", "typing",
            "subprocess", "logging", "datetime", "uuid", "argparse", "unittest", "shutil",
            "tempfile", "functools", "itertools", "collections", "abc", "contextlib", "dataclasses", "enum", "math"
        }
        internal_pkgs = {"src"}

        with open(compiler_path, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read(), filename=str(compiler_path))

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    root_mod = alias.name.split(".")[0]
                    self.assertTrue(
                        root_mod in stdlib_modules or root_mod in internal_pkgs,
                        f"External dependency '{alias.name}' detected in {compiler_path.name}",
                    )
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    root_mod = node.module.split(".")[0]
                    self.assertTrue(
                        root_mod in stdlib_modules or root_mod in internal_pkgs,
                        f"External from-import '{node.module}' detected in {compiler_path.name}",
                    )

    def test_preflight_compiler_execution_and_budget(self):
        """Validates execution budget: < 20 ms (cached) and <= 500 words."""
        # Warmup cache
        _ = self.compiler.compile(max_words=500, use_live_db=False)

        # Benchmark run
        snapshot = self.compiler.compile(max_words=500, use_live_db=False)

        self.assertIsInstance(snapshot, LegalSnapshot)
        self.assertLess(snapshot.word_count, 500, f"Word count {snapshot.word_count} exceeds 500 budget")
        self.assertLess(snapshot.execution_ms, 20.0, f"Execution time {snapshot.execution_ms} ms exceeds 20 ms limit")
        self.assertGreaterEqual(snapshot.parties_count, 6)
        self.assertGreaterEqual(snapshot.contradictions_count, 4)

    def test_invariant_l03_immunity_shield_in_compiler(self):
        """Invariant L-03: Jean-Paul Vernon must be protected; tampering must raise RuntimeError."""
        snapshot = self.compiler.compile(use_live_db=False)
        self.assertIn("Jean-Paul VERNON", snapshot.summary_text)
        self.assertIn("bona_fide_protection=True", snapshot.summary_text)
        self.assertIn("Alexandre DUBOIS (Art. 122 CPP, minor b.2012)", snapshot.summary_text)

        # Tampering test: removing Vernon's protection must fail fast
        matrix = create_swiss_benchmark_matrix()
        third_party = matrix.get_actor("ACT-BONA-FIDE-THIRD-PARTY")
        third_party.bona_fide_protection = False
        bad_compiler = LegalPreflightCompiler(actor_matrix=matrix)

        with self.assertRaises(RuntimeError) as ctx:
            bad_compiler.compile()
        self.assertIn("CRITICAL INVARIANT VIOLATION", str(ctx.exception))

    def test_utopia_bitemporal_contradictions_present(self):
        """Invariant L-01 & L-04: Utopia F_1..F_4 contradiction matrix must be encoded."""
        snapshot = self.compiler.compile(use_live_db=False)
        self.assertIn("F_1", snapshot.summary_text)
        self.assertIn("F_2", snapshot.summary_text)
        self.assertIn("F_3", snapshot.summary_text)
        self.assertIn("F_4", snapshot.summary_text)
        self.assertIn("Art. 303/304 CP", snapshot.summary_text)
        self.assertIn("MENS REA", snapshot.summary_text)


if __name__ == "__main__":
    unittest.main()
