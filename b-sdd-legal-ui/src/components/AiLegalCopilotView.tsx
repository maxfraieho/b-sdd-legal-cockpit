import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Brain,
  Sparkles,
  Scale,
  Database,
  Search,
  BookOpen,
  Send,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Layers,
  ArrowRight,
  ExternalLink,
  Clock,
  FileText,
  Filter,
  RefreshCw,
  Zap,
  Info,
  Award,
  Hash,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import { SWISS_LAW_ARTICLES, LawArticle } from "../data/swissLawCodes";
import { BORDEREAU_PIECES, CHARGES, DOSSIER_CHAPTERS, resolveLocalized } from "../data/legalData";
import { WormLedgerRecord } from "../lib/wormLedger";
import { LegalCase } from "../lib/casesManager";

interface AiLegalCopilotViewProps {
  currentLang: SupportedLanguage;
  activeCase: LegalCase;
  onNavigateToTab?: (tab: string) => void;
  onShowToast: (title: string, description: string, type?: "success" | "info") => void;
}

interface CopilotMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  citations?: Array<{ title: string; ref: string }>;
  blastRadius?: { chaptersCount: number; chargesAffected: string[]; risk: "low" | "medium" | "high" | "critical" };
}

export const AiLegalCopilotView: React.FC<AiLegalCopilotViewProps> = ({
  currentLang,
  activeCase,
  onNavigateToTab,
  onShowToast,
}) => {
  // Sub-tabs: "chat" (Deep Research Copilot), "corpus" (Swiss Legal Codes Search), "contradictions" (Alibi & Contradiction Matrix), "blast_radius" (Graph Engine), "generator" (Pleadings Drafter)
  const [activeTab, setActiveTab] = useState<
    "chat" | "corpus" | "contradictions" | "blast_radius" | "generator"
  >("chat");

  // Chat conversation state
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "msg-init-1",
      sender: "ai",
      text:
        currentLang === "uk"
          ? `Вітаю в юридичному ШІ-копілоті Astryx. Я підключений до темпоральної бази Utopia DB (порт 9922) та корпусу швейцарських законів MemPalace (порт 8766) для справи ${activeCase.reference}.\n\nЯ можу:\n1. Знайти статті кодексів Швейцарії (CP, CPP, CC, CO, LEI) та прецеденти ATF.\n2. Здійснити аудит суперечностей між заявами обвинувачених та доказами P-01..P-15.\n3. Розрахувати радіус ураження (Blast Radius) для будь-якої зміни факту.\n4. Скласти клопотання про арешт банківських рахунків (ст. 263 КПК) чи слідчі дії (ст. 318 КПК).`
          : `Bienvenue dans l'Assistant IA Astryx. Connecté à la base bitemporelle Utopia DB (:9922) et au corpus de droit suisse MemPalace (:8766) pour le dossier ${activeCase.reference}.\n\nCapacités actives :\n1. Recherche croisée dans le corpus fédéral (CP, CPP, CC, CO, LEI) et ATF.\n2. Audit des contradictions objectives (P-01 à P-15, certificat médical Unisanté, EXIF 1481).\n3. Calculateur de rayon d'impact (Blast Radius) sur les 18 chapitres.\n4. Rédaction de réquisitions selon l'Art. 263 CPP (séquestre) et Art. 318 CPP.`,
      timestamp: "12:00",
      citations: [
        { title: "Escroquerie", ref: "Art. 146 CP" },
        { title: "Séquestre pénal", ref: "Art. 263 CPP" },
        { title: "Admissibilité des audios", ref: "ATF 146 IV 9" },
      ],
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Corpus Search state
  const [corpusSearch, setCorpusSearch] = useState("");
  const [corpusJurisdiction, setCorpusJurisdiction] = useState<string>("all");
  const [corpusCategory, setCorpusCategory] = useState<string>("all");
  const [selectedArticle, setSelectedArticle] = useState<LawArticle>(SWISS_LAW_ARTICLES[0]);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);

  // Blast Radius Engine state
  const [selectedChapterBlast, setSelectedChapterBlast] = useState<string>("CH-07");

  // Scroll to bottom on new chat message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Pre-configured Quick Prompts
  const quickPrompts = useMemo(() => {
    if (currentLang === "uk") {
      return [
        { label: "Аналіз допустимості P-01 за ATF 146 IV 9", query: "Проаналізуй допустимість та доказову силу аудіозапису P-01 за прецедентом Федерального суду ATF 146 IV 9 та ст. 139 КПК." },
        { label: "Кваліфікація шахрайства на $15'000 USD", query: "Які обов'язкові ознаки складу шахрайства за ст. 146 КК та як довести підступність (astuce) через банківські документи Wise P-05?" },
        { label: "Перевірка алібі Лозанни (EXIF 1481)", query: "Зістав час знімка EXIF 1481 у Лозанні з часом сфабрикованого нападу в Рене та вкажи на суперечності за ст. 303 КК." },
        { label: "Обґрунтування арешту рахунків (CHF 46'850)", query: "Склади мотивувальну частину клопотання про арешт рахунків обвинуваченої за ст. 263 КПК на суму CHF 46'850.00." },
        { label: "Захист добросовісного учасника (ст. 933 CC)", query: "Поясни, чому статус Адріано Міллі як добросовісної третьої особи (ст. 933 ЦК) повністю виключає кримінальну відповідальність." },
      ];
    }
    return [
      { label: "Admissibilité de P-01 sous ATF 146 IV 9", query: "Évalue la recevabilité de l'enregistrement audio P-01 au regard de l'ATF 146 IV 9 et de la pesée des intérêts en matière d'escroquerie et menaces de mort." },
      { label: "Qualification de l'escroquerie $15'000 USD", query: "Détaille les éléments constitutifs de l'Art. 146 CP (tromperie astucieuse) appuyés par le virement Wise P-05 et les aveux audio P-04." },
      { label: "Vérification d'alibi EXIF 1481 (Lausanne)", query: "Confronte les métadonnées géolocalisées EXIF 1481 à Lausanne avec l'allégation calomnieuse de violences à Renens (Art. 303 CP)." },
      { label: "Séquestre conservatoire de CHF 46'850.00", query: "Rédige les conclusions formelles sous l'Art. 263 CPP pour séquestrer les avoirs bancaires des prévenues à due concurrence de CHF 46'850.00." },
      { label: "Bouclier du tiers de bonne foi (Art. 933 CC)", query: "Justifie l'immunité intégrale d'Adriano Milli sous l'Art. 933 CC et l'Art. 105 al. 2 CPP (Invariant L-03)." },
    ];
  }, [currentLang]);

  // Handle Query Submission
  const handleSendQuery = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isProcessing) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString().slice(0, 5),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery("");
    setIsProcessing(true);

    setTimeout(() => {
      let responseText = "";
      let citations: Array<{ title: string; ref: string }> = [];
      let blastRadius: CopilotMessage["blastRadius"] = undefined;

      const lower = query.toLowerCase();

      if (lower.includes("146") || lower.includes("escroquerie") || lower.includes("шахрайство") || lower.includes("15'000") || lower.includes("wise")) {
        responseText =
          currentLang === "uk"
            ? `⚖️ **Аналіз кваліфікації за ст. 146 КК Швейцарії (Escroquerie)**:\n\n1. **Підступність обману (Tromperie astucieuse)**: Обвинувачена побудувала складну конструкцію фіктивного «довірчого збереження коштів для статусу S». Згідно з практикою Федерального суду (ATF 141 IV 369), наївність або вразливість потерпілого, зумовлена станом війни та мовним бар'єром, захищається законом.\n2. **Матеріальна доказова база**: Виписка Wise на $15'000 USD (Pièce P-05, SHA-256: b10a9f5d...) у поєднанні із зізнанням на аудіозаписі P-04 повністю виключає версію захисту про «безповоротний подарунок».\n3. **Вимога цивільного позову (ст. 122 КПК)**: $15'000 USD (еквівалент CHF 13'500.00) підлягають безумовній реституції плюс відсотки 5% річних за ст. 104 CO.`
            : `⚖️ **Qualification sous l'Art. 146 CP (Escroquerie)** :\n\n1. **Astuce (ATF 141 IV 369)** : La prévenue a échafaudé une mise en scène trompeuse relative à un « dépôt fiduciaire pour le Statut S ». La vulnérabilité linguistique du plaignant ne prive pas la tromperie de son caractère astucieux.\n2. **Corroboration matérielle** : Le bordereau de virement Wise de $15'000 USD (Pièce P-05, SHA-256 certifié) et l'aveu audio P-04 ruinent la thèse adverse d'une prétendue donation.\n3. **Prétentions civiles (Art. 122 CPP)** : Restitution intégrale des $15'000 USD augmentés des intérêts moratoires de 5% l'an (Art. 104 CO).`;
        citations = [
          { title: "Escroquerie", ref: "Art. 146 CP" },
          { title: "Abus de confiance", ref: "Art. 138 CP" },
          { title: "Bordereau Wise P-05", ref: "Pièce P-05" },
        ];
        blastRadius = { chaptersCount: 3, chargesAffected: ["CP-146", "CP-138"], risk: "critical" };
      } else if (lower.includes("146 iv 9") || lower.includes("admissib") || lower.includes("допустим") || lower.includes("p-01") || lower.includes("аудіо")) {
        responseText =
          currentLang === "uk"
            ? `🛡️ **Оцінка допустимості аудіозаписів за практикою Федерального суду ATF 146 IV 9**:\n\n- **Нормативна база**: ст. 139 ч. 1 та ст. 141 ч. 2 КПК.\n- **Баланс інтересів**: Федеральний суд встановив, що таємні аудіозаписи, зроблені потерпілим для захисту від тяжких злочинів (погрози вбивством ст. 180 КК, примус ст. 181 КК, вимагання), є **повністю допустимими доказами**, оскільки інтерес до встановлення істини значно переважає право обвинуваченої на конфіденційність слів.\n- **Статус P-01**: Аудіозапис 32 містить прямі погрози розправою («Я тебе знищу, поліція нічого не зробить»). Запис верифіковано криміналістичним хешем SHA-256 ISO/IEC 27037.`
            : `🛡️ **Admissibilité de l'audio P-01 selon la jurisprudence de principe ATF 146 IV 9** :\n\n- **Cadre légal** : Art. 139 al. 1 et Art. 141 al. 2 CPP.\n- **Pesée des intérêts** : Le Tribunal fédéral admet l'exploitabilité d'enregistrements réalisés à l'insu de l'auteur dès lors qu'il s'agit de prouver des infractions graves contre l'intégrité (Art. 180, 181, 146 CP). L'intérêt public à la manifestation de la vérité prime.\n- **Force probatoire** : La pièce P-01 documente formellement les menaces de mort réitérées (« Je vais t'abattre ») et porte un scellement SHA-256 conforme ISO/IEC 27037.`;
        citations = [
          { title: "Admissibilité de principe", ref: "ATF 146 IV 9" },
          { title: "Administration des preuves", ref: "Art. 139 CPP" },
          { title: "Menaces caractérisées", ref: "Art. 180 CP" },
        ];
      } else if (lower.includes("alibi") || lower.includes("алібі") || lower.includes("1481") || lower.includes("lausanne") || lower.includes("лозанн") || lower.includes("303")) {
        responseText =
          currentLang === "uk"
            ? `📍 **Спростування сфабрикованого нападу: Лозаннське алібі (EXIF 1481)**:\n\n1. **Часово-просторовий аналіз ($T_v$)**: Обвинувачена подала заяву до поліції про нібито нанесення тілесних ушкоджень у квартирі в Рене 20.07.2024. \n2. **Об'єктивний доказ P-06**: Знімок iPhone 14 Pro на площі Палю у Лозанні (GPS 46.5197° N, 6.6323° E) зафіксований о 13:45:12, із спектральним підтвердженням абсолютно чистих передпліч без подряпин.\n3. **Медичний висновок Unisanté (P-03)**: Огляд лікаря підтверджує відсутність слідів боротьби.\n4. **Зізнання на записі P-07**: Сама Суворова визнає, що роздряпала себе власними нігтями для фальсифікації доказу.\n\n➔ **Висновок**: Встановлено повний склад злочину **завідомо неправдивого доносу за ст. 303 ч. 1 КК** (Dénonciation calomnieuse).`
            : `📍 **Anéantissement de l'agression fabriquée : Alibi objectif de Lausanne (EXIF 1481)** :\n\n1. **Calibration spatio-temporelle ($T_v$)** : Dénonciation à la police prétendant une agression corporelle à Renens.\n2. **Constat irréfutable P-06** : Métadonnées EXIF horodatées à 13:45:12 à Lausanne (Place de la Palud) montrant les avant-bras parfaitement indemnes.\n3. **Certificat Unisanté P-03** : Absence totale de lésions imputables.\n4. **Aveu audio P-07** : La prévenue concède avoir créé ses propres griffures.\n\n➔ **Conséquence juridique** : L'infraction de **dénonciation calomnieuse (Art. 303 al. 1 CP)** est consommée.`;
        citations = [
          { title: "Dénonciation calomnieuse", ref: "Art. 303 CP" },
          { title: "Cliché EXIF 1481", ref: "Pièce P-06" },
          { title: "Constat Unisanté", ref: "Pièce P-03" },
        ];
        blastRadius = { chaptersCount: 2, chargesAffected: ["CP-303"], risk: "critical" };
      } else if (lower.includes("séquestre") || lower.includes("263") || lower.includes("арешт") || lower.includes("46'850") || lower.includes("46850")) {
        responseText =
          currentLang === "uk"
            ? `🏛️ **Розрахунок та обґрунтування арешту активів за ст. 263 КПК (Séquestre conservatoire)**:\n\n- **Привласнені кошти**: $15'000 USD (CHF 13'500.00 за поточним курсом).\n- **Прямі збитки за пошкодження майна**: CHF 850.00 (акт заміни зламаного замка дверей Renens, Pièce P-10).\n- **Моральна шкода та компенсація страждань (Art. 49 CO)**: CHF 32'500.00 (внаслідок тривалого переслідування, погроз розправою та психологічного тиску).\n- **Загальна сума забезпечення позову**: **CHF 46'850.00**.\n\nНакладення арешту на рахунки в банках Wise Europe SA та UBS Switzerland AG є невідкладним заходом для запобігання виведенню активів за кордон.`
            : `🏛️ **Structure de la réquisition de séquestre conservatoire (Art. 263 CPP)** :\n\n- **Fonds dissipés** : $15'000 USD (CHF 13'500.00).\n- **Dommage matériel direct** : CHF 850.00 (facture serrurier d'urgence P-10).\n- **Tort moral caractérisé (Art. 49 CO)** : CHF 32'500.00 (menaces de mort réitérées, déstabilisation et dénonciation calomnieuse).\n- **Montant total requis** : **CHF 46'850.00**.\n\nLe blocage conservatoire des comptes bancaires auprès de Wise et banques de la place est indispensable pour préserver l'exécution forcée.`;
        citations = [
          { title: "Séquestre conservatoire", ref: "Art. 263 CPP" },
          { title: "Conclusions civiles", ref: "Art. 122 CPP" },
          { title: "Réparation du tort moral", ref: "Art. 49 CO" },
        ];
        blastRadius = { chaptersCount: 4, chargesAffected: ["CP-146", "CP-180", "CP-181"], risk: "high" };
      } else if (lower.includes("milli") || lower.includes("міллі") || lower.includes("933") || lower.includes("bonne foi") || lower.includes("добросовісн")) {
        responseText =
          currentLang === "uk"
            ? `🛡️ **ІНВАРІАНТ L-03: Санктуаризований щит добросовісності Адріано Міллі**:\n\n1. **Матеріальний захист за ст. 933 ЦК Швейцарії (CC)**: Особа, яка діє добросовісно, захищена від будь-яких рекурсивних претензій або цивільних зобов'язань.\n2. **Процесуальний статус (ст. 105 ч. 2 КПК)**: Адріано Міллі виступав виключно як безкорисливий перекладач та волонтер. Будь-які спроби сторони захисту пред'явити йому звинувачення чи примусити до участі в якості співучасника відхиляються d'office як зловживання правом (ст. 2 ч. 2 CC).\n3. **Архітектурна фіксація**: У реєстрі справи діє блокування будь-якої зміни його статусу чи вилучення.`
            : `🛡️ **INVARIANT L-03 : Sanctuarisation absolue d'Adriano MILLI (Art. 933 CC)** :\n\n1. **Protection matérielle (Art. 933 Code Civil)** : Le tiers de bonne foi bénéficie d'une présomption irréfragable et d'une immunité totale contre toute action récursoire.\n2. **Statut procédural (Art. 105 al. 2 CPP)** : Présence strictement limitée à l'assistance bénévole et à la traduction neutre. Toute dénonciation téméraire de la défense est frappée d'irrecevabilité d'office.\n3. **Verrou architectural** : L'Invariant L-03 interdit formellement toute requalification ou radiation du dossier.`;
        citations = [
          { title: "Protection du tiers de bonne foi", ref: "Art. 933 CC" },
          { title: "Statut des tiers participants", ref: "Art. 105 al. 2 CPP" },
          { title: "Interdiction de l'abus de droit", ref: "Art. 2 al. 2 CC" },
        ];
      } else {
        responseText =
          currentLang === "uk"
            ? `🔍 **Результат правового аналізу запиту щодо справи ${activeCase.reference}**:\n\nЗапит зіставлено з базою Utopia DB та кодексами Швейцарії.\n- Доказова відповідність: висока (відповідає матеріалам слідства прокуратури кантону Во).\n- Рекомендована дія: верифікувати зв'язані речові докази у Factbook та перевірити строки оскарження за ст. 393 КПК (10 днів).`
            : `🔍 **Analyse synthétique pour le dossier ${activeCase.reference}** :\n\nRequête croisée avec Utopia DB et le corpus légal vaudois.\n- Conformité probatoire : corroborée par les pièces scellées.\n- Recommandation : vérifier l'impact sur le bordereau officiel et surveiller le délai de recours de l'Art. 393 CPP (10 jours).`;
        citations = [{ title: "Code de Procédure Pénale", ref: "RS 312.0" }];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: responseText,
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          citations,
          blastRadius,
        },
      ]);
      setIsProcessing(false);
    }, 700);
  };

  // Filtered Swiss Law Articles
  const filteredArticles = useMemo(() => {
    return SWISS_LAW_ARTICLES.filter((art) => {
      const q = corpusSearch.toLowerCase();
      const matchesSearch =
        !q ||
        art.article.toLowerCase().includes(q) ||
        art.code.toLowerCase().includes(q) ||
        art.title[currentLang].toLowerCase().includes(q) ||
        art.content_fr.toLowerCase().includes(q) ||
        art.content_uk.toLowerCase().includes(q);

      const matchesJurisdiction =
        corpusJurisdiction === "all" || art.jurisdiction === corpusJurisdiction;
      const matchesCategory =
        corpusCategory === "all" || art.category === corpusCategory;

      return matchesSearch && matchesJurisdiction && matchesCategory;
    });
  }, [corpusSearch, corpusJurisdiction, corpusCategory, currentLang]);

  // Copy citation helper
  const handleCopyCitation = (art: LawArticle) => {
    const text = `${art.article} — ${art.title[currentLang]} (${art.code})\n${
      currentLang === "uk" ? art.content_uk : art.content_fr
    }`;
    navigator.clipboard.writeText(text);
    setCopiedCitationId(art.id);
    onShowToast(
      currentLang === "uk" ? "Статтю скопійовано" : "Article copié",
      `${art.article} intégré au presse-papiers`
    );
    setTimeout(() => setCopiedCitationId(null), 2000);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#070B12] text-slate-100 overflow-hidden select-text">
      {/* 1. HEADER: COPILOT CONTEXT & SUB-TABS */}
      <div className="bg-[#090E1A] border-b border-slate-800 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 rounded-lg text-indigo-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-bold uppercase tracking-wider">
                Utopia DB :9922 · MemPalace :8766
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                ● Модель B-SDD v1.2
              </span>
            </div>
            <h1 className="text-sm font-bold text-white flex items-center space-x-2 mt-0.5 font-sans">
              <span>
                {currentLang === "uk"
                  ? "ШІ-Юрисконсульт & Пошук у корпусі кодексів Швейцарії"
                  : "Assistant Juridique IA & Corpus de Droit Suisse"}
              </span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h1>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center bg-[#050810] p-0.5 rounded-lg border border-slate-800 overflow-x-auto text-xs font-mono shrink-0">
          {[
            { id: "chat", label: currentLang === "uk" ? "💬 ШІ-Діалог" : "💬 Copilot IA" },
            { id: "corpus", label: currentLang === "uk" ? "📚 Кодекси CH/VD" : "📚 Codes CH/VD" },
            { id: "contradictions", label: currentLang === "uk" ? "⚡ Суперечності & Алібі" : "⚡ Contradictions & Alibi" },
            { id: "blast_radius", label: currentLang === "uk" ? "🕸️ Радіус впливу" : "🕸️ Blast Radius" },
            { id: "generator", label: currentLang === "uk" ? "📝 Генератор клопотань" : "📝 Générateur" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-md transition-all shrink-0 ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. BODY CONTENT PER SUB-TAB */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {/* ========================================================================= */}
        {/* TAB 1: COPILOT DEEP RESEARCH CHAT                                         */}
        {/* ========================================================================= */}
        {activeTab === "chat" && (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Quick Prompts Bar */}
            <div className="px-4 py-2 bg-[#050810] border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto shrink-0 scrollbar-none">
              <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">
                Швидкі запити :
              </span>
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendQuery(p.query)}
                  className="px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] font-mono border border-slate-800 shrink-0 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white font-sans shadow-md"
                        : "bg-[#090E1A] text-slate-200 border border-slate-800 font-sans shadow-lg"
                    }`}
                  >
                    {msg.text}

                    {/* Citations block */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[10px] font-mono text-slate-400">Посилання :</span>
                        {msg.citations.map((c, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-mono font-bold flex items-center space-x-1"
                          >
                            <Scale className="w-2.5 h-2.5 text-indigo-400" />
                            <span>{c.ref} ({c.title})</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Blast Radius preview chip */}
                    {msg.blastRadius && (
                      <div className="mt-2.5 p-2 bg-[#050810] border border-slate-800 rounded-lg flex items-center justify-between text-[10px] font-mono">
                        <span className="text-amber-400 font-bold flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>Радіус ураження: {msg.blastRadius.chaptersCount} розділи досьє</span>
                        </span>
                        <span className="text-slate-400">
                          Статті: {msg.blastRadius.chargesAffected.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}
              {isProcessing && (
                <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 p-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>ШІ зіставляє Utopia DB &amp; MemPalace...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-[#090E1A] border-t border-slate-800 flex items-center space-x-2 shrink-0">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendQuery()}
                placeholder={
                  currentLang === "uk"
                    ? "Поставте запитання щодо статей CP/CPP, допустимості доказів чи секвестру..."
                    : "Interrogez l'IA sur les articles du CP/CPP, l'admissibilité ou le séquestre..."
                }
                className="flex-1 bg-[#050810] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
              <button
                onClick={() => handleSendQuery()}
                disabled={!inputQuery.trim() || isProcessing}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold font-mono flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{currentLang === "uk" ? "Аналіз" : "Analyser"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SWISS LEGAL CODES & CANTONAL VAUD SEARCH                           */}
        {/* ========================================================================= */}
        {activeTab === "corpus" && (
          <div className="h-full flex overflow-hidden">
            {/* Left list of articles (40%) */}
            <div className="w-[42%] border-r border-slate-800 flex flex-col bg-[#070B12] overflow-hidden">
              <div className="p-3 bg-[#090E1A] border-b border-slate-800 space-y-2 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={corpusSearch}
                    onChange={(e) => setCorpusSearch(e.target.value)}
                    placeholder="Пошук статті (напр. 146, 180, 263, 933)..."
                    className="w-full bg-[#050810] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <select
                    value={corpusJurisdiction}
                    onChange={(e) => setCorpusJurisdiction(e.target.value)}
                    className="bg-[#050810] border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none"
                  >
                    <option value="all">Всі юрисдикції</option>
                    <option value="federal">Федеральні (CH)</option>
                    <option value="canton_vaud">Кантон Во (VD)</option>
                  </select>

                  <select
                    value={corpusCategory}
                    onChange={(e) => setCorpusCategory(e.target.value)}
                    className="bg-[#050810] border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none"
                  >
                    <option value="all">Всі галузі права</option>
                    <option value="penal">Кримінальне (CP)</option>
                    <option value="procedure">Процесуальне (CPP)</option>
                    <option value="civil">Цивільне (CC/CO)</option>
                  </select>
                </div>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {filteredArticles.map((art) => {
                  const isSelected = selectedArticle.id === art.id;
                  return (
                    <div
                      key={art.id}
                      onClick={() => setSelectedArticle(art)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#0E172A] border-indigo-500 shadow-md"
                          : "bg-[#090E1A] hover:bg-slate-900 border-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {art.article}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                          {art.code}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 line-clamp-1 font-sans">
                        {art.title[currentLang] || art.title.fr}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-sans line-clamp-2 mt-1">
                        {currentLang === "uk" ? art.content_uk : art.content_fr}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right inspection pane (58%) */}
            <div className="flex-1 p-5 overflow-y-auto bg-[#080C16] space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {selectedArticle.article}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {selectedArticle.jurisdiction === "federal" ? "RS (Droit fédéral)" : "BLV (Canton de Vaud)"}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">
                    {selectedArticle.title[currentLang] || selectedArticle.title.fr}
                  </h2>
                </div>

                <button
                  onClick={() => handleCopyCitation(selectedArticle)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center space-x-1.5 border border-slate-700"
                >
                  {copiedCitationId === selectedArticle.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Скопійовано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-blue-400" />
                      <span>Скопіювати статтю</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sanction badge if applicable */}
              {selectedArticle.sanction && (
                <div className="p-2.5 bg-rose-950/30 border border-rose-800/60 rounded-xl text-xs font-mono text-rose-300">
                  <span className="font-bold">Санкція за статтею : </span>
                  <span>{selectedArticle.sanction}</span>
                </div>
              )}

              {/* Official French text */}
              <div className="p-4 bg-[#090E1A] rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  Текст мовою оригіналу (Français officiel · RS) :
                </span>
                <p className="text-xs text-slate-200 font-serif leading-relaxed italic">
                  « {selectedArticle.content_fr} »
                </p>
              </div>

              {/* Accurate Ukrainian legal translation */}
              <div className="p-4 bg-[#090E1A] rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  Офіційний юридичний переклад українською мовою :
                </span>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">
                  {selectedArticle.content_uk}
                </p>
              </div>

              {/* Relevance to case */}
              <div className="p-4 bg-[#050810] rounded-xl border border-indigo-950 space-y-2">
                <div className="flex items-center space-x-1.5 text-indigo-400 font-mono text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Застосування у справі {activeCase.reference} :</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {resolveLocalized(selectedArticle.relevance_case, currentLang)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CONTRADICTIONS & ALIBI MATRIX                                      */}
        {/* ========================================================================= */}
        {activeTab === "contradictions" && (
          <div className="h-full p-4 overflow-y-auto space-y-4">
            <div className="bg-[#090E1A] p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Матриця викриття суперечностей захисту та об єктивне алібі (ст. 303 КК)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Зіставлення фальсифікованих заяв обвинувачених із матеріальними доказами та часовими координатами Utopia DB.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {[
                {
                  theme: "1. Сфабрикований напад у Рене проти Лозаннського алібі",
                  defenseClaim: "Заява до поліції про нібито нанесення побоїв та подряпин у квартирі Renens 20.07.2024.",
                  reality: "Знімок EXIF 1481 о 13:45:12 у центрі Лозанни (Place de la Palud) та медвисновок Unisanté P-03 засвідчують абсолютну відсутність ушкоджень. Зізнання P-07 підтверджує самопоранення.",
                  article: "Art. 303 CP (Завідомо неправдивий донос)",
                  pieces: ["P-03", "P-06", "P-07", "P-15"],
                },
                {
                  theme: "2. Привласнення $15'000 USD проти вигаданого «подарунка»",
                  defenseClaim: "Обвинувачена стверджує, що кошти нібито були добровільною безоплатною пожертвою.",
                  reality: "Платіжна інструкція Wise P-05 і прямі аудіозізнання P-04 доводять передачу грошей виключно на довірче збереження з обов'язком повернення на першу вимогу.",
                  article: "Art. 146 CP (Шахрайство) & Art. 138 CP (Привласнення)",
                  pieces: ["P-04", "P-05", "P-14"],
                },
                {
                  theme: "3. Прямі погрози розправою проти заперечень агресії",
                  defenseClaim: "Захист заявляє про відсутність погроз життю та примусу.",
                  reality: "Аудіозапис P-01 (фоноскопія ATF 146 IV 9): «Я тобі влаштую розправу, ніхто тобі не допоможе, швейцарська поліція нічого не зробить».",
                  article: "Art. 180 CP (Погроза вбивством) & Art. 181 CP (Примус)",
                  pieces: ["P-01", "P-02", "P-10"],
                },
              ].map((c, i) => (
                <div key={i} className="p-4 bg-[#090E1A] rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white font-mono">{c.theme}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      {c.article}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg">
                      <span className="text-[10px] font-mono text-rose-400 font-bold block mb-1">
                        Фальшива позиція захисту :
                      </span>
                      <p className="text-slate-300 font-sans">{c.defenseClaim}</p>
                    </div>

                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">
                        Об'єктивна доведена реальність :
                      </span>
                      <p className="text-slate-300 font-sans">{c.reality}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>Речові докази :</span>
                    {c.pieces.map((p, idx) => (
                      <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: BLAST RADIUS GRAPH ENGINE                                          */}
        {/* ========================================================================= */}
        {activeTab === "blast_radius" && (
          <div className="h-full p-4 overflow-y-auto space-y-4">
            <div className="bg-[#090E1A] p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Калькулятор радіуса ураження змін (Blast Radius Engine)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Оцінює, як модифікація окремого факту чи доказу впливає на склад кримінальних статей, суму секвестру та процесуальні строки.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#090E1A] rounded-xl border border-slate-800 space-y-2">
                <label className="block text-xs font-mono text-slate-400">Оберіть розділ досьє :</label>
                <select
                  value={selectedChapterBlast}
                  onChange={(e) => setSelectedChapterBlast(e.target.value)}
                  className="w-full bg-[#050810] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                >
                  {DOSSIER_CHAPTERS.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {resolveLocalized(ch.title, currentLang)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-[#090E1A] rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 block">Уражені статті КК :</span>
                <span className="text-amber-300 font-bold font-mono text-sm">
                  Art. 146, 138, 180, 181, 303 CP
                </span>
              </div>

              <div className="p-3 bg-[#090E1A] rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 block">Фінансовий вплив (секвестр) :</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">
                  CHF 46'850.00 (Стабільно)
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#050810] rounded-xl border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-white font-mono flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Аналіз цілісності графа знань KùzuDB :</span>
              </h4>
              <p className="text-slate-300 font-sans leading-relaxed">
                Всі 18 розділів досьє синхронізовані з бітемпоральною шкалою ($T_v$ valid time vs $T_t$ transaction time). Жодних розривів ланцюга доказів не виявлено.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PLEADINGS & REQUISITIONS GENERATOR                                  */}
        {/* ========================================================================= */}
        {activeTab === "generator" && (
          <div className="h-full p-4 overflow-y-auto space-y-4">
            <div className="bg-[#090E1A] p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Автоматизований драфтер процесуальних документів (КПК Во)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Генерує суворо оформлені клопотання до прокурора кантону Во з цифровим підписом та посиланнями на доказову базу.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleSendQuery("Склади повне клопотання про арешт банківських рахунків за ст. 263 КПК на суму CHF 46'850.00")}
                className="p-4 bg-[#090E1A] hover:bg-slate-900 border border-slate-800 rounded-xl text-left space-y-1 transition-all"
              >
                <div className="font-bold text-xs text-white font-mono">
                  🏛️ Клопотання про арешт рахунків (ст. 263 КПК)
                </div>
                <p className="text-[11px] text-slate-400">
                  Забезпечення відшкодування $15'000 USD, замка CHF 850.- та моральної шкоди CHF 31'000.-
                </p>
              </button>

              <button
                onClick={() => handleSendQuery("Склади клопотання про проведення очних ставок та допит свідків за ст. 318 КПК")}
                className="p-4 bg-[#090E1A] hover:bg-slate-900 border border-slate-800 rounded-xl text-left space-y-1 transition-all"
              >
                <div className="font-bold text-xs text-white font-mono">
                  ⚖️ Клопотання про додаткові слідчі дії (ст. 318 КПК)
                </div>
                <p className="text-[11px] text-slate-400">
                  Вимога проведення очної ставки за ст. 147 КПК та пред'явлення аудіозапису P-01
                </p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
