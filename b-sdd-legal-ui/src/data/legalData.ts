// =========================================================================
// B-SDD LEGAL COCKPIT · BENCHMARK DATASET & LEGAL ONTOLOGY
// Judicial Context: Ministère public du Canton de Vaud, Dossier PE24.014624-SBA
// Compliant with ADR-001..020 & Invariants L-01 to L-05
// =========================================================================

import { SupportedLanguage } from '../types/i18n';

export type LocalizedString = { [K in SupportedLanguage]?: string } & { uk?: string; fr?: string; en?: string };

export function resolveLocalized(val: LocalizedString | undefined, lang: SupportedLanguage): string {
  if (!val) return '';
  return val[lang] || val['it'] || val['de'] || val['fr'] || val['uk'] || val['en'] || '';
}

export function resolveLocalizedArray(
  val: Record<SupportedLanguage, string[]> | { [K in SupportedLanguage]?: string[] } | string[] | undefined,
  lang: SupportedLanguage
): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  const map = val as { [K in SupportedLanguage]?: string[] };
  return map[lang] || map['it'] || map['de'] || map['fr'] || map['uk'] || map['en'] || [];
}

export interface CitationReference {
  evidence_id: string;
  cote: string;
  title: string;
  timecode: string;
  sha256: string;
  quote: LocalizedString;
  admissibility: LocalizedString;
}

export interface StatutoryElement {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  status: 'corroborated' | 'contested' | 'pending';
  citations: CitationReference[];
}

export interface CriminalCharge {
  id: string;
  code: string;
  title: LocalizedString;
  accused: string;
  accused_id: string;
  victim: LocalizedString;
  status: 'corroborated' | 'contested';
  atf_ruling: LocalizedString;
  conclusions_penales: LocalizedString;
  conclusions_civiles: LocalizedString;
  elements: StatutoryElement[];
  supporting_cotes: string[];
}

export interface BordereauPiece {
  cote: string;
  date_faits: string;
  date_versement: string;
  titre: LocalizedString;
  categorie: 'Audio' | 'Photo EXIF' | 'Médical' | 'Bancaire' | 'Message' | 'Procédure';
  sha256: string;
  admissibilite: LocalizedString;
  portee_probatoire: LocalizedString;
  citation_cle: LocalizedString;
  fichier_local: string;
  adr_id?: string;
  adr_title?: LocalizedString;
  adr_sync?: boolean;
  duration_sec?: number;
  exif_meta?: {
    camera: string;
    lens: string;
    timestamp: string;
    gps: string;
    iso: number;
    aperture: string;
    alibi_verification: string;
  };
  audio_transcript?: Array<{ start: number; end: number; speaker: string; text: string }>;
}

export interface ConfrontationItem {
  id: string;
  theme: LocalizedString;
  prevenue_allegation: LocalizedString;
  corroborated_reality: LocalizedString;
  inconsistency_point: LocalizedString;
  exhibits: string[];
  certified_timestamp: string;
  investigation_questions: Record<SupportedLanguage, string[]>;
  tactical_defense: LocalizedString;
}

export interface LegalRequisition {
  id: string;
  title: LocalizedString;
  norme: string;
  autorite: string;
  urgence: 'URGENT' | 'ORDINAIRE';
  category?: 'penal' | 'civil';
  conclusions_formelles: Record<SupportedLanguage, string[]>;
  corps_texte: LocalizedString;
}

export interface ActorDocument {
  id: string;
  title: LocalizedString;
  type: string;
  sha256: string;
  date: string;
  url?: string;
  verified: boolean;
}

export interface ActorPhoto {
  url: string;
  caption: LocalizedString;
  timestamp?: string;
  sha256?: string;
}

export interface ActorItem {
  id: string;
  name: string;
  age?: number;
  birthdate?: string;
  status: LocalizedString;
  badgeColor: string;
  role: LocalizedString;
  /** Invariant L-03: Bona fide third party protection flag */
  protected_bona_fide: boolean;
  legal_reference: string;
  droits_proceduraux: Record<SupportedLanguage, string[]>;
  forbidden_actions?: string[];
  avatarUrl?: string;
  photos?: ActorPhoto[];
  documents?: ActorDocument[];
  nationality?: LocalizedString;
  domicile?: LocalizedString;
  discernment_capacity?: boolean;
  procedural_standing?:
    | 'victime_plaignante'
    | 'prevenu_principal'
    | 'prevenu_complice'
    | 'tiers_bonne_foi'
    | 'temoin'
    | 'personne_renseignement'
    | 'magistrat'
    | 'avocat';
  cpp_article?: string;
  lawyer?: { name: string; bar: string; address?: string; phone?: string };
  financial_claim_chf?: number;
  financial_liability_chf?: number;
  linked_pieces?: string[];
  invariants?: string[];
  risk_level?: 'low' | 'medium' | 'high' | 'critical' | 'immune';
  bitemporal_valid_from?: string;
  bitemporal_tx_time?: string;
  custom_notes?: string;
}

export interface DossierChapter {
  id: string;
  number: string;
  title: LocalizedString;
  status: 'verified' | 'modified' | 'draft';
  summary: LocalizedString;
  outdated_claim: LocalizedString;
  lawyer_draft: LocalizedString;
  impacted_articles: string[];
  supporting_pieces: string[];
}

// -------------------------------------------------------------------------
// 1. ACTEURS DE LA PROCÉDURE (INVARIANTS L-03 & L-04)
// -------------------------------------------------------------------------
export const ACTORS: ActorItem[] = [
  {
    id: "ACT-ARSEN-KOVALENKO",
    name: "Arsen KOVALENKO",
    age: 26,
    birthdate: "05.11.1999",
    status: {
      uk: "Потерпілий & Цивільний позивач (Повнолітній, 26 років)",
      fr: "Victime & Partie Plaignante (Majeur, 26 ans)",
      de: "Geschädigte Person & Privatklägerschaft (Volljährig, 26 Jahre)",
      it: "Persona lesa & Accusatore privato (Maggiorenne, 26 anni)",
      en: "Victim & Civil Plaintiff (Adult, 26 yo)",
    },
    badgeColor: "bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
    role: {
      uk: "Повнолітній дієздатний потерпілий (народився 05.11.1999, 26 років). Безпосередня жертва шахрайства на $15'000 USD, тяжких погроз розправою, шантажу та завідомо неправдивого доносу. Сторона цивільного позову (ст. 115, 118, 122 КПК).",
      fr: "Victime majeure et capable de discernement (né le 05.11.1999, 26 ans). Victime directe de l'escroquerie de $15'000 USD, de menaces réitérées et de dénonciation calomnieuse. Demandeur civil constitué (Art. 115, 118, 122 CPP).",
      de: "Volljähriger urteilsfähiger Geschädigter (geb. 05.11.1999, 26 Jahre). Direktes Opfer des Betrugs über $15'000 USD, schwerer Drohungen, Nötigung und falscher Anschuldigung. Konstituierte Privatklägerschaft (Art. 115, 118, 122 StPO).",
      it: "Persona lesa maggiorenne e capace di discernimento (nato il 05.11.1999, 26 anni). Vittima diretta della truffa di $15'000 USD, minacce gravi reiterate, coazione e calunnia. Costituito accusatore privato e attore civile (Art. 115, 118, 122 CPP).",
      en: "Adult compos mentis victim (born 05.11.1999, 26 years old). Direct victim of $15,000 USD fraud, aggravated death threats, coercion, and malicious false accusation. Constituted civil plaintiff (Art. 115, 118, 122 CPC).",
    },
    protected_bona_fide: false,
    legal_reference: "Art. 115, 118, 122 CPP / Art. 41 CO / Invariant L-01",
    procedural_standing: "victime_plaignante",
    cpp_article: "Art. 115, 118, 122 CPP",
    discernment_capacity: true,
    nationality: {
      uk: "Україна (Тимчасовий захист · Статус S в Швейцарії)",
      fr: "Ukraine (Protection temporaire · Statut S en Suisse)",
      de: "Ukraine (Vorübergehender Schutz · Status S in der Schweiz)",
      it: "Ucraina (Protezione temporanea · Statuto S in Svizzera)",
      en: "Ukraine (Temporary Protection · Status S in Switzerland)",
    },
    domicile: {
      uk: "м. Лозанна, Кантон Во, Швейцарія",
      fr: "Lausanne, Canton de Vaud, Suisse",
      de: "Lausanne, Kanton Waadt, Schweiz",
      it: "Losanna, Canton Vaud, Svizzera",
      en: "Lausanne, Canton of Vaud, Switzerland",
    },
    financial_claim_chf: 46850,
    linked_pieces: ["P-01", "P-03", "P-04", "P-05", "P-06", "P-10"],
    invariants: ["Invariant L-01 (WORM Bitemporal Calibration)", "Art. 118 CPP Standing"],
    risk_level: "low",
    bitemporal_valid_from: "2024-07-23T10:00:00Z",
    lawyer: {
      name: "Me B. Kamber",
      bar: "Ordre des Avocats Vaudois (OAV) · Barreau de Lausanne",
      address: "Place de la Riponne 3, 1005 Lausanne",
      phone: "+41 21 312 00 00",
    },
    photos: [
      {
        url: "/evidence/photos/P-06_exif1481_lausanne.jpg",
        caption: {
          uk: "Алібі: Place de la Palud, Лозанна 21.07.2024 13:45",
          fr: "Constat d'alibi : Place de la Palud, Lausanne 21.07.2024 13:45",
          en: "Alibi verification: Place de la Palud, Lausanne 21.07.2024 13:45",
        },
        timestamp: "2024-07-21T13:45:12Z",
        sha256: "b4a8e3d0912f8641c48e718293a5028471602938475620193847562019485720",
      },
      {
        url: "/evidence/photos/P-06_exif1481_bras_sains.jpg",
        caption: {
          uk: "Судово-медична фіксація: руки без жодних слідів насильства",
          fr: "Constat médico-légal : avant-bras indemnes de toute lésion",
          en: "Forensic photo: forearms completely unblemished",
        },
        timestamp: "2024-07-21T13:47:00Z",
        sha256: "c5b9e4f1023a9752d59f829304b6139582713049586731204958673120596831",
      },
    ],
    documents: [
      {
        id: "DOC-AK-01",
        title: {
          uk: "Офіційний медичний висновок Unisanté (Pièce P-03)",
          fr: "Constat médico-légal officiel Unisanté (Pièce P-03)",
          en: "Official Unisanté Forensic Medical Certificate (Exhibit P-03)",
        },
        type: "Médical",
        sha256: "8c94fa10b98144298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7",
        date: "21.07.2024",
        url: "/evidence/photos/P-03_unisante_certificat.jpg",
        verified: true,
      },
      {
        id: "DOC-AK-02",
        title: {
          uk: "Банківський платіжний документ Wise $15'000 USD (Pièce P-05)",
          fr: "Bordereau officiel de virement Wise $15'000 USD (Pièce P-05)",
          en: "Wise Official Wire Transfer Receipt $15,000 USD (Exhibit P-05)",
        },
        type: "Bancaire",
        sha256: "b10a9f5d14e3b7829a8f276cd891b0c9521364718a24d08197c365287e02b74c",
        date: "02.04.2024",
        url: "/evidence/photos/P-05_bancaire_wise.jpg",
        verified: true,
      },
      {
        id: "DOC-AK-03",
        title: {
          uk: "Акт заміни зламаного замка дверей Renens CHF 850 (Pièce P-10)",
          fr: "Facture serrurier d'urgence Renens CHF 850.00 (Pièce P-10)",
          en: "Emergency Locksmith Invoice Renens CHF 850.00 (Exhibit P-10)",
        },
        type: "Facture",
        sha256: "3f982bca142e88a0984f18375ba201e7498c36294d1b827364501a2893f18e90",
        date: "20.07.2024",
        url: "/evidence/photos/P-10_serrure_fracturee_chf850.jpg",
        verified: true,
      },
    ],
    droits_proceduraux: {
      uk: [
        "Повноправний статус цивільного позивача та сторони звинувачення (ст. 118 КПК)",
        "Право на повернення незаконно утримуваних коштів $15'000 USD та збитків (ст. 122 КПК)",
        "Повний доступ до матеріалів кримінального провадження (ст. 101, 147 КПК)",
        "Право вимагати арешту банківських рахунків обвинувачених (ст. 263 КПК)",
        "Право заявляти клопотання про збирання додаткових доказів (ст. 318 КПК)",
      ],
      fr: [
        "Statut de partie plaignante pénale et demandeur civil au pénal (Art. 118 CPP)",
        "Droit à la restitution des $15'000 USD dissipés et réparation intégrale (Art. 122 CPP)",
        "Plein accès aux dossiers de l'instruction et droit de poser des questions (Art. 101, 147 CPP)",
        "Faculté de requérir le séquestre des avoirs bancaires des prévenues (Art. 263 CPP)",
        "Droit d'exiger des mesures probatoires complémentaires (Art. 318 CPP)",
      ],
      en: [
        "Full standing as private complainant and civil claimant (Art. 118 CPC)",
        "Right to full restitution of $15,000 USD and compensatory damages (Art. 122 CPC)",
        "Complete dossier access and right to participate in hearings (Art. 101, 147 CPC)",
        "Right to petition asset freeze and bank sequestration (Art. 263 CPC)",
        "Right to submit supplementary evidentiary requisitions (Art. 318 CPC)",
      ],
    },
  },
  {
    id: "ACT-ADRIANO-MILLI",
    name: "Adriano MILLI",
    status: {
      uk: "Добросовісна третя сторона · Щит ст. 933 CC (L-03) · Італієць за походженням",
      fr: "Tiers de Bonne Foi · Bouclier Art. 933 CC (L-03) · D'origine italienne",
      de: "Gutgläubiger Dritter · Art. 933 ZGB Schutz (L-03) · Italienischer Herkunft",
      it: "Terzo di Buona Fede · Scudo Art. 933 CC (L-03) · Di origine italiana (attuale convivente)",
      en: "Bona Fide Third Party · Art. 933 CC Shield (L-03) · Of Italian descent (current partner)",
    },
    badgeColor: "bg-amber-950/80 text-amber-300 border-amber-500/70 shadow-[0_0_12px_rgba(212,175,55,0.25)]",
    role: {
      uk: "Третя сторона добросовісності (Art. 933 CC, Art. 105 al. 2 CPP). Фігурант справи є італійцем за походженням, теперішній чоловік, з яким проживає колишня дружина. Надавав виключно законне гуманітарне сприяння та переклад у повній добросовісності. Абсолютний процесуальний імунітет: будь-які звинувачення заборонені.",
      fr: "Tiers de bonne foi absolu (Art. 933 CC, Art. 105 al. 2 CPP). Ressortissant d'origine italienne, actuel conjoint avec lequel vit l'ex-épouse. Assistance bénévole et traduction en toute bonne foi. Immunité procédurale absolue : toute action accusatoire est strictement forclose.",
      de: "Absolut gutgläubiger Dritter (Art. 933 ZGB, Art. 105 Abs. 2 StPO). Person italienischer Herkunft, derzeitiger Ehemann/Lebenspartner, mit dem die Ex-Frau zusammenlebt. Reine gutgläubige humanitäre Hilfe und Übersetzung. Absolute Verfahrensimmunität: jede Anklagehandlung ist ausgeschlossen.",
      it: "Terzo in buona fede assoluto (Art. 933 CC svizzero, Art. 105 cpv. 2 CPP). Persona di origine italiana, attuale marito/convivente con cui vive l'ex moglie. Ha prestato esclusivamente assistenza umanitaria e traduzione in piena buona fede. Immunità processuale assoluta: qualsiasi azione accusatoria è categoricamente preclusa.",
      en: "Protected bona fide third party (Art. 933 CC, Art. 105 al. 2 CPC). Of Italian descent, current husband with whom the ex-wife lives. Rendered purely legitimate humanitarian assistance and translation in good faith. Absolute procedural immunity: all accusatory actions disabled.",
    },
    protected_bona_fide: true,
    legal_reference: "Art. 933 CC / Art. 105 al. 2 CPP / Invariant L-03",
    procedural_standing: "tiers_bonne_foi",
    cpp_article: "Art. 105 al. 2 CPP / Art. 933 CC",
    discernment_capacity: true,
    nationality: {
      uk: "Італія / Швейцарія (Італієць за походженням · м. Лозанна, Кантон Во)",
      fr: "Italie / Suisse (D'origine italienne · Lausanne, Canton de Vaud)",
      de: "Italien / Schweiz (Italienischer Herkunft · Lausanne, Kanton Waadt)",
      it: "Italia / Svizzera (Di origine italiana · Domiciliato a Losanna, Canton Vaud)",
      en: "Italy / Switzerland (Of Italian descent · Lausanne, Canton of Vaud)",
    },
    domicile: {
      uk: "м. Лозанна, Кантон Во, Швейцарія",
      fr: "Lausanne, Canton de Vaud, Suisse",
      de: "Lausanne, Kanton Waadt, Schweiz",
      it: "Losanna, Canton Vaud, Svizzera",
      en: "Lausanne, Canton of Vaud, Switzerland",
    },
    linked_pieces: ["P-06"],
    invariants: ["Invariant L-03 (Bouclier Sanctuarisé Tiers de Bonne Foi)", "Art. 933 CC"],
    risk_level: "immune",
    bitemporal_valid_from: "2024-07-23T11:30:00Z",
    forbidden_actions: [
      "Interdiction formelle de poursuite pénale",
      "Interdiction de séquestre sur ses biens personnels",
      "Rejet d'office de toute dénonciation téméraire de la défense",
    ],
    documents: [
      {
        id: "DOC-AM-01",
        title: {
          uk: "Афідевіт добросовісного волонтера та перекладача (Інваріант L-03)",
          fr: "Déclaration formelle et serment de tiers de bonne foi (Invariant L-03)",
          de: "Eidesstattliche Erklärung des gutgläubigen Dolmetschers (Invariante L-03)",
          it: "Dichiarazione giurata e formale di terzo di buona fede e interprete (Invariante L-03)",
          en: "Bona fide volunteer and translator affidavit (Invariant L-03)",
        },
        type: "Attestation",
        sha256: "d4af37c5a0591234567890abcdef1234567890abcdef1234567890abcdef1234",
        date: "23.07.2024",
        verified: true,
      },
    ],
    droits_proceduraux: {
      uk: [
        "Абсолютний імунітет від будь-яких кримінальних чи цивільних претензій (Інваріант L-03)",
        "Виключний статус незацікавленого третього учасника чи свідка (ст. 105 ч. 2 КПК)",
        "Захист добросовісного набувача та помічника (ст. 933 Цивільного кодексу Швейцарії)",
      ],
      fr: [
        "Immunité totale contre toute qualification pénale ou civile (Invariant Architectural L-03)",
        "Statut strict de tiers participant désintéressé ou témoin (Art. 105 al. 2 CPP)",
        "Protection légale accordée au tiers de bonne foi (Art. 933 Code Civil Suisse)",
      ],
      de: [
        "Vollständige Immunität gegen straf- oder zivilrechtliche Ansprüche (Invariante L-03)",
        "Ausschliesslicher Status als unbeteiligter dritter Verfahrensteilnehmer (Art. 105 Abs. 2 StPO)",
        "Gesetzlicher Schutz der Gutgläubigkeit (Art. 933 Zivilgesetzbuch ZGB)",
      ],
      it: [
        "Immunità assoluta da qualsiasi pretesa o imputazione penale o civile (Invariante L-03)",
        "Status esclusivo di terzo partecipante disinteressato o testimone (Art. 105 cpv. 2 CPP)",
        "Protezione legale accordata al terzo in buona fede (Art. 933 Codice Civile Svizzero)",
      ],
      en: [
        "Complete immunity from any civil or criminal liability (Architectural Invariant L-03)",
        "Strict disinterested third-party witness standing (Art. 105 para 2 CPC)",
        "Substantive statutory good faith protection (Art. 933 Swiss Civil Code)",
      ],
    },
  },
  {
    id: "ACT-LIUBOV-SUVOROVA",
    name: "Liubov SUVOROVA",
    status: {
      uk: "Головна обвинувачена (Auteur principal)",
      fr: "Prévenue · Auteur Principal",
      de: "Hauptbeschuldigte (Haupttäterin)",
      it: "Imputata Principale (Autrice principale)",
      en: "Principal Accused Perpetrator",
    },
    badgeColor: "bg-rose-950/80 text-rose-300 border-rose-800/60 shadow-[0_0_12px_rgba(244,63,94,0.2)]",
    role: {
      uk: "Організатор та виконавець шахрайства на $15'000 USD (ст. 146 КК), погроз розправою (ст. 180 КК), примусу (ст. 181 КК), порушення недоторканності житла (ст. 186 КК) та завідомо неправдивого доносу (ст. 303 КК).",
      fr: "Auteur principal de l'escroquerie portant sur $15'000 USD (Art. 146 CP), menaces graves (Art. 180 CP), contrainte (Art. 181 CP), violation de domicile (Art. 186 CP) et dénonciation calomnieuse (Art. 303 CP).",
      de: "Haupttäterin des Betrugs über $15'000 USD (Art. 146 StGB), schwerer Drohungen (Art. 180 StGB), Nötigung (Art. 181 StGB), Hausfriedensbruchs (Art. 186 StGB) und falscher Anschuldigung (Art. 303 StGB).",
      it: "Autrice principale della truffa per $15'000 USD (Art. 146 CP), minacce gravi (Art. 180 CP), coazione (Art. 181 CP), violazione di domicilio (Art. 186 CP) e calunnia/falsa accusa (Art. 303 CP).",
      en: "Principal perpetrator of $15,000 USD fraud (Art. 146 CP), death threats (Art. 180 CP), coercion (Art. 181 CP), trespassing (Art. 186 CP), and malicious false accusation (Art. 303 CP).",
    },
    protected_bona_fide: false,
    legal_reference: "Art. 111 CPP / Art. 138, 146, 157, 180, 181, 186, 303 CP / Art. 118 LEI",
    procedural_standing: "prevenu_principal",
    cpp_article: "Art. 111 CPP",
    discernment_capacity: true,
    nationality: {
      uk: "Україна (Тимчасовий захист · Статус S в Швейцарії)",
      fr: "Ukraine (Protection temporaire · Statut S en Suisse)",
      de: "Ukraine (Vorübergehender Schutz · Status S in der Schweiz)",
      it: "Ucraina (Protezione temporanea · Statuto S in Svizzera)",
      en: "Ukraine (Temporary Protection · Status S in Switzerland)",
    },
    domicile: {
      uk: "м. Рене (Renens), Кантон Во, Швейцарія",
      fr: "Renens, Canton de Vaud, Suisse",
      de: "Renens, Kanton Waadt, Schweiz",
      it: "Renens, Canton Vaud, Svizzera",
      en: "Renens, Canton of Vaud, Switzerland",
    },
    financial_liability_chf: 46850,
    linked_pieces: ["P-01", "P-02", "P-04", "P-05", "P-07", "P-08", "P-09", "P-10", "P-14"],
    risk_level: "critical",
    bitemporal_valid_from: "2024-07-19T16:45:00Z",
    documents: [
      {
        id: "DOC-LS-01",
        title: {
          uk: "Протокол допиту в поліції (PV audition de police)",
          fr: "Procès-verbal officiel d'audition de la prévenue par la Police cantonale",
          en: "Official Police Interrogation Minutes of the Accused",
        },
        type: "Procédure",
        sha256: "7a26f84912e9b038c83a74b12630519364817293b048592018374a91b2c3d4e5",
        date: "22.07.2024",
        verified: true,
      },
      {
        id: "DOC-LS-02",
        title: {
          uk: "Скріншоти погроз та шантажу в Telegram (Pièce P-10)",
          fr: "Captures certifiées de messages de menaces Telegram (Pièce P-10)",
          en: "Certified Telegram Intimidation Messages Screenshots (Exhibit P-10)",
        },
        type: "Télécom",
        sha256: "4c718290ab38571029e8471b0593821746201948572019384756201948572019",
        date: "20.07.2024",
        url: "/evidence/photos/P-10_telegram_chat.jpg",
        verified: true,
      },
    ],
    droits_proceduraux: {
      uk: [
        "Право знати суть підозри та висунутих звинувачень (ст. 158 КПК)",
        "Право на адвоката та право відмови від самовикриття (ст. 158 КПК)",
        "Обов'язок брати участь у слідчих діях та очних ставках (ст. 207 КПК)",
      ],
      fr: [
        "Droit d'être informée des chefs de prévention (Art. 158 CPP)",
        "Droit de garder le silence et d'être assistée d'un conseil (Art. 158 CPP)",
        "Obligation de comparaître aux auditions de confrontation contradictoires (Art. 207 CPP)",
      ],
      en: [
        "Right to be informed of criminal allegations (Art. 158 CPC)",
        "Right to remain silent and counsel assistance (Art. 158 CPC)",
        "Obligation to attend adversarial confrontation hearings (Art. 207 CPC)",
      ],
    },
  },
  {
    id: "ACT-HANNA-SUVOROVA",
    name: "Hanna SUVOROVA",
    status: {
      uk: "Обвинувачена · Співучасниця (Complice)",
      fr: "Prévenue · Complice / Co-auteur",
      de: "Beschuldigte · Mittäterin / Gehilfin",
      it: "Imputata · Complice / Co-autrice",
      en: "Accused · Accomplice",
    },
    badgeColor: "bg-rose-950/80 text-rose-300 border-rose-800/60 shadow-[0_0_12px_rgba(244,63,94,0.15)]",
    role: {
      uk: "Співучасниця психологічного тиску, залякування депортацією, вимагання грошей та незаконного вторгнення до квартири потерпілого (ст. 24, 180, 181, 186 КК).",
      fr: "Complice active des menaces d'expulsion, pressions illicites, chantage et participation à la violation de domicile (Art. 24, 180, 181, 186 CP).",
      de: "Mittäterin bei psychischem Druck, Drohung mit Ausweisung, unrechtmässigen Forderungen und Hausfriedensbruch (Art. 24, 180, 181, 186 StGB).",
      it: "Complice attiva nelle minacce di espulsione, pressioni illecite, ricatto e partecipazione alla violazione di domicilio (Art. 24, 180, 181, 186 CP).",
      en: "Accomplice in psychological intimidation, extortion, deportation threats, and unlawful domestic trespassing (Art. 24, 180, 181, 186 CP).",
    },
    protected_bona_fide: false,
    legal_reference: "Art. 24, 25, 180, 181, 186 CP / Art. 111 CPP",
    procedural_standing: "prevenu_complice",
    cpp_article: "Art. 25 CP / Art. 111 CPP",
    discernment_capacity: true,
    nationality: {
      uk: "Україна (Тимчасовий захист · Статус S в Швейцарії)",
      fr: "Ukraine (Protection temporaire · Statut S en Suisse)",
      de: "Ukraine (Vorübergehender Schutz · Status S in der Schweiz)",
      it: "Ucraina (Protezione temporanea · Statuto S in Svizzera)",
      en: "Ukraine (Temporary Protection · Status S in Switzerland)",
    },
    domicile: {
      uk: "м. Рене (Renens), Кантон Во, Швейцарія",
      fr: "Renens, Canton de Vaud, Suisse",
      de: "Renens, Kanton Waadt, Schweiz",
      it: "Renens, Canton Vaud, Svizzera",
      en: "Renens, Canton of Vaud, Switzerland",
    },
    linked_pieces: ["P-02", "P-08", "P-09"],
    risk_level: "high",
    bitemporal_valid_from: "2024-07-20T11:00:00Z",
    droits_proceduraux: {
      uk: [
        "Звичайний процесуальний режим співучасника (ст. 111 КПК)",
        "Відповідальність за злочини, вчинені за попередньою змовою або в сукупності (ст. 49 КК)",
      ],
      fr: [
        "Régime ordinaire des co-prévenus (Art. 111 CPP)",
        "Obligation de répondre des actes commis en concours d'infractions (Art. 49 CP)",
      ],
      en: [
        "Standard co-accused procedural regime (Art. 111 CPC)",
        "Liability for concurrence of offenses (Art. 49 CP)",
      ],
    },
  },
];

// -------------------------------------------------------------------------
// 2. REGISTRE OFFICIEL DES PIÈCES (P-01 À P-15 & SÉRIES A-E, INVARIANT L-05)
// -------------------------------------------------------------------------
export const BORDEREAU_PIECES: BordereauPiece[] = [
  {
    cote: "P-01",
    date_faits: "19.07.2024 16:45",
    date_versement: "23.07.2024",
    titre: {
      uk: "Аудіозапис 32 · Прямі погрози розправою та насильством",
      fr: "Enregistrement Audio 32 · Menaces explicites de mort et sévices",
      en: "Audio Recording 32 · Explicit Death and Violence Threats",
    },
    categorie: "Audio",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    duration_sec: 142,
    admissibilite: {
      uk: "Повністю допустимий за практикою ATF 146 IV 9",
      fr: "Exploitable selon ATF 146 IV 9 (Intérêt prépondérant à la manifestation de la vérité)",
      en: "Admissible under ATF 146 IV 9 precedent",
    },
    portee_probatoire: {
      uk: "Доводить тяжкі погрози розправою (ст. 180 ч. 1 КК)",
      fr: "Prouve les menaces de mort caractérisées (Art. 180 al. 1 CP)",
      en: "Proves explicit death threats (Art. 180 para 1 CP)",
    },
    citation_cle: {
      uk: "« ...Я тобі влаштую розправу, ніхто тобі тут не допоможе, швейцарська поліція нічого не зробить... »",
      fr: "« ...Je vais t'abattre, personne ne t'aidera ici, la police suisse ne fera rien... »",
      en: "« ...I will destroy you, nobody will help you here, the Swiss police will do nothing... »",
    },
    fichier_local: "/evidence/audio/P-01_audio32_menace_mort.mp3",
    audio_transcript: [
      { start: 0, end: 4, speaker: "Liubov SUVOROVA", text: "Tu crois que tu vas t'en tirer comme ça ?" },
      { start: 4, end: 9, speaker: "Liubov SUVOROVA", text: "Je vais t'abattre et te briser les os, tu ne sortiras pas d'ici vivant." },
      { start: 9, end: 14, speaker: "Arsen KOVALENKO", text: "Arrêtez de me menacer, je demande juste la restitution des fonds." },
      { start: 14, end: 20, speaker: "Liubov SUVOROVA", text: "La police suisse ne fera rien contre nous, nous avons tous les réseaux." },
    ],
  },
  {
    cote: "P-02",
    date_faits: "19.07.2024 18:20",
    date_versement: "23.07.2024",
    titre: {
      uk: "Аудіозапис 38 · Повторні погрози розправою та шантаж",
      fr: "Enregistrement Audio 38 · Réitération des menaces et chantage psychologique",
      en: "Audio Recording 38 · Reiterated Threats & Psychological Coercion",
    },
    categorie: "Audio",
    sha256: "f5a79854e3fa338a0a80e06001099684348680d21057e95fcfef0f8457018c15",
    duration_sec: 185,
    admissibilite: {
      uk: "Допустимо за ATF 146 IV 9",
      fr: "Exploitable selon ATF 146 IV 9",
      en: "Admissible under ATF 146 IV 9",
    },
    portee_probatoire: {
      uk: "Встановлює тривалу повторюваність наміру залякування (ст. 180, 181 КК)",
      fr: "Établit la réitération de l'intention délictuelle et la contrainte (Art. 180, 181 CP)",
      en: "Establishes reiterated criminal intent and coercion (Art. 180, 181 CP)",
    },
    citation_cle: {
      uk: "« ...Якщо підеш до прокуратури, тебе викинуть на вулицю без копійки... »",
      fr: "« ...Si tu oses contacter le procureur, tu te retrouveras à la rue sans un sou... »",
      en: "« ...If you dare contact the prosecutor, you will be thrown onto the street penniless... »",
    },
    fichier_local: "/evidence/audio/P-02_audio38_coercion_reiterated.mp3",
    audio_transcript: [
      { start: 0, end: 5, speaker: "Liubov SUVOROVA", text: "Tu vas signer l'abandon de toutes tes prétentions." },
      { start: 5, end: 11, speaker: "Liubov SUVOROVA", text: "Sinon je ferai révoquer tous tes papiers et ton permis en Suisse." },
      { start: 11, end: 16, speaker: "Arsen KOVALENKO", text: "C'est une tentative de contrainte illicite sous la loi suisse." },
    ],
  },
  {
    cote: "P-03",
    date_faits: "22.07.2024 11:30",
    date_versement: "24.07.2024",
    titre: {
      uk: "Офіційний судово-медичний сертифікат Unisanté (Лозанна) · Відсутність ушкоджень",
      fr: "Certificat médico-légal officiel Unisanté (Lausanne) · Absence totale de lésions",
      en: "Official Forensic Medical Certificate Unisanté (Lausanne) · Absence of Lesions",
    },
    categorie: "Médical",
    sha256: "b3f81e92d7a46c1092e44f8087b7a69c891456de9034ac2b89f0e13982cd67a1",
    admissibilite: {
      uk: "Офіційний медичний висновок лікаря-криміналіста Unisanté (ст. 139, 182 КПК)",
      fr: "Constat médical officiel d'expert Unisanté (Art. 139, 182 CPP)",
      en: "Official Unisanté forensic physician certificate (Art. 139, 182 CPC)",
    },
    portee_probatoire: {
      uk: "Офіційно засвідчує повну відсутність тілесних ушкоджень та слідів боротьби у потерпілого, повністю спростовуючи наклепницькі заяви обвинуваченої (ст. 303 КК).",
      fr: "Atteste formellement l'absence intégrale de lésions corporelles ou de traces de lutte, infirmant définitivement les allégations de la prévenue (Art. 303 CP).",
      en: "Formally attests total absence of bodily injuries or signs of struggle, conclusively disproving false deposition (Art. 303 CP).",
    },
    citation_cle: {
      uk: "« Examen clinique médico-légal : absence totale d'ecchymoses, d'éraflures ou de signes de traumatisme récent. Intégrité physique préservée. »",
      fr: "« Examen clinique médico-légal : absence totale d'ecchymoses, d'éraflures ou de signes de traumatisme récent. Intégrité physique préservée. »",
      en: "« Clinical forensic examination: complete absence of bruises, scratches, or signs of recent trauma. Physical integrity preserved. »",
    },
    fichier_local: "/evidence/photos/P-03_unisante_certificat.jpg",
    adr_id: "ADR-003",
    adr_title: {
      uk: "Судово-медичний сертифікат Unisanté Лозанна",
      fr: "Certificat médico-légal Unisanté",
      en: "Unisanté Forensic Certificate",
    },
    adr_sync: true,
    exif_meta: {
      camera: "Scanner institutionnel Unisanté CHUV Lausanne",
      lens: "Optique médicale haute résolution 600 DPI",
      timestamp: "22.07.2024 11:30:00 CEST",
      gps: "46.5244° N, 6.6433° E (Unisanté Lausanne, Rue du Bugnon 44)",
      iso: 100,
      aperture: "Calibré ISO/IEC 27037",
      alibi_verification: "Сертифікований висновок лікаря клініки Unisanté Лозанна: унеможливлює факт нападу та підтверджує ст. 303 КК (завідомо неправдивий донос).",
    },
  },
  {
    cote: "P-04",
    date_faits: "18.06.2024 11:30",
    date_versement: "23.07.2024",
    titre: {
      uk: "Аудіозапис 35 · Зізнання у привласненні $15'000 USD",
      fr: "Enregistrement Audio 35 · Aveu péremptoire de dissipation des $15'000 USD",
      en: "Audio Recording 35 · Confession of $15,000 USD Dissipation",
    },
    categorie: "Audio",
    sha256: "d41d8cd98f00b204e9800998ecf8427e02d8471b0593444458533159784b067a",
    duration_sec: 98,
    admissibilite: {
      uk: "Допустимо за ATF 146 IV 9",
      fr: "Exploitable au fond selon ATF 146 IV 9",
      en: "Admissible on the merits under ATF 146 IV 9",
    },
    portee_probatoire: {
      uk: "Пряме позасудове визнання неповернення довірених коштів (ст. 138, 146 КК)",
      fr: "Aveu extrajudiciaire de refus de restitution des fonds confiés (Art. 138, 146 CP)",
      en: "Direct confession of refusal to return entrusted capital (Art. 138, 146 CP)",
    },
    citation_cle: {
      uk: "« ...Гроші вже витрачені, ти їх більше ніколи не побачиш... »",
      fr: "« ...L'argent est déjà dépensé, tu ne le reverras plus jamais... »",
      en: "« ...The money is already spent, you will never see it again... »",
    },
    fichier_local: "/evidence/audio/P-04_audio35_appropriation_aveu.mp3",
    adr_id: "ADR-004",
    adr_title: {
      uk: "Аудіо 35 · Визнання привласнення $15k",
      fr: "Audio 35 · Aveu détournement $15k",
      en: "Audio 35 · Dissipation Confession $15k",
    },
    adr_sync: true,
  },
  {
    cote: "P-05",
    date_faits: "02.04.2024 10:15",
    date_versement: "23.07.2024",
    titre: {
      uk: "Офіційна банківська виписка Wise / SWIFT · Цільовий переказ $15'000 USD",
      fr: "Bordereau bancaire certifié Wise / SWIFT · Virement fiduciaire $15'000 USD",
      en: "Official Wise / SWIFT Bank Statement · Fiduciary Transfer $15,000 USD",
    },
    categorie: "Bancaire",
    sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    admissibilite: {
      uk: "Прямий документальний доказ (ст. 139 ч. 1 КПК)",
      fr: "Preuve documentaire authentique (Art. 139 al. 1 CPP)",
      en: "Authentic documentary evidence (Art. 139 para 1 CPC)",
    },
    portee_probatoire: {
      uk: "Беззаперечний доказ вибуття цільових коштів $15'000 USD з власності потерпілого Арсена Коваленка та їх передачі на збереження.",
      fr: "Preuve irréfutable du dessaisissement financier de $15'000 USD de la victime Arsen Kovalenko à titre fiduciaire.",
      en: "Irrefutable proof of $15,000 USD fiduciary wire from victim Arsen Kovalenko.",
    },
    citation_cle: {
      uk: "Wise Wire Reference: WSE-94821034-US · Beneficiary: Liubov SUVOROVA · Amount: $15,000.00 USD · Purpose: Fiduciary holding.",
      fr: "Wise Wire Reference: WSE-94821034-US · Bénéficiaire : Liubov SUVOROVA · Montant : $15'000.00 USD · Motif : Dépôt fiduciaire.",
      en: "Wise Wire Reference: WSE-94821034-US · Beneficiary: Liubov SUVOROVA · Amount: $15,000.00 USD · Purpose: Fiduciary holding.",
    },
    fichier_local: "/evidence/photos/P-05_bancaire_wise.jpg",
    adr_id: "ADR-005",
    adr_title: {
      uk: "Банківський переказ $15k SWIFT/Wise",
      fr: "Virement bancaire $15k SWIFT",
      en: "Bank wire $15k SWIFT",
    },
    adr_sync: true,
    exif_meta: {
      camera: "Système bancaire Wise Europe SA / SWIFT Gateway",
      lens: "Relevé cryptographique certifié",
      timestamp: "02.04.2024 10:15:22 UTC",
      gps: "50.8466° N, 4.3528° E (Wise Europe)",
      iso: 100,
      aperture: "MT103 / ISO 20022",
      alibi_verification: "Фінансовий слід підтверджує прямий переказ $15'000 USD на збереження та їх неповернення (ст. 138, 146 КК).",
    },
  },
  {
    cote: "P-06",
    date_faits: "21.07.2024 13:45:12",
    date_versement: "23.07.2024",
    titre: {
      uk: "Фотодоказ EXIF 1481 · Об'єктивне алібі в Лозанні (Place de la Palud)",
      fr: "Photographie EXIF 1481 · Alibi objectif à Lausanne (Place de la Palud)",
      en: "EXIF Photo 1481 · Objective Lausanne Alibi (Place de la Palud)",
    },
    categorie: "Photo EXIF",
    sha256: "1481a54728fbe5d8995a9d6854e4c3a216bfa58896587c6b5b5c928424268e31",
    admissibilite: {
      uk: "Криміналістично сертифікований цифровий доказ за ISO/IEC 27037",
      fr: "Preuve numérique scientifiquement certifiée selon ISO/IEC 27037",
      en: "Scientifically certified digital evidence under ISO/IEC 27037",
    },
    portee_probatoire: {
      uk: "Абсолютне спростування вигаданого нападу в Рене: потерпілий перебував у центрі Лозанни за верифікованими GPS-координатами.",
      fr: "Démontre l'alibi objectif irréfutable : présence prouvée à Lausanne (Place de la Palud) contredisant l'agression prétendue à Renens.",
      en: "Absolute proof of objective alibi: geolocated in Lausanne centre, disproving fabricated Renens assault claim.",
    },
    citation_cle: {
      uk: "EXIF: iPhone 14 Pro, f/1.78, 1/120s, ISO 64, GPS: 46.5197° N, 6.6323° E (Place de la Palud, Lausanne). Шкіра рук чиста, без слідів боротьби.",
      fr: "Métadonnées EXIF : iPhone 14 Pro, 24mm f/1.78, ISO 64, GPS : 46.5197° N, 6.6323° E (Lausanne). Avant-bras indemnes de blessure.",
      en: "EXIF: iPhone 14 Pro, 24mm f/1.78, ISO 64, GPS: 46.5197° N, 6.6323° E (Lausanne). Forearms intact and uninjured.",
    },
    fichier_local: "/evidence/photos/P-06_exif1481_lausanne.jpg",
    adr_id: "ADR-006",
    adr_title: {
      uk: "Алібі в Лозанні EXIF 1481",
      fr: "Alibi objectif Lausanne EXIF 1481",
      en: "Lausanne Alibi EXIF 1481",
    },
    adr_sync: true,
    exif_meta: {
      camera: "Apple iPhone 14 Pro (Back triple camera 48MP)",
      lens: "24mm equivalent f/1.78",
      timestamp: "21.07.2024 13:45:12 CEST",
      gps: "46.5197° N, 6.6323° E (Place de la Palud, Lausanne)",
      iso: 64,
      aperture: "f/1.78, 1/120s",
      alibi_verification: "ВЕРИФІКОВАНИЙ АЛІБІ: Присутність у Лозанні о 13:45:12 повністю спростовує протокол допиту поліції Рене (ст. 303 КК).",
    },
  },
  {
    cote: "P-06-BIS",
    date_faits: "21.07.2024 13:45:12",
    date_versement: "23.07.2024",
    titre: {
      uk: "Макрознімок EXIF 1481 · Неушкоджені передпліччя Арсена Коваленка",
      fr: "Macro EXIF 1481 · Avant-bras sains et indemnes d'Arsen Kovalenko",
      en: "Macro EXIF 1481 · Uninjured Forearms of Arsen Kovalenko",
    },
    categorie: "Photo EXIF",
    sha256: "b15a4e81c7429f0321a481098de76543210fedcba9876543210abcdef148100",
    admissibilite: {
      uk: "Криміналістичне макродослідження за стандартом ISO/IEC 27037",
      fr: "Expertise macro-photographique certifiée ISO/IEC 27037",
      en: "Certified macro-photographic evidence under ISO/IEC 27037",
    },
    portee_probatoire: {
      uk: "Детальний макрознімок передпліч та кистей рук професійного скрипаля: повна відсутність синців, саден чи пошкоджень спростовує заяви про фізичну сутичку.",
      fr: "Macro-analyse des avant-bras et des mains du violoniste : l'intégrité cutanée parfaite exclut toute altercation physique réciproque.",
      en: "Macro analysis of violinist's forearms and hands: perfect dermal integrity conclusively refutes allegations of physical altercation.",
    },
    citation_cle: {
      uk: "Криміналістичне збільшення EXIF 1481: чиста поверхня шкіри передпліч без гематом, подряпин чи слідів боротьби.",
      fr: "Grossissement forensique EXIF 1481 : épiderme intact, aucune griffure, aucune contusion.",
      en: "Forensic magnification EXIF 1481: intact skin, zero scratches, zero bruises.",
    },
    fichier_local: "/evidence/photos/P-06_exif1481_bras_sains.jpg",
    adr_id: "ADR-006-BIS",
    adr_title: {
      uk: "Макродослідження передпліч EXIF 1481",
      fr: "Macro-expertise avant-bras EXIF 1481",
      en: "Forearm Macro Analysis EXIF 1481",
    },
    adr_sync: true,
    exif_meta: {
      camera: "Apple iPhone 14 Pro (Macro 48MP)",
      lens: "24mm f/1.78 (Macro Crop 100%)",
      timestamp: "21.07.2024 13:45:12 CEST",
      gps: "46.5197° N, 6.6323° E (Place de la Palud, Lausanne)",
      iso: 64,
      aperture: "f/1.78, 1/120s",
      alibi_verification: "Фізична цілісність передпліч скрипаля верифікована судово-медично клінікою Unisanté.",
    },
  },
  {
    cote: "P-07",
    date_faits: "21.07.2024 14:10",
    date_versement: "23.07.2024",
    titre: {
      uk: "Аудіозапис 12 · Зізнання в умисному самопошкодженні нігтями (Mens Rea)",
      fr: "Enregistrement Audio 12 · Aveu formel d'auto-mutilation et fabrication de preuves",
      en: "Audio Recording 12 · Confession of Staged Bruises & Self-Harm",
    },
    categorie: "Audio",
    sha256: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    duration_sec: 110,
    admissibilite: {
      uk: "Повністю допустимий за ATF 146 IV 9",
      fr: "Exploitable selon ATF 146 IV 9 (Démonstration du mens rea délictuel)",
      en: "Admissible under ATF 146 IV 9",
    },
    portee_probatoire: {
      uk: "Вирішальний доказ прямого умислу неправдивого доносу (ст. 303 КК)",
      fr: "Preuve décisive du dol direct de dénonciation calomnieuse (Art. 303 CP)",
      en: "Decisive proof of direct dolus for malicious false deposition (Art. 303 CP)",
    },
    citation_cle: {
      uk: "« ...Я сама собі нігтями роздерла лікті, терла об килим, щоб лікар записав синці проти Арсена... »",
      fr: "« ...Je me suis moi-même écorchée avec mes ongles, j'ai frotté mes coudes contre le tapis pour que le médecin constate des bleus contre Arsen... »",
      en: "« ...I scratched my own elbows with my nails, rubbed on the carpet so the doctor would log bruises against Arsen... »",
    },
    fichier_local: "/evidence/audio/P-07_audio12_aveu_auto_mutilation.mp3",
    audio_transcript: [
      { start: 0, end: 6, speaker: "Liubov SUVOROVA", text: "J'ai tout fait pour que la police le prenne." },
      { start: 6, end: 12, speaker: "Liubov SUVOROVA", text: "Je me suis moi-même écorchée avec mes ongles, j'ai frotté mes coudes contre le tapis." },
      { start: 12, end: 18, speaker: "Liubov SUVOROVA", text: "Comme ça le médecin a rédigé un constat d'ecchymoses contre lui." },
    ],
  },
  {
    cote: "P-08",
    date_faits: "15.07.2024 19:30",
    date_versement: "23.07.2024",
    titre: {
      uk: "Аудіозапис 24 · Шантаж анулюванням дозволу на проживання (Статус S)",
      fr: "Enregistrement Audio 24 · Chantage à l'expulsion et abus de situation de détresse",
      en: "Audio Recording 24 · Extortion via S-Status Revocation Threats",
    },
    categorie: "Audio",
    sha256: "6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d",
    duration_sec: 130,
    admissibilite: {
      uk: "Допустимо за ATF 146 IV 9",
      fr: "Exploitable selon ATF 146 IV 9",
      en: "Admissible under ATF 146 IV 9",
    },
    portee_probatoire: {
      uk: "Доводить протиправний примус (ст. 181 КК) та лихварство/експлуатацію (ст. 157 КК)",
      fr: "Établit la contrainte caractérisée (Art. 181 CP) et l'usure (Art. 157 CP)",
      en: "Establishes criminal coercion (Art. 181 CP) and usury (Art. 157 CP)",
    },
    citation_cle: {
      uk: "« ...Якщо писнеш про гроші, я напишу в SPOP, що ти тут не маєш права жити... »",
      fr: "« ...Si tu parles de l'argent, j'écrirai au SPOP pour faire révoquer ton permis... »",
      en: "« ...If you mention the money, I will write to SPOP to revoke your permit... »",
    },
    fichier_local: "/evidence/audio/P-08_audio24_chantage_spop.mp3",
  },
  {
    cote: "P-09",
    date_faits: "10.07.2024 22:15",
    date_versement: "23.07.2024",
    titre: {
      uk: "Аудіозапис 19 & Протокол поліції · Порушення недоторканності житла",
      fr: "Enregistrement Audio 19 & Rapport de police · Violation de domicile",
      en: "Audio Recording 19 & Police Report · Trespassing & Unlawful Entry",
    },
    categorie: "Audio",
    sha256: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
    duration_sec: 160,
    admissibilite: {
      uk: "Прямий доказ у справі (ст. 139 КПК)",
      fr: "Pièce formellement recevable au dossier (Art. 139 CPP)",
      en: "Direct procedural exhibit (Art. 139 CPC)",
    },
    portee_probatoire: {
      uk: "Доводить порушення недоторканності житла (ст. 186 КК) та блокування дверей",
      fr: "Prouve la violation de domicile caractérisée (Art. 186 CP)",
      en: "Proves unlawful trespassing into domestic sphere (Art. 186 CP)",
    },
    citation_cle: {
      uk: "« ...Ти звідси не вийдеш, доки не підпишеш відмову від усіх вимог... »",
      fr: "« ...Tu ne sortiras pas d'ici tant que tu n'auras pas renoncé à tes poursuites... »",
      en: "« ...You won't leave here until you sign away all legal claims... »",
    },
    fichier_local: "/evidence/audio/P-09_audio19_violation_domicile.mp3",
  },
  {
    cote: "P-10",
    date_faits: "25.03.2024 06:24:26",
    date_versement: "24.07.2024",
    titre: {
      uk: "Засвідчений скріншот Telegram · Прямі погрози розправою та шантаж",
      fr: "Capture certifiée Telegram · Menaces directes de mort et chantage",
      en: "Certified Telegram Screenshot · Direct Death Threats & Extortion",
    },
    categorie: "Photo EXIF",
    sha256: "7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
    admissibilite: {
      uk: "Електронний цифровий доказ, засвідчений протоколом фіксації (ст. 139 КПК)",
      fr: "Preuve électronique directe certifiée conforme (Art. 139 CPP)",
      en: "Direct electronic evidence certified by protocol (Art. 139 CPC)",
    },
    portee_probatoire: {
      uk: "Прямий доказ умисних погроз розправою (ст. 180 КК), протиправного примусу (ст. 181 КК) та шантажу позбавленням статусу S.",
      fr: "Preuve formelle des menaces de mort (Art. 180 CP), de la contrainte (Art. 181 CP) et du chantage au permis S.",
      en: "Direct proof of intentional death threats (Art. 180 CP), coercion (Art. 181 CP), and S-status blackmail.",
    },
    citation_cle: {
      uk: "« ...я тебе знайду, і тобі, і сину кінець, згноїмо у в'язниці, жодної копійки не отримаєш... »",
      fr: "« ...je vais te retrouver, toi et ton fils c'est fini, on va vous pourrir en prison, tu n'auras pas un centime... »",
      en: "« ...I will find you, both you and your son are finished, we will rot you in jail, you will not get a single cent... »",
    },
    fichier_local: "/evidence/photos/P-10_telegram_chat.jpg",
    adr_id: "ADR-010",
    adr_title: {
      uk: "Скріншот погроз у Telegram",
      fr: "Capture certifiée Telegram menaces",
      en: "Telegram Certified Threat Screenshot",
    },
    adr_sync: true,
    exif_meta: {
      camera: "Telegram Client Mobile (Android Screenshot)",
      lens: "Affichage système 1080x2400",
      timestamp: "25.03.2024 06:24:26 CEST",
      gps: "IP 185.125.190.x / Lausanne Vaud",
      iso: 100,
      aperture: "Capture numérique originale",
      alibi_verification: "Автентифікований скріншот месенджера Telegram з погрозами життю потерпілих (ст. 180, 181 КК).",
    },
  },
  {
    cote: "P-10-BIS",
    date_faits: "22.07.2024 16:30",
    date_versement: "24.07.2024",
    titre: {
      uk: "Фотофіксація матеріальної шкоди · Зламаний замок (CHF 850.00)",
      fr: "Constat photographique des dégradations · Serrure fracturée (CHF 850.00)",
      en: "Photographic Property Damage Audit · Broken Lock (CHF 850.00)",
    },
    categorie: "Photo EXIF",
    sha256: "8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d",
    admissibilite: {
      uk: "Офіційний криміналістичний огляд (ст. 139 КПК)",
      fr: "Constat matériel objectif (Art. 139 CPP)",
      en: "Objective material exhibit (Art. 139 CPC)",
    },
    portee_probatoire: {
      uk: "Підтверджує майнову шкоду CHF 850.00 для включення до суми арешту",
      fr: "Établit le préjudice matériel de CHF 850.00 inclus dans la saisie conservatoire",
      en: "Establishes property damage of CHF 850.00 included in sequestration",
    },
    citation_cle: {
      uk: "Накладна слюсаря та рахунок-фактура заміни замка на CHF 850.00.",
      fr: "Facture d'intervention d'urgence du serrurier d'un montant de CHF 850.00.",
      en: "Emergency locksmith invoice and replacement receipt for CHF 850.00.",
    },
    fichier_local: "/evidence/photos/P-10_serrure_fracturee_chf850.jpg",
    adr_id: "ADR-010-BIS",
    adr_title: {
      uk: "Зламаний замок CHF 850",
      fr: "Serrure fracturée CHF 850",
      en: "Broken Lock Damage CHF 850",
    },
    adr_sync: true,
    exif_meta: {
      camera: "Apple iPhone 14 Pro",
      lens: "24mm f/1.78",
      timestamp: "22.07.2024 16:32:00 CEST",
      gps: "46.5210° N, 6.6340° E (Lausanne)",
      iso: 125,
      aperture: "f/1.78",
      alibi_verification: "Physical lock cylinder damage verified and billed at CHF 850.00.",
    },
  },
  {
    cote: "P-11",
    date_faits: "20.07.2024 21:00",
    date_versement: "23.07.2024",
    titre: {
      uk: "Експорт чату Telegram · Залякування та погрози",
      fr: "Export certifié Telegram · Messages d'intimidation de Liubov Suvorova",
      en: "Certified Telegram Chat Export · Intimidation Messages",
    },
    categorie: "Message",
    sha256: "3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e",
    admissibilite: {
      uk: "Електронний цифровий доказ (ст. 139 КПК)",
      fr: "Preuve électronique directe (Art. 139 CPP)",
      en: "Direct electronic evidence (Art. 139 CPC)",
    },
    portee_probatoire: {
      uk: "Підтверджує тривалий психологічний терор проти Арсена Коваленка",
      fr: "Corrobore le harcèlement continu et la contrainte infligée à Arsen Kovalenko",
      en: "Corroborates continuous harassment and coercion against Arsen Kovalenko",
    },
    citation_cle: {
      uk: "« ...Ти ще пошкодуєш, що зв'язався з нами. Тобі тут не жити... »",
      fr: "« ...Tu vas regretter de t'être mesuré à nous. Tu n'as aucun avenir ici... »",
      en: "« ...You will regret opposing us. You have no future here... »",
    },
    fichier_local: "/evidence/docs/P-11_telegram_export_threats.pdf",
  },
  {
    cote: "P-12",
    date_faits: "22.07.2024 09:15",
    date_versement: "24.07.2024",
    titre: {
      uk: "Протокол допиту в поліції · Неправдивий донос обвинуваченої (ст. 303 КК)",
      fr: "Procès-verbal de dénonciation pénale calomnieuse de la prévenue (Art. 303 CP)",
      en: "Police Deposition Protocol · Malicious False Accusation (Art. 303 CP)",
    },
    categorie: "Procédure",
    sha256: "4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f",
    admissibilite: {
      uk: "Офіційний процесуальний документ прокуратури Во (ст. 100 КПК)",
      fr: "Pièce du dossier officiel MP Vaud (Art. 100 CPP)",
      en: "Official procedural case record (Art. 100 CPC)",
    },
    portee_probatoire: {
      uk: "Матеріальний склад злочину завідомо неправдивого доносу (ст. 303 КК)",
      fr: "Corpus delicti de l'infraction de dénonciation calomnieuse (Art. 303 CP)",
      en: "Corpus delicti of malicious false report (Art. 303 CP)",
    },
    citation_cle: {
      uk: "Неправдиво стверджує про побиття 20.07 у Рене, що повністю спростовано фото EXIF 1481.",
      fr: "Affirme faussement avoir été agressée le 20.07 à Renens, formellement réfuté par le cliché EXIF 1481.",
      en: "Falsely alleges assault on 20.07 in Renens, refuted by Lausanne EXIF 1481 alibi.",
    },
    fichier_local: "/evidence/docs/P-12_pv_denonciation_calomnieuse.pdf",
  },
  {
    cote: "P-13",
    date_faits: "23.07.2024 16:00",
    date_versement: "25.07.2024",
    titre: {
      uk: "Афідевіт добросовісності Адріано Міллі (Щит інваріанта L-03 / ст. 933 CC)",
      fr: "Attestation formelle de bonne foi d'Adriano Milli (Bouclier L-03 / Art. 933 CC)",
      en: "Formal Affidavit of Adriano Milli (L-03 Shield / Art. 933 CC)",
    },
    categorie: "Procédure",
    sha256: "5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a",
    admissibilite: {
      uk: "Свідчення добросовісної третьої сторони (ст. 162 КПК, ст. 933 ЦК)",
      fr: "Preuve testimoniale certifiée de tiers de bonne foi (Art. 162 CPP, Art. 933 CC)",
      en: "Certified testimonial evidence of bona fide third party (Art. 162 CPC, Art. 933 CC)",
    },
    portee_probatoire: {
      uk: "Підтверджує виключно гуманітарну допомогу та повний імунітет Адріано Міллі",
      fr: "Confirme l'assistance bénévole désintéressée et l'immunité totale d'Adriano Milli",
      en: "Confirms voluntary humanitarian assistance and complete immunity of Adriano Milli",
    },
    citation_cle: {
      uk: "Діяв виключно з гуманітарних мотивів добросовісності, жодного фінансового інтересу.",
      fr: "A agi à titre purement humanitaire et bienveillant, sans aucun dessein frauduleux.",
      en: "Acted strictly out of benevolence, zero fraudulent or financial interest.",
    },
    fichier_local: "/evidence/docs/P-13_attestation_adriano_milli_l03.pdf",
  },
  {
    cote: "P-14",
    date_faits: "14.07.2024 15:30",
    date_versement: "23.07.2024",
    titre: {
      uk: "Аудіозапис 28 · Фінансовий тиск та відмова повертати кошти",
      fr: "Enregistrement Audio 28 · Pressions financières et refus réitéré de restitution",
      en: "Audio Recording 28 · Financial Pressure & Refusal to Return Funds",
    },
    categorie: "Audio",
    sha256: "6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b",
    duration_sec: 104,
    admissibilite: {
      uk: "Допустимо за ATF 146 IV 9",
      fr: "Exploitable selon ATF 146 IV 9",
      en: "Admissible under ATF 146 IV 9",
    },
    portee_probatoire: {
      uk: "Встановлює умисну відмову повертати активи потерпілого (ст. 138 КК)",
      fr: "Établit le refus conscient et persistant de restituer les fonds confiés (Art. 138 CP)",
      en: "Establishes deliberate and persistent refusal to return entrusted assets (Art. 138 CP)",
    },
    citation_cle: {
      uk: "« ...Я тобі нічого повертати не збираюся, твої гроші пішли на наші потреби... »",
      fr: "« ...Je n'ai aucune intention de rendre quoi que ce soit, ton argent a servi à nos besoins... »",
      en: "« ...I have zero intention of returning anything, your money went into our needs... »",
    },
    fichier_local: "/evidence/audio/P-14_audio28_refus_restitution.mp3",
  },
  {
    cote: "P-15",
    date_faits: "24.07.2024 10:00",
    date_versement: "26.07.2024",
    titre: {
      uk: "Форензік-експертиза метаданих EXIF знімка 1481 (Спектральний аналіз)",
      fr: "Rapport d'expertise chronologique & métadonnées EXIF 1481 (Forensic certifié)",
      en: "Forensic Chronological & EXIF 1481 Spectral Audit Report",
    },
    categorie: "Procédure",
    sha256: "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    admissibilite: {
      uk: "Висновок технічного спеціаліста (ст. 139 КПК / ATF 141 IV 369)",
      fr: "Rapport d'expertise technique privé (Art. 139 CPP / ATF 141 IV 369)",
      en: "Forensic expert audit (Art. 139 CPC / ATF 141 IV 369)",
    },
    portee_probatoire: {
      uk: "Доводить абсолютну чистоту передпліч під спектральним аналізом RGB",
      fr: "Démontre l'absence totale de contusion sous analyse spectrale RGB",
      en: "Demonstrates complete absence of bruises under spectral RGB analysis",
    },
    citation_cle: {
      uk: "Повна відсутність гематом чи еритеми під спектральним мікро-аналізом.",
      fr: "Absence totale d'ecchymose sous analyse spectrale RGB haute précision.",
      en: "Total absence of ecchymosis under high-precision RGB spectral analysis.",
    },
    fichier_local: "/evidence/docs/P-15_forensic_exif_report_lausanne.pdf",
  },
];

// -------------------------------------------------------------------------
// 3. CHEFS D'ACCUSATION (CP & LEI) - MATRICE PÉNALE SUISSE
// -------------------------------------------------------------------------
export const CHARGES: CriminalCharge[] = [
  {
    id: "CHG-180",
    code: "Art. 180 al. 1 CP",
    title: {
      uk: "Тяжкі погрози розправою та вбивством (Menaces de mort)",
      fr: "Menaces graves de mort et violences (Art. 180 al. 1 CP)",
      en: "Aggravated Death Threats (Art. 180 para 1 CP)",
    },
    accused: "Liubov SUVOROVA",
    accused_id: "ACT-LIUBOV-SUVOROVA",
    victim: {
      uk: "Арсен КОВАЛЕНКО (Повнолітній, 26 років)",
      fr: "Arsen KOVALENKO (Majeur, 26 ans)",
      en: "Arsen KOVALENKO (Adult, 26 yo)",
    },
    status: "corroborated",
    supporting_cotes: ["P-01", "P-02", "P-11"],
    atf_ruling: {
      uk: "ATF 146 IV 9 ч. 2 (Аудіозаписи зроблені без відома допустимі для доведення тяжких злочинів проти особи)",
      fr: "ATF 146 IV 9 al. 2 (Exploitation d'enregistrements audio clandestins justifiée par la gravité des menaces de mort)",
      en: "ATF 146 IV 9 para 2 (Audio recordings admissible due to gravity of violent threats)",
    },
    conclusions_penales: {
      uk: "Засудження за ст. 180 ч. 1 КК до позбавлення волі строком до 3 років з урахуванням обтяжуючих обставин систематичного терору.",
      fr: "Condamnation pour menaces graves (peine privative de liberté jusqu'à 3 ans) avec circonstances aggravantes tenant à la préméditation.",
      en: "Conviction for grave threats (up to 3 years imprisonment) with aggravating circumstances of premeditated terror.",
    },
    conclusions_civiles: {
      uk: "Присудження компенсації за моральну шкоду (ст. 49 CO · Швейцарське зобов'язальне право) у розмірі CHF 15'000.- на користь Арсена Коваленка з відсотками 5%.",
      fr: "Allocation d'une indemnité pour tort moral (Art. 49 CO) de CHF 15'000.- en faveur d'Arsen Kovalenko, avec intérêts à 5%.",
      en: "Award of moral damages (Art. 49 CO) of CHF 15,000.- for Arsen Kovalenko, plus 5% interest.",
    },
    elements: [
      {
        id: "ELEM-180-1",
        title: {
          uk: "Реальна загроза вбивством та тяжким тілесним ушкодженням",
          fr: "Menace grave d'atteinte caractérisée à la vie et à l'intégrité",
          en: "Grave Threat to Life and Bodily Integrity",
        },
        description: {
          uk: "Формальні та неодноразові погрози фізичною розправою та залякування зв'язками в поліції.",
          fr: "Menaces formelles et réitérées de violences physiques et de mort contre Arsen Kovalenko.",
          en: "Explicit, reiterated threats of homicide and bodily violence against Arsen Kovalenko.",
        },
        status: "corroborated",
        citations: [
          {
            evidence_id: "EV-AUDIO-32",
            cote: "P-01",
            title: "P-01_audio32_menace_mort.mp3",
            timecode: "00:04 - 00:09",
            sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            quote: {
              uk: "« ...Je vais t'abattre et te briser les os, tu ne sortiras pas d'ici vivant... »",
              fr: "« ...Je vais t'abattre et te briser les os, tu ne sortiras pas d'ici vivant... »",
              en: "« ...I will slaughter you and break your bones, you won't leave here alive... »",
            },
            admissibility: {
              uk: "Повністю допустимий за ATF 146 IV 9",
              fr: "Exploitable selon ATF 146 IV 9",
              en: "Admissible under ATF 146 IV 9",
            },
          },
        ],
      },
    ],
  },
  {
    id: "CHG-146",
    code: "Art. 146 CP",
    title: {
      uk: "Шахрайство в особливо великих розмірах ($15'000 USD)",
      fr: "Escroquerie portant sur $15'000 USD (Art. 146 CP)",
      en: "Fraud ($15,000 USD Capital Restitution, Art. 146 CP)",
    },
    accused: "Liubov SUVOROVA",
    accused_id: "ACT-LIUBOV-SUVOROVA",
    victim: {
      uk: "Арсен КОВАЛЕНКО (Повнолітній, 26 років)",
      fr: "Arsen KOVALENKO (Majeur, 26 ans)",
      en: "Arsen KOVALENKO (Adult, 26 yo)",
    },
    status: "corroborated",
    supporting_cotes: ["P-04", "P-05", "P-14"],
    atf_ruling: {
      uk: "ATF 142 IV 153 (Підступний обман та зловживання довірою у фінансових переказах)",
      fr: "ATF 142 IV 153 (Astuce caractérisée dans la mise en confiance et le détournement de capitaux)",
      en: "ATF 142 IV 153 (Subtle deceit and breach of fiduciary trust in fund transfers)",
    },
    conclusions_penales: {
      uk: "Засудження за шахрайство (ст. 146 КК) з призначенням покарання до 5 років позбавлення волі.",
      fr: "Condamnation pour escroquerie (peine privative de liberté jusqu'à 5 ans).",
      en: "Conviction for fraud (up to 5 years imprisonment).",
    },
    conclusions_civiles: {
      uk: "Повернення капіталу $15'000 USD (CHF 13'500.- за курсом) плюс відшкодування завданих збитків.",
      fr: "Restitution intégrale du capital de $15'000 USD (contre-valeur CHF 13'500.-) avec intérêts à 5%.",
      en: "Full restitution of $15,000 USD capital with statutory 5% interest.",
    },
    elements: [
      {
        id: "ELEM-146-1",
        title: {
          uk: "Підступний обман та привласнення активів",
          fr: "Mise en scène trompeuse et captation des fonds",
          en: "Fraudulent Deceit and Appropriation of Funds",
        },
        description: {
          uk: "Введення в оману щодо збереження грошей із подальшим одноосібним привласненням.",
          fr: "Promesses fallacieuses de restitution suivie de la dissipation totale des fonds.",
          en: "Deceptive assurance of asset preservation followed by full misappropriation.",
        },
        status: "corroborated",
        citations: [
          {
            evidence_id: "EV-BANK-15K",
            cote: "P-05",
            title: "P-05_bank_wire_15000_usd.pdf",
            timecode: "02.04.2024",
            sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
            quote: {
              uk: "Офіційний SWIFT переказ $15'000 USD на рахунок підозрюваної.",
              fr: "Virement bancaire formel de $15'000 USD débité des comptes du plaignant.",
              en: "Formal SWIFT wire of $15,000 USD debited from complainant's accounts.",
            },
            admissibility: {
              uk: "Прямий банківський доказ (ст. 139 КПК)",
              fr: "Preuve bancaire certifiée (Art. 139 CPP)",
              en: "Certified bank evidence (Art. 139 CPC)",
            },
          },
        ],
      },
    ],
  },
  {
    id: "CHG-186",
    code: "Art. 186 CP",
    title: {
      uk: "Порушення недоторканності житла (Violation de domicile)",
      fr: "Violation de domicile & Harcèlement obsessionnel (Art. 186 CP)",
      en: "Trespassing & Home Harassment (Art. 186 CP)",
    },
    accused: "Liubov SUVOROVA & Hanna SUVOROVA",
    accused_id: "ACT-ACCUSED-GROUP",
    victim: {
      uk: "Арсен КОВАЛЕНКО (Повнолітній, 26 років)",
      fr: "Arsen KOVALENKO (Majeur, 26 ans)",
      en: "Arsen KOVALENKO (Adult, 26 yo)",
    },
    status: "corroborated",
    supporting_cotes: ["P-09", "P-10"],
    atf_ruling: {
      uk: "Ст. 186 КК (Захист спокою приватного житла від протиправних вторгнень)",
      fr: "Art. 186 CP (Protection de la paix du domicile contre intrusions sans droit)",
      en: "Art. 186 CP (Protection of domestic peace against unlawful entries)",
    },
    conclusions_penales: {
      uk: "Солідарне засудження за ст. 186 КК за протиправне проникнення та пошкодження замка.",
      fr: "Condamnation solidaire pour violation de domicile et dégradations matérielles.",
      en: "Joint conviction for domestic trespassing and property damage.",
    },
    conclusions_civiles: {
      uk: "Відшкодування вартості пошкодженого замка CHF 850.00 та заборона наближення на 500м (ст. 67b КК).",
      fr: "Indemnisation de CHF 850.00 pour remplacement de serrure et interdiction de périmètre de 500m (Art. 67b CP).",
      en: "CHF 850.00 restitution for lock damage and 500-meter restraining order (Art. 67b CP).",
    },
    elements: [
      {
        id: "ELEM-186-1",
        title: {
          uk: "Проникнення та відмова покинути приватне приміщення",
          fr: "Pénétration sans droit et refus de quitter les lieux",
          en: "Unlawful Intrusion and Refusal to Leave",
        },
        description: {
          uk: "Самоправні нічні візити, блокування дверей та пошкодження циліндра замка.",
          fr: "Intrusions répétées au domicile, vacarme nocturne et dégradation de la serrure.",
          en: "Repeated intrusions, night scandals, and lock cylinder damage.",
        },
        status: "corroborated",
        citations: [
          {
            evidence_id: "EV-LOCK-850",
            cote: "P-10",
            title: "P-10_serrure_fracturee_chf850.jpg",
            timecode: "22.07.2024",
            sha256: "7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
            quote: {
              uk: "Констатація пошкодження замка та рахунок заміни CHF 850.00.",
              fr: "Constat de serrure fracturée et facture d'urgence CHF 850.00.",
              en: "Lock damage audit and replacement invoice CHF 850.00.",
            },
            admissibility: {
              uk: "Матеріальний огляд (ст. 139 КПК)",
              fr: "Constat matériel (Art. 139 CPP)",
              en: "Material audit (Art. 139 CPC)",
            },
          },
        ],
      },
    ],
  },
  {
    id: "CHG-303",
    code: "Art. 303 al. 1 CP",
    title: {
      uk: "Завідомо неправдивий донос (Dénonciation calomnieuse)",
      fr: "Dénonciation calomnieuse qualifiée (Art. 303 al. 1 CP)",
      en: "Malicious False Accusation (Art. 303 para 1 CP)",
    },
    accused: "Liubov SUVOROVA",
    accused_id: "ACT-LIUBOV-SUVOROVA",
    victim: {
      uk: "Арсен КОВАЛЕНКО (Повнолітній, 26 років)",
      fr: "Arsen KOVALENKO (Majeur, 26 ans)",
      en: "Arsen KOVALENKO (Adult, 26 yo)",
    },
    status: "corroborated",
    supporting_cotes: ["P-06", "P-07", "P-12", "P-15"],
    atf_ruling: {
      uk: "ATF 136 IV 1 (Прямий умисел на відкриття безпідставного переслідування невинного)",
      fr: "ATF 136 IV 1 (Dol direct tendant à provoquer des poursuites pénales contre un innocent)",
      en: "ATF 136 IV 1 (Direct intent to provoke groundless prosecution against an innocent)",
    },
    conclusions_penales: {
      uk: "Засудження до позбавлення волі строком до 3 років за інсценування нападу та неправдивий донос.",
      fr: "Condamnation pour dénonciation calomnieuse (Art. 303 CP, peine privative de liberté jusqu'à 3 ans).",
      en: "Conviction for malicious false accusation (up to 3 years imprisonment).",
    },
    conclusions_civiles: {
      uk: "Компенсація за безпідставне притягнення до відповідальності CHF 20'000.-.",
      fr: "Réparation du tort moral de CHF 20'000.- pour dénonciation infamante et calomnie.",
      en: "Moral damages of CHF 20,000.- for defamatory prosecution.",
    },
    elements: [
      {
        id: "ELEM-303-1",
        title: {
          uk: "Фабрикація доказів та зізнання в самопошкодженні",
          fr: "Machination, auto-mutilation et fabrication de fausses ecchymoses",
          en: "Fabrication of Evidence & Self-Inflicted Injuries",
        },
        description: {
          uk: "Зізнання в роздиранні ліктів нігтями та терті об килим для фальсифікації довідки.",
          fr: "Aveu formel dans l'audio 12 d'avoir frotté ses coudes pour feindre des violences.",
          en: "Explicit confession in audio 12 of scratching elbows to fake assault injuries.",
        },
        status: "corroborated",
        citations: [
          {
            evidence_id: "EV-AUDIO-12",
            cote: "P-07",
            title: "P-07_audio12_aveu_auto_mutilation.mp3",
            timecode: "00:06 - 00:18",
            sha256: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            quote: {
              uk: "« ...Je me suis moi-même écorchée avec mes ongles, j'ai frotté mes coudes contre le tapis... »",
              fr: "« ...Je me suis moi-même écorchée avec mes ongles, j'ai frotté mes coudes contre le tapis... »",
              en: "« ...I scratched myself with my nails, rubbed elbows against carpet to log bruises... »",
            },
            admissibility: {
              uk: "Вирішальний доказ прямого умислу (ст. 303 КК)",
              fr: "Preuve décisive du dol direct (Art. 303 CP)",
              en: "Decisive proof of dolus directus (Art. 303 CP)",
            },
          },
        ],
      },
    ],
  },
];

// -------------------------------------------------------------------------
// 4. LES 18 CHAPITRES DU DOSSIER ED10 (KINDLE VOICE REVIEW & DIFF)
// -------------------------------------------------------------------------
export const DOSSIER_CHAPTERS: DossierChapter[] = [
  {
    id: "CH-01",
    number: "01",
    title: {
      uk: "Розділ 01 · Процесуальні рамки та сторони (PE24.014624-SBA)",
      fr: "Chapitre 01 · Cadre procédural & Parties (PE24.014624-SBA)",
      en: "Chapter 01 · Procedural Framework & Parties (PE24.014624-SBA)",
    },
    status: "verified",
    summary: {
      uk: "Ідентифікація потерпілого Арсена Коваленка (повнолітній, 26 років) та фіксація щита Адріано Міллі (ст. 933 CC).",
      fr: "Identification d'Arsen Kovalenko (majeur, 26 ans) et sanctuarisation du bouclier Adriano Milli (Art. 933 CC).",
      en: "Identification of Arsen Kovalenko (adult, 26 yo) and confirmation of Adriano Milli's shield (Art. 933 CC).",
    },
    outdated_claim: {
      uk: "Попередня чернетка містила помилкове припущення про неповнолітній вік чи ст. 219 КК, що підлягає безумовному вилученню.",
      fr: "L'ancienne mention faisait état d'une qualification erronée de minorité ou de l'Art. 219 CP, à purger immédiatement.",
      en: "Former draft erroneously referenced minor standing or Art. 219 CP, which is completely refuted and purged.",
    },
    lawyer_draft: {
      uk: "Арсен Коваленко, громадянин України, народився 05.11.1999 (26 років), володіє повною цивільною дієздатністю та є потерпілим (ст. 115 КПК) і цивільним позивачем (ст. 118 КПК). Адріано Міллі є добросовісною третьою стороною за ст. 933 ЦК.",
      fr: "Arsen Kovalenko, né le 05.11.1999 (26 ans), est une victime majeure et capable de discernement (Art. 115, 118, 122 CPP). Adriano Milli est un tiers de bonne foi absolu (Art. 933 CC, Art. 105 al. 2 CPP) bénéficiant d'une immunité totale.",
      en: "Arsen Kovalenko, born 05.11.1999 (26 years old), is a fully capable adult victim (Art. 115 CPP) and private plaintiff (Art. 118 CPP). Adriano Milli is a protected bona fide third party under Art. 933 CC.",
    },
    impacted_articles: ["Art. 115 CPP", "Art. 118 CPP", "Art. 933 CC"],
    supporting_pieces: ["P-13"],
  },
  {
    id: "CH-02",
    number: "02",
    title: {
      uk: "Розділ 02 · Презумпція добросовісності третьої особи (Інваріант L-03)",
      fr: "Chapitre 02 · Présomption de bonne foi d'Adriano Milli (Invariant L-03)",
      en: "Chapter 02 · Bona Fide Presumption of Adriano Milli (Invariant L-03)",
    },
    status: "verified",
    summary: {
      uk: "Застосування ст. 933 CC та ст. 105 ч. 2 КПК: виключення будь-яких обвинувачень проти Адріано Міллі.",
      fr: "Application de l'Art. 933 CC et Art. 105 al. 2 CPP : exclusion totale de toute poursuite contre Adriano Milli.",
      en: "Application of Art. 933 CC & Art. 105 para 2 CPC: absolute exclusion of adverse charges against Adriano Milli.",
    },
    outdated_claim: {
      uk: "Спроби захисту штучно втягнути волонтера та перекладача до кола підозрюваних.",
      fr: "Tentatives de la défense d'impliquer abusivement le bénévole traducteur dans le cercle des prévenus.",
      en: "Adverse attempts to wrongfully drag the volunteer translator into accused circle.",
    },
    lawyer_draft: {
      uk: "Адріано Міллі діяв виключно в межах гуманітарного сприяння, добросовісно та без вигоди (Art. 933 CC). Будь-які претензії до нього визнаються нікчемними ex officio.",
      fr: "Adriano Milli a agi dans le cadre d'un engagement purement bénévole et humanitaire (Art. 933 CC). Toute allégation dirigée contre lui est rejetée d'office.",
      en: "Adriano Milli acted exclusively within bona fide humanitarian and translation scope (Art. 933 CC). All claims against him are dismissed ex officio.",
    },
    impacted_articles: ["Art. 933 CC", "Art. 105 al. 2 CPP", "Art. 141 CPP"],
    supporting_pieces: ["P-13"],
  },
  {
    id: "CH-04",
    number: "04",
    title: {
      uk: "Розділ 04 · Тяжкі погрози розправою (ст. 180 al. 1 CP) та ATF 146 IV 9",
      fr: "Chapitre 04 · Menaces de mort caractérisées (Art. 180 al. 1 CP) & ATF 146 IV 9",
      en: "Chapter 04 · Aggravated Threats (Art. 180 para 1 CP) & ATF 146 IV 9",
    },
    status: "verified",
    summary: {
      uk: "Аналіз записів P-01 та P-02, які підтверджують прямі вербальні погрози вбивством і розправою.",
      fr: "Analyse des enregistrements P-01 et P-02 démontrant les menaces directes de violences graves.",
      en: "Forensic analysis of P-01 and P-02 recordings proving explicit death and violence threats.",
    },
    outdated_claim: {
      uk: "Твердження підозрюваної про побутову сварку без конкретних погроз.",
      fr: "Thèse adverse minimisant les propos en simple différend de cohabitation.",
      en: "Adverse claims minimizing dialogue into ordinary household dispute.",
    },
    lawyer_draft: {
      uk: "Фоноскопічні файли P-01 та P-02 містять чіткі висловлювання підозрюваної «Je vais t'abattre et te briser les os», що за критеріями ATF 146 IV 9 становить закінчений склад ст. 180 ч. 1 КК.",
      fr: "Les pièces audio P-01 et P-02 contiennent les déclarations formelles « Je vais t'abattre et te briser les os », qualifiant pleinement l'infraction de l'Art. 180 al. 1 CP selon la jurisprudence ATF 146 IV 9.",
      en: "Audio exhibits P-01 and P-02 establish unambiguous statements « Je vais t'abattre et te briser les os », fulfilling Art. 180 para 1 CP under ATF 146 IV 9.",
    },
    impacted_articles: ["Art. 180 al. 1 CP", "ATF 146 IV 9"],
    supporting_pieces: ["P-01", "P-02"],
  },
  {
    id: "CH-07",
    number: "07",
    title: {
      uk: "Розділ 07 · Шахрайство та привласнення $15'000 USD (ст. 146 & 138 CP)",
      fr: "Chapitre 07 · Escroquerie & Détournement de $15'000 USD (Art. 146 & 138 CP)",
      en: "Chapter 07 · Fraud & Misappropriation of $15,000 USD (Art. 146 & 138 CP)",
    },
    status: "verified",
    summary: {
      uk: "Банківські виписки Wise (P-05) та аудіо зізнання P-04 доводять привласнення $15'000 USD.",
      fr: "Preuves bancaires Wise (P-05) et aveu P-04 établissant la captation illicite de $15'000 USD.",
      en: "Wise banking proofs (P-05) and confession P-04 establishing unlawful capture of $15,000 USD.",
    },
    outdated_claim: {
      uk: "Заява обвинуваченої про нібито добровільний безповоротний подарунок коштів.",
      fr: "Allégation infondée de donation sans contrepartie avancée par la prévenue.",
      en: "Unsubstantiated adverse defense claiming an irrevocable gift.",
    },
    lawyer_draft: {
      uk: "Матеріалами банківського переказу P-05 і прямим зізнанням P-04 доведено, що кошти $15'000 USD передавалися на збереження у довірчу власність. Їх утримання є злочином за ст. 146 та 138 КК.",
      fr: "La pièce bancaire P-05 et l'aveu audio P-04 démontrent que les $15'000 USD ont été confiés à titre fiduciaire. Leur dissipation constitue une escroquerie au sens de l'Art. 146 CP et un abus de confiance (Art. 138 CP).",
      en: "Banking records P-05 and confession P-04 prove $15,000 USD was transferred for fiduciary custody. Dissipating these funds constitutes fraud (Art. 146 CP) and embezzlement (Art. 138 CP).",
    },
    impacted_articles: ["Art. 146 CP", "Art. 138 CP"],
    supporting_pieces: ["P-04", "P-05", "P-14"],
  },
  {
    id: "CH-09",
    number: "09",
    title: {
      uk: "Розділ 09 · Об'єктивне алібі в Лозанні (EXIF 1481) проти наклепу (ст. 303 CP)",
      fr: "Chapitre 09 · Alibi objectif à Lausanne (EXIF 1481) contre la calomnie (Art. 303 CP)",
      en: "Chapter 09 · Lausanne Objective Alibi (EXIF 1481) vs Defamation (Art. 303 CP)",
    },
    status: "verified",
    summary: {
      uk: "Знімок EXIF 1481 о 13:45:12 у Лозанні та зізнання P-07 спростовують вигаданий напад у Рене.",
      fr: "Cliché EXIF 1481 du 21.07.2024 à Lausanne et aveu P-07 anéantissant l'agression fabriquée à Renens.",
      en: "Photo EXIF 1481 at 13:45:12 in Lausanne and confession P-07 destroying fabricated Renens assault.",
    },
    outdated_claim: {
      uk: "Заява до поліції про нібито нанесення тілесних ушкоджень потерпілим у Рене 20.07.2024.",
      fr: "Dénonciation à la police prétendant une agression corporelle commise par le plaignant à Renens.",
      en: "Police deposition alleging physical assault committed by complainant in Renens.",
    },
    lawyer_draft: {
      uk: "Фото P-06 з метаданими EXIF (Лозанна, 46.5197° N, 6.6323° E, 13:45:12) та спектральна експертиза P-15 доводять повну відсутність ушкоджень. Запис P-07 містить визнання в самостійному роздиранні шкіри нігтями, що встановлює склад ст. 303 КК.",
      fr: "Le cliché P-06 certifié EXIF (Lausanne, GPS 46.5197° N, 6.6323° E) et l'expertise P-15 attestent de l'intégrité corporelle. L'enregistrement P-07 contient l'aveu de l'auto-mutilation, matérialisant l'Art. 303 CP.",
      en: "Exhibit P-06 certified EXIF (Lausanne, GPS 46.5197° N, 6.6323° E) and audit P-15 certify uninjured status. Audio P-07 confirms self-scratches, fulfilling Art. 303 CP.",
    },
    impacted_articles: ["Art. 303 al. 1 CP", "Art. 139 CPP", "ISO/IEC 27037"],
    supporting_pieces: ["P-06", "P-07", "P-12", "P-15"],
  },
  {
    id: "CH-14",
    number: "14",
    title: {
      uk: "Розділ 14 · Забезпечення цивільного позову та арешт рахунків (ст. 263 КПК)",
      fr: "Chapitre 14 · Séquestre conservatoire des avoirs de CHF 46'850.00 (Art. 263 CPP)",
      en: "Chapter 14 · Conservative Sequestration of CHF 46,850.00 (Art. 263 CPC)",
    },
    status: "verified",
    summary: {
      uk: "Розрахунок суми арешту: $15'000 USD (CHF 13'500.-) + CHF 850.- збитки + CHF 32'500.- моральна шкода та судові витрати = CHF 46'850.00.",
      fr: "Calcul du séquestre : $15'000 USD (CHF 13'500.-) + CHF 850.- de serrure + CHF 32'500.- tort moral et dépens = CHF 46'850.00.",
      en: "Sequestration calculation: $15,000 USD (CHF 13,500.-) + CHF 850.- damages + CHF 32,500.- moral injury & costs = CHF 46,850.00.",
    },
    outdated_claim: {
      uk: "Відсутність формальної вимоги про арешт рахунків у первинних матеріалах.",
      fr: "Absence de conclusions chiffrées de saisie conservatoire dans les premières écritures.",
      en: "Absence of structured conservative sequestration petitions in initial papers.",
    },
    lawyer_draft: {
      uk: "Клопотати перед прокурором про накладення арешту в порядку ст. 263 ч. 1 літ. b та c КПК на всі банківські рахунки Любові Суворової та Ганни Суворової у межах суми CHF 46'850.00 для забезпечення реституції та відшкодування шкоди.",
      fr: "Ordonner le séquestre conservatoire immédiat (Art. 263 al. 1 let. b et c CPP) des comptes bancaires des prévenues à concurrence de CHF 46'850.00 à titre de sûreté pour la restitution et la réparation civile.",
      en: "Order immediate conservative freeze (Art. 263 para 1 lit. b & c CPC) on suspects' bank accounts up to CHF 46,850.00 to secure restitution and civil reparation.",
    },
    impacted_articles: ["Art. 263 CPP", "Art. 122 CPP", "Art. 41 CO"],
    supporting_pieces: ["P-05", "P-10"],
  },
  {
    id: "CH-18",
    number: "18",
    title: {
      uk: "Розділ 18 · Резюме досьє та експорт для Kindle & Utopia DB",
      fr: "Chapitre 18 · Synthèse finale & Exportation EPUB 3.0 / WORM Ledger",
      en: "Chapter 18 · Final Dossier Synthesis & EPUB 3.0 / WORM Ledger Export",
    },
    status: "verified",
    summary: {
      uk: "Повна синхронізація 18 розділів досьє з криптографічним леджером WORM та бездротова відправка на tukroschu@kindle.com.",
      fr: "Consolidation des 18 chapitres avec scellement cryptographique WORM et envoi sans fil à tukroschu@kindle.com.",
      en: "Consolidation of all 18 chapters with WORM cryptographic seal and wireless dispatch to tukroschu@kindle.com.",
    },
    outdated_claim: {
      uk: "Незведена та фрагментована структура матеріалів справи без наскрізного контролю версій.",
      fr: "Dossier fragmenté dépourvu de traçabilité bitemporelle et d'export certifié.",
      en: "Fragmented case dossier lacking bitemporal traceability and certified export.",
    },
    lawyer_draft: {
      uk: "Сформовано єдиний верифікований електронний судовий бандл EPUB 3.0, кожне твердження якого підкріплене хешем SHA-256 та зафіксоване в WORM Utopia DB.",
      fr: "Bundle d'audience électronique EPUB 3.0 consolidé, chaque fait étant scellé par un hachage SHA-256 et inscrit dans le registre immuable WORM Utopia DB.",
      en: "Consolidated electronic hearing bundle EPUB 3.0, with each factual claim sealed by SHA-256 hash and registered in immutable WORM Utopia DB.",
    },
    impacted_articles: ["Art. 100 CPP", "ADR-009", "ISO/IEC 27037"],
    supporting_pieces: ["P-01", "P-06", "P-15"],
  },
];

// -------------------------------------------------------------------------
// 5. POINTS DE CONFRONTATION & AUDIENCES CONTRADICTOIRES
// -------------------------------------------------------------------------
export const CONFRONTATIONS: ConfrontationItem[] = [
  {
    id: "CONF-01",
    theme: {
      uk: "Вигадані побої 20.07.2024 проти об'єктивного фото EXIF 1481 у Лозанні",
      fr: "Agression alléguée du 20.07.2024 réfutée par le cliché EXIF 1481 à Lausanne",
      en: "Alleged Assault of 20.07.2024 vs Objective EXIF 1481 Photo in Lausanne",
    },
    prevenue_allegation: {
      uk: "« Арсен побив мене в квартирі в Рене, в мене були численні гематоми та синці на обох ліктях. »",
      fr: "« Arsen m'a agressée physiquement à Renens, causant des ecchymoses bilatérales massives. »",
      en: "« Arsen physically assaulted me in Renens, causing severe bruises on both my arms. »",
    },
    corroborated_reality: {
      uk: "Знімок EXIF 1481 о 13:45:12 у центрі Лозанни фіксує повністю неушкоджені передпліччя, а аудіо 12 фіксує зізнання у самопошкодженні.",
      fr: "Le cliché EXIF 1481 pris à 13:45:12 à Lausanne démontre des bras parfaitement indemnes, corroboré par l'aveu d'auto-mutilation dans l'audio 12.",
      en: "EXIF photo 1481 at 13:45:12 in central Lausanne shows completely intact arms, confirmed by self-scratching confession in audio 12.",
    },
    inconsistency_point: {
      uk: "Фізична та оптична неможливість появи гематом після фіксації чистої шкіри за 17 годин після дати вигаданого інциденту.",
      fr: "Impossibilité médico-légale absolue d'apparition d'ecchymoses après constatation d'une peau saine 17h après l'agression prétendue.",
      en: "Forensic impossibility of massive bruises appearing after pristine skin was photographed 17h post alleged event.",
    },
    exhibits: ["P-06", "P-07", "P-15"],
    certified_timestamp: "21.07.2024 13:45:12 CEST",
    investigation_questions: {
      uk: [
        "Як ви поясните наявність сертифікованого знімка P-06 о 13:45:12 у Лозанні, де ваші руки чисті?",
        "Чи підтверджуєте ви ваш голос на аудіозаписі P-07, де ви кажете: «Я сама собі роздерла нігтями»?",
        "Чому ваші перші заяви до поліції не містять згадки про цей аудіозапис?",
      ],
      fr: [
        "Comment expliquez-vous le cliché P-06 à 13:45:12 à Lausanne démontrant l'absence de toute trace physique ?",
        "Reconnaissez-vous votre voix sur l'enregistrement P-07 affirmant vous être écorchée vous-même avec vos ongles ?",
        "Pourquoi n'avoir pas mentionné ces faits lors de votre audition initiale devant l'inspecteur ?",
      ],
      en: [
        "How do you account for exhibit P-06 taken at 13:45:12 in Lausanne showing completely intact arms?",
        "Do you acknowledge your voice on recording P-07 stating: 'I scratched myself with my nails'?",
        "Why was this crucial confession concealed from your initial police report?",
      ],
    },
    tactical_defense: {
      uk: "Послідовно пред'явити роздруківку спектрального аналізу P-15, після чого ввімкнути таймкод 00:06 аудіо P-07.",
      fr: "Présenter le rapport spectral P-15 avant de diffuser le passage audio P-07 à 00:06 pour bloquer toute dénégation.",
      en: "Confront with P-15 spectral report before playing audio P-07 timecode 00:06 to prevent denial.",
    },
  },
  {
    id: "CONF-02",
    theme: {
      uk: "Привласнення $15'000 USD проти вигаданого 'подарунка'",
      fr: "Appropriation des $15'000 USD contre la thèse du prétendu don",
      en: "Misappropriation of $15,000 USD vs Fabricated Gift Defense",
    },
    prevenue_allegation: {
      uk: "« Ці гроші були подарунком родині і мені особисто, ніхто не вимагав повернення. »",
      fr: "« Cet argent constituait un don d'usage irrévocable, sans obligation de restitution. »",
      en: "« This money was an unconditional gift to the family without repayment terms. »",
    },
    corroborated_reality: {
      uk: "Банківський переказ P-05 з фідуціарним призначенням та аудіо P-04 зі словами «гроші вже переписані, ти їх більше не побачиш».",
      fr: "Bordereau bancaire P-05 stipulant la garde fiduciaire et enregistrement P-04 avouant la dissipation illicite.",
      en: "Bank slip P-05 stating fiduciary deposit and audio P-04 explicitly admitting refusal to return.",
    },
    inconsistency_point: {
      uk: "Суперечність між версією про подарунок та поданою нею ж декларацією в EVAM про відсутність коштів.",
      fr: "Contradiction frontale entre l'allégation de don et sa déclaration concomitante d'indigence auprès de l'EVAM.",
      en: "Blatant contradiction between gift claim and her simultaneous EVAM indigence declaration.",
    },
    exhibits: ["P-04", "P-05", "P-10"],
    certified_timestamp: "02.04.2024 & 18.06.2024",
    investigation_questions: {
      uk: [
        "Якщо це був подарунок, чому ви приховали його в офіційній декларації доходів EVAM?",
        "Чому на аудіозаписі P-04 ви заявляєте, що гроші витрачені на власні потреби всупереч волі власника?",
      ],
      fr: [
        "Si ces fonds vous appartenaient, pourquoi les avoir dissimulés à l'EVAM lors de votre demande d'aide sociale ?",
        "Pourquoi admettre sur l'enregistrement P-04 avoir disposé des fonds au mépris des instructions de conservation ?",
      ],
      en: [
        "If these funds were a gift, why conceal them from EVAM when requesting public assistance?",
        "Why confess on audio P-04 that you converted the money against the depositor's will?",
      ],
    },
    tactical_defense: {
      uk: "Вказати на ризик кримінальної відповідальності за ст. 118 LEI (шахрайство із соцдопомогою) при спробі наполягати на отриманні цих коштів.",
      fr: "Mettre en exergue l'infraction à l'Art. 118 LEI en cas de maintien de la thèse de l'enrichissement personnel.",
      en: "Highlight statutory exposure under Art. 118 LEI if she insists on personal ownership of funds.",
    },
  },
];

// -------------------------------------------------------------------------
// 6. RÉQUISITIONS JUDICIAIRES (ART. 263, 318, 393 CPP)
// -------------------------------------------------------------------------
export const LEGAL_REQUISITIONS: LegalRequisition[] = [
  {
    id: "REQ-SEQUESTRE-263",
    title: {
      uk: "Клопотання про накладення арешту на банківські рахунки (CHF 46'850.00)",
      fr: "Requête urgente de séquestre conservatoire sur avoirs bancaires (CHF 46'850.00)",
      en: "Urgent Petition for Bank Asset Sequestration (CHF 46,850.00)",
    },
    norme: "Art. 263 al. 1 let. b et c CPP",
    autorite: "Ministère public du Canton de Vaud",
    urgence: "URGENT",
    conclusions_formelles: {
      uk: [
        "Накласти негайний арешт на всі банківські рахунки Любові Суворової та Ганни Суворової у межах суми CHF 46'850.00.",
        "Зобов'язати всі банки Швейцарії (зокрема UBS, BCV, PostFinance) надати виписки про залишки коштів.",
        "Забезпечити пріоритетне задоволення цивільного позову Арсена Коваленка щодо повернення $15'000 USD та збитків.",
      ],
      fr: [
        "Ordonner le séquestre conservatoire immédiat de tous comptes bancaires ouverts au nom de Liubov Suvorova et Hanna Suvorova à concurrence de CHF 46'850.00.",
        "Faire injonction aux établissements bancaires concernés de bloquer tout virement sortant.",
        "Consigner les montants saisis à la Caisse des dépôts de l'Ordre judiciaire vaudois en garantie des droits de la victime Arsen Kovalenko.",
      ],
      en: [
        "Order immediate conservative freeze on all bank accounts in the name of Liubov Suvorova and Hanna Suvorova up to CHF 46,850.00.",
        "Direct all banking institutions to halt any debit transactions.",
        "Deposit sequestered funds with Vaud Judicial Escrow for restitution to victim Arsen Kovalenko.",
      ],
    },
    corps_texte: {
      uk: "Арсен Коваленко, як потерпілий та цивільний позивач, обґрунтовує реальну загрозу безповоротного виведення коштів. Сума вимог становить $15'000 USD капіталу (CHF 13'500.-), CHF 850.00 прямих матеріальних збитків за зламаний замок та CHF 32'500.00 компенсації моральної шкоди за ст. 49 CO (Швейцарське зобов'язальне право) і судових витрат. Загальна сума арешту: CHF 46'850.00.",
      fr: "Arsen Kovalenko, partie plaignante et demandeur civil constitué, établit un risque imminent de distraction d'actifs. La créance garantie comprend $15'000 USD (CHF 13'500.-), CHF 850.00 de dommage matériel immédiat (serrure fracturée) et CHF 32'500.00 de réparation du tort moral (Art. 49 CO) et dépens. Montant total sous séquestre : CHF 46'850.00.",
      en: "Arsen Kovalenko, private complainant and civil claimant, establishes an imminent danger of asset dissipation. The secured claim covers $15,000 USD (CHF 13,500.-), CHF 850.00 direct lock damage, and CHF 32,500.00 moral injury compensation (Art. 49 CO) and legal costs. Total sequestration amount: CHF 46,850.00.",
    },
  },
  {
    id: "REQ-INSTRUCTION-318",
    title: {
      uk: "Клопотання про проведення додаткових слідчих дій (ст. 318 КПК)",
      fr: "Requête de mesures d'instruction complémentaires (Art. 318 CPP)",
      en: "Petition for Supplementary Investigatory Measures (Art. 318 CPC)",
    },
    norme: "Art. 318 al. 1 CPP",
    autorite: "Ministère public du Canton de Vaud",
    urgence: "ORDINAIRE",
    conclusions_formelles: {
      uk: [
        "Долучити до справи висновок форензік-експертизи P-15 щодо спектрального аналізу фото 1481.",
        "Провести очну ставку між потерпілим Арсеном Коваленком та обвинуваченою Любов'ю Суворовою з дослідженням аудіо P-07.",
        "Витребувати з міграційної служби SPOP та EVAM матеріали щодо декларування доходів підозрюваною.",
      ],
      fr: [
        "Verser formellement au dossier pénal le rapport d'expertise technique P-15 sur l'alibi EXIF 1481.",
        "Convoquer une audience de confrontation contradictoire entre la victime Arsen Kovalenko et la prévenue Liubov Suvorova.",
        "Requérir la production des déclarations d'indigence déposées par la suspecte auprès du SPOP et de l'EVAM.",
      ],
      en: [
        "Formally admit technical expert audit report P-15 on Lausanne EXIF 1481 alibi into proceedings.",
        "Summon an adversarial confrontation hearing between victim Arsen Kovalenko and accused Liubov Suvorova.",
        "Subpoena social assistance and residence declaration records from SPOP and EVAM.",
      ],
    },
    corps_texte: {
      uk: "До завершення слідства (ст. 318 КПК) сторона потерпілого має невід'ємне право вимагати перевірки об'єктивного алібі та викриття неправдивого доносу за ст. 303 КК. Проведення зазначених дій усуне будь-які сумніви щодо фальсифікації доказів підозрюваною.",
      fr: "Avant toute clôture d'instruction (Art. 318 CPP), la partie plaignante requiert l'administration définitive des preuves de l'alibi objectif et la mise en évidence formelle de la dénonciation calomnieuse (Art. 303 CP).",
      en: "Prior to closure of investigation (Art. 318 CPC), the complainant exercises his statutory right to complete evidence regarding the objective alibi and expose the malicious false accusation under Art. 303 CP.",
    },
  },
  {
    id: "REQ-RECOURS-393",
    title: {
      uk: "Скарга на процесуальні постанови прокурора (Строк 10 днів, ст. 393 КПК)",
      fr: "Recours pénal devant la Chambre des recours pénale (Délai 10 jours, Art. 393 CPP)",
      en: "Criminal Appeal to the Criminal Appeals Chamber (10-Day Strict Deadline, Art. 393 CPC)",
    },
    norme: "Art. 393 cum 396 CPP",
    autorite: "Chambre des recours pénale du Tribunal cantonal vaudois",
    urgence: "URGENT",
    conclusions_formelles: {
      uk: [
        "Скасувати оскаржувану постанову прокурора як таку, що порушує ст. 115, 118 КПК та принцип всебічності розслідування.",
        "Зобов'язати прокуратуру відкрити кримінальне переслідування за ст. 303 КК (завідомо неправдивий донос).",
        "Присудити судові витрати за рахунок держави кантону Во.",
      ],
      fr: [
        "Admettre le recours et annuler l'ordonnance attaquée pour violation des Art. 115 et 118 CPP.",
        "Ordonner au Ministère public d'étendre la prévention à l'infraction de dénonciation calomnieuse (Art. 303 CP).",
        "Mettre les dépens et frais de justice à la charge de l'État de Vaud.",
      ],
      en: [
        "Admit the appeal and quash the contested decree for breach of Art. 115 and 118 CPC.",
        "Instruct the public prosecutor to expand charges to malicious false accusation (Art. 303 CP).",
        "Award procedural costs against the State of Vaud.",
      ],
    },
    corps_texte: {
      uk: "Згідно зі ст. 396 ч. 1 КПК, скарга подається протягом 10 днів з моменту отримання повідомлення про постанову. Необхідно суворо контролювати зворотний відлік для гарантування прав потерпілого.",
      fr: "Conformément à l'Art. 396 al. 1 CPP, le recours doit être déposé par écrit et motivé dans un délai strict de 10 jours. Le respect de ce délai de rigueur est impératif.",
      en: "Under Art. 396 para 1 CPC, the appeal must be lodged within a strict 10-day deadline. Strict adherence to this time window is of absolute procedural essence.",
    },
  },
  {
    id: "REQ-CIVIL-REVENDICATION-641",
    title: {
      uk: "Цивільний позов про витребування майна / віндикація (ст. 641 ч. 2 CC & ст. 219 ЦПК)",
      fr: "Action en revendication de propriété mobilière (Art. 641 al. 2 CC & Art. 219 CPC)",
      en: "Action in Property Restitution & Replevin (Art. 641 para 2 CC & Art. 219 CPC)",
    },
    norme: "Art. 641 al. 2 CC cum Art. 219 CPC",
    autorite: "Tribunal civil d'arrondissement (Lausanne)",
    urgence: "ORDINAIRE",
    category: "civil",
    conclusions_formelles: {
      uk: [
        "Зобов'язати відповідачку негайно повернути законному власнику кошти в розмірі $15'000 USD (еквівалент CHF 13'500.00).",
        "Визнати безпідставним будь-яке утримання коштів та нарахувати 5% річних за ст. 104 CO з дня виникнення прострочення.",
        "Покласти судові витрати та витрати на правову допомогу на відповідачку.",
      ],
      fr: [
        "Condamner la défenderesse à restituer immédiatement au demandeur la somme de $15'000 USD (contre-valeur CHF 13'500.00) avec intérêts moratoires à 5% l'an dès le 18.06.2024.",
        "Constater l'absence totale de titre juridique justifiant la rétention des fonds par la défenderesse.",
        "Mettre les frais judiciaires et une équitable indemnité de dépens à la charge exclusive de la partie défenderesse.",
      ],
      en: [
        "Order defendant to immediately restore the sum of $15,000 USD (CHF 13,500.00) with statutory 5% interest.",
        "Find absence of lawful title justifying detention of the funds.",
        "Award procedural costs and legal fees against defendant.",
      ],
    },
    corps_texte: {
      uk: "За ст. 641 ч. 2 Швейцарського цивільного кодексу (CC), власник речі має право вимагати її повернення від кожного, хто утримує її без законних підстав. Переказ $15'000 USD (доказ P-05) мав суто фідуціарний характер для збереження активів. Відмова повернути гроші є прямим порушенням права власності.",
      fr: "En vertu de l'Art. 641 al. 2 CC, le propriétaire d'une chose peut la revendiquer contre quiconque la détient sans droit. Le virement bancaire formel de $15'000 USD (pièce P-05) a été confié à titre fiduciaire pour conservation. Le refus de restitution caractérise une dépossession illicite.",
      en: "Under Art. 641 para 2 CC, the owner of a thing may reclaim it from whoever detains it without legal entitlement. The $15,000 USD wire transfer (exhibit P-05) was a fiduciary holding. Refusal to return violates proprietary title.",
    },
  },
  {
    id: "REQ-CIVIL-MESURES-261",
    title: {
      uk: "Заява про вжиття забезпечувальних заходів у цивільному процесі (ст. 261 ЦПК)",
      fr: "Requête de mesures provisionnelles et superprovisionnelles (Art. 261 CPC)",
      en: "Motion for Civil Provisional & Urgent Injunctive Measures (Art. 261 CPC)",
    },
    norme: "Art. 261 cum 265 CPC",
    autorite: "Président du Tribunal civil d'arrondissement (Lausanne)",
    urgence: "URGENT",
    category: "civil",
    conclusions_formelles: {
      uk: [
        "Inaudita altera parte (без виклику іншої сторони): накласти попередню заборону на розпорядження рахунками на суму CHF 46'850.00.",
        "Заборонити відчуження, переказ або зняття коштів до набрання законної сили рішенням по суті позову.",
        "Встановити відповідачці строк у 10 днів для надання письмових заперечень.",
      ],
      fr: [
        "Ordonner, à titre superprovisionnel et inaudita altera parte, le blocage conservatoire immédiat des comptes de la défenderesse jusqu'à concurrence de CHF 46'850.00.",
        "Faire interdiction formelle aux tiers détenteurs de se dessaisir des avoirs.",
        "Fixer à la défenderesse un bref délai pour déposer ses éventuelles déterminations.",
      ],
      en: [
        "Order ex parte (inaudita altera parte) immediate provisional freeze of defendant's accounts up to CHF 46,850.00.",
        "Prohibit third-party banks from dispersing assets.",
        "Grant defendant a 10-day window for response.",
      ],
    },
    corps_texte: {
      uk: "За ст. 261 ЦПК суд постановляє забезпечувальні заходи, якщо заявник доведе наявність реального порушення його прав або загрозу такого порушення, що може спричинити важковиправні збитки. З огляду на погрози розправою та заяви підозрюваної про намір приховати гроші (доказ P-04), ризик втрати активів є невідкладним.",
      fr: "L'Art. 261 CPC dispose que le juge ordonne les mesures provisionnelles nécessaires lorsque le requérant rend vraisemblable qu'une prétention dont il est titulaire est l'objet d'une atteinte ou menace d'atteinte susceptible de lui causer un préjudice difficilement réparable.",
      en: "Under Art. 261 CPC, injunctive relief is granted where an applicant credibly demonstrates an infringement or threat thereof that threatens not easily repairable harm.",
    },
  },
  {
    id: "REQ-CIVIL-DOMMAGES-41",
    title: {
      uk: "Позов про стягнення збитків та моральної шкоди за деліктом (ст. 41 & 49 CO)",
      fr: "Action en dommages-intérêts pour acte illicite et tort moral (Art. 41 & 49 CO)",
      en: "Tort Action for Damages and Moral Injury (Art. 41 & 49 CO)",
    },
    norme: "Art. 41 cum 49 CO",
    autorite: "Tribunal civil d'arrondissement (Lausanne)",
    urgence: "ORDINAIRE",
    category: "civil",
    conclusions_formelles: {
      uk: [
        "Стягнути з відповідачки на користь позивача CHF 850.00 компенсації прямих матеріальних збитків (пошкодження майна P-10).",
        "Стягнути з відповідачки CHF 32'500.00 компенсації моральної шкоди за ст. 49 CO за психологічний терор та неправдивий донос.",
        "Нарахувати законні 5% річних з моменту вчинення правопорушення.",
      ],
      fr: [
        "Condamner la défenderesse au paiement de CHF 850.00 à titre de réparation du dommage matériel causé (P-10).",
        "Condamner la défenderesse au versement de CHF 32'500.00 à titre d'indemnité pour tort moral (Art. 49 CO) en raison du harcèlement et de la dénonciation calomnieuse.",
        "Mettre les intérêts moratoires à 5% à compter du jour du fait dommageable.",
      ],
      en: [
        "Award plaintiff CHF 850.00 in direct material damages (broken lock P-10).",
        "Award plaintiff CHF 32,500.00 in moral compensation (Art. 49 CO) for psychological coercion and malicious accusations.",
        "Award statutory 5% interest from the date of the tortious act.",
      ],
    },
    corps_texte: {
      uk: "За ст. 41 CO особа, яка протиправно завдає шкоди іншій особі, зобов'язана її відшкодувати. Ст. 49 CO встановлює право на грошове відшкодування моральної шкоди при протиправному посяганні на особистість (погрози вбивством, наклепи перед поліцією, фабрикація доказів).",
      fr: "Selon l'Art. 41 CO, celui qui cause, d'une manière illicite, un dommage à autrui, est tenu de le réparer. L'Art. 49 CO confère au lésé le droit à une indemnité à titre de réparation morale en cas d'atteinte grave portée à sa personnalité.",
      en: "Under Art. 41 CO, anyone who unlawfully causes damage to another must repair it. Art. 49 CO provides monetary satisfaction for serious infringement of personality rights.",
    },
  },
  {
    id: "REQ-CIVIL-PREUVE-158",
    title: {
      uk: "Превентивне забезпечення доказів у цивільному процесі (ст. 158 ЦПК)",
      fr: "Requête en administration de preuves à titre préventif (Art. 158 CPC)",
      en: "Pre-Trial Evidence Preservation Motion (Art. 158 CPC)",
    },
    norme: "Art. 158 CPC",
    autorite: "Juge de paix / Tribunal civil d'arrondissement (Lausanne)",
    urgence: "URGENT",
    category: "civil",
    conclusions_formelles: {
      uk: [
        "Призначити судову експертизу для зняття та збереження цифрових копій серверних логів Telegram та виписок банку.",
        "Зобов'язати мобільних операторів зберегти дані геолокації та базових станцій за липень 2024 року.",
        "Встановити результати огляду замка квартири (доказ P-10) судовим приставом (huissier judiciaire).",
      ],
      fr: [
        "Ordonner l'expertise informatique et la conservation judiciaire immédiate des métadonnées numériques et extraits bancaires.",
        "Faire injonction aux opérateurs de télécommunication de préserver les données de géolocalisation de juillet 2024.",
        "Diligenter un constat d'huissier judiciaire sur l'état de la serrure fracturée (P-10).",
      ],
      en: [
        "Order forensic IT preservation of digital logs and bank statements.",
        "Direct telecom providers to retain cell tower localization data from July 2024.",
        "Commission an official judicial bailiff inspection of the damaged lock (P-10).",
      ],
    },
    corps_texte: {
      uk: "За ст. 158 ЦПК суд приймає докази в будь-який час, якщо заявник доведе наявність загрози їх втрати або наявність законного інтересу для з'ясування шансів у судовому спорі. Оскільки цифрові дані можуть бути стерті відповідачкою, превентивне забезпечення є необхідним.",
      fr: "L'Art. 158 al. 1 CPC prévoit que le tribunal administre les preuves en tout temps lorsque la loi en confère le droit ou lorsque le requérant rend vraisemblable que les preuves sont menacées ou qu'il a un intérêt digne de protection.",
      en: "Art. 158 para 1 CPC authorizes provisional gathering of evidence where evidence is endangered or an applicant demonstrates a protected legal interest.",
    },
  },
];
