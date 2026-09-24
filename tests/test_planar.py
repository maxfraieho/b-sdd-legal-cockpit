"""
Unit test for DRAKON Planar Solver in B-SDD Legal Core.
Validates ADR-002 (Pure Stdlib) & ADR-008 (Planar Invariants: Skewer X=0, Right-is-Worse).
"""
import ast
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src.drakon.types import (
    DrakonSchema,
    DrakonNode,
    DrakonNodeType,
    DrakonEdges,
)
from src.core.drakon.planar_solver import DrakonPlanarSolver, PlanarLayoutResult


class TestDrakonPlanarSolver(unittest.TestCase):
    def test_pure_stdlib_in_planar_solver(self):
        """Invariant ADR-002: planar_solver.py must use 100% Python standard library."""
        solver_file = ROOT / "src" / "core" / "drakon" / "planar_solver.py"
        stdlib_modules = set(sys.stdlib_module_names) if hasattr(sys, "stdlib_module_names") else {
            "os", "sys", "re", "json", "time", "sqlite3", "hashlib", "pathlib", "typing",
            "subprocess", "logging", "datetime", "uuid", "argparse", "unittest", "shutil",
            "tempfile", "functools", "itertools", "collections", "abc", "contextlib", "dataclasses", "enum", "math"
        }
        internal_pkgs = {"src"}

        with open(solver_file, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read(), filename=str(solver_file))

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    root_mod = alias.name.split(".")[0]
                    self.assertTrue(
                        root_mod in stdlib_modules or root_mod in internal_pkgs,
                        f"External dependency '{alias.name}' in {solver_file.name}",
                    )
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    root_mod = node.module.split(".")[0]
                    self.assertTrue(
                        root_mod in stdlib_modules or root_mod in internal_pkgs,
                        f"External from-import '{node.module}' in {solver_file.name}",
                    )

    def test_planar_solver_vertical_skewer(self):
        """Invariant ADR-008: Main success path nodes must lie strictly on vertical skewer X=0."""
        nodes = {
            "start": DrakonNode(node_id="start", node_type=DrakonNodeType.HEADLINE.value, label="Start", edges=DrakonEdges(down="step1")),
            "step1": DrakonNode(node_id="step1", node_type=DrakonNodeType.ACTION.value, label="Step 1", edges=DrakonEdges(down="step2")),
            "step2": DrakonNode(node_id="step2", node_type=DrakonNodeType.ACTION.value, label="Step 2", edges=DrakonEdges(down="end")),
            "end": DrakonNode(node_id="end", node_type=DrakonNodeType.END.value, label="Finish"),
        }
        schema = DrakonSchema(name="Linear Workflow", nodes=nodes)
        solver = DrakonPlanarSolver(skewer_x=0.0)
        result = solver.solve(schema)

        self.assertTrue(result.is_planar)
        self.assertEqual(result.crossings_count, 0)
        self.assertEqual(result.skewer_x, 0.0)

        prev_y = -1.0
        for nid in ["start", "step1", "step2", "end"]:
            x, y = result.node_positions[nid]
            self.assertAlmostEqual(x, 0.0, places=4)
            self.assertGreater(y, prev_y)
            prev_y = y

    def test_planar_solver_right_is_worse(self):
        """Invariant ADR-008: Alternative branches must branch strictly right (X > 0)."""
        nodes = {
            "start": DrakonNode(node_id="start", node_type=DrakonNodeType.HEADLINE.value, label="Start", edges=DrakonEdges(down="check")),
            "check": DrakonNode(node_id="check", node_type=DrakonNodeType.QUESTION.value, label="Is Valid?", edges=DrakonEdges(down="success", right="degrade")),
            "success": DrakonNode(node_id="success", node_type=DrakonNodeType.ACTION.value, label="Proceed Success", edges=DrakonEdges(down="end")),
            "degrade": DrakonNode(node_id="degrade", node_type=DrakonNodeType.ACTION.value, label="Handle Fallback", edges=DrakonEdges(down="end_fail")),
            "end": DrakonNode(node_id="end", node_type=DrakonNodeType.END.value, label="Finish OK"),
            "end_fail": DrakonNode(node_id="end_fail", node_type=DrakonNodeType.END.value, label="Finish Degraded"),
        }
        schema = DrakonSchema(name="Branching Workflow", nodes=nodes)
        solver = DrakonPlanarSolver(skewer_x=0.0)
        result = solver.solve(schema)

        self.assertTrue(result.is_planar)
        self.assertEqual(result.crossings_count, 0)
        degrade_x, _ = result.node_positions["degrade"]
        self.assertGreater(degrade_x, 0.0)


if __name__ == "__main__":
    unittest.main()
