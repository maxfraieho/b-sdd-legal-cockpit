"""
Unit tests for DRAKON Planar Solver & Procedural Flow Runtime (Sprint 003).
Validates ADR-002 (Pure Stdlib Core) & ADR-008 (Planar Invariants: Skewer X=0, C=0, Right-is-Worse).
"""
import ast
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.drakon.types import (
    DrakonSchema,
    DrakonNode,
    DrakonNodeType,
    DrakonEdges,
)
from src.core.drakon.planar_solver import DrakonPlanarSolver, PlanarLayoutResult
from src.legal.drakon_procedural_flow import (
    build_vaud_procedural_drakon_schema,
    solve_vaud_procedural_topology,
    export_procedural_flow_summary,
)


class TestDrakonPlanarSolverAndProceduralFlow(unittest.TestCase):
    def test_pure_stdlib_in_planar_solver_and_flow(self):
        """Invariant ADR-002: solver and procedural flow must use 100% Python standard library."""
        target_files = [
            ROOT / "src" / "drakon" / "planar_solver.py",
            ROOT / "src" / "core" / "drakon" / "planar_solver.py",
            ROOT / "src" / "legal" / "drakon_procedural_flow.py",
        ]
        stdlib_modules = set(sys.stdlib_module_names) if hasattr(sys, "stdlib_module_names") else {
            "os", "sys", "re", "json", "time", "sqlite3", "hashlib", "pathlib", "typing",
            "subprocess", "logging", "datetime", "uuid", "argparse", "unittest", "shutil",
            "tempfile", "functools", "itertools", "collections", "abc", "contextlib", "dataclasses", "enum", "math"
        }
        internal_pkgs = {"src"}

        for tf in target_files:
            if not tf.exists():
                continue
            with open(tf, "r", encoding="utf-8") as f:
                tree = ast.parse(f.read(), filename=str(tf))

            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        root_mod = alias.name.split(".")[0]
                        self.assertTrue(
                            root_mod in stdlib_modules or root_mod in internal_pkgs,
                            f"External dependency '{alias.name}' in {tf.name}",
                        )
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        root_mod = node.module.split(".")[0]
                        self.assertTrue(
                            root_mod in stdlib_modules or root_mod in internal_pkgs,
                            f"External from-import '{node.module}' in {tf.name}",
                        )

    def test_vaud_procedural_skewer_topology_x0_c0(self):
        """Deliverable B: Main procedural skewer Plainte -> Partie Plaignante -> Séquestre -> Renvoi lies on X=0 with C=0."""
        result = solve_vaud_procedural_topology(skewer_x=0.0)

        # Invariant ADR-008: C=0 crossings
        self.assertTrue(result.is_planar)
        self.assertEqual(result.crossings_count, 0)
        self.assertEqual(result.skewer_x, 0.0)

        # Verify main skewer sequence lies strictly on X = 0
        skewer_ids = [
            "plainte_penale",
            "partie_plaignante",
            "sequestre_fonds",
            "renvoi_jugement",
            "jugement_condamnation"
        ]
        prev_y = -1.0
        for nid in skewer_ids:
            self.assertIn(nid, result.node_positions)
            x, y = result.node_positions[nid]
            self.assertAlmostEqual(x, 0.0, places=4, msg=f"Node {nid} not on skewer axis X=0")
            self.assertGreater(y, prev_y, msg=f"Node {nid} Y-coordinate not strictly increasing downwards")
            prev_y = y

    def test_vaud_procedural_right_is_worse_branching(self):
        """Deliverable B: Alternative / recourse branches branch strictly to the right (X > 0)."""
        result = solve_vaud_procedural_topology(skewer_x=0.0)

        right_branch_ids = [
            "denonciation_simple",
            "end_classement",
            "recours_sequestre",
            "end_recours"
        ]
        for nid in right_branch_ids:
            self.assertIn(nid, result.node_positions)
            x, _ = result.node_positions[nid]
            self.assertGreater(x, 0.0, msg=f"Alternative node {nid} not strictly right of skewer (X > 0)")

    def test_export_procedural_flow_summary(self):
        """Deliverable B: Validate structured export summary contains all procedural milestones."""
        summary = export_procedural_flow_summary()
        self.assertEqual(summary["status"], "VALIDATED")
        self.assertTrue(summary["is_planar"])
        self.assertEqual(summary["crossings_count"], 0)
        self.assertEqual(summary["skewer_x"], 0.0)
        self.assertEqual(len(summary["skewer_sequence"]), 5)
        self.assertIn("Plainte pénale", summary["skewer_sequence"][0])
        self.assertIn("Partie plaignante", summary["skewer_sequence"][1])
        self.assertIn("Séquestre", summary["skewer_sequence"][2])
        self.assertIn("Renvoi en jugement", summary["skewer_sequence"][3])


if __name__ == "__main__":
    unittest.main()
