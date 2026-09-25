// =========================================================================
// B-SDD LEGAL COCKPIT · ТЕХНІЧНІ НАЛАШТУВАННЯ ТА ІНТЕГРАЦІЯ (SETTINGS MODAL)
// Вибір ШІ Агента, Провайдери (Проксі .184 / Gemini / MemPalace), База кодексів
// =========================================================================

import React, { useState, useEffect } from 'react';
import {
  AppSettings,
  SupportedLanguage,
  TranslationOverrides,
  AIAgentRole,
  AIProviderMode,
} from '../types/i18n';
import { UI_TRANSLATIONS } from '../data/translations';
import {
  getAllLawArticles,
  getEnabledLawArticleIds,
  saveEnabledLawArticleIds,
  saveLawArticle,
  exportCorpusAsJson,
  importCorpusFromJson,
  LawArticle,
} from '../data/swissLawCodes';
import {
  testLLMProxyConnection,
  translateWithLLM,
  saveAppSettings,
  clearAllOverrides,
  removeOverride,
  saveOverride,
} from '../lib/translator';
import {
  X,
  Server,
  Network,
  Languages,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Sparkles,
  Bot,
  Brain,
  Scale,
  Database,
  Layers,
  FileCheck,
  ToggleLeft,
  ToggleRight,
  Plus,
  BookOpen,
  Filter,
  Search,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  overrides: TranslationOverrides;
  onOverridesChange: (newOverrides: TranslationOverrides) => void;
  currentLang: SupportedLanguage;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  overrides,
  onOverridesChange,
  currentLang,
}) => {
  const [activeTab, setActiveTab] = useState<'ai_agent' | 'laws_corpus' | 'tunnel' | 'translations' | 'security'>('ai_agent');

  // --- AI Agent & Provider settings state ---
  const [aiProviderMode, setAiProviderMode] = useState<AIProviderMode>(settings.aiProviderMode || 'local_proxy');
  const [aiAgentRole, setAiAgentRole] = useState<AIAgentRole>(settings.aiAgentRole || 'criminal_investigator');
  const [proxyUrl, setProxyUrl] = useState(settings.llmProxyUrl);
  const [apiKey, setApiKey] = useState(settings.llmApiKey);
  const [selectedSlot, setSelectedSlot] = useState(settings.selectedSlot || 'slot-2');
  const [customModel, setCustomModel] = useState(settings.llmModel || 'meta/llama-3.3-70b-instruct');
  
  // Gemini settings
  const [geminiModel, setGeminiModel] = useState(settings.geminiModel || 'gemini-3.8-flash');
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || '');
  const [geminiTemperature, setGeminiTemperature] = useState(settings.geminiTemperature ?? 0.2);

  // Knowledge Graph Flags
  const [connectMemPalaceGraph, setConnectMemPalaceGraph] = useState(settings.connectMemPalaceGraph ?? true);
  const [connectUtopiaDb, setConnectUtopiaDb] = useState(settings.connectUtopiaDb ?? true);
  const [enableTemporalSearch, setEnableTemporalSearch] = useState(settings.enableTemporalSearch ?? true);
  const [enableInvariantEnforcement, setEnableInvariantEnforcement] = useState(settings.enableInvariantEnforcement ?? true);
  const [enableSequestrationCalc, setEnableSequestrationCalc] = useState(settings.enableSequestrationCalc ?? true);

  // Connection testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // --- Laws Corpus State ---
  const [allArticles, setAllArticles] = useState<LawArticle[]>([]);
  const [enabledLawIds, setEnabledLawIds] = useState<string[]>([]);
  const [lawSearchQuery, setLawSearchQuery] = useState('');
  const [lawFilterCategory, setLawFilterCategory] = useState<string>('all');
  const [lawImportError, setLawImportError] = useState<string | null>(null);
  const [lawImportSuccess, setLawImportSuccess] = useState<string | null>(null);

  // New Law Form state
  const [showAddLawForm, setShowAddLawForm] = useState(false);
  const [newLawCode, setNewLawCode] = useState('CP');
  const [newLawArticleNumber, setNewLawArticleNumber] = useState('Art. ');
  const [newLawJurisdiction, setNewLawJurisdiction] = useState<'federal' | 'canton_vaud'>('federal');
  const [newLawCategory, setNewLawCategory] = useState<LawArticle['category']>('penal');
  const [newLawTitleUk, setNewLawTitleUk] = useState('');
  const [newLawTitleFr, setNewLawTitleFr] = useState('');
  const [newLawContentFr, setNewLawContentFr] = useState('');
  const [newLawContentUk, setNewLawContentUk] = useState('');
  const [newLawSanction, setNewLawSanction] = useState('');
  const [newLawRelevanceUk, setNewLawRelevanceUk] = useState('');

  // Other tabs state
  const [mcpTunnelUrl, setMcpTunnelUrl] = useState(settings.mcpTunnelUrl);
  const [authPassword, setAuthPassword] = useState(settings.authPassword);
  const [autoLockMinutes, setAutoLockMinutes] = useState(settings.autoLockMinutes);
  const [manualEditMode, setManualEditMode] = useState(settings.manualEditMode);

  // Translations test
  const [testText, setTestText] = useState('La prévenue a proféré des menaces de mort graves contre la victime.');
  const [translatedTestResult, setTranslatedTestResult] = useState<string | null>(null);
  const [isTranslatingTest, setIsTranslatingTest] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load articles on mount or when opening
  useEffect(() => {
    if (isOpen) {
      setAllArticles(getAllLawArticles());
      setEnabledLawIds(settings.enabledLawIds || getEnabledLawArticleIds());
    }
  }, [isOpen]);

  const t = (key: string): string => {
    return UI_TRANSLATIONS[currentLang]?.[key] || UI_TRANSLATIONS['uk']?.[key] || key;
  };

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Save All Settings
  const handleSaveAll = () => {
    const updated: AppSettings = {
      ...settings,
      aiProviderMode,
      aiAgentRole,
      llmProxyUrl: proxyUrl.trim(),
      llmApiKey: apiKey.trim(),
      selectedSlot,
      llmModel: customModel.trim(),
      geminiModel,
      geminiApiKey: geminiApiKey.trim(),
      geminiTemperature,
      connectMemPalaceGraph,
      connectUtopiaDb,
      enableTemporalSearch,
      enableInvariantEnforcement,
      enableSequestrationCalc,
      enabledLawIds,
      mcpTunnelUrl: mcpTunnelUrl.trim(),
      authPassword: authPassword.trim() || '0523',
      autoLockMinutes: Number(autoLockMinutes) || 15,
      manualEditMode,
    };
    saveAppSettings(updated);
    saveEnabledLawArticleIds(enabledLawIds);
    onSaveSettings(updated);
    onClose();
  };

  // Test LLM Proxy
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const targetModel =
      selectedSlot === 'slot-1'
        ? 'qwen/qwen-2.5-72b-instruct'
        : selectedSlot === 'slot-2'
        ? 'meta/llama-3.3-70b-instruct'
        : selectedSlot === 'slot-3'
        ? 'mistralai/mistral-large-2407'
        : customModel;
    const res = await testLLMProxyConnection(proxyUrl, apiKey, targetModel);
    setIsTesting(false);
    setTestResult(res);
  };

  // Toggle Law Article Active Status
  const handleToggleLaw = (id: string) => {
    setEnabledLawIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      saveEnabledLawArticleIds(next);
      return next;
    });
  };

  const handleToggleAllLaws = (enable: boolean) => {
    const next = enable ? allArticles.map((a) => a.id) : [];
    setEnabledLawIds(next);
    saveEnabledLawArticleIds(next);
  };

  const handleToggleCategoryLaws = (cat: LawArticle['category']) => {
    const catArticles = allArticles.filter((a) => a.category === cat).map((a) => a.id);
    const allCatEnabled = catArticles.every((id) => enabledLawIds.includes(id));
    let next: string[];
    if (allCatEnabled) {
      next = enabledLawIds.filter((id) => !catArticles.includes(id));
    } else {
      next = Array.from(new Set([...enabledLawIds, ...catArticles]));
    }
    setEnabledLawIds(next);
    saveEnabledLawArticleIds(next);
  };

  // Export Corpus
  const handleExportCorpus = () => {
    const jsonStr = exportCorpusAsJson();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `swiss_legal_corpus_mempalace_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Corpus from JSON File
  const handleImportCorpusFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLawImportError(null);
    setLawImportSuccess(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = importCorpusFromJson(reader.result as string);
      if (result.error) {
        setLawImportError(result.error);
      } else {
        setLawImportSuccess(`Успішно завантажено та інтегровано ${result.importedCount} статей до бази MemPalace!`);
        setAllArticles(getAllLawArticles());
        setEnabledLawIds(getEnabledLawArticleIds());
      }
    };
    reader.readAsText(file);
  };

  // Add Custom Law Article
  const handleCreateNewLaw = () => {
    if (!newLawArticleNumber.trim() || !newLawTitleUk.trim()) {
      alert('Будь ласка, вкажіть номер статті та назву.');
      return;
    }

    const generatedId = `${newLawCode.toUpperCase()}-${newLawArticleNumber.replace(/[^0-9a-zA-Z]/g, '')}-${Date.now().toString().slice(-4)}`;
    const newArt: LawArticle = {
      id: generatedId,
      code: newLawCode.toUpperCase(),
      jurisdiction: newLawJurisdiction,
      article: newLawArticleNumber.trim(),
      title: {
        uk: newLawTitleUk.trim(),
        fr: newLawTitleFr.trim() || newLawTitleUk.trim(),
        en: newLawTitleUk.trim(),
      },
      category: newLawCategory,
      sanction: newLawSanction.trim() || undefined,
      content_fr: newLawContentFr.trim() || 'Texte légal en cours de codification.',
      content_uk: newLawContentUk.trim() || newLawTitleUk.trim(),
      content_en: newLawContentUk.trim(),
      relevance_case: {
        uk: newLawRelevanceUk.trim() || 'Введено адвокатом для оцінки доказів у справі.',
        fr: 'Ajouté par le conseil pour analyse probatoire.',
        en: 'Added by counsel for evidentiary qualification.',
      },
      corroborating_cotes: [],
      mempalace_node_id: `CUSTOM-${generatedId}`,
    };

    saveLawArticle(newArt);
    setAllArticles(getAllLawArticles());
    setEnabledLawIds((prev) => [...prev, generatedId]);
    setShowAddLawForm(false);
    // Reset form
    setNewLawArticleNumber('Art. ');
    setNewLawTitleUk('');
    setNewLawTitleFr('');
    setNewLawContentFr('');
    setNewLawContentUk('');
    setNewLawSanction('');
    setNewLawRelevanceUk('');
    alert(`Статтю ${newArt.article} успішно додано до бази MemPalace!`);
  };

  // Filtered Laws
  const filteredLaws = allArticles.filter((art) => {
    const q = lawSearchQuery.toLowerCase();
    const matchesSearch =
      art.article.toLowerCase().includes(q) ||
      art.code.toLowerCase().includes(q) ||
      art.title[currentLang]?.toLowerCase().includes(q) ||
      art.content_uk.toLowerCase().includes(q) ||
      art.content_fr.toLowerCase().includes(q);

    const matchesCat = lawFilterCategory === 'all' || art.category === lawFilterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans select-text">
      <div className="bg-[#0B1120] border border-blue-600/40 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#080E1B]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Bot className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Налаштування ШІ Агента & Бази кодексів</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-mono">
                  B-SDD v2.5
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Конфігурація провайдерів ШІ (Проксі .184 / Gemini), баз MemPalace, Utopia WORM та нормативних кодексів
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#070B14] px-4 gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('ai_agent')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'ai_agent'
                ? 'border-blue-500 text-blue-400 font-bold bg-blue-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4 text-amber-400" />
            <span>🤖 ШІ Агент & Провайдер</span>
          </button>

          <button
            onClick={() => setActiveTab('laws_corpus')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'laws_corpus'
                ? 'border-blue-500 text-blue-400 font-bold bg-blue-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>⚖️ База кодексів & Норми</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
              {enabledLawIds.length}/{allArticles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tunnel')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'tunnel'
                ? 'border-blue-500 text-blue-400 font-bold bg-blue-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>{t('settings_tab_tunnel')}</span>
          </button>

          <button
            onClick={() => setActiveTab('translations')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'translations'
                ? 'border-blue-500 text-blue-400 font-bold bg-blue-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>{t('settings_tab_translations')}</span>
            {Object.keys(overrides).length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {Object.keys(overrides).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-400 font-bold bg-blue-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('settings_tab_security')}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-200 text-xs sm:text-sm">
          {/* ========================================================================= */}
          {/* TAB 1: AI AGENT, PROVIDER & KNOWLEDGE GRAPH INTEGRATION                  */}
          {/* ========================================================================= */}
          {activeTab === 'ai_agent' && (
            <div className="space-y-6">
              {/* 1.1 Agent Specialty & Role Selector */}
              <div className="bg-[#070B14] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-amber-400" />
                    <span>Спеціалізація та роль ШІ-агента для оцінки доказів :</span>
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    Human-in-the-Loop Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'criminal_investigator',
                      title: 'Слідчий аналітик (CPP & CP)',
                      desc: 'Кримінальна кваліфікація злочинів, обтяжуючі обставини, прямий умисел, клопотання ст. 318 КПК.',
                    },
                    {
                      id: 'forensic_audio_digital',
                      title: 'Форензік-експерт (ISO 27037)',
                      desc: 'Аудіо-фоноскопія, перевірка метаданих EXIF, стандарт ATF 146 IV 9, захист алібі від фальсифікацій.',
                    },
                    {
                      id: 'civil_sequestration_auditor',
                      title: 'Аудитор арешту & деліктів (ст. 263)',
                      desc: 'Забезпечення повернення $15k, прямі збитки, розрахунок моральної шкоди ст. 49 CO (CHF 46k).',
                    },
                  ].map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setAiAgentRole(role.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        aiAgentRole === role.id
                          ? 'bg-blue-950/60 border-blue-500 shadow-md text-white'
                          : 'bg-[#050810] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <strong className="text-xs text-amber-300 block mb-1">{role.title}</strong>
                      <span className="text-[11px] text-slate-400 leading-snug block">{role.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 1.2 Provider Choice: Free Local/Remote Proxy vs Paid Gemini vs Built-in */}
              <div className="bg-[#070B14] border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-400" />
                    <span>Вибір ШІ-провайдера та обчислювального рушія :</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setAiProviderMode('local_proxy')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      aiProviderMode === 'local_proxy'
                        ? 'bg-blue-950/70 border-blue-500 shadow-md'
                        : 'bg-[#050810] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-xs text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        ШІ-проксі (Безкоштовно)
                      </strong>
                      <span className="text-[9px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
                        OpenAI API
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Локальний або віддалений сервер (хост .184 порт 18880). Слоти Qwen 72B / LLaMA 70B / Mistral.
                    </p>
                  </button>

                  <button
                    onClick={() => setAiProviderMode('gemini_cloud')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      aiProviderMode === 'gemini_cloud'
                        ? 'bg-blue-950/70 border-blue-500 shadow-md'
                        : 'bg-[#050810] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-xs text-blue-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        Gemini 3.8 (Хмара)
                      </strong>
                      <span className="text-[9px] font-mono bg-blue-950 px-1.5 py-0.5 rounded text-blue-300 border border-blue-800">
                        Google AI
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Надшвидкий семантичний аналіз, обробка великих документів та судова детекція суперечностей.
                    </p>
                  </button>

                  <button
                    onClick={() => setAiProviderMode('mempalace_builtin')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      aiProviderMode === 'mempalace_builtin'
                        ? 'bg-blue-950/70 border-blue-500 shadow-md'
                        : 'bg-[#050810] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-xs text-amber-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        MemPalace Вбудований
                      </strong>
                      <span className="text-[9px] font-mono bg-amber-950 px-1.5 py-0.5 rounded text-amber-300 border border-amber-800">
                        100% Offline
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Детермінований юридичний рушій за нормами CP/CPP Vaud. Працює автономно без інтернету.
                    </p>
                  </button>
                </div>

                {/* Sub-settings based on provider mode */}
                {aiProviderMode === 'local_proxy' && (
                  <div className="p-4 bg-[#050810] rounded-xl border border-slate-800 space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">
                        Адреса проксі-сервера (локальна або віддалена):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={proxyUrl}
                          onChange={(e) => setProxyUrl(e.target.value)}
                          placeholder="http://192.168.3.234:8766 або http://192.168.3.184:18880/v1"
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleTestConnection}
                          disabled={isTesting}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2 border border-slate-700 shrink-0"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                          <span>{isTesting ? 'Тест...' : 'Перевірити зв\'язок'}</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[10px] font-mono text-slate-400 mr-1">Пресети локальної мережі:</span>
                        <button
                          type="button"
                          onClick={() => setProxyUrl('http://192.168.3.234:8766')}
                          className="px-2 py-0.5 bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 text-[10px] font-mono rounded border border-blue-800/60 transition-colors"
                        >
                          ● Вузол 192.168.3.234:8766 (Локальний хост системи)
                        </button>
                        <button
                          type="button"
                          onClick={() => setProxyUrl('http://192.168.3.184:18880/v1')}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded border border-slate-700 transition-colors"
                        >
                          Вузол 192.168.3.184:18880 (Суверенний LLM)
                        </button>
                        <button
                          type="button"
                          onClick={() => setProxyUrl('http://127.0.0.1:8766')}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded border border-slate-700 transition-colors"
                        >
                          127.0.0.1:8766 (Localhost)
                        </button>
                      </div>
                    </div>

                    {testResult && (
                      <div
                        className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${
                          testResult.success
                            ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                            : 'bg-rose-950/70 border border-rose-800 text-rose-300'
                        }`}
                      >
                        {testResult.success ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                        <span>{testResult.message}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1.5">
                        Вибір слота моделі на хості .184 :
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'slot-1', title: 'Слот 1: Qwen 2.5 72B', sub: 'qwen/qwen-2.5-72b' },
                          { id: 'slot-2', title: 'Слот 2: LLaMA 3.3 70B', sub: 'llama-3.3-70b-instruct' },
                          { id: 'slot-3', title: 'Слот 3: Mistral Large', sub: 'mistral-large-2407' },
                          { id: 'custom', title: 'Власний Model ID', sub: 'Вказати вручну' },
                        ].map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlot(slot.id as any)}
                            className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                              selectedSlot === slot.id
                                ? 'bg-blue-600 text-white font-semibold border-blue-400'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <span className="block font-medium">{slot.title}</span>
                            <span className="text-[10px] opacity-75 font-mono block">{slot.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedSlot === 'custom' && (
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1">
                          Кастомна назва моделі :
                        </label>
                        <input
                          type="text"
                          value={customModel}
                          onChange={(e) => setCustomModel(e.target.value)}
                          placeholder="meta/llama-3.3-70b-instruct"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                        />
                      </div>
                    )}
                  </div>
                )}

                {aiProviderMode === 'gemini_cloud' && (
                  <div className="p-4 bg-[#050810] rounded-xl border border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1">
                          Модель Gemini :
                        </label>
                        <select
                          value={geminiModel}
                          onChange={(e) => setGeminiModel(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
                        >
                          <option value="gemini-3.8-flash">gemini-3.8-flash (Миттєвий аналіз)</option>
                          <option value="gemini-3.8-pro">gemini-3.8-pro (Поглиблена експертиза)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1">
                          Температура юридичної суворості :
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="0"
                            max="0.7"
                            step="0.05"
                            value={geminiTemperature}
                            onChange={(e) => setGeminiTemperature(parseFloat(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-xs font-mono text-blue-400 w-8">{geminiTemperature}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 1.3 Knowledge Graph Integration (MemPalace KùzuDB & Utopia DB) */}
              <div className="bg-[#070B14] border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Інтеграція з базами знань MemPalace &amp; Utopia DB :</span>
                </h3>

                <div className="space-y-2">
                  {[
                    {
                      state: connectMemPalaceGraph,
                      setter: setConnectMemPalaceGraph,
                      title: 'Граф знань MemPalace KùzuDB (порт :8766)',
                      desc: 'Пошук серед 8’746 ребер зв’язків: дати, персоналії (Суворова, Коваленко, Міллі), хронологія.',
                    },
                    {
                      state: connectUtopiaDb,
                      setter: setConnectUtopiaDb,
                      title: 'Utopia DB WORM Ledger (вузол :251 / :234)',
                      desc: 'Автоматична перевірка незмінності доказів (Інваріант L-01) за алгоритмом SHA-256.',
                    },
                    {
                      state: enableTemporalSearch,
                      setter: setEnableTemporalSearch,
                      title: 'Бітемпоральна калібрація ($T_v$ Valid Time vs $T_t$ Transaction Time)',
                      desc: 'Зіставлення часу реальної події та часу офіційного протоколювання для викриття фабрикацій.',
                    },
                    {
                      state: enableInvariantEnforcement,
                      setter: setEnableInvariantEnforcement,
                      title: 'Захист імунітету Адріано Міллі (ст. 933 CC, Інваріант L-03)',
                      desc: 'Автоматичне блокування будь-яких спроб сторони захисту висунути звинувачення проти добросовісного волонтера.',
                    },
                    {
                      state: enableSequestrationCalc,
                      setter: setEnableSequestrationCalc,
                      title: 'Автоматичний перерахунок суми арешту активів (ст. 263 КПК)',
                      desc: 'Включення доведених фінансових збитків до підсумкового розрахунку вимог (CHF 46’850.00).',
                    },
                  ].map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-3 p-2.5 rounded-lg bg-[#050810] border border-slate-800 hover:border-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={item.state}
                        onChange={(e) => item.setter(e.target.checked)}
                        className="mt-0.5 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                      />
                      <div>
                        <strong className="text-xs text-slate-200 block">{item.title}</strong>
                        <span className="text-[11px] text-slate-400 block">{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SWISS CODES & CANTONAL LEGAL CORPUS MANAGEMENT                     */}
          {/* ========================================================================= */}
          {activeTab === 'laws_corpus' && (
            <div className="space-y-5">
              {/* Top Controls: Search, Filters, Quick Toggles & Import/Export */}
              <div className="bg-[#070B14] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Scale className="w-4 h-4 text-emerald-400" />
                      <span>Управління базою кодексів &amp; нормативних актів (MemPalace)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Керуйте списком законів, за якими ШІ здійснює оцінку та юридичну кваліфікацію доказів.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportCorpus}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition-colors"
                      title="Експортувати всю базу кодексів у форматі JSON"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>Експорт JSON</span>
                    </button>

                    <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Імпорт JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportCorpusFile}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={() => setShowAddLawForm(!showAddLawForm)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Додати статтю</span>
                    </button>
                  </div>
                </div>

                {/* Import feedback */}
                {lawImportSuccess && (
                  <div className="p-2.5 bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{lawImportSuccess}</span>
                  </div>
                )}
                {lawImportError && (
                  <div className="p-2.5 bg-rose-950/70 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{lawImportError}</span>
                  </div>
                )}

                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={lawSearchQuery}
                      onChange={(e) => setLawSearchQuery(e.target.value)}
                      placeholder="Пошук статті, номеру або ключового слова..."
                      className="w-full pl-8 pr-3 py-1.5 bg-[#0D1526] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
                    {[
                      { id: 'all', label: 'Всі' },
                      { id: 'penal', label: 'Кримінальні (CP)' },
                      { id: 'procedure', label: 'Процес (CPP)' },
                      { id: 'civil', label: 'Цивільні (CC)' },
                      { id: 'obligations', label: 'Зобов’язання (CO)' },
                      { id: 'cantonal_vaud', label: 'Кантон Во (VD)' },
                      { id: 'jurisprudence', label: 'Прецеденти (ATF)' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setLawFilterCategory(cat.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors shrink-0 ${
                          lawFilterCategory === cat.id
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Bulk Action Toggles */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <span>Статус статей:</span>
                    <strong className="text-emerald-400">{enabledLawIds.length} активні</strong>
                    <span>/</span>
                    <strong className="text-slate-500">{allArticles.length - enabledLawIds.length} вимкнені</strong>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleAllLaws(true)}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Увімкнути всі
                    </button>
                    <span className="text-slate-600">·</span>
                    <button
                      onClick={() => handleToggleAllLaws(false)}
                      className="text-rose-400 hover:text-rose-300 underline"
                    >
                      Вимкнути всі
                    </button>
                  </div>
                </div>
              </div>

              {/* Add Law Form (Collapsible) */}
              {showAddLawForm && (
                <div className="bg-[#090E1A] border border-blue-500/50 rounded-xl p-4 space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5 text-blue-400" />
                    <span>Додавання нового юридичного акту до MemPalace :</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">Кодекс:</label>
                      <input
                        type="text"
                        value={newLawCode}
                        onChange={(e) => setNewLawCode(e.target.value)}
                        placeholder="CP, CPP, LOJV..."
                        className="w-full px-2.5 py-1.5 bg-[#050810] border border-slate-700 rounded text-xs text-white uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">Номер статті:</label>
                      <input
                        type="text"
                        value={newLawArticleNumber}
                        onChange={(e) => setNewLawArticleNumber(e.target.value)}
                        placeholder="Art. 146"
                        className="w-full px-2.5 py-1.5 bg-[#050810] border border-slate-700 rounded text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">Юрисдикція:</label>
                      <select
                        value={newLawJurisdiction}
                        onChange={(e) => setNewLawJurisdiction(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-[#050810] border border-slate-700 rounded text-xs text-white"
                      >
                        <option value="federal">Федеральне право (CH)</option>
                        <option value="canton_vaud">Кантон Во (VD)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">Категорія:</label>
                      <select
                        value={newLawCategory}
                        onChange={(e) => setNewLawCategory(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-[#050810] border border-slate-700 rounded text-xs text-white"
                      >
                        <option value="penal">Кримінальне (CP)</option>
                        <option value="procedure">Процесуальне (CPP)</option>
                        <option value="civil">Цивільне (CC)</option>
                        <option value="obligations">Зобов'язальне (CO)</option>
                        <option value="cantonal_vaud">Кантон Во (VD)</option>
                        <option value="jurisprudence">Прецедент (ATF)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">Назва (Українською):</label>
                      <input
                        type="text"
                        value={newLawTitleUk}
                        onChange={(e) => setNewLawTitleUk(e.target.value)}
                        placeholder="Шахрайство, Погрози, Арешт..."
                        className="w-full px-2.5 py-1.5 bg-[#050810] border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">Санкція (покарання):</label>
                      <input
                        type="text"
                        value={newLawSanction}
                        onChange={(e) => setNewLawSanction(e.target.value)}
                        placeholder="Позбавлення волі до 5 років..."
                        className="w-full px-2.5 py-1.5 bg-[#050810] border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">Офіційний текст французькою (FR):</label>
                    <textarea
                      rows={2}
                      value={newLawContentFr}
                      onChange={(e) => setNewLawContentFr(e.target.value)}
                      placeholder="Texte officiel de la loi..."
                      className="w-full px-2.5 py-1.5 bg-[#050810] border border-slate-700 rounded text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">Точний юридичний переклад українською (UK):</label>
                    <textarea
                      rows={2}
                      value={newLawContentUk}
                      onChange={(e) => setNewLawContentUk(e.target.value)}
                      placeholder="Юридичний переклад статті..."
                      className="w-full px-2.5 py-1.5 bg-[#050810] border border-slate-700 rounded text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddLawForm(false)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
                    >
                      Скасувати
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNewLaw}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                    >
                      Зберегти статтю в MemPalace
                    </button>
                  </div>
                </div>
              )}

              {/* List of Laws with Active/Disabled Toggles */}
              <div className="space-y-2">
                {filteredLaws.map((art) => {
                  const isEnabled = enabledLawIds.includes(art.id);
                  return (
                    <div
                      key={art.id}
                      className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        isEnabled
                          ? 'bg-[#070B14] border-slate-800 hover:border-slate-700'
                          : 'bg-[#05080E]/60 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {art.article}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {art.code}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                              art.jurisdiction === 'canton_vaud'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                                : 'bg-blue-950/60 text-blue-300 border-blue-800/50'
                            }`}
                          >
                            {art.jurisdiction === 'canton_vaud' ? 'Кантон Во (VD)' : 'Федеральне (CH)'}
                          </span>
                        </div>

                        <h4 className="text-xs font-semibold text-slate-100 mb-1">
                          {art.title[currentLang] || art.title['uk']}
                        </h4>

                        <p className="text-[11px] text-slate-400 font-serif italic line-clamp-2 leading-relaxed">
                          « {currentLang === 'uk' ? art.content_uk : art.content_fr} »
                        </p>
                      </div>

                      {/* Toggle Button */}
                      <button
                        onClick={() => handleToggleLaw(art.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
                          isEnabled
                            ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                        title={isEnabled ? 'Вимкнути з пошуку ШІ' : 'Увімкнути в пошук ШІ'}
                      >
                        {isEnabled ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Активна</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-slate-600" />
                            <span>Вимкнена</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}

                {filteredLaws.length === 0 && (
                  <div className="text-center py-10 text-slate-500 font-mono text-xs">
                    Статей за запитом не знайдено.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CLOUDFLARE TUNNEL & MCP                                           */}
          {/* ========================================================================= */}
          {activeTab === 'tunnel' && (
            <div className="space-y-5">
              <div className="bg-[#070B14] border border-slate-800 rounded-xl p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Network className="w-4 h-4 text-blue-400" />
                    <span>Публікація Utopia MCP для екосистеми Google AI (Gemini Spark Pro)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Використовуючи встановлений на вузлі .184 / .234 бінарник <code className="text-amber-300 font-mono">/usr/local/bin/cloudflared</code>, можна безпечно транслювати локальний MCP-сервер Utopia DB до Gemini Spark, NotebookLM та Google AI Studio.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Публічний URL тунелю для Legal MCP (Cloudflare Tunnel):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mcpTunnelUrl}
                      onChange={e => setMcpTunnelUrl(e.target.value)}
                      placeholder="https://legal-mcp.exodus.pp.ua"
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(mcpTunnelUrl, 'mcp_url')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs flex items-center gap-1.5"
                    >
                      {copiedKey === 'mcp_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Копіювати URL</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-300">
                      1. Cloudflare DNS Route &amp; Ingress (на вузлі .184):
                    </span>
                    <button
                      onClick={() => handleCopy('cloudflared tunnel route dns exodus-tunnel legal-mcp.exodus.pp.ua', 'cmd_quick')}
                      className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      {copiedKey === 'cmd_quick' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Скопіювати команду</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-amber-300 font-mono text-xs overflow-x-auto">
                    cloudflared tunnel route dns exodus-tunnel legal-mcp.exodus.pp.ua
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-300">
                      2. Запуск Legal MCP Gateway на вузлі .234 (порт 8766):
                    </span>
                    <button
                      onClick={() => handleCopy('python3 /home/vokov/projects/b-sdd-legal/daemon/legal_mcp_gateway.py', 'cmd_server')}
                      className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      {copiedKey === 'cmd_server' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Скопіювати команду</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto">
                    python3 /home/vokov/projects/b-sdd-legal/daemon/legal_mcp_gateway.py
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: TRANSLATIONS & OVERRIDES                                          */}
          {/* ========================================================================= */}
          {activeTab === 'translations' && (
            <div className="space-y-5">
              <div className="bg-[#070B14] border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Languages className="w-4 h-4 text-blue-400" />
                      <span>Керування ручними виправленнями перекладу</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Усі виправлення зберігаються локально та мають пріоритет над автоматичним перекладом.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
                    <input
                      type="checkbox"
                      checked={manualEditMode}
                      onChange={e => setManualEditMode(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span className="text-xs font-medium text-slate-200">
                      Режим ручного редагування
                    </span>
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Активні виправлення ({Object.keys(overrides).length}) :</span>
                    {Object.keys(overrides).length > 0 && (
                      <button
                        onClick={() => {
                          if (window.confirm('Скинути всі виправлення?')) {
                            clearAllOverrides();
                            onOverridesChange({});
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px]"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Скинути все</span>
                      </button>
                    )}
                  </div>

                  {Object.keys(overrides).length === 0 ? (
                    <div className="p-4 bg-slate-900/60 border border-dashed border-slate-800 rounded-lg text-center text-xs text-slate-500">
                      Немає активних ручних виправлень. Використовуються канонічні судові терміни B-SDD.
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-lg divide-y divide-slate-800">
                      {Object.entries(overrides).map(([key, val]) => (
                        <div key={key} className="p-2.5 bg-slate-900/40 flex items-center justify-between gap-3 text-xs">
                          <div className="flex-1 min-w-0">
                            <span className="font-mono text-[10px] text-blue-400 block truncate">{key}</span>
                            <span className="text-slate-200 block truncate">{val}</span>
                          </div>
                          <button
                            onClick={() => onOverridesChange(removeOverride(key))}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: SECURITY & ACCESS                                                 */}
          {/* ========================================================================= */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="bg-[#070B14] border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Безпека судового досьє PE24.014624-SBA</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Пароль / PIN адвоката для входу:
                    </label>
                    <input
                      type="text"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      placeholder="0523"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      За замовчуванням: 0523. Захищає від несанкціонованого перегляду.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Автоблокування при неактивності:
                    </label>
                    <select
                      value={autoLockMinutes}
                      onChange={e => setAutoLockMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
                    >
                      <option value={5}>5 хвилин</option>
                      <option value={15}>15 хвилин (рекомендовано)</option>
                      <option value={30}>30 хвилин</option>
                      <option value={60}>1 година</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Статус архітектурних інваріантів B-SDD:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded bg-slate-900/80 border border-emerald-900/40 flex items-center justify-between">
                      <span className="text-slate-300 font-mono">L-01 · WORM Незмінність</span>
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Utopia DB (:251)
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900/80 border border-emerald-900/40 flex items-center justify-between">
                      <span className="text-slate-300 font-mono">L-02 · Бітемпоральність $T_v/T_t$</span>
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Активно
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900/80 border border-emerald-900/40 flex items-center justify-between">
                      <span className="text-slate-300 font-mono">L-03 · Щит Adriano Milli (ст. 933 CC)</span>
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> 100% Імунітет
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900/80 border border-emerald-900/40 flex items-center justify-between">
                      <span className="text-slate-300 font-mono">L-04 · Повнолітній потерпілий</span>
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Arsen Kovalenko
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-[#080E1B]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
          >
            {t('settings_btn_close')}
          </button>

          <button
            onClick={handleSaveAll}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-900/40 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{t('settings_btn_save')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
