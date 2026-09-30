# SpecADR-024: Client Screen Lock vs Cryptographic Authorization Boundary

- **Status:** Proposed
- **Version:** S00b Draft
- **Domain:** Security Architecture, Identity & Access Management, Zero-Trust Perimeter
- **Standard:** B-SDD Methodology v1.3 (S00b Code-Level Remediation)
- **Supersedes:** Legacy client-side PIN check (`cleanPin === '0523'`) and hardcoded whitelists in frontend bundle
- **Enforcement:** Invariant L-01, Invariant L-02, Invariant L-03

---

## 1. Context & Vulnerability Rationale

Prior iterations of the B-SDD Legal Cockpit implemented an `AuthGate` component that enforced a 4-digit PIN code (`0523`) directly inside the client JavaScript execution environment. Furthermore, client bundles statically embedded judicial case datasets (`legalData.ts`, claim charts, actor rosters) and hardcoded user whitelists with personal names and procedural notes.

### Identified Attack Vectors:
1. **Client-Side Bypass:** Any client-side gate (PIN modal, sessionStorage flag `b_sdd_auth_unlocked`) is trivially bypassed via browser developer tools or direct JavaScript console injection.
2. **Static Asset Exposure:** If case data is bundled within production JavaScript chunks deployed to a public CDN (e.g., Cloudflare Pages), the data is publicly readable via raw HTTP requests regardless of any client-side gate.
3. **Hardcoded Credential Fallback:** A static default PIN embedded in client source code creates the illusion of protection ("security theatre") while guaranteeing that any actor inspecting the source code can unlock the interface.
4. **PII Leakage in Bundles:** Embedding parties' full legal names, family relationships, and birth dates in static whitelist dictionaries exposes sensitive judicial identities.

---

## 2. The Dual-Boundary Architecture

To restore zero-trust compliance under Art. 73 CPP and ISO/IEC 27037, this specification formally divides client operations into two distinct security boundaries:

```
+-------------------------------------------------------------------------+
| BOUNDARY 1: LOCAL TERMINAL CONVENIENCE LOCK (UI Presentation Layer)     |
| - Scope: Local browser viewport only                                    |
| - Purpose: Prevent casual shoulder-surfing on unattended physical devices|
| - Control: User-configured screen lock PIN (stored in local secure state)|
| - Invariant: CANNOT protect data. No hardcoded default bypass.           |
+-------------------------------------------------------------------------+
                                    |
                                    | (Requires Cryptographic Session)
                                    v
+-------------------------------------------------------------------------+
| BOUNDARY 2: SERVER-AUTHORITATIVE AUTHENTICATION PERIMETER (Backend)      |
| - Scope: Appwrite Cloud / Self-Hosted, Cloud Run, MCP Gateway           |
| - Purpose: Cryptographic access control to case dossiers, WORM, tools   |
| - Protocols: OIDC / Google OAuth, Bearer tokens, HttpOnly signed cookies|
| - Enforcement: Server validates identity before returning sensitive data|
+-------------------------------------------------------------------------+
```

---

## 3. Specification of Boundary 1: Local Convenience Lock

1. **Eradication of Universal PIN:**
   - The hardcoded PIN `0523` is completely removed from all source code, comments, translations, and default fallbacks.
   - Screen locking is an optional convenience guard configured by the local operator in user settings.
2. **Failure Semantics:**
   - If an operator has not configured a local lock PIN, the screen lock prompt remains inactive or prompts the operator to configure local terminal security.
   - Client-side PIN entry verifies strictly against the operator's locally configured secret or prompts for session re-authentication.
3. **Explicit Non-Protection Disclaimer:**
   - UI elements and technical documentation must explicitly state that the screen lock is a convenience feature, not an encryption boundary.

---

## 4. Specification of Boundary 2: Server-Authoritative Perimeter

1. **Server-Side Identity Verification:**
   - Case data and administrative actions require a validated server session:
     - **Appwrite Session:** Validated via `account.get()` and team/role membership.
     - **Google OAuth (OIDC):** Authenticated via authorized redirect through server-authoritative OAuth endpoint verifying identity against the backend authorized roster.
     - **MCP Gateway:** Protected via Bearer token (`LEGAL_MCP_TOKEN`) and restricted to loopback/authorized origins.
2. **Data Minimization in Client Bundles:**
   - Public client bundles must not contain confidential dossier records or unmasked PII.
   - Unauthenticated or demo sessions operate in `DATA_MODE=demo` using synthetic `PARTY-*` tokens and mock claim items.
   - Production case dossiers are retrieved exclusively over authenticated API endpoints.

---

## 5. Client Whitelist Sanitization

1. **Allowed Identifiers:**
   - Client-side code retains only email identifiers strictly required for OAuth redirection matching (e.g., `PRIMARY_SUPER_ADMIN_EMAIL = 'tukroschu@gmail.com'`).
2. **Elimination of PII Metadata:**
   - Whitelist dictionaries must not contain real personal names, family relations, or physical case descriptions.
   - Display names are replaced with canonical procedural roles (e.g., `Administrator (SBA Lead)`, `Authorized Party (Art. 115/118 CPP)`, `Legal Counsel`).
   - Granular role-based access control (RBAC) permissions are determined by server-side team membership rather than client dictionary hardcoding.
