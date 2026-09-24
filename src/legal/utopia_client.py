"""
Utopia DB Bitemporal Client.
100% Pure Python Standard Library (Invariant L-02 / ADR-002).
Direct SQL and bitemporal querying against Utopia DB (192.168.3.251:9922).
"""
import subprocess
from typing import Any, Dict, List, Optional

UTOPIA_HOST = "192.168.3.251"
UTOPIA_PORT = "9922"
UTOPIA_USER = "root"
UTOPIA_PASS = "podroid"


def run_psql(query: str, timeout_sec: int = 10) -> str:
    """
    Executes a SQL query against the utopia-db container on 192.168.3.251
    via SSH and docker exec. Pure stdlib subprocess.
    """
    cmd = [
        "sshpass", "-p", UTOPIA_PASS,
        "ssh", "-p", UTOPIA_PORT,
        "-o", "StrictHostKeyChecking=no",
        "-o", "ConnectTimeout=5",
        f"{UTOPIA_USER}@{UTOPIA_HOST}",
        "docker exec -i utopia-db psql -U utopia -d utopia"
    ]
    try:
        p = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = p.communicate(input=query + "\n", timeout=timeout_sec)
        if p.returncode != 0:
            return f"ERROR ({p.returncode}): {stderr.strip()}"
        return stdout.strip()
    except subprocess.TimeoutExpired:
        return "ERROR: Query timed out."
    except Exception as e:
        return f"ERROR: {e}"


def fetch_forensic_contradictions(limit: int = 20) -> List[Dict[str, str]]:
    """
    Retrieves active forensic bitemporal contradictions from
    vaud_forensic_bitemporal_contradictions table.
    """
    sql = (
        "SELECT fact_id, asserted_by, forensic_status, incompatible_with, legal_qualification "
        f"FROM vaud_forensic_bitemporal_contradictions LIMIT {limit};"
    )
    raw = run_psql(sql)
    if not raw or "ERROR" in raw:
        return []

    lines = [ln.strip() for ln in raw.splitlines() if "|" in ln and not ln.startswith("fact_id") and not ln.startswith("---")]
    rows = []
    for ln in lines:
        parts = [p.strip() for p in ln.split("|")]
        if len(parts) >= 5:
            rows.append({
                "fact_id": parts[0],
                "asserted_by": parts[1],
                "forensic_status": parts[2],
                "incompatible_with": parts[3],
                "legal_qualification": parts[4],
            })
    return rows
