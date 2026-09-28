import React, { useState, useMemo } from "react";
import {
  Search,
  FolderOpen,
  Sparkles,
  Cloud,
  FileText,
  Scale,
  Printer,
  Users,
  UserPlus,
  Brain,
  BookOpen,
  Layers,
  HelpCircle,
  Database,
  Radio,
  Send,
  ArrowRight,
  Filter,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import { WorkspaceTab } from "./Topbar";
import { LegalCase } from "../lib/casesManager";

interface ToolsCatalogViewProps {
  currentLang: SupportedLanguage;
  onTabChange: (tab: WorkspaceTab) => void;
  onOpenEvidenceWizard?: () => void;
  onOpenActorWizard?: () => void;
  onOpenSwissCodes?: () => void;
  onOpenGlossary?: () => void;
  onOpenDocs?: () => void;
  onOpenJudicialBundle?: () => void;
  onOpenCaseSync?: () => void;
  onSendToKindle?: () => void;
  onOpenSettings?: () => void;
  onShowToast?: (title: string, desc: string, type?: "success" | "info") => void;
  activeCase?: LegalCase;
}

type ToolCategory = "all" | "evidence" | "documents" | "actors" | "corpus" | "integrity";

interface ToolItem {
  id: string;
  category: "evidence" | "documents" | "actors" | "corpus" | "integrity";
  title: Record<SupportedLanguage, string>;
  description: Record<SupportedLanguage, string>;
  tags: string[];
  icon: any;
  accentColor: string;
  actionType: "tab" | "modal" | "function";
  targetTab?: WorkspaceTab;
  onExecute?: () => void;
  badge?: Record<SupportedLanguage, string>;
}

export const ToolsCatalogView: React.FC<ToolsCatalogViewProps> = ({
  currentLang,
  onTabChange,
  onOpenEvidenceWizard,
  onOpenActorWizard,
  onOpenSwissCodes,
  onOpenGlossary,
  onOpenDocs,
  onOpenJudicialBundle,
  onOpenCaseSync,
  onSendToKindle,
  onShowToast,
  activeCase,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>("all");

  const tools: ToolItem[] = useMemo(
    () => [
      // 1. EVIDENCE & FORENSICS
      {
        id: "tool-factbook",
        category: "evidence",
        title: {
          uk: "Factbook: Мультимедійна доказова база",
          fr: "Factbook : Base multimédia des preuves",
          de: "Factbook : Multimediale Beweismittelbasis",
          it: "Factbook : Archivio multimediale delle prove",
          en: "Factbook : Multimedia Evidence Base",
        },
        description: {
          uk: "Каталог 16 офіційних доказів P-01..P-16 (аудіо, фото, скани) з перевіркою EXIF, спектрограмами та ланцюжком схоронності ISO/IEC 27037.",
          fr: "Catalogue des 16 pièces cotées P-01..P-16 avec spectrogrammes, métadonnées EXIF et chaîne de traçabilité ISO/IEC 27037.",
          de: "Katalog der 16 Beweisstücke P-01..P-16 mit Spektrogrammen, EXIF-Metadaten und ISO/IEC 27037 Kette.",
          it: "Catalogo dei 16 documenti P-01..P-16 con spettrogrammi, metadati EXIF e catena di custodia ISO/IEC 27037.",
          en: "Catalog of 16 admitted exhibits P-01..P-16 with audio spectrograms, EXIF metadata, and ISO/IEC 27037 chain of custody.",
        },
        tags: ["P-01..P-16", "EXIF", "ISO 27037", "Spectrogramme"],
        icon: FolderOpen,
        accentColor: "border-blue-500/40 text-blue-400 bg-blue-500/10",
        actionType: "tab",
        targetTab: "factbook",
        badge: {
          uk: "16 доказів",
          fr: "16 pièces",
          de: "16 Beweise",
          it: "16 prove",
          en: "16 exhibits",
        },
      },
      {
        id: "tool-evidence-wizard",
        category: "evidence",
        title: {
          uk: "Майстер додавання доказів (ШІ & GDrive)",
          fr: "Assistant d'ingestion de preuves (IA & GDrive)",
          de: "Beweis-Assistent (KI & Google Drive)",
          it: "Assistente acquisizione prove (IA & GDrive)",
          en: "AI Evidence Ingestion Wizard (GDrive)",
        },
        description: {
          uk: "Імпорт локальних файлів або вибір з Google Drive, автоматичний розрахунок цифрового SHA-256 відбитку та процедурна кваліфікація.",
          fr: "Importation locale ou sélecteur Google Drive avec calcul automatique du hachage SHA-256 et qualification procédurale.",
          de: "Lokaler Import oder Google Drive Auswahl mit automatischer SHA-256 Hash-Generierung und StPO-Qualifikation.",
          it: "Importazione locale o Google Drive con generazione automatica hash SHA-256 e qualificazione procedurale.",
          en: "Local file or Google Drive import with automated SHA-256 hashing and procedural qualification under Swiss CPC.",
        },
        tags: ["Google Drive", "SHA-256", "EXIF", "Audio"],
        icon: Sparkles,
        accentColor: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",
        actionType: "modal",
        onExecute: onOpenEvidenceWizard,
        badge: {
          uk: "ШІ-Імпорт",
          fr: "Import IA",
          de: "KI-Import",
          it: "Import IA",
          en: "AI Import",
        },
      },
      {
        id: "tool-gdrive-browser",
        category: "evidence",
        title: {
          uk: "Google Drive Селектор Матеріалів Справи",
          fr: "Navigateur Google Drive du Dossier",
          de: "Google Drive Dossier-Browser",
          it: "Browser Google Drive del Fascicolo",
          en: "Google Drive Case Repository Browser",
        },
        description: {
          uk: "Хмарний браузер Google Workspace Drive для прив'язки сканів, аудіозаписів та фото звітів безпосередньо до досьє PE24.014624-SBA.",
          fr: "Parcours des dossiers Google Drive pour lier scans officiels, enregistrements audio et photos au dossier PE24.014624-SBA.",
          de: "Cloud-Browser für Google Drive zur Verknüpfung von Scans, Audio und Fotos mit dem Dossier PE24.014624-SBA.",
          it: "Browser cloud Google Drive per collegare scansioni ufficiali, registrazioni audio e foto al fascicolo PE24.014624-SBA.",
          en: "Google Workspace Drive cloud picker to bind scanned documents, audio recordings, and alibi photos to case PE24.014624-SBA.",
        },
        tags: ["GDrive", "Cloud", "OAuth 2.0", "Workspace"],
        icon: Cloud,
        accentColor: "border-sky-500/40 text-sky-400 bg-sky-500/10",
        actionType: "modal",
        onExecute: onOpenEvidenceWizard,
        badge: {
          uk: "OAuth 2.0",
          fr: "OAuth 2.0",
          de: "OAuth 2.0",
          it: "OAuth 2.0",
          en: "OAuth 2.0",
        },
      },

      // 2. PROCEDURAL DOCS & TEXTS
      {
        id: "tool-kindle-review",
        category: "documents",
        title: {
          uk: "Студія правок & Бітемпоральний Diff",
          fr: "Studio de révision & Diff bitemporel",
          de: "Revisionsstudio & Bitemporaler Diff",
          it: "Studio di revisione & Diff bitemporale",
          en: "Revision Studio & Bitemporal Diff",
        },
        description: {
          uk: "Редактор 18 розділів досьє з підтримкою правок, надиктовування голосом (Kindle Voice Review) та синхронізації з Utopia DB.",
          fr: "Édition des 18 chapitres du dossier, dictée vocale (Kindle Voice Review) et validation des écarts de versions.",
          de: "Bearbeitung der 18 Kapitel, Sprachnotizen (Kindle Voice Review) und bitemporaler Versionsvergleich.",
          it: "Modifica dei 18 capitoli del fascicolo, dettatura vocale e confronto bitemporale delle versioni.",
          en: "Full editor for the 18 case chapters with Kindle Voice Review, speech notes, and bitemporal text diff.",
        },
        tags: ["18 розділів", "Diff", "Whispersync", "Voice"],
        icon: FileText,
        accentColor: "border-blue-500/40 text-blue-400 bg-blue-500/10",
        actionType: "tab",
        targetTab: "kindle_review",
        badge: {
          uk: "18 розділів",
          fr: "18 chapitres",
          de: "18 Kapitel",
          it: "18 capitoli",
          en: "18 chapters",
        },
      },
      {
        id: "tool-pleadings-generator",
        category: "documents",
        title: {
          uk: "Генератор клопотань & Секвестр (Art. 263 CPP)",
          fr: "Générateur de requêtes & Séquestre (Art. 263 CPP)",
          de: "Antragsgenerator & Beschlagnahme (Art. 263 StPO)",
          it: "Generatore istanze & Sequestro (Art. 263 CPP)",
          en: "Motions Generator & Sequestration (Art. 263 CPC)",
        },
        description: {
          uk: "Складання процесуальних клопотань: невідкладний секвестр рахунків на CHF 47'700.00, додаткові слідчі дії (ст. 318) та скарги (ст. 393).",
          fr: "Rédaction de requêtes : séquestre bancaire urgent de CHF 47'700.00, actes d'instruction complémentaires (Art. 318) et recours.",
          de: "Erstellung förmlicher Anträge: Kontosperre über CHF 47'700.00, Beweisanträge (Art. 318) und Beschwerde.",
          it: "Redazione istanze: sequestro conservativo di CHF 47'700.00, atti istruttori complementari (Art. 318) e ricorsi.",
          en: "Draft formal motions: urgent bank asset freeze up to CHF 47,700.00, complementary investigative actions (Art. 318), and appeals.",
        },
        tags: ["Art. 263 CPP", "Art. 318 CPP", "CHF 47'700", "Requêtes"],
        icon: Scale,
        accentColor: "border-amber-500/40 text-amber-400 bg-amber-500/10",
        actionType: "tab",
        targetTab: "pleadings",
        badge: {
          uk: "CHF 47'700",
          fr: "CHF 47'700",
          de: "CHF 47'700",
          it: "CHF 47'700",
          en: "CHF 47,700",
        },
      },
      {
        id: "tool-judicial-bundle",
        category: "documents",
        title: {
          uk: "Офіційний Судовий Бандл PDF/A (Art. 100 CPP)",
          fr: "Bordereau judiciaire officiel PDF/A (Art. 100 CPP)",
          de: "Offizielles Gerichtsbundle PDF/A (Art. 100 StPO)",
          it: "Fascicolo d'udienza ufficiale PDF/A (Art. 100 CPP)",
          en: "Official Judicial Bundle PDF/A (Art. 100 CPC)",
        },
        description: {
          uk: "Генерація зведеного доказового пакета з титульною карткою, таблицею доказів, QR-кодами аудіо та підписами для слідчого судді.",
          fr: "Génération de l'inventaire officiel certifié avec page de garde, cotes P-01..P-16, codes QR audio et signatures.",
          de: "Erstellung des amtlichen Beweisdossiers mit Deckblatt, QR-Codes und Prüfsummen für die Staatsanwaltschaft.",
          it: "Generazione del fascicolo d'udienza certificato con frontespizio, codici QR audio e firme per il magistrato.",
          en: "Certified evidentiary bundle generator compliant with Art. 100 CPC including cover sheet, exhibit table, and audio QR links.",
        },
        tags: ["PDF/A", "Art. 100 CPP", "Bordereau", "QR Codes"],
        icon: Printer,
        accentColor: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",
        actionType: "modal",
        onExecute: onOpenJudicialBundle,
        badge: {
          uk: "PDF/A-1b",
          fr: "PDF/A-1b",
          de: "PDF/A-1b",
          it: "PDF/A-1b",
          en: "PDF/A-1b",
        },
      },

      // 3. ACTORS & RIGHTS
      {
        id: "tool-actors-registry",
        category: "actors",
        title: {
          uk: "Реєстр фігурантів & Процесуальні права",
          fr: "Registre des parties & Droits procéduraux",
          de: "Parteienregister & Verfahrensrechte",
          it: "Registro delle parti & Diritti processuali",
          en: "Parties Registry & Procedural Rights",
        },
        description: {
          uk: "Управління учасниками процесу PE24.014624-SBA: потерпілий (L-04), обвинувачені, добросовісна третя особа (L-03, ст. 933 CC) та PADR.",
          fr: "Gestion des protagonistes du dossier : partie plaignante (L-04), prévenues, tiers de bonne foi (L-03, Art. 933 CC) et PADR.",
          de: "Verwaltung der Parteien: Privatkläger (L-04), Beschuldigte, gutgläubiger Dritter (L-03, Art. 933 ZGB) und PADR.",
          it: "Gestione delle parti: persona offesa (L-04), imputate, terzo di buona fede (L-03, Art. 933 CC) e PADR.",
          en: "Parties management: private complainant (L-04), defendants, bona fide third party (L-03, Art. 933 CC), and PADR under duress.",
        },
        tags: ["Art. 115 CPP", "Art. 933 CC", "L-03", "L-04"],
        icon: Users,
        accentColor: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
        actionType: "tab",
        targetTab: "actors",
        badge: {
          uk: "5 фігурантів",
          fr: "5 parties",
          de: "5 Parteien",
          it: "5 parti",
          en: "5 parties",
        },
      },
      {
        id: "tool-actor-wizard",
        category: "actors",
        title: {
          uk: "Майстер кваліфікації фігуранта (ШІ)",
          fr: "Assistant de qualification d'une partie (IA)",
          de: "Parteiqualifikations-Assistent (KI)",
          it: "Assistente qualificazione della parte (IA)",
          en: "AI Party Ingestion & Standing Wizard",
        },
        description: {
          uk: "Покроковий майстер внесення нової особи з фото, цивільним позовом та ШІ-визначенням процесуального статусу за КПК Швейцарії.",
          fr: "Formulaire guidé pour ajouter un protagoniste avec photo, créance civile et qualification automatique du rôle sous le CPP.",
          de: "Assistent zur Erfassung neuer Personen mit Foto, Zivilforderung und automatischer rechtlicher Einstufung.",
          it: "Procedura guidata per registrare una parte con foto, pretesa civile e qualificazione automatica ex CPP.",
          en: "Guided wizard to ingest an actor with photo, civil damage claims, and automated procedural qualification under Swiss CPC.",
        },
        tags: ["Art. 111..126 CPP", "Photo", "Pretension", "ШІ"],
        icon: UserPlus,
        accentColor: "border-teal-500/40 text-teal-400 bg-teal-500/10",
        actionType: "modal",
        onExecute: onOpenActorWizard,
        badge: {
          uk: "Кваліфікатор",
          fr: "Qualificateur",
          de: "StPO-Prüfung",
          it: "Qualifica",
          en: "Standing",
        },
      },

      // 4. AI & CORPUS
      {
        id: "tool-ai-copilot",
        category: "corpus",
        title: {
          uk: "Astryx Legal Copilot & ШІ-Студія",
          fr: "Astryx Legal Copilot & Studio IA",
          de: "Astryx Legal Copilot & KI-Studio",
          it: "Astryx Legal Copilot & Studio IA",
          en: "Astryx Legal Copilot & AI Studio",
        },
        description: {
          uk: "Аналіз допустимості аудіодоказів (ATF 146 IV 9), розрахунок радіуса ураження (Blast Radius) та синтез юридичних висновків.",
          fr: "Analyse d'admissibilité des preuves audio (ATF 146 IV 9), évaluation du rayon d'impact et synthèse des conclusions.",
          de: "Beweisverwertbarkeitsprüfung (BGE 146 IV 9), Analyse des Schadensradius und Synthese juristischer Argumente.",
          it: "Valutazione ammissibilità prove audio (ATF 146 IV 9), calcolo del raggio d'impatto e sintesi conclusioni.",
          en: "Admissibility analysis under precedent ATF 146 IV 9, Blast Radius assessment, and procedural legal opinions synthesis.",
        },
        tags: ["ATF 146 IV 9", "Blast Radius", "Gemini 2.5", "Jurisprudence"],
        icon: Brain,
        accentColor: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",
        actionType: "tab",
        targetTab: "ai_copilot",
        badge: {
          uk: "Copilot",
          fr: "Copilot",
          de: "Copilot",
          it: "Copilot",
          en: "Copilot",
        },
      },
      {
        id: "tool-swiss-codes",
        category: "corpus",
        title: {
          uk: "База законів та кодексів Швейцарії (35 статей)",
          fr: "Corpus des lois suisses et vaudoises (35 articles)",
          de: "Schweizer Gesetzessammlung (35 Artikel)",
          it: "Raccolta legislativa svizzera (35 articoli)",
          en: "Swiss Legal Codes Repository (35 Articles)",
        },
        description: {
          uk: "Повний текст профільних статей Кримінального кодексу (CP), КПК (CPP), Цивільного (CC) та Зобов'язального (CO) права з прецедентами.",
          fr: "Textes bilingues complets des articles pertinents du CP, CPP, CC, CO et LEI avec jurisprudence fédérale associée.",
          de: "Vollständige Gesetzestexte zu StGB, StPO, ZGB, OR und AIG mit einschlägiger Bundesgerichtspraxis.",
          it: "Testi integrali delle norme di CP, CPP, CC, CO e LStrI con giurisprudenza federale di riferimento.",
          en: "Full bilingual texts of applicable Swiss Criminal Code, CPC, Civil Code, and Code of Obligations with precedents.",
        },
        tags: ["CP", "CPP", "CC", "CO", "LEI", "35 статей"],
        icon: BookOpen,
        accentColor: "border-amber-500/40 text-amber-400 bg-amber-500/10",
        actionType: "modal",
        onExecute: onOpenSwissCodes,
        badge: {
          uk: "35 статей",
          fr: "35 articles",
          de: "35 Artikel",
          it: "35 articoli",
          en: "35 articles",
        },
      },
      {
        id: "tool-glossary",
        category: "corpus",
        title: {
          uk: "Юридичний глосарій & Абревіатури B-SDD",
          fr: "Glossaire juridique & Acronymes B-SDD",
          de: "Juristisches Glossar & B-SDD Akronyme",
          it: "Glossario giuridico & Acronimi B-SDD",
          en: "Legal Glossary & B-SDD Acronyms",
        },
        description: {
          uk: "Тлумачення швейцарських та латинських юридичних понять (ATF, MP, PADR, WORM, Invariants L-01..L-05) усіма 5 мовами.",
          fr: "Définitions des termes procéduraux suisses et latins (ATF, MP, PADR, WORM, Invariants L-01..L-05) en 5 langues.",
          de: "Erklärungen schweizerischer Rechtsbegriffe und Abkürzungen in 5 Landessprachen.",
          it: "Dizionario dei termini procedurali svizzeri e latini in 5 lingue.",
          en: "Comprehensive definitions of Swiss procedural concepts and B-SDD invariants in all 5 supported languages.",
        },
        tags: ["Glossaire", "Latin", "Sigles", "B-SDD"],
        icon: HelpCircle,
        accentColor: "border-slate-500/40 text-slate-300 bg-slate-500/10",
        actionType: "modal",
        onExecute: onOpenGlossary,
        badge: {
          uk: "Глосарій",
          fr: "Glossaire",
          de: "Glossar",
          it: "Glossario",
          en: "Glossary",
        },
      },

      // 5. INTEGRITY & DELIVERY
      {
        id: "tool-worm-ledger",
        category: "integrity",
        title: {
          uk: "Незмінний WORM Леджер суперсесій (L-01)",
          fr: "Registre WORM immuable des supersessions (L-01)",
          de: "Unveränderliches WORM-Protokoll (L-01)",
          it: "Registro WORM immutabile delle supersessioni (L-01)",
          en: "Immutable WORM Supersessions Ledger (L-01)",
        },
        description: {
          uk: "Журнал аудиту змін справи PE24.014624-SBA з криптографічними хешами SHA-256, що унеможливлює фальсифікацію доказів.",
          fr: "Piste d'audit inviolable du dossier avec empreintes SHA-256 bitemporelles, garantissant l'intégrité probatoire absolue.",
          de: "Fälschungssicheres Audit-Protokoll des Dossiers mit bitemporalen SHA-256 Hashes nach L-01.",
          it: "Tracciabilità immodificabile del fascicolo con impronte SHA-256 conformi all'invariante L-01.",
          en: "Tamper-evident forensic audit log of all case updates with cryptographic SHA-256 hashes under Invariant L-01.",
        },
        tags: ["WORM", "L-01", "SHA-256", "Supersession"],
        icon: Database,
        accentColor: "border-blue-500/40 text-blue-400 bg-blue-500/10",
        actionType: "tab",
        targetTab: "worm_ledger",
        badge: {
          uk: "L-01 WORM",
          fr: "L-01 WORM",
          de: "L-01 WORM",
          it: "L-01 WORM",
          en: "L-01 WORM",
        },
      },
      {
        id: "tool-case-sync",
        category: "integrity",
        title: {
          uk: "ШІ-Синхронізація справи & Utopia DB",
          fr: "Synchronisation du dossier & Utopia DB",
          de: "Dossiersynchronisation & Utopia DB",
          it: "Sincronizzazione fascicolo & Utopia DB",
          en: "Case Sync & Utopia DB Sequential Thinking",
        },
        description: {
          uk: "Перевірка досьє на сервері .251, ланцюг міркувань (Sequential Thinking) та автоматичне оновлення цілі секвестру CHF 47'700.00.",
          fr: "Audit du dossier sur le serveur .251, chaîne de raisonnement séquentiel et synchronisation du séquestre de CHF 47'700.00.",
          de: "Prüfung auf dem Server .251 mit Sequential Thinking und Aktualisierung des Beschlagnahmeziels auf CHF 47'700.00.",
          it: "Verifica sul server .251 con Sequential Thinking e aggiornamento del sequestro a CHF 47'700.00.",
          en: "Dossier audit on node .251 with Sequential Thinking and automatic update of CHF 47,700.00 sequestration claim.",
        },
        tags: ["Node .251", "Sequential Thinking", "CHF 47'700", "Sync"],
        icon: Radio,
        accentColor: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
        actionType: "modal",
        onExecute: onOpenCaseSync,
        badge: {
          uk: "Utopia DB",
          fr: "Utopia DB",
          de: "Utopia DB",
          it: "Utopia DB",
          en: "Utopia DB",
        },
      },
      {
        id: "tool-kindle-whispersync",
        category: "integrity",
        title: {
          uk: "Amazon Kindle Whispersync Експортер",
          fr: "Exportateur Amazon Kindle Whispersync",
          de: "Amazon Kindle Whispersync Exporteur",
          it: "Esportatore Amazon Kindle Whispersync",
          en: "Amazon Kindle Whispersync Dispatcher",
        },
        description: {
          uk: "Компіляція 18 розділів в EPUB 3.0 та бездротове доставлення на Kindle Whispersync.",
          fr: "Compilation des 18 chapitres en EPUB 3.0 et envoi sans fil vers Kindle Whispersync.",
          de: "Kompilierung der 18 Kapitel in EPUB 3.0 und drahtlose Übertragung an Kindle Whispersync.",
          it: "Compilazione dei 18 capitoli in EPUB 3.0 e invio wireless a Kindle Whispersync.",
          en: "Automated EPUB 3.0 compilation of the 18 chapters and direct wireless delivery to Kindle Whispersync.",
        },
        tags: ["EPUB 3.0", "Kindle", "Whispersync", "E-Ink"],
        icon: Send,
        accentColor: "border-purple-500/40 text-purple-400 bg-purple-500/10",
        actionType: "function",
        onExecute: onSendToKindle,
        badge: {
          uk: "Whispersync",
          fr: "Whispersync",
          de: "Whispersync",
          it: "Whispersync",
          en: "Whispersync",
        },
      },
    ],
    [
      onOpenEvidenceWizard,
      onOpenActorWizard,
      onOpenSwissCodes,
      onOpenGlossary,
      onOpenDocs,
      onOpenJudicialBundle,
      onOpenCaseSync,
      onSendToKindle,
    ]
  );

  // Filter tools by category and search
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCategory =
        selectedCategory === "all" || tool.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const title = (tool.title[currentLang] || tool.title.en).toLowerCase();
      const desc = (tool.description[currentLang] || tool.description.en).toLowerCase();
      const tags = tool.tags.join(" ").toLowerCase();

      return title.includes(q) || desc.includes(q) || tags.includes(q);
    });
  }, [tools, selectedCategory, searchQuery, currentLang]);

  const categories: { id: ToolCategory; label: Record<SupportedLanguage, string>; count: number }[] = [
    {
      id: "all",
      label: {
        uk: "Всі інструменти",
        fr: "Tous les outils",
        de: "Alle Werkzeuge",
        it: "Tutti gli strumenti",
        en: "All Tools",
      },
      count: tools.length,
    },
    {
      id: "evidence",
      label: {
        uk: "Докази & Форензік",
        fr: "Preuves & Forensique",
        de: "Beweise & Forensik",
        it: "Prove & Forense",
        en: "Evidence & Forensics",
      },
      count: tools.filter((t) => t.category === "evidence").length,
    },
    {
      id: "documents",
      label: {
        uk: "Процесуальні акти",
        fr: "Actes procéduraux",
        de: "Verfahrensakten",
        it: "Atti processuali",
        en: "Procedural Filings",
      },
      count: tools.filter((t) => t.category === "documents").length,
    },
    {
      id: "actors",
      label: {
        uk: "Фігуранти & Права",
        fr: "Parties & Droits",
        de: "Parteien & Rechte",
        it: "Parti & Diritti",
        en: "Parties & Standing",
      },
      count: tools.filter((t) => t.category === "actors").length,
    },
    {
      id: "corpus",
      label: {
        uk: "ШІ & Кодекси Швейцарії",
        fr: "IA & Corpus suisse",
        de: "KI & Schweizer Recht",
        it: "IA & Corpus svizzero",
        en: "AI & Swiss Codes",
      },
      count: tools.filter((t) => t.category === "corpus").length,
    },
    {
      id: "integrity",
      label: {
        uk: "Цілісність & WORM",
        fr: "Intégrité & WORM",
        de: "Integrität & WORM",
        it: "Integrità & WORM",
        en: "Integrity & WORM",
      },
      count: tools.filter((t) => t.category === "integrity").length,
    },
  ];

  const handleLaunchTool = (tool: ToolItem) => {
    if (tool.actionType === "tab" && tool.targetTab) {
      onTabChange(tool.targetTab);
      onShowToast?.(
        currentLang === "uk" ? "Перехід до інструменту" : "Ouverture de l'outil",
        tool.title[currentLang] || tool.title.en,
        "info"
      );
    } else if (tool.onExecute) {
      tool.onExecute();
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#070B14] p-3 sm:p-5 flex flex-col font-sans select-none">
      {/* Header Banner */}
      <div className="mb-4 bg-[#0A0F1D] border border-slate-800/80 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Filter className="w-4 h-4" />
              </span>
              <h1 className="text-base sm:text-lg font-mono font-bold text-white tracking-tight">
                {currentLang === "uk"
                  ? "🧰 Каталог інструментів B-SDD (Astryx Hub)"
                  : currentLang === "fr"
                  ? "🧰 Catalogue des outils B-SDD (Astryx Hub)"
                  : currentLang === "de"
                  ? "🧰 B-SDD Werkzeugkatalog (Astryx Hub)"
                  : currentLang === "it"
                  ? "🧰 Catalogo strumenti B-SDD (Astryx Hub)"
                  : "🧰 B-SDD Tools Catalog (Astryx Hub)"}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-mono">
              {currentLang === "uk"
                ? `Повний набір із 14 спеціалізованих інструментів кримінального провадження PE24.014624-SBA за швейцарським КПК (CPP RS 312.0).`
                : currentLang === "fr"
                ? `Ensemble complet des 14 modules d'investigation pénale vaudoise pour le dossier PE24.014624-SBA.`
                : `Complete suite of 14 criminal procedure tools tailored for Swiss dossier PE24.014624-SBA.`}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="px-2.5 py-1 rounded bg-[#0F172A] border border-slate-800 text-[11px] font-mono text-slate-300">
              <strong className="text-amber-400">{filteredTools.length}</strong> / {tools.length}{" "}
              {currentLang === "uk" ? "інструментів" : "outils"}
            </span>
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
              Utopia .251 Sync
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                currentLang === "uk"
                  ? "Пошук інструменту (назва, стаття КПК, тег)..."
                  : currentLang === "fr"
                  ? "Rechercher un outil (titre, article CPP, mot-clé)..."
                  : "Search tool by name, Swiss article, tag..."
              }
              className="w-full pl-9 pr-4 py-2 bg-[#070B14] border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-3 flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? "bg-blue-600 text-white font-bold shadow-sm"
                    : "bg-[#070B14] text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/80"
                }`}
              >
                <span>{cat.label[currentLang] || cat.label.en}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-blue-800 text-blue-200" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0A0F1D] border border-slate-800/60 rounded-xl text-center">
          <ShieldAlert className="w-10 h-10 text-slate-600 mb-2" />
          <h3 className="text-sm font-mono font-bold text-slate-300">
            {currentLang === "uk" ? "Інструментів не знайдено" : "Aucun outil trouvé"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {currentLang === "uk"
              ? "Спробуйте змінити пошуковий запит або обрати іншу категорію."
              : "Essayez de modifier votre recherche ou de sélectionner une autre catégorie."}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-mono"
          >
            {currentLang === "uk" ? "Скинути фільтри" : "Réinitialiser les filtres"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 pb-4">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            const title = tool.title[currentLang] || tool.title.en;
            const description = tool.description[currentLang] || tool.description.en;
            const badge = tool.badge?.[currentLang] || tool.badge?.en;

            return (
              <div
                key={tool.id}
                onClick={() => handleLaunchTool(tool)}
                className="group relative bg-[#0A0F1D] hover:bg-[#0D1527] border border-slate-800/80 hover:border-blue-500/50 rounded-xl p-4 transition-all duration-200 shadow-sm flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`p-2 rounded-lg border ${tool.accentColor} group-hover:scale-105 transition-transform shrink-0`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-mono font-bold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-1">
                          {title}
                        </h3>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                          {tool.category}
                        </span>
                      </div>
                    </div>

                    {badge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#0F172A] border border-slate-700/80 text-amber-300 shrink-0">
                        {badge}
                      </span>
                    )}
                  </div>

                  {/* Card Description */}
                  <p className="text-xs text-slate-400 font-sans leading-relaxed line-clamp-3 mb-3">
                    {description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tool.tags.map((tg) => (
                      <span
                        key={tg}
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#070B14] text-slate-400 border border-slate-800/90"
                      >
                        {tg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-[11px] text-blue-400 font-bold group-hover:underline flex items-center space-x-1">
                    <span>
                      {tool.actionType === "tab"
                        ? currentLang === "uk"
                          ? "Відкрити робочий стіл"
                          : "Ouvrir l'espace"
                        : currentLang === "uk"
                        ? "Запустити майстер"
                        : "Lancer l'assistant"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>

                  <span className="text-[10px] text-slate-500">
                    {tool.actionType === "tab" ? "Workspace" : "Interactive Modal"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
