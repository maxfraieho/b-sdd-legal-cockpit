// =========================================================================
// B-SDD LEGAL COCKPIT · SYNTHETIC DEMO BENCHMARK DATASET (Sprint S018)
// 100% Fictional: «Affaire Irene Adler & Roi de Bohême» (PE24.DEMO-HOLMES)
// Zero PII / Compliant with ADR-001..024 & Invariants L-01 to L-05
// =========================================================================

import {
  ActorItem,
  BordereauPiece,
  CriminalCharge,
  DossierChapter,
  ConfrontationItem,
  LegalRequisition,
} from './legalData';

import {
  HOLMES_CASE,
  HOLMES_ACTORS,
  HOLMES_PIECES,
  HOLMES_CHARGES,
  HOLMES_CONFRONTATIONS,
  HOLMES_REQUISITIONS,
} from './holmesDemoData';

export const DEMO_ACTORS: ActorItem[] = HOLMES_ACTORS;
export const DEMO_BORDEREAU_PIECES: BordereauPiece[] = HOLMES_PIECES;
export const DEMO_CHARGES: CriminalCharge[] = HOLMES_CHARGES;
export const DEMO_CONFRONTATIONS: ConfrontationItem[] = HOLMES_CONFRONTATIONS;
export const DEMO_LEGAL_REQUISITIONS: LegalRequisition[] = HOLMES_REQUISITIONS;

export const DEMO_DOSSIER_CHAPTERS: DossierChapter[] = [
  {
    id: "CH-01",
    number: "01",
    title: {
      uk: "Розділ 1: Походження спору та слідчий мандат Шерлока Холмса",
      fr: "Chapitre 1 : Origine du litige et mandat d'enquête de Sherlock Holmes",
      en: "Chapter 1: Origin of the dispute and Sherlock Holmes investigation retainer",
    },
    summary: {
      uk: "Звернення Короля Богемії щодо ризику оприлюднення приватного фотознімку перед династичним шлюбом.",
      fr: "Saisine par le Souverain régnant de Bohême face au risque d'extorsion politique.",
      en: "Consultation by the King of Bohemia concerning risk of political extortion.",
    },
    status: "verified",
    last_modified: "1888-03-20T10:00:00Z",
    sha256_hash: "9f83c126487e45b8e9a2b5349f28d8b1e4c76a9f0284759a1c8f302b11e8a93c",
    word_count: 1420,
    evidence_count: 2,
    facts_summary: {
      uk: "Встановлено факт знайомства у Варшаві в 1883 році та наявність спільного портрету формату кабінет.",
      fr: "Matérialité de la liaison antérieure établie à Varsovie et existence avérée du cliché.",
      en: "Facts of prior acquaintance established with physical cabinet photograph.",
    },
    contradictions_summary: {
      uk: "Спірним залишається питання наміру: вимагання грошей (шахрайство) чи виключно самозахист від королівського тиску.",
      fr: "Divergence sur le dol pénal : extorsion vénale ou légitime défense préventive.",
      en: "Dispute regarding criminal intent: financial blackmail vs legitimate defensive retention.",
    },
    lawyer_draft: {
      uk: "Кваліфікація дій за ст. 181 CP (примус) потребує доведення реальної загрози тяжкої шкоди.",
      fr: "La qualification de contrainte (Art. 181 CP) impose la preuve d'une menace de dommage sérieux.",
      en: "Qualification of coercion (Art. 181 SCC) requires proof of threat of serious harm.",
    },
    impacted_articles: ["Art. 181 CP", "Art. 146 CP", "Art. 139 CPP"],
    supporting_pieces: ["DEMO-P-01", "DEMO-P-04"],
  },
  {
    id: "CH-02",
    number: "02",
    title: {
      uk: "Розділ 2: Тактична операція в Briony Lodge та виявлення сховку",
      fr: "Chapitre 2 : Opération tactique à Briony Lodge et découverte de la cachette",
      en: "Chapter 2: Tactical deception at Briony Lodge and concealment localization",
    },
    summary: {
      uk: "Імітація пожежі за допомогою димового заряду Ватсона та встановлення панелі за рухомим фото.",
      fr: "Usage d'un leurre fumigène inoffensif pour contraindre la détentrice à sécuriser le précieux cliché.",
      en: "Deployment of harmless smoke device to trigger reflex revealing the secret hideout.",
    },
    status: "verified",
    last_modified: "1888-03-21T20:30:00Z",
    sha256_hash: "7d793037a0760186574b0282f2f435e7b1e5a614d82697ff3177c7a3b3142f56",
    word_count: 1850,
    evidence_count: 1,
    facts_summary: {
      uk: "Експертний звіт Ватсона підтверджує нешкідливість суміші селітри та сірки.",
      fr: "Rapport Watson confirmant l'innocuité toxicologique du dispositif.",
      en: "Watson report confirming toxicological harmlessness of the device.",
    },
    contradictions_summary: {
      uk: "Оцінка допустимості доказів за ст. 141 КПК у разі обману при вході до житла.",
      fr: "Appréciation de la licéité des constatations au regard de l'Art. 141 CPP.",
      en: "Evaluation of evidence admissibility under Art. 141 CPC.",
    },
    lawyer_draft: {
      uk: "Висновок: обман без фізичного насильства оцінюється за правилом зважування інтересів (ATF 146 IV 9).",
      fr: "Pesée des intérêts sous ATF 146 IV 9 : la ruse tactique demeure admissible pour sauvegarder un droit prépondérant.",
      en: "Balance of interests under ATF 146 IV 9: tactical ruse admissible to protect paramount interest.",
    },
    impacted_articles: ["Art. 184 CPP", "Art. 141 CPP", "ATF 146 IV 9"],
    supporting_pieces: ["DEMO-P-03"],
  },
  {
    id: "CH-03",
    number: "03",
    title: {
      uk: "Розділ 3: Лист Ірен Адлер та юридичне закриття провадження",
      fr: "Chapitre 3 : Lettre de désistement conditionnel et clôture procédurale",
      en: "Chapter 3: Letter of conditional waiver and procedural conclusion",
    },
    summary: {
      uk: "Виявлення власноручного листа DEMO-P-02 з відмовою від публікації знімка.",
      fr: "Abandon formel de toute velléité de publication et neutralisation du risque pénal.",
      en: "Formal undertaking not to publish the photograph, neutralizing penal danger.",
    },
    status: "verified",
    last_modified: "1888-03-22T09:00:00Z",
    sha256_hash: "5d41402abc4b2a76b9719d911017c5926b4e3a09d3b1e7f62d1838841a02102f",
    word_count: 1200,
    evidence_count: 1,
    facts_summary: {
      uk: "Лист Ірен Адлер містить категоричну гарантію безпеки шлюбу короля.",
      fr: "Engagement d'honneur d'Irene Adler garantissant la quiétude de l'union princière.",
      en: "Pledge by Irene Adler assuring peace of the royal marriage.",
    },
    contradictions_summary: {
      uk: "Спростування попереднього звинувачення у шантажі.",
      fr: "Cessation de toute menace active.",
      en: "Cessation of active threat.",
    },
    lawyer_draft: {
      uk: "Клопотання про винесення постанови про закриття справи (ст. 319 КПК).",
      fr: "Conclusions formelles tendant au classement de la procédure (Art. 319 CPP).",
      en: "Formal application for dismissal order (Art. 319 CPC).",
    },
    impacted_articles: ["Art. 319 CPP", "Art. 423 CPP"],
    supporting_pieces: ["DEMO-P-02"],
  },
];

export const ACTORS = DEMO_ACTORS;
export const BORDEREAU_PIECES = DEMO_BORDEREAU_PIECES;
export const CHARGES = DEMO_CHARGES;
export const DOSSIER_CHAPTERS = DEMO_DOSSIER_CHAPTERS;
export const CONFRONTATIONS = DEMO_CONFRONTATIONS;
export const LEGAL_REQUISITIONS = DEMO_LEGAL_REQUISITIONS;
