import React, { useState } from "react";
import { BookOpen, X, Search, ShieldCheck, Scale, Database, Clock, Copy, Check, ExternalLink } from "lucide-react";
import { SupportedLanguage } from "../types/i18n";

interface GlossaryTerm {
  acronym: string;
  fullTitle: Record<SupportedLanguage, string>;
  category: "penal" | "procedure" | "civil" | "bitemporal" | "institutional";
  definition: Record<SupportedLanguage, string>;
  articles: string[];
  relevance: Record<SupportedLanguage, string>;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    acronym: "КПК / CPP",
    fullTitle: {
      uk: "Кримінальний процесуальний кодекс Швейцарії (Code de procédure pénale suisse)",
      fr: "Code de procédure pénale suisse (CPP)",
      en: "Swiss Criminal Procedure Code (CPC)",
    },
    category: "procedure",
    articles: ["Art. 115", "Art. 118", "Art. 139", "Art. 263", "Art. 318", "Art. 393"],
    definition: {
      uk: "Головний нормативно-правовий акт, що регулює порядок порушення, розслідування та судового розгляду кримінальних справ у Швейцарії. Визначає статус потерпілого та цивільного позивача (ст. 115, 118), допустимість доказів (ст. 139), арешт активів (ст. 263) та право подання клопотань про додаткові слідчі дії (ст. 318).",
      fr: "Législation fédérale régissant la poursuite et le jugement des infractions pénales en Suisse. Définit la qualité de partie plaignante (Art. 115, 118 CPP), la recevabilité des preuves (Art. 139 CPP), le séquestre conservatoire (Art. 263 CPP) et les réquisitions de preuves (Art. 318 CPP).",
      en: "Federal legislation governing criminal investigations and trials across Switzerland. Establishes private complainant standing (Art. 115, 118), admissibility (Art. 139), asset freezing (Art. 263), and supplemental evidence requests (Art. 318).",
    },
    relevance: {
      uk: "Гарантує Арсену Коваленку повні процесуальні права сторони звинувачення та право вимагати негайного арешту $15'000 USD.",
      fr: "Garantit à Arsen Kovalenko le statut de partie plaignante pénale et demandeur civil au pénal.",
      en: "Secures victim status and direct asset freeze rights for Arsen Kovalenko.",
    },
  },
  {
    acronym: "КК / CP",
    fullTitle: {
      uk: "Кримінальний кодекс Швейцарії (Code pénal suisse)",
      fr: "Code pénal suisse (CP)",
      en: "Swiss Criminal Code (SCC)",
    },
    category: "penal",
    articles: ["Art. 123", "Art. 126", "Art. 138", "Art. 146", "Art. 157", "Art. 180", "Art. 181", "Art. 186", "Art. 303"],
    definition: {
      uk: "Матеріальний кримінальний закон Швейцарії, що визначає склади злочинів та санкції. У справі інкримінуються: шахрайство (ст. 146), погрози розправою (ст. 180), примус (ст. 181), порушення недоторканності житла (ст. 186) та завідомо неправдивий донос (ст. 303).",
      fr: "Droit pénal matériel fédéral définissant les infractions et leurs peines : escroquerie (Art. 146), menaces graves (Art. 180), contrainte (Art. 181), violation de domicile (Art. 186) et dénonciation calomnieuse (Art. 303).",
      en: "Federal substantive penal code: fraud (Art. 146), grave threats (Art. 180), coercion (Art. 181), trespassing (Art. 186), and false deposition (Art. 303).",
    },
    relevance: {
      uk: "Формує базу обвинувального висновку та визначає покарання до 5 років позбавлення волі.",
      fr: "Fonde la mise en accusation et les réquisitions pénales jusqu'à 5 ans de détention.",
      en: "Provides substantive criminal charges and grounds for incarceration.",
    },
  },
  {
    acronym: "ЦК / CC (ст. 933)",
    fullTitle: {
      uk: "Цивільний кодекс Швейцарії (ст. 933 CC) · Щит добросовісної третьої сторони",
      fr: "Code civil suisse (Art. 933 CC) · Bouclier du tiers de bonne foi",
      en: "Swiss Civil Code (Art. 933 CC) · Bona Fide Third Party Shield",
    },
    category: "civil",
    articles: ["Art. 933 CC", "Art. 3 al. 1 CC", "Art. 105 al. 2 CPP"],
    definition: {
      uk: "Фундаментальна норма цивільного захисту особи, яка діяла у повній добросовісності. Закон захищає набувача чи посередника від будь-яких позовів, конфіскацій або звинувачень, якщо він добросовісно вважав свої дії законними. Архітектурний Інваріант L-03 забезпечує повний імунітет Адріано Міллі.",
      fr: "Principe protecteur fondamental garantissant la sécurité juridique du tiers ayant agi de bonne foi. Interdit toute mesure d'exécution, séquestre ou poursuite pénale contre la personne protégée (Adriano Milli, Invariant L-03).",
      en: "Statutory protection for innocent third parties acting in good faith. Complete bar against prosecution or seizure regarding Adriano Milli (Invariant L-03).",
    },
    relevance: {
      uk: "Абсолютний імунітет волонтера Адріано Міллі: будь-які звинувачення з боку захисту відхиляються d'office (за посадою).",
      fr: "Protection absolue accordée à Adriano Milli : forclusion de plein droit de toute mise en cause.",
      en: "Absolute legal immunity for Adriano Milli.",
    },
  },
  {
    acronym: "CO",
    fullTitle: {
      uk: "Швейцарське зобов'язальне право (Code des obligations suisse)",
      fr: "Code des obligations suisse (CO)",
      en: "Swiss Code of Obligations (CO)",
    },
    category: "civil",
    articles: ["Art. 41 CO", "Art. 49 CO", "Art. 122 CPP"],
    definition: {
      uk: "Частина п'ята Цивільного кодексу Швейцарії, що регламентує договірні зобов'язання, делікти та відшкодування шкоди. Зокрема, ст. 41 регулює відповідальність за заподіяну майнову шкоду, а ст. 49 CO — відшкодування моральної шкоди (моральна компенсація за приниження та залякування).",
      fr: "Législation fédérale sur les contrats et la responsabilité civile délictuelle. L'Art. 41 régit la réparation du dommage matériel, et l'Art. 49 CO fonde la réparation du tort moral suite à l'atteinte illicite à la personnalité.",
      en: "Swiss federal law on contracts and tort liability. Art. 41 governs property loss, and Art. 49 CO provides restitution for non-pecuniary moral suffering.",
    },
    relevance: {
      uk: "Підстава для присудження компенсації моральної шкоди (CHF 32'500.00) на користь Арсена Коваленка.",
      fr: "Fondement de l'indemnisation du tort moral de CHF 32'500.00 et restitution des $15'000 USD.",
      en: "Statutory claim basis for moral injury damages of CHF 32,500.00.",
    },
  },
  {
    acronym: "ATF 146 IV 9",
    fullTitle: {
      uk: "Прецедент Федерального суду Швейцарії ATF 146 IV 9 · Допустимість аудіодоказів",
      fr: "Jurisprudence du Tribunal fédéral ATF 146 IV 9 · Recevabilité des enregistrements",
      en: "Federal Supreme Court Leading Precedent ATF 146 IV 9 · Audio Admissibility",
    },
    category: "procedure",
    articles: ["Art. 139 al. 1 CPP", "Art. 140 al. 2 CPP", "Art. 141 al. 2 CPP"],
    definition: {
      uk: "Ключове судове рішення Федерального верховного суду Швейцарії, що встановлює стандарт зважування інтересів (pesée des intérêts). Негласні аудіозаписи потерпілого визнаються повністю допустимими як докази в суді, якщо вони фіксують тяжкі правопорушення (шахрайство, погрози вбивством, примус) або коли потерпілий перебував у стані вимушеної самооборони для запобігання злочину.",
      fr: "Arrêt de principe fixant le régime de la pesée des intérêts : les enregistrements clandestins effectués par la victime sont pleinement exploitables s'ils révèlent des infractions graves (escroquerie, menaces de mort) et visent la préservation légitime de ses droits.",
      en: "Landmark Federal Supreme Court decision ruling that unconsented victim recordings are fully admissible when documenting serious offenses (extortion, fraud, death threats) under proportionality balance.",
    },
    relevance: {
      uk: "Забезпечує 100% процесуальну допустимість усіх 14 аудіозаписів та розшифровок у справі Арсена Коваленка.",
      fr: "Rend l'intégralité des enregistrements audio (P-01..P-14) exploitables au fond par le juge pénal.",
      en: "Validates all 14 audio exhibits as admissible court evidence.",
    },
  },
  {
    acronym: "VT / TT",
    fullTitle: {
      uk: "Valid Time ($T_v$) та Transaction Time ($T_t$) · Бітемпоральна модель B-SDD",
      fr: "Temps Valide ($T_v$) et Temps de Transaction ($T_t$) · Modèle Bitemporel B-SDD",
      en: "Valid Time ($T_v$) & Transaction Time ($T_t$) · Bitemporal B-SDD Model",
    },
    category: "bitemporal",
    articles: ["ADR-001", "ISO/IEC 27037", "WORM Ledger"],
    definition: {
      uk: "Двовимірна модель обліку юридичних фактів: $T_v$ (Valid Time) — точний момент, коли подія реально відбулася у фізичному світі; $T_t$ (Transaction Time) — точна дата й час, коли цей доказ був внесений до матеріалів кримінальної справи прокуратурою. Дозволяє миттєво виявляти спроби фальсифікацій та задніх правок.",
      fr: "Modèle bitemporel distinguant le moment exact où le fait s'est produit dans le monde réel ($T_v$) et le moment où il a été consigné dans la procédure ($T_t$). Préserve la chronologie contre toute manipulation a posteriori.",
      en: "Dual-temporal framework isolating real-world event occurrences ($T_v$) from procedural record entry timestamps ($T_t$), structurally eliminating retroactive record alteration.",
    },
    relevance: {
      uk: "Доводить алібі Арсена Коваленка (21.07.2024, 13:45 $T_v$ у Лозанні) та спростовує заяви поліції Рене ($T_t$ 22.07.2024).",
      fr: "Démontre mathématiquement l'alibi objectif et détruit les allégations tardives de la prévenue.",
      en: "Mathematically proves objective alibi in Lausanne.",
    },
  },
  {
    acronym: "WORM",
    fullTitle: {
      uk: "Write Once Read Many · Криптографічний незмінний реєстр",
      fr: "Write Once Read Many · Registre cryptographique immuable",
      en: "Write Once Read Many · Cryptographic Immutable Ledger",
    },
    category: "bitemporal",
    articles: ["SHA-256", "Invariant L-01", "ADR-008"],
    definition: {
      uk: "Криптографічний принцип зберігання даних, за якого кожен запис або доказ хешується за алгоритмом SHA-256 і більше ніколи не може бути змінений або перезаписаний. Будь-яке оновлення зберігається як нова версія з посиланням на попередній хеш (ланцюг блоків суперсесій).",
      fr: "Principe cryptographique assurant l'intégrité absolue : chaque acte est scellé par son empreinte SHA-256. Toute modification produit une nouvelle version supersédée sans écraser l'historique d'origine.",
      en: "Cryptographic standard guaranteeing zero tampering: each exhibit is permanently sealed via SHA-256 hashing.",
    },
    relevance: {
      uk: "Захищає 2'405 файлів доказів та 18 розділів судового досьє від фальсифікацій чи видалень.",
      fr: "Protège l'intégrité probatoire des 18 chapitres et pièces versées au dossier cantonal.",
      en: "Protects evidence from deletion or malicious retroactive modification.",
    },
  },
  {
    acronym: "SPOP",
    fullTitle: {
      uk: "Служба народонаселення та міграції кантону Во (Service de la population Vaud)",
      fr: "Service de la population du Canton de Vaud (SPOP)",
      en: "Vaud Cantonal Population & Migration Office (SPOP)",
    },
    category: "institutional",
    articles: ["Art. 118 LEI", "Statut S", "Directive DFJP"],
    definition: {
      uk: "Кантональний орган державної влади Швейцарії у Лозанні, відповідальний за видачу дозволів на проживання, реєстрацію іноземців та адміністрування захисного статусу S для біженців з України. Обвинувачена використовувала фальшиві заяви до SPOP як знаряддя шантажу (ст. 181 КК, ст. 118 LEI).",
      fr: "Autorité cantonale vaudoise compétente pour la délivrance des permis de séjour et l'octroi du statut de protection S. Les menaces répétées de dénonciation au SPOP constituent une contrainte illicite (Art. 181 CP).",
      en: "Vaud cantonal authority overseeing residence permits and temporary protection status S. False reports to SPOP constituted illegal coercion.",
    },
    relevance: {
      uk: "Доводить шантаж і зловживання уразливим становищем біженця (ст. 157 КК та ст. 118 LEI).",
      fr: "Constitue le support matériel du chantage à l'expulsion commis contre Arsen Kovalenko.",
      en: "Central to coercion and migration exploitation charges.",
    },
  },
  {
    acronym: "ISO/IEC 27037",
    fullTitle: {
      uk: "Міжнародний стандарт криміналістичної фіксації цифрових доказів",
      fr: "Norme internationale de saisie et préservation des preuves numériques ISO/IEC 27037",
      en: "ISO/IEC 27037 Guidelines for Identification, Collection, Acquisition and Preservation of Digital Evidence",
    },
    category: "procedure",
    articles: ["ISO/IEC 27037:2012", "Art. 139 CPP"],
    definition: {
      uk: "Світовий судово-криміналістичний стандарт, що визначає правила належного вилучення, зняття хеш-сум (SHA-256), фіксації метаданих EXIF та забезпечення безперервності ланцюга зберігання (Chain of Custody) для фото-, аудіо- та електронних доказів.",
      fr: "Standard international encadrant la traçabilité des preuves numériques, la vérification des hachages SHA-256 et la chaîne de conservation médico-légale.",
      en: "International forensic standard establishing rigorous requirements for digital evidence extraction, EXIF verification, and SHA-256 hash preservation.",
    },
    relevance: {
      uk: "Надає фотознімкам EXIF 1481 (P-06, P-06-BIS) та медичному сертифікату Unisanté (P-03) статус неспростовних доказів.",
      fr: "Certifie la force probante absolue des photos EXIF 1481 et des rapports d'expertise.",
      en: "Confirms forensic integrity of photos P-06, P-06-BIS, and P-03.",
    },
  },
];

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
  initialTab?: "acronyms" | "user_guide" | "dev_guide";
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose, currentLang, initialTab = "acronyms" }) => {
  const [activeTab, setActiveTab] = useState<"acronyms" | "user_guide" | "dev_guide">(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTerms = GLOSSARY_TERMS.filter((term) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      term.acronym.toLowerCase().includes(q) ||
      term.fullTitle[currentLang].toLowerCase().includes(q) ||
      term.definition[currentLang].toLowerCase().includes(q) ||
      term.articles.some((a) => a.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === "all" || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (text: string, acronym: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTerm(acronym);
    setTimeout(() => setCopiedTerm(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-[#0B1120] border border-blue-600/40 rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="bg-[#080E1B] border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-blue-600/20 border border-blue-500/40 rounded-lg text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>
                  {currentLang === "uk"
                    ? "Словник юридичних термінів & Абревіатур Швейцарії"
                    : currentLang === "fr"
                    ? "Glossaire Juridique & Décodeur d'Acronymes Suisses"
                    : "Swiss Legal Glossary & Acronyms Decoder"}
                </span>
                <span className="text-[10px] font-mono bg-blue-950/80 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded-full">
                  Canton de Vaud · B-SDD
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {currentLang === "uk"
                  ? "Офіційна розшифровка нормативних актів, прецедентів та криміналістичних понять"
                  : currentLang === "fr"
                  ? "Définitions officielles des normes pénales, jurisprudences et standards forensiques"
                  : "Official statutory definitions, case precedents, and forensic standards"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB BAR (Acronyms | User Guide | Developer Guide) */}
        <div className="flex border-b border-slate-800 bg-[#070B14] px-4 gap-1 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab("acronyms")}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "acronyms"
                ? "border-blue-500 text-blue-400 font-bold bg-blue-950/30"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scale className="w-4 h-4 text-amber-400" />
            <span>
              {currentLang === "uk"
                ? "⚖️ Абревіатури та Норми"
                : currentLang === "fr"
                ? "⚖️ Acronymes & Normes"
                : "⚖️ Acronyms & Norms"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("user_guide")}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "user_guide"
                ? "border-blue-500 text-blue-400 font-bold bg-blue-950/30"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>
              {currentLang === "uk"
                ? "📘 Посібник Користувача (User Guide)"
                : currentLang === "fr"
                ? "📘 Guide Utilisateur (Avocat)"
                : "📘 User Guide (Advocate)"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("dev_guide")}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "dev_guide"
                ? "border-blue-500 text-blue-400 font-bold bg-blue-950/30"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-4 h-4 text-purple-400" />
            <span>
              {currentLang === "uk"
                ? "🛠️ Керівництво Розробника (Dev Guide)"
                : currentLang === "fr"
                ? "🛠️ Guide Développeur & API"
                : "🛠️ Developer & API Guide"}
            </span>
          </button>
        </div>

        {/* TAB 1: ACRONYMS & NORMS */}
        {activeTab === "acronyms" && (
          <>
            {/* SEARCH & CATEGORY BAR */}
            <div className="p-3 bg-[#070B14] border-b border-slate-800/80 flex flex-col sm:flex-row gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    currentLang === "uk"
                      ? "Пошук абревіатури (КПК, CP, ст. 933, ATF 146 IV 9, WORM...)"
                      : currentLang === "fr"
                      ? "Rechercher un terme (CPP, CP, Art. 933, ATF 146 IV 9, WORM...)"
                      : "Search term (CPC, SCC, Art. 933, ATF 146 IV 9, WORM...)"
                  }
                  className="w-full pl-8 pr-3 py-1.5 bg-[#0D1527] border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {[
                  { id: "all", label: currentLang === "uk" ? "Всі" : currentLang === "fr" ? "Tous" : "All" },
                  { id: "procedure", label: currentLang === "uk" ? "Процес (КПК)" : "Procédure" },
                  { id: "penal", label: currentLang === "uk" ? "Кримінальне (КК)" : "Pénal" },
                  { id: "civil", label: currentLang === "uk" ? "Цивільне (CC/CO)" : "Civil" },
                  { id: "bitemporal", label: currentLang === "uk" ? "Бітемпоральні / WORM" : "Bitemporel" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                      selectedCategory === cat.id
                        ? "bg-blue-600 text-white font-semibold"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* GLOSSARY CARDS LIST */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 select-text">
              {filteredTerms.map((term) => (
                <div
                  key={term.acronym}
                  className="bg-[#090E1A] border border-slate-800/90 hover:border-blue-600/40 rounded-lg p-3 sm:p-4 transition-all hover:bg-[#0D1526]/50 group"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800/70 pb-2 mb-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base sm:text-lg font-bold font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]">
                        {term.acronym}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-200">
                        {term.fullTitle[currentLang]}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        handleCopy(
                          `${term.acronym} — ${term.fullTitle[currentLang]}\n${term.definition[currentLang]}`,
                          term.acronym
                        )
                      }
                      className="p-1 text-slate-400 hover:text-blue-400 rounded shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                      title="Скопіювати термін та визначення"
                    >
                      {copiedTerm === term.acronym ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {term.articles.map((art) => (
                      <span
                        key={art}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-blue-300 border border-blue-900/40"
                      >
                        {art}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-2.5">
                    {term.definition[currentLang]}
                  </p>

                  <div className="p-2 bg-blue-950/30 border border-blue-800/40 rounded flex items-start space-x-2 text-[11px] text-blue-200/90 leading-relaxed">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-blue-300 font-semibold mr-1">
                        {currentLang === "uk"
                          ? "Значення у справі :"
                          : currentLang === "fr"
                          ? "Portée au dossier :"
                          : "Case Relevance:"}
                      </strong>
                      <span>{term.relevance[currentLang]}</span>
                    </div>
                  </div>
                </div>
              ))}

              {filteredTerms.length === 0 && (
                <div className="text-center py-10 text-slate-500 font-mono text-xs">
                  {currentLang === "uk"
                    ? "За вашим запитом термінів не знайдено."
                    : "Aucun terme correspondant trouvé."}
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 2: USER GUIDE VIEWER */}
        {activeTab === "user_guide" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 select-text text-slate-200 text-xs sm:text-sm leading-relaxed">
            <div className="bg-[#070B14] border border-emerald-500/30 rounded-xl p-4">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>Керівництво Користувача · B-SDD Legal Advocate Cockpit</span>
              </h3>
              <p className="text-xs text-slate-400">
                Офіційний посібник для адвоката, процесуального аналітика та потерпілої сторони у справі PE24.014624-SBA (Кантон Во / Швейцарія).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-[#090E1A] border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-2">
                  <span>🔐 1. Авторизація та Захист Таємниці</span>
                </h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                  <li>Захисний PIN-код за замовчуванням: <strong className="font-mono text-amber-300">0523</strong>.</li>
                  <li>Кнопка блокування у верхній панелі миттєво ховає матеріали від сторонніх очей.</li>
                  <li>Автоматичне блокування за таймером бездіяльності (15 хвилин).</li>
                </ul>
              </div>

              <div className="p-3.5 bg-[#090E1A] border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-blue-300 flex items-center gap-2">
                  <span>🪄 2. Майстер Додавання Доказів (ШІ)</span>
                </h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                  <li>Кнопка <strong>«+ Доказ (ШІ)»</strong> у верхній панелі.</li>
                  <li>Підтримка посилань Google Docs/Drive, аудіофайлів, світлин з EXIF та стенограм.</li>
                  <li>Автоматична ШІ-кваліфікація за статтями CP, оцінка допустимості за ATF 146 IV 9.</li>
                </ul>
              </div>

              <div className="p-3.5 bg-[#090E1A] border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <span>🤖 3. Вибір ШІ-Провайдера &amp; Проксі</span>
                </h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                  <li><strong>Безкоштовно через ШІ-проксі</strong> на хості <span className="font-mono text-emerald-400">192.168.3.184:18880</span> (слоти Qwen 72B, LLaMA 3.3 70B, Mistral Large).</li>
                  <li><strong>Google Gemini 3.8</strong> (Flash / Pro) для швидкого семантичного аналізу.</li>
                  <li><strong>MemPalace Вбудований</strong> — автономний офлайн-рушій за нормами CP/CPP Vaud.</li>
                </ul>
              </div>

              <div className="p-3.5 bg-[#090E1A] border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-purple-300 flex items-center gap-2">
                  <span>⚖️ 4. База Кодексів &amp; Норм (MemPalace)</span>
                </h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                  <li>Федеральні закони (CP, CPP, CC, CO) та кантональне право Во (LOJV, CDPJ).</li>
                  <li>Вмикання та вимикання статей — прямий вплив на логіку оцінки доказів ШІ.</li>
                  <li>Експорт та імпорт власного нормативного корпусу у форматі JSON.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-[#090E1A] border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>💰 5. Розрахунок Фінансових Вимог та Секвестру (ст. 263 КПК)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Привласнені кошти:</span>
                  <strong className="text-amber-400 text-sm">$15'000.00 USD</strong>
                  <p className="text-[10px] text-slate-500 mt-1 font-sans">ст. 146 CP (шахрайство) / P-04, P-05</p>
                </div>
                <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Прямі збитки (замок):</span>
                  <strong className="text-blue-400 text-sm">CHF 850.00</strong>
                  <p className="text-[10px] text-slate-500 mt-1 font-sans">ст. 186 CP / Доказ P-10 (фото EXIF)</p>
                </div>
                <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Моральна шкода (Tort moral):</span>
                  <strong className="text-emerald-400 text-sm">CHF 15'000.00</strong>
                  <p className="text-[10px] text-slate-500 mt-1 font-sans">ст. 49 CO + 5% річних за терор</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-950/20 border border-blue-800/40 rounded-lg text-xs text-blue-300 flex items-center justify-between">
              <span>Повний оригінал посібника збережено у файлі: <code className="font-mono text-white">/docs/USER_GUIDE.md</code></span>
              <button
                onClick={() => handleCopy("/docs/USER_GUIDE.md", "user_guide_path")}
                className="px-2 py-1 bg-blue-900/60 hover:bg-blue-800 text-white rounded text-[11px] font-mono flex items-center gap-1 shrink-0"
              >
                {copiedTerm === "user_guide_path" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Скопіювати шлях</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: DEVELOPER GUIDE VIEWER */}
        {activeTab === "dev_guide" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 select-text text-slate-200 text-xs sm:text-sm leading-relaxed">
            <div className="bg-[#070B14] border border-purple-500/30 rounded-xl p-4">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-purple-400" />
                <span>Документація Розробника та Інженера · B-SDD Architecture</span>
              </h3>
              <p className="text-xs text-slate-400">
                Архітектура бітемпоральності, 5 інваріантів цілісності, конфігурація MCP шлюзу (:8766), проксі OpenAI (:18880) та збірка.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-[#090E1A] border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-purple-300">
                  📐 1. Математична Модель Бітемпоральності ($T_v$ vs $T_t$)
                </h4>
                <p className="text-xs text-slate-300">
                  Система розрізняє дійсний час події у фізичному світі (<strong className="font-mono text-blue-400">T_v</strong>) від часу офіційного протоколювання чи запису в реєстр (<strong className="font-mono text-emerald-400">T_t</strong>). Будь-яка різниця <span className="font-mono text-amber-300">ΔT = |T_t - T_v|</span> аналізується для виявлення ретроспективних маніпуляцій та фабрикацій.
                </p>
              </div>

              <div className="p-3.5 bg-[#090E1A] border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                  🛡️ 2. П'ять Базових Інваріантів (L-01 – L-05)
                </h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4 font-mono">
                  <li><strong>L-01 (Bitemporal Immutability)</strong>: Заборона перезапису records in-place; виключно атомарна суперсесія.</li>
                  <li><strong>L-02 (Zero External Dependencies)</strong>: Ядро міркувань (src/legal/) працює на чистому Python stdlib.</li>
                  <li><strong>L-03 (Bona Fide Shield)</strong>: Абсолютний імунітет добросовісного помічника (А. Міллі, ст. 933 CC).</li>
                  <li><strong>L-04 (Minor Victim Protection)</strong>: Неповнолітня особа незмінно зберігає статус потерпілого.</li>
                  <li><strong>L-05 (Cryptographic Proof)</strong>: Обов'язкова наявність валідного SHA-256 хешу для кожного доказу.</li>
                </ul>
              </div>

              <div className="p-3.5 bg-[#090E1A] border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-blue-300">
                  🌐 3. MCP Шлюз (Model Context Protocol :8766) &amp; ШІ-Проксі (:18880)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-[#070B14] rounded border border-slate-800">
                    <strong className="text-blue-300 block mb-1">FastAPI MCP Gateway (:8766):</strong>
                    <span className="text-slate-400">30 інструментів (Legal, AST, DRAKON, WORM), транспорт SSE &amp; Streamable HTTP, Cloudflare HEAD probe.</span>
                  </div>
                  <div className="p-2.5 bg-[#070B14] rounded border border-slate-800">
                    <strong className="text-emerald-300 block mb-1">OpenAI-сумісний Проксі (:18880):</strong>
                    <span className="text-slate-400">Ендпоінт /v1/chat/completions, слоти моделей Qwen 72B, LLaMA 3.3 70B, Mistral Large на хості .184.</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#090E1A] border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-emerald-300">
                  ⚙️ 4. Команди Збірки та Запуску
                </h4>
                <div className="p-3 bg-black/60 rounded-lg font-mono text-[11px] text-emerald-400 space-y-1">
                  <div># Збірка UI продакшн</div>
                  <div>npm run build --workspace=b-sdd-legal-ui</div>
                  <div className="pt-1"># Запуск модульних тестів (15 тестів інваріантів)</div>
                  <div>python3 -m unittest discover tests</div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-lg text-xs text-purple-300 flex items-center justify-between">
              <span>Повний оригінал посібника збережено у файлі: <code className="font-mono text-white">/docs/DEVELOPER_GUIDE.md</code></span>
              <button
                onClick={() => handleCopy("/docs/DEVELOPER_GUIDE.md", "dev_guide_path")}
                className="px-2 py-1 bg-purple-900/60 hover:bg-purple-800 text-white rounded text-[11px] font-mono flex items-center gap-1 shrink-0"
              >
                {copiedTerm === "dev_guide_path" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Скопіювати шлях</span>
              </button>
            </div>
          </div>
        )}

        {/* MODAL FOOTER */}
        <div className="bg-[#080E1B] border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>
            {currentLang === "uk"
              ? "Стандартизовано відповідно до практики Федерального суду Швейцарії (BGer)"
              : "Standardisé selon la jurisprudence du Tribunal fédéral suisse (TF)"}
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
          >
            {currentLang === "uk" ? "Закрити" : "Fermer"}
          </button>
        </div>
      </div>
    </div>
  );
};
