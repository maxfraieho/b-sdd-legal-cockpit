# FORENSIC EVIDENCE INTAKE PROTOCOL

Standard: B-SDD Methodology v1.3 (S00 Pre-Stage-0 Corrections)
Status: MANDATORY OPERATIONAL POLICY
Authority: SpecADR-023 (Evidence and Actor Data Rules) & Invariant L-05
Scope: All raw evidence files, media recordings, transcripts, and scanned records

---

## 1. Scope & Sovereign Vault Architecture

All raw evidence files (photographs, audio recordings, video captures, PDF documents, and scans) reside exclusively in the local sovereign vault (`vault/`) outside of version control. Under no circumstances may raw evidence files be committed to git or uploaded to cloud storage (see `docs/policy/CLOUD_EGRESS.md`).

---

## 2. Seven-Step Operator Intake Checklist

The operator MUST execute the following sequence for every single evidence file before referencing it in any case manifest, analysis routine, or legal report:

### Step 1: Deposit Original into Sovereign Vault Read-Only
- Move or copy the pristine file into the appropriate vault subdirectory:
  - `vault/photos/` for original image captures.
  - `vault/audio/` for original sound recordings.
  - `vault/video/` for video files.
  - `vault/text/` for local text transcripts.
  - `vault/meta/` for forensic extraction metadata and logs.
- Set immutable file permissions:
  ```bash
  chmod 444 vault/<subfolder>/<filename>
  ```
- **Invariant:** NEVER open, modify, re-save, crop, or normalize an original evidence file.

### Step 2: Compute Cryptographic Fingerprint
- Generate the authoritative SHA-256 seal:
  ```bash
  sha256sum vault/<subfolder>/<filename>
  ```
- Record the exact 64-character lowercase hexadecimal hash, byte size (`stat -c %s`), and exact filename.

### Step 3: Populate Forensic Intake Record
- Construct the metadata intake record containing all 11 mandatory fields from SpecADR-023 (Data Rule 5):
  1. `sha256`: 64-character SHA-256 seal.
  2. `size_bytes`: Exact byte count.
  3. `original_filename`: Pristine base filename at intake.
  4. `source`: Provenance of transfer (who delivered, transfer medium).
  5. `acquisition_time_zurich`: Timestamp formatted in `Europe/Zurich` time zone.
  6. `acquisition_time_utc`: ISO 8601 UTC timestamp.
  7. `device_or_app`: Source phone model, camera hardware, or messaging app.
  8. `copy_type`: One of `original`, `photograph_of_original`, `scan`, `transcript`.
  9. `authenticity_status`: Set to `unverified` pending forensic audit.
  10. `legality_review`: Set to `pending` for all audio/video recordings (Art. 179ter CP, Art. 141 CPP).
  11. `derivatives`: List of child SHA-256 hashes (e.g., transcripts or cleaned audio). Both original audio and transcripts must be individually hashed and linked.

### Step 4: Preserve Original Metadata & EXIF
- Retain all embedded timestamps, camera serial numbers, and container headers.
- Never transcode, re-encode, or apply lossy compression.
- Forensic analysis, cleaning, filtering, or noise reduction must be performed on working copies only, saving the derived output as a distinct file with its own SHA-256 seal.

### Step 5: Special Handling for Identity Documents (Passports, IDs, Permits)
- Scanned identity documents, passports, and Swiss residence permits belong strictly to the **Identity Class**.
- Passports and ID scans must NEVER be indexed in public manifests with document numbers or cleartext identity details.
- The manifest records strictly:
  - `sha256`: Cryptographic seal of the scan.
  - `document_type`: e.g., `passport`, `identity_card`, `residence_permit_s`.
  - `owner_party_id`: Canonical de-identified token (e.g., `PARTY-L03`, `PARTY-L04`).

### Step 6: Pure Local OCR and Speech Transcription
- Any Optical Character Recognition (Tesseract, DocTR) or speech-to-text processing (Whisper) MUST execute locally on the sovereign node (`.161`, `.184`, or `.234`).
- Transmission of raw evidence files or snippets to cloud AI services (Google Cloud Vision, OpenAI Whisper API, Claude Vision, NotebookLM) is **STRICTLY PROHIBITED** by `docs/policy/CLOUD_EGRESS.md`.

### Step 7: Corrections Are Never Overwrites
- If an intake error is detected (wrong filename, inaccurate date, incorrect source label):
  - Do NOT overwrite the intake record.
  - Apply DataADR-022 **CORRECTION** mode: record a new entry closing `tx_to = NOW_UTC`, preserving the valid time interval, and referencing `source_document` and `reason`.
