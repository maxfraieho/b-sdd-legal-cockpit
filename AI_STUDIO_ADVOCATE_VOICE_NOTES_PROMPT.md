# MISSION ORDER: GOOGLE AI STUDIO — ADVOCATE VOICE NOTES & DEPOSITION COMPONENT
Role: Principal Frontend Architect & Astryx Design System Lead (React 19 + Tailwind CSS)
Project: B-SDD Legal Advocate Cockpit (`b-sdd-legal-ui`)
Dossier Reference: `PE24.014624-SBA` (Ministère public du Canton de Vaud, Suisse)
Standards: Astryx Design System v2.5, ISO/IEC 27037, Invariants L-01 to L-05
Backend Core: `src/legal/advocate_voice_notes.py` (100% Python stdlib, ADR-026)

---

## 1. OBJECTIF ET PHILOSOPHIE DU COMPOSANT
L'avocat plaidant et l'opérateur juridique ont besoin d'un outil ergonomique pour dicter leurs débriefings audio immédiatement après une audience, une audition de témoin ou une analyse de pièces.

**RÈGLE CARDINALE DE SÉPARATION ARCHITECTURALE :**
Ce composant ne duplique PAS le module d'interview client structuré existant. Il constitue **l'arsenal tactique propre de l'avocat** : dictée libre, transcription assistée par IA, soussumption automatique aux articles du Code pénal suisse (CP), liaison aux participants du procès, et calcul du rayon d'impact (Blast Radius) sur les 18 chapitres du dossier judiciaire.

---

## 2. INVARIANTS LÉGAUX STRICTS À REPRODUIRE DANS L'UI (CRITICAL GUARDS)
1. **Invariant L-03 (Bouclier de Bonne Foi — Adriano MILLI) :**
   - Lorsque Adriano MILLI (`ACT-ADRIANO-MILLI`) est sélectionné, l'UI affiche un badge doré inaltérable :  
     `🛡️ TIERS DE BONNE FOI ABSOLU (Art. 933 CC / Art. 105 al. 2 CPP)`
   - Le sélecteur de rôle interdit formellement de le désigner comme « Prévenu » ou « Auteur ».
2. **Invariant L-04 (Protection de la Victime Adulte — Arsen KOVALENKO) :**
   - Arsen KOVALENKO (né le 05.11.1999, 26 ans) porte le badge vert :  
     `⚖️ PARTIE PLAIGNANTE / VICTIME ADULTE (Art. 115, 118, 122 CPP)`
   - L'UI bloque et supprime toute suggestion liée à l'Art. 219 CP (infractions contre les mineurs).
3. **Invariant L-01 & L-05 (Scellement WORM et SHA-256) :**
   - Chaque note audio enregistrée génère une empreinte SHA-256 calculée en direct dans le navigateur (via `crypto.subtle.digest('SHA-256', ...)`).
   - L'enregistrement dans le ledger est append-only (WORM).

---

## 3. INTERFACES TYPESCRIPT À RESPECTER SCRUPULEUSEMENT
Créez ou mettez à jour `b-sdd-legal-ui/src/types/voiceNotes.ts` :

```typescript
export interface AudioSegment {
  startSeconds: number;
  endSeconds: number;
  transcriptSegment: string;
  speakerLabel?: string;
  confidence: number;
}

export interface SwissArticleSubsumption {
  article: string;            // ex: "Art. 180 al. 1 CP"
  offenseName: string;        // ex: "Menaces graves"
  accusedActorId: string;     // ex: "ACT-LIUBOV-SUVOROVA"
  victimActorId: string;      // ex: "ACT-ARSEN-KOVALENKO"
  qualifyingFacts: string[];
  evidenceCitations: string[];
  confidence: number;
}

export interface AdvocateVoiceNote {
  noteId: string;
  dossierId: string;
  title: string;
  authorId: string;
  rawTranscript: string;
  audioSha256: string;
  audioDurationSeconds: number;
  tV: string;                 // Valid Time (ISO UTC)
  tT: string;                 // Transaction Time (ISO UTC)
  audioSegments: AudioSegment[];
  targetActorIds: string[];
  legalObservations: string;
  subsumptions: SwissArticleSubsumption[];
  blastRadiusChapters: string[];
  status: 'active' | 'superseded' | 'challenged';
  sha256Seal?: string;
}
```

---

## 4. CAHIER DES CHARGES DU COMPOSANT REACT 19 (`AdvocateVoiceNotesModal.tsx`)

### 4.1. Ergonomie Mobile & Desktop (Astryx Design System)
- Modal plein écran sur mobile avec `min-h-[100dvh] max-h-[100dvh]` et `touch-manipulation`.
- Palette : Slate 900 (`#0f172a`), Dark Navy (`#020617`), bordures Indigo/Amber, textes High-Contrast.
- Prise en compte de la `safe-area-inset-bottom` pour iOS et navigateurs mobiles.

### 4.2. Enregistreur Audio & Visualiseur Waveform
- Utilisation de la Web Audio API (`navigator.mediaDevices.getUserMedia({ audio: true })` + `MediaRecorder`).
- Canvas temps réel affichant les oscillogrammes audio (barres dynamiques ambrées/émeraude).
- Compteur de durée précis (ex. `02:45 / max 15:00`).
- Contrôles tactiles : `[● REC]` (rouge pulsant), `[⏸ PAUSE]`, `[⏹ STOP]`, `[↺ RECOMMENCER]`.

### 4.3. Sélecteur de Participants & Liaisons Procédurales
- Menu déroulant avec recherche rapide des acteurs de la cause :
  - `ACT-ARSEN-KOVALENKO` (Partie plaignante / Demandeur civil)
  - `ACT-LIUBOV-SUVOROVA` (Prévenue principale)
  - `ACT-GANNA-SUVOROVA` (Prévenue complice)
  - `ACT-ADRIANO-MILLI` (Tiers de bonne foi protégé)
  - `ACT-VOLODYMYR-KOVALENKO` (Assistance procédurale)
- Affichage automatique des avertissements d'invariants (L-03 et L-04).

### 4.4. Soussumption Pénale Suisse Automatique (Swiss Claim Chart Tagger)
- Cartes d'articles cliquables avec niveau de confiance :
  - **Art. 180 al. 1 CP** — Menaces graves
  - **Art. 138 ch. 1 / 146 CP** — Abus de confiance & Escroquerie ($15'000 USD)
  - **Art. 156 ch. 1 CP** — Extorsion et chantage
  - **Art. 186 CP** — Violation de domicile (Serrure fracturée)
  - **Art. 303 / 304 CP** — Dénonciation calomnieuse
  - **Art. 118 LEI** — Fraude aux prestations du statut S
- Aperçu dynamique du **Rayon d'impact (Blast Radius)** : met en surbrillance les chapitres impactés (`CH-04`, `CH-05`, `CH-07`, `CH-08`, `CH-14`, etc.).

### 4.5. Scellement WORM et Soumission
- Bouton de scellement : `[🔒 SCELLER ET COMMETTRE AU REGISTRE WORM]`.
- Calcule l'empreinte SHA-256 locale, affiche le sceau cryptographique en vert, et stocke l'objet dans l'état applicatif avec dispatch d'événement pour persistance.

---

## 5. LIVRABLES ATTENDUS DE GOOGLE AI STUDIO
1. `b-sdd-legal-ui/src/types/voiceNotes.ts`
2. `b-sdd-legal-ui/src/components/AdvocateVoiceNotesModal.tsx`
3. `b-sdd-legal-ui/src/components/AudioWaveformVisualizer.tsx`
4. Intégration d'un bouton d'accès rapide dans la barre d'outils du Cockpit (`LegalNav.tsx` ou `Header.tsx`) avec icône micro 🎙️ et badge `Notes Vocales Avocat`.
5. Exécuter `tsc --noEmit` et s'assurer de 0 erreur.
