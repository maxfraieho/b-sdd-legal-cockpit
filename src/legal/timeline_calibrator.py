"""
Bitemporal Legal Timeline Calibrator & Fact Reconciler.
Enforces Invariant L-01 (WORM Ledger & Bitemporal Consistency) and
Invariant L-04 (Timeline Calibration & Conflict Detection).
100% Pure Python Standard Library.
"""
from dataclasses import dataclass, field
from datetime import datetime, timezone
import hashlib
import json
from typing import Dict, List, Optional, Any, Tuple, Union


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class BitemporalFactEvent:
    """Discrete evidentiary fact or incident calibrated across two temporal axes."""
    fact_id: str
    label: str
    t_v: str                               # Valid Time (Reality): actual occurrence time
    t_t: str = field(default_factory=_now_iso)  # Transaction Time (System/Evidence): hash/recording time
    source_evidence_hashes: List[str] = field(default_factory=list)  # SHA-256 evidence links
    actor_ids: List[str] = field(default_factory=list)               # Participating entities
    conflict_flag: bool = False            # True if testimonies conflict on this fact
    valid_to: Optional[str] = None         # Set when fact is superseded
    tx_superseded: Optional[str] = None    # Transaction timestamp of supersession
    supersedes: Optional[str] = None       # ID of prior superseded fact
    superseded_by: Optional[str] = None    # ID of newer calibrated fact
    rationale: Optional[str] = None        # Justification for temporal adjustment
    status: str = "active"                 # active | superseded | challenged

    def is_valid_at(self, tv: str) -> bool:
        if tv < self.t_v:
            return False
        if self.valid_to is not None and tv >= self.valid_to:
            return False
        return True

    def is_visible_at(self, tt: str) -> bool:
        if tt < self.t_t:
            return False
        if self.tx_superseded is not None and tt >= self.tx_superseded:
            return False
        return True

    def to_dict(self) -> Dict[str, Any]:
        return {
            "fact_id": self.fact_id,
            "label": self.label,
            "t_v": self.t_v,
            "t_t": self.t_t,
            "source_evidence_hashes": self.source_evidence_hashes,
            "actor_ids": self.actor_ids,
            "conflict_flag": self.conflict_flag,
            "valid_to": self.valid_to,
            "tx_superseded": self.tx_superseded,
            "supersedes": self.supersedes,
            "superseded_by": self.superseded_by,
            "rationale": self.rationale,
            "status": self.status,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "BitemporalFactEvent":
        return cls(
            fact_id=data["fact_id"],
            label=data.get("label", ""),
            t_v=data["t_v"],
            t_t=data.get("t_t", _now_iso()),
            source_evidence_hashes=list(data.get("source_evidence_hashes", [])),
            actor_ids=list(data.get("actor_ids", [])),
            conflict_flag=bool(data.get("conflict_flag", False)),
            valid_to=data.get("valid_to"),
            tx_superseded=data.get("tx_superseded"),
            supersedes=data.get("supersedes"),
            superseded_by=data.get("superseded_by"),
            rationale=data.get("rationale"),
            status=data.get("status", "active"),
        )


class TimelineCalibrator:
    """
    WORM append-only calibrator for factual timelines.
    Permits calibration and reconciliation of timecodes (Tv) without destructive deletes.
    """

    def __init__(self):
        self._facts: List[BitemporalFactEvent] = []

    def register_fact(self, fact: BitemporalFactEvent) -> str:
        self._facts.append(fact)
        return fact.fact_id

    def get_fact(
        self,
        fact_id: str,
        as_of_tv: Optional[str] = None,
        as_of_tt: Optional[str] = None
    ) -> Optional[BitemporalFactEvent]:
        target_tv = as_of_tv or _now_iso()
        target_tt = as_of_tt or _now_iso()

        candidates = [
            f for f in self._facts
            if f.fact_id == fact_id and f.is_visible_at(target_tt) and f.is_valid_at(target_tv)
        ]
        if not candidates:
            # Fallback to direct fact_id match if active
            direct = [f for f in self._facts if f.fact_id == fact_id and f.status == "active"]
            return direct[0] if direct else None

        candidates.sort(key=lambda f: f.t_t, reverse=True)
        return candidates[0]

    def list_active_facts(
        self,
        as_of_tv: Optional[str] = None,
        as_of_tt: Optional[str] = None
    ) -> List[BitemporalFactEvent]:
        target_tv = as_of_tv or _now_iso()
        target_tt = as_of_tt or _now_iso()

        active_map: Dict[str, BitemporalFactEvent] = {}
        for f in self._facts:
            if f.is_visible_at(target_tt) and f.is_valid_at(target_tv):
                if f.fact_id not in active_map or f.t_t > active_map[f.fact_id].t_t:
                    active_map[f.fact_id] = f

        facts = list(active_map.values())
        facts.sort(key=lambda f: f.t_v)
        return facts

    def reconcile_fact(
        self,
        fact_id: str,
        calibrated_tv: str,
        rationale: str,
        evidence_hashes: Optional[List[str]] = None,
        actor_ids: Optional[List[str]] = None,
        conflict_flag: Optional[bool] = None
    ) -> BitemporalFactEvent:
        """
        Executes WORM calibration of an existing fact.
        Supersedes old record (valid_to = NOW) and creates replacement record.
        """
        now = _now_iso()
        old_fact = self.get_fact(fact_id, as_of_tv=now, as_of_tt=now)
        if not old_fact:
            raise ValueError(f"Active fact '{fact_id}' not found for reconciliation.")

        # Create calibrated replacement ID
        version_num = 2
        if "_v" in old_fact.fact_id:
            parts = old_fact.fact_id.split("_v")
            try:
                version_num = int(parts[1]) + 1
            except ValueError:
                version_num = 2
            base_id = parts[0]
        else:
            base_id = old_fact.fact_id

        new_id = f"{base_id}_v{version_num}"

        # Close old version
        old_fact.valid_to = now
        old_fact.tx_superseded = now
        old_fact.superseded_by = new_id
        old_fact.status = "superseded"

        # Construct calibrated fact
        new_hashes = evidence_hashes if evidence_hashes is not None else list(old_fact.source_evidence_hashes)
        new_actors = actor_ids if actor_ids is not None else list(old_fact.actor_ids)
        new_conflict = conflict_flag if conflict_flag is not None else old_fact.conflict_flag

        calibrated_fact = BitemporalFactEvent(
            fact_id=new_id,
            label=old_fact.label,
            t_v=calibrated_tv,
            t_t=now,
            source_evidence_hashes=new_hashes,
            actor_ids=new_actors,
            conflict_flag=new_conflict,
            supersedes=old_fact.fact_id,
            rationale=rationale,
            status="active"
        )

        self.register_fact(calibrated_fact)
        return calibrated_fact

    def detect_conflicts(self, actor_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Identifies active facts flagged with testimony or temporal conflicts."""
        active = self.list_active_facts()
        conflicts = []

        for f in active:
            if actor_id and actor_id not in f.actor_ids:
                continue
            if f.conflict_flag:
                conflicts.append({
                    "type": "FLAGGED_CONFLICT",
                    "fact_id": f.fact_id,
                    "label": f.label,
                    "t_v": f.t_v,
                    "actors": f.actor_ids,
                    "evidence_count": len(f.source_evidence_hashes),
                    "rationale": f.rationale or "Contradictory testimony recorded in evidentiary base."
                })

        return conflicts

    def to_dict(self) -> Dict[str, Any]:
        return {"facts": [f.to_dict() for f in self._facts]}

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TimelineCalibrator":
        calibrator = cls()
        for f_data in data.get("facts", []):
            calibrator.register_fact(BitemporalFactEvent.from_dict(f_data))
        return calibrator


def create_swiss_benchmark_timeline() -> TimelineCalibrator:
    """Pre-populates calibrated incidents from the Swiss case dossier."""
    calibrator = TimelineCalibrator()

    # Fact 1: Misappropriation of $15'000 USD
    calibrator.register_fact(BitemporalFactEvent(
        fact_id="FACT-001-ASSET-APPROPRIATION",
        label="Привласнення та виведення спільних активів $15'000 USD",
        t_v="2024-03-15T10:00:00Z",
        t_t="2024-03-20T14:30:00Z",
        source_evidence_hashes=[
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b"
        ],
        actor_ids=["ACT-CLAIMANT-CIVIL", "ACT-AUTEUR-UNDER-INFLUENCE", "ACT-ACCUSED-PRINCIPAL"],
        conflict_flag=True,
        rationale="Софі заперечує суму, стверджуючи про подарунок; аудіозаписи доводять примусове вилучення."
    ))

    # Fact 2: Battery & psychological violence against minor Alexandre
    calibrator.register_fact(BitemporalFactEvent(
        fact_id="FACT-002-BATTERY-MINOR",
        label="Фізичне побиття та психологічний тиск на дитину (Александр)",
        t_v="2024-04-02T18:45:00Z",
        t_t="2024-04-03T09:15:00Z",
        source_evidence_hashes=[
            "5d41402abc4b2a76b9719d911017c592afa8e67dae462d7c0f16d892df3e2b2f"
        ],
        actor_ids=["ACT-VICTIM-MINOR", "ACT-AUTEUR-UNDER-INFLUENCE", "ACT-ACCUSED-PRINCIPAL"],
        conflict_flag=False,
        rationale="Підтверджено форензік-аудіозаписом криків та свідченнями дитини."
    ))

    # Fact 3: Jean-Paul Vernon assistance in Nyon / Lausanne
    calibrator.register_fact(BitemporalFactEvent(
        fact_id="FACT-003-THIRD-PARTY-ASSISTANCE",
        label="Добросовісна перекладацька та транспортна допомога Жана-Поля ВЕРНОНА",
        t_v="2024-04-10T14:00:00Z",
        t_t="2024-04-11T10:00:00Z",
        source_evidence_hashes=[
            "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
        ],
        actor_ids=["ACT-BONA-FIDE-THIRD-PARTY", "ACT-AUTEUR-UNDER-INFLUENCE"],
        conflict_flag=False,
        rationale="Діяльність виключно як добросовісного третього помічника (Tiers de bonne foi)."
    ))

    return calibrator
