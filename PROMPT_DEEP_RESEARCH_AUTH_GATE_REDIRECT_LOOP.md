# PROMPT FOR DEEP RESEARCH: FORENSIC INVESTIGATION & PERMANENT RESOLUTION OF CROSS-ORIGIN GOOGLE AUTH REDIRECT LOOP IN B-SDD LEGAL COCKPIT

---

## 1. MISSION & RESEARCH DIRECTIVE

You are a **Principal Security Architect, Distributed Systems Engineer, and Web Standards Specialist (W3C / RFC 6749 OAuth 2.0 / RFC 7519 JWT / CHIPS Partitioned Cookies)**.

Your task is to conduct an exhaustive, rigorous, and root-level architectural investigation into an intractable redirect loop and authentication failure affecting the **B-SDD Legal Cockpit** (Swiss LegalTech decision-support workbench, Case Reference: `PE24.014624-SBA`, governed by Swiss Code of Criminal Procedure Art. 73 CPP *secret de l'instruction* and Swiss Federal Act on Free Movement of Lawyers Art. 13 LLCA *secret professionnel de l'avocat*).

For an entire development cycle, the cross-origin authentication flow between **Cloudflare Pages** and a **Google AI Studio Cloud Run Preview Container** has resulted in infinite redirect loops, blocked cookies, truncated return redirects, and stranded sessions across modern web browsers (Chrome, Firefox, Safari).

Analyze the evidence, diagnose the structural web-platform incompatibilities, evaluate why the current cross-domain bounce pattern is fundamentally broken, and provide an authoritative, production-grade architectural blueprint that permanently resolves this issue.

---

## 2. SYSTEM TOPOLOGY & DEPLOYED ARCHITECTURE

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT BROWSER                       │
│    (Chrome / Chrome Incognito / Firefox ETP / Safari)  │
└──────────────────────────┬─────────────────────────────┘
                           │
             1. Visit Stage 1 PIN Gate (0523)
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│         ORIGIN A: PRODUCTION WORKSPACE HOST            │
│         URL: https://b-sdd-legal-ui.pages.dev/         │
│  Stack: Cloudflare Pages, Vite 7.3, React 19, SPA      │
│  State: localStorage & sessionStorage on .pages.dev    │
└──────────────────────────┬─────────────────────────────┘
                           │
             2. User clicks single login link:
             href="https://ais-dev-...run.app/?redirect_uri=https://b-sdd-legal-ui.pages.dev/&case_id=PE24.014624-SBA&pin_verified=true"
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│     ORIGIN B: GOOGLE AI STUDIO PREVIEW CONTAINER       │
│     URL: https://ais-dev-cy5vorrb7cys...run.app/       │
│  Stack: Google Cloud Run (europe-west3)                │
│  Proxy: Google Frontend / Internal Lua Reverse Proxy   │
│  Protection: __cookie_check.html (Partitioned Cookie)  │
└────────────────────────────────────────────────────────┘
```

---

## 3. FORENSIC EVIDENCE & DIAGNOSTIC DISCOVERY

### A. The Lua Reverse Proxy Interception on Cloud Run
When the browser initiates a navigation request from `Origin A` (`b-sdd-legal-ui.pages.dev`) to `Origin B` (`ais-dev-...run.app/?redirect_uri=https%3A%2F%2Fb-sdd-legal-ui.pages.dev%2F&case_id=PE24.014624-SBA&pin_verified=true`), the HTTP response returned by Google Cloud Run is **NOT** the React application, but a `302 Found` issued by Google's Lua-based front-end proxy:

```http
HTTP/2 302 
content-type: text/html
set-cookie: __SECURE-aistudio_auth_flow_may_set_cookies=true; Path=/; Secure; SameSite=None; Domain=ais-dev-cy5vorrb7cys2mpbzcua5g-147404199355.europe-west3.run.app; Partitioned; Max-Age=60;
location: /__cookie_check.html?return_url=https%3A%2F%2Fais-dev-cy5vorrb7cys2mpbzcua5g-147404199355.europe-west3.run.app%2F%3Fpin_verified%3Dtrue%26redirect_uri%3Dhttps%253A%252F%252Fb-sdd-legal-ui.pages.dev%252F%26case_id%3DPE24.014624-SBA
content-security-policy: frame-ancestors 'self' https://*.google.com https://localhost.corp.google.com:26001;
server: Google Frontend
```

### B. The `__cookie_check.html` Barrier
Inspection of the client-side JavaScript in `/__cookie_check.html` reveals:
1. It attempts to set a partitioned cookie:
   `document.cookie = '__SECURE-aistudio_auth_flow_may_set_cookies=true; Path=/; Secure; SameSite=None; Domain=${window.location.hostname}; Partitioned; Max-Age=60;'`
2. It verifies cookie accessibility via:
   `authFlowTestCookieIsSet()`
3. **Failure Path**:
   In Chrome Incognito, Firefox (Enhanced Tracking Protection / Total Cookie Protection), Safari (Intelligent Tracking Prevention), and Brave, partitioned third-party cookies or cross-site tracking scripts are blocked by default.
   When `authFlowTestCookieIsSet()` returns `false`, execution halts and displays an error modal:
   *"Action required to load your app: It looks like your browser is blocking a required security cookie... Authenticate in new window / Grant permission"*.
4. **Window Decoupling & Loop**:
   If the user clicks "Authenticate in new window", it triggers `window.open(..., '_blank')`. The return URL in the new popup/tab becomes disconnected from the original tab context.
   Even when the cookie is accepted, the Google AI Studio container demands an authenticated Google Developer Workspace session on `google.com`. If the user is unauthenticated or has multiple Google profiles, Google's accounts gate intercepts the flow.

### C. The Truncated Redirect & Stranded Session Phenomenon
The operator reports:
> *"Один раз мені вдалося, що вона пройшла в браузері Chrome, Firefox, і більше—і то вона не дійшла до кінця. Після авторизації не переадресувалась нікуди. Ну, тобто зациклилася знов."*

When authentication on Cloud Run intermittently succeeded:
1. `__cookie_check.html` or the AI Studio container script executed navigation, but the `redirect_uri` parameter was stripped, doubly-URL-encoded, or dropped during internal Google Accounts bounces.
2. The user was stranded on `https://ais-dev-...run.app/` directly, seeing an outdated or un-synchronized staging build rather than being redirected back to `https://b-sdd-legal-ui.pages.dev/`.
3. `sessionStorage` and `localStorage` on `b-sdd-legal-ui.pages.dev` were unreachable on `run.app` due to the Same-Origin Policy (SOP).
4. If the user navigated back manually to `b-sdd-legal-ui.pages.dev`, the absence of query callback parameters (`?user_email=...`) caused the local `AuthGate` to reset back to Stage 1 PIN entry, recreating the impression of an infinite loop.

---

## 4. IN-DEPTH RESEARCH QUESTIONS TO SOLVE

Conduct deep research and provide authoritative answers with technical proofs for the following:

### Question 1: Root Cause Analysis of the Cross-Origin Cookie & Redirect Failure
1. Why does Google AI Studio deploy a Lua reverse proxy with `__cookie_check.html` and `Partitioned` cookies on Cloud Run preview URLs (`ais-dev-...run.app`)?
2. How do modern browser privacy standards (W3C CHIPS - Cookies Having Independent Partitioned State, Firefox Total Cookie Protection / dFPI, Apple Safari ITP 2.3+) treat cross-domain top-level navigations originating from Cloudflare Pages (`.pages.dev`) to Cloud Run (`.run.app`)?
3. Exactly where and why does parameter loss or double-encoding occur when `return_url` contains encoded `redirect_uri` parameters (`redirect_uri=https%253A%252F%252Fb-sdd-legal-ui.pages.dev%252F`)?

### Question 2: Architectural Flaw of Using an AI Studio Dev Preview Container as an OAuth Gateway
1. Is it viable or architecturally sound to use an ephemeral Google AI Studio developer preview deployment (`ais-dev-...run.app`) as an Identity Provider (IdP) or authentication gateway for an external production web application on Cloudflare Pages?
2. What are the uptime, container spin-up, session invalidation, and CSP (`frame-ancestors 'self' https://*.google.com`) constraints imposed by Google AI Studio?
3. Why does this pattern violate standard OAuth 2.0 (RFC 6749) / OpenID Connect (OIDC) architecture?

### Question 3: The Direct Client-Side Alternative: Google Identity Services (GIS) on Cloudflare Pages
1. Can the entire Google Identity authentication be conducted directly within `https://b-sdd-legal-ui.pages.dev/` using the official Google Identity Services SDK (`https://accounts.google.com/gsi/client`) without ever redirecting the user to Cloud Run?
2. Compare the two client-side GIS integration modes:
   - **Mode A: GIS One Tap / Sign In with Google Button (Credential / ID Token JWT flow)**:
     The user clicks the official Google button; Google displays a trusted origin popup/modal; Google returns an encoded JWT ID token directly to a JavaScript callback on `b-sdd-legal-ui.pages.dev`.
   - **Mode B: OAuth 2.0 Token Client (`google.accounts.oauth2.initTokenClient`)**:
     User clicks the custom button; Google opens an OAuth consent popup and returns an access token / ID token without leaving the page.
3. How does client-side GIS completely eliminate:
   - All cross-origin redirect loops.
   - All third-party cookie checks and Lua proxy failures.
   - All state desynchronization between origins.

### Question 4: The Serverless Backend Alternative: Cloudflare Pages Functions / Worker Broker
1. If cryptographic signature verification of the Google JWT is required before granting access:
   How can a lightweight Cloudflare Pages Function (`/functions/api/auth/google.ts` or `/api/auth/callback`) serve as the secure OAuth 2.0 / OIDC exchange point?
2. What is the standard implementation using Google's public JWKS endpoint (`https://www.googleapis.com/oauth2/v3/certs`) using the Web Crypto API (`crypto.subtle`) natively available in Cloudflare Workers (zero npm dependencies)?
3. How can a first-party, secure, `HttpOnly`, `SameSite=Lax` session cookie be issued by Cloudflare Pages to guarantee session persistence across all browsers?

### Question 5: Zero-Trust Hardened Whitelist & Swiss Legal Compliance (Art. 73 CPP)
1. In the B-SDD Legal Cockpit, only specific authorized participants are permitted access:
   - `tukroschu@gmail.com` (Super Administrator / Plaintiff)
   - `arsen.k111999@gmail.com` (Victim / Complainant under Art. 115, 118 CPP)
   - `vokov.dev@gmail.com` (B-SDD SecOps Engineer)
   - `counsel.vaud.vd@gmail.com` (Legal Counsel / Ordre des Avocats Vaudois)
2. How should the identity verification pipeline enforce this strict whitelist:
   - At the client layer (instant feedback).
   - At the cryptographic layer (verifying `email_verified: true` and `aud: GOOGLE_CLIENT_ID` in the JWT payload).
3. How to provide an unblockable, deterministic emergency access mechanism (e.g., Local Sovereign Key / WebAuthn Passkey) that allows authorized operators to access the legal workbench even during internet outages or third-party OAuth provider downtimes?

---

## 5. REQUIRED OUTPUT ARTIFACTS

Provide your findings in a structured, actionable report comprising:

1. **Executive Forensic Audit**: Precise explanation of why today's tests failed, why Chrome and Firefox intermittently failed or hung, and why the redirect never completed.
2. **Web Standards & Protocol Breakdown**: An ASCII sequence diagram contrasting the broken cross-domain bounce against the clean GIS popup / Cloudflare Pages flow.
3. **Production Implementation Blueprint**:
   - Exact, drop-in replacement code for `b-sdd-legal-ui/src/components/AuthGate.tsx`.
   - Exact configuration for Google Cloud Console OAuth 2.0 Client ID (Authorized JavaScript origins & Authorized redirect URIs).
   - Validation logic for `HARDENED_WHITELIST` adhering to Swiss CPP Art. 73.
4. **Verification & Proof Checklist**: Step-by-step instructions to test in Chrome Incognito, Firefox Private Window, and Safari with 100% deterministic success.
