// =========================================================================
// B-SDD LEGAL FRAMEWORK · PROCEDURAL ACTOR & IMPACT MATRIX (ADR-002, L-02, L-03)
// Canton de Vaud Criminal Procedure (CPP Suisse RS 312.0)
// =========================================================================

import {
  ActorItem,
  ACTORS,
  BORDEREAU_PIECES,
  CHARGES,
  resolveLocalized,
} from '../data/legalData';
import { SupportedLanguage } from '../types/i18n';

export const ACTORS_STORAGE_KEY = 'b_sdd_legal_case_actors_v1';

export type ProceduralRoleKey =
  | 'victime_plaignante'
  | 'prevenu_principal'
  | 'prevenu_complice'
  | 'tiers_bonne_foi'
  | 'temoin'
  | 'personne_renseignement'
  | 'magistrat'
  | 'avocat';

export interface ProceduralRoleMetadata {
  key: ProceduralRoleKey;
  labelUk: string;
  labelFr: string;
  labelDe: string;
  labelIt: string;
  labelEn: string;
  cppArticles: string;
  badgeStyle: string;
  isAccused: boolean;
  isVictimOrClaimant: boolean;
  isImmuneOrThirdParty: boolean;
  defaultRightsUk: string[];
  defaultRightsFr: string[];
  defaultRightsDe: string[];
  defaultRightsIt: string[];
  defaultRightsEn: string[];
}

export function getRoleLabel(roleMeta: ProceduralRoleMetadata, lang: SupportedLanguage): string {
  if (lang === 'uk') return roleMeta.labelUk;
  if (lang === 'fr') return roleMeta.labelFr;
  if (lang === 'de') return roleMeta.labelDe;
  if (lang === 'it') return roleMeta.labelIt;
  return roleMeta.labelEn;
}

export function getRoleDefaultRights(roleMeta: ProceduralRoleMetadata, lang: SupportedLanguage): string[] {
  if (lang === 'uk') return roleMeta.defaultRightsUk;
  if (lang === 'fr') return roleMeta.defaultRightsFr;
  if (lang === 'de') return roleMeta.defaultRightsDe;
  if (lang === 'it') return roleMeta.defaultRightsIt;
  return roleMeta.defaultRightsEn;
}

export const PROCEDURAL_ROLES_METADATA: Record<ProceduralRoleKey, ProceduralRoleMetadata> = {
  victime_plaignante: {
    key: 'victime_plaignante',
    labelUk: 'Потерпілий & Цивільний позивач',
    labelFr: 'Victime & Partie Plaignante (Pénal & Civil)',
    labelDe: 'Geschädigte Person & Privatklägerschaft',
    labelIt: 'Persona Lesa & Accusatore Privato',
    labelEn: 'Victim & Civil Complainant',
    cppArticles: 'Art. 115, 118, 122 CPP',
    badgeStyle: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    isAccused: false,
    isVictimOrClaimant: true,
    isImmuneOrThirdParty: false,
    defaultRightsUk: [
      'Повноправний статус сторони обвинувачення (ст. 118 КПК)',
      'Право на відшкодування матеріальних та моральних збитків (ст. 122 КПК, ст. 41 ЗК)',
      'Право доступу до матеріалів досудового слідства (ст. 101, 107 КПК)',
      'Право вимагати арешту майна та рахунків обвинуваченого (ст. 263 КПК)',
      'Право заявляти клопотання про виклик свідків та експертиз (ст. 318 КПК)',
    ],
    defaultRightsFr: [
      'Statut complet de partie plaignante pénale (Art. 118 CPP)',
      'Droit aux conclusions civiles chiffrées (Art. 122 CPP / Art. 41 CO)',
      'Plein accès aux dossiers de la procédure (Art. 101, 107 CPP)',
      'Faculté de requérir le séquestre conservatoire (Art. 263 CPP)',
      'Droit de solliciter des mesures d instruction complémentaires (Art. 318 CPP)',
    ],
    defaultRightsDe: [
      'Vollwertiger Status als Privatklägerschaft (Art. 118 StPO)',
      'Recht auf Geltendmachung von Zivilansprüchen (Art. 122 StPO / Art. 41 OR)',
      'Vollständige Akteneinsicht im Vorverfahren (Art. 101, 107 StPO)',
      'Recht auf vorsorgliche Beschlagnahme von Vermögenswerten (Art. 263 StPO)',
      'Recht auf Stellung ergänzender Beweisanträge (Art. 318 StPO)',
    ],
    defaultRightsIt: [
      'Pieno status di parte accusatrice penale (Art. 118 CPP)',
      'Diritto all azione civile e risarcimento danni (Art. 122 CPP / Art. 41 CO)',
      'Pieno accesso agli atti istruttori (Art. 101, 107 CPP)',
      'Facoltà di richiedere il sequestro conservativo (Art. 263 CPP)',
      'Diritto di presentare istanze probatorie supplementari (Art. 318 CPP)',
    ],
    defaultRightsEn: [
      'Full standing as private penal complainant (Art. 118 CPC)',
      'Right to civil damages and full restitution (Art. 122 CPC / Art. 41 CO)',
      'Right of full inspection of file (Art. 101, 107 CPC)',
      'Right to demand asset freeze & sequestration (Art. 263 CPC)',
      'Right to request supplementary evidentiary measures (Art. 318 CPC)',
    ],
  },
  prevenu_principal: {
    key: 'prevenu_principal',
    labelUk: 'Головний обвинувачений (Auteur principal)',
    labelFr: 'Prévenu · Auteur Principal',
    labelDe: 'Hauptbeschuldigte Person (Haupttäter)',
    labelIt: 'Imputato Principale (Autore principale)',
    labelEn: 'Principal Accused',
    cppArticles: 'Art. 111, 158 CPP',
    badgeStyle: 'bg-rose-950/80 text-rose-300 border-rose-800/60 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
    isAccused: true,
    isVictimOrClaimant: false,
    isImmuneOrThirdParty: false,
    defaultRightsUk: [
      'Право бути негайно поінформованим про підозру (ст. 158 КПК)',
      'Право на мовчання та захист від самовикриття (nemo tenetur se ipsum accusare, ст. 158 КПК)',
      'Право на захисника з першого допиту (ст. 158, 159 КПК)',
      'Обов язок з являтися за повістками та на очні ставки (ст. 205, 207 КПК)',
    ],
    defaultRightsFr: [
      'Droit d être immédiatement informé des soupçons (Art. 158 CPP)',
      'Droit de garder le silence et de ne pas s auto-incriminer (Art. 158 CPP)',
      'Droit à l assistance d un conseil de la première heure (Art. 158, 159 CPP)',
      'Obligation de comparaître aux auditions contradictoires (Art. 205, 207 CPP)',
    ],
    defaultRightsDe: [
      'Recht auf unverzügliche Information über den Tatverdacht (Art. 158 StPO)',
      'Aussageverweigerungsrecht und Schutz vor Selbstbelastung (Art. 158 StPO)',
      'Recht auf Beizug einer Verteidigung ab erster Einvernahme (Art. 158, 159 StPO)',
      'Erscheinungspflicht bei Vorladungen und Konfrontationen (Art. 205, 207 StPO)',
    ],
    defaultRightsIt: [
      'Diritto di essere immediatamente informato dei sospetti (Art. 158 CPP)',
      'Facoltà di non rispondere e privilegio contro l autoincriminazione (Art. 158 CPP)',
      'Diritto all assistenza di un difensore sin dal primo interrogatorio (Art. 158, 159 CPP)',
      'Obbligo di comparire alle citazioni e ai confronti contraddittori (Art. 205, 207 CPP)',
    ],
    defaultRightsEn: [
      'Right to be informed of suspicions without delay (Art. 158 CPC)',
      'Right to remain silent and privilege against self-incrimination (Art. 158 CPC)',
      'Right to legal counsel of choice from first interrogation (Art. 158, 159 CPC)',
      'Duty to comply with summons and confrontation hearings (Art. 205, 207 CPC)',
    ],
  },
  prevenu_complice: {
    key: 'prevenu_complice',
    labelUk: 'Обвинувачений · Співучасник (Complice / Co-auteur)',
    labelFr: 'Prévenu · Complice / Co-auteur',
    labelDe: 'Beschuldigter · Mittäter / Gehilfe',
    labelIt: 'Imputato · Complice / Co-autore',
    labelEn: 'Accused · Accomplice / Co-perpetrator',
    cppArticles: 'Art. 25 CP / Art. 111 CPP',
    badgeStyle: 'bg-rose-950/80 text-rose-300 border-rose-800/60 shadow-[0_0_12px_rgba(244,63,94,0.15)]',
    isAccused: true,
    isVictimOrClaimant: false,
    isImmuneOrThirdParty: false,
    defaultRightsUk: [
      'Процесуальний режим співучасника (ст. 25 КК, ст. 111 КПК)',
      'Право знати зміст спільних дій та ступінь індивідуальної вини',
      'Право на правову допомогу та участь у допитах (ст. 147 КПК)',
    ],
    defaultRightsFr: [
      'Régime procédural des co-prévenus et complices (Art. 25 CP, Art. 111 CPP)',
      'Droit de contester la qualification d acte d assistance délibéré',
      'Droit à la défense et présence aux débats contradictoires (Art. 147 CPP)',
    ],
    defaultRightsDe: [
      'Verfahrensregime für Mittäter und Gehilfen (Art. 25 StGB, Art. 111 StPO)',
      'Recht auf Klärung des individuellen Tatbeitrags und Vorsatzes',
      'Recht auf Verteidigung und Teilnahme an Beweiserhebungen (Art. 147 StPO)',
    ],
    defaultRightsIt: [
      'Regime processuale dei coimputati e complici (Art. 25 CP, Art. 111 CPP)',
      'Diritto di contestare il grado di partecipazione materiale o morale',
      'Diritto alla difesa tecnica e presenza agli atti istruttori (Art. 147 CPP)',
    ],
    defaultRightsEn: [
      'Procedural standing of co-accused accomplice (Art. 25 CP, Art. 111 CPC)',
      'Right to dispute willful assistance qualification',
      'Right of defense and presence at confrontation sessions (Art. 147 CPC)',
    ],
  },
  tiers_bonne_foi: {
    key: 'tiers_bonne_foi',
    labelUk: 'Добросовісна третя сторона (Щит ст. 933 CC, L-03)',
    labelFr: 'Tiers de Bonne Foi Protégé (Bouclier Art. 933 CC)',
    labelDe: 'Gutgläubiger Dritter (Schutz Art. 933 ZGB, L-03)',
    labelIt: 'Terzo in Buona Fede Protetto (Scudo Art. 933 CC, L-03)',
    labelEn: 'Protected Bona Fide Third Party',
    cppArticles: 'Art. 933 CC / Art. 105 al. 2 CPP / Invariant L-03',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-500/70 shadow-[0_0_12px_rgba(212,175,55,0.25)]',
    isAccused: false,
    isVictimOrClaimant: false,
    isImmuneOrThirdParty: true,
    defaultRightsUk: [
      'Абсолютний імунітет від кримінального переслідування (Інваріант L-03)',
      'Захист законного набувача та добросовісного помічника (ст. 933 ЦК Швейцарії)',
      'Заборона накладення арешту на особисте майно (ст. 105 ч. 2, ст. 263 КПК)',
      'Відхилення будь-яких рекурсивних вимог сторони захисту',
    ],
    defaultRightsFr: [
      'Immunité pénale et civile absolue sanctuarisée (Invariant L-03)',
      'Bouclier matériel du possesseur de bonne foi (Art. 933 Code Civil Suisse)',
      'Interdiction absolue de saisie ou séquestre conservatoire (Art. 105 al. 2, 263 CPP)',
      'Irrecevabilité d office de toute plainte téméraire de la défense',
    ],
    defaultRightsDe: [
      'Absolute zivil- und strafrechtliche Immunität (Invariante L-03)',
      'Materieller Schutz des gutgläubigen Besitzers/Helfers (Art. 933 ZGB)',
      'Absolutes Verbot von Beschlagnahme persönlicher Vermögenswerte (Art. 105 Abs. 2, 263 StPO)',
      'Nichteintreten von Amtes wegen auf mutwillige Eingaben der Verteidigung',
    ],
    defaultRightsIt: [
      'Immunità civile e penale assoluta inviolabile (Invariante L-03)',
      'Tutela sostanziale del possessore in buona fede (Art. 933 Codice Civile Svizzero)',
      'Divieto assoluto di sequestro sui beni personali (Art. 105 cpv. 2, 263 CPP)',
      'Irricevibilità d ufficio di qualsiasi querela temeraria della difesa',
    ],
    defaultRightsEn: [
      'Absolute sanctuary criminal and civil immunity (Invariant L-03)',
      'Substantive good faith shield under Art. 933 Swiss Civil Code',
      'Absolute prohibition of personal asset freeze or sequestration (Art. 105 para 2, 263 CPC)',
      'Summary dismissal of frivolous complaints from the defense',
    ],
  },
  temoin: {
    key: 'temoin',
    labelUk: 'Свідок (Témoin)',
    labelFr: 'Témoin (Prestation de serment)',
    labelDe: 'Zeuge (Zeugenpflicht unter Wahrheitspflicht)',
    labelIt: 'Testimone (Sotto vincolo di giuramento)',
    labelEn: 'Witness (Under oath)',
    cppArticles: 'Art. 162 ss CPP',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
    isAccused: false,
    isVictimOrClaimant: false,
    isImmuneOrThirdParty: true,
    defaultRightsUk: [
      'Обов язок давати правдиві свідчення під присягою (ст. 163 КПК, ст. 307 КК)',
      'Право на відмову від свідчень за наявності родинних зв язків (ст. 168 КПК)',
      'Право на компенсацію витрат та захист свідка (ст. 149 КПК)',
    ],
    defaultRightsFr: [
      'Obligation de témoigner et dire la vérité sous serment (Art. 163 CPP, Art. 307 CP)',
      'Droit de refuser de témoigner pour proches parents (Art. 168 CPP)',
      'Droit aux indemnités et mesures de protection des témoins (Art. 149 CPP)',
    ],
    defaultRightsDe: [
      'Pflicht zur wahrheitsgemässen Aussage (Art. 163 StPO, Art. 307 StGB)',
      'Zeugnisverweigerungsrecht für nahe Verwandte (Art. 168 StPO)',
      'Recht auf Zeugenentschädigung und Zeugenschutzmassnahmen (Art. 149 StPO)',
    ],
    defaultRightsIt: [
      'Obbligo di deporre e dire la verità (Art. 163 CPP, Art. 307 CP)',
      'Facoltà di astenersi dal testimoniare per i prossimi congiunti (Art. 168 CPP)',
      'Diritto all indennità e a misure di protezione dei testimoni (Art. 149 CPP)',
    ],
    defaultRightsEn: [
      'Obligation to testify truthfully under oath (Art. 163 CPC, Art. 307 CP)',
      'Right to refuse testimony for close relatives (Art. 168 CPC)',
      'Right to witness indemnification and protective measures (Art. 149 CPC)',
    ],
  },
  personne_renseignement: {
    key: 'personne_renseignement',
    labelUk: 'Особа, покликана дати відомості',
    labelFr: 'Personne appelée à donner des renseignements',
    labelDe: 'Auskunftsperson (Art. 178 StPO)',
    labelIt: 'Persona informata sui fatti (Art. 178 CPP)',
    labelEn: 'Person Called to Give Information',
    cppArticles: 'Art. 178 ss CPP',
    badgeStyle: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
    isAccused: false,
    isVictimOrClaimant: false,
    isImmuneOrThirdParty: true,
    defaultRightsUk: [
      'Допит без складання присяги свідка (ст. 178, 180 КПК)',
      'Право відмови від надання відомостей, якщо це загрожує самовикриттям (ст. 180 КПК)',
    ],
    defaultRightsFr: [
      'Audition sans prestation de serment formel (Art. 178, 180 CPP)',
      'Droit de refuser de déposer si cela expose à des poursuites (Art. 180 CPP)',
    ],
    defaultRightsDe: [
      'Einvernahme ohne Zeugeneid (Art. 178, 180 StPO)',
      'Aussageverweigerungsrecht bei Gefahr der Selbstbelastung (Art. 180 StPO)',
    ],
    defaultRightsIt: [
      'Audizione senza formale vincolo di giuramento testimoniale (Art. 178, 180 CPP)',
      'Facoltà di non deporre in caso di rischio di autoincriminazione (Art. 180 CPP)',
    ],
    defaultRightsEn: [
      'Interrogation without formal witness oath (Art. 178, 180 CPC)',
      'Right to refuse deposition if exposing to liability (Art. 180 CPC)',
    ],
  },
  magistrat: {
    key: 'magistrat',
    labelUk: 'Прокурор / Слідчий магістрат',
    labelFr: 'Ministère Public / Magistrat instructeur',
    labelDe: 'Staatsanwaltschaft / Untersuchungsrichter',
    labelIt: 'Ministero Pubblico / Magistrato inquirente',
    labelEn: 'Public Prosecutor / Magistrate',
    cppArticles: 'Art. 14, 61 ss CPP',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
    isAccused: false,
    isVictimOrClaimant: false,
    isImmuneOrThirdParty: true,
    defaultRightsUk: [
      'Керівництво досудовим розслідуванням (ст. 61 КПК)',
      'Обов язок неупередженого встановлення обставин на користь і проти обвинуваченого (ст. 6 КПК)',
      'Повноваження накладати арешт на майно (ст. 263 КПК) та складати обвинувальний акт (ст. 324 КПК)',
    ],
    defaultRightsFr: [
      'Direction de l instruction préparatoire (Art. 61 CPP)',
      'Devoir d instruire à charge et à décharge avec impartialité (Art. 6 CPP)',
      'Compétence d ordonner le séquestre (Art. 263 CPP) et dresser l acte d accusation (Art. 324 CPP)',
    ],
    defaultRightsDe: [
      'Leitung des Vorverfahrens (Art. 61 StPO)',
      'Pflicht zu unparteiischer Ermittlung der be- und entlastenden Umstände (Art. 6 StPO)',
      'Befugnis zur Anordnung von Beschlagnahmen (Art. 263 StPO) und Anklageerhebung (Art. 324 StPO)',
    ],
    defaultRightsIt: [
      'Direzione dell istruzione preliminare (Art. 61 CPP)',
      'Dovere di indagare con imparzialità a carico e a discarico (Art. 6 CPP)',
      'Competenza a disporre il sequestro probatorio o conservativo (Art. 263 CPP) e formulare l atto d accusa (Art. 324 CPP)',
    ],
    defaultRightsEn: [
      'Direction of preliminary criminal investigation (Art. 61 CPC)',
      'Duty to investigate exculpatory and inculpatory facts impartially (Art. 6 CPC)',
      'Power to order sequestration (Art. 263 CPC) and issue indictment (Art. 324 CPC)',
    ],
  },
  avocat: {
    key: 'avocat',
    labelUk: 'Адвокат / Юридичний представник',
    labelFr: 'Avocat / Conseil Juridique',
    labelDe: 'Rechtsanwalt / Rechtsbeistand',
    labelIt: 'Avvocato / Difensore di fiducia',
    labelEn: 'Counsel / Legal Advocate',
    cppArticles: 'Art. 127 ss CPP / LLCA',
    badgeStyle: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
    isAccused: false,
    isVictimOrClaimant: false,
    isImmuneOrThirdParty: true,
    defaultRightsUk: [
      'Професійна адвокатська таємниця (ст. 13 LLCA, ст. 321 КК)',
      'Право безперешкодного спілкування з клієнтом (ст. 159 КПК)',
      'Право брати участь у всіх процесуальних діях за участю підзахисного (ст. 147 КПК)',
    ],
    defaultRightsFr: [
      'Secret professionnel absolu de l avocat (Art. 13 LLCA, Art. 321 CP)',
      'Libre communication avec le mandant sans surveillance (Art. 159 CPP)',
      'Plein droit d assister aux actes d instruction (Art. 147 CPP)',
    ],
    defaultRightsDe: [
      'Absolutes Berufsgeheimnis des Anwalts (Art. 13 BGFA, Art. 321 StGB)',
      'Freier und unüberwachter Verkehr mit dem Klienten (Art. 159 StPO)',
      'Volles Teilnahmerecht an allen Beweiserhebungen (Art. 147 StPO)',
    ],
    defaultRightsIt: [
      'Segreto professionale forense assoluto (Art. 13 LLCA, Art. 321 CP)',
      'Libera e riservata comunicazione con il mandante (Art. 159 CPP)',
      'Pieno diritto di presenziare agli atti d istruzione (Art. 147 CPP)',
    ],
    defaultRightsEn: [
      'Absolute professional legal privilege (Art. 13 BGFA/LLCA, Art. 321 CP)',
      'Unimpeded confidential communication with client (Art. 159 CPC)',
      'Right to participate in all evidentiary hearing sessions (Art. 147 CPC)',
    ],
  },
};

// --- Storage & CRUD ---

export function loadCaseActors(): ActorItem[] {
  try {
    const raw = localStorage.getItem(ACTORS_STORAGE_KEY);
    if (!raw) {
      return [...ACTORS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [...ACTORS];
  } catch (err) {
    console.error('Failed to load actors from localStorage:', err);
    return [...ACTORS];
  }
}

export function saveCaseActors(actors: ActorItem[]): void {
  try {
    localStorage.setItem(ACTORS_STORAGE_KEY, JSON.stringify(actors));
  } catch (err) {
    console.error('Failed to save actors to localStorage:', err);
  }
}

export function resetCaseActorsToDefault(): ActorItem[] {
  try {
    localStorage.removeItem(ACTORS_STORAGE_KEY);
  } catch {}
  return [...ACTORS];
}

// --- Impact Analysis Engine ---

export interface ActorImpactAnalysis {
  action: 'add' | 'remove' | 'update';
  actor: ActorItem;
  canProceed: boolean;
  blockedByInvariant: boolean;
  blockingMessage: string | null;
  chargesImpact: Array<{
    chargeId: string;
    code: string;
    title: string;
    effect: 'accused_target' | 'unlinked' | 'evidence_loss' | 'corroboration_shift';
    description: string;
  }>;
  evidenceImpact: Array<{
    cote: string;
    title: string;
    role: string;
  }>;
  financialImpact: {
    priorSequestrationTotal: number;
    projectedSequestrationTotal: number;
    difference: number;
  };
  proceduralStandingAnalysis: {
    categoryLabel: string;
    applicableSwissArticles: string[];
    adversarialAuditionRequired: boolean;
    appealWindowDays: number;
    alibiOrCapacityCheckNeeded: boolean;
  };
  recommendations: string[];
}

export function calculateActorImpact(
  action: 'add' | 'remove' | 'update',
  actor: ActorItem,
  existingActors: ActorItem[]
): ActorImpactAnalysis {
  let canProceed = true;
  let blockedByInvariant = false;
  let blockingMessage: string | null = null;

  // Invariant L-03 Enforcement: Adriano Milli protection
  if (actor.id === 'ACT-ADRIANO-MILLI' || actor.protected_bona_fide) {
    if (action === 'remove') {
      canProceed = false;
      blockedByInvariant = true;
      blockingMessage =
        'Violation de l Invariant L-03 : Adriano MILLI est protégé de manière irrévocable par le bouclier de l Art. 933 CC et Art. 105 al. 2 CPP. Il est formellement interdit de le retirer du dossier.';
    } else if (
      action === 'update' &&
      actor.procedural_standing &&
      ['prevenu_principal', 'prevenu_complice'].includes(actor.procedural_standing)
    ) {
      canProceed = false;
      blockedByInvariant = true;
      blockingMessage =
        'Violation de l Invariant L-03 : Tentative illicite de requalifier Adriano MILLI en prévenu. Toute poursuite pénale ou action récursoire est strictement forclose (Art. 933 CC).';
    }
  }

  // Invariant L-01 Enforcement: Arsen Kovalenko victim standing
  if (actor.id === 'ACT-ARSEN-KOVALENKO') {
    if (action === 'remove') {
      canProceed = false;
      blockedByInvariant = true;
      blockingMessage =
        'Violation de l Invariant L-01 : Arsen KOVALENKO est la partie plaignante fondatrice de la procédure PE24.014624-SBA. Sa radiation désintégrerait l ensemble du dossier.';
    } else if (
      action === 'update' &&
      (actor.age !== undefined && actor.age < 18)
    ) {
      canProceed = false;
      blockedByInvariant = true;
      blockingMessage =
        'Violation de l Invariant L-01 : Fixation irrévocable de la majorité d Arsen KOVALENKO (né le 05.11.1999, 26 ans, majeur capable de discernement).';
    }
  }

  // Charges Impact
  const chargesImpact: ActorImpactAnalysis['chargesImpact'] = [];
  CHARGES.forEach((ch) => {
    if (ch.accused_id === actor.id || ch.accused.toLowerCase().includes(actor.name.toLowerCase())) {
      chargesImpact.push({
        chargeId: ch.id,
        code: ch.code,
        title: resolveLocalized(ch.title, 'fr'),
        effect: action === 'remove' ? 'unlinked' : 'accused_target',
        description:
          action === 'remove'
            ? `Attention : Le chef de prévention ${ch.code} (${resolveLocalized(ch.title, 'fr')}) perdrait sa mise en cause directe.`
            : `Chef d infraction directement imputé : ${ch.code} - Peine encourue selon le Code Pénal suisse.`,
      });
    }
  });

  // Evidence Impact
  const evidenceImpact: ActorImpactAnalysis['evidenceImpact'] = [];
  const linkedCotes = actor.linked_pieces || [];
  BORDEREAU_PIECES.forEach((p) => {
    if (linkedCotes.includes(p.cote) || (actor.id === 'ACT-LIUBOV-SUVOROVA' && ['P-01', 'P-02', 'P-04', 'P-05', 'P-07', 'P-08', 'P-09', 'P-10', 'P-14'].includes(p.cote))) {
      evidenceImpact.push({
        cote: p.cote,
        title: resolveLocalized(p.titre, 'fr'),
        role: `Pièce corroborante rattachée (${p.categorie})`,
      });
    }
  });

  // Financial Impact (CHF Sequestration)
  const priorSequestrationTotal = existingActors.reduce(
    (acc, a) => acc + (a.financial_claim_chf || 0),
    0
  );
  let projectedSequestrationTotal = priorSequestrationTotal;
  if (action === 'add') {
    projectedSequestrationTotal += actor.financial_claim_chf || 0;
  } else if (action === 'remove') {
    projectedSequestrationTotal -= actor.financial_claim_chf || 0;
  } else if (action === 'update') {
    const existing = existingActors.find((a) => a.id === actor.id);
    const oldVal = existing?.financial_claim_chf || 0;
    const newVal = actor.financial_claim_chf || 0;
    projectedSequestrationTotal = priorSequestrationTotal - oldVal + newVal;
  }

  // Standing & Swiss Procedural Analysis
  const roleKey = (actor.procedural_standing as ProceduralRoleKey) || 'temoin';
  const roleMeta = PROCEDURAL_ROLES_METADATA[roleKey] || PROCEDURAL_ROLES_METADATA.temoin;

  const recommendations: string[] = [];
  if (roleMeta.isAccused) {
    recommendations.push(
      'Notifier immédiatement les droits de la défense selon l Art. 158 CPP avant toute audition contradictoire.'
    );
    recommendations.push(
      'Requérir le séquestre des avoirs bancaires sous l Art. 263 CPP pour garantir la créance civile de CHF 46 850.00.'
    );
    recommendations.push(
      'Fixer le calendrier des auditions de confrontation en présence de la partie plaignante (Art. 147 CPP).'
    );
  } else if (roleMeta.isImmuneOrThirdParty) {
    recommendations.push(
      'Maintenir le statut de tiers participant et rejeter toute demande téméraire d inculpation.'
    );
    recommendations.push(
      'Auditionner exclusivement sous le régime de l Art. 105 al. 2 CPP ou de l Art. 162 ss CPP.'
    );
  } else if (roleMeta.isVictimOrClaimant) {
    recommendations.push(
      'Confirmer la constitution formelle de partie plaignante au pénal et au civil (Art. 118, 122 CPP).'
    );
    recommendations.push(
      'Déposer le bordereau actualisé des pièces scellées SHA-256 auprès du Ministère public de Vaud.'
    );
  }

  return {
    action,
    actor,
    canProceed,
    blockedByInvariant,
    blockingMessage,
    chargesImpact,
    evidenceImpact,
    financialImpact: {
      priorSequestrationTotal,
      projectedSequestrationTotal,
      difference: projectedSequestrationTotal - priorSequestrationTotal,
    },
    proceduralStandingAnalysis: {
      categoryLabel: roleMeta.labelFr,
      applicableSwissArticles: roleMeta.cppArticles.split(' / '),
      adversarialAuditionRequired: roleMeta.isAccused || roleMeta.isVictimOrClaimant,
      appealWindowDays: 10, // Art. 393 CPP
      alibiOrCapacityCheckNeeded: roleMeta.isVictimOrClaimant || roleMeta.isAccused,
    },
    recommendations,
  };
}
