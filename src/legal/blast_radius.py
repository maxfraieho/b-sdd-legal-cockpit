"""
Legal Blast Radius Engine (src/legal/blast_radius.py).
Pure Python Standard Library (100% Pure Stdlib Python 3.11+, Invariant L-02).

Performs multidimensional legal impact analysis:
  1. Spatial Graph Traversal across MemPalace (Wings, Halls, Rooms, Drawers).
  2. Bitemporal Prescription Analysis under Swiss Criminal Code (Art. 97 CP: 10 vs 15 yrs, Art. 109 CP: 3 yrs).
  3. Dynamic Recalculation of Corroboration Matrix (ALLEG-01 .. ALLEG-04).
  4. Procedural 10-day Appeal Deadline Control under Swiss CPP (Art. 393 / 396 CPP).
  5. Strict enforcement of Invariant L-03 (Bona Fide Intermediary Flag) and L-04 (Adult Victim Standing).
"""

from collections import deque
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from enum import Enum
import json
from typing import Dict, List, Optional, Any, Union, Set


class SeverityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ImpactType(str, Enum):
    PRESCRIPTION_ALTERED = "PRESCRIPTION_ALTERED"
    CORROBORATION_SHIFT = "CORROBORATION_SHIFT"
    STATUTE_REQUALIFIED = "STATUTE_REQUALIFIED"
    EVIDENTIARY_SEAL = "EVIDENTIARY_SEAL"
    PROCEDURAL_TIMELINE = "PROCEDURAL_TIMELINE"
    INVARIANT_BREACH = "INVARIANT_BREACH"
    SPATIAL_PROPAGATION = "SPATIAL_PROPAGATION"


@dataclass
class BlastRadiusImpact:
    """A single impacted node in the legal graph."""
    node_id: str
    node_type: str
    distance: int
    impact_type: ImpactType
    severity: SeverityLevel
    details: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "node_type": self.node_type,
            "distance": self.distance,
            "impact_type": self.impact_type.value,
            "severity": self.severity.value,
            "details": self.details,
        }


@dataclass
class PrescriptionResult:
    """Result of statutory limitation calculation under Art. 97 / 109 CP."""
    statute_id: str
    statute_name: str
    statutory_limit_years: int
    event_date: str
    prescription_date: str
    limitation_note: str
    is_expired: bool
    risk_level: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class AllegationCorroboration:
    """Dynamically evaluated corroboration score for an accusation."""
    allegation_id: str
    title: str
    baseline_score: float
    recalculated_score: float
    delta_score: float
    status: str
    active_evidence_count: int

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ManualDeadlineEntry:
    """Manual procedural deadline record under Swiss CPP (T4: no automatic computation or countdown)."""
    deadline_at: str                                    # Entered deadline date string (manual data)
    # UNVERIFIED — pending legal audit: Art. 393 vs Art. 396 citation mapping to be confirmed with qualified Swiss counsel.
    # Note: Art. 393 CPP governs admissibility of recours; Art. 396 al. 1 CPP governs form and 10-day time limit.
    legal_basis: str = "Art. 396 al. 1 CPP"            # Legal basis citation
    computation_note: str = ""                          # Operator / lawyer annotation
    source_document: str = ""                           # Vault item hash / reference
    entered_by: str = "operator"                        # Recorded identifier
    verified_by_lawyer: int = 0                         # Default 0 (unverified)
    display_label: str = "manual entry — not computed"  # Mandatory non-computed label
    origin: str = "manual"                              # "manual" | "computed"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class BlastRadiusReport:
    """Comprehensive multidimensional blast radius evaluation report."""
    entity_id: str
    delta: Dict[str, Any]
    timestamp: str
    overall_severity: SeverityLevel
    direct_impacts: List[BlastRadiusImpact] = field(default_factory=list)
    indirect_impacts: List[BlastRadiusImpact] = field(default_factory=list)
    prescription_analysis: List[PrescriptionResult] = field(default_factory=list)
    corroboration_matrix: Dict[str, AllegationCorroboration] = field(default_factory=dict)
    manual_deadline: Optional[ManualDeadlineEntry] = None
    invariant_violations: List[str] = field(default_factory=list)
    total_nodes_affected: int = 0
    summary: str = ""

    @property
    def appeal_deadline_393(self) -> Optional[ManualDeadlineEntry]:
        return self.manual_deadline

    def to_dict(self) -> Dict[str, Any]:
        return {
            "entity_id": self.entity_id,
            "delta": self.delta,
            "timestamp": self.timestamp,
            "overall_severity": self.overall_severity.value,
            "total_nodes_affected": self.total_nodes_affected,
            "direct_impacts": [i.to_dict() for i in self.direct_impacts],
            "indirect_impacts": [i.to_dict() for i in self.indirect_impacts],
            "prescription_analysis": [p.to_dict() for p in self.prescription_analysis],
            "corroboration_matrix": {k: v.to_dict() for k, v in self.corroboration_matrix.items()},
            "manual_deadline": self.manual_deadline.to_dict() if self.manual_deadline else None,
            "appeal_deadline_393": self.manual_deadline.to_dict() if self.manual_deadline else None,
            "invariant_violations": self.invariant_violations,
            "summary": self.summary,
        }

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent, ensure_ascii=False)


# Default Canonical Legal Topology (Pure Stdlib Fallback & Routing)
DEFAULT_GRAPH_TOPOLOGY = {
    "wings": {
        "WING-VICTIMS": ["HALL-EVIDENCE", "HALL-PROCEDURE"],
        "WING-PROSECUTION": ["HALL-EVIDENCE", "HALL-STATUTES"],
        "WING-STATE-LIABILITY": ["HALL-STATUTES", "HALL-PROCEDURE"],
    },
    "halls": {
        "HALL-EVIDENCE": ["ROOM-180-181-CP", "ROOM-146-CP", "ROOM-138-CP", "ROOM-157-CP", "ROOM-139-141-CPP"],
        "HALL-STATUTES": ["ROOM-180-181-CP", "ROOM-146-CP", "ROOM-138-CP", "ROOM-157-CP"],
        "HALL-PROCEDURE": ["ROOM-139-141-CPP"],
    },
    "rooms": {
        "ROOM-180-181-CP": {
            "statutes": ["STAT-180-CP", "STAT-181-CP"],
            "actors": ["ACT-LIUBOV-SUVOROVA", "ACT-HANNA-SUVOROVA", "ACT-ARSEN-KOVALENKO"],
            "allegations": ["ALLEG-01"],
        },
        "ROOM-146-CP": {
            "statutes": ["STAT-146-CP"],
            "actors": ["ACT-LIUBOV-SUVOROVA", "ACT-VOLODYMYR-KOVALENKO"],
            "allegations": ["ALLEG-02"],
        },
        "ROOM-138-CP": {
            "statutes": ["STAT-138-CP"],
            "actors": ["ACT-LIUBOV-SUVOROVA", "ACT-VOLODYMYR-KOVALENKO"],
            "allegations": ["ALLEG-02"],
        },
        "ROOM-157-CP": {
            "statutes": ["STAT-157-CP", "STAT-118-LEI"],
            "actors": ["ACT-LIUBOV-SUVOROVA", "ACT-ARSEN-KOVALENKO", "ACT-EVAM"],
            "allegations": ["ALLEG-02", "ALLEG-04"],
        },
        "ROOM-139-141-CPP": {
            "statutes": ["STAT-393-CPP"],
            "actors": ["ACT-ADRIANO-MILLI", "ACT-ARSEN-KOVALENKO"],
            "allegations": ["ALLEG-01", "ALLEG-03"],
        },
    },
    "allegations": {
        "ALLEG-01": {"title": "Instigation aux lésions corporelles, menaces et contrainte", "baseline": 1.0, "evidence_count": 951},
        "ALLEG-02": {"title": "Usure / Abus de détresse et Escroquerie ($15'000 USD)", "baseline": 0.8, "evidence_count": 393},
        "ALLEG-03": {"title": "Lésions corporelles simples, contrainte et fausses déclarations", "baseline": 1.0, "evidence_count": 785},
        "ALLEG-04": {"title": "Responsabilité de l'État pour omission illicite (EVAM)", "baseline": 0.8, "evidence_count": 725},
    },
    "statutes": {
        "STAT-146-CP": {"name": "Art. 146 CP (Escroquerie)", "limit_years": 15},
        "STAT-138-CP": {"name": "Art. 138 CP (Abus de confiance)", "limit_years": 10},
        "STAT-180-CP": {"name": "Art. 180 CP (Menaces qualifiées)", "limit_years": 10},
        "STAT-181-CP": {"name": "Art. 181 CP (Contrainte)", "limit_years": 10},
        "STAT-157-CP": {"name": "Art. 157 CP (Usure)", "limit_years": 15},
        "STAT-123-CP": {"name": "Art. 123 CP (Lésions corporelles simples)", "limit_years": 10},
        "STAT-126-CP": {"name": "Art. 126 CP (Voies de fait)", "limit_years": 3},
        "STAT-186-CP": {"name": "Art. 186 CP (Violation de domicile)", "limit_years": 10},
        "STAT-118-LEI": {"name": "Art. 118 LEI (Fraude aux prestations)", "limit_years": 15},
    }
}


def _parse_iso_date(date_str: str) -> datetime:
    """Parses ISO date string or common formats safely."""
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S%z", "%d.%m.%Y"):
        try:
            dt = datetime.strptime(date_str.split("T")[0] if "T" in date_str and fmt == "%Y-%m-%d" else date_str, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except ValueError:
            pass
    return datetime.now(timezone.utc)


def calculate_blast_radius(
    entity_id: str,
    delta: Dict[str, Any],
    graph: Optional[Dict[str, Any]] = None,
    reference_date: Optional[str] = None
) -> BlastRadiusReport:
    """
    Computes the legal blast radius triggered by a calibration, evidence update,
    or procedural event on `entity_id`.

    100% Pure Python Standard Library implementation (Invariant L-02).
    """
    ref_dt = _parse_iso_date(reference_date) if reference_date else datetime.now(timezone.utc)
    timestamp = datetime.now(timezone.utc).isoformat()
    topology = graph or DEFAULT_GRAPH_TOPOLOGY

    invariant_violations: List[str] = []
    direct_impacts: List[BlastRadiusImpact] = []
    indirect_impacts: List[BlastRadiusImpact] = []
    prescription_results: List[PrescriptionResult] = []
    corroboration_matrix: Dict[str, AllegationCorroboration] = {}
    appeal_deadline: Optional[AppealDeadline393] = None
    overall_severity = SeverityLevel.LOW

    # =========================================================================
    # 1. INVARIANT CHECKS (L-03 and L-04)
    # =========================================================================
    # Invariant L-03: Adriano MILLI Bona Fide Shield
    if entity_id == "ACT-ADRIANO-MILLI" or "adriano" in str(delta).lower():
        role = delta.get("role", "").lower()
        if role in ["prevenu", "accuse", "auteur", "complice"] or delta.get("criminal_liability") is True:
            msg = "Invariant L-03 Violation: Adriano MILLI possesses absolute bona fide third-party protection (bona_fide_protection=True). Criminal accusatory drift prohibited."
            invariant_violations.append(msg)
            overall_severity = SeverityLevel.CRITICAL
            direct_impacts.append(BlastRadiusImpact(
                node_id="ACT-ADRIANO-MILLI",
                node_type="Actor",
                distance=1,
                impact_type=ImpactType.INVARIANT_BREACH,
                severity=SeverityLevel.CRITICAL,
                details={"violation": "BONA_FIDE_SHIELD_BREACH", "attempted_delta": delta}
            ))

    # Invariant L-04: Adult Victim Standing (PARTY-L04)
    if entity_id == "ACT-ARSEN-KOVALENKO" or "arsen" in str(delta).lower():
        role = delta.get("role", "").lower()
        if role in ["prevenu", "accuse", "auteur"] or "219" in str(delta):
            msg = "Invariant L-04 Violation: PARTY-L04 has exclusive standing as adult victim / civil complainant. Drift to prévenu or minor-related offense (Art. 219 CP) strictly barred."
            invariant_violations.append(msg)
            overall_severity = SeverityLevel.CRITICAL
            direct_impacts.append(BlastRadiusImpact(
                node_id="ACT-ARSEN-KOVALENKO",
                node_type="Actor",
                distance=1,
                impact_type=ImpactType.INVARIANT_BREACH,
                severity=SeverityLevel.CRITICAL,
                details={"violation": "ADULT_VICTIM_STANDING_BREACH", "attempted_delta": delta}
            ))

    # =========================================================================
    # 2. BITEMPORAL PRESCRIPTION ANALYSIS (Art. 97 & 109 CP)
    # =========================================================================
    # Triggered if delta contains event time Tv, event_date, or prescription test
    event_date_str = delta.get("t_v") or delta.get("event_date") or delta.get("date_infraction")
    if event_date_str:
        event_dt = _parse_iso_date(event_date_str)
        statutes_to_check = topology.get("statutes", DEFAULT_GRAPH_TOPOLOGY["statutes"])

        for stat_id, sinfo in statutes_to_check.items():
            limit_yrs = sinfo["limit_years"]
            if limit_yrs <= 0:
                continue

            # Swiss CP Art. 97: statutory limitation computed in calendar years, not arbitrary day fractions
            try:
                expiry_dt = event_dt.replace(year=event_dt.year + limit_yrs)
            except ValueError:
                # Handle leap year edge case (Feb 29 -> Feb 28)
                expiry_dt = event_dt.replace(year=event_dt.year + limit_yrs, day=28)

            is_expired = expiry_dt < ref_dt
            note = f"Prescription légale: {limit_yrs} ans dès le {event_dt.strftime('%Y-%m-%d')} (échéance civile: {expiry_dt.strftime('%Y-%m-%d')})"

            years_to_expiry = expiry_dt.year - ref_dt.year
            if is_expired:
                risk = "EXPIRED"
                if overall_severity != SeverityLevel.CRITICAL:
                    overall_severity = SeverityLevel.HIGH
            elif years_to_expiry <= 1:
                risk = "CRITICAL"
                if overall_severity not in (SeverityLevel.HIGH, SeverityLevel.CRITICAL):
                    overall_severity = SeverityLevel.HIGH
            elif years_to_expiry <= 3:
                risk = "ELEVATED"
                if overall_severity == SeverityLevel.LOW:
                    overall_severity = SeverityLevel.MEDIUM
            else:
                risk = "SAFE"

            res = PrescriptionResult(
                statute_id=stat_id,
                statute_name=sinfo["name"],
                statutory_limit_years=limit_yrs,
                event_date=event_dt.strftime("%Y-%m-%d"),
                prescription_date=expiry_dt.strftime("%Y-%m-%d"),
                limitation_note=note,
                is_expired=is_expired,
                risk_level=risk
            )
            prescription_results.append(res)

            # Record blast impact on the statute node
            direct_impacts.append(BlastRadiusImpact(
                node_id=stat_id,
                node_type="Statute",
                distance=1,
                impact_type=ImpactType.PRESCRIPTION_ALTERED,
                severity=SeverityLevel.HIGH if is_expired or risk == "CRITICAL" else SeverityLevel.MEDIUM,
                details={"statute": sinfo["name"], "limitation_note": note, "risk": risk}
            ))

    # =========================================================================
    # 3. DYNAMIC CORROBORATION MATRIX RECALCULATION (ALLEG-01 .. ALLEG-04)
    # =========================================================================
    allegations_info = topology.get("allegations", DEFAULT_GRAPH_TOPOLOGY["allegations"])
    evidence_weight_delta = delta.get("weight_delta", 0.0)
    evidence_status = delta.get("admissibility", "")
    target_allegation = delta.get("allegation_id")

    for al_id, al_data in allegations_info.items():
        base = al_data["baseline"]
        ev_count = al_data["evidence_count"]
        recalc = base
        d_score = 0.0

        if target_allegation == al_id or target_allegation is None:
            # If evidence is excluded under Art. 141 CPP
            if evidence_status in ("EXCLUDED", "INADMISSIBLE", "REJECTED"):
                recalc = max(0.2, base - 0.25)
                d_score = recalc - base
            elif evidence_status in ("ADMISSIBLE_ATF_146_IV_9", "CORROBORATED"):
                recalc = min(1.0, base + 0.1)
                d_score = recalc - base
            elif evidence_weight_delta != 0.0:
                recalc = max(0.0, min(1.0, base + evidence_weight_delta))
                d_score = recalc - base

        # Determine legal threshold
        if recalc >= 0.8:
            status_text = "ACCUSATION_PLEINEMENT_CORROBOREE"
        elif recalc >= 0.5:
            status_text = "ACCUSATION_MOYENNEMENT_CORROBOREE"
        else:
            status_text = "CORROBORATION_INSUFFISANTE"

        corroboration_matrix[al_id] = AllegationCorroboration(
            allegation_id=al_id,
            title=al_data["title"],
            baseline_score=base,
            recalculated_score=round(recalc, 3),
            delta_score=round(d_score, 3),
            status=status_text,
            active_evidence_count=ev_count
        )

        if abs(d_score) > 0.05:
            indirect_impacts.append(BlastRadiusImpact(
                node_id=al_id,
                node_type="Allegation",
                distance=2,
                impact_type=ImpactType.CORROBORATION_SHIFT,
                severity=SeverityLevel.HIGH if recalc < 0.8 else SeverityLevel.MEDIUM,
                details={"delta_score": round(d_score, 3), "new_score": round(recalc, 3)}
            ))

    # =========================================================================
    # 4. PROCEDURAL DEADLINE (MANUAL ENTRY ONLY — NO AUTOMATIC COMPUTATION / COUNTDOWN)
    # =========================================================================
    manual_deadline: Optional[ManualDeadlineEntry] = None
    if "deadline_at" in delta or delta.get("procedural_action") in ("recours_393", "procedural_deadline"):
        manual_deadline = ManualDeadlineEntry(
            deadline_at=str(delta.get("deadline_at", "")),
            legal_basis=str(delta.get("legal_basis", "Art. 396 al. 1 CPP")),
            computation_note=str(delta.get("computation_note", "")),
            source_document=str(delta.get("source_document", "")),
            entered_by=str(delta.get("entered_by", "operator")),
            verified_by_lawyer=int(delta.get("verified_by_lawyer", 0)),
            display_label="manual entry — not computed",
            origin=str(delta.get("origin", "manual"))
        )
        direct_impacts.append(BlastRadiusImpact(
            node_id="PROC-RECOURS-393-CPP",
            node_type="ProceduralAct",
            distance=1,
            impact_type=ImpactType.PROCEDURAL_TIMELINE,
            severity=SeverityLevel.LOW if manual_deadline.verified_by_lawyer else SeverityLevel.MEDIUM,
            details={
                "deadline_at": manual_deadline.deadline_at,
                "display_label": manual_deadline.display_label,
                "verified_by_lawyer": manual_deadline.verified_by_lawyer,
                "legal_basis": manual_deadline.legal_basis
            }
        ))

    # =========================================================================
    # 5. SPATIAL GRAPH TRAVERSAL (BFS Blast Propagation)
    # =========================================================================
    visited: Set[str] = {entity_id}
    queue = deque([(entity_id, 0)])

    # Construct adjacency list from topology
    adj: Dict[str, List[str]] = {}
    def add_edge(u: str, v: str):
        adj.setdefault(u, []).append(v)
        adj.setdefault(v, []).append(u)

    for w, halls in topology.get("wings", {}).items():
        for h in halls:
            add_edge(w, h)
    for h, rooms in topology.get("halls", {}).items():
        for r in rooms:
            add_edge(h, r)
    for r, rdata in topology.get("rooms", {}).items():
        for s in rdata.get("statutes", []):
            add_edge(r, s)
        for a in rdata.get("actors", []):
            add_edge(r, a)
        for al in rdata.get("allegations", []):
            add_edge(r, al)

    # Perform BFS up to depth 3
    while queue:
        curr, dist = queue.popleft()
        if dist >= 3:
            continue

        for neighbor in adj.get(curr, []):
            if neighbor not in visited:
                visited.add(neighbor)
                next_dist = dist + 1
                
                # Deduce node type
                if neighbor.startswith("WING-"):
                    ntype = "Wing"
                elif neighbor.startswith("HALL-"):
                    ntype = "Hall"
                elif neighbor.startswith("ROOM-"):
                    ntype = "Room"
                elif neighbor.startswith("ACT-"):
                    ntype = "Actor"
                elif neighbor.startswith("STAT-"):
                    ntype = "Statute"
                elif neighbor.startswith("ALLEG-"):
                    ntype = "Allegation"
                else:
                    ntype = "SpatialNode"

                impact = BlastRadiusImpact(
                    node_id=neighbor,
                    node_type=ntype,
                    distance=next_dist,
                    impact_type=ImpactType.SPATIAL_PROPAGATION,
                    severity=SeverityLevel.LOW if next_dist == 3 else SeverityLevel.MEDIUM,
                    details={"propagated_from": curr}
                )

                if next_dist == 1:
                    # Avoid duplicate if already logged
                    if not any(i.node_id == neighbor for i in direct_impacts):
                        direct_impacts.append(impact)
                else:
                    if not any(i.node_id == neighbor for i in indirect_impacts):
                        indirect_impacts.append(impact)

                queue.append((neighbor, next_dist))

    # Total nodes affected
    all_affected = set([i.node_id for i in direct_impacts] + [i.node_id for i in indirect_impacts])
    total_affected = len(all_affected)

    # Generate synthesis summary
    summary_parts = [
        f"Blast radius analysis completed for entity '{entity_id}'.",
        f"Total affected nodes: {total_affected} across graph distance 1 to 3.",
        f"Overall assessment severity: {overall_severity.value}."
    ]
    if invariant_violations:
        summary_parts.append(f"CRITICAL: {len(invariant_violations)} invariant violation(s) detected: {'; '.join(invariant_violations)}")
    if prescription_results:
        exp = [p.statute_id for p in prescription_results if p.is_expired]
        if exp:
            summary_parts.append(f"Prescription WARNING: Statutes expired: {', '.join(exp)}.")
        else:
            summary_parts.append(f"Statutory limitation verified active across all {len(prescription_results)} tested criminal provisions.")
    if manual_deadline:
        summary_parts.append(
            f"Procedural deadline ({manual_deadline.legal_basis}): {manual_deadline.deadline_at or 'not recorded'} "
            f"[{manual_deadline.display_label}, verified_by_lawyer={manual_deadline.verified_by_lawyer}]."
        )

    return BlastRadiusReport(
        entity_id=entity_id,
        delta=delta,
        timestamp=timestamp,
        overall_severity=overall_severity,
        direct_impacts=direct_impacts,
        indirect_impacts=indirect_impacts,
        prescription_analysis=prescription_results,
        corroboration_matrix=corroboration_matrix,
        manual_deadline=manual_deadline,
        invariant_violations=invariant_violations,
        total_nodes_affected=total_affected,
        summary=" ".join(summary_parts)
    )
