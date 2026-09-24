"""
B-SDD Legal MCP Gateway Toolkit: Documentation & Architecture Planning.
Enables AI Architects (Gemini Spark / Google AI Studio / Claude / agy) to:
1. Browse and read all architectural specifications, ADRs, and guides.
2. Create and update system documentation directly in docs/.
3. Formulate, save, list, and retrieve structured implementation plans in docs/plans/.

100% Pure Python Standard Library (ADR-002 / Invariant L-02).
"""
import hashlib
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# Base directories resolution
CURRENT_FILE = Path(__file__).resolve()
GATEWAY_DIR = CURRENT_FILE.parent

# Discover project roots
LEGAL_ROOT = Path("/home/vokov/projects/b-sdd-legal")
if not LEGAL_ROOT.exists():
    LEGAL_ROOT = GATEWAY_DIR.parent.parent

LEGAL_DOCS_DIR = LEGAL_ROOT / "docs"
LEGAL_PLANS_DIR = LEGAL_DOCS_DIR / "plans"
BSDD_DOCS_DIR = Path("/home/vokov/projects/b-sdd/docs")

# Ensure dirs exist
try:
    LEGAL_DOCS_DIR.mkdir(parents=True, exist_ok=True)
    LEGAL_PLANS_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    pass


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _extract_title_and_desc(content: str) -> tuple[str, str]:
    """Extracts first H1 title and first paragraph from markdown."""
    title = "Untitled Document"
    desc = ""
    lines = [line.strip() for line in content.split("\n")]
    for line in lines:
        if line.startswith("# "):
            title = line.lstrip("# ").strip()
            break
        elif line.startswith("## ") and title == "Untitled Document":
            title = line.lstrip("# ").strip()

    # Find first descriptive text block
    for line in lines:
        if line and not line.startswith("#") and not line.startswith(">") and not line.startswith("```") and not line.startswith("-") and not line.startswith("["):
            desc = line[:200]
            break

    return title, desc


def _resolve_doc_path(raw_path: str) -> Optional[Path]:
    """Safely resolves document path preventing directory traversal outside allowed roots."""
    cleaned = raw_path.strip().lstrip("/")
    
    # Check in LEGAL_DOCS_DIR
    target = (LEGAL_DOCS_DIR / cleaned).resolve()
    if target.is_relative_to(LEGAL_DOCS_DIR) and target.exists() and target.is_file():
        return target

    # Check directly under LEGAL_ROOT (e.g. README.md)
    root_target = (LEGAL_ROOT / cleaned).resolve()
    if root_target.is_relative_to(LEGAL_ROOT) and root_target.exists() and root_target.is_file():
        return root_target

    # Check in BSDD_DOCS_DIR if exists
    if BSDD_DOCS_DIR.exists():
        bsdd_target = (BSDD_DOCS_DIR / cleaned).resolve()
        if bsdd_target.is_relative_to(BSDD_DOCS_DIR) and bsdd_target.exists() and bsdd_target.is_file():
            return bsdd_target

    # Fuzzy match by filename in LEGAL_DOCS_DIR
    fname = Path(cleaned).name.lower()
    for p in LEGAL_DOCS_DIR.rglob("*.md"):
        if p.name.lower() == fname:
            return p

    # Fuzzy match in BSDD_DOCS_DIR
    if BSDD_DOCS_DIR.exists():
        for p in BSDD_DOCS_DIR.glob("*.md"):
            if p.name.lower() == fname:
                return p

    return None


def docs_list(category: Optional[str] = "all") -> Dict[str, Any]:
    """
    Lists all available system documentation, architecture specifications,
    ADRs, feedback loops, and guides.
    """
    items = []
    seen_paths = set()

    def scan_dir(base_dir: Path, cat_label: str):
        if not base_dir.exists():
            return
        for p in base_dir.rglob("*.md"):
            if p.is_file() and "node_modules" not in str(p) and ".git" not in str(p):
                rel_path = str(p.relative_to(base_dir.parent if base_dir.name == "docs" else base_dir))
                if str(p) in seen_paths:
                    continue
                seen_paths.add(str(p))

                try:
                    stat = p.stat()
                    content = p.read_text(encoding="utf-8", errors="ignore")
                    title, desc = _extract_title_and_desc(content)
                    items.append({
                        "filename": p.name,
                        "path": str(p),
                        "relative_path": rel_path,
                        "title": title,
                        "description": desc,
                        "category": "plan" if "plans" in str(p) else cat_label,
                        "size_bytes": stat.st_size,
                        "modified_at": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
                    })
                except Exception:
                    pass

    # Scan legal docs
    scan_dir(LEGAL_DOCS_DIR, "legal_specification")
    # Scan root README
    readme_path = LEGAL_ROOT / "README.md"
    if readme_path.exists():
        try:
            stat = readme_path.stat()
            content = readme_path.read_text(encoding="utf-8", errors="ignore")
            title, desc = _extract_title_and_desc(content)
            items.append({
                "filename": "README.md",
                "path": str(readme_path),
                "relative_path": "README.md",
                "title": title,
                "description": desc,
                "category": "system_overview",
                "size_bytes": stat.st_size,
                "modified_at": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
            })
        except Exception:
            pass

    # Scan general BSDD docs if present
    if BSDD_DOCS_DIR.exists() and BSDD_DOCS_DIR != LEGAL_DOCS_DIR:
        scan_dir(BSDD_DOCS_DIR, "bsdd_framework")

    if category and category != "all":
        items = [i for i in items if i["category"] == category]

    return {
        "status": "ok",
        "total_documents": len(items),
        "documents": sorted(items, key=lambda x: x["relative_path"])
    }


def docs_read(doc_path: str, max_chars: Optional[int] = None) -> Dict[str, Any]:
    """
    Reads a markdown documentation or specification file by path or filename.
    """
    resolved = _resolve_doc_path(doc_path)
    if not resolved:
        return {
            "error": f"Document '{doc_path}' not found in docs directories.",
            "suggestion": "Call 'legal_docs_list' to view all available documents."
        }

    try:
        content = resolved.read_text(encoding="utf-8", errors="ignore")
        stat = resolved.stat()
        title, desc = _extract_title_and_desc(content)

        truncated = False
        if max_chars and len(content) > max_chars:
            content = content[:max_chars] + f"\n\n... [TRUNCATED at {max_chars} chars, total length: {len(content)}]"
            truncated = True

        return {
            "status": "ok",
            "filename": resolved.name,
            "path": str(resolved),
            "title": title,
            "description": desc,
            "content": content,
            "truncated": truncated,
            "character_count": stat.st_size,
            "line_count": len(content.splitlines()),
            "word_count": len(content.split()),
            "sha256_hash": _sha256(content),
            "modified_at": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
        }
    except Exception as e:
        return {"error": f"Failed to read '{resolved}': {str(e)}"}


def docs_write(
    doc_path: str,
    content: str,
    mode: str = "overwrite",
    author: str = "Gemini Spark Architect",
    comment: Optional[str] = None
) -> Dict[str, Any]:
    """
    Creates or updates a documentation file in docs/.
    Guarantees path confinement inside docs/ to prevent path traversal.
    """
    cleaned = doc_path.strip().lstrip("/")
    if ".." in cleaned:
        return {"error": "Path traversal ('..') is strictly prohibited."}

    # Normalize target path within LEGAL_DOCS_DIR
    target = (LEGAL_DOCS_DIR / cleaned).resolve()
    if not str(target).startswith(str(LEGAL_DOCS_DIR.resolve())):
        return {"error": f"Destination must reside within {LEGAL_DOCS_DIR}"}

    try:
        target.parent.mkdir(parents=True, exist_ok=True)
        now_iso = datetime.now(timezone.utc).isoformat()

        if mode == "append" and target.exists():
            existing = target.read_text(encoding="utf-8", errors="ignore")
            new_content = existing + "\n\n" + f"<!-- Appended by {author} at {now_iso} -->\n" + content
            action = "appended"
        else:
            new_content = content
            action = "created" if not target.exists() else "overwritten"

        target.write_text(new_content, encoding="utf-8")
        h = _sha256(new_content)

        return {
            "status": "ok",
            "action": action,
            "filename": target.name,
            "path": str(target),
            "size_bytes": len(new_content.encode("utf-8")),
            "word_count": len(new_content.split()),
            "sha256_hash": h,
            "author": author,
            "comment": comment or f"Document {action} by {author}",
            "updated_at": now_iso
        }
    except Exception as e:
        return {"error": f"Failed to write document '{doc_path}': {str(e)}"}


def plan_save(
    plan_id: str,
    title: str,
    objective: str,
    content: str,
    steps: Optional[List[str]] = None,
    status: str = "DRAFT",
    tags: Optional[List[str]] = None,
    author: str = "Gemini Spark Architect"
) -> Dict[str, Any]:
    """
    Saves a formal strategic, architectural, or procedural plan.
    Stores both structured JSON (docs/plans/{plan_id}.json) and Markdown (docs/plans/{plan_id}.md).
    """
    clean_id = re.sub(r"[^A-Za-z0-9_-]", "-", plan_id).strip("-").upper()
    if not clean_id:
        return {"error": "Invalid plan_id. Must contain alphanumeric characters, hyphens or underscores."}

    LEGAL_PLANS_DIR.mkdir(parents=True, exist_ok=True)
    json_path = LEGAL_PLANS_DIR / f"{clean_id}.json"
    md_path = LEGAL_PLANS_DIR / f"{clean_id}.md"

    now_iso = datetime.now(timezone.utc).isoformat()
    created_at = now_iso

    # Preserve original created_at if updating existing plan
    if json_path.exists():
        try:
            prev = json.loads(json_path.read_text(encoding="utf-8"))
            created_at = prev.get("created_at", now_iso)
        except Exception:
            pass

    plan_payload = {
        "plan_id": clean_id,
        "title": title,
        "objective": objective,
        "status": status.upper(),
        "tags": tags or ["b-sdd", "legal", "spark"],
        "author": author,
        "created_at": created_at,
        "updated_at": now_iso,
        "steps": steps or [],
        "content": content
    }

    # 1. Write structured JSON
    try:
        json_path.write_text(json.dumps(plan_payload, indent=2, ensure_ascii=False), encoding="utf-8")
    except Exception as e:
        return {"error": f"Failed to save JSON plan: {e}"}

    # 2. Render clean Markdown
    steps_md = ""
    if steps:
        steps_md = "## Action Checklist\n" + "\n".join([f"- [ ] {step}" for step in steps]) + "\n\n"

    tags_str = ", ".join(plan_payload["tags"])
    md_content = f"""# {title}
> **Plan ID:** `{clean_id}`  
> **Status:** `{plan_payload['status']}` | **Author:** {author}  
> **Created:** {created_at} | **Updated:** {now_iso}  
> **Tags:** `{tags_str}`

## Strategic Objective
{objective}

{steps_md}## Implementation Specification & Details
{content}

---
*Generated and tracked by B-SDD Sovereign Plan Registry.*
"""
    try:
        md_path.write_text(md_content, encoding="utf-8")
    except Exception as e:
        return {"error": f"Failed to save Markdown plan: {e}"}

    return {
        "status": "ok",
        "action": "plan_saved",
        "plan_id": clean_id,
        "title": title,
        "plan_status": plan_payload["status"],
        "json_path": str(json_path),
        "md_path": str(md_path),
        "sha256_hash": _sha256(md_content),
        "updated_at": now_iso
    }


def plans_list(status: Optional[str] = None, tag: Optional[str] = None) -> Dict[str, Any]:
    """
    Lists all saved implementation and architectural plans in docs/plans/.
    """
    if not LEGAL_PLANS_DIR.exists():
        return {"status": "ok", "total_plans": 0, "plans": []}

    plans = []
    for p in LEGAL_PLANS_DIR.glob("*.json"):
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
            if status and data.get("status", "").upper() != status.upper():
                continue
            if tag and tag.lower() not in [t.lower() for t in data.get("tags", [])]:
                continue

            plans.append({
                "plan_id": data.get("plan_id", p.stem),
                "title": data.get("title", "Untitled Plan"),
                "objective": data.get("objective", ""),
                "status": data.get("status", "DRAFT"),
                "author": data.get("author", "Unknown"),
                "tags": data.get("tags", []),
                "step_count": len(data.get("steps", [])),
                "created_at": data.get("created_at", ""),
                "updated_at": data.get("updated_at", ""),
                "json_path": str(p),
                "md_path": str(p.with_suffix(".md")),
            })
        except Exception:
            pass

    return {
        "status": "ok",
        "total_plans": len(plans),
        "plans": sorted(plans, key=lambda x: x.get("updated_at", ""), reverse=True)
    }


def plan_get(plan_id: str) -> Dict[str, Any]:
    """
    Retrieves the full content and execution steps of a saved plan.
    """
    clean_id = re.sub(r"[^A-Za-z0-9_-]", "-", plan_id).strip("-").upper()
    json_path = LEGAL_PLANS_DIR / f"{clean_id}.json"
    if not json_path.exists():
        # Fallback search
        found = list(LEGAL_PLANS_DIR.glob(f"*{clean_id}*.json"))
        if found:
            json_path = found[0]
        else:
            return {
                "error": f"Plan '{plan_id}' not found.",
                "suggestion": "Call 'legal_plans_list' to view all available plans."
            }

    try:
        data = json.loads(json_path.read_text(encoding="utf-8"))
        return {
            "status": "ok",
            "plan": data
        }
    except Exception as e:
        return {"error": f"Failed to parse plan '{json_path}': {e}"}


def get_tools_spec() -> List[Dict[str, Any]]:
    """Returns tool schemas for documentation and planning."""
    return [
        {
            "name": "legal_docs_list",
            "description": "Lists all system documentation, architecture specifications, ADRs, feedback loops, and guides available in the repository.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "description": "Filter by category: 'legal_specification', 'architecture', 'feedback_loop', 'plan', 'bsdd_framework', or 'all'.",
                        "default": "all"
                    }
                }
            }
        },
        {
            "name": "legal_docs_read",
            "description": "Reads full content of a documentation or specification file by path or filename (e.g. 'B_SDD_LEGAL_SYSTEM_SPECIFICATION_AND_ARCHITECTURE.md', 'FEEDBACK_LOOP_SPEC.md', 'README.md').",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "doc_path": {
                        "type": "string",
                        "description": "Path or filename of the document to read."
                    },
                    "max_chars": {
                        "type": "integer",
                        "description": "Optional maximum characters to return to conserve tokens."
                    }
                },
                "required": ["doc_path"]
            }
        },
        {
            "name": "legal_docs_write",
            "description": "Creates or updates a documentation file in docs/ (e.g. 'docs/SPARK_ANALYSIS_CHG180.md'). Securely restricted to docs directory.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "doc_path": {
                        "type": "string",
                        "description": "Relative file path inside docs/ (e.g. 'SPARK_ANALYSIS.md' or 'architecture/ADR-007.md')."
                    },
                    "content": {
                        "type": "string",
                        "description": "Markdown content to write."
                    },
                    "mode": {
                        "type": "string",
                        "enum": ["overwrite", "append"],
                        "description": "Write mode: 'overwrite' (replaces file) or 'append' (adds to end of file).",
                        "default": "overwrite"
                    },
                    "author": {
                        "type": "string",
                        "description": "Author of this change (e.g. 'Gemini Spark Architect').",
                        "default": "Gemini Spark Architect"
                    },
                    "comment": {
                        "type": "string",
                        "description": "Changelog note or reason for edit."
                    }
                },
                "required": ["doc_path", "content"]
            }
        },
        {
            "name": "legal_plan_save",
            "description": "Saves a structured strategic, architectural, or procedural plan to docs/plans/. Stores both JSON and Markdown formats for permanent tracking.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "plan_id": {
                        "type": "string",
                        "description": "Unique plan ID (e.g. 'PLAN-SPARK-2026-001-AUTO-TRANSLATE')."
                    },
                    "title": {
                        "type": "string",
                        "description": "Short concise title of the plan."
                    },
                    "objective": {
                        "type": "string",
                        "description": "Main objective and scope of the plan."
                    },
                    "content": {
                        "type": "string",
                        "description": "Full Markdown body of the plan with architecture details, decisions, and instructions."
                    },
                    "steps": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Actionable sequential steps or checklist."
                    },
                    "status": {
                        "type": "string",
                        "enum": ["DRAFT", "ACTIVE", "REVIEW", "APPROVED", "COMPLETED"],
                        "description": "Current lifecycle status of the plan.",
                        "default": "DRAFT"
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Keywords or tags for categorization."
                    },
                    "author": {
                        "type": "string",
                        "description": "Author (e.g. 'Gemini Spark Architect').",
                        "default": "Gemini Spark Architect"
                    }
                },
                "required": ["plan_id", "title", "objective", "content"]
            }
        },
        {
            "name": "legal_plans_list",
            "description": "Lists all saved implementation, strategic, and architectural plans in docs/plans/.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "description": "Optional status filter ('DRAFT', 'ACTIVE', 'APPROVED', etc.)."
                    },
                    "tag": {
                        "type": "string",
                        "description": "Optional tag filter."
                    }
                }
            }
        },
        {
            "name": "legal_plan_get",
            "description": "Retrieves the full content and details of a saved plan by its plan_id.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "plan_id": {
                        "type": "string",
                        "description": "Unique identifier of the plan to retrieve."
                    }
                },
                "required": ["plan_id"]
            }
        }
    ]
