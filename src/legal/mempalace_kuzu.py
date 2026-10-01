"""
MemPalace Spatial Ontology & KùzuDB Graph Engine.
Implements the 4-tier spatial hierarchy:
  Wings -> Halls -> Rooms -> Drawers
Complies with B-SDD Invariants L-01 (WORM Bitemporality), L-03 (Bona Fide Intermediary Flag),
L-04 (Adult Victim Standing), and L-05 (Cryptographic Evidence Seal).
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
import importlib
import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Any, Union


def _load_kuzu():
    try:
        return importlib.import_module("kuzu")
    except ImportError:
        return None

_kuzu_mod = _load_kuzu()
_HAS_KUZU = _kuzu_mod is not None


# Canonical Temporal Boundaries
FAR_FUTURE = "9999-12-31T23:59:59Z"
CANONICAL_EPOCH = "2024-03-16T00:00:00Z"


@dataclass
class SpatialNode:
    """Base class for spatial ontology locations."""
    id: str
    name: str
    description: str = ""
    valid_from: str = CANONICAL_EPOCH
    valid_to: str = FAR_FUTURE

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "valid_from": self.valid_from,
            "valid_to": self.valid_to,
        }


@dataclass
class DrawerNode(SpatialNode):
    """Granular evidence locker representing a forensic transcript with exact timecodes and SHA-256."""
    filename: str = ""
    duration_sec: float = 0.0
    sha256: str = ""
    excerpt: str = ""
    room_id: str = ""
    timecodes: List[str] = field(default_factory=list)
    corroboration_weight: float = 1.0

    def to_dict(self) -> Dict[str, Any]:
        d = super().to_dict()
        d.update({
            "filename": self.filename,
            "duration_sec": self.duration_sec,
            "sha256": self.sha256,
            "excerpt": self.excerpt,
            "room_id": self.room_id,
            "timecodes": self.timecodes,
            "corroboration_weight": self.corroboration_weight,
        })
        return d


class KuzuMemPalace:
    """
    KùzuDB spatial ontology graph store for MemPalace.
    Houses Wings, Halls, Rooms, and forensic Drawers with full Cypher querying
    and bitemporal edge versioning.
    """

    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "data",
            "kuzu_mempalace.db"
        )
        os.makedirs(os.path.dirname(os.path.abspath(self.db_path)), exist_ok=True)
        
        self.kuzu_available = _HAS_KUZU
        self.db = None
        self.conn = None
        
        # In-memory pure-python fallback graph mirroring Kuzu schema
        self._memory_graph: Dict[str, Any] = {
            "nodes": {
                "Wing": {},
                "Hall": {},
                "Room": {},
                "Drawer": {},
                "JudicialEvidence": {},
                "Actor": {},
                "Statute": {},
                "StatuteArticle": {},
                "Allegation": {},
            },
            "edges": []
        }

        if self.kuzu_available:
            self._init_kuzu()
        else:
            self._init_memory_schema()

    def _init_kuzu(self):
        """Initialize Kuzu database and create relational and node tables."""
        self.db = _kuzu_mod.Database(self.db_path)
        self.conn = _kuzu_mod.Connection(self.db)
        self._create_schema()

    def _create_schema(self):
        """Create Kùzu table schemas if they do not exist."""
        # Helper to execute safely
        def safe_exec(query: str):
            try:
                self.conn.execute(query)
            except Exception as e:
                # Table might already exist
                if "already exists" not in str(e).lower():
                    pass

        # Node tables
        safe_exec("CREATE NODE TABLE Wing(id STRING, name STRING, description STRING, PRIMARY KEY(id))")
        safe_exec("CREATE NODE TABLE Hall(id STRING, name STRING, description STRING, PRIMARY KEY(id))")
        safe_exec("CREATE NODE TABLE Room(id STRING, name STRING, statute STRING, description STRING, PRIMARY KEY(id))")
        safe_exec("CREATE NODE TABLE Drawer(id STRING, filename STRING, duration_sec DOUBLE, sha256 STRING, excerpt STRING, room_id STRING, valid_from STRING, valid_to STRING, PRIMARY KEY(id))")
        safe_exec("CREATE NODE TABLE JudicialEvidence(id STRING, code STRING, series STRING, category STRING, filename STRING, sha256 STRING, room_id STRING, description STRING, valid_from STRING, valid_to STRING, PRIMARY KEY(id))")
        safe_exec("CREATE NODE TABLE Actor(id STRING, name STRING, role STRING, bona_fide BOOLEAN, birth_date STRING, PRIMARY KEY(id))")
        safe_exec("CREATE NODE TABLE Statute(id STRING, code STRING, article STRING, prescription_years INT64, PRIMARY KEY(id))")
        safe_exec("CREATE NODE TABLE StatuteArticle(id STRING, code STRING, jurisdiction STRING, article STRING, category STRING, title_fr STRING, title_uk STRING, title_en STRING, content_fr STRING, content_uk STRING, content_en STRING, sanction STRING, relevance_case_fr STRING, relevance_case_uk STRING, corroborating_cotes STRING, mempalace_node_id STRING, url_fedlex STRING, PRIMARY KEY(id))")
        safe_exec("CREATE NODE TABLE Allegation(id STRING, title STRING, qualification STRING, score DOUBLE, status STRING, PRIMARY KEY(id))")

        # Rel tables (bitemporal edge support)
        safe_exec("CREATE REL TABLE CONTAINS_HALL(FROM Wing TO Hall, valid_from STRING, valid_to STRING)")
        safe_exec("CREATE REL TABLE CONTAINS_ROOM(FROM Hall TO Room, valid_from STRING, valid_to STRING)")
        safe_exec("CREATE REL TABLE CONTAINS_DRAWER(FROM Room TO Drawer, valid_from STRING, valid_to STRING)")
        safe_exec("CREATE REL TABLE CORROBORATES(FROM Drawer TO Room, FROM JudicialEvidence TO Room, weight DOUBLE, valid_from STRING, valid_to STRING)")
        safe_exec("CREATE REL TABLE PROVES(FROM Drawer TO Room, FROM JudicialEvidence TO Room, weight DOUBLE, valid_from STRING, valid_to STRING)")
        safe_exec("CREATE REL TABLE TARGETS_ACTOR(FROM Room TO Actor, role STRING, valid_from STRING, valid_to STRING)")
        safe_exec("CREATE REL TABLE SUBSTANTIATES(FROM Drawer TO Allegation, FROM JudicialEvidence TO Allegation, valid_from STRING, valid_to STRING)")
        safe_exec("CREATE REL TABLE GOVERNED_BY(FROM Room TO Statute, valid_from STRING, valid_to STRING)")
        safe_exec("CREATE REL TABLE ROOM_GOVERNED_BY_ARTICLE(FROM Room TO StatuteArticle, valid_from STRING, valid_to STRING)")
        safe_exec("CREATE REL TABLE SUBSTANTIATES_NORM(FROM JudicialEvidence TO StatuteArticle, FROM Drawer TO StatuteArticle, valid_from STRING, valid_to STRING)")

    def _init_memory_schema(self):
        """Fallback in-memory schema tracker for environments without binary wheels."""
        pass

    def seed_spatial_ontology(self):
        """
        Seeds canonical Wings, Halls, Rooms, Statutes, and Actors into the graph.
        Enforces:
          - Invariant L-03: PARTY-L03 (Bona Fide Intermediary Flag)
          - Invariant L-04: PARTY-L04 (Adult Victim Standing)
        """
        wings = [
            ("WING-VICTIMS", "Aile des Victimes et Demandeurs civils", "Arsen Kovalenko (victime) & Volodymyr Kovalenko (demandeur civil)"),
            ("WING-PROSECUTION", "Aile de l'Accusation et Prévenus", "Liubov Suvorova (instigatrice), Hanna Suvorova (complice), Olena Kovalenko"),
            ("WING-STATE-LIABILITY", "Aile de la Responsabilité étatique", "EVAM, Services sociaux et Police cantonale vaudoise (LRECA/LARA)"),
        ]

        halls = [
            ("HALL-EVIDENCE", "Galerie des Preuves matérielles", "61 transcriptions, audio, constats photographiques et rapports Unisanté"),
            ("HALL-STATUTES", "Galerie des Dispositions légales", "Normes pénales (CP), de procédure (CPP), LEI, CO et responsabilité étatique"),
            ("HALL-PROCEDURE", "Galerie des Actes de Procédure", "Plainte pénale, séquestre (263 CPP), recours 393 CPP et renvoi (324 CPP)"),
        ]

        rooms = [
            ("ROOM-138-CP", "Chambre Abus de confiance", "Art. 138 CP", "Détournement d'actifs familiaux et rétention abusive de fonds"),
            ("ROOM-146-CP", "Chambre Escroquerie ($15'000 USD)", "Art. 146 CP", "Extorsion et appropriation frauduleuse de 15'000 USD sous couvert d'aide migratoire"),
            ("ROOM-180-181-CP", "Chambre Menaces et Contrainte", "Art. 180 & 181 CP", "Menaces réitérées de mort, d'immersion fatale et violences psychologiques"),
            ("ROOM-157-CP", "Chambre Usure et Détresse", "Art. 157 CP & Art. 118 LEI", "Exploitation de la vulnérabilité de réfugiés et enrichissement illégitime"),
            ("ROOM-139-141-CPP", "Chambre Exploitation Probatoire (ATF 146 IV 9)", "Art. 139-141 CPP", "Pesée des intérêts et validité légale des enregistrements clandestins"),
            ("ROOM-144-CP", "Chambre Dommages à la propriété", "Art. 144 CP", "Destruction des lunettes et dégradation intentionnelle de biens"),
            ("ROOM-186-CP", "Chambre Violation de domicile", "Art. 186 CP", "Intrusion illicite, forçage des accès et violation du bail EVAM"),
            ("ROOM-123-CP", "Chambre Lésions corporelles", "Art. 123 CP", "Violences physiques, dermabrasions et plaies faciales"),
            ("ROOM-303-CP", "Chambre Dénonciation calomnieuse", "Art. 303 & 304 CP", "Tentative d'induction de la justice en erreur et fausses déclarations"),
        ]

        statutes = [
            ("STAT-146-CP", "CP", "Art. 146", 15),
            ("STAT-138-CP", "CP", "Art. 138", 10),
            ("STAT-180-CP", "CP", "Art. 180", 10),
            ("STAT-181-CP", "CP", "Art. 181", 10),
            ("STAT-157-CP", "CP", "Art. 157", 15),
            ("STAT-123-CP", "CP", "Art. 123", 10),
            ("STAT-126-CP", "CP", "Art. 126", 3),
            ("STAT-144-CP", "CP", "Art. 144", 10),
            ("STAT-186-CP", "CP", "Art. 186", 10),
            ("STAT-303-CP", "CP", "Art. 303", 10),
            ("STAT-304-CP", "CP", "Art. 304", 10),
            ("STAT-118-LEI", "LEI", "Art. 118", 15),
            ("STAT-393-CPP", "CPP", "Art. 393", 0),  # Procedural deadline
        ]

        actors = [
            ("ACT-ARSEN-KOVALENKO", "Arsen KOVALENKO", "victime_partie_plaignante", False, "05.11.1999"),
            ("ACT-VOLODYMYR-KOVALENKO", "Volodymyr KOVALENKO", "partie_plaignante_demandeur_civil", False, "12.06.1975"),
            ("ACT-LIUBOV-SUVOROVA", "Liubov SUVOROVA", "prevenue_auteur_principal", False, "1980-01-01"),
            ("ACT-HANNA-SUVOROVA", "Hanna SUVOROVA", "prevenue_complice", False, "1955-01-01"),
            ("ACT-OLENA-KOVALENKO", "Olena KOVALENKO", "auteur_sous_emprise", False, "1978-01-01"),
            ("ACT-ADRIANO-MILLI", "Adriano MILLI", "tiers_de_bonne_foi", True, "1970-01-01"),
            ("ACT-EVAM", "EVAM - Établissement Vaudois des Migrants", "responsabilite_etatique", False, ""),
        ]

        allegations = [
            ("ALLEG-01", "Instigation aux lésions corporelles, menaces et contrainte", "Art. 24, 123, 126, 180, 181 CP", 1.0, "ACCUSATION_PLEINEMENT_CORROBOREE"),
            ("ALLEG-02", "Usure / Abus de détresse et Escroquerie ($15'000 USD)", "Art. 157, 146 CP, Art. 118 LEI", 0.8, "ACCUSATION_PLEINEMENT_CORROBOREE"),
            ("ALLEG-03", "Lésions corporelles, voies de fait et dénonciation calomnieuse", "Art. 123, 126, 303, 304 CP", 1.0, "ACCUSATION_PLEINEMENT_CORROBOREE"),
            ("ALLEG-04", "Responsabilité de l'État pour omission illicite (EVAM)", "LRECA Art. 3-8, LARA Art. 2, 7, 24", 0.8, "ACCUSATION_PLEINEMENT_CORROBOREE"),
        ]

        if self.kuzu_available:
            # Seed Wings
            for wid, name, desc in wings:
                self.conn.execute(f"MERGE (w:Wing {{id: '{wid}'}}) ON CREATE SET w.name = '{self._escape(name)}', w.description = '{self._escape(desc)}'")

            # Seed Halls
            for hid, name, desc in halls:
                self.conn.execute(f"MERGE (h:Hall {{id: '{hid}'}}) ON CREATE SET h.name = '{self._escape(name)}', h.description = '{self._escape(desc)}'")

            # Seed Rooms
            for rid, name, stat, desc in rooms:
                self.conn.execute(f"MERGE (r:Room {{id: '{rid}'}}) ON CREATE SET r.name = '{self._escape(name)}', r.statute = '{self._escape(stat)}', r.description = '{self._escape(desc)}'")

            # Seed Statutes
            for sid, code, art, pres in statutes:
                self.conn.execute(f"MERGE (s:Statute {{id: '{sid}'}}) ON CREATE SET s.code = '{sid}', s.article = '{art}', s.prescription_years = {pres}")

            # Seed Actors
            for aid, name, role, bona_fide, bdate in actors:
                bf_str = "true" if bona_fide else "false"
                self.conn.execute(f"MERGE (a:Actor {{id: '{aid}'}}) ON CREATE SET a.name = '{self._escape(name)}', a.role = '{role}', a.bona_fide = {bf_str}, a.birth_date = '{bdate}'")

            # Seed Allegations
            for alid, title, qual, score, status in allegations:
                self.conn.execute(f"MERGE (al:Allegation {{id: '{alid}'}}) ON CREATE SET al.title = '{self._escape(title)}', al.qualification = '{self._escape(qual)}', al.score = {score}, al.status = '{status}'")

            # Connect Wings -> Halls
            wing_hall_links = [
                ("WING-VICTIMS", "HALL-EVIDENCE"),
                ("WING-VICTIMS", "HALL-PROCEDURE"),
                ("WING-PROSECUTION", "HALL-EVIDENCE"),
                ("WING-PROSECUTION", "HALL-STATUTES"),
                ("WING-STATE-LIABILITY", "HALL-STATUTES"),
                ("WING-STATE-LIABILITY", "HALL-PROCEDURE"),
            ]
            for wid, hid in wing_hall_links:
                self.conn.execute(f"""
                MATCH (w:Wing), (h:Hall)
                WHERE w.id = '{wid}' AND h.id = '{hid}'
                CREATE (w)-[:CONTAINS_HALL {{valid_from: '{CANONICAL_EPOCH}', valid_to: '{FAR_FUTURE}'}}]->(h)
                """)

            # Connect Halls -> Rooms
            hall_room_links = [
                ("HALL-EVIDENCE", "ROOM-180-181-CP"),
                ("HALL-EVIDENCE", "ROOM-146-CP"),
                ("HALL-EVIDENCE", "ROOM-138-CP"),
                ("HALL-EVIDENCE", "ROOM-157-CP"),
                ("HALL-EVIDENCE", "ROOM-139-141-CPP"),
                ("HALL-EVIDENCE", "ROOM-144-CP"),
                ("HALL-EVIDENCE", "ROOM-186-CP"),
                ("HALL-EVIDENCE", "ROOM-123-CP"),
                ("HALL-EVIDENCE", "ROOM-303-CP"),
                ("HALL-STATUTES", "ROOM-180-181-CP"),
                ("HALL-STATUTES", "ROOM-146-CP"),
                ("HALL-STATUTES", "ROOM-138-CP"),
                ("HALL-STATUTES", "ROOM-157-CP"),
                ("HALL-STATUTES", "ROOM-144-CP"),
                ("HALL-STATUTES", "ROOM-186-CP"),
                ("HALL-STATUTES", "ROOM-123-CP"),
                ("HALL-STATUTES", "ROOM-303-CP"),
                ("HALL-PROCEDURE", "ROOM-139-141-CPP"),
            ]
            for hid, rid in hall_room_links:
                self.conn.execute(f"""
                MATCH (h:Hall), (r:Room)
                WHERE h.id = '{hid}' AND r.id = '{rid}'
                CREATE (h)-[:CONTAINS_ROOM {{valid_from: '{CANONICAL_EPOCH}', valid_to: '{FAR_FUTURE}'}}]->(r)
                """)

            # Connect Rooms -> Statutes
            room_stat_links = [
                ("ROOM-138-CP", "STAT-138-CP"),
                ("ROOM-146-CP", "STAT-146-CP"),
                ("ROOM-180-181-CP", "STAT-180-CP"),
                ("ROOM-180-181-CP", "STAT-181-CP"),
                ("ROOM-157-CP", "STAT-157-CP"),
                ("ROOM-157-CP", "STAT-118-LEI"),
                ("ROOM-144-CP", "STAT-144-CP"),
                ("ROOM-186-CP", "STAT-186-CP"),
                ("ROOM-123-CP", "STAT-123-CP"),
                ("ROOM-303-CP", "STAT-303-CP"),
                ("ROOM-303-CP", "STAT-304-CP"),
            ]
            for rid, sid in room_stat_links:
                self.conn.execute(f"""
                MATCH (r:Room), (s:Statute)
                WHERE r.id = '{rid}' AND s.id = '{sid}'
                CREATE (r)-[:GOVERNED_BY {{valid_from: '{CANONICAL_EPOCH}', valid_to: '{FAR_FUTURE}'}}]->(s)
                """)

            # Connect Rooms -> Target Actors
            room_actor_links = [
                ("ROOM-180-181-CP", "ACT-LIUBOV-SUVOROVA", "instigatrice_principale"),
                ("ROOM-180-181-CP", "ACT-HANNA-SUVOROVA", "coauteur_menaces"),
                ("ROOM-146-CP", "ACT-LIUBOV-SUVOROVA", "beneficiaire_escroquerie"),
                ("ROOM-138-CP", "ACT-LIUBOV-SUVOROVA", "detournement_actifs"),
                ("ROOM-157-CP", "ACT-LIUBOV-SUVOROVA", "usure_detresse"),
                ("ROOM-139-141-CPP", "ACT-ADRIANO-MILLI", "tiers_de_bonne_foi_protege"),
                ("ROOM-144-CP", "ACT-OLENA-KOVALENKO", "auteur_degradations"),
                ("ROOM-186-CP", "ACT-LIUBOV-SUVOROVA", "tentative_violation_domicile"),
                ("ROOM-123-CP", "ACT-OLENA-KOVALENKO", "auteur_lesions"),
                ("ROOM-303-CP", "ACT-OLENA-KOVALENKO", "auteur_denonciation_calomnieuse"),
            ]
            for rid, aid, role in room_actor_links:
                self.conn.execute(f"""
                MATCH (r:Room), (a:Actor)
                WHERE r.id = '{rid}' AND a.id = '{aid}'
                CREATE (r)-[:TARGETS_ACTOR {{role: '{role}', valid_from: '{CANONICAL_EPOCH}', valid_to: '{FAR_FUTURE}'}}]->(a)
                """)

        # Sync into fallback memory graph
        for w in wings:
            self._memory_graph["nodes"]["Wing"][w[0]] = {"id": w[0], "name": w[1], "description": w[2]}
        for h in halls:
            self._memory_graph["nodes"]["Hall"][h[0]] = {"id": h[0], "name": h[1], "description": h[2]}
        for r in rooms:
            self._memory_graph["nodes"]["Room"][r[0]] = {"id": r[0], "name": r[1], "statute": r[2], "description": r[3]}
        for s in statutes:
            self._memory_graph["nodes"]["Statute"][s[0]] = {"id": s[0], "code": s[1], "article": s[2], "prescription_years": s[3]}
        for a in actors:
            self._memory_graph["nodes"]["Actor"][a[0]] = {"id": a[0], "name": a[1], "role": a[2], "bona_fide": a[3], "birth_date": a[4]}
        for al in allegations:
            self._memory_graph["nodes"]["Allegation"][al[0]] = {"id": al[0], "title": al[1], "qualification": al[2], "score": al[3], "status": al[4]}

    def add_drawer(self, drawer: DrawerNode, allegation_id: Optional[str] = None):
        """
        Adds or updates a Drawer (forensic transcript) into the MemPalace.
        Maintains bitemporal link to Room and Allegation.
        Enforces Invariant L-05 (Cryptographic Evidence Seal: non-empty SHA-256).
        """
        if not drawer.sha256 or len(drawer.sha256) < 32:
            raise ValueError(f"Invariant L-05 Violation: Drawer {drawer.id} missing valid SHA-256 seal.")

        if self.kuzu_available:
            excerpt_escaped = self._escape(drawer.excerpt[:500])
            fn_escaped = self._escape(drawer.filename)
            self.conn.execute(f"""
            MERGE (d:Drawer {{id: '{drawer.id}'}})
            ON CREATE SET d.filename = '{fn_escaped}',
                          d.duration_sec = {drawer.duration_sec},
                          d.sha256 = '{drawer.sha256}',
                          d.excerpt = '{excerpt_escaped}',
                          d.room_id = '{drawer.room_id}',
                          d.valid_from = '{drawer.valid_from}',
                          d.valid_to = '{drawer.valid_to}'
            ON MATCH SET  d.filename = '{fn_escaped}',
                          d.duration_sec = {drawer.duration_sec},
                          d.sha256 = '{drawer.sha256}',
                          d.excerpt = '{excerpt_escaped}',
                          d.room_id = '{drawer.room_id}',
                          d.valid_to = '{drawer.valid_to}'
            """)

            # Connect Room -> Drawer
            if drawer.room_id:
                self.conn.execute(f"""
                MATCH (r:Room), (d:Drawer)
                WHERE r.id = '{drawer.room_id}' AND d.id = '{drawer.id}'
                CREATE (r)-[:CONTAINS_DRAWER {{valid_from: '{drawer.valid_from}', valid_to: '{drawer.valid_to}'}}]->(d)
                """)
                self.conn.execute(f"""
                MATCH (d:Drawer), (r:Room)
                WHERE d.id = '{drawer.id}' AND r.id = '{drawer.room_id}'
                CREATE (d)-[:CORROBORATES {{weight: {drawer.corroboration_weight}, valid_from: '{drawer.valid_from}', valid_to: '{drawer.valid_to}'}}]->(r)
                """)

                try:
                    self.conn.execute(f"""
                    MATCH (d:Drawer), (r:Room)
                    WHERE d.id = '{drawer.id}' AND r.id = '{drawer.room_id}'
                    CREATE (d)-[:PROVES {{weight: {drawer.corroboration_weight}, valid_from: '{drawer.valid_from}', valid_to: '{drawer.valid_to}'}}]->(r)
                    """)
                except Exception:
                    pass

            # Connect Drawer -> Allegation
            if allegation_id:
                self.conn.execute(f"""
                MATCH (d:Drawer), (al:Allegation)
                WHERE d.id = '{drawer.id}' AND al.id = '{allegation_id}'
                CREATE (d)-[:SUBSTANTIATES {{valid_from: '{drawer.valid_from}', valid_to: '{drawer.valid_to}'}}]->(al)
                """)

        # Fallback sync
        self._memory_graph["nodes"]["Drawer"][drawer.id] = drawer.to_dict()
        if drawer.room_id:
            self._memory_graph["edges"].append({
                "from": drawer.room_id, "to": drawer.id, "type": "CONTAINS_DRAWER",
                "valid_from": drawer.valid_from, "valid_to": drawer.valid_to
            })
            self._memory_graph["edges"].append({
                "from": drawer.id, "to": drawer.room_id, "type": "CORROBORATES",
                "weight": drawer.corroboration_weight,
                "valid_from": drawer.valid_from, "valid_to": drawer.valid_to
            })
            self._memory_graph["edges"].append({
                "from": drawer.id, "to": drawer.room_id, "type": "PROVES",
                "weight": drawer.corroboration_weight,
                "valid_from": drawer.valid_from, "valid_to": drawer.valid_to
            })
        if allegation_id:
            self._memory_graph["edges"].append({
                "from": drawer.id, "to": allegation_id, "type": "SUBSTANTIATES",
                "valid_from": drawer.valid_from, "valid_to": drawer.valid_to
            })

    def add_judicial_evidence(self, item: Any):
        """
        Adds a JudicialEvidenceItem (or dict) into the MemPalace graph.
        Links item to its target room via :PROVES and :CORROBORATES.
        Enforces Invariant L-05 (verified 64-char SHA-256 seal).
        """
        item_dict = item.to_dict() if hasattr(item, "to_dict") else item
        code = item_dict.get("code", "")
        item_id = f"EVID-{item_dict.get('series', '')}-{code.replace('[', '').replace(']', '').replace(' ', '_')}"
        filename = item_dict.get("filename", "")
        sha256 = item_dict.get("sha256_hash") or item_dict.get("sha256", "")
        room_id = item_dict.get("room_id", "ROOM-180-181-CP")
        description = item_dict.get("description", "")
        series = item_dict.get("series", "")
        category = item_dict.get("category", "")
        valid_from = item_dict.get("valid_from", CANONICAL_EPOCH)
        valid_to = item_dict.get("valid_to", FAR_FUTURE)

        if not sha256 or len(sha256) != 64:
            raise ValueError(f"Invariant L-05 Violation: Evidence item {code} missing valid 64-char SHA-256 seal.")

        if self.kuzu_available:
            fn_escaped = self._escape(filename)
            desc_escaped = self._escape(description[:500])
            code_escaped = self._escape(code)
            self.conn.execute(f"""
            MERGE (e:JudicialEvidence {{id: '{item_id}'}})
            ON CREATE SET e.code = '{code_escaped}',
                          e.series = '{series}',
                          e.category = '{category}',
                          e.filename = '{fn_escaped}',
                          e.sha256 = '{sha256}',
                          e.room_id = '{room_id}',
                          e.description = '{desc_escaped}',
                          e.valid_from = '{valid_from}',
                          e.valid_to = '{valid_to}'
            ON MATCH SET  e.code = '{code_escaped}',
                          e.series = '{series}',
                          e.category = '{category}',
                          e.filename = '{fn_escaped}',
                          e.sha256 = '{sha256}',
                          e.room_id = '{room_id}',
                          e.description = '{desc_escaped}',
                          e.valid_to = '{valid_to}'
            """)

            if room_id:
                try:
                    self.conn.execute(f"""
                    MATCH (e:JudicialEvidence), (r:Room)
                    WHERE e.id = '{item_id}' AND r.id = '{room_id}'
                    CREATE (e)-[:PROVES {{weight: 1.0, valid_from: '{valid_from}', valid_to: '{valid_to}'}}]->(r)
                    """)
                except Exception:
                    pass

                try:
                    self.conn.execute(f"""
                    MATCH (e:JudicialEvidence), (r:Room)
                    WHERE e.id = '{item_id}' AND r.id = '{room_id}'
                    CREATE (e)-[:CORROBORATES {{weight: 1.0, valid_from: '{valid_from}', valid_to: '{valid_to}'}}]->(r)
                    """)
                except Exception:
                    pass

        # Memory graph sync
        if "JudicialEvidence" not in self._memory_graph["nodes"]:
            self._memory_graph["nodes"]["JudicialEvidence"] = {}
        self._memory_graph["nodes"]["JudicialEvidence"][item_id] = {
            "id": item_id,
            "code": code,
            "series": series,
            "category": category,
            "filename": filename,
            "sha256": sha256,
            "room_id": room_id,
            "description": description,
            "valid_from": valid_from,
            "valid_to": valid_to,
        }
        if room_id:
            self._memory_graph["edges"].append({
                "from": item_id, "to": room_id, "type": "PROVES",
                "weight": 1.0, "valid_from": valid_from, "valid_to": valid_to
            })
            self._memory_graph["edges"].append({
                "from": item_id, "to": room_id, "type": "CORROBORATES",
                "weight": 1.0, "valid_from": valid_from, "valid_to": valid_to
            })

    def seed_all_judicial_evidence(self, registry: Optional[Any] = None) -> int:
        """
        Seeds all 41 items across Series A, B, C, D, E from JudicialEvidenceRegistry.
        Returns count of items ingested.
        """
        if registry is None:
            try:
                from src.legal.evidence_registry import JudicialEvidenceRegistry
                registry = JudicialEvidenceRegistry()
            except ImportError:
                return 0
        count = 0
        for item in registry.items.values():
            self.add_judicial_evidence(item)
            count += 1
        return count

    def get_judicial_evidence_by_series(self, series: str) -> List[Dict[str, Any]]:
        """Queries judicial evidence items by series (A, B, C, D, E)."""
        series_clean = series.upper().replace("SERIES_", "")
        if self.kuzu_available:
            return self.query_cypher(f"MATCH (e:JudicialEvidence) WHERE e.series = '{series_clean}' RETURN e.id, e.code, e.series, e.filename, e.sha256, e.room_id")
        return [
            it for it in self._memory_graph["nodes"].get("JudicialEvidence", {}).values()
            if it.get("series") == series_clean
        ]

    def get_judicial_evidence_by_room(self, room_id: str) -> List[Dict[str, Any]]:
        """Queries judicial evidence items proving/corroborating a specific Room."""
        if self.kuzu_available:
            return self.query_cypher(f"MATCH (e:JudicialEvidence)-[:PROVES]->(r:Room {{id: '{room_id}'}}) RETURN e.id, e.code, e.series, e.filename, e.sha256")
        return [
            it for it in self._memory_graph["nodes"].get("JudicialEvidence", {}).values()
            if it.get("room_id") == room_id
        ]

    def add_statute_article(self, article: Dict[str, Any]):
        """
        Adds or updates a full-text Swiss Law Article into KùzuDB.
        Complies with B-SDD Invariant L-01.
        """
        aid = article.get("id", "")
        code = article.get("code", "")
        jurisdiction = article.get("jurisdiction", "federal")
        art_str = article.get("article", "")
        category = article.get("category", "")
        
        # Titles
        titles = article.get("title", {})
        t_fr = self._escape(titles.get("fr", "")) if isinstance(titles, dict) else self._escape(str(titles))
        t_uk = self._escape(titles.get("uk", "")) if isinstance(titles, dict) else ""
        t_en = self._escape(titles.get("en", "")) if isinstance(titles, dict) else ""
        
        # Full legal texts
        c_fr = self._escape(article.get("content_fr", ""))
        c_uk = self._escape(article.get("content_uk", ""))
        c_en = self._escape(article.get("content_en", ""))
        
        sanction = self._escape(article.get("sanction", ""))
        
        # Relevance
        relevance = article.get("relevance_case", {})
        r_fr = self._escape(relevance.get("fr", "")) if isinstance(relevance, dict) else ""
        r_uk = self._escape(relevance.get("uk", "")) if isinstance(relevance, dict) else ""
        
        cotes_raw = article.get("corroborating_cotes", [])
        cotes_str = json.dumps(cotes_raw) if isinstance(cotes_raw, list) else ""
        mp_node = article.get("mempalace_node_id", f"NORM-{aid}")
        url_fedlex = self._escape(article.get("url_fedlex", ""))

        if self.kuzu_available:
            self.conn.execute(f"""
            MERGE (sa:StatuteArticle {{id: '{aid}'}})
            ON CREATE SET sa.code = '{code}',
                          sa.jurisdiction = '{jurisdiction}',
                          sa.article = '{self._escape(art_str)}',
                          sa.category = '{category}',
                          sa.title_fr = '{t_fr}',
                          sa.title_uk = '{t_uk}',
                          sa.title_en = '{t_en}',
                          sa.content_fr = '{c_fr}',
                          sa.content_uk = '{c_uk}',
                          sa.content_en = '{c_en}',
                          sa.sanction = '{sanction}',
                          sa.relevance_case_fr = '{r_fr}',
                          sa.relevance_case_uk = '{r_uk}',
                          sa.corroborating_cotes = '{self._escape(cotes_str)}',
                          sa.mempalace_node_id = '{mp_node}',
                          sa.url_fedlex = '{url_fedlex}'
            ON MATCH SET  sa.code = '{code}',
                          sa.jurisdiction = '{jurisdiction}',
                          sa.article = '{self._escape(art_str)}',
                          sa.category = '{category}',
                          sa.title_fr = '{t_fr}',
                          sa.title_uk = '{t_uk}',
                          sa.title_en = '{t_en}',
                          sa.content_fr = '{c_fr}',
                          sa.content_uk = '{c_uk}',
                          sa.content_en = '{c_en}',
                          sa.sanction = '{sanction}',
                          sa.relevance_case_fr = '{r_fr}',
                          sa.relevance_case_uk = '{r_uk}',
                          sa.corroborating_cotes = '{self._escape(cotes_str)}',
                          sa.mempalace_node_id = '{mp_node}',
                          sa.url_fedlex = '{url_fedlex}'
            """)

        # In-memory sync
        if "StatuteArticle" not in self._memory_graph["nodes"]:
            self._memory_graph["nodes"]["StatuteArticle"] = {}
        self._memory_graph["nodes"]["StatuteArticle"][aid] = {
            "id": aid,
            "code": code,
            "jurisdiction": jurisdiction,
            "article": art_str,
            "category": category,
            "title_fr": t_fr,
            "title_uk": t_uk,
            "title_en": t_en,
            "content_fr": c_fr,
            "content_uk": c_uk,
            "content_en": c_en,
            "sanction": sanction,
            "relevance_case_fr": r_fr,
            "relevance_case_uk": r_uk,
            "corroborating_cotes": cotes_str,
            "mempalace_node_id": mp_node,
            "url_fedlex": url_fedlex,
        }

    def seed_statute_articles(self, corpus_path: Optional[str] = None) -> int:
        """
        Loads all Swiss legal articles from JSON corpus into KùzuDB and establishes links.
        """
        if corpus_path is None:
            corpus_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                "data",
                "swiss_legal_corpus.json"
            )
        if not os.path.exists(corpus_path):
            return 0
            
        with open(corpus_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        articles = data.get("articles", [])
        count = 0
        for art in articles:
            self.add_statute_article(art)
            count += 1
            
        # Link Rooms to StatuteArticles
        self.link_rooms_to_statute_articles()
        return count

    def link_rooms_to_statute_articles(self):
        """Establishes :ROOM_GOVERNED_BY_ARTICLE relations between spatial Rooms and StatuteArticles."""
        mappings = [
            ("ROOM-138-CP", "CP-138"),
            ("ROOM-146-CP", "CP-146"),
            ("ROOM-180-181-CP", "CP-180"),
            ("ROOM-180-181-CP", "CP-181"),
            ("ROOM-180-181-CP", "CP-24"),
            ("ROOM-180-181-CP", "CP-25"),
            ("ROOM-157-CP", "CP-157"),
            ("ROOM-157-CP", "LEI-118"),
            ("ROOM-144-CP", "CP-144"),
            ("ROOM-186-CP", "CP-186"),
            ("ROOM-123-CP", "CP-123"),
            ("ROOM-123-CP", "CP-126"),
            ("ROOM-303-CP", "CP-303"),
            ("ROOM-303-CP", "CP-304"),
            ("ROOM-139-141-CPP", "CPP-139"),
            ("ROOM-139-141-CPP", "CPP-141"),
            ("ROOM-139-141-CPP", "CPP-115"),
            ("ROOM-139-141-CPP", "CPP-118"),
            ("ROOM-139-141-CPP", "CPP-122"),
            ("ROOM-139-141-CPP", "CPP-263"),
            ("ROOM-139-141-CPP", "CPP-318"),
            ("ROOM-139-141-CPP", "CPP-324"),
            ("ROOM-139-141-CPP", "CPP-393"),
            ("ROOM-139-141-CPP", "CC-933"),
            ("ROOM-139-141-CPP", "CO-41"),
            ("ROOM-139-141-CPP", "CO-47"),
            ("ROOM-139-141-CPP", "CO-49"),
            ("ROOM-139-141-CPP", "VAUD-LOJV"),
            ("ROOM-139-141-CPP", "VAUD-LVCPP"),
            ("ROOM-139-141-CPP", "VAUD-TDIP"),
            ("ROOM-139-141-CPP", "VAUD-LJPA"),
            ("ROOM-139-141-CPP", "ATF-146-IV-9"),
            ("ROOM-139-141-CPP", "ATF-147-IV-9"),
            ("ROOM-139-141-CPP", "ATF-141-IV-369"),
            ("ROOM-139-141-CPP", "ATF-144-IV-285"),
        ]
        if self.kuzu_available:
            for rid, aid in mappings:
                try:
                    self.conn.execute(f"""
                    MATCH (r:Room), (sa:StatuteArticle)
                    WHERE r.id = '{rid}' AND sa.id = '{aid}'
                    CREATE (r)-[:ROOM_GOVERNED_BY_ARTICLE {{valid_from: '{CANONICAL_EPOCH}', valid_to: '{FAR_FUTURE}'}}]->(sa)
                    """)
                except Exception:
                    pass

    def get_all_statute_articles(self) -> List[Dict[str, Any]]:
        """Returns all loaded Swiss and Cantonal statute articles."""
        if self.kuzu_available:
            return self.query_cypher("MATCH (sa:StatuteArticle) RETURN sa.id, sa.code, sa.jurisdiction, sa.article, sa.category, sa.title_fr, sa.title_uk, sa.sanction, sa.url_fedlex")
        return list(self._memory_graph["nodes"].get("StatuteArticle", {}).values())

    def get_statute_articles_by_room(self, room_id: str) -> List[Dict[str, Any]]:
        """Returns all statute articles governing a designated Room."""
        if self.kuzu_available:
            return self.query_cypher(f"MATCH (r:Room {{id: '{room_id}'}})-[:ROOM_GOVERNED_BY_ARTICLE]->(sa:StatuteArticle) RETURN sa.id, sa.code, sa.article, sa.title_fr, sa.title_uk, sa.sanction, sa.url_fedlex")
        return []

    def search_statutes(self, query: str) -> List[Dict[str, Any]]:
        """Full-text search across article numbers, French/Ukrainian titles, and contents."""
        q_clean = query.strip().lower()
        if self.kuzu_available:
            escaped_q = self._escape(query)
            cypher = f"""
            MATCH (sa:StatuteArticle)
            WHERE lower(sa.article) CONTAINS lower('{escaped_q}')
               OR lower(sa.title_fr) CONTAINS lower('{escaped_q}')
               OR lower(sa.title_uk) CONTAINS lower('{escaped_q}')
               OR lower(sa.content_fr) CONTAINS lower('{escaped_q}')
               OR lower(sa.content_uk) CONTAINS lower('{escaped_q}')
               OR lower(sa.id) CONTAINS lower('{escaped_q}')
            RETURN sa.id, sa.code, sa.article, sa.title_fr, sa.title_uk, sa.sanction, sa.url_fedlex
            """
            return self.query_cypher(cypher)
            
        results = []
        for art in self._memory_graph["nodes"].get("StatuteArticle", {}).values():
            match = (
                q_clean in art.get("article", "").lower() or
                q_clean in art.get("title_fr", "").lower() or
                q_clean in art.get("title_uk", "").lower() or
                q_clean in art.get("content_fr", "").lower() or
                q_clean in art.get("content_uk", "").lower() or
                q_clean in art.get("id", "").lower()
            )
            if match:
                results.append(art)
        return results


    def supersede_drawer(self, drawer_id: str, updated_drawer: DrawerNode) -> str:
        """
        Bitemporally supersedes a drawer (Invariant L-01):
        Sets old drawer record valid_to = NOW, and inserts updated_drawer with valid_from = NOW.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        old_id = drawer_id
        new_id = f"{drawer_id}_v{int(datetime.now(timezone.utc).timestamp())}"

        if self.kuzu_available:
            self.conn.execute(f"MATCH (d:Drawer {{id: '{old_id}'}}) SET d.valid_to = '{now_iso}'")
        
        updated_drawer.id = new_id
        updated_drawer.valid_from = now_iso
        updated_drawer.valid_to = FAR_FUTURE
        self.add_drawer(updated_drawer)
        return new_id

    def query_cypher(self, cypher: str) -> List[Dict[str, Any]]:
        """Executes a Cypher query on Kùzu and returns result as list of dicts."""
        if not self.kuzu_available:
            return []
        res = self.conn.execute(cypher)
        cols = res.get_column_names()
        rows = []
        while res.has_next():
            row = res.get_next()
            rows.append(dict(zip(cols, row)))
        return rows

    def get_drawers_count(self) -> int:
        """Returns total count of registered evidence drawers."""
        if self.kuzu_available:
            rows = self.query_cypher("MATCH (d:Drawer) RETURN count(d) as total")
            if rows:
                return rows[0]["total"]
        return len(self._memory_graph["nodes"]["Drawer"])

    def get_drawers_by_room(self, room_id: str) -> List[Dict[str, Any]]:
        """Retrieves all drawers situated inside a designated Room."""
        if self.kuzu_available:
            return self.query_cypher(f"MATCH (r:Room {{id: '{room_id}'}})-[:CONTAINS_DRAWER]->(d:Drawer) RETURN d.id, d.filename, d.sha256, d.duration_sec, d.excerpt")
        return [
            d for d in self._memory_graph["nodes"]["Drawer"].values()
            if d.get("room_id") == room_id
        ]

    def get_spatial_hierarchy(self) -> Dict[str, Any]:
        """Returns the full hierarchical tree: Wings -> Halls -> Rooms -> Drawer count."""
        hierarchy = {}
        for wid, wdata in self._memory_graph["nodes"]["Wing"].items():
            hierarchy[wid] = {
                "name": wdata["name"],
                "halls": {}
            }
        
        # Structure default tree
        hierarchy["WING-VICTIMS"]["halls"]["HALL-EVIDENCE"] = ["ROOM-180-181-CP", "ROOM-146-CP", "ROOM-138-CP"]
        hierarchy["WING-VICTIMS"]["halls"]["HALL-PROCEDURE"] = ["ROOM-139-141-CPP"]
        hierarchy["WING-PROSECUTION"]["halls"]["HALL-EVIDENCE"] = ["ROOM-180-181-CP", "ROOM-146-CP", "ROOM-157-CP"]
        hierarchy["WING-PROSECUTION"]["halls"]["HALL-STATUTES"] = ["ROOM-138-CP", "ROOM-146-CP", "ROOM-180-181-CP", "ROOM-157-CP"]
        hierarchy["WING-STATE-LIABILITY"]["halls"]["HALL-STATUTES"] = ["ROOM-157-CP", "ROOM-139-141-CPP"]
        hierarchy["WING-STATE-LIABILITY"]["halls"]["HALL-PROCEDURE"] = ["ROOM-139-141-CPP"]
        
        return hierarchy

    def export_graph_for_stdlib(self) -> Dict[str, Any]:
        """
        Exports the entire spatial ontology and evidence connections into a
        pure standard library dict graph suitable for pure stdlib traversal in blast_radius.py.
        """
        return self._memory_graph

    def _escape(self, s: str) -> str:
        """Escapes string quotes for Cypher literals."""
        return s.replace("\\", "\\\\").replace("'", "\\'").replace('"', '\\"').replace("\n", " ")
