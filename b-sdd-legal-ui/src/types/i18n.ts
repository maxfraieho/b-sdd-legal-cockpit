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

export interface AppSettings {
  language: SupportedLanguage;
  llmProxyUrl: string;
  llmApiKey: string;
  llmModel: string;
  mcpTunnelUrl: string;
  authPassword: string;
  autoLockMinutes: number;
  manualEditMode: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'uk', // Ukrainian is primary
  llmProxyUrl: 'http://192.168.3.184:18880/v1',
  llmApiKey: '',
  llmModel: 'meta/llama-3.3-70b-instruct',
  mcpTunnelUrl: 'https://legal-mcp.exodus.pp.ua',
  authPassword: '0523',
  autoLockMinutes: 15,
  manualEditMode: false,
};

export type TranslationOverrides = Record<string, string>;
