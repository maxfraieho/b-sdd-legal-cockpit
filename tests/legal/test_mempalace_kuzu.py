"""
Test Suite for MemPalace Spatial Ontology and KùzuDB Graph Engine (tests/legal/test_mempalace_kuzu.py).
Validates Invariants L-01, L-03, L-04, and L-05.
"""

import os
from pathlib import Path
import pytest
import tempfile
import shutil

from src.legal.mempalace_kuzu import KuzuMemPalace, DrawerNode, FAR_FUTURE, CANONICAL_EPOCH
from src.legal.transcript_ingest import ingest_all_transcripts, parse_61_transcripts


@pytest.fixture(scope="module")
def shared_mempalace():
    """Initializes a seeded MemPalace instance with all 61 transcripts in a temporary DB."""
    temp_dir = tempfile.mkdtemp(prefix="kuzu_test_mempalace_")
    db_file = os.path.join(temp_dir, "mempalace.db")
    
    mp = KuzuMemPalace(db_path=db_file)
    ingest_all_transcripts(mempalace=mp)
    
    yield mp
    
    # Cleanup
    shutil.rmtree(temp_dir, ignore_errors=True)


class TestMemPalaceKuzu:
    """Test suite validating Kùzu spatial hierarchy, Cypher queries, and invariants."""

    def test_spatial_ontology_structure(self, shared_mempalace):
        """Verifies Wings, Halls, Rooms hierarchy exists in graph."""
        mp = shared_mempalace
        
        # Test Wings
        wings = mp.query_cypher("MATCH (w:Wing) RETURN w.id, w.name")
        wing_ids = {w["w.id"] for w in wings}
        assert "WING-VICTIMS" in wing_ids
        assert "WING-PROSECUTION" in wing_ids
        assert "WING-STATE-LIABILITY" in wing_ids
        assert len(wings) >= 3

        # Test Halls
        halls = mp.query_cypher("MATCH (h:Hall) RETURN h.id, h.name")
        hall_ids = {h["h.id"] for h in halls}
        assert "HALL-EVIDENCE" in hall_ids
        assert "HALL-STATUTES" in hall_ids
        assert "HALL-PROCEDURE" in hall_ids
        assert len(halls) >= 3

        # Test Rooms
        rooms = mp.query_cypher("MATCH (r:Room) RETURN r.id, r.statute")
        room_ids = {r["r.id"] for r in rooms}
        assert "ROOM-138-CP" in room_ids
        assert "ROOM-146-CP" in room_ids
        assert "ROOM-180-181-CP" in room_ids
        assert "ROOM-157-CP" in room_ids
        assert "ROOM-139-141-CPP" in room_ids
        assert len(rooms) >= 5

    def test_invariants_in_mempalace(self, shared_mempalace):
        """Validates Invariant L-03 (Bona Fide Shield) and L-04 (Adult Victim Protection)."""
        mp = shared_mempalace

        # Invariant L-03: Adriano Milli
        milli_res = mp.query_cypher("MATCH (a:Actor {id: 'ACT-ADRIANO-MILLI'}) RETURN a.name, a.bona_fide, a.role")
        assert len(milli_res) == 1
        milli = milli_res[0]
        assert milli["a.bona_fide"] is True, "Invariant L-03 Violation: Adriano Milli must have bona_fide=True"
        assert milli["a.role"] == "tiers_de_bonne_foi"

        # Invariant L-04: Arsen Kovalenko
        arsen_res = mp.query_cypher("MATCH (a:Actor {id: 'ACT-ARSEN-KOVALENKO'}) RETURN a.name, a.birth_date, a.role")
        assert len(arsen_res) == 1
        arsen = arsen_res[0]
        assert arsen["a.birth_date"] == "05.11.1999", "Invariant L-04 Violation: Arsen's birth date must be 05.11.1999"
        assert arsen["a.role"] == "victime_partie_plaignante", "Invariant L-04: Standing must be victim / civil complainant"

    def test_drawers_ingestion_and_sha256_seal(self, shared_mempalace):
        """Validates all 61 Drawers are loaded with valid 64-char SHA-256 seals (Invariant L-05)."""
        mp = shared_mempalace
        count = mp.get_drawers_count()
        assert count == 61, f"Expected 61 evidence drawers, got {count}"

        drawers = mp.query_cypher("MATCH (d:Drawer) RETURN d.id, d.filename, d.sha256, d.duration_sec, d.room_id")
        assert len(drawers) == 61

        for d in drawers:
            sha = d["d.sha256"]
            assert len(sha) == 64, f"Invariant L-05 Violation: Drawer {d['d.id']} has invalid SHA-256 seal length: {len(sha)}"
            assert all(c in "0123456789abcdefABCDEF" for c in sha), f"Invalid hex in SHA-256: {sha}"
            assert d["d.duration_sec"] > 0.0, f"Drawer {d['d.id']} has invalid duration: {d['d.duration_sec']}"
            assert d["d.room_id"] in ["ROOM-180-181-CP", "ROOM-146-CP", "ROOM-138-CP", "ROOM-157-CP", "ROOM-139-141-CPP"]

    def test_bitemporal_supersession(self, shared_mempalace):
        """Validates Invariant L-01: Bitemporal versioning with valid_from / valid_to."""
        mp = shared_mempalace

        original_drawer = DrawerNode(
            id="DRAWER-TR-TEST",
            name="Test Drawer",
            filename="test_audio.mp3",
            sha256="a" * 64,
            duration_sec=42.0,
            room_id="ROOM-180-181-CP",
            valid_from=CANONICAL_EPOCH,
            valid_to=FAR_FUTURE
        )
        mp.add_drawer(original_drawer)

        updated_drawer = DrawerNode(
            id="DRAWER-TR-TEST",
            name="Test Drawer Calibrated",
            filename="test_audio.mp3",
            sha256="b" * 64,
            duration_sec=50.0,
            room_id="ROOM-180-181-CP"
        )
        new_id = mp.supersede_drawer("DRAWER-TR-TEST", updated_drawer)

        # Verify old drawer valid_to is no longer FAR_FUTURE
        old_res = mp.query_cypher("MATCH (d:Drawer {id: 'DRAWER-TR-TEST'}) RETURN d.valid_to")
        assert len(old_res) == 1
        assert old_res[0]["d.valid_to"] != FAR_FUTURE

        # Verify new drawer valid_to is FAR_FUTURE
        new_res = mp.query_cypher(f"MATCH (d:Drawer {{id: '{new_id}'}}) RETURN d.valid_to, d.sha256")
        assert len(new_res) == 1
        assert new_res[0]["d.valid_to"] == FAR_FUTURE
        assert new_res[0]["d.sha256"] == "b" * 64

    def test_query_drawers_by_room(self, shared_mempalace):
        """Validates querying drawers by room."""
        mp = shared_mempalace
        menaces_drawers = mp.get_drawers_by_room("ROOM-180-181-CP")
        assert len(menaces_drawers) > 0
        escroquerie_drawers = mp.get_drawers_by_room("ROOM-146-CP")
        assert len(escroquerie_drawers) > 0

    def test_extended_offense_rooms_and_statutes(self, shared_mempalace):
        """Validates extended offense rooms (ROOM-144-CP, ROOM-186-CP, ROOM-123-CP, ROOM-303-CP)."""
        mp = shared_mempalace
        rooms = mp.query_cypher("MATCH (r:Room) RETURN r.id")
        room_ids = {r["r.id"] for r in rooms}
        assert "ROOM-144-CP" in room_ids
        assert "ROOM-186-CP" in room_ids
        assert "ROOM-123-CP" in room_ids
        assert "ROOM-303-CP" in room_ids

    def test_judicial_evidence_series_and_proves_edges(self, shared_mempalace):
        """Validates Series A..E seeding, Series E photographic items, and :PROVES edges."""
        mp = shared_mempalace
        seeded_count = mp.seed_all_judicial_evidence()
        assert seeded_count == 41

        # Series E query
        series_e = mp.get_judicial_evidence_by_series("E")
        assert len(series_e) == 5

        # Room 144 (glasses destruction) proves query
        r144_evidence = mp.get_judicial_evidence_by_room("ROOM-144-CP")
        assert len(r144_evidence) >= 2

        # Verify Cypher :PROVES edge traversal
        proves_res = mp.query_cypher("MATCH (e:JudicialEvidence)-[:PROVES]->(r:Room {id: 'ROOM-144-CP'}) RETURN e.code, e.sha256")
        assert len(proves_res) >= 2
        for row in proves_res:
            assert len(row["e.sha256"]) == 64

    def test_statute_articles_and_search(self, shared_mempalace):
        """Validates Swiss legal corpus seeding, :ROOM_GOVERNED_BY_ARTICLE relations, and search."""
        mp = shared_mempalace
        articles_count = mp.seed_statute_articles()
        assert articles_count == 35, f"Expected 35 legal articles, got {articles_count}"

        # Test query all
        all_articles = mp.get_all_statute_articles()
        assert len(all_articles) >= 35

        # Test room governed articles
        escroquerie_articles = mp.get_statute_articles_by_room("ROOM-146-CP")
        assert len(escroquerie_articles) >= 1
        assert any("146" in a["sa.article"] for a in escroquerie_articles)

        # Test search
        res_146 = mp.search_statutes("146")
        assert len(res_146) >= 1
        assert any(r["sa.id"] == "CP-146" for r in res_146)

        # Test search ATF 147 IV 9
        res_atf = mp.search_statutes("147 IV 9")
        assert len(res_atf) >= 1
        assert any(r["sa.id"] == "ATF-147-IV-9" for r in res_atf)

