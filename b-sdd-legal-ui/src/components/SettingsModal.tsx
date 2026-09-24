// =========================================================================
// B-SDD LEGAL COCKPIT · ТЕХНІЧНІ НАЛАШТУВАННЯ ТА ІНТЕГРАЦІЯ (SETTINGS MODAL)
// LLM Проксі 18880, Cloudflare Tunnel MCP (Gemini Spark Pro), Ручні переклади, Безпека
// =========================================================================

import React, { useState } from 'react';
import { AppSettings, SupportedLanguage, TranslationOverrides } from '../types/i18n';
import { UI_TRANSLATIONS } from '../data/translations';
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
  const [activeTab, setActiveTab] = useState<'llm' | 'tunnel' | 'translations' | 'security'>('llm');

  // Local form state
  const [proxyUrl, setProxyUrl] = useState(settings.llmProxyUrl);
  const [apiKey, setApiKey] = useState(settings.llmApiKey);
  const [model, setModel] = useState(settings.llmModel);
  const [customModel, setCustomModel] = useState('');
  const [mcpTunnelUrl, setMcpTunnelUrl] = useState(settings.mcpTunnelUrl);
  const [authPassword, setAuthPassword] = useState(settings.authPassword);
  const [autoLockMinutes, setAutoLockMinutes] = useState(settings.autoLockMinutes);
  const [manualEditMode, setManualEditMode] = useState(settings.manualEditMode);

  // Connection testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Live test translation state
  const [testText, setTestText] = useState('La prévenue a proféré des menaces de mort graves contre le mineur Alexandre.');
  const [translatedTestResult, setTranslatedTestResult] = useState<string | null>(null);
  const [isTranslatingTest, setIsTranslatingTest] = useState(false);

  // Import JSON state
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const t = (key: string): string => {
    return UI_TRANSLATIONS[currentLang]?.[key] || UI_TRANSLATIONS['uk']?.[key] || key;
  };

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveAll = () => {
    const updated: AppSettings = {
      ...settings,
      llmProxyUrl: proxyUrl.trim(),
      llmApiKey: apiKey.trim(),
      llmModel: model === 'custom' ? customModel.trim() : model,
      mcpTunnelUrl: mcpTunnelUrl.trim(),
      authPassword: authPassword.trim() || '0523',
      autoLockMinutes: Number(autoLockMinutes) || 15,
      manualEditMode,
    };
    saveAppSettings(updated);
    onSaveSettings(updated);
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const targetModel = model === 'custom' ? customModel.trim() : model;
    const res = await testLLMProxyConnection(proxyUrl, apiKey, targetModel);
    setIsTesting(false);
    setTestResult(res);
  };

  const handleRunTestTranslation = async () => {
    setIsTranslatingTest(true);
    setTranslatedTestResult(null);
    const tempSettings: AppSettings = {
      ...settings,
      llmProxyUrl: proxyUrl.trim(),
      llmApiKey: apiKey.trim(),
      llmModel: model === 'custom' ? customModel.trim() : model,
    };
    const res = await translateWithLLM(testText, currentLang, tempSettings);
    setIsTranslatingTest(false);
    if (res.error) {
      setTranslatedTestResult(`[Помилка: ${res.error}]`);
    } else {
      setTranslatedTestResult(res.text);
    }
  };

  const handleExportOverrides = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(overrides, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `b-sdd-legal-overrides-${currentLang}-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportOverrides = () => {
    try {
      setImportError(null);
      const parsed = JSON.parse(importJsonText);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Очікується JSON-об’єкт зі структурою { key: "текст" }');
      }
      let count = 0;
      Object.entries(parsed).forEach(([k, v]) => {
        if (typeof v === 'string') {
          saveOverride(k, v);
          count++;
        }
      });
      const updated = { ...overrides, ...parsed };
      onOverridesChange(updated);
      setImportJsonText('');
      alert(`Успішно імпортовано ${count} виправлень!`);
    } catch (e: any) {
      setImportError(e.message || 'Некоректний JSON');
    }
  };

  const handleClearOverrides = () => {
    if (window.confirm('Ви дійсно бажаєте скинути всі ручні виправлення до оригінальних судових текстів?')) {
      clearAllOverrides();
      onOverridesChange({});
    }
  };

  const handleDeleteOverrideKey = (key: string) => {
    const updated = removeOverride(key);
    onOverridesChange(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{t('settings_title')}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-mono">
                  v2.4.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Конфігурація LLM проксі (.184:18880), Cloudflare Tunnel для MCP та безпеки досьє
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
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('llm')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'llm'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>{t('settings_tab_llm')}</span>
          </button>

          <button
            onClick={() => setActiveTab('tunnel')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'tunnel'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>{t('settings_tab_tunnel')}</span>
          </button>

          <button
            onClick={() => setActiveTab('translations')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'translations'
                ? 'border-blue-500 text-blue-400'
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
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('settings_tab_security')}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-200 text-xs sm:text-sm">
          {/* TAB 1: LLM PROXY & MODELS */}
          {activeTab === 'llm' && (
            <div className="space-y-5">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-400" />
                    <span>Підключення до LLM Проксі (Сервер 192.168.3.184)</span>
                  </h3>
                  <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    OpenAI API Compatible
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {t('settings_proxy_url')}
                    </label>
                    <input
                      type="text"
                      value={proxyUrl}
                      onChange={e => setProxyUrl(e.target.value)}
                      placeholder="http://192.168.3.184:18880/v1"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      💡 Примітка: Оскільки веб-додаток завантажено через HTTPS (b-sdd-legal-ui.pages.dev), прямі HTTP-запити до локального порту можуть блокуватися політикою Mixed Content. Рекомендовано відкрити порт 18880 через Cloudflare Tunnel або проксі зі SSL.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        {t('settings_model_slot')}
                      </label>
                      <select
                        value={model}
                        onChange={e => setModel(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                      >
                        <option value="meta/llama-3.3-70b-instruct">meta/llama-3.3-70b-instruct (Швейцарське право)</option>
                        <option value="mistralai/mistral-large-2407">mistralai/mistral-large-2407 (Висока точність)</option>
                        <option value="anthropic/claude-3-5-sonnet">anthropic/claude-3-5-sonnet (Складні висновки)</option>
                        <option value="deepseek/deepseek-chat">deepseek/deepseek-chat (Економічний слот)</option>
                        <option value="custom">Власний ID моделі (вказати вручну)...</option>
                      </select>
                      {model === 'custom' && (
                        <input
                          type="text"
                          value={customModel}
                          onChange={e => setCustomModel(e.target.value)}
                          placeholder="Введіть повний Model ID"
                          className="mt-2 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        {t('settings_api_key')}
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="Bearer token або API key (якщо потрібно)"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2 border border-slate-700"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Перевірка...' : t('settings_btn_test_conn')}</span>
                  </button>

                  {testResult && (
                    <div
                      className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                        testResult.success
                          ? 'bg-emerald-950/70 border border-emerald-800/80 text-emerald-300'
                          : 'bg-red-950/70 border border-red-800/80 text-red-300'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span>{testResult.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Translation Test Box */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Тест судового юридичного перекладу в реальному часі</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Цільова мова: <strong className="text-blue-400 font-mono">{currentLang.toUpperCase()}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono mb-1 block">Оригінал (Французька / FR) :</span>
                    <textarea
                      rows={3}
                      value={testText}
                      onChange={e => setTestText(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-mono mb-1 block">Результат перекладу LLM :</span>
                    <div className="w-full h-[76px] p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-blue-200 overflow-y-auto font-sans leading-relaxed">
                      {isTranslatingTest ? (
                        <span className="text-slate-500 italic flex items-center gap-1.5">
                          <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                          Виконується юридичний переклад через проксі...
                        </span>
                      ) : translatedTestResult ? (
                        translatedTestResult
                      ) : (
                        <span className="text-slate-600 italic">Натисніть «Тестовий переклад»</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunTestTranslation}
                  disabled={isTranslatingTest}
                  className="px-3 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Виконати тестовий судовий переклад</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CLOUDFLARE TUNNEL & MCP (GEMINI SPARK / GOOGLE AI) */}
          {activeTab === 'tunnel' && (
            <div className="space-y-5">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Network className="w-4 h-4 text-blue-400" />
                    <span>Публікація Utopia MCP для екосистеми Google AI (Gemini Spark Pro)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Використовуючи встановлений на вузлі .184 / .234 бінарник <code className="text-amber-300 font-mono">/usr/local/bin/cloudflared</code>, можна безпечно транслювати локальний MCP-сервер Utopia DB до Gemini Spark, NotebookLM та Google AI Studio.
                  </p>
                </div>

                {/* Tunnel URL input */}
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
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

                {/* Command Snippet 1: Quick TryCloudflare / Ingress route */}
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

                {/* Command Snippet 2: MCP Server launch */}
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

                {/* JSON configuration for Gemini Spark / Google AI */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-300">
                      3. Конфігурація MCP для Gemini Spark / Google AI Studio:
                    </span>
                    <button
                      onClick={() => handleCopy(JSON.stringify({
                        mcpServers: {
                          "b-sdd-legal": {
                            url: `${mcpTunnelUrl || "https://legal-mcp.exodus.pp.ua"}/sse`,
                            tools: [
                              "legal_dossier_search",
                              "legal_transcripts_query",
                              "legal_actor_matrix_get",
                              "legal_evidence_get",
                              "legal_sprint_dispatch",
                              "legal_supervisor_status",
                              "legal_epub_rebuild",
                              "utopia_db_query",
                              "utopia_bitemporal_query",
                              "utopia_record_worm_ledger",
                              "utopia_check_invariants",
                              "gitnexus_ast_query",
                              "gitnexus_blast_radius",
                              "drakon_planar_validate"
                            ]
                          }
                        }
                      }, null, 2), 'json_config')}
                      className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      {copiedKey === 'json_config' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Скопіювати JSON</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-[11px] overflow-x-auto">
{`{
  "mcpServers": {
    "b-sdd-legal": {
      "url": "${mcpTunnelUrl || 'https://legal-mcp.exodus.pp.ua'}/sse",
      "tools": [
        "legal_dossier_search",
        "legal_transcripts_query",
        "legal_actor_matrix_get",
        "legal_evidence_get",
        "legal_sprint_dispatch",
        "legal_supervisor_status",
        "legal_epub_rebuild",
        "utopia_db_query",
        "utopia_bitemporal_query",
        "utopia_record_worm_ledger",
        "utopia_check_invariants",
        "gitnexus_ast_query",
        "gitnexus_blast_radius",
        "drakon_planar_validate"
      ]
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSLATIONS & OVERRIDES */}
          {activeTab === 'translations' && (
            <div className="space-y-5">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
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

                  {/* Toggle Edit Mode */}
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

                {/* Overrides Table / List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Активні виправлення ({Object.keys(overrides).length}) :</span>
                    {Object.keys(overrides).length > 0 && (
                      <button
                        onClick={handleClearOverrides}
                        className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px]"
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
                            onClick={() => handleDeleteOverrideKey(key)}
                            title="Видалити виправлення"
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Import / Export Buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleExportOverrides}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Експорт виправлень (JSON)</span>
                  </button>
                </div>

                {/* Import Box */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-medium text-slate-300 block">
                    Імпорт виправлень з JSON:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={importJsonText}
                      onChange={e => setImportJsonText(e.target.value)}
                      placeholder='{"key": "новий переклад"}'
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleImportOverrides}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Імпортувати</span>
                    </button>
                  </div>
                  {importError && (
                    <span className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {importError}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & ACCESS */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Безпека судового досьє CASE-SAMPLE-2026-CH</span>
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
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={5}>5 хвилин</option>
                      <option value={15}>15 хвилин (рекомендовано)</option>
                      <option value={30}>30 хвилин</option>
                      <option value={60}>1 година</option>
                    </select>
                  </div>
                </div>

                {/* Invariant Status Ledger */}
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
                      <span className="text-slate-300 font-mono">L-03 · Щит Jean-Paul Vernon</span>
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> 100% Імунітет
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900/80 border border-emerald-900/40 flex items-center justify-between">
                      <span className="text-slate-300 font-mono">L-04 · Захист дитини (ст. 122 КПК)</span>
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Alexandre Dubois
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/80">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            {t('settings_btn_close')}
          </button>

          <button
            onClick={handleSaveAll}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-blue-900/40 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{t('settings_btn_save')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
