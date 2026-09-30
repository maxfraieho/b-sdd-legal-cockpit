"""
DRAKON Procedural Flow & Planar Topology Generator (Sprint 003).
Constructs the canonical Swiss Vaud criminal & civil procedural flow:
Plainte pénale -> Partie plaignante (Art. 118 CPP) -> Séquestre $15'000 USD / 46'850 CHF (Art. 263 CPP) -> Renvoi en jugement.

Enforces:
- ADR-002: 100% Pure Python Standard Library (Invariant L-02).
- ADR-008: Planar Invariants: Skewer strictly on X = 0, C = 0 line crossings, Right-is-worse (X > 0).
"""
from dataclasses import dataclass
from pathlib import Path
import sys
from typing import Any, Dict, List, Optional, Tuple

# Ensure project root is on sys.path
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


def build_vaud_procedural_drakon_schema() -> DrakonSchema:
    """
    Constructs the canonical procedural DRAKON schema for Swiss criminal proceedings:
    Vertical Skewer (X=0, C=0):
    1. Plainte pénale (Art. 301 CPP)
    2. Partie plaignante (Art. 118 CPP)
    3. Séquestre $15'000 USD / 46'850 CHF (Art. 263 CPP)
    4. Renvoi en jugement (Art. 324 CPP)
    5. Jugement pénal & Réparation civile (Art. 346 CPP, Art. 41/47/49 CO)

    Alternative Right Branches (X > 0, Right-is-worse):
    - Dénonciation simple sans constitution de partie civile -> Risque de classement
    - Recours Art. 393 CPP en cas de refus de séquestre
    """
    nodes: Dict[str, DrakonNode] = {
        # Main Skewer Nodes (X = 0)
        "plainte_penale": DrakonNode(
            node_id="plainte_penale",
            node_type=DrakonNodeType.HEADLINE.value,
            label="Plainte pénale (Art. 301 CPP)",
            edges=DrakonEdges(down="partie_plaignante")
        ),
        "partie_plaignante": DrakonNode(
            node_id="partie_plaignante",
            node_type=DrakonNodeType.QUESTION.value,
            label="Déclaration Partie Plaignante (Art. 118 CPP)?",
            edges=DrakonEdges(down="sequestre_fonds", right="denonciation_simple")
        ),
        "sequestre_fonds": DrakonNode(
            node_id="sequestre_fonds",
            node_type=DrakonNodeType.QUESTION.value,
            label="Séquestre $15'000 USD / 46'850 CHF (Art. 263 CPP)?",
            edges=DrakonEdges(down="renvoi_jugement", right="recours_sequestre")
        ),
        "renvoi_jugement": DrakonNode(
            node_id="renvoi_jugement",
            node_type=DrakonNodeType.ACTION.value,
            label="Renvoi en jugement (Art. 324 CPP)",
            edges=DrakonEdges(down="jugement_condamnation")
        ),
        "jugement_condamnation": DrakonNode(
            node_id="jugement_condamnation",
            node_type=DrakonNodeType.END.value,
            label="Condamnation & Réparation (Art. 346 CPP, Art. 41/47/49 CO)"
        ),

        # Right-is-worse alternative branches (X > 0)
        "denonciation_simple": DrakonNode(
            node_id="denonciation_simple",
            node_type=DrakonNodeType.ACTION.value,
            label="Dénonciation simple (sans qualité de partie plaignante)",
            edges=DrakonEdges(down="end_classement")
        ),
        "end_classement": DrakonNode(
            node_id="end_classement",
            node_type=DrakonNodeType.END.value,
            label="Ordonnance de classement sans indemnisation (Art. 319 CPP)"
        ),
        # UNVERIFIED — pending legal audit: Art. 393 vs Art. 396 citation mapping to be confirmed with qualified Swiss counsel.
        # Distinction: Art. 393 CPP establishes admissibility of recours; Art. 396 al. 1 CPP governs written form and 10-day deadline.
        "recours_sequestre": DrakonNode(
            node_id="recours_sequestre",
            node_type=DrakonNodeType.ACTION.value,
            label="Recours sous 10 jours (Art. 393 al. 1 let. a / Art. 396 al. 1 CPP)",
            edges=DrakonEdges(down="end_recours")
        ),
        "end_recours": DrakonNode(
            node_id="end_recours",
            node_type=DrakonNodeType.END.value,
            label="Arrêt Chambre des recours pénale (Tribunal cantonal)"
        ),
    }

    return DrakonSchema(
        name="Procédure Pénale et Réparation Civile Vaud",
        nodes=nodes,
        meta={"description": "Topologie planaire DRAKON du шампур procédural suisse (CPP/CP/CO)"}
    )


def solve_vaud_procedural_topology(skewer_x: float = 0.0) -> PlanarLayoutResult:
    """
    Computes and verifies planar topology for the Vaud criminal procedural flow.
    Guarantees:
    - is_planar == True
    - crossings_count == 0 (C = 0)
    - skewer nodes strictly along X = 0
    - alternative branches strictly to the right (X > 0)
    """
    schema = build_vaud_procedural_drakon_schema()
    solver = DrakonPlanarSolver(col_width=220.0, row_height=90.0, skewer_x=skewer_x)
    result = solver.solve(schema)

    # Invariant assertions
    if not result.is_planar:
        raise ValueError("Planarity violation in procedural topology!")
    if result.crossings_count != 0:
        raise ValueError(f"Crossings detected (C={result.crossings_count}) in planar flow!")

    skewer_node_ids = [
        "plainte_penale",
        "partie_plaignante",
        "sequestre_fonds",
        "renvoi_jugement",
        "jugement_condamnation"
    ]
    for nid in skewer_node_ids:
        x, y = result.node_positions[nid]
        if abs(x - skewer_x) > 1e-4:
            raise ValueError(f"Skewer node '{nid}' deviates from X={skewer_x}: x={x}")

    for nid in ["denonciation_simple", "end_classement", "recours_sequestre", "end_recours"]:
        x, y = result.node_positions[nid]
        if x <= skewer_x:
            raise ValueError(f"Alternative node '{nid}' not to the right: x={x} <= {skewer_x}")

    return result


def export_procedural_flow_summary() -> Dict[str, Any]:
    """Generates structured execution metrics for the procedural DRAKON topology."""
    res = solve_vaud_procedural_topology()
    return {
        "status": "VALIDATED",
        "diagram_name": res.schema.name,
        "is_planar": res.is_planar,
        "crossings_count": res.crossings_count,
        "skewer_x": res.skewer_x,
        "nodes_count": len(res.node_positions),
        "edges_count": len(res.edge_routes),
        "skewer_sequence": [
            "Plainte pénale (Art. 301 CPP)",
            "Partie plaignante (Art. 118 CPP)",
            "Séquestre $15'000 USD / 46'850 CHF (Art. 263 CPP)",
            "Renvoi en jugement (Art. 324 CPP)",
            "Condamnation & Réparation (Art. 346 CPP, Art. 41/47/49 CO)"
        ],
        "node_positions": {k: list(v) for k, v in res.node_positions.items()}
    }


def main():
    summary = export_procedural_flow_summary()
    print("=== DRAKON PROCEDURAL TOPOLOGY VALIDATION ===")
    print(f"Diagram: {summary['diagram_name']}")
    print(f"Planar: {summary['is_planar']} | Crossings: {summary['crossings_count']} (C=0)")
    print(f"Skewer Axis: X={summary['skewer_x']}")
    print(f"Nodes: {summary['nodes_count']} | Edges: {summary['edges_count']}")
    print("\n--- SKEWER SEQUENCE (X=0) ---")
    for idx, step in enumerate(summary["skewer_sequence"], start=1):
        print(f"  {idx}. {step}")


if __name__ == "__main__":
    main()
