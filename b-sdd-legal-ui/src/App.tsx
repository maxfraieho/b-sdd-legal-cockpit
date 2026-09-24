import { useState, useMemo } from "react";
import {
  Scale,
  ShieldCheck,
  Clock,
  FileText,
  CheckCircle2,
  GitBranch,
  Copy,
  Check,
  FolderOpen,
  Search,
  AlertTriangle,
  Gavel,
  HelpCircle,
  Settings,
  Lock,
  Edit3,
} from "lucide-react";
import {
  CHARGES,
  BORDEREAU_PIECES,
  CONFRONTATIONS,
  LEGAL_REQUISITIONS,
  ACTORS,
  CriminalCharge,
  BordereauPiece,
  ConfrontationItem,
  LegalRequisition,
  ActorItem,
  resolveLocalized,
  resolveLocalizedArray,
  LocalizedString,
} from "./data/legalData";
import { AppShell } from "./components/astryx/primitives";
import { AstryxZoneBoundary } from "./components/boundaries/AstryxZoneBoundary";
import { SupportedLanguage, AppSettings, TranslationOverrides } from "./types/i18n";
import { UI_TRANSLATIONS } from "./data/translations";
import {
  loadAppSettings,
  saveAppSettings,
  loadOverrides,
  saveOverride,
  removeOverride,
} from "./lib/translator";
import { AuthGate } from "./components/AuthGate";
import { SettingsModal } from "./components/SettingsModal";
import { ManualEditModal } from "./components/ManualEditModal";

type TabType =
  | "claim_chart"
  | "bordereau"
  | "confrontation"
  | "requisitions"
  | "drakon_trees"
  | "bitemporal_timeline"
  | "actor_matrix";

type DrakonScenario = "atf_146_iv_9" | "art_318_cpp" | "art_49_cp";

interface ManualEditState {
  isOpen: boolean;
  targetKey: string;
  fieldLabel: string;
  sourceFrenchText: string;
  currentTranslation: string;
}

export default function App() {
  // Settings & Localization State
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const qLang = p.get('lang') as SupportedLanguage;
      if (qLang && ['uk', 'fr', 'en'].includes(qLang)) return qLang;
    } catch {}
    return settings.language || 'uk';
  });
  const [overrides, setOverrides] = useState<TranslationOverrides>(() => loadOverrides());

  // Navigation & Selected Item State
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const qTab = p.get('tab') as TabType;
      if (qTab) return qTab;
    } catch {}
    return "claim_chart";
  });
  const [selectedCharge, setSelectedCharge] = useState<CriminalCharge>(CHARGES[0]);
  const [selectedActor, setSelectedActor] = useState<ActorItem>(ACTORS[5]);
  const [selectedPiece, setSelectedPiece] = useState<BordereauPiece>(BORDEREAU_PIECES[0]);
  const [selectedRequisition, setSelectedRequisition] = useState<LegalRequisition>(LEGAL_REQUISITIONS[0]);
  const [selectedConfrontation, setSelectedConfrontation] = useState<ConfrontationItem>(CONFRONTATIONS[0]);
  const [drakonScenario, setDrakonScenario] = useState<DrakonScenario>("atf_146_iv_9");

  // Search & Filters for Bordereau
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");

  // Feedback states
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedPieceCote, setCopiedPieceCote] = useState<string | null>(null);
  const [copiedRequisition, setCopiedRequisition] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      return p.get('settings') === 'true';
    } catch {
      return false;
    }
  });
  const [authKeyCounter, setAuthKeyCounter] = useState(0); // For instant re-locking
  const [manualEditState, setManualEditState] = useState<ManualEditState>({
    isOpen: false,
    targetKey: "",
    fieldLabel: "",
    sourceFrenchText: "",
    currentTranslation: "",
  });

  // Localization resolution helper
  const t = (key: string): string => {
    if (overrides[key]) return overrides[key];
    return UI_TRANSLATIONS[currentLang]?.[key] || UI_TRANSLATIONS['uk']?.[key] || key;
  };

  const loc = (val: LocalizedString | undefined, overrideKey?: string): string => {
    if (overrideKey && overrides[overrideKey]) {
      return overrides[overrideKey];
    }
    return resolveLocalized(val, currentLang);
  };

  const locFr = (val: LocalizedString | undefined): string => {
    return resolveLocalized(val, 'fr');
  };

  const locArr = (val: Record<SupportedLanguage, string[]> | string[] | undefined): string[] => {
    return resolveLocalizedArray(val, currentLang);
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setCurrentLang(newLang);
    const updated = { ...settings, language: newLang };
    setSettings(updated);
    saveAppSettings(updated);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (newSettings.language !== currentLang) {
      setCurrentLang(newSettings.language);
    }
  };

  const handleManualEditSave = (key: string, value: string) => {
    const updated = saveOverride(key, value);
    setOverrides({ ...updated });
  };

  const handleManualEditReset = (key: string) => {
    const updated = removeOverride(key);
    setOverrides({ ...updated });
  };

  const openManualEditor = (key: string, label: string, frText: string, currentText: string) => {
    setManualEditState({
      isOpen: true,
      targetKey: key,
      fieldLabel: label,
      sourceFrenchText: frText,
      currentTranslation: currentText,
    });
  };

  const handleLockSession = () => {
    sessionStorage.removeItem('b_sdd_auth_unlocked');
    sessionStorage.removeItem('b_sdd_auth_timestamp');
    setAuthKeyCounter(prev => prev + 1);
  };

  // Filtered pieces
  const filteredPieces = useMemo(() => {
    return BORDEREAU_PIECES.filter((p) => {
      const titleStr = loc(p.titre);
      const porteeStr = loc(p.portee_probatoire);
      const quoteStr = loc(p.citation_cle);

      const matchesSearch =
        titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        porteeStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quoteStr.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "Tous" || p.categorie === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, currentLang, overrides]);

  const copyLegalSnapshot = () => {
    const text = `### [B-SDD-LEGAL CONTEXT SNAPSHOT · MINISTÈRE PUBLIC DU CANTON DE VAUD]
JURISDICTION: Tribunal cantonal & Ministère public Vaud | Ref: CASE-SAMPLE-2026-CH
PARTIES: Victim: Alexandre DUBOIS (Art. 122 CPP, mineur né en 2012) | Demandeur civil: Marc MOREAU ($15'000 USD, Art. 118 CPP/41 CO) | Prévenue principale: Laurent VOGEL (Art. 138, 146, 157, 180, 181, 186 CP / Art. 118 LEI) | Co-prévenue: Claire VOGEL (Art. 24, 180, 181 CP) | Sous sujétion: Sophie MOREAU (Art. 182 CPP expertise) | Tiers de bonne foi: Jean-Paul VERNON (IMMUNITÉ L-03 GARANTIE).
DROIT APPLICABLE: Code pénal suisse (CP: Art. 123, 126, 138, 146, 157, 180, 181, 186, 303, 304, 24, 49) | LEI Art. 118 | CPP Art. 139–141 (ATF 146 IV 9 al. 2 / ATF 147 IV 9).
UTOPIA BITEMPORAL CONFLICT: F_1 fausse allégation contredite par F_2 (EXIF 1481) et F_3 (Audio 12 aveu).
CORPUS FORENSIQUE: 61 transcriptions certifiées | 2405 pièces locales | Utopia DB 192.168.3.251:9922 (ACTIF).`;
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const copyCourtParagraph = (charge: CriminalCharge) => {
    const text = `Concernant le chef d'accusation de ${loc(charge.title)} (${charge.code}), à charge de la prévenue ${charge.accused}, il appert des pièces versées sous scellés au dossier pénal CASE-SAMPLE-2026-CH que les éléments constitutifs objectifs et subjectifs sont intégralement réalisés. L'admissibilité des enregistrements est expressément établie sous l'angle de la pesée des intérêts dégagée par le Tribunal fédéral dans son arrêt ATF 146 IV 9 al. 2, l'intérêt supérieur de la protection de l'enfant mineur prévalant sur la sphère privée de la prévenue.

CONCLUSIONS PÉNALES :
${loc(charge.conclusions_penales)}

CONCLUSIONS CIVILES :
${loc(charge.conclusions_civiles)}`;
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  const copyPieceReference = (piece: BordereauPiece) => {
    const ref = `[Pièce ${piece.cote} : ${loc(piece.titre)} | Date: ${piece.date_faits} | SHA-256: ${piece.sha256.substring(0, 16)}... | Admissibilité: ${loc(piece.admissibilite)}]`;
    navigator.clipboard.writeText(ref);
    setCopiedPieceCote(piece.cote);
    setTimeout(() => setCopiedPieceCote(null), 2000);
  };

  const exportFullBordereau = () => {
    let md = `# BORDEREAU OFFICIEL DE PRODUCTION DE PIÈCES\n`;
    md += `Ministère public du canton de Vaud · Cause : CASE-SAMPLE-2026-CH\n`;
    md += `Partie Plaignante : Alexandre DUBOIS (rep. par son père) & Marc MOREAU\n`;
    md += `Prévenues : Laurent VOGEL & Claire VOGEL\n\n`;
    md += `| Cote | Date des Faits ($T_v$) | Date Versement ($T_t$) | Nature / Catégorie | Intitulé officiel de la pièce | Admissibilité / Base CPP | SHA-256 |\n`;
    md += `|---|---|---|---|---|---|---|\n`;
    BORDEREAU_PIECES.forEach((p) => {
      md += `| **${p.cote}** | ${p.date_faits} | ${p.date_versement} | ${p.categorie} | ${loc(p.titre)} | ${loc(p.admissibilite)} | \`${p.sha256.substring(0, 16)}...\` |\n`;
    });
    navigator.clipboard.writeText(md);
    alert(currentLang === 'uk' ? "Офіційний реєстр доказів скопійовано в буфер обміну (Markdown / Greffe)!" : "Bordereau officiel complet copié dans le presse-papier au format Markdown / Greffe !");
  };

  const copyRequisitionText = (req: LegalRequisition) => {
    navigator.clipboard.writeText(loc(req.texte_integral));
    setCopiedRequisition(true);
    setTimeout(() => setCopiedRequisition(false), 2500);
  };

  return (
    <AuthGate
      key={authKeyCounter}
      expectedPassword={settings.authPassword}
      autoLockMinutes={settings.autoLockMinutes}
      currentLang={currentLang}
      onLanguageChange={handleLanguageChange}
    >
      <AppShell className="bg-[#070B12] text-[#F8FAFC]">
        {/* =========================================================================
            TOPBAR : COCKPIT AVOCAT & DOSSIER CASE-SAMPLE-2026-CH
            ========================================================================= */}
        <AstryxZoneBoundary zoneName="Topbar">
          <header className="h-14 min-h-[3.5rem] bg-[#0D1424] border-b border-[#1E2D4A] px-4 sm:px-5 flex items-center justify-between z-20">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/40 px-2.5 py-1 rounded">
                <Scale className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold tracking-widest text-amber-400 uppercase mono">
                  {t('app_title')}
                </span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="hidden md:flex items-center space-x-2 text-xs">
                <span className="text-slate-400">{t('jurisdiction_label')}</span>
                <span className="font-semibold text-white mono bg-[#141E34] px-2 py-0.5 rounded border border-[#1E2D4A]">
                  {t('case_ref')}
                </span>
                <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800">
                  {t('procedure_type')}
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                  {t('plaintiff_role')}
                </span>
              </div>
            </div>

            {/* Right Action & Control Group */}
            <div className="flex items-center space-x-2 sm:space-x-3 text-xs mono">
              {/* Utopia DB live status */}
              <div className="hidden xl:flex items-center space-x-2 bg-[#141E34] px-2.5 py-1 rounded border border-[#1E2D4A]">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300">{t('utopia_db_label')}</span>
                <span className="text-slate-600">·</span>
                <span className="text-emerald-400 font-medium">{t('evidence_count_label')}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">{t('node_label')}</span>
              </div>

              {/* Language Switcher Buttons */}
              <div className="flex items-center bg-[#141E34] border border-[#1E2D4A] rounded p-0.5">
                {(['uk', 'fr', 'en'] as SupportedLanguage[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLanguageChange(l)}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-all ${
                      currentLang === l
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#1C2B49]'
                    }`}
                  >
                    {l === 'uk' ? '🇺🇦 UA' : l === 'fr' ? '🇨🇭 FR' : '🇬🇧 EN'}
                  </button>
                ))}
              </div>

              {/* Edit Mode Quick Toggle */}
              {settings.manualEditMode && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/60 border border-amber-600/50 px-2 py-0.5 rounded">
                  <Edit3 className="w-3 h-3" />
                  <span>{t('edit_mode_badge')}</span>
                </span>
              )}

              {/* Legal Snapshot Copy Button */}
              <button
                onClick={copyLegalSnapshot}
                className="hidden lg:flex items-center space-x-1.5 bg-[#141E34] hover:bg-[#1C2B49] text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded font-semibold transition-all shadow-sm"
                title={t('btn_snapshot')}
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? t('btn_snapshot_copied') : t('btn_snapshot')}</span>
              </button>

              {/* Settings Modal Button */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 bg-[#141E34] hover:bg-[#1C2B49] text-slate-300 hover:text-white border border-[#1E2D4A] rounded transition-colors"
                title={t('btn_settings')}
              >
                <Settings className="w-4 h-4 text-blue-400" />
              </button>

              {/* Instant Lock Button */}
              <button
                onClick={handleLockSession}
                className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded transition-colors"
                title={t('btn_lock')}
              >
                <Lock className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          </header>
        </AstryxZoneBoundary>

        {/* =========================================================================
            BARRE D'ONGLETS DU COCKPIT AVOCAT (7 MODULES PROFESSIONNELS)
            ========================================================================= */}
        <AstryxZoneBoundary zoneName="Navigation">
          <nav className="h-11 bg-[#0A0E1A] border-b border-[#1E2D4A] px-4 flex items-center space-x-1 text-xs font-medium overflow-x-auto">
            <button
              onClick={() => setActiveTab("claim_chart")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                activeTab === "claim_chart"
                  ? "bg-[#1C2B49] text-amber-400 font-semibold border border-amber-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#141E34]"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{t('tab_claim_chart')}</span>
            </button>

            <button
              onClick={() => setActiveTab("bordereau")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                activeTab === "bordereau"
                  ? "bg-[#1C2B49] text-amber-400 font-semibold border border-amber-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#141E34]"
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{t('tab_bordereau')}</span>
            </button>

            <button
              onClick={() => setActiveTab("confrontation")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                activeTab === "confrontation"
                  ? "bg-[#1C2B49] text-amber-400 font-semibold border border-amber-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#141E34]"
              }`}
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>{t('tab_confrontation')}</span>
            </button>

            <button
              onClick={() => setActiveTab("requisitions")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                activeTab === "requisitions"
                  ? "bg-[#1C2B49] text-amber-400 font-semibold border border-amber-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#141E34]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('tab_requisitions')}</span>
            </button>

            <button
              onClick={() => setActiveTab("drakon_trees")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                activeTab === "drakon_trees"
                  ? "bg-[#1C2B49] text-amber-400 font-semibold border border-amber-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#141E34]"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>{t('tab_drakon_trees')}</span>
            </button>

            <button
              onClick={() => setActiveTab("bitemporal_timeline")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                activeTab === "bitemporal_timeline"
                  ? "bg-[#1C2B49] text-amber-400 font-semibold border border-amber-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#141E34]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{t('tab_bitemporal_timeline')}</span>
            </button>

            <button
              onClick={() => setActiveTab("actor_matrix")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                activeTab === "actor_matrix"
                  ? "bg-[#1C2B49] text-amber-400 font-semibold border border-amber-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#141E34]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('tab_actor_matrix')}</span>
            </button>
          </nav>
        </AstryxZoneBoundary>

        {/* =========================================================================
            CONTENU PRINCIPAL SELON L'ONGLET ACTIF
            ========================================================================= */}
        <AstryxZoneBoundary zoneName="MainLegalWorkstation">
          <main className="flex-1 overflow-hidden bg-[#070B12]">
            {/* =======================================================================
                TAB 1: CHEFS D'ACCUSATION (CLAIM CHART)
                ======================================================================= */}
            {activeTab === "claim_chart" && (
              <div className="h-full grid grid-cols-12 overflow-hidden">
                {/* Colonne gauche: Liste des infractions */}
                <div className="col-span-4 border-r border-[#1E2D4A] bg-[#0D1424] flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-[#1E2D4A] bg-[#141E34]/50 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {t('charges_header')}
                    </span>
                    <span className="text-[11px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                      {t('charges_corroborated_badge')}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                    {CHARGES.map((c) => {
                      const isSelected = selectedCharge.id === c.id;
                      const titleStr = loc(c.title, `charge_${c.id}_title`);
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCharge(c)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer relative group ${
                            isSelected
                              ? "bg-[#1C2B49] border-amber-500 shadow-md shadow-amber-950/40"
                              : "bg-[#141E34] border-[#1E2D4A] hover:border-slate-600"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white mono">{c.code}</span>
                            <div className="flex items-center gap-1.5">
                              {settings.manualEditMode && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openManualEditor(`charge_${c.id}_title`, `${c.code} Назва`, locFr(c.title), titleStr);
                                  }}
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-200 transition-colors"
                                  title="Редагувати переклад"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 px-2 py-0.5 rounded-full flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{t('corroborated_pill')}</span>
                              </span>
                            </div>
                          </div>
                          <div className="text-xs font-semibold text-slate-200 mt-1">{titleStr}</div>
                          <div className="text-[11px] text-slate-400 mt-2 space-y-0.5">
                            <div>
                              <span className="text-rose-400 font-medium">{t('accused_label')}</span> {c.accused}
                            </div>
                            <div>
                              <span className="text-emerald-400 font-medium">{t('victim_label')}</span> {loc(c.victim)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 border-t border-[#1E2D4A] bg-[#0A0E1A] text-xs text-slate-400 leading-relaxed">
                    {t('framework_note')}
                  </div>
                </div>

                {/* Colonne droite: Détail de l'infraction & conclusions pour tribunal */}
                <div className="col-span-8 flex flex-col overflow-hidden bg-[#070B12]">
                  <div className="p-4 border-b border-[#1E2D4A] bg-[#0D1424] flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold text-white mono">{selectedCharge.code}</span>
                        <span className="text-slate-400">—</span>
                        <span className="text-sm font-semibold text-amber-300">
                          {loc(selectedCharge.title, `charge_${selectedCharge.id}_title`)}
                        </span>
                        {settings.manualEditMode && (
                          <button
                            type="button"
                            onClick={() =>
                              openManualEditor(
                                `charge_${selectedCharge.id}_title`,
                                `${selectedCharge.code} Назва`,
                                locFr(selectedCharge.title),
                                loc(selectedCharge.title, `charge_${selectedCharge.id}_title`)
                              )
                            }
                            className="p-1 rounded bg-slate-800 text-amber-400 hover:bg-slate-700"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {t('jurisprudence_label')}{" "}
                        <span className="text-slate-200 font-medium">{loc(selectedCharge.atf_ruling)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => copyCourtParagraph(selectedCharge)}
                      className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded text-xs font-semibold shadow-md transition-all mono"
                    >
                      {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSnippet ? t('btn_conclusions_copied') : t('btn_generate_conclusions')}</span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Conclusions Civiles et Pénales Expresses */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#141E34] border border-rose-900/60 p-3 rounded-lg text-xs space-y-1 relative">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-rose-300 uppercase tracking-wide mono text-[10px] flex items-center space-x-1">
                            <Gavel className="w-3.5 h-3.5" />
                            <span>{t('penal_conclusions_title')}</span>
                          </div>
                          {settings.manualEditMode && (
                            <button
                              type="button"
                              onClick={() =>
                                openManualEditor(
                                  `charge_${selectedCharge.id}_concl_penales`,
                                  `${selectedCharge.code} Кримінальні вимоги`,
                                  locFr(selectedCharge.conclusions_penales),
                                  loc(selectedCharge.conclusions_penales, `charge_${selectedCharge.id}_concl_penales`)
                                )
                              }
                              className="p-1 text-slate-400 hover:text-amber-400"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-slate-200 leading-relaxed">
                          {loc(selectedCharge.conclusions_penales, `charge_${selectedCharge.id}_concl_penales`)}
                        </p>
                      </div>

                      <div className="bg-[#141E34] border border-emerald-900/60 p-3 rounded-lg text-xs space-y-1 relative">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-emerald-300 uppercase tracking-wide mono text-[10px] flex items-center space-x-1">
                            <Scale className="w-3.5 h-3.5" />
                            <span>{t('civil_conclusions_title')}</span>
                          </div>
                          {settings.manualEditMode && (
                            <button
                              type="button"
                              onClick={() =>
                                openManualEditor(
                                  `charge_${selectedCharge.id}_concl_civiles`,
                                  `${selectedCharge.code} Цивільний позов`,
                                  locFr(selectedCharge.conclusions_civiles),
                                  loc(selectedCharge.conclusions_civiles, `charge_${selectedCharge.id}_concl_civiles`)
                                )
                              }
                              className="p-1 text-slate-400 hover:text-amber-400"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-slate-200 leading-relaxed">
                          {loc(selectedCharge.conclusions_civiles, `charge_${selectedCharge.id}_concl_civiles`)}
                        </p>
                      </div>
                    </div>

                    {/* Éléments constitutifs et preuves versées */}
                    {selectedCharge.elements.map((elem) => (
                      <div
                        key={elem.id}
                        className="border border-[#1E2D4A] bg-[#0D1424] rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-[#1C2B49] text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded mono font-bold">
                                {elem.id}
                              </span>
                              <h4 className="text-sm font-bold text-slate-100">
                                {loc(elem.title, `elem_${elem.id}_title`)}
                              </h4>
                              {settings.manualEditMode && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openManualEditor(
                                      `elem_${elem.id}_title`,
                                      `${elem.id} Назва`,
                                      locFr(elem.title),
                                      loc(elem.title, `elem_${elem.id}_title`)
                                    )
                                  }
                                  className="p-1 text-slate-400 hover:text-amber-400"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              {loc(elem.description, `elem_${elem.id}_desc`)}
                            </p>
                          </div>
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded uppercase font-semibold">
                            {t('established_in_law')}
                          </span>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-[#1E2D4A]/60">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mono">
                            {t('evidence_dossier_title')}
                          </div>

                          {elem.citations.map((cit) => (
                            <div
                              key={cit.evidence_id}
                              className="bg-[#141E34] border border-[#1E2D4A] rounded p-3 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-200 mono text-[11px] flex items-center space-x-1.5">
                                  <span className="bg-amber-950 text-amber-300 border border-amber-700 px-1.5 py-0.2 rounded font-bold">
                                    {cit.cote}
                                  </span>
                                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{cit.title}</span>
                                </span>
                                <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded mono">
                                  {cit.timecode}
                                </span>
                              </div>

                              <p className="text-slate-300 italic border-l-2 border-amber-500 pl-2.5 py-0.5 bg-[#070B12]/40">
                                "{loc(cit.quote, `cit_${cit.evidence_id}_quote`)}"
                              </p>

                              <div className="flex items-center justify-between text-[10px] text-slate-400 mono pt-1 border-t border-[#1E2D4A]/40">
                                <span>{t('evidence_sha256')} {cit.sha256.substring(0, 24)}...</span>
                                <span className="text-emerald-400">{loc(cit.admissibility)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =======================================================================
                TAB 2: BORDEREAU OFFICIEL DES PIÈCES (P-01 À P-15)
                ======================================================================= */}
            {activeTab === "bordereau" && (
              <div className="h-full grid grid-cols-12 overflow-hidden">
                {/* Colonne gauche: Filtres et Liste des pièces numérotées */}
                <div className="col-span-5 border-r border-[#1E2D4A] bg-[#0D1424] flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-[#1E2D4A] bg-[#141E34]/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                        <FolderOpen className="w-4 h-4 text-amber-400" />
                        <span>{t('bordereau_header')}</span>
                      </span>
                      <button
                        onClick={exportFullBordereau}
                        className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 px-2 py-1 rounded mono font-semibold flex items-center space-x-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{t('btn_export_bordereau')}</span>
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('search_placeholder')}
                        className="w-full bg-[#070B12] border border-[#1E2D4A] rounded px-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Category Pills */}
                    <div className="flex items-center space-x-1 overflow-x-auto text-[10px]">
                      {[
                        { id: "Tous", label: t('filter_all') },
                        { id: "Audio", label: t('filter_audio') },
                        { id: "Photo EXIF", label: t('filter_photo') },
                        { id: "Médical", label: t('filter_medical') },
                        { id: "Bancaire", label: t('filter_bank') },
                        { id: "Message", label: t('filter_message') },
                        { id: "Procédure", label: t('filter_procedure') },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-2 py-0.5 rounded transition-all whitespace-nowrap ${
                            selectedCategory === cat.id
                              ? "bg-amber-500 text-black font-bold"
                              : "bg-[#070B12] text-slate-400 hover:text-slate-200 border border-[#1E2D4A]"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Liste défilante des pièces */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {filteredPieces.map((piece) => {
                      const isSelected = selectedPiece.cote === piece.cote;
                      const titleStr = loc(piece.titre, `piece_${piece.cote}_title`);
                      const porteeStr = loc(piece.portee_probatoire, `piece_${piece.cote}_portee`);
                      return (
                        <div
                          key={piece.cote}
                          onClick={() => setSelectedPiece(piece)}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#1C2B49] border-amber-500 shadow-sm"
                              : "bg-[#141E34] border-[#1E2D4A] hover:border-slate-600"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs bg-amber-950 text-amber-300 border border-amber-700 px-1.5 py-0.5 rounded mono">
                                {piece.cote}
                              </span>
                              <span className="text-[10px] bg-[#070B12] px-1.5 py-0.5 rounded text-slate-300 border border-[#1E2D4A] mono">
                                {piece.categorie}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 mono">{piece.date_faits}</span>
                          </div>

                          <div className="text-xs font-semibold text-slate-100 mt-1.5 line-clamp-1">
                            {titleStr}
                          </div>

                          <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                            {porteeStr}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Colonne droite: Détail forensique & citation de la pièce sélectionnée */}
                <div className="col-span-7 flex flex-col p-6 overflow-y-auto bg-[#070B12] space-y-4">
                  <div className="border border-[#1E2D4A] bg-[#0D1424] rounded-xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-bold bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded mono">
                            {t('piece_detail_cote')} {selectedPiece.cote}
                          </span>
                          <span className="text-xs bg-[#141E34] text-slate-300 px-2 py-0.5 rounded border border-[#1E2D4A]">
                            {selectedPiece.categorie}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-2 flex items-center gap-2">
                          <span>{loc(selectedPiece.titre, `piece_${selectedPiece.cote}_title`)}</span>
                          {settings.manualEditMode && (
                            <button
                              type="button"
                              onClick={() =>
                                openManualEditor(
                                  `piece_${selectedPiece.cote}_title`,
                                  `${selectedPiece.cote} Назва`,
                                  locFr(selectedPiece.titre),
                                  loc(selectedPiece.titre, `piece_${selectedPiece.cote}_title`)
                                )
                              }
                              className="p-1 text-slate-400 hover:text-amber-400"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </h3>
                      </div>

                      <button
                        onClick={() => copyPieceReference(selectedPiece)}
                        className="flex items-center space-x-1 bg-[#141E34] hover:bg-[#1C2B49] text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded text-xs mono font-semibold"
                      >
                        {copiedPieceCote === selectedPiece.cote ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedPieceCote === selectedPiece.cote ? t('piece_ref_copied') : t('btn_copy_piece_ref')}</span>
                      </button>
                    </div>

                    {/* Timeline calibration */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-[#141E34] p-3 rounded-lg border border-[#1E2D4A]">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold mono">{t('valid_time_label')}</span>
                        <span className="text-white font-medium mono">{selectedPiece.date_faits}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold mono">{t('transaction_time_label')}</span>
                        <span className="text-white font-medium mono">{selectedPiece.date_versement}</span>
                      </div>
                    </div>

                    {/* Portée probatoire */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wide mono">{t('probative_value_label')}</span>
                        {settings.manualEditMode && (
                          <button
                            type="button"
                            onClick={() =>
                              openManualEditor(
                                `piece_${selectedPiece.cote}_portee`,
                                `${selectedPiece.cote} Доказове значення`,
                                locFr(selectedPiece.portee_probatoire),
                                loc(selectedPiece.portee_probatoire, `piece_${selectedPiece.cote}_portee`)
                              )
                            }
                            className="p-1 text-slate-400 hover:text-amber-400"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="p-3 bg-[#141E34] border border-[#1E2D4A] rounded text-xs text-slate-200 leading-relaxed">
                        {loc(selectedPiece.portee_probatoire, `piece_${selectedPiece.cote}_portee`)}
                      </div>
                    </div>

                    {/* Citation Verbatim */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wide mono">{t('verbatim_quote_label')}</span>
                        {settings.manualEditMode && (
                          <button
                            type="button"
                            onClick={() =>
                              openManualEditor(
                                `piece_${selectedPiece.cote}_quote`,
                                `${selectedPiece.cote} Цитата`,
                                locFr(selectedPiece.citation_cle),
                                loc(selectedPiece.citation_cle, `piece_${selectedPiece.cote}_quote`)
                              )
                            }
                            className="p-1 text-slate-400 hover:text-amber-400"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <blockquote className="p-3 bg-amber-950/20 border-l-2 border-amber-500 rounded text-xs text-amber-200 italic leading-relaxed">
                        "{loc(selectedPiece.citation_cle, `piece_${selectedPiece.cote}_quote`)}"
                      </blockquote>
                    </div>

                    {/* Admissibilité CPP & Intégrité ISO 27037 */}
                    <div className="space-y-2 pt-2 border-t border-[#1E2D4A]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{t('admissibility_regime_label')}</span>
                        <span className="text-emerald-400 font-semibold">{loc(selectedPiece.admissibilite)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{t('local_path_label')}</span>
                        <span className="text-slate-300 mono text-[11px] truncate max-w-md">{selectedPiece.fichier_local}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{t('certified_sha256_label')}</span>
                        <span className="text-amber-400 mono text-[11px]">{selectedPiece.sha256}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =======================================================================
                TAB 3: MATRICE DE CONFRONTATION & AUDITIONS
                ======================================================================= */}
            {activeTab === "confrontation" && (
              <div className="h-full grid grid-cols-12 overflow-hidden">
                {/* Colonne gauche: Sélection du thème de confrontation */}
                <div className="col-span-4 border-r border-[#1E2D4A] bg-[#0D1424] flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-[#1E2D4A] bg-[#141E34]/50 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {t('confrontation_header')}
                    </span>
                    <span className="text-[11px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                      {t('direct_refutation_badge')}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                    {CONFRONTATIONS.map((conf) => {
                      const isSelected = selectedConfrontation.id === conf.id;
                      const titleStr = loc(conf.theme, `conf_${conf.id}_theme`);
                      return (
                        <div
                          key={conf.id}
                          onClick={() => setSelectedConfrontation(conf)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#1C2B49] border-rose-500 shadow-md shadow-rose-950/40"
                              : "bg-[#141E34] border-[#1E2D4A] hover:border-slate-600"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded mono">
                              {conf.id}
                            </span>
                            <span className="text-[10px] text-amber-400 mono">{conf.preuve_objective.cote}</span>
                          </div>
                          <div className="text-xs font-semibold text-slate-200 mt-2">{titleStr}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 border-t border-[#1E2D4A] bg-[#0A0E1A] text-xs text-slate-400 leading-relaxed">
                    {t('procedural_goal_note')}
                  </div>
                </div>

                {/* Colonne droite: Face-à-face Allégation vs Preuve objective & Questions d'audience */}
                <div className="col-span-8 flex flex-col p-6 overflow-y-auto bg-[#070B12] space-y-4">
                  <div className="border border-[#1E2D4A] bg-[#0D1424] rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <Gavel className="w-4 h-4 text-rose-400" />
                        <span>{loc(selectedConfrontation.theme, `conf_${selectedConfrontation.id}_theme`)}</span>
                      </h3>
                      <span className="text-xs bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800 mono">
                        {t('confrontation_tag')}
                      </span>
                    </div>

                    {/* Grille comparative : Allégation c. Preuve objective */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Cartouche Allégation suspecte */}
                      <div className="bg-rose-950/20 border border-rose-900/60 rounded-lg p-4 space-y-2">
                        <div className="text-xs font-bold text-rose-400 uppercase tracking-wide mono flex items-center justify-between">
                          <span>{t('false_allegation_card')}</span>
                          <span className="text-[10px] text-slate-400">{loc(selectedConfrontation.allegation_suspecte.source)}</span>
                        </div>
                        <p className="text-xs text-rose-100 leading-relaxed">
                          {loc(selectedConfrontation.allegation_suspecte.texte, `conf_${selectedConfrontation.id}_alleg`)}
                        </p>
                        <div className="text-[11px] text-rose-300/80 pt-2 border-t border-rose-900/40">
                          <strong>{t('major_inconsistency_label')}</strong> {loc(selectedConfrontation.allegation_suspecte.incoherence, `conf_${selectedConfrontation.id}_incoh`)}
                        </div>
                      </div>

                      {/* Cartouche Preuve matérielle irréfutable */}
                      <div className="bg-emerald-950/20 border border-emerald-900/60 rounded-lg p-4 space-y-2">
                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide mono flex items-center justify-between">
                          <span>{t('objective_proof_card')}</span>
                          <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300 border border-emerald-800">
                            {selectedConfrontation.preuve_objective.cote}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-white">
                          {loc(selectedConfrontation.preuve_objective.titre)}
                        </div>
                        <p className="text-xs text-emerald-100 leading-relaxed italic bg-[#070B12]/50 p-2 rounded border border-emerald-900/40">
                          "{loc(selectedConfrontation.preuve_objective.verbatim, `conf_${selectedConfrontation.id}_proof_quote`)}"
                        </p>
                        <div className="text-[10px] text-slate-400 mono pt-1">
                          {t('certified_timestamp_label')} {selectedConfrontation.preuve_objective.date_reelle}
                        </div>
                      </div>
                    </div>

                    {/* Questionnaire d'interrogatoire pour l'avocat */}
                    <div className="space-y-2 pt-2 border-t border-[#1E2D4A]">
                      <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mono flex items-center space-x-1.5">
                        <HelpCircle className="w-4 h-4 text-amber-400" />
                        <span>{t('courtroom_questions_title')}</span>
                      </div>

                      <div className="space-y-2">
                        {locArr(selectedConfrontation.questions_interrogatoire).map((q, idx) => (
                          <div
                            key={idx}
                            className="bg-[#141E34] border border-[#1E2D4A] rounded p-3 text-xs text-slate-200 flex items-start space-x-2.5"
                          >
                            <span className="font-bold text-amber-400 mono">Q{idx + 1}.</span>
                            <span className="leading-relaxed font-medium">{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Piège tactique et anticipation de la défense */}
                    <div className="p-3 bg-amber-950/30 border border-amber-600/70 rounded-lg text-xs space-y-1 text-amber-200">
                      <div className="font-bold text-amber-300 flex items-center space-x-1.5 text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t('tactical_advice_title')}</span>
                      </div>
                      <p className="leading-relaxed text-slate-300">
                        {loc(selectedConfrontation.piege_tactique_defense, `conf_${selectedConfrontation.id}_piege`)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =======================================================================
                TAB 4: ÉCRITURES JUDICIAIRES & REQUÊTES ART. 318 CPP
                ======================================================================= */}
            {activeTab === "requisitions" && (
              <div className="h-full grid grid-cols-12 overflow-hidden">
                {/* Colonne gauche: Liste des écritures judiciaires prêtes */}
                <div className="col-span-4 border-r border-[#1E2D4A] bg-[#0D1424] flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-[#1E2D4A] bg-[#141E34]/50 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {t('requisitions_header')}
                    </span>
                    <span className="text-[11px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                      {t('vaud_standards_badge')}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                    {LEGAL_REQUISITIONS.map((req) => {
                      const isSelected = selectedRequisition.id === req.id;
                      const titleStr = loc(req.titre, `req_${req.id}_title`);
                      return (
                        <div
                          key={req.id}
                          onClick={() => setSelectedRequisition(req)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#1C2B49] border-blue-500 shadow-md shadow-blue-950/40"
                              : "bg-[#141E34] border-[#1E2D4A] hover:border-slate-600"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-blue-300 mono bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                              {req.base_legale}
                            </span>
                            <span className="text-[10px] text-slate-400 mono">{loc(req.type)}</span>
                          </div>
                          <div className="text-xs font-semibold text-slate-200 mt-2">{titleStr}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 border-t border-[#1E2D4A] bg-[#0A0E1A] text-xs text-slate-400 leading-relaxed">
                    {t('clerk_note')}
                  </div>
                </div>

                {/* Colonne droite: Prévisualisation et copie de l'écriture */}
                <div className="col-span-8 flex flex-col p-6 overflow-y-auto bg-[#070B12] space-y-4">
                  <div className="border border-[#1E2D4A] bg-[#0D1424] rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-blue-400 mono">{selectedRequisition.base_legale}</span>
                        <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                          <span>{loc(selectedRequisition.titre, `req_${selectedRequisition.id}_title`)}</span>
                          {settings.manualEditMode && (
                            <button
                              type="button"
                              onClick={() =>
                                openManualEditor(
                                  `req_${selectedRequisition.id}_title`,
                                  `${selectedRequisition.id} Назва`,
                                  locFr(selectedRequisition.titre),
                                  loc(selectedRequisition.titre, `req_${selectedRequisition.id}_title`)
                                )
                              }
                              className="p-1 text-slate-400 hover:text-amber-400"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </h3>
                        <div className="text-xs text-slate-400 mt-0.5">{loc(selectedRequisition.destinataire)}</div>
                      </div>

                      <button
                        onClick={() => copyRequisitionText(selectedRequisition)}
                        className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded text-xs font-semibold shadow-md transition-all mono"
                      >
                        {copiedRequisition ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedRequisition ? t('requisition_copied') : t('btn_copy_requisition')}</span>
                      </button>
                    </div>

                    {/* Conclusions de la requête */}
                    <div className="p-3 bg-[#141E34] border border-[#1E2D4A] rounded-lg space-y-2">
                      <div className="text-xs font-bold text-amber-300 uppercase tracking-wide mono">
                        {t('formal_conclusions_title')}
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-200">
                        {locArr(selectedRequisition.conclusions).map((c, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-amber-400 font-bold mono">{i + 1}.</span>
                            <span className="leading-relaxed">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Texte intégral format papier / greffe */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-bold uppercase tracking-wider mono">{t('procedural_text_title')}</span>
                        <div className="flex items-center gap-2">
                          <span className="mono text-[11px]">{t('standard_format_sub')}</span>
                          {settings.manualEditMode && (
                            <button
                              type="button"
                              onClick={() =>
                                openManualEditor(
                                  `req_${selectedRequisition.id}_text`,
                                  `${selectedRequisition.id} Текст клопотання`,
                                  locFr(selectedRequisition.texte_integral),
                                  loc(selectedRequisition.texte_integral, `req_${selectedRequisition.id}_text`)
                                )
                              }
                              className="p-1 text-slate-400 hover:text-amber-400"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <pre className="p-4 bg-[#070B12] border border-[#1E2D4A] rounded-lg text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed select-text overflow-x-auto">
                        {loc(selectedRequisition.texte_integral, `req_${selectedRequisition.id}_text`)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =======================================================================
                TAB 5: ARBRES DÉCISIONNELS DRAKON (3 SCÉNARIOS)
                ======================================================================= */}
            {activeTab === "drakon_trees" && (
              <div className="h-full flex flex-col p-6 overflow-y-auto bg-[#070B12]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center space-x-2">
                      <GitBranch className="w-5 h-5 text-amber-400" />
                      <span>{t('drakon_header')}</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {t('drakon_sub')}
                    </p>
                  </div>

                  {/* Sélecteur de scénario DRAKON */}
                  <div className="flex items-center space-x-1 bg-[#141E34] p-1 rounded-lg border border-[#1E2D4A] text-xs">
                    <button
                      onClick={() => setDrakonScenario("atf_146_iv_9")}
                      className={`px-3 py-1 rounded transition-all ${
                        drakonScenario === "atf_146_iv_9"
                          ? "bg-amber-500 text-black font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {t('scenario_atf')}
                    </button>
                    <button
                      onClick={() => setDrakonScenario("art_318_cpp")}
                      className={`px-3 py-1 rounded transition-all ${
                        drakonScenario === "art_318_cpp"
                          ? "bg-amber-500 text-black font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {t('scenario_req')}
                    </button>
                    <button
                      onClick={() => setDrakonScenario("art_49_cp")}
                      className={`px-3 py-1 rounded transition-all ${
                        drakonScenario === "art_49_cp"
                          ? "bg-amber-500 text-black font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {t('scenario_art49')}
                    </button>
                  </div>
                </div>

                {/* SCÉNARIO 1 : ATF 146 IV 9 */}
                {drakonScenario === "atf_146_iv_9" && (
                  <div className="bg-[#0D1424] border border-[#1E2D4A] rounded-xl p-6 flex flex-col items-center justify-center">
                    <svg viewBox="0 0 900 520" className="w-full max-w-4xl h-auto">
                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748B" />
                        </marker>
                        <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
                        </marker>
                        <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#F43F5E" />
                        </marker>
                      </defs>

                      {/* Node 1: Input */}
                      <rect x="330" y="20" width="240" height="50" rx="8" fill="#1E2D4A" stroke="#3B82F6" strokeWidth="2" />
                      <text x="450" y="50" fill="#FFFFFF" fontSize="13" fontWeight="bold" textAnchor="middle">
                        {currentLang === 'uk' ? 'Доказ : Аудіозапис 32 / 38' : currentLang === 'en' ? 'Exhibit: Audio Recording 32 / 38' : 'Pièce : Enregistrement Audio 32 / 38'}
                      </text>

                      <line x1="450" y1="70" x2="450" y2="110" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                      {/* Node 2: Gate 1 (Moyen licite ?) */}
                      <polygon points="450,110 570,160 450,210 330,160" fill="#141E34" stroke="#F59E0B" strokeWidth="2" />
                      <text x="450" y="155" fill="#F8FAFC" fontSize="11" fontWeight="bold" textAnchor="middle">
                        {currentLang === 'uk' ? 'Доказ здобуто' : currentLang === 'en' ? 'Evidence lawfully' : 'Preuve obtenue'}
                      </text>
                      <text x="450" y="172" fill="#F8FAFC" fontSize="11" fontWeight="bold" textAnchor="middle">
                        {currentLang === 'uk' ? 'законним шляхом?' : currentLang === 'en' ? 'obtained?' : 'licitement ?'}
                      </text>

                      {/* Oui Branch -> Admissible Art 139 al 1 */}
                      <line x1="570" y1="160" x2="680" y2="160" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-green)" />
                      <text x="610" y="150" fill="#10B981" fontSize="11" fontWeight="bold">
                        {currentLang === 'uk' ? 'ТАК' : currentLang === 'en' ? 'YES' : 'OUI'}
                      </text>
                      <rect x="680" y="135" width="180" height="50" rx="6" fill="#064E3B" stroke="#10B981" strokeWidth="2" />
                      <text x="770" y="165" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                        Art. 139 al. 1 CPP (Direct)
                      </text>

                      {/* Non Branch -> Prohibited methods */}
                      <line x1="450" y1="210" x2="450" y2="250" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                      <text x="465" y="235" fill="#94A3B8" fontSize="11" fontWeight="bold">
                        {currentLang === 'uk' ? 'НІ' : currentLang === 'en' ? 'NO' : 'NON'}
                      </text>

                      {/* Node 3: Gate 2 (Art 140 Prohibé ?) */}
                      <polygon points="450,250 570,300 450,350 330,300" fill="#141E34" stroke="#F43F5E" strokeWidth="2" />
                      <text x="450" y="295" fill="#F8FAFC" fontSize="11" fontWeight="bold" textAnchor="middle">
                        {currentLang === 'uk' ? 'Катування / Примус' : currentLang === 'en' ? 'Torture / Coercion' : 'Torture / Contrainte'}
                      </text>
                      <text x="450" y="312" fill="#F8FAFC" fontSize="11" fontWeight="bold" textAnchor="middle">
                        (Art. 140 CPP) ?
                      </text>

                      {/* Oui Branch -> Inexploitable absolu */}
                      <line x1="570" y1="300" x2="680" y2="300" stroke="#F43F5E" strokeWidth="2" markerEnd="url(#arrow-red)" />
                      <text x="610" y="290" fill="#F43F5E" fontSize="11" fontWeight="bold">
                        {currentLang === 'uk' ? 'ТАК' : currentLang === 'en' ? 'YES' : 'OUI'}
                      </text>
                      <rect x="680" y="275" width="180" height="50" rx="6" fill="#881337" stroke="#F43F5E" strokeWidth="2" />
                      <text x="770" y="305" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                        Art. 141 al. 1 CPP (Nul)
                      </text>

                      {/* Non Branch -> Pesée des intérêts ATF 146 IV 9 */}
                      <line x1="450" y1="350" x2="450" y2="390" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                      <text x="465" y="375" fill="#94A3B8" fontSize="11" fontWeight="bold">
                        {currentLang === 'uk' ? 'НІ' : currentLang === 'en' ? 'NO' : 'NON'}
                      </text>

                      {/* Node 4: Gate 3 (Pesée des intérêts) */}
                      <polygon points="450,390 600,440 450,490 300,440" fill="#141E34" stroke="#10B981" strokeWidth="2" />
                      <text x="450" y="435" fill="#F8FAFC" fontSize="11" fontWeight="bold" textAnchor="middle">
                        {currentLang === 'uk' ? 'Баланс інтересів (ATF 146 IV 9) :' : currentLang === 'en' ? 'Balancing of Interests (ATF 146 IV 9):' : 'Pesée des intérêts ATF 146 IV 9 :'}
                      </text>
                      <text x="450" y="452" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle">
                        {currentLang === 'uk' ? 'Захист дитини > Приватність?' : currentLang === 'en' ? 'Child Protection > Privacy?' : 'Protection mineur > Vie privée ?'}
                      </text>

                      {/* Oui Branch -> Pleinement exploitable */}
                      <line x1="600" y1="440" x2="680" y2="440" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-green)" />
                      <text x="630" y="430" fill="#10B981" fontSize="11" fontWeight="bold">
                        {currentLang === 'uk' ? 'ТАК' : currentLang === 'en' ? 'YES' : 'OUI'}
                      </text>
                      <rect x="680" y="415" width="200" height="50" rx="6" fill="#064E3B" stroke="#10B981" strokeWidth="2" />
                      <text x="780" y="438" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                        Art. 141 al. 3 CPP
                      </text>
                      <text x="780" y="454" fill="#A7F3D0" fontSize="10" textAnchor="middle">
                        {currentLang === 'uk' ? 'ПОВНІСТЮ ДОПУСТИМИЙ' : currentLang === 'en' ? 'FULLY ADMISSIBLE' : 'PLEINEMENT EXPLOITABLE'}
                      </text>
                    </svg>

                    <div className="mt-4 p-4 bg-[#141E34] border border-[#1E2D4A] rounded-lg max-w-4xl w-full text-xs text-slate-300 leading-relaxed space-y-2">
                      <div className="font-bold text-amber-300 text-sm">
                        {currentLang === 'uk' ? 'Доктрина та судове резюме для прокурора :' : currentLang === 'en' ? 'Doctrine & Judicial Summary for Prosecutor:' : 'Doctrine & Synthèse Judiciaire pour le Procureur :'}
                      </div>
                      <p>
                        {currentLang === 'uk' ? (
                          <>
                            У прецедентному рішенні <strong>ATF 146 IV 9</strong> Федеральний суд закріпив, що таємний аудіозапис, зроблений приватною особою, залишається допустимим доказом у суді, якщо розслідуване правопорушення має високу суспільну небезпеку (тяжкі погрози вбивством дитині, шахрайство, вимагання), а запис здійснювався з метою захисту фізичної та психічної недоторканності вразливої особи. Усі клопотання захисту про визнання доказів недопустимими за ст. 141 КПК підлягають безумовному відхиленню.
                          </>
                        ) : currentLang === 'en' ? (
                          <>
                            In the landmark ruling <strong>ATF 146 IV 9</strong>, the Federal Supreme Court established that a clandestine audio recording made by a private party remains admissible in court whenever the offense under investigation is of significant gravity (death threats against a minor child, extortion, fraud), and the recording was made to safeguard the physical and psychological integrity of a vulnerable person. All motions to exclude evidence under Art. 141 CPC must be dismissed.
                          </>
                        ) : (
                          <>
                            Dans l'arrêt de principe <strong>ATF 146 IV 9</strong>, le Tribunal fédéral a consacré qu'un enregistrement sonore clandestin réalisé par un particulier demeure exploitable en justice dès lors que l'infraction en cause est d'une gravité certaine (menaces de mort contre enfant mineur, extorsion) et que l'acte visait à préserver l'intégrité physique et psychique d'un être vulnérable. Toutes les exceptions de nullité soulevées par la défense sous l'Art. 141 CPP doivent être rejetées.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* SCÉNARIO 2 : ART. 318 CPP (RÉQUISITIONS) */}
                {drakonScenario === "art_318_cpp" && (
                  <div className="bg-[#0D1424] border border-[#1E2D4A] rounded-xl p-6 flex flex-col items-center justify-center">
                    <svg viewBox="0 0 900 480" className="w-full max-w-4xl h-auto">
                      <defs>
                        <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" />
                        </marker>
                        <marker id="arrow-green2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
                        </marker>
                        <marker id="arrow-red2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#F43F5E" />
                        </marker>
                      </defs>

                      {/* Header */}
                      <rect x="300" y="20" width="300" height="50" rx="8" fill="#1E2D4A" stroke="#3B82F6" strokeWidth="2" />
                      <text x="450" y="50" fill="#FFFFFF" fontSize="13" fontWeight="bold" textAnchor="middle">
                        {currentLang === 'uk' ? 'Клопотання про долучення доказів (ст. 318 КПК)' : currentLang === 'en' ? 'Evidence Motion (Art. 318 CPC)' : 'Réquisition de Preuves (Art. 318 CPP)'}
                      </text>

                      <line x1="450" y1="70" x2="450" y2="120" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrow-blue)" />

                      {/* Decision 1: Pertinence matérielle (Art. 139 al. 2 CPP) */}
                      <polygon points="450,120 580,170 450,220 320,170" fill="#141E34" stroke="#F59E0B" strokeWidth="2" />
                      <text x="450" y="165" fill="#F8FAFC" fontSize="11" fontWeight="bold" textAnchor="middle">
                        {currentLang === 'uk' ? 'Доказ має значення &' : currentLang === 'en' ? 'Relevant evidence &' : 'Preuve pertinente &'}
                      </text>
                      <text x="450" y="182" fill="#F8FAFC" fontSize="11" fontWeight="bold" textAnchor="middle">
                        {currentLang === 'uk' ? 'не є надлишковим?' : currentLang === 'en' ? 'not redundant?' : 'non superfétatoire ?'}
                      </text>

                      {/* Non Branch */}
                      <line x1="580" y1="170" x2="700" y2="170" stroke="#F43F5E" strokeWidth="2" markerEnd="url(#arrow-red2)" />
                      <text x="630" y="160" fill="#F43F5E" fontSize="11" fontWeight="bold">
                        {currentLang === 'uk' ? 'НІ' : currentLang === 'en' ? 'NO' : 'NON'}
                      </text>
                      <rect x="700" y="145" width="170" height="50" rx="6" fill="#881337" stroke="#F43F5E" strokeWidth="2" />
                      <text x="785" y="175" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                        {currentLang === 'uk' ? 'Відмова прокурора' : currentLang === 'en' ? 'Anticipated Denial' : 'Refus (Anticipation)'}
                      </text>

                      {/* Oui Branch */}
                      <line x1="450" y1="220" x2="450" y2="280" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrow-blue)" />
                      <text x="465" y="255" fill="#10B981" fontSize="11" fontWeight="bold">
                        {currentLang === 'uk' ? 'ТАК' : currentLang === 'en' ? 'YES' : 'OUI'}
                      </text>

                      {/* Decision 2: Moyen de preuve licite (Art. 192/182 CPP) */}
                      <polygon points="450,280 600,330 450,380 300,330" fill="#141E34" stroke="#10B981" strokeWidth="2" />
                      <text x="450" y="325" fill="#F8FAFC" fontSize="11" fontWeight="bold" textAnchor="middle">
                        {currentLang === 'uk' ? 'Банківська таємниця чи' : currentLang === 'en' ? 'Banking records or' : 'Édition bancaire ou'}
                      </text>
                      <text x="450" y="342" fill="#F8FAFC" fontSize="11" fontWeight="bold" textAnchor="middle">
                        {currentLang === 'uk' ? 'Психіатрична експертиза?' : currentLang === 'en' ? 'Psychiatric evaluation?' : 'Expertise psychiatrique ?'}
                      </text>

                      {/* Oui Branch -> Ordonnance obligatoire */}
                      <line x1="600" y1="330" x2="700" y2="330" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-green2)" />
                      <text x="640" y="320" fill="#10B981" fontSize="11" fontWeight="bold">
                        {currentLang === 'uk' ? 'ТАК' : currentLang === 'en' ? 'YES' : 'OUI'}
                      </text>
                      <rect x="700" y="305" width="180" height="50" rx="6" fill="#064E3B" stroke="#10B981" strokeWidth="2" />
                      <text x="790" y="335" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                        {currentLang === 'uk' ? 'Постанова прокуратури' : currentLang === 'en' ? 'Prosecutor Order' : 'Ordonnance du Parquet'}
                      </text>

                      {/* Non Branch -> Notification */}
                      <line x1="450" y1="380" x2="450" y2="430" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrow-blue)" />
                      <rect x="330" y="430" width="240" height="40" rx="6" fill="#1C2B49" stroke="#3B82F6" strokeWidth="1.5" />
                      <text x="450" y="455" fill="#FFFFFF" fontSize="11" textAnchor="middle">
                        {currentLang === 'uk' ? 'Вмотивоване рішення у справі' : currentLang === 'en' ? 'Formal record motivation' : 'Motivation formelle au dossier'}
                      </text>
                    </svg>

                    <div className="mt-4 p-4 bg-[#141E34] border border-[#1E2D4A] rounded-lg max-w-4xl w-full text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-blue-300">
                        {currentLang === 'uk' ? 'Процесуальне правило : ' : currentLang === 'en' ? 'Procedural Rule: ' : 'Règle de Procédure : '}
                      </span>
                      {currentLang === 'uk' ? (
                        'Прокуратура не може відхилити клопотання потерпілої сторони про долучення доказів, окрім випадків, коли вона обґрунтує відсутність будь-якої користі від такого доказу (ст. 139 ч. 2 та ст. 318 ч. 2 КПК Швейцарії).'
                      ) : currentLang === 'en' ? (
                        'The Public Prosecutor cannot reject an evidentiary request from the injured party unless it establishes through strict advance evaluation that the requested evidence would yield no new relevant information (Art. 139 para. 2 and Art. 318 para. 2 Swiss CPC).'
                      ) : (
                        'Le Ministère public ne peut rejeter une réquisition de preuves de la partie plaignante que s\'il peut établir, par une appréciation anticipée rigoureuse, que le moyen requis n\'apporterait aucun élément pertinent nouveau (Art. 139 al. 2 et 318 al. 2 CPP).'
                      )}
                    </div>
                  </div>
                )}

                {/* SCÉNARIO 3 : ART. 49 CP (CONCOURS & PEINE) */}
                {drakonScenario === "art_49_cp" && (
                  <div className="bg-[#0D1424] border border-[#1E2D4A] rounded-xl p-6 flex flex-col items-center justify-center">
                    <div className="max-w-4xl w-full space-y-4">
                      <div className="border border-[#1E2D4A] bg-[#141E34] p-4 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400 mono uppercase">
                            {currentLang === 'uk' ? 'Реальна та ідеальна сукупність (ст. 49 ч. 1 КК Швейцарії)' : currentLang === 'en' ? 'Concurrent Offenses & Aggravation (Art. 49 para. 1 CP)' : 'Concours Réel & Idéal (Art. 49 al. 1 CP)'}
                          </span>
                          <span className="text-xs bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                            {currentLang === 'uk' ? 'Сукупне позбавлення волі' : currentLang === 'en' ? 'Cumulative Custodial Sentence' : 'Peine Privative Cumulée'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {currentLang === 'uk' ? (
                            'Обвинувачена (Лоран Фогель) вчинила низку злочинів окремими діяннями: Привласнення майна ($15\'000 USD, ст. 138 КК : до 5 років) + Тяжкі погрози проти малолітньої дитини (ст. 180 КК : до 3 років) + Примус (ст. 181 КК : до 3 років) + Завідомо неправдиве повідомлення про злочин (ст. 303 КК : до 5 років) + Шахрайство у сфері іноземців (ст. 118 LEI : до 1 року).'
                          ) : currentLang === 'en' ? (
                            'The accused (Laurent Vogel) committed multiple offenses through distinct acts: Misappropriation ($15,000 USD, Art. 138 CP: up to 5 years) + Qualified serious threats against minor (Art. 180 CP: up to 3 years) + Coercion (Art. 181 CP: up to 3 years) + False accusation (Art. 303 CP: up to 5 years) + LEI fraud (Art. 118 LEI: up to 1 year).'
                          ) : (
                            'L\'auteur (Laurent Vogel) a réalisé plusieurs infractions par des actes distincts : Abus de confiance ($15\'000 USD, Art. 138 CP : max 5 ans) + Menaces qualifiées contre mineur (Art. 180 CP : max 3 ans) + Contrainte (Art. 181 CP : max 3 ans) + Dénonciation calomnieuse (Art. 303 CP : max 5 ans) + Fraude LEI (Art. 118 LEI : max 1 an).'
                          )}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="p-3 bg-[#141E34] border border-[#1E2D4A] rounded-lg space-y-1">
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">
                            {currentLang === 'uk' ? 'Найтяжчий базовий склад' : currentLang === 'en' ? 'Most Severe Base Offense' : 'Infraction de base la plus grave'}
                          </span>
                          <span className="text-white font-bold text-sm">Art. 146 / 138 CP</span>
                          <p className="text-slate-300 text-[11px]">
                            {currentLang === 'uk' ? 'Базове покарання : 24 до 36 місяців тюрми.' : currentLang === 'en' ? 'Base sentence: 24 to 36 months custodial.' : 'Peine de base : 24 à 36 mois privative de liberté.'}
                          </p>
                        </div>

                        <div className="p-3 bg-[#141E34] border border-[#1E2D4A] rounded-lg space-y-1">
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">
                            {currentLang === 'uk' ? 'Обтяжуючий ефект (Asperat)' : currentLang === 'en' ? 'Aggravating Effect (Asperat)' : 'Effet d\'aggravation (Asperat)'}
                          </span>
                          <span className="text-amber-400 font-bold text-sm">+ Art. 180 + 303 CP</span>
                          <p className="text-slate-300 text-[11px]">
                            {currentLang === 'uk' ? 'Збільшення до половини законного максимуму (+18 міс).' : currentLang === 'en' ? 'Increase up to half of statutory max (+18 months).' : 'Augmentation jusqu\'à la moitié du maximum légal (+18 mois).'}
                          </p>
                        </div>

                        <div className="p-3 bg-[#141E34] border border-rose-900/60 rounded-lg space-y-1">
                          <span className="text-rose-400 font-bold block text-[10px] uppercase">
                            {currentLang === 'uk' ? 'Рекомендоване покарання' : currentLang === 'en' ? 'Recommended Sentence' : 'Peine Globale Recommandée'}
                          </span>
                          <span className="text-rose-300 font-bold text-sm">
                            {currentLang === 'uk' ? '36 до 48 місяців реального строку' : currentLang === 'en' ? '36 to 48 Months Non-Suspended' : '36 à 48 Mois Ferme'}
                          </span>
                          <p className="text-slate-300 text-[11px]">
                            {currentLang === 'uk' ? 'Виключення умовного покарання (ст. 42 КК > 2 років).' : currentLang === 'en' ? 'Mandatory denial of full probation (Art. 42 CP > 2 yrs).' : 'Exclusion de plein droit du sursis complet (Art. 42 CP > 2 ans).'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =======================================================================
                TAB 6: CHRONOLOGIE BITEMPORELLE ($T_v$ VS $T_t$)
                ======================================================================= */}
            {activeTab === "bitemporal_timeline" && (
              <div className="h-full flex flex-col p-6 overflow-y-auto bg-[#070B12]">
                <div className="mb-4">
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span>{t('bitemporal_header')}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('bitemporal_sub')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Carte Contradiction F1 vs F2 */}
                  <div className="border border-rose-900/60 bg-rose-950/20 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-300 uppercase mono bg-rose-950/80 px-2.5 py-1 rounded border border-rose-800">
                        {currentLang === 'uk' ? 'F_1 · Неправдива заява підозрюваної' : currentLang === 'en' ? 'F_1 · Suspect Fraudulent Claim' : 'F_1 · Déclaration Frauduleuse Suspecte'}
                      </span>
                      <span className="text-[10px] text-slate-400 mono">Art. 303 / 304 CP</span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {currentLang === 'uk' ? 'Безпідставне звинувачення дитини в побитті' : currentLang === 'en' ? 'False allegation of battery against minor child' : 'Allégation de coups et blessures par le fils'}
                    </div>
                    <div className="text-xs text-slate-300 space-y-1 mono text-[11px]">
                      <div>{currentLang === 'uk' ? '$T_v$ стверджуваний : ' : currentLang === 'en' ? 'Purported $T_v$: ' : '$T_v$ prétendu : '}20.07.2024 (18:00 - 18:30 CEST)</div>
                      <div>{currentLang === 'uk' ? '$T_t$ внесення : ' : currentLang === 'en' ? 'Recorded $T_t$: ' : '$T_t$ inscription : '}22.07.2024 09:15 CEST (Plainte police)</div>
                    </div>
                    <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded text-xs text-rose-200">
                      {currentLang === 'uk' ? (
                        'Завідомо неправдива заява до поліції із твердженням, нібито неповнолітня дитина заподіяла глибокі гематоми та синці на передпліччях.'
                      ) : currentLang === 'en' ? (
                        'Calumnious police complaint falsely claiming the minor child inflicted severe hematomas and contusions on the suspect\'s arms.'
                      ) : (
                        'Déclaration calomnieuse prétendant que l\'enfant mineur aurait causé des hématomes profonds et des ecchymoses sur les bras.'
                      )}
                    </div>
                  </div>

                  {/* Carte Réfutation F2 / F3 */}
                  <div className="border border-emerald-900/60 bg-emerald-950/20 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 uppercase mono bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
                        {currentLang === 'uk' ? 'F_2 & F_3 · Доведена об’єктивна істина' : currentLang === 'en' ? 'F_2 & F_3 · Proven Objective Truth' : 'F_2 & F_3 · Vérité Objective Prouvée'}
                      </span>
                      <span className="text-[10px] text-emerald-400 mono">EXIF + Audio Verbatim</span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {currentLang === 'uk' ? 'Абсолютне спростування та доказ самоушкодження' : currentLang === 'en' ? 'Absolute Refutation & Self-Mutilation Proof' : 'Réfutation absolue & Preuve d\'auto-mutilation'}
                    </div>
                    <div className="text-xs text-slate-300 space-y-1 mono text-[11px]">
                      <div>{currentLang === 'uk' ? '$T_v$ реальний F_2 : ' : currentLang === 'en' ? 'Actual $T_v$ F_2: ' : '$T_v$ réel F_2 : '}21.07.2024 11:45 CEST (Photo EXIF Lausanne)</div>
                      <div>{currentLang === 'uk' ? '$T_v$ зізнання F_3 : ' : currentLang === 'en' ? 'Confession $T_v$ F_3: ' : '$T_v$ aveu F_3 : '}21.07.2024 14:10 CEST (Enregistrement Audio 12)</div>
                    </div>
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded text-xs text-emerald-200">
                      {currentLang === 'uk' ? (
                        <>
                          1) Фотографія 1481 у супермаркеті фіксує ідеальну чистоту рук без жодного сліду через 17 год після вигаданого інциденту.<br />
                          2) Аудіозапис 12 містить пряме визнання: підозрювана власноруч подряпала себе нігтями близько 13:30 для симуляції побоїв.
                        </>
                      ) : currentLang === 'en' ? (
                        <>
                          1) Photo 1481 in the supermarket shows completely intact, unmarked arms 17 hours after the alleged incident.<br />
                          2) Audio recording 12 contains the formal confession: the suspect deliberately scratched her own arms around 13:30 to fake injuries.
                        </>
                      ) : (
                        <>
                          1) La photo 1481 au supermarché montre l'intégrité absolue des bras 17h après l'heure prétendue.<br />
                          2) L'audio 12 contient l'aveu formel : la suspecte s'est délibérément griffée avec les ongles vers 13h30 pour simuler les blessures.
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-[#141E34] border border-[#1E2D4A] rounded-xl text-xs text-slate-300 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-300">
                      {currentLang === 'uk' ? 'Статус у реєстрі Utopia DB (192.168.3.251:9922) : ' : currentLang === 'en' ? 'Utopia DB Ledger Status (192.168.3.251:9922): ' : 'Statut dans Utopia DB (192.168.3.251:9922) : '}
                    </span>
                    <span className="ml-2 font-mono text-[11px]">Table `vaud_forensic_bitemporal_contradictions` — WORM Non-mutable.</span>
                  </div>
                  <span className="text-emerald-400 font-bold mono">{t('conflict_validated_badge')}</span>
                </div>
              </div>
            )}

            {/* =======================================================================
                TAB 7: PARTIES & BOUCLIER INVARIANT L-03
                ======================================================================= */}
            {activeTab === "actor_matrix" && (
              <div className="h-full grid grid-cols-12 overflow-hidden">
                <div className="col-span-5 border-r border-[#1E2D4A] bg-[#0D1424] flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-[#1E2D4A] bg-[#141E34]/50 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {t('actors_header')}
                    </span>
                    <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded mono text-slate-400">
                      {t('actors_count_badge')}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                    {ACTORS.map((act) => {
                      const isSelected = selectedActor.id === act.id;
                      const roleStr = loc(act.role, `actor_${act.id}_role`);
                      return (
                        <div
                          key={act.id}
                          onClick={() => setSelectedActor(act)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#1C2B49] border-blue-500 shadow-md"
                              : "bg-[#141E34] border-[#1E2D4A] hover:border-slate-600"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white">{act.name}</span>
                            {act.protected_bona_fide && (
                              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/60 px-2 py-0.5 rounded flex items-center space-x-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{currentLang === 'uk' ? 'ЩИТ L-03' : 'BOUCLIER L-03'}</span>
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-medium inline-block mt-1.5 ${act.badgeColor}`}>
                            {loc(act.status)}
                          </span>
                          <div className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                            {roleStr}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Détail de la partie */}
                <div className="col-span-7 flex flex-col p-6 overflow-y-auto bg-[#070B12]">
                  <div className="border border-[#1E2D4A] bg-[#0D1424] rounded-xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">{selectedActor.name}</h3>
                        <div className="text-xs text-slate-400 mono mt-0.5">{selectedActor.id}</div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded border uppercase font-bold ${selectedActor.badgeColor}`}>
                        {loc(selectedActor.status)}
                      </span>
                    </div>

                    <div className="p-3 bg-[#141E34] border border-[#1E2D4A] rounded-lg text-xs leading-relaxed text-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-400 block">{t('role_and_facts_label')}</span>
                        {settings.manualEditMode && (
                          <button
                            type="button"
                            onClick={() =>
                              openManualEditor(
                                `actor_${selectedActor.id}_role`,
                                `${selectedActor.name} Роль`,
                                locFr(selectedActor.role),
                                loc(selectedActor.role, `actor_${selectedActor.id}_role`)
                              )
                            }
                            className="p-1 text-slate-400 hover:text-amber-400"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {loc(selectedActor.role, `actor_${selectedActor.id}_role`)}
                    </div>

                    <div className="text-xs text-slate-300 space-y-2">
                      <div className="font-bold text-slate-400 uppercase tracking-wider mono text-[11px]">
                        {t('legal_basis_label')}
                      </div>
                      <div className="bg-[#070B12] p-2.5 rounded border border-[#1E2D4A] mono text-amber-300">
                        {selectedActor.legal_reference}
                      </div>
                    </div>

                    {/* Droits procéduraux spécifiques */}
                    <div className="space-y-2 pt-2 border-t border-[#1E2D4A]">
                      <div className="font-bold text-slate-400 uppercase tracking-wider mono text-[11px]">
                        {t('procedural_guarantees_label')}
                      </div>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {locArr(selectedActor.droits_proceduraux).map((droit, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            <span>{droit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedActor.protected_bona_fide ? (
                      <div className="p-4 bg-amber-950/40 border border-amber-600/80 rounded-lg text-xs space-y-2 text-amber-200">
                        <div className="flex items-center space-x-2 font-bold text-amber-300 text-sm">
                          <ShieldCheck className="w-4 h-4" />
                          <span>
                            {currentLang === 'uk'
                              ? 'АРХІТЕКТУРНИЙ ІНВАРІАНТ L-03 · ДОБРОСОВІСНИЙ ЗАХИСТ'
                              : currentLang === 'en'
                              ? 'ARCHITECTURAL INVARIANT L-03 · BONA FIDE PROTECTION'
                              : 'INVARIANT ARCHITECTURAL L-03 · PROTECTION DE BONNE FOI'}
                          </span>
                        </div>
                        <p className="leading-relaxed">
                          {currentLang === 'uk' ? (
                            'Жан-Поль ВЕРНОН діяв виключно з гуманітарних, дружніх та логістичних мотивів. Згідно із принципами добросовісності (ст. 3 ч. 1 ЦК Швейцарії CC) та абсолютної недопустимості необґрунтованих наклепницьких заяв (ст. 139/141 КПК CPP), він користується 100% судовим імунітетом від будь-якого кримінального переслідування чи обвинувачення.'
                          ) : currentLang === 'en' ? (
                            'Jean-Paul VERNON acted purely out of benevolent, logistical, and humanitarian assistance. Pursuant to bona fide principles (Art. 3 para. 1 Swiss Civil Code CC) and the absolute inadmissibility of fabricated accusations (Art. 139/141 CPC), he enjoys an absolute procedural shield against any indictment or prosecution.'
                          ) : (
                            'Jean-Paul VERNON a agi à titre purement bienveillant, logistique et humanitaire. En vertu des principes de bonne foi (Art. 3 al. 1 CC) et de l\'inexploitabilité des dénonciations téméraires (Art. 139/141 CPP), il bénéficie d\'une exclusion absolue de toute imputation ou poursuite pénale.'
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#141E34] border border-[#1E2D4A] rounded-lg text-xs text-slate-400">
                        {t('ordinary_instruction_notice')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </AstryxZoneBoundary>

        {/* =========================================================================
            PIED DE PAGE (STATUS BAR ASTRYX)
            ========================================================================= */}
        <AstryxZoneBoundary zoneName="Footer">
          <footer className="h-7 min-h-[1.75rem] bg-[#0A0E1A] border-t border-[#1E2D4A] px-4 flex items-center justify-between text-[11px] mono text-slate-400">
            <div className="flex items-center space-x-3">
              <span className="text-emerald-400 flex items-center space-x-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t('footer_connected')}</span>
              </span>
              <span>·</span>
              <span>{t('footer_court')}</span>
              <span>·</span>
              <span>{t('footer_domain')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>{t('footer_invariants')}</span>
              <span>·</span>
              <span className="text-amber-400 font-bold">{t('footer_compliance')}</span>
            </div>
          </footer>
        </AstryxZoneBoundary>

        {/* Technical Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSaveSettings={handleSaveSettings}
          overrides={overrides}
          onOverridesChange={(newOverrides) => setOverrides(newOverrides)}
          currentLang={currentLang}
        />

        {/* Manual Translation Edit Modal */}
        <ManualEditModal
          isOpen={manualEditState.isOpen}
          onClose={() => setManualEditState(prev => ({ ...prev, isOpen: false }))}
          targetKey={manualEditState.targetKey}
          fieldLabel={manualEditState.fieldLabel}
          sourceFrenchText={manualEditState.sourceFrenchText}
          currentTranslation={manualEditState.currentTranslation}
          targetLang={currentLang}
          settings={settings}
          onSaveOverride={handleManualEditSave}
          onResetOverride={handleManualEditReset}
        />
      </AppShell>
    </AuthGate>
  );
}
