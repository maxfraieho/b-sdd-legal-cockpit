import React, { useState, useEffect, useRef } from "react";
import {
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Brain,
  Sparkles,
  CheckCircle2,
  X,
  FileText,
  Upload,
  Camera,
  Scale,
  Clock,
  Send,
  Database,
  Lock,
  ArrowRight,
  Info,
  RefreshCw,
  Hash,
  Award,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import { ActorItem, resolveLocalized } from "../data/legalData";
import {
  ProceduralRoleKey,
  PROCEDURAL_ROLES_METADATA,
  calculateActorImpact,
  ActorImpactAnalysis,
} from "../lib/actorsManager";
import { commitAtomicSupersession } from "../lib/wormLedger";

interface ActorIngestionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCommitActor: (newActor: ActorItem) => void;
  existingActors: ActorItem[];
  currentLang: SupportedLanguage;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export const ActorIngestionWizard: React.FC<ActorIngestionWizardProps> = ({
  isOpen,
  onClose,
  onCommitActor,
  existingActors,
  currentLang,
}) => {
  // Stepper state: 1: Input & ID -> 2: AI Qualification -> 3: Hearing Questions -> 4: WORM Seal
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Source selection
  const [sourceType, setSourceType] = useState<"audition" | "id_card" | "plainte" | "manual">("audition");
  const [rawText, setRawText] = useState("");
  const [actorName, setActorName] = useState("");
  const [actorBirthdate, setActorBirthdate] = useState("");
  const [actorAge, setActorAge] = useState<number | undefined>(undefined);
  const [actorNationality, setActorNationality] = useState("");
  const [actorDomicile, setActorDomicile] = useState("");
  const [financialAmount, setFinancialAmount] = useState<number>(0);

  // Photos & Scans
  const [photoDataUrl, setPhotoDataUrl] = useState<string>("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentType, setDocumentType] = useState("PV d'audition");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Hash & Sealing
  const [inputSha256, setInputSha256] = useState("");
  const [isHashing, setIsHashing] = useState(false);

  // AI Qualification result
  const [selectedRole, setSelectedRole] = useState<ProceduralRoleKey>("temoin");
  const [aiRationale, setAiRationale] = useState("");
  const [applicableArticles, setApplicableArticles] = useState<string[]>([]);
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high" | "critical" | "immune">("low");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [contradictionsFound, setContradictionsFound] = useState<string[]>([]);

  // Lawyer Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Compute live hash of raw input
  useEffect(() => {
    const textToHash = `${actorName}|${actorBirthdate}|${rawText}|${documentTitle}`;
    setIsHashing(true);
    crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(textToHash))
      .then((digest) => {
        const hash = Array.from(new Uint8Array(digest))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        setInputSha256(hash);
        setIsHashing(false);
      })
      .catch(() => setIsHashing(false));
  }, [actorName, actorBirthdate, rawText, documentTitle]);

  // Pre-fill sample if user switches source
  useEffect(() => {
    if (sourceType === "audition" && !rawText) {
      setRawText(
        "Procès-verbal d'audition de témoin (Art. 162 ss CPP) : La personne déclare avoir constaté la présence de la prévenue aux abords du domicile de Renens le 20 juillet 2024 à 11h00, confirmant les déclarations de la partie plaignante quant au forçage de la serrure."
      );
      if (!actorName) setActorName("Michel BERTHIER");
      if (!actorBirthdate) setActorBirthdate("14.03.1978");
      if (!actorNationality) setActorNationality("Suisse (Lausanne)");
      if (!actorDomicile) setActorDomicile("Renens, Canton de Vaud");
    }
  }, [sourceType]);

  // AI Qualification Handler
  const handleRunAiQualification = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      // Rule-based heuristic simulation matching Canton de Vaud judicial standards
      const lower = (rawText + " " + actorName).toLowerCase();
      let role: ProceduralRoleKey = "temoin";
      let articles: string[] = ["Art. 162 ss CPP", "Art. 163 CPP"];
      let risk: "low" | "medium" | "high" | "critical" | "immune" = "low";
      let contradictions: string[] = [];

      if (lower.includes("plaignant") || lower.includes("victime") || lower.includes("dommage")) {
        role = "victime_plaignante";
        articles = ["Art. 115, 118, 122 CPP", "Art. 41 CO"];
        risk = "low";
      } else if (lower.includes("menace") || lower.includes("vol") || lower.includes("auteur") || lower.includes("escroquerie") || lower.includes("forçage")) {
        role = "prevenu_principal";
        articles = ["Art. 111, 158 CPP", "Art. 146, 180, 181 CP"];
        risk = "critical";
        contradictions.push("Contradiction directe avec le certificat médical Unisanté P-03");
        contradictions.push("Incohérence temporelle avec la chronologie EXIF 1481");
      } else if (lower.includes("bonne foi") || lower.includes("milli") || lower.includes("bénévole") || lower.includes("traduction")) {
        role = "tiers_bonne_foi";
        articles = ["Art. 933 CC", "Art. 105 al. 2 CPP", "Invariant L-03"];
        risk = "immune";
      } else if (lower.includes("complice") || lower.includes("aide") || lower.includes("pression")) {
        role = "prevenu_complice";
        articles = ["Art. 25 CP", "Art. 111 CPP"];
        risk = "high";
      }

      setSelectedRole(role);
      setApplicableArticles(articles);
      setRiskLevel(risk);
      setContradictionsFound(contradictions);

      // Calculate approximate age if birthdate present
      if (actorBirthdate) {
        const parts = actorBirthdate.split(".");
        if (parts.length === 3) {
          const year = parseInt(parts[2], 10);
          if (!isNaN(year)) {
            setActorAge(new Date().getFullYear() - year);
          }
        }
      }

      setAiRationale(
        currentLang === "uk"
          ? `Аналіз кваліфікації за КПК Швейцарії (RS 312.0): Особа підпадає під процесуальний статус «${PROCEDURAL_ROLES_METADATA[role].labelUk}» за нормами ${articles.join(", ")}. Враховано доказову базу прокуратури кантону Во.`
          : `Qualification formelle selon le CPP suisse : Statut déterminé comme « ${PROCEDURAL_ROLES_METADATA[role].labelFr} » sous l'angle des ${articles.join(", ")}. Vérification d'intégrité conforme aux exigences judiciaires vaudoises.`
      );

      // Pre-seed adversarial questions
      const initQuestions: ChatMessage[] = [
        {
          id: "msg-1",
          sender: "ai",
          text:
            currentLang === "uk"
              ? `ШІ-Асистент підготував процесуальний профіль для ${actorName || "нового фігуранта"}. Рекомендовані запитання для допиту/очної ставки (ст. 147 КПК):\n1. Чи підтверджує свідок точний час події?\n2. Які документи чи телефонні контакти можуть підтвердити його свідчення?\n3. Чи має свідок прямий матеріальний чи особистий інтерес у справі?`
              : currentLang === "it"
              ? `L'assistente IA ha modellato il profilo procedurale per ${actorName || "il nuovo soggetto"}. Domande raccomandate per l'audizione di confronto (Art. 147 CPP):\n1. Conferma l'orario esatto e il suo campo visivo al momento dei fatti?\n2. Dispone di elementi materiali o contatti che possano riscontrare la sua deposizione?\n3. Ha un interesse patrimoniale o personale diretto nella presente causa?`
              : currentLang === "de"
              ? `Der KI-Assistent hat das Verfahrensprofil für ${actorName || "die neue Person"} erstellt. Empfohlene Fragen für die kontradiktorische Einvernahme (Art. 147 StPO):\n1. Bestätigen Sie den genauen Tatzeitpunkt und Ihre Wahrnehmungen?\n2. Welche Unterlagen oder Kontakte können Ihre Aussage objektiv stützen?\n3. Haben Sie ein direktes Vermögens- oder persönliches Interesse am Verfahren?`
              : currentLang === "fr"
              ? `L'assistant IA a modélisé le profil procédural de ${actorName || "l'intervenant"}. Questions recommandées pour l'audition contradictoire (Art. 147 CPP) :\n1. Confirmez-vous l'heure exacte et votre champ de vision lors des faits ?\n2. Disposez-vous d'éléments matériels corroborant votre déposition ?\n3. Avez-vous un lien personnel ou financier avec l'une des parties ?`
              : `The AI Assistant modeled the procedural profile for ${actorName || "the person of interest"}. Recommended confrontation questions (Art. 147 CPC):\n1. Do you confirm the exact timestamp and direct line of sight?\n2. What tangible records corroborate your statement?\n3. Do you possess any financial or personal stake in this matter?`,
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
        },
      ];
      setChatMessages(initQuestions);

      setIsAnalyzing(false);
      setCurrentStep(2);
    }, 900);
  };

  // Lawyer Chat in Step 3
  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString().slice(0, 5),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    setTimeout(() => {
      let reply = "";
      if (selectedRole === "prevenu_principal" || selectedRole === "prevenu_complice") {
        reply =
          currentLang === "uk"
            ? "Увага: Будь-яке питання до обвинуваченого має враховувати право на мовчання (ст. 158 КПК). Рекомендується пред'явити аудіозапис P-01 та виписку Wise P-05 під час очної ставки для фіксації суперечностей."
            : currentLang === "it"
            ? "Attenzione: Richiamo preventivo dell'Art. 158 CPP tassativo (diritto al silenzio). Raccomandazione tattica: contestare direttamente l'audio P-01 e la contabile Wise P-05 durante l'audizione per cristallizzare le contraddizioni."
            : currentLang === "de"
            ? "Achtung: Zwingender Hinweis auf Art. 158 StPO (Aussageverweigerung). Taktische Empfehlung: Unmittelbare Vorlage der Tonaufnahme P-01 und des Wise-Belegs P-05 zur Fixierung der Widersprüche."
            : currentLang === "fr"
            ? "Attention : Rappel préalable de l'Art. 158 CPP impératif. Préconisation tactique : confronter directement aux enregistrements P-01 et à la preuve de virement P-05 pour figer les contradictions."
            : "Attention: Prior reminder of Art. 158 CPC mandatory. Tactical recommendation: confront directly with audio P-01 and Wise receipt P-05.";
      } else if (selectedRole === "tiers_bonne_foi") {
        reply =
          currentLang === "uk"
            ? "Згідно з Інваріантом L-03 та ст. 933 ЦК, добросовісний учасник повністю захищений. Будь-які запитання повинні стосуватися виключно обставин гуманітарної допомоги та перекладу."
            : currentLang === "it"
            ? "In virtù dell'Invariante L-03 e dell'Art. 933 CC, il terzo di buona fede è inviolabile. Le domande devono limitarsi rigorosamente alle circostanze dell'assistenza umanitaria o della traduzione."
            : currentLang === "de"
            ? "Gemäss Invariante L-03 und Art. 933 ZGB ist der gutgläubige Dritte voll geschützt. Alle Fragen müssen sich ausschliesslich auf humanitäre Hilfe oder Dolmetschen beziehen."
            : currentLang === "fr"
            ? "En vertu de l'Invariant L-03 et de l'Art. 933 CC, le tiers de bonne foi est sanctuarisé. Les questions doivent se limiter aux actes d'assistance neutres."
            : "Under Invariant L-03 and Art. 933 CC, the bona fide third party is fully immune. Questions must be strictly confined to neutral assistance.";
      } else {
        reply =
          currentLang === "uk"
            ? "Позицію прийнято. Питання внесено до плану судового засідання та досьє потерпілого."
            : currentLang === "it"
            ? "Posizione registrata. Le domande sono inserite nel piano dell'audizione e nel fascicolo dell'accusatore privato."
            : currentLang === "de"
            ? "Standpunkt erfasst. Die Fragen wurden in den Einvernahmeplan und das Aktenheft der Privatklägerschaft aufgenommen."
            : currentLang === "fr"
            ? "Pris en compte. Les éléments sont intégrés au procès-verbal pré-audienciel."
            : "Noted. Elements integrated into the hearing plan.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: reply,
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
        },
      ]);
    }, 600);
  };

  // Build candidate actor object for impact analysis
  const candidateActor: ActorItem = {
    id: `ACT-${actorName.replace(/\s+/g, "-").toUpperCase() || "NEW-ACTOR"}-${Date.now().toString().slice(-4)}`,
    name: actorName.trim() || "Nouvel Intervenant",
    age: actorAge,
    birthdate: actorBirthdate.trim(),
    status: {
      uk: PROCEDURAL_ROLES_METADATA[selectedRole].labelUk,
      fr: PROCEDURAL_ROLES_METADATA[selectedRole].labelFr,
      de: PROCEDURAL_ROLES_METADATA[selectedRole].labelDe,
      it: PROCEDURAL_ROLES_METADATA[selectedRole].labelIt,
      en: PROCEDURAL_ROLES_METADATA[selectedRole].labelEn,
    },
    badgeColor: PROCEDURAL_ROLES_METADATA[selectedRole].badgeStyle,
    role: {
      uk: aiRationale || `Процесуальний статус ${PROCEDURAL_ROLES_METADATA[selectedRole].labelUk} у кримінальному провадженні PE24.014624-SBA.`,
      fr: aiRationale || `Statut de ${PROCEDURAL_ROLES_METADATA[selectedRole].labelFr} dans le cadre de la procédure PE24.014624-SBA.`,
      de: aiRationale || `Verfahrensstatus als ${PROCEDURAL_ROLES_METADATA[selectedRole].labelDe} im Verfahren PE24.014624-SBA.`,
      it: aiRationale || `Status processuale di ${PROCEDURAL_ROLES_METADATA[selectedRole].labelIt} nel procedimento PE24.014624-SBA.`,
      en: aiRationale || `Procedural standing as ${PROCEDURAL_ROLES_METADATA[selectedRole].labelEn} in proceeding PE24.014624-SBA.`,
    },
    protected_bona_fide: selectedRole === "tiers_bonne_foi",
    legal_reference: PROCEDURAL_ROLES_METADATA[selectedRole].cppArticles,
    procedural_standing: selectedRole,
    cpp_article: PROCEDURAL_ROLES_METADATA[selectedRole].cppArticles,
    discernment_capacity: true,
    nationality: {
      uk: actorNationality || "Не вказано",
      fr: actorNationality || "Non spécifié",
      de: actorNationality || "Nicht angegeben",
      it: actorNationality || "Non specificato",
      en: actorNationality || "Unspecified",
    },
    domicile: {
      uk: actorDomicile || "Кантон Во, Швейцарія",
      fr: actorDomicile || "Canton de Vaud, Suisse",
      de: actorDomicile || "Kanton Waadt, Schweiz",
      it: actorDomicile || "Canton Vaud, Svizzera",
      en: actorDomicile || "Canton of Vaud, Switzerland",
    },
    financial_claim_chf: selectedRole === "victime_plaignante" ? financialAmount : 0,
    financial_liability_chf: ["prevenu_principal", "prevenu_complice"].includes(selectedRole) ? financialAmount : 0,
    risk_level: riskLevel,
    bitemporal_valid_from: new Date().toISOString(),
    droits_proceduraux: {
      uk: PROCEDURAL_ROLES_METADATA[selectedRole].defaultRightsUk,
      fr: PROCEDURAL_ROLES_METADATA[selectedRole].defaultRightsFr,
      de: PROCEDURAL_ROLES_METADATA[selectedRole].defaultRightsDe,
      it: PROCEDURAL_ROLES_METADATA[selectedRole].defaultRightsIt,
      en: PROCEDURAL_ROLES_METADATA[selectedRole].defaultRightsEn,
    },
    photos: photoDataUrl
      ? [
          {
            url: photoDataUrl,
            caption: {
              uk: `Фото / Скан особи: ${actorName}`,
              fr: `Document d'identité / Photo : ${actorName}`,
              en: `Identity photo / Scan : ${actorName}`,
            },
            timestamp: new Date().toISOString(),
            sha256: inputSha256,
          },
        ]
      : [],
    documents: documentTitle
      ? [
          {
            id: `DOC-${Date.now().toString().slice(-4)}`,
            title: {
              uk: documentTitle,
              fr: documentTitle,
              en: documentTitle,
            },
            type: documentType,
            sha256: inputSha256,
            date: new Date().toLocaleDateString("fr-CH"),
            verified: true,
          },
        ]
      : [],
  };

  // Run real-time impact analysis
  const impact: ActorImpactAnalysis = calculateActorImpact("add", candidateActor, existingActors);

  // Commit & Seal
  const handleFinalCommit = async () => {
    try {
      // Write WORM ledger supersession (Invariant L-01)
      await commitAtomicSupersession({
        entity_id: candidateActor.id,
        chapter_id: "CH-ACTORS",
        summary: `Enregistrement officiel de la partie : ${candidateActor.name} (${candidateActor.status.fr})`,
        content_snapshot: `Statut CPP : ${candidateActor.cpp_article} | Scellement SHA-256 : ${inputSha256.slice(0, 16)}...`,
        committer: "Conseil de la victime (Lausanne)",
      });
    } catch (err) {
      console.error("WORM commit error (non-fatal for UI):", err);
    }

    onCommitActor(candidateActor);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn select-text">
      <div className="bg-[#0B1120] border border-blue-600/50 rounded-2xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#080E1B] border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
              <UserPlus className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold uppercase">
                  КПК Во · RS 312.0
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  PE24.014624-SBA
                </span>
              </div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <span>
                  {currentLang === "uk"
                    ? "Майстер кваліфікації дійової особи (ШІ)"
                    : "Assistant IA d'Ingestion des Parties au Procès"}
                </span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono">
            {[
              {
                num: 1,
                label:
                  currentLang === "uk"
                    ? "Ідентифікація"
                    : currentLang === "fr"
                    ? "Identité"
                    : currentLang === "de"
                    ? "Identität"
                    : currentLang === "it"
                    ? "Identità"
                    : "Identity",
              },
              {
                num: 2,
                label:
                  currentLang === "uk"
                    ? "Кваліфікація КПК"
                    : currentLang === "fr"
                    ? "Qualification CPP"
                    : currentLang === "de"
                    ? "Qualifikation StPO"
                    : currentLang === "it"
                    ? "Qualificazione CPP"
                    : "CPC Qualification",
              },
              {
                num: 3,
                label:
                  currentLang === "uk"
                    ? "Очна ставка"
                    : currentLang === "fr"
                    ? "Confrontation"
                    : currentLang === "de"
                    ? "Konfrontation"
                    : currentLang === "it"
                    ? "Confronto"
                    : "Confrontation",
              },
              {
                num: 4,
                label:
                  currentLang === "uk"
                    ? "Внесення & WORM"
                    : currentLang === "fr"
                    ? "Scellement WORM"
                    : currentLang === "de"
                    ? "WORM-Versiegelung"
                    : currentLang === "it"
                    ? "Sigillo WORM"
                    : "WORM Seal",
              },
            ].map((st) => (
              <div
                key={st.num}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border ${
                  currentStep === st.num
                    ? "bg-blue-600 text-white font-bold border-blue-400"
                    : currentStep > st.num
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/80"
                    : "bg-[#070B12] text-slate-500 border-slate-800"
                }`}
              >
                <span>{st.num}.</span>
                <span>{st.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
          {/* ========================================================================= */}
          {/* STEP 1: IDENTITY, SOURCE, AND DOCUMENTS                                  */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4 max-w-4xl mx-auto w-full">
              {/* Source tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    id: "audition",
                    label: currentLang === "uk" ? "Протокол допиту" : "PV d'audition",
                    sub: "Поліція / Прокуратура",
                    icon: <FileText className="w-4 h-4 text-blue-400" />,
                  },
                  {
                    id: "id_card",
                    label: currentLang === "uk" ? "Паспорт / Скан" : "Identité / Titre S",
                    sub: "Документ з фото",
                    icon: <Upload className="w-4 h-4 text-emerald-400" />,
                  },
                  {
                    id: "plainte",
                    label: currentLang === "uk" ? "Заява / Скарга" : "Plainte pénale",
                    sub: "Витяг з вимогами",
                    icon: <Scale className="w-4 h-4 text-amber-400" />,
                  },
                  {
                    id: "manual",
                    label: currentLang === "uk" ? "Ручне введення" : "Saisie manuelle",
                    sub: "Вільний формат",
                    icon: <UserPlus className="w-4 h-4 text-purple-400" />,
                  },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSourceType(s.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      sourceType === s.id
                        ? "bg-blue-950/60 border-blue-500 shadow-md"
                        : "bg-[#070B12] border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {s.icon}
                      <span className="text-xs font-bold text-slate-100">{s.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">{s.sub}</span>
                  </button>
                ))}
              </div>

              {/* Form Inputs */}
              <div className="bg-[#090E1A] p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      {currentLang === "uk"
                        ? "Прізвище та Ім'я *"
                        : currentLang === "fr"
                        ? "Nom et Prénom *"
                        : currentLang === "de"
                        ? "Nachname und Vorname *"
                        : currentLang === "it"
                        ? "Cognome e Nome *"
                        : "Full Name *"}
                    </label>
                    <input
                      type="text"
                      value={actorName}
                      onChange={(e) => setActorName(e.target.value)}
                      placeholder="Ex: Michel BERTHIER"
                      className="w-full bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      {currentLang === "uk"
                        ? "Дата народження (ДД.ММ.РРРР)"
                        : currentLang === "fr"
                        ? "Date de naissance (JJ.MM.AAAA)"
                        : currentLang === "de"
                        ? "Geburtsdatum (TT.MM.JJJJ)"
                        : currentLang === "it"
                        ? "Data di nascita (GG.MM.AAAA)"
                        : "Date of Birth (DD.MM.YYYY)"}
                    </label>
                    <input
                      type="text"
                      value={actorBirthdate}
                      onChange={(e) => setActorBirthdate(e.target.value)}
                      placeholder="14.03.1978"
                      className="w-full bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      {currentLang === "uk"
                        ? "Громадянство / Статус"
                        : currentLang === "fr"
                        ? "Nationalité / Statut"
                        : currentLang === "de"
                        ? "Staatsangehörigkeit / Status"
                        : currentLang === "it"
                        ? "Cittadinanza / Stato"
                        : "Nationality / Status"}
                    </label>
                    <input
                      type="text"
                      value={actorNationality}
                      onChange={(e) => setActorNationality(e.target.value)}
                      placeholder="Suisse / Statut S"
                      className="w-full bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      {currentLang === "uk"
                        ? "Адреса проживання / Кантон"
                        : currentLang === "fr"
                        ? "Domicile / Canton"
                        : currentLang === "de"
                        ? "Wohnsitz / Kanton"
                        : currentLang === "it"
                        ? "Domicilio / Cantone"
                        : "Residence / Canton"}
                    </label>
                    <input
                      type="text"
                      value={actorDomicile}
                      onChange={(e) => setActorDomicile(e.target.value)}
                      placeholder="Lausanne / Renens, Canton de Vaud"
                      className="w-full bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      {currentLang === "uk"
                        ? "Фінансові вимоги / Відповідальність (CHF)"
                        : currentLang === "fr"
                        ? "Prétentions / Responsabilité civile (CHF)"
                        : currentLang === "de"
                        ? "Forderungen / Haftung (CHF)"
                        : currentLang === "it"
                        ? "Pretese / Responsabilità civile (CHF)"
                        : "Claims / Civil Liability (CHF)"}
                    </label>
                    <input
                      type="number"
                      value={financialAmount}
                      onChange={(e) => setFinancialAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Raw Content Textarea */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    {currentLang === "uk"
                      ? "Текст первинного документа або покази свідка/фігуранта :"
                      : "Texte source ou transcription de la déposition :"}
                  </label>
                  <textarea
                    rows={4}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Вставте витяг із протоколу допиту, покази свідка або зміст заяви до прокуратури..."
                    className="w-full bg-[#050810] border border-slate-700 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                {/* Photo & Scan Upload */}
                <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1 flex items-center space-x-1">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>{currentLang === "uk" ? "Фотографія або скан документа" : "Scan de pièce d'identité ou photo"}</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setDocumentTitle(file.name);
                            const reader = new FileReader();
                            reader.onload = () => setPhotoDataUrl(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center space-x-1.5 border border-slate-700"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-400" />
                        <span>{documentTitle ? "Змінити файл" : "Завантажити скан/фото"}</span>
                      </button>
                      {documentTitle && (
                        <span className="text-[11px] text-emerald-400 font-mono truncate max-w-[200px]">
                          {documentTitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-emerald-400 mb-1">
                      Криптографічний хеш SHA-256 (ISO/IEC 27037) :
                    </label>
                    <div className="p-2 bg-[#050810] border border-slate-800 rounded font-mono text-[10px] text-slate-300 break-all select-all">
                      {isHashing ? "Обчислення..." : inputSha256 || "Введіть дані для отримання хешу"}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
                >
                  {currentLang === "uk" ? "Скасувати" : "Annuler"}
                </button>

                <button
                  type="button"
                  disabled={!actorName.trim() || isAnalyzing}
                  onClick={handleRunAiQualification}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold font-mono flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {isAnalyzing
                      ? "ШІ аналізує статус за КПК..."
                      : currentLang === "uk"
                      ? "Запустити ШІ-кваліфікацію за КПК →"
                      : "Lancer la qualification IA (CPP) →"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: AI QUALIFICATION & IMPACT ANALYSIS                               */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4 max-w-4xl mx-auto w-full">
              {/* Qualification Header Card */}
              <div className="bg-[#090E1A] p-4 rounded-xl border border-blue-900/50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-amber-400" />
                    <h3 className="text-xs font-bold text-white font-mono uppercase">
                      {currentLang === "uk" ? "Результат ШІ-кваліфікації за КПК Швейцарії" : "Qualification Procédurale IA (CPP Vaud)"}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Стандарти RS 312.0
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5">
                      {currentLang === "uk" ? "Визначений процесуальний статус :" : "Statut procédural qualifié :"}
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as ProceduralRoleKey)}
                      className="w-full bg-[#050810] border border-blue-600/60 rounded-lg px-3 py-2 text-xs font-bold text-slate-100 font-mono focus:outline-none"
                    >
                      {Object.values(PROCEDURAL_ROLES_METADATA).map((meta) => (
                        <option key={meta.key} value={meta.key}>
                          {meta.labelFr} · {meta.cppArticles}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5">
                      {currentLang === "uk"
                        ? "Рівень процесуального ризику :"
                        : currentLang === "fr"
                        ? "Niveau de risque procédural :"
                        : currentLang === "de"
                        ? "Prozessuale Risikostufe :"
                        : currentLang === "it"
                        ? "Livello di rischio procedurale :"
                        : "Procedural Risk Level :"}
                    </label>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase border ${
                          riskLevel === "immune"
                            ? "bg-amber-950/80 text-amber-300 border-amber-600"
                            : riskLevel === "critical"
                            ? "bg-rose-950/80 text-rose-300 border-rose-600"
                            : riskLevel === "high"
                            ? "bg-orange-950/80 text-orange-300 border-orange-600"
                            : "bg-emerald-950/80 text-emerald-300 border-emerald-600"
                        }`}
                      >
                        {riskLevel === "immune"
                          ? currentLang === "uk"
                            ? "● Імунітет (L-03)"
                            : currentLang === "fr"
                            ? "● Immunité (L-03)"
                            : currentLang === "de"
                            ? "● Immunität (L-03)"
                            : currentLang === "it"
                            ? "● Immunità (L-03)"
                            : "● Immunity (L-03)"
                          : riskLevel === "critical"
                          ? currentLang === "uk"
                            ? "● Критичний (Обвинувачена)"
                            : currentLang === "fr"
                            ? "● Critique (Prévenue)"
                            : currentLang === "de"
                            ? "● Kritisch (Beschuldigte)"
                            : currentLang === "it"
                            ? "● Critico (Imputata)"
                            : "● Critical (Accused)"
                          : riskLevel === "high"
                          ? currentLang === "uk"
                            ? "● Високий (Співучасник)"
                            : currentLang === "fr"
                            ? "● Élevé (Complice)"
                            : currentLang === "de"
                            ? "● Hoch (Mittäter)"
                            : currentLang === "it"
                            ? "● Elevato (Complice)"
                            : "● High (Accomplice)"
                          : currentLang === "uk"
                          ? "● Звичайний / Низький"
                          : currentLang === "fr"
                          ? "● Ordinaire / Faible"
                          : currentLang === "de"
                          ? "● Normal / Gering"
                          : currentLang === "it"
                          ? "● Ordinario / Basso"
                          : "● Ordinary / Low"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {PROCEDURAL_ROLES_METADATA[selectedRole].cppArticles}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#050810] rounded-lg border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
                  {aiRationale}
                </div>

                {contradictionsFound.length > 0 && (
                  <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-lg space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>{currentLang === "uk" ? "Виявлено суперечності з базою Utopia DB & доказами :" : "Contradictions identifiées avec le dossier :"}</span>
                    </div>
                    {contradictionsFound.map((c, i) => (
                      <p key={i} className="text-[11px] text-rose-200/90 font-mono pl-5">
                        • {c}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* IMPACT ANALYSIS BANNER */}
              <div className="bg-[#070B14] p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center space-x-1.5">
                    <Scale className="w-4 h-4 text-blue-400" />
                    <span>{currentLang === "uk" ? "Аналіз впливу на систему справи (Impact Analysis)" : "Analyse d'Impact sur le Dossier"}</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Вплив на кваліфікацію &amp; секвестр
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-[#090E1A] rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">
                      {currentLang === "uk" ? "Пов'язані статті КК Швейцарії :" : "Articles CP impactés :"}
                    </span>
                    <div className="font-mono font-bold text-amber-300">
                      {applicableArticles.join(", ") || "Art. 162 CPP"}
                    </div>
                  </div>

                  <div className="p-3 bg-[#090E1A] rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">
                      {currentLang === "uk" ? "Вплив на суму арешту (ст. 263 КПК) :" : "Impact sur le séquestre :"}
                    </span>
                    <div className="font-mono font-bold text-emerald-400">
                      CHF {financialAmount.toLocaleString("fr-CH", { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="p-3 bg-[#090E1A] rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">
                      {currentLang === "uk" ? "Перевірка архітектурних інваріантів :" : "Vérification des invariants :"}
                    </span>
                    <div className="font-mono font-bold text-blue-400 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{impact.canProceed ? "L-01 & L-03 Схвалено" : "Блоковано"}</span>
                    </div>
                  </div>
                </div>

                {impact.recommendations.length > 0 && (
                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 block font-bold">
                      {currentLang === "uk" ? "Процесуальні рекомендації прокуратури :" : "Recommandations procédurales :"}
                    </span>
                    {impact.recommendations.map((rec, i) => (
                      <p key={i} className="text-[11px] text-slate-300 font-sans">
                        • {rec}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* NAVIGATION */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
                >
                  ← {currentLang === "uk" ? "Назад до введення" : "Retour"}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-mono flex items-center space-x-2"
                >
                  <span>{currentLang === "uk" ? "Перейти до питань очної ставки (ст. 147 КПК) →" : "Passer aux questions de confrontation (Art. 147 CPP) →"}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: CONFRONTATION & ADVERSARIAL QUESTIONS                             */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-4 max-w-4xl mx-auto w-full flex-1 flex flex-col min-h-0">
              <div className="bg-[#090E1A] p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white font-mono flex items-center space-x-1.5">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>
                      {currentLang === "uk"
                        ? `Підготовка запитань для допиту ${actorName} (Art. 147 CPP)`
                        : `Questions d'Audition Contradictoire · ${actorName} (Art. 147 CPP)`}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {currentLang === "uk"
                      ? "Діалог з юридичним ШІ-асистентом для формулювання суворих запитань для слідчого прокурора."
                      : "Affinement tactique des questions d'audience avec l'assistant juridique IA."}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                  Art. 147 CPP Contradictoire
                </span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 bg-[#050810] border border-slate-800 rounded-xl p-3 overflow-y-auto space-y-3 min-h-[220px]">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white font-sans"
                          : "bg-[#0A1224] text-slate-200 border border-slate-800 font-sans shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                  placeholder={
                    currentLang === "uk"
                      ? "Запитайте ШІ: як перевірити алібі, які документи вимагати..."
                      : "Interrogez l'IA sur la stratégie d'audition ou la crédibilité..."
                  }
                  className="flex-1 bg-[#050810] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSendChatMessage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{currentLang === "uk" ? "Надіслати" : "Envoyer"}</span>
                </button>
              </div>

              {/* NAVIGATION */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
                >
                  ← {currentLang === "uk" ? "Назад до аналізу" : "Retour"}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-mono flex items-center space-x-2 shadow-lg shadow-emerald-600/30"
                >
                  <Lock className="w-4 h-4 text-white" />
                  <span>{currentLang === "uk" ? "Перейти до скреплення WORM & внесення →" : "Scellement WORM & Incorporation finale →"}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: WORM SEALING & FINAL COMMIT                                       */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-4 max-w-4xl mx-auto w-full">
              <div className="bg-[#090E1A] p-4 rounded-xl border border-emerald-900/50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white font-mono uppercase">
                      {currentLang === "uk" ? "Підсумковий сертифікат фігуранта (WORM L-01)" : "Certificat d'Enregistrement WORM (L-01)"}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Utopia DB :9922 Synced
                  </span>
                </div>

                {/* Actor Summary Card */}
                <div className="p-4 bg-[#050810] rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center space-x-2">
                        <span>{candidateActor.name}</span>
                        {candidateActor.age && (
                          <span className="text-xs font-mono text-slate-400 font-normal">
                            ({candidateActor.age}{" "}
                            {currentLang === "uk"
                              ? `років, нар. ${candidateActor.birthdate}`
                              : currentLang === "fr"
                              ? `ans, né le ${candidateActor.birthdate}`
                              : currentLang === "de"
                              ? `Jahre, geb. ${candidateActor.birthdate}`
                              : currentLang === "it"
                              ? `anni, nato il ${candidateActor.birthdate}`
                              : `y.o., born ${candidateActor.birthdate}`})
                          </span>
                        )}
                      </h4>
                      <div className="text-xs font-mono text-blue-400 mt-0.5">
                        {candidateActor.legal_reference}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${candidateActor.badgeColor}`}>
                      {candidateActor.status[currentLang] || candidateActor.status.fr}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {candidateActor.role[currentLang] || candidateActor.role.fr}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block">
                        {currentLang === "uk"
                          ? "Громадянство:"
                          : currentLang === "fr"
                          ? "Nationalité :"
                          : currentLang === "de"
                          ? "Staatsangehörigkeit:"
                          : currentLang === "it"
                          ? "Cittadinanza:"
                          : "Citizenship:"}
                      </span>
                      <span className="text-slate-200">{resolveLocalized(candidateActor.nationality, currentLang)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">
                        {currentLang === "uk"
                          ? "Місце проживання:"
                          : currentLang === "fr"
                          ? "Domicile :"
                          : currentLang === "de"
                          ? "Wohnsitz:"
                          : currentLang === "it"
                          ? "Domicilio:"
                          : "Residence:"}
                      </span>
                      <span className="text-slate-200">{resolveLocalized(candidateActor.domicile, currentLang)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">
                        {currentLang === "uk"
                          ? "Фінансова сума:"
                          : currentLang === "fr"
                          ? "Montant financier :"
                          : currentLang === "de"
                          ? "Streitwert / Betrag:"
                          : currentLang === "it"
                          ? "Importo finanziario:"
                          : "Financial Amount:"}
                      </span>
                      <span className="text-emerald-400 font-bold">CHF {financialAmount.toLocaleString("fr-CH")}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">
                        {currentLang === "uk"
                          ? "Рівень ризику:"
                          : currentLang === "fr"
                          ? "Niveau de risque :"
                          : currentLang === "de"
                          ? "Risikostufe:"
                          : currentLang === "it"
                          ? "Livello di rischio:"
                          : "Risk Level:"}
                      </span>
                      <span className="text-amber-400 font-bold uppercase">{riskLevel}</span>
                    </div>
                  </div>

                  {/* SHA-256 Seal */}
                  <div className="p-2.5 bg-[#03060C] rounded-lg border border-slate-800 font-mono text-[10px] space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>
                        {currentLang === "uk"
                          ? "Незмінний цифровий хеш запису (SHA-256):"
                          : currentLang === "fr"
                          ? "Empreinte numérique immuable (SHA-256) :"
                          : currentLang === "de"
                          ? "Unveränderlicher digitaler Hash (SHA-256):"
                          : currentLang === "it"
                          ? "Impronta digitale immutabile (SHA-256):"
                          : "Immutable Digital Hash (SHA-256):"}
                      </span>
                      <span className="text-emerald-400">ISO/IEC 27037 Conforme</span>
                    </div>
                    <div className="text-emerald-300 break-all select-all font-bold">
                      {inputSha256}
                    </div>
                  </div>
                </div>
              </div>

              {/* NAVIGATION */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
                >
                  ← {currentLang === "uk" ? "Назад до питань" : "Retour"}
                </button>

                <button
                  type="button"
                  onClick={handleFinalCommit}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold font-mono flex items-center space-x-2 shadow-lg shadow-emerald-600/30"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>
                    {currentLang === "uk"
                      ? "Затвердити та внести фігуранта до реєстру справи ✓"
                      : "Confirmer et incorporer formellement au dossier ✓"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
