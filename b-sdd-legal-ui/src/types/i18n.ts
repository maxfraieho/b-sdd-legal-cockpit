// =========================================================================
// B-SDD LEGAL COCKPIT · I18N & SYSTEM SETTINGS TYPES
// Supporting Ukrainian (Primary), French (Official Swiss), English
// =========================================================================

export type SupportedLanguage = 'uk' | 'fr' | 'en';

export interface LanguageInfo {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'uk', label: 'Українська', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'fr', label: 'Français', nativeName: 'Français (CH)', flag: '🇨🇭' },
  { code: 'en', label: 'English', nativeName: 'English (US)', flag: '🇬🇧' },
];

export type AIAgentRole = 'criminal_investigator' | 'forensic_audio_digital' | 'civil_sequestration_auditor';
export type AIProviderMode = 'local_proxy' | 'gemini_cloud' | 'mempalace_builtin';

export interface AppSettings {
  language: SupportedLanguage;
  aiProviderMode: AIProviderMode;
  aiAgentRole: AIAgentRole;
  geminiModel: string;
  geminiApiKey: string;
  geminiTemperature: number;
  llmProxyUrl: string;
  llmApiKey: string;
  llmModel: string;
  selectedSlot: 'slot-1' | 'slot-2' | 'slot-3' | 'custom';
  connectMemPalaceGraph: boolean;
  connectUtopiaDb: boolean;
  enableTemporalSearch: boolean;
  enableInvariantEnforcement: boolean;
  enableSequestrationCalc: boolean;
  enabledLawIds: string[];
  mcpTunnelUrl: string;
  authPassword: string;
  autoLockMinutes: number;
  manualEditMode: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'uk', // Ukrainian is primary
  aiProviderMode: 'local_proxy',
  aiAgentRole: 'criminal_investigator',
  geminiModel: 'gemini-3.8-flash',
  geminiApiKey: '',
  geminiTemperature: 0.2,
  llmProxyUrl: 'http://192.168.3.184:18880/v1',
  llmApiKey: '',
  llmModel: 'meta/llama-3.3-70b-instruct',
  selectedSlot: 'slot-2',
  connectMemPalaceGraph: true,
  connectUtopiaDb: true,
  enableTemporalSearch: true,
  enableInvariantEnforcement: true,
  enableSequestrationCalc: true,
  enabledLawIds: [
    'CP-146', 'CP-180', 'CP-181', 'CP-186', 'CP-303', 'CP-138', 'CP-123',
    'CPP-115', 'CPP-118', 'CPP-139', 'CPP-263', 'CPP-318',
    'CC-933', 'CO-49', 'LEI-118',
    'VAUD-LOJV', 'VAUD-LJPA', 'VAUD-TDIP',
    'ATF-146-IV-9', 'ATF-141-IV-369', 'ATF-144-IV-285'
  ],
  mcpTunnelUrl: 'https://legal-mcp.exodus.pp.ua',
  authPassword: '0523',
  autoLockMinutes: 15,
  manualEditMode: false,
};

export type TranslationOverrides = Record<string, string>;
