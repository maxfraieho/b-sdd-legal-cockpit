#!/usr/bin/env python3
"""
B-SDD Legal Advocate Cockpit: Code & Documentation Dumps Generator for NotebookLM.
Generates full-text structured, privacy-compliant dumps for Frontend, Backend, and Canonical Docs.
Standard: B-SDD Methodology v1.3 (Invariants L-01..L-05).
Splits dumps into sub-700KB chunks to ensure 100% full-text rendering inside NotebookLM web UI.
"""
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = PROJECT_ROOT / "dist" / "dumps"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

FRONTEND_SRC = PROJECT_ROOT / "b-sdd-legal-ui" / "src"
BACKEND_DIRS = [
    PROJECT_ROOT / "src" / "legal",
    PROJECT_ROOT / "src" / "core",
    PROJECT_ROOT / "specs",
    PROJECT_ROOT / "tests",
    PROJECT_ROOT / "daemon",
    PROJECT_ROOT / "deploy",
    PROJECT_ROOT / "scripts",
]

IGNORE_DIRS = {
    "node_modules", ".git", ".gitnexus", "dist", "build", "__pycache__",
    ".pytest_cache", ".private", "vault", "evidence_vault", "colab_evidence"
}
IGNORE_EXTS = {
    ".png", ".jpg", ".jpeg", ".mp3", ".wav", ".m4a", ".epub", ".pdf", ".pyc", ".ico"
}

def collect_files(target_paths: list[Path]) -> list[Path]:
    collected = []
    for p in target_paths:
        if not p.exists():
            continue
        if p.is_file():
            if p.suffix.lower() not in IGNORE_EXTS and not p.name.startswith("."):
                collected.append(p)
        elif p.is_dir():
            for root, dirs, files in os.walk(p):
                dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith(".")]
                for f in sorted(files):
                    fp = Path(root) / f
                    if fp.suffix.lower() not in IGNORE_EXTS and not f.startswith("."):
                        collected.append(fp)
    return sorted(list(set(collected)))

def write_dump(files: list[Path], output_file: Path, title: str):
    with open(output_file, "w", encoding="utf-8") as out:
        out.write(f"# {title}\n")
        out.write(f"# Version: v2.7.1 (S00 Pre-Stage-0 Remediation Edition)\n")
        out.write(f"# Standard: B-SDD Methodology v1.3 / ISO-IEC 27037\n")
        out.write(f"# Files Count: {len(files)}\n\n")
        out.write("=" * 80 + "\n\n")

        for fp in files:
            try:
                rel_path = fp.relative_to(PROJECT_ROOT)
            except ValueError:
                rel_path = fp.name

            out.write(f"// FILE: {rel_path}\n")
            out.write("-" * 80 + "\n")
            try:
                content = fp.read_text(encoding="utf-8", errors="replace")
                out.write(content)
                if not content.endswith("\n"):
                    out.write("\n")
            except Exception as e:
                out.write(f"// Error reading file: {e}\n")
            out.write("\n\n" + "=" * 80 + "\n\n")

    size_kb = output_file.stat().st_size / 1024
    print(f"[OK] Generated {output_file.name} ({len(files)} files, {size_kb:.1f} KB)")


def main():
    print("==============================================================================")
    print(" [B-SDD] Generating Sub-700KB Modular Code Dumps for NotebookLM & External Audit")
    print("==============================================================================")

    # 1. Backend Dump (Pure Python Core, Invariants, Preflight Compiler, Daemon, Specs, Tests)
    backend_files = collect_files(BACKEND_DIRS)
    backend_dump = OUTPUT_DIR / "b-sdd-legal-backend-dump-v2.7.1.txt"
    write_dump(
        files=backend_files,
        output_file=backend_dump,
        title="B-SDD Legal Advocate Cockpit: Backend Source Code Dump (Pure Python Core / Invariants / Daemon / Specs / Tests)"
    )

    # 2. Frontend Views Dump
    views_targets = [
        FRONTEND_SRC / "components" / "AdvocateActionCenter.tsx",
        FRONTEND_SRC / "components" / "AiLegalCopilotView.tsx",
        FRONTEND_SRC / "components" / "EvidenceFactbook.tsx",
        FRONTEND_SRC / "components" / "EvidenceIngestionWizard.tsx",
        FRONTEND_SRC / "components" / "ActorsRegistryView.tsx",
        FRONTEND_SRC / "components" / "ActorIngestionWizard.tsx",
        FRONTEND_SRC / "components" / "ProceduralWorkflowView.tsx",
        FRONTEND_SRC / "components" / "PleadingsView.tsx",
        FRONTEND_SRC / "components" / "KindleVoiceReview.tsx",
        FRONTEND_SRC / "components" / "ToolsCatalogView.tsx",
        FRONTEND_SRC / "components" / "WormLedgerView.tsx",
        FRONTEND_SRC / "components" / "LegalInspector.tsx",
        FRONTEND_SRC / "components" / "Topbar.tsx",
        FRONTEND_SRC / "components" / "ActionDock.tsx",
        FRONTEND_SRC / "components" / "AudioWaveformVisualizer.tsx",
        FRONTEND_SRC / "components" / "MobileBottomNav.tsx",
        FRONTEND_SRC / "components" / "MobileQuickMenuSheet.tsx",
    ]
    views_files = collect_files(views_targets)
    frontend_views_dump = OUTPUT_DIR / "b-sdd-legal-frontend-views-v2.7.1.txt"
    write_dump(
        files=views_files,
        output_file=frontend_views_dump,
        title="B-SDD Legal Advocate Cockpit: Frontend Views & Action Center (React 19 / TypeScript / Cockpit Views)"
    )

    # 3. Frontend Modals Dump
    modals_targets = [
        FRONTEND_SRC / "components" / "AuthGate.tsx",
        FRONTEND_SRC / "components" / "SettingsModal.tsx",
        FRONTEND_SRC / "components" / "LegalStrategyModal.tsx",
        FRONTEND_SRC / "components" / "DocumentationModal.tsx",
        FRONTEND_SRC / "components" / "GlossaryModal.tsx",
        FRONTEND_SRC / "components" / "LegalGlossaryModal.tsx",
        FRONTEND_SRC / "components" / "FeedbackSupervisorModal.tsx",
        FRONTEND_SRC / "components" / "GoogleDriveBrowserModal.tsx",
        FRONTEND_SRC / "components" / "AdvocateVoiceNotesModal.tsx",
        FRONTEND_SRC / "components" / "CaseSyncModal.tsx",
        FRONTEND_SRC / "components" / "SwissCodesModal.tsx",
        FRONTEND_SRC / "components" / "CaseManagerModal.tsx",
        FRONTEND_SRC / "components" / "JudicialBundleModal.tsx",
        FRONTEND_SRC / "components" / "ManualEditModal.tsx",
        FRONTEND_SRC / "components" / "astryx",
        FRONTEND_SRC / "components" / "boundaries",
    ]
    modals_files = collect_files(modals_targets)
    frontend_modals_dump = OUTPUT_DIR / "b-sdd-legal-frontend-modals-v2.7.1.txt"
    write_dump(
        files=modals_files,
        output_file=frontend_modals_dump,
        title="B-SDD Legal Advocate Cockpit: Frontend Modals & Security Gate (React 19 / AuthGate / Dialogs / Astryx)"
    )

    # 4. Frontend Core & State Dump
    frontend_core_targets = [
        FRONTEND_SRC / "App.tsx",
        FRONTEND_SRC / "main.tsx",
        FRONTEND_SRC / "data",
        FRONTEND_SRC / "lib",
        FRONTEND_SRC / "types",
        FRONTEND_SRC / "context",
        FRONTEND_SRC / "hooks",
        PROJECT_ROOT / "b-sdd-legal-ui" / "package.json",
        PROJECT_ROOT / "b-sdd-legal-ui" / "vite.config.ts"
    ]
    frontend_core_files = collect_files(frontend_core_targets)
    frontend_core_dump = OUTPUT_DIR / "b-sdd-legal-frontend-core-v2.7.1.txt"
    write_dump(
        files=frontend_core_files,
        output_file=frontend_core_dump,
        title="B-SDD Legal Advocate Cockpit: Frontend Core, State & Appwrite SDK (React 19 / Data Models / Codes)"
    )

    print("\nAll modular code dumps compiled successfully in dist/dumps/")

if __name__ == "__main__":
    main()
