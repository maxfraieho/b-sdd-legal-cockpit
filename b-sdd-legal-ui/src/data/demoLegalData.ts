// =========================================================================
// B-SDD LEGAL COCKPIT · SYNTHETIC DEMO BENCHMARK DATASET
// Compliant with ADR-001..024 & Invariants L-01 to L-05
// De-identified synthetic entities (PARTY-L03, PARTY-L04, etc.)
// =========================================================================

import {
  ActorItem,
  BordereauPiece,
  CriminalCharge,
  DossierChapter,
  ConfrontationItem,
  LegalRequisition,
} from './legalData';

export const DEMO_ACTORS: ActorItem[] = [
  {
    id: "PARTY-L04",
    name: "PARTY-L04 (Complainant / Victime)",
    age: 26,
    status: {
      uk: "Потерпілий & Цивільний позивач (Повнолітній)",
      fr: "Victime & Partie Plaignante (Majeur)",
      de: "Geschädigte Person & Privatklägerschaft (Volljährig)",
      it: "Persona lesa & Accusatore privato (Maggiorenne)",
      en: "Victim & Civil Plaintiff (Adult)",
    },
    badgeColor: "bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
    role: {
      uk: "Повнолітній дієздатний потерпілий. Пряма жертва шахрайства, погроз розправою та шантажу. Сторона цивільного позову (ст. 115, 118, 122 КПК).",
      fr: "Victime majeure et capable de discernement. Victime directe de l'escroquerie, menaces réitérées et contrainte. Demandeur civil constitué (Art. 115, 118, 122 CPP).",
      de: "Volljähriger urteilsfähiger Geschädigter. Direktes Opfer von Betrug, Drohungen und Nötigung (Art. 115, 118, 122 StPO).",
      it: "Persona lesa maggiorenne e capace di discernimento. Vittima diretta della truffa e minacce (Art. 115, 118, 122 CPP).",
      en: "Adult compos mentis victim. Direct victim of fraud, death threats, and coercion (Art. 115, 118, 122 CPC).",
    },
    protected_bona_fide: false,
    legal_reference: "Art. 115, 118, 122 CPP / Art. 41 CO / Invariant L-01",
    procedural_standing: "victime_plaignante",
    cpp_article: "Art. 115, 118, 122 CPP",
    discernment_capacity: true,
    nationality: {
      uk: "Тимчасовий захист (Статус S в Швейцарії)",
      fr: "Protection temporaire (Statut S en Suisse)",
      de: "Vorübergehender Schutz (Status S in der Schweiz)",
      it: "Protezione temporanea (Statuto S in Svizzera)",
      en: "Temporary Protection (Status S in Switzerland)",
    },
    domicile: {
      uk: "Кантон Во, Швейцарія",
      fr: "Canton de Vaud, Suisse",
      de: "Kanton Waadt, Schweiz",
      it: "Canton Vaud, Svizzera",
      en: "Canton of Vaud, Switzerland",
    },
    financial_claim_chf: 46850.0,
    risk_level: "high",
    droits_proceduraux: {
      uk: [
        "Повноправна участь у слідчих діях (ст. 147 КПК)",
        "Заява цивільного позову в кримінальному процесі (ст. 122 КПК)",
        "Право на безоплатну юридичну допомогу жертвам насильства (ст. 136 КПК)",
      ],
      fr: [
        "Participation contradictoire aux actes d'instruction (Art. 147 CPP)",
        "Conclusions civiles formelles d'adhésion au pénal (Art. 122 CPP)",
        "Assistance judiciaire gratuite LAVI (Art. 136 CPP)",
      ],
      de: [
        "Verfahrensrechte bei Untersuchungshandlungen (Art. 147 StPO)",
        "Adhäsionsklage im Strafverfahren (Art. 122 StPO)",
        "Unentgeltliche Rechtspflege (Art. 136 StPO)",
      ],
      it: [
        "Partecipazione agli atti d'indagine (Art. 147 CPP)",
        "Azione civile nel processo penale (Art. 122 CPP)",
        "Patrocinio gratuito (Art. 136 CPP)",
      ],
      en: [
        "Full adversarial participation rights (Art. 147 CPC)",
        "Civil party adhesion to criminal proceeding (Art. 122 CPC)",
        "Victim procedural and legal aid (Art. 136 CPC)",
      ],
    },
    linked_pieces: ["DEMO-P-01", "DEMO-P-02", "DEMO-P-03", "DEMO-P-05", "DEMO-P-06"],
  },
  {
    id: "PARTY-DEF-01",
    name: "PARTY-DEF-01 (Primary Accused / Prévenue)",
    age: 50,
    status: {
      uk: "Головна обвинувачена (Prévenue principale)",
      fr: "Prévenue principale (Auteur direct)",
      de: "Hauptbeschuldigte (Direkte Täterin)",
      it: "Imputata principale (Autrice diretta)",
      en: "Primary Accused (Direct Actor)",
    },
    badgeColor: "bg-red-950/80 text-red-300 border-red-700/60 shadow-[0_0_12px_rgba(239,68,68,0.2)]",
    role: {
      uk: "Головна підозрювана у вчиненні шахрайства (ст. 146 КК), погроз (ст. 180 КК), примусу (ст. 181 КК) та завідомо неправдивого доносу (ст. 303 КК).",
      fr: "Auteur principal des infractions d'escroquerie (Art. 146 CP), menaces (Art. 180 CP), contrainte (Art. 181 CP) et dénonciation calomnieuse (Art. 303 CP).",
      de: "Hauptbeschuldigte der Tatbestände Betrug (Art. 146 StGB), Drohung (Art. 180 StGB) und Nötigung (Art. 181 StGB).",
      it: "Imputata principale per truffa (Art. 146 CP), minacce (Art. 180 CP) e coazione (Art. 181 CP).",
      en: "Principal accused facing charges of fraud (Art. 146 CP), threats (Art. 180 CP), coercion (Art. 181 CP), and malicious accusation (Art. 303 CP).",
    },
    protected_bona_fide: false,
    legal_reference: "Art. 111, 157, 158 CPP / Art. 146, 180, 181, 303 CP",
    procedural_standing: "prevenu_principal",
    cpp_article: "Art. 111 CPP",
    discernment_capacity: true,
    nationality: {
      uk: "Резидент Кантону Во",
      fr: "Résidente Canton de Vaud",
      de: "Wohnhaft im Kanton Waadt",
      it: "Residente nel Canton Vaud",
      en: "Resident of Canton Vaud",
    },
    domicile: {
      uk: "Кантон Во, Швейцарія",
      fr: "Canton de Vaud, Suisse",
      de: "Kanton Waadt, Schweiz",
      it: "Canton Vaud, Svizzera",
      en: "Canton of Vaud, Switzerland",
    },
    financial_claim_chf: -46850.0,
    risk_level: "critical",
    droits_proceduraux: {
      uk: ["Право на захист та відмову від свідчень (ст. 158 КПК)", "Право на адвоката з першої години (ст. 159 КПК)"],
      fr: ["Droit de refuser de déposer (Art. 158 CPP)", "Droit à l'assistance d'un défenseur (Art. 159 CPP)"],
      de: ["Aussageverweigerungsrecht (Art. 158 StPO)", "Verteidigung der ersten Stunde (Art. 159 StPO)"],
      it: ["Diritto di non rispondere (Art. 158 CPP)", "Diritto al difensore della prima ora (Art. 159 CPP)"],
      en: ["Right to remain silent (Art. 158 CPC)", "Right to counsel of the first hour (Art. 159 CPC)"],
    },
    linked_pieces: ["DEMO-P-01", "DEMO-P-02", "DEMO-P-04", "DEMO-P-05", "DEMO-P-07"],
  },
  {
    id: "PARTY-L03",
    name: "PARTY-L03 (Administrator / Civil Plaintiff)",
    age: 52,
    status: {
      uk: "Цивільний позивач & Представник потерпілого",
      fr: "Demandeur Civil & Représentant",
      de: "Zivilkläger & Vertreter",
      it: "Attore civile & Rappresentante",
      en: "Civil Plaintiff & Legal Representative",
    },
    badgeColor: "bg-blue-950/80 text-blue-300 border-blue-700/60 shadow-[0_0_12px_rgba(59,130,246,0.2)]",
    role: {
      uk: "Законний представник та цивільний позивач. Забезпечення схоронності цифрових доказів (ISO/IEC 27037) та цивільного позову за ст. 122 КПК.",
      fr: "Demandeur civil constitué et représentant. Gestion de la chaîne de preuve numérique scellée (ISO/IEC 27037).",
      de: "Zivilkläger und Beweisführer der digitalen Beweiskette (ISO/IEC 27037).",
      it: "Attore civile e custode della catena di custodia digitale (ISO/IEC 27037).",
      en: "Constituted civil plaintiff and digital evidence custodian under ISO/IEC 27037 standards.",
    },
    protected_bona_fide: false,
    legal_reference: "Art. 118, 122 CPP / Art. 41 CO / Invariant L-02",
    procedural_standing: "victime_plaignante",
    cpp_article: "Art. 118 CPP",
    discernment_capacity: true,
    nationality: {
      uk: "Тимчасовий захист (Статус S в Швейцарії)",
      fr: "Protection temporaire (Statut S en Suisse)",
      de: "Vorübergehender Schutz (Status S in der Schweiz)",
      it: "Protezione temporanea (Statuto S in Svizzera)",
      en: "Temporary Protection (Status S in Switzerland)",
    },
    domicile: {
      uk: "Кантон Во, Швейцарія",
      fr: "Canton de Vaud, Suisse",
      de: "Kanton Waadt, Schweiz",
      it: "Canton Vaud, Svizzera",
      en: "Canton of Vaud, Switzerland",
    },
    financial_claim_chf: 13500.0,
    risk_level: "low",
    droits_proceduraux: {
      uk: ["Право на доступ до матеріалів справи (ст. 101, 107 КПК)", "Право на подання доказів (ст. 318 КПК)"],
      fr: ["Consultation du dossier (Art. 101, 107 CPP)", "Droit de réquisition de preuves (Art. 318 CPP)"],
      de: ["Akteneinsichtsrecht (Art. 101, 107 StPO)", "Beweisantragsrecht (Art. 318 StPO)"],
      it: ["Consultazione degli atti (Art. 101, 107 CPP)", "Diritto di proporre prove (Art. 318 CPP)"],
      en: ["Case record inspection right (Art. 101, 107 CPC)", "Right to request evidence intake (Art. 318 CPC)"],
    },
    linked_pieces: ["DEMO-P-01", "DEMO-P-02", "DEMO-P-08"],
  },
  {
    id: "PARTY-TIERS-01",
    name: "PARTY-TIERS-01 (Bona Fide Third Party)",
    age: 45,
    status: {
      uk: "Добросовісний третій набувач (Імунітет L-03)",
      fr: "Tiers acquéreur de bonne foi (Immunité L-03)",
      de: "Gutgläubiger Dritterwerber (Immunität L-03)",
      it: "Terzo acquirente in buona fede (Immunità L-03)",
      en: "Bona Fide Third Party (Sanctuary Shield L-03)",
    },
    badgeColor: "bg-teal-950/80 text-teal-300 border-teal-700/60 shadow-[0_0_12px_rgba(20,184,166,0.2)]",
    role: {
      uk: "Добросовісний набувач майна за ст. 933 Цивільного кодексу Швейцарії. Повний цивільний та кримінальний імунітет під захистом інваріанта L-03.",
      fr: "Acquéreur de bonne foi selon l'Art. 933 du Code Civil suisse. Immunité civile et pénale absolue garantie par l'Invariant L-03.",
      de: "Gutgläubiger Erwerber gemäss Art. 933 ZGB. Absolute Immunität unter Invariante L-03.",
      it: "Acquirente in buona fede ex Art. 933 CC svizzero. Immunità assoluta sotto Invariante L-03.",
      en: "Bona fide purchaser under Art. 933 Swiss Civil Code with absolute criminal and civil sanctuary immunity under Invariant L-03.",
    },
    protected_bona_fide: true,
    legal_reference: "Art. 933 CC / Art. 105 al. 2 CPP / Invariant L-03",
    procedural_standing: "tiers_bonne_foi",
    cpp_article: "Art. 105 al. 2 CPP",
    discernment_capacity: true,
    nationality: {
      uk: "Швейцарія",
      fr: "Suisse",
      de: "Schweiz",
      it: "Svizzera",
      en: "Switzerland",
    },
    domicile: {
      uk: "Кантон Во, Швейцарія",
      fr: "Canton de Vaud, Suisse",
      de: "Kanton Waadt, Schweiz",
      it: "Canton Vaud, Svizzera",
      en: "Canton of Vaud, Switzerland",
    },
    financial_claim_chf: 0,
    risk_level: "low",
    droits_proceduraux: {
      uk: ["Абсолютний захист від арешту майна (ст. 263 КПК)", "Імунітет від регресних вимог"],
      fr: ["Protection absolue contre tout séquestre (Art. 263 CPP)", "Immunité contre toute action récursoire"],
      de: ["Schutz vor Beschlagnahme (Art. 263 StPO)", "Ausschluss regressiver Ansprüche"],
      it: ["Protezione dal sequestro (Art. 263 CPP)", "Immunità da rivalsa"],
      en: ["Sanctuary immunity against asset freeze (Art. 263 CPC)", "Protection against recourse claims"],
    },
    linked_pieces: ["DEMO-P-02"],
  },
  {
    id: "PARTY-COUNSEL-01",
    name: "PARTY-COUNSEL-01 (Advocate / Ordre des Avocats)",
    age: 48,
    status: {
      uk: "Уповноважений адвокат (Mandataire constitué)",
      fr: "Avocat mandataire constitué",
      de: "Rechtsanwalt / Mandatar",
      it: "Avvocato difensore costituito",
      en: "Constituted Legal Counsel",
    },
    badgeColor: "bg-purple-950/80 text-purple-300 border-purple-700/60 shadow-[0_0_12px_rgba(168,85,247,0.2)]",
    role: {
      uk: "Професійний судовий повірений, член колегії адвокатів (Ordre des Avocats Vaudois). Представництво інтересів у прокуратурі та суді.",
      fr: "Avocat au barreau vaudois (OAV). Représentation judiciaire, dépôt des conclusions et direction de la procédure.",
      de: "Rechtsanwalt im Kanton Waadt. Gerichtliche Vertretung und Verfahrensführung.",
      it: "Avvocato iscritto all'ordine forense. Rappresentanza giudiziaria e redazione atti.",
      en: "Admitted bar advocate. Formal judicial representation, submission of legal pleadings, and court advocacy.",
    },
    protected_bona_fide: false,
    legal_reference: "Art. 127 ss CPP / LLCA / Invariant L-02",
    procedural_standing: "avocat",
    cpp_article: "Art. 127 CPP",
    discernment_capacity: true,
    nationality: {
      uk: "Швейцарія",
      fr: "Suisse",
      de: "Schweiz",
      it: "Svizzera",
      en: "Switzerland",
    },
    domicile: {
      uk: "Лозанна, Кантон Во",
      fr: "Lausanne, Canton de Vaud",
      de: "Lausanne, Kanton Waadt",
      it: "Losanna, Canton Vaud",
      en: "Lausanne, Canton of Vaud",
    },
    financial_claim_chf: 0,
    risk_level: "low",
    droits_proceduraux: {
      uk: ["Повний доступ до матеріалів справи (ст. 101, 107 КПК)", "Участь у всіх слідчих діях (ст. 147 КПК)"],
      fr: ["Accès intégral au dossier (Art. 101, 107 CPP)", "Participation à toutes les auditions (Art. 147 CPP)"],
      de: ["Volle Akteneinsicht (Art. 101, 107 StPO)", "Teilnahme an Beweiserhebungen (Art. 147 StPO)"],
      it: ["Pieno accesso agli atti (Art. 101, 107 CPP)", "Partecipazione alle audizioni (Art. 147 CPP)"],
      en: ["Unrestricted case file inspection (Art. 101, 107 CPC)", "Presence at all investigative hearings (Art. 147 CPC)"],
    },
    linked_pieces: ["DEMO-P-01", "DEMO-P-02", "DEMO-P-03", "DEMO-P-04", "DEMO-P-05"],
  },
];

export const DEMO_BORDEREAU_PIECES: BordereauPiece[] = [
  {
    cote: "DEMO-P-01",
    date_faits: "2024/03/16",
    date_versement: "2024/04/01",
    titre: {
      uk: "Аудіозапис телефонної погрози розправою та вимагання",
      fr: "Enregistrement audio des menaces de mort réitérées et contrainte",
      en: "Audio recording of aggravated death threats and extortion",
    },
    categorie: "Audio",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    admissibilite: {
      uk: "Допустимо (ATF 146 IV 9, ATF 147 IV 9: Pesée des intérêts / état de nécessité probatoire)",
      fr: "Admissible (ATF 146 IV 9, ATF 147 IV 9: Pesée des intérêts / état de détresse probatoire)",
      en: "Admissible (ATF 146 IV 9 / balancing of interests under Art. 141 para 2 CPC)",
    },
    portee_probatoire: {
      uk: "Прямий доказ погроз розправою за ст. 180 КК та примусу за ст. 181 КК",
      fr: "Preuve directe des infractions de menaces (Art. 180 CP) et contrainte (Art. 181 CP)",
      en: "Direct material evidence establishing threats (Art. 180 CP) and coercion (Art. 181 CP)",
    },
    citation_cle: {
      uk: "«Ти не вийдеш звідси живим, якщо не перерахуєш гроші...» (Таймкод: 04:12)",
      fr: "«Tu ne sortiras pas vivant d'ici sans le virement...» (Timecode: 04:12)",
      en: "«You will not leave here alive unless you transfer the money...» (Timecode: 04:12)",
    },
    fichier_local: "demo_audio_rec_01.mp3",
    duration_sec: 342,
  },
  {
    cote: "DEMO-P-02",
    date_faits: "2024/03/18",
    date_versement: "2024/04/05",
    titre: {
      uk: "Банківська виписка міжнародного валютного переказу ($15'000 USD)",
      fr: "Extrait bancaire officiel attestant du virement de $15'000 USD",
      en: "Official bank statement establishing $15,000 USD wire transfer",
    },
    categorie: "Bancaire",
    sha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    admissibilite: {
      uk: "Повна процесуальна допустимість (ст. 139 КПК)",
      fr: "Pleine admissibilité probatoire (Art. 139 CPP)",
      en: "Full procedural admissibility (Art. 139 CPC)",
    },
    portee_probatoire: {
      uk: "Матеріальне підтвердження переказу коштів та прямого збитку за ст. 146 КК",
      fr: "Preuve irréfutable du flux financier et du préjudice matériel (Art. 146 CP)",
      en: "Conclusive financial flow corroboration establishing damage under Art. 146 CP",
    },
    citation_cle: {
      uk: "Сума: 15'000.00 USD, Призначення: Restitution d'urgence",
      fr: "Montant: 15'000.00 USD, Motif: Restitution d'urgence",
      en: "Amount: 15,000.00 USD, Memo: Urgent restitution",
    },
    fichier_local: "demo_bank_wire_15k.pdf",
  },
  {
    cote: "DEMO-P-03",
    date_faits: "2024/03/19",
    date_versement: "2024/04/10",
    titre: {
      uk: "Судово-медичний висновок CHUV про тілесні ушкодження та стресовий розлад",
      fr: "Constat médico-légal officiel (CHUV) attestant des lésions corporelles et stress aigu",
      en: "Official forensic medical certificate (CHUV) substantiating injuries and PTSD",
    },
    categorie: "Médical",
    sha256: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    admissibilite: {
      uk: "Офіційний медичний документ (ст. 139, 182 КПК)",
      fr: "Document médico-légal public (Art. 139, 182 CPP)",
      en: "Official forensic certificate (Art. 139, 182 CPC)",
    },
    portee_probatoire: {
      uk: "Доказ тілесних ушкоджень за ст. 123 КК та тяжкого морального розладу",
      fr: "Preuve médicale des lésions corporelles simples (Art. 123 CP) et tort moral",
      en: "Medical proof of bodily harm under Art. 123 CP and severe emotional distress",
    },
    citation_cle: {
      uk: "Синці лівого передпліччя, гострий посттравматичний реактивний стан",
      fr: "Ecchymoses avant-bras gauche, état de stress post-traumatique aigu",
      en: "Contusions left forearm, acute reactive post-traumatic stress disorder",
    },
    fichier_local: "demo_constat_chuv.pdf",
  },
];

export const DEMO_CHARGES: CriminalCharge[] = [
  {
    id: "CHG-CP-146",
    code: "Art. 146 CP",
    title: {
      uk: "Шахрайство (Escroquerie / Fraud)",
      fr: "Escroquerie (Art. 146 CP)",
      en: "Fraud (Art. 146 CP)",
    },
    accused: "PARTY-DEF-01",
    accused_id: "PARTY-DEF-01",
    victim: {
      uk: "PARTY-L04 & PARTY-L03",
      fr: "PARTY-L04 & PARTY-L03",
      en: "PARTY-L04 & PARTY-L03",
    },
    status: "corroborated",
    atf_ruling: {
      uk: "ATF 142 IV 153: Складне підступне введення в оману (astuce)",
      fr: "ATF 142 IV 153: Manœuvres frauduleuses caractérisées et astuce",
      en: "ATF 142 IV 153: Deceitful fraudulent machinations and cunning",
    },
    conclusions_penales: {
      uk: "Визнати PARTY-DEF-01 винною у вчиненні шахрайства за ст. 146 ч. 1 КК",
      fr: "Déclarer PARTY-DEF-01 coupable d'escroquerie au sens de l'Art. 146 al. 1 CP",
      en: "Find PARTY-DEF-01 guilty of fraud pursuant to Art. 146 para 1 CP",
    },
    conclusions_civiles: {
      uk: "Присудити солідарне відшкодування шкоди у розмірі CHF 13'500 ($15'000 USD) плюс 5% річних",
      fr: "Allouer à titre de réparation civile le montant de CHF 13'500 ($15'000 USD) avec intérêts à 5%",
      en: "Award civil damages of CHF 13,500 ($15,000 USD) plus 5% interest",
    },
    elements: [
      {
        id: "EL-146-1",
        title: { uk: "Підступний обман (Astuce)", fr: "Tromperie astucieuse", en: "Cunning Deceit" },
        description: { uk: "Хибні запевнення з метою заволодіння коштами", fr: "Mise en scène trompeuse pour extorquer des fonds", en: "Deceitful staging to extract funds" },
        status: "corroborated",
        citations: [],
      },
    ],
    supporting_cotes: ["DEMO-P-02"],
  },
  {
    id: "CHG-CP-180",
    code: "Art. 180 CP",
    title: {
      uk: "Погроза (Menaces alarmantes / Threats)",
      fr: "Menaces (Art. 180 CP)",
      en: "Threats (Art. 180 CP)",
    },
    accused: "PARTY-DEF-01",
    accused_id: "PARTY-DEF-01",
    victim: {
      uk: "PARTY-L04",
      fr: "PARTY-L04",
      en: "PARTY-L04",
    },
    status: "corroborated",
    atf_ruling: {
      uk: "ATF 134 IV 216: Створення реального страху за життя та здоров'я",
      fr: "ATF 134 IV 216: Sentiment d'insécurité et d'angoisse objectivement fondé",
      en: "ATF 134 IV 216: Objectively founded apprehension and fear",
    },
    conclusions_penales: {
      uk: "Засудити за багаторазові погрози життю за ст. 180 КК",
      fr: "Condamner pour menaces qualifiées réitérées au sens de l'Art. 180 CP",
      en: "Convict for repeated aggravated threats under Art. 180 CP",
    },
    conclusions_civiles: {
      uk: "Моральна шкода CHF 15'000",
      fr: "Tort moral à hauteur de CHF 15'000",
      en: "Moral tort damages of CHF 15,000",
    },
    elements: [],
    supporting_cotes: ["DEMO-P-01"],
  },
];

export const DEMO_DOSSIER_CHAPTERS: DossierChapter[] = [
  {
    id: "CH-01",
    number: "01",
    title: {
      uk: "Розділ 01 · Процесуальні рамки та сторони (Демо)",
      fr: "Chapitre 01 · Cadre procédural & Parties (Démo)",
      en: "Chapter 01 · Procedural Framework & Parties (Demo)",
    },
    status: "verified",
    summary: {
      uk: "Ідентифікація потерпілого PARTY-L04 та фіксація захисного імунітету PARTY-TIERS-01 (ст. 933 CC).",
      fr: "Identification de PARTY-L04 et sanctuarisation du bouclier de bonne foi (Art. 933 CC).",
      en: "Identification of complainant PARTY-L04 and confirmation of bona fide shield (Art. 933 CC).",
    },
    outdated_claim: {
      uk: "Застарілі припущення щодо відсутності прямих збитків спростовано банківськими виписками.",
      fr: "Les allégations infondées sont réfutées par les pièces bancaires et audios.",
      en: "Unsubstantiated claims refuted by certified bank and audio exhibits.",
    },
    lawyer_draft: {
      uk: "PARTY-L04 є повнолітньою дієздатною потерпілою стороною (ст. 115, 118 КПК). PARTY-TIERS-01 володіє повним імунітетом добросовісного набувача за ст. 933 ЦК.",
      fr: "PARTY-L04 est une victime majeure et capable de discernement (Art. 115, 118, 122 CPP). PARTY-TIERS-01 bénéficie de l'immunité totale (Art. 933 CC).",
      en: "PARTY-L04 is an adult victim with full standing (Art. 115, 118, 122 CPC). PARTY-TIERS-01 enjoys complete bona fide third-party protection under Art. 933 CC.",
    },
    impacted_articles: ["Art. 115 CPP", "Art. 118 CPP", "Art. 933 CC"],
    supporting_pieces: ["DEMO-P-01", "DEMO-P-02"],
  },
  {
    id: "CH-02",
    number: "02",
    title: {
      uk: "Розділ 02 · Матриця доказів та допустимість аудіозаписів",
      fr: "Chapitre 02 · Registre des pièces & Admissibilité probatoire",
      en: "Chapter 02 · Evidence Registry & Probative Admissibility",
    },
    status: "verified",
    summary: {
      uk: "Кваліфікація допустимості аудіозаписів за ст. 141 al. 2 КПК та прецедентами ATF 146 IV 9, ATF 147 IV 9.",
      fr: "Qualification de l'admissibilité des enregistrements sous l'Art. 141 al. 2 CPP et ATF 146 IV 9, ATF 147 IV 9.",
      en: "Admissibility qualification of audio recordings under Art. 141 para 2 CPC and ATF 146 IV 9, ATF 147 IV 9.",
    },
    outdated_claim: {
      uk: "Твердження захисту про неприпустимість записів спростовано станом крайньої доказової необхідності.",
      fr: "L'allégation d'inexploitabilité est écartée par la pesée des intérêts et la légitime défense probatoire.",
      en: "Defense claim of inadmissibility overridden by state of evidentiary necessity.",
    },
    lawyer_draft: {
      uk: "Усі аудіозаписи здійснено потерпілим in statu nascendi для фіксації злочину (ATF 146 IV 9). Хеші SHA-256 опечатано.",
      fr: "Tous les enregistrements ont été réalisés in statu nascendi (ATF 146 IV 9). Scellés SHA-256 intègres.",
      en: "All audio recordings captured in statu nascendi to substantiate offenses (ATF 146 IV 9). SHA-256 seals valid.",
    },
    impacted_articles: ["Art. 139 CPP", "Art. 141 al. 2 CPP", "ATF 146 IV 9"],
    supporting_pieces: ["DEMO-P-01"],
  },
];

export const DEMO_CONFRONTATIONS: ConfrontationItem[] = [
  {
    id: "CONF-01",
    theme: {
      uk: "Тема 1: Походження та розтрата $15'000 USD",
      fr: "Thème 1 : Origine et destination des $15'000 USD",
      en: "Theme 1: Origin and embezzlement of $15,000 USD",
    },
    prevenue_allegation: {
      uk: "Стверджувала, що кошти були подарунком",
      fr: "Allègue un don ou un prêt bénévole",
      en: "Alleges funds were an unconditional gift",
    },
    corroborated_reality: {
      uk: "Аудіозапис підтверджує вимогу негайного перерахунку під тиском",
      fr: "L'enregistrement DEMO-P-01 prouve la contrainte directe",
      en: "Audio recording DEMO-P-01 disproves gift and demonstrates coercion",
    },
    inconsistency_point: {
      uk: "Суперечність між твердженням про подарунок та голосовими погрозами",
      fr: "Contradiction formelle entre allégation de don et menaces audio",
      en: "Direct contradiction between gift claim and extortion threats",
    },
    exhibits: ["DEMO-P-01", "DEMO-P-02"],
    certified_timestamp: "2024/03/16 14:22:00",
    investigation_questions: {
      uk: ["Як ви поясните ваші слова на таймкоді 04:12 аудіозапису?"],
      fr: ["Comment expliquez-vous vos propos à 04:12 de l'enregistrement ?"],
      en: ["How do you explain your statement at 04:12 of the audio recording?"],
    },
    tactical_defense: {
      uk: "Вимагати пред'явлення оригінального аудіофайлу на допиті",
      fr: "Exiger la lecture intégrale de l'enregistrement en audition",
      en: "Require full audio playback during formal interrogation",
    },
  },
];

export const DEMO_LEGAL_REQUISITIONS: LegalRequisition[] = [
  {
    id: "REQ-01",
    target_authority: {
      uk: "Прокуратура кантону Во (Ministère public)",
      fr: "Ministère public du Canton de Vaud",
      en: "Public Prosecutor of Canton of Vaud",
    },
    statutory_basis: "Art. 263 CPP",
    purpose: {
      uk: "Клопотання про накладення арешту на банківські рахунки обвинуваченої",
      fr: "Requête urgente de séquestre conservatoire sur les comptes bancaires",
      en: "Urgent motion for protective freezing of bank accounts",
    },
    amount_chf: 46850.0,
    status: "ready_to_file",
  },
];

export const ACTORS = DEMO_ACTORS;
export const BORDEREAU_PIECES = DEMO_BORDEREAU_PIECES;
export const CHARGES = DEMO_CHARGES;
export const DOSSIER_CHAPTERS = DEMO_DOSSIER_CHAPTERS;
export const CONFRONTATIONS = DEMO_CONFRONTATIONS;
export const LEGAL_REQUISITIONS = DEMO_LEGAL_REQUISITIONS;

