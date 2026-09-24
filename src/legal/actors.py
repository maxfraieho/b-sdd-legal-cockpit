"""
B-SDD Legal Framework: Procedural Actor Matrix (Swiss CPP).
Manages legal actors, procedural roles, and inter-actor relationships.
100% Pure Python Standard Library (ADR-002, Invariant L-02).
"""
from enum import Enum
from typing import Any, Dict, List, Optional


class ProceduralStatus(str, Enum):
    VICTIME_PARTIE_PLAIGNANTE = "VICTIME_PARTIE_PLAIGNANTE"
    PARTIE_PLAIGNANTE_CIVIL = "PARTIE_PLAIGNANTE_CIVIL"
    PREVENUE_AUTEUR_PRINCIPAL = "PREVENUE_AUTEUR_PRINCIPAL"
    PREVENUE_COMPLICE = "PREVENUE_COMPLICE"
    AUTEUR_SOUS_EMPRISE = "AUTEUR_SOUS_EMPRISE"
    TIERS_DE_BONNE_FOI = "TIERS_DE_BONNE_FOI"


class RelationType(str, Enum):
    INFLUENCE = "INFLUENCE"
    ASSISTANCE = "ASSISTANCE"
    FINANCIAL_CLAIM = "FINANCIAL_CLAIM"
    COHABITATION = "COHABITATION"
    LEGAL_REPRESENTATION = "LEGAL_REPRESENTATION"


class ActorEntity:
    def __init__(
        self,
        actor_id: str,
        name: str,
        procedural_status: ProceduralStatus,
        influence_degree: float = 0.5,
        material_dependency: bool = False,
        cohabitation: bool = False,
        financial_claims: Optional[List[str]] = None,
        bona_fide_protection: bool = False,
        notes: str = "",
    ):
        self.actor_id = actor_id
        self.name = name
        self.procedural_status = procedural_status
        self.influence_degree = max(0.0, min(1.0, float(influence_degree)))
        self.material_dependency = material_dependency
        self.cohabitation = cohabitation
        self.financial_claims = financial_claims or []
        self.bona_fide_protection = bona_fide_protection
        self.notes = notes

    def to_dict(self) -> Dict[str, Any]:
        return {
            "actor_id": self.actor_id,
            "name": self.name,
            "procedural_status": self.procedural_status.value,
            "influence_degree": self.influence_degree,
            "material_dependency": self.material_dependency,
            "cohabitation": self.cohabitation,
            "financial_claims": self.financial_claims,
            "bona_fide_protection": self.bona_fide_protection,
            "notes": self.notes,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ActorEntity":
        return cls(
            actor_id=data["actor_id"],
            name=data["name"],
            procedural_status=ProceduralStatus(data["procedural_status"]),
            influence_degree=data.get("influence_degree", 0.5),
            material_dependency=data.get("material_dependency", False),
            cohabitation=data.get("cohabitation", False),
            financial_claims=data.get("financial_claims", []),
            bona_fide_protection=data.get("bona_fide_protection", False),
            notes=data.get("notes", ""),
        )


class ActorRelation:
    def __init__(
        self,
        from_actor_id: str,
        to_actor_id: str,
        relation_type: RelationType,
        weight: float = 1.0,
        description: str = "",
    ):
        self.from_actor_id = from_actor_id
        self.to_actor_id = to_actor_id
        self.relation_type = relation_type
        self.weight = float(weight)
        self.description = description

    def to_dict(self) -> Dict[str, Any]:
        return {
            "from_actor_id": self.from_actor_id,
            "to_actor_id": self.to_actor_id,
            "relation_type": self.relation_type.value,
            "weight": self.weight,
            "description": self.description,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ActorRelation":
        rtype = RelationType(data.get("relation_type", RelationType.INFLUENCE.value))
        return cls(
            from_actor_id=data["from_actor_id"],
            to_actor_id=data["to_actor_id"],
            relation_type=rtype,
            weight=float(data.get("weight", 1.0)),
            description=str(data.get("description", "")),
        )


class ActorMatrix:
    """Graph manager for legal actors, roles, and inter-actor relationships."""

    def __init__(self):
        self.actors: Dict[str, ActorEntity] = {}
        self.relations: List[ActorRelation] = []

    def add_actor(self, actor: ActorEntity) -> None:
        self.actors[actor.actor_id] = actor

    def get_actor(self, actor_id: str) -> Optional[ActorEntity]:
        return self.actors.get(actor_id)

    def add_relation(
        self,
        from_actor_id: str,
        to_actor_id: str,
        relation_type: RelationType,
        weight: float = 1.0,
        description: str = "",
    ) -> None:
        rel = ActorRelation(
            from_actor_id=from_actor_id,
            to_actor_id=to_actor_id,
            relation_type=relation_type,
            weight=weight,
            description=description,
        )
        self.relations.append(rel)

    def get_relations_for_actor(self, actor_id: str) -> List[ActorRelation]:
        return [
            r for r in self.relations
            if r.from_actor_id == actor_id or r.to_actor_id == actor_id
        ]

    def filter_by_status(self, status: ProceduralStatus) -> List[ActorEntity]:
        return [a for a in self.actors.values() if a.procedural_status == status]

    def get_protected_bona_fide_actors(self) -> List[ActorEntity]:
        """Returns all entities shielded by bona_fide_protection."""
        return [a for a in self.actors.values() if a.bona_fide_protection]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "actors": [a.to_dict() for a in self.actors.values()],
            "relations": [r.to_dict() for r in self.relations],
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ActorMatrix":
        matrix = cls()
        for a_data in data.get("actors", []):
            matrix.add_actor(ActorEntity.from_dict(a_data))
        for r_data in data.get("relations", []):
            matrix.relations.append(ActorRelation.from_dict(r_data))
        return matrix


BENCHMARK_ACTORS: Dict[str, ActorEntity] = {
    "ACT-VICTIM-MINOR": ActorEntity(
        actor_id="ACT-VICTIM-MINOR",
        name="Alexandre D. (Mineur)",
        procedural_status=ProceduralStatus.VICTIME_PARTIE_PLAIGNANTE,
        influence_degree=0.1,
        material_dependency=True,
        cohabitation=True,
        financial_claims=["Victim compensation (Art. 122 CPP)"],
        bona_fide_protection=False,
        notes="Minor child victim, partie plaignante, protected under Art. 115, 118, 122 CPP. Strictly NOT prévenu."
    ),
    "ACT-CLAIMANT-CIVIL": ActorEntity(
        actor_id="ACT-CLAIMANT-CIVIL",
        name="Marc MOREAU",
        procedural_status=ProceduralStatus.PARTIE_PLAIGNANTE_CIVIL,
        influence_degree=0.7,
        material_dependency=False,
        cohabitation=False,
        financial_claims=["Restitution of CHF 15'000 (Art. 122 CPP)", "Damages under Art. 41 CO"],
        bona_fide_protection=False,
        notes="Complainant and civil claimant (Art. 118, 122 CPP), legal representative of minor victim."
    ),
    "ACT-ACCUSED-PRINCIPAL": ActorEntity(
        actor_id="ACT-ACCUSED-PRINCIPAL",
        name="Laurent VOGEL",
        procedural_status=ProceduralStatus.PREVENUE_AUTEUR_PRINCIPAL,
        influence_degree=0.95,
        material_dependency=False,
        cohabitation=True,
        financial_claims=[],
        bona_fide_protection=False,
        notes="Principal accused / auteur principal: misappropriation (Art. 138 CP), fraud (Art. 146 CP), threats (Art. 180 CP), coercion (Art. 181 CP)."
    ),
    "ACT-ACCUSED-COMPLICE": ActorEntity(
        actor_id="ACT-ACCUSED-COMPLICE",
        name="Claire VOGEL",
        procedural_status=ProceduralStatus.PREVENUE_COMPLICE,
        influence_degree=0.6,
        material_dependency=False,
        cohabitation=False,
        financial_claims=[],
        bona_fide_protection=False,
        notes="Accused complice: complicity in threats, extortion, and psychological harassment (Art. 24, 180, 181 CP)."
    ),
    "ACT-AUTEUR-UNDER-INFLUENCE": ActorEntity(
        actor_id="ACT-AUTEUR-UNDER-INFLUENCE",
        name="Sophie MOREAU",
        procedural_status=ProceduralStatus.AUTEUR_SOUS_EMPRISE,
        influence_degree=0.5,
        material_dependency=True,
        cohabitation=True,
        financial_claims=[],
        bona_fide_protection=False,
        notes="Auteur under psychological influence (Art. 157 CP usury); subject of protective measures request."
    ),
    "ACT-BONA-FIDE-THIRD-PARTY": ActorEntity(
        actor_id="ACT-BONA-FIDE-THIRD-PARTY",
        name="Jean-Paul VERNON",
        procedural_status=ProceduralStatus.TIERS_DE_BONNE_FOI,
        influence_degree=0.2,
        material_dependency=False,
        cohabitation=False,
        financial_claims=[],
        bona_fide_protection=True,  # Invariant L-03 mandatory protection
        notes="Independent third-party assistant in good faith. Absolute protection against accusatory drift or wrongful liability."
    ),
}


def create_swiss_benchmark_matrix() -> ActorMatrix:
    """Initializes canonical benchmark legal actors for testing and simulation."""
    matrix = ActorMatrix()
    for actor in BENCHMARK_ACTORS.values():
        matrix.add_actor(ActorEntity.from_dict(actor.to_dict()))

    matrix.add_relation(
        from_actor_id="ACT-ACCUSED-PRINCIPAL",
        to_actor_id="ACT-AUTEUR-UNDER-INFLUENCE",
        relation_type=RelationType.INFLUENCE,
        weight=0.95,
        description="Psychological and procedural dominance"
    )
    matrix.add_relation(
        from_actor_id="ACT-ACCUSED-COMPLICE",
        to_actor_id="ACT-ACCUSED-PRINCIPAL",
        relation_type=RelationType.ASSISTANCE,
        weight=0.7,
        description="Complicity in threats and extortion"
    )
    matrix.add_relation(
        from_actor_id="ACT-CLAIMANT-CIVIL",
        to_actor_id="ACT-ACCUSED-PRINCIPAL",
        relation_type=RelationType.FINANCIAL_CLAIM,
        weight=1.0,
        description="Formal claim of CHF 15'000 misappropriated funds"
    )
    matrix.add_relation(
        from_actor_id="ACT-BONA-FIDE-THIRD-PARTY",
        to_actor_id="ACT-AUTEUR-UNDER-INFLUENCE",
        relation_type=RelationType.ASSISTANCE,
        weight=0.5,
        description="Independent third-party assistance in good faith"
    )

    return matrix
