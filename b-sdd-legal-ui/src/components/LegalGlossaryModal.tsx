import React, { useState } from "react";
import {
  BookOpen,
  X,
  Search,
  Scale,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Clock,
  Layers,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";

interface LegalGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
}

interface GlossaryEntry {
  term: string;
  category: "code" | "statute" | "invariant" | "procedure" | "system";
  title: Record<SupportedLanguage, string>;
  description: Record<SupportedLanguage, string>;
  details: Record<SupportedLanguage, string>;
  legalBasis?: string;
  badge?: string;
}

const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  // Swiss Codes & Statutory Norms
  {
    term: "CP (Code pénal)",
    category: "code",
    title: {
      uk: "КК (Кримінальний кодекс Швейцарії / Code pénal suisse)",
      fr: "CP (Code pénal suisse)",
      en: "SCC (Swiss Criminal Code)",
    },
    description: {
      uk: "Головний матеріальний кримінальний закон Швейцарської Конфедерації.",
      fr: "Loi pénale matérielle fondamentale de la Confédération suisse.",
      en: "Primary substantive criminal statute of the Swiss Confederation.",
    },
    details: {
      uk: "Містить склади злочинів: ст. 146 (Шахрайство), ст. 180 (Погрози розправою), ст. 181 (Примус), ст. 186 (Порушення недоторканності житла), ст. 303 (Завідомо неправдивий донос), ст. 138 (Привласнення активів).",
      fr: "Régit les infractions du dossier : Art. 146 (Escroquerie), Art. 180 (Menaces), Art. 181 (Contrainte), Art. 186 (Violation de domicile), Art. 303 (Dénonciation calomnieuse), Art. 138 (Abus de confiance).",
      en: "Governs criminal charges: Art. 146 (Fraud), Art. 180 (Threats), Art. 181 (Coercion), Art. 186 (Trespassing), Art. 303 (Malicious False Accusation).",
    },
    legalBasis: "RS 311.0",
    badge: "Loi Fédérale",
  },
  {
    term: "CPP (Code de procédure pénale)",
    category: "code",
    title: {
      uk: "КПК (Кримінальний процесуальний кодекс Швейцарії / Code de procédure pénale)",
      fr: "CPP (Code de procédure pénale suisse)",
      en: "CPC (Swiss Criminal Procedure Code)",
    },
    description: {
      uk: "Регулює порядок кримінального переслідування, права потерпілих, збір доказів та арешт активів.",
      fr: "Régit les compétences des procureurs, les droits des victimes et les mesures de contrainte.",
      en: "Governs criminal investigations, victim procedural rights, and asset freezes.",
    },
    details: {
      uk: "Ключові статті у справі: ст. 115 (Статус потерпілого), ст. 118 (Цивільний позивач), ст. 263 (Арешт активів / Секвестр CHF 46'850), ст. 318 (Завершення попереднього розслідування), ст. 393 (Кримінальна скарга на постанови прокурора), ст. 396 (Присічний строк оскарження 10 днів).",
      fr: "Articles clés : Art. 115 (Qualité de victime), Art. 118 (Partie plaignante au pénal et civil), Art. 263 (Séquestre conservatoire CHF 46'850), Art. 318 (Clôture d'instruction), Art. 393 (Recours pénal), Art. 396 (Délai de recours strict de 10 jours).",
      en: "Key articles: Art. 115 (Victim status), Art. 118 (Complainant standing), Art. 263 (Conservatory asset freeze), Art. 318 (Closing of investigation), Art. 393 (Criminal appeal).",
    },
    legalBasis: "RS 312.0",
    badge: "Procédure Pénale",
  },
  {
    term: "CC (Code civil suisse)",
    category: "code",
    title: {
      uk: "ЦК (Цивільний кодекс Швейцарії / Code civil suisse)",
      fr: "CC (Code civil suisse)",
      en: "SCC (Swiss Civil Code)",
    },
    description: {
      uk: "Цивільне право Швейцарії, права власності та захист добросовісних третіх осіб.",
      fr: "Régit le droit des personnes, de la famille, des successions et des droits réels.",
      en: "Governs civil rights, property ownership, and good faith protection.",
    },
    details: {
      uk: "Стаття 933 ЦК надає абсолютний правовий щит добросовісному набувачеві та особі, яка діяла безкорисливо з гуманітарних мотивів (зокрема Адріано Міллі, Інваріант L-03).",
      fr: "L'Art. 933 CC confère une protection absolue au tiers de bonne foi ayant agi sans intention frauduleuse (Bouclier Adriano Milli, Invariant L-03).",
      en: "Art. 933 CC grants absolute statutory protection to bona fide third parties acting without fraudulent intent (Adriano Milli Shield, Invariant L-03).",
    },
    legalBasis: "RS 210",
    badge: "Droit Civil",
  },
  {
    term: "CO (Code des obligations)",
    category: "code",
    title: {
      uk: "ЗК (Швейцарський зобов'язальний кодекс / Code des obligations)",
      fr: "CO (Code des obligations suisse)",
      en: "SCO (Swiss Code of Obligations)",
    },
    description: {
      uk: "Регулює договори, делікти, відшкодування майнової та моральної шкоди.",
      fr: "Régit le droit des contrats, la responsabilité civile et la réparation du dommage.",
      en: "Governs contract law, torts, and civil compensation.",
    },
    details: {
      uk: "Стаття 41 ЗК — цивільна відповідальність за заподіяння протиправної шкоди (витрати на заміну замка CHF 850, вибуття $15'000 USD). Стаття 49 ЗК — компенсація моральної шкоди (Tort moral) у розмірі CHF 32'500 за перенесені психологічні знущання та погрози розправою.",
      fr: "Art. 41 CO (Responsabilité délictuelle pour acte illicite : serrure CHF 850, restitution $15'000 USD). Art. 49 CO (Réparation du tort moral de CHF 32'500 pour harcèlement, menaces de mort et stress post-traumatique).",
      en: "Art. 41 CO (Tortious damages: broken lock CHF 850, restitution $15,000 USD). Art. 49 CO (Moral tort compensation of CHF 32,500 for severe psychological distress and death threats).",
    },
    legalBasis: "RS 220",
    badge: "Obligations & Tort",
  },
  {
    term: "ATF 146 IV 9",
    category: "statute",
    title: {
      uk: "Прецедент Верховного суду Швейцарії ATF 146 IV 9",
      fr: "Jurisprudence du Tribunal fédéral ATF 146 IV 9",
      en: "Swiss Federal Supreme Court Precedent ATF 146 IV 9",
    },
    description: {
      uk: "Основоположне судове рішення щодо повної допустимості прихованих аудіозаписів.",
      fr: "Arrêt fondamental consacrant l'exploitabilité d'enregistrements audio non autorisés.",
      en: "Landmark ruling establishing the admissibility of unauthorized covert audio recordings.",
    },
    details: {
      uk: "Федеральний верховний суд встановив, що таємні аудіозаписи потерпілого є повністю допустимими як докази в суді (ст. 139, 141 КПК), якщо вони здійснені для захисту життя та здоров'я від тяжких погроз насильством (ст. 180, 181 КК), оскільки публічний інтерес у розкритті злочину переважає приватний інтерес обвинуваченого.",
      fr: "Le Tribunal fédéral a jugé que les enregistrements clandestins réalisés par la victime sont pleinement recevables (Art. 139 et 141 al. 2 CPP) lorsque l'intérêt prépondérant à la manifestation de la vérité face à des menaces graves (Art. 180, 181 CP) l'emporte sur la sphère privée de l'auteur.",
      en: "The Federal Tribunal held that unauthorized audio recordings made by victims are admissible when prosecuting severe violent offenses (Art. 180, 181 CP), as the public interest in justice outweighs the offender's privacy.",
    },
    badge: "Jurisprudence Clé",
  },
  {
    term: "LLCA (Loi sur les avocats)",
    category: "statute",
    title: {
      uk: "Закон Швейцарії про вільне пересування адвокатів (LLCA)",
      fr: "Loi fédérale sur la libre circulation des avocats (LLCA)",
      en: "Swiss Federal Act on the Free Movement of Lawyers (BGFA / LLCA)",
    },
    description: {
      uk: "Встановлює професійні стандарти та абсолютну адвокатську таємницю.",
      fr: "Fixe les obligations professionnelles et le secret absolu de l'avocat.",
      en: "Governs advocate professional conduct and absolute legal privilege.",
    },
    details: {
      uk: "Стаття 13 LLCA гарантує абсолютний адвокатський імунітет та заборону розкриття конфіденційної інформації клієнта. Будь-які чернетки та замітки в B-SDD захищені цим статусом.",
      fr: "L'Art. 13 LLCA garantit le secret professionnel absolu et imprescriptible de l'avocat pour tous les documents de travail et notes de plaidoirie.",
      en: "Art. 13 LLCA protects absolute attorney-client privilege over all case drafts, notes, and communications.",
    },
    legalBasis: "RS 935.61",
    badge: "Secret Professionnel",
  },
  {
    term: "L-01 (WORM Bitemporal)",
    category: "invariant",
    title: {
      uk: "Інваріант L-01 · Незмінний бітемпоральний WORM журнал",
      fr: "Invariant L-01 · Registre WORM Bitemporel",
      en: "Invariant L-01 · WORM Bitemporal Ledger",
    },
    description: {
      uk: "Принцип незнищенності судових даних: жоден запис ніколи не перезаписується.",
      fr: "Principe d'immutabilité absolue : zéro écrasement destructif des données judiciaires.",
      en: "Immutable ledger principle: zero destructive overwrites; complete temporal audit trail.",
    },
    details: {
      uk: "Будь-яка зміна в досьє оформлюється як суперсесія: попередній запис закривається поточною міткою часу (valid_to = now), а новий запис вноситься з міткою (valid_from = now, valid_to = 9999-12-31). Усі записи підписуються хешем SHA-256.",
      fr: "Toute modification est une supersession atomique : l'ancienne version est archivée avec valid_to = now, et la nouvelle insérée avec valid_to = 9999-12-31, scellée par hachage SHA-256.",
      en: "Every update is an atomic supersession with valid_from/valid_to timestamps, cryptographically sealed with SHA-256.",
    },
    badge: "Architecture B-SDD",
  },
  {
    term: "L-03 (Adriano Milli Shield)",
    category: "invariant",
    title: {
      uk: "Інваріант L-03 · Щит добросовісності Адріано Міллі",
      fr: "Invariant L-03 · Bouclier d'Immunité Adriano Milli",
      en: "Invariant L-03 · Adriano Milli Good Faith Shield",
    },
    description: {
      uk: "Повний правовий та процесуальний імунітет добросовісного волонтера/помічника.",
      fr: "Immunité pénale et civile absolue accordée au tiers de bonne foi bénévole.",
      en: "Total civil and criminal immunity for bona fide humanitarian third party.",
    },
    details: {
      uk: "Адріано Міллі діяв виключно з гуманітарних міркувань добросовісності (ст. 933 ЦК) і має статус незацікавленого свідка (ст. 105 ч. 2 КПК). Будь-які спроби обвинувачених перекласти на нього провину категорично блокуються як завідомо неправдивий донос.",
      fr: "Adriano Milli a agi exclusivement par bienveillance humanitaire (Art. 933 CC) avec le statut de tiers désintéressé (Art. 105 al. 2 CPP). Toute tentative d'imputation est irrecevable de plein droit.",
      en: "Adriano Milli acted purely out of benevolence under Art. 933 CC and Art. 105 para 2 CPC; all defamatory accusations against him are legally barred.",
    },
    badge: "Bouclier Légal",
  },
  {
    term: "L-04 (Arsen Kovalenko Status)",
    category: "invariant",
    title: {
      uk: "Інваріант L-04 · Фіксація повноліття та статусу потерпілого Арсена Коваленка",
      fr: "Invariant L-04 · Fixation du Statut d'Adulte d'Arsen Kovalenko",
      en: "Invariant L-04 · Adult Standing Verification of Arsen Kovalenko",
    },
    description: {
      uk: "Спростування застарілих записів: Арсен є повнолітнім громадянином 26 років.",
      fr: "Purge définitive des mentions erronées de minorité : victime adulte née le 05.11.1999.",
      en: "Correction of obsolete minority mentions: adult victim born on 05.11.1999.",
    },
    details: {
      uk: "Арсен Коваленко народився 05.11.1999 (26 років), є повністю дієздатним повнолітнім потерпілим і законно визнаним цивільним позивачем (ст. 115, 118, 122 КПК).",
      fr: "Né le 05.11.1999, âgé de 26 ans, pleinement capable de discernement, constitué partie plaignante pénale et civile.",
      en: "Born on 05.11.1999, age 26, fully capable of civil discernment, formally constituted victim and civil party.",
    },
    badge: "Statut Civil",
  },
  {
    term: "L-05 (Forensic Seals)",
    category: "invariant",
    title: {
      uk: "Інваріант L-05 · Цифрова криміналістика та сертифікація за ISO/IEC 27037",
      fr: "Invariant L-05 · Preuves Numériques & Scellements ISO/IEC 27037",
      en: "Invariant L-05 · Digital Forensics & ISO/IEC 27037 Certification",
    },
    description: {
      uk: "Незмінна фіксація кожного доказу криптографічним хешем SHA-256.",
      fr: "Traçabilité intégrale et hachage cryptographique SHA-256 de chaque pièce.",
      en: "Full cryptographic integrity and SHA-256 hashing conforming to ISO/IEC 27037.",
    },
    details: {
      uk: "Усі аудіофайли, фотографії EXIF, банківські виписки та протоколи поліції мають незмінний хеш SHA-256. Будь-яка зміна навіть 1 байта призводить до неспівпадіння хешу та фіксації підробки.",
      fr: "Toutes les pièces (audio, photos EXIF, bordereaux bancaires, procès-verbaux) possèdent une empreinte SHA-256 immuable garantissant leur authenticité judiciaire.",
      en: "Every piece of evidence possesses an immutable SHA-256 digital fingerprint, establishing chain of custody under Swiss federal court standards.",
    },
    badge: "Intégrité SHA-256",
  },
  {
    term: "ED10 (Édition 10)",
    category: "procedure",
    title: {
      uk: "ED10 · 10-та фінальна редакція матеріалів справи (Судова книга з 18 розділів)",
      fr: "ED10 · Édition 10 Définitive du Dossier Pénal (18 Chapitres)",
      en: "ED10 · 10th Definitive Edition of Criminal Casebook (18 Chapters)",
    },
    description: {
      uk: "Офіційно узгоджена та структурована судова книга адвоката для передачі прокурору.",
      fr: "Recueil officiel structuré des pièces et conclusions destiné au Ministère public.",
      en: "Official structured dossier comprising 18 chapters submitted to the public prosecutor.",
    },
    details: {
      uk: "Містить 18 розділів: від аналізу сторін та процесуальних строків до розрахунку цивільного позову на CHF 46'850 і вимоги про передачу справи до кримінального суду.",
      fr: "Comprend les 18 chapitres vérifiés : analyse des prévenues, réfutation de l'alibi de Renens, quantification du séquestre bancaire et réquisition de renvoi en jugement.",
      en: "Contains 18 verified chapters covering defendant analysis, Renens assault refutation, bank freeze petition, and indictment requests.",
    },
    badge: "Livre Judiciaire",
  },
  {
    term: "P-01...P-61 (Cotes de Pièces)",
    category: "procedure",
    title: {
      uk: "Шифри судових доказів P-01 ... P-61 (Bordereau de pièces)",
      fr: "Cotes Officielles des Pièces Judiciaires P-01 à P-61",
      en: "Official Evidence Exhibits P-01 through P-61",
    },
    description: {
      uk: "Офіційна індексація документів та речових доказів у кримінальному провадженні Во.",
      fr: "Indexation normalisée des moyens de preuve selon les exigences du Ministère public vaudois.",
      en: "Standardized indexing of procedural exhibits for the Vaud Public Prosecutor's Office.",
    },
    details: {
      uk: "«P» означає Pièce (Доказ). Наприклад: P-01 — аудіозапис погроз смертю, P-05 — виписка переказу $15'000 USD через Wise/SWIFT, P-06 — фотознімок EXIF 1481 з Лозанни (алібі), P-10 — фото зламаного замка на CHF 850.",
      fr: "« P » désigne une Pièce au bordereau. Ex: P-01 (Audio menaces de mort), P-05 (Virements SWIFT $15'000 USD), P-06 (Cliché EXIF 1481 à Lausanne pour alibi), P-10 (Serrure fracturée CHF 850).",
      en: "« P » stands for Procedural Exhibit (Pièce). E.g., P-01 (Death threats audio), P-05 (Wise SWIFT $15,000 USD wire), P-06 (EXIF 1481 Lausanne alibi photo).",
    },
    badge: "Bordereau Officiel",
  },
  {
    term: "EXIF 1481",
    category: "procedure",
    title: {
      uk: "EXIF 1481 · Фотографічний доказ об'єктивного алібі у Лозанні",
      fr: "EXIF 1481 · Cliché de l'Alibi Objectif à Lausanne",
      en: "EXIF 1481 · Objective Lausanne Alibi Photograph",
    },
    description: {
      uk: "Знімок iPhone 14 Pro, що спростовує наклепницькі звинувачення у нападі в Рене.",
      fr: "Cliché iPhone 14 Pro réfutant formellement l'agression alléguée à Renens.",
      en: "iPhone 14 Pro photo conclusively proving physical presence in Lausanne, disproving false Renens accusation.",
    },
    details: {
      uk: "Час зйомки: 21.07.2024 о 13:45:12 CEST. Координати GPS: 46.5197° N, 6.6323° E (Площа Палю, центр Лозанни). Спектральний аналіз RGB підтверджує повну відсутність будь-яких ушкоджень або подряпин на руках Арсена.",
      fr: "Horodatage certifié : 21.07.2024 à 13:45:12 CEST. GPS : 46.5197° N, 6.6323° E (Lausanne). L'analyse spectrale RGB prouve l'absence totale de contusions sur les avant-bras.",
      en: "Certified metadata: 21.07.2024 at 13:45:12 CEST. GPS: 46.5197° N, 6.6323° E (Lausanne). RGB spectral analysis confirms pristine forearms with zero contusions.",
    },
    badge: "Alibi Numérique",
  },
  {
    term: "SPOP (Service de la population)",
    category: "procedure",
    title: {
      uk: "SPOP · Кантональна служба народонаселення та міграції Во",
      fr: "SPOP (Service de la population du Canton de Vaud)",
      en: "SPOP (Population & Migration Service of Canton of Vaud)",
    },
    description: {
      uk: "Швейцарський міграційний орган, яким зловмисники залякували потерпілого.",
      fr: "Autorité cantonale des migrations vaudoise instrumentalisée dans le chantage.",
      en: "Cantonal migration service weaponized by defendants in coercion scheme.",
    },
    details: {
      uk: "Обвинувачені погрожували написати до SPOP неправдивий донос для скасування статусу захисту S та депортації потерпілого в Україну, що кваліфіковано як протиправний примус (ст. 181 КК) та шантаж (ст. 156 КК).",
      fr: "Les prévenues ont menacé de dénoncer faussement la victime au SPOP pour provoquer la révocation de son statut S, constituant l'infraction de contrainte (Art. 181 CP).",
      en: "Defendants threatened to file malicious reports with SPOP to revoke the victim's S-protection permit, constituting statutory coercion under Art. 181 CP.",
    },
    badge: "Autorité Migratoire",
  },
  {
    term: "KùzuDB / MemPalace",
    category: "system",
    title: {
      uk: "KùzuDB & MemPalace · Графова база причинно-наслідкових зв'язків",
      fr: "KùzuDB & MemPalace · Moteur Graphique de Causalité Juridique",
      en: "KùzuDB & MemPalace · Legal Causality Graph Engine",
    },
    description: {
      uk: "Внутрішній граф зв'язків: 8'746 ребер та 412 юридичних вузлів досьє.",
      fr: "Graphe de connaissances judiciaires : 8'746 relations et 412 entités.",
      en: "Knowledge graph connecting 8,746 evidentiary relations across 412 procedural nodes.",
    },
    details: {
      uk: "Аналізує радіус ураження («Blast Radius»): коли адвокат вносить нову правку або додає доказ, система перераховує ланцюг причинності та вказує, які статті Кримінального кодексу та які розділи судової книги це підкріплює.",
      fr: "Calcule le rayon d'impact d'un élément de preuve sur les chefs de prévention et assure la cohérence logique entre les 18 chapitres et le WORM Ledger.",
      en: "Computes blast radius across the 18 chapters and updates causal legal links whenever new evidence is committed to the WORM ledger.",
    },
    badge: "Graphe Sémantique",
  },
];

export const LegalGlossaryModal: React.FC<LegalGlossaryModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  if (!isOpen) return null;

  const categories = [
    { id: "all", label: currentLang === "uk" ? "Всі терміни" : currentLang === "fr" ? "Tous" : "All" },
    { id: "code", label: currentLang === "uk" ? "Кодекси (CP, CPP, CC)" : currentLang === "fr" ? "Codes (CP, CPP, CC)" : "Codes" },
    { id: "statute", label: currentLang === "uk" ? "Прецеденти & Закони" : currentLang === "fr" ? "Jurisprudence & Lois" : "Precedents & Laws" },
    { id: "invariant", label: currentLang === "uk" ? "Інваріанти L-01..05" : currentLang === "fr" ? "Invariants L-01..05" : "Invariants" },
    { id: "procedure", label: currentLang === "uk" ? "Докази & Процедура" : currentLang === "fr" ? "Preuves & Procédure" : "Evidence & Procedure" },
    { id: "system", label: currentLang === "uk" ? "Системні терміни" : currentLang === "fr" ? "Architecture" : "System" },
  ];

  const filtered = GLOSSARY_ENTRIES.filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const q = search.toLowerCase();
    const matchesQuery =
      item.term.toLowerCase().includes(q) ||
      (item.title[currentLang] || "").toLowerCase().includes(q) ||
      (item.description[currentLang] || "").toLowerCase().includes(q) ||
      (item.details[currentLang] || "").toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-[#0B1120] border border-blue-500/50 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0F172A] border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-sans">
                {currentLang === "uk"
                  ? "Юридичний Довідник & Розшифровка Абревіатур"
                  : currentLang === "fr"
                  ? "Glossaire Juridique & Décodage des Normes"
                  : "Legal Glossary & Statutory Code Reference"}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {currentLang === "uk"
                  ? "Швейцарське кримінальне право (CPP / CP / CC / CO) та інваріанти B-SDD"
                  : "Droit pénal suisse vaudois, ATF 146 IV 9 et invariants bitemporels"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-[#0A0E1A] border-b border-slate-800/80 p-3 space-y-2 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                currentLang === "uk"
                  ? "Пошук скорочень: CP, CPP, CC, ATF, L-01, P-06, SPOP..."
                  : "Rechercher une abréviation ou norme : CP, CPP, CC, ATF, L-01..."
              }
              className="w-full bg-[#070B12] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                  activeCategory === cat.id
                    ? "bg-blue-600 text-white font-bold shadow-sm"
                    : "bg-[#070B12] text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Glossary Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs font-mono">
              {currentLang === "uk"
                ? "За вашим запитом нічого не знайдено. Спробуйте змінити фільтр або пошукове слово."
                : "Aucune entrée trouvée pour cette recherche."}
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.term}
                className="bg-[#070B12] border border-slate-800/90 rounded-lg p-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                      {item.term}
                    </span>
                    {item.badge && (
                      <span className="font-mono text-[10px] text-blue-300 bg-blue-950/60 border border-blue-800/40 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                    {item.legalBasis && (
                      <span className="font-mono text-[10px] text-slate-500">
                        {item.legalBasis}
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-200 font-sans mb-1">
                  {item.title[currentLang] || item.title["uk"]}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed font-sans mb-2">
                  {item.description[currentLang] || item.description["uk"]}
                </p>

                <div className="bg-[#0B1120] border-l-2 border-amber-500/70 p-2 rounded text-[11px] text-slate-400 font-sans leading-relaxed">
                  <strong className="text-slate-200 font-mono block text-[10px] uppercase mb-0.5">
                    {currentLang === "uk"
                      ? "Юридичне значення для справи PE24.014624-SBA :"
                      : "Portée procédurale dans le dossier :"}
                  </strong>
                  {item.details[currentLang] || item.details["uk"]}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0F172A] border-t border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0 text-xs font-mono text-slate-400">
          <span>{filtered.length} {currentLang === "uk" ? "термінів знайдено" : "entrées répertoriées"}</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-sans font-medium"
          >
            {currentLang === "uk" ? "Зрозуміло / Закрити" : "Fermer"}
          </button>
        </div>
      </div>
    </div>
  );
};
