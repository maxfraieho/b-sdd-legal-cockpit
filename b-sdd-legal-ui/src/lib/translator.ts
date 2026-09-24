// =========================================================================
// B-SDD LEGAL COCKPIT · ШІ-ДВИГУН ПЕРЕКЛАДУ ТА КЕРУВАННЯ ПЕРЕЗАПИСАМИ
// Підтримка LLM-проксі 192.168.3.184:18880 (OpenAI API), кешування, ручного редагування
// =========================================================================

import { AppSettings, DEFAULT_SETTINGS, SupportedLanguage, TranslationOverrides } from '../types/i18n';

export const BSDD_SETTINGS_KEY = 'b_sdd_legal_settings';
export const BSDD_OVERRIDES_KEY = 'b_sdd_legal_overrides';
export const BSDD_AUTH_KEY = 'b_sdd_legal_auth_state';

// Load settings from localStorage
export function loadAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(BSDD_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

// Save settings to localStorage
export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(BSDD_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
  }
}

// Load translation overrides
export function loadOverrides(): TranslationOverrides {
  try {
    const raw = localStorage.getItem(BSDD_OVERRIDES_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Save a single override
export function saveOverride(key: string, value: string): TranslationOverrides {
  const current = loadOverrides();
  current[key] = value;
  try {
    localStorage.setItem(BSDD_OVERRIDES_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save override:', e);
  }
  return current;
}

// Remove an override (revert to canonical)
export function removeOverride(key: string): TranslationOverrides {
  const current = loadOverrides();
  delete current[key];
  try {
    localStorage.setItem(BSDD_OVERRIDES_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to remove override:', e);
  }
  return current;
}

// Clear all overrides
export function clearAllOverrides(): void {
  try {
    localStorage.removeItem(BSDD_OVERRIDES_KEY);
  } catch (e) {
    console.error('Failed to clear overrides:', e);
  }
}

// In-memory cache for live LLM translations to minimize network latency
const translationCache = new Map<string, string>();

function getCacheKey(text: string, targetLang: SupportedLanguage, model: string): string {
  return `${model}::${targetLang}::${text.slice(0, 100)}::${text.length}`;
}

export interface TranslationResult {
  text: string;
  fromCache: boolean;
  modelUsed: string;
  error?: string;
}

/**
 * Live Swiss Judicial Translation via LLM Proxy (192.168.3.184:18880 or Cloudflare Tunnel)
 * Formatted with strict Swiss Criminal Procedure & Criminal Code terminology.
 */
export async function translateWithLLM(
  text: string,
  targetLang: SupportedLanguage,
  settings: AppSettings = loadAppSettings()
): Promise<TranslationResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { text: '', fromCache: false, modelUsed: settings.llmModel };
  }

  const cacheKey = getCacheKey(trimmed, targetLang, settings.llmModel);
  if (translationCache.has(cacheKey)) {
    return {
      text: translationCache.get(cacheKey)!,
      fromCache: true,
      modelUsed: settings.llmModel,
    };
  }

  const targetLangName =
    targetLang === 'uk' ? 'Ukrainian (Українська)' :
    targetLang === 'en' ? 'English' : 'French (Français suisse)';

  const systemPrompt = `You are a high-level Swiss legal jurist, advocate, and court translator specializing in Swiss Criminal Law (Code pénal suisse CP), Swiss Criminal Procedure (Code de procédure pénale suisse CPP), and Civil Obligations (Code des obligations CO) for the Canton de Vaud jurisdiction (Ministère public).

Your task is to accurately translate judicial texts, criminal allegations, evidence notes, and court conclusions into ${targetLangName}.
Rules:
1. Maintain rigorous legal terminology precision:
   - "Partie plaignante" -> "Потерпілий та цивільний позивач" (UK) / "Private Claimant & Injured Party" (EN)
   - "Lésé" -> "Потерпілий" (UK) / "Victim / Injured Party" (EN)
   - "Prévenue" -> "Обвинувачена / Підозрювана" (UK) / "Accused / Defendant" (EN)
   - "Conclusions civiles" -> "Цивільний позов / Цивільні вимоги" (UK) / "Civil claims" (EN)
   - "Menaces graves qualifiées" -> "Кваліфіковані тяжкі погрози" (UK)
   - "Abus de confiance & Escroquerie" -> "Привласнення майна та шахрайство" (UK)
   - "Dénonciation calomnieuse" -> "Завідомо неправдиве повідомлення про злочин" (UK)
   - "Secret de l'instruction" -> "Таємниця слідства" (UK)
2. Preserve all article references intact (e.g., Art. 180 al. 2 CP, Art. 318 CPP, ATF 146 IV 9, Art. 49 CO).
3. Preserve all SHA-256 hashes, timestamps, and evidence numbers (P-01..P-15).
4. Output ONLY the translated text without extra conversational filler, quotes, or markdown wrappers.`;

  const url = `${settings.llmProxyUrl.replace(/\/+$/, '')}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (settings.llmApiKey) {
    headers['Authorization'] = `Bearer ${settings.llmApiKey}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const response = await fetch(url, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model: settings.llmModel || 'meta/llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: trimmed },
        ],
        temperature: 0.1,
        max_tokens: 2048,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      return {
        text: trimmed,
        fromCache: false,
        modelUsed: settings.llmModel,
        error: `LLM Proxy HTTP ${response.status}: ${errText.slice(0, 200)}`,
      };
    }

    const data = await response.json();
    const translated = data?.choices?.[0]?.message?.content?.trim() || trimmed;

    // Cache the result
    translationCache.set(cacheKey, translated);

    return {
      text: translated,
      fromCache: false,
      modelUsed: settings.llmModel,
    };
  } catch (err: any) {
    console.error('LLM Translation error:', err);
    return {
      text: trimmed,
      fromCache: false,
      modelUsed: settings.llmModel,
      error: err.name === 'AbortError' ? 'Час очікування відповіді LLM вичерпано (20с)' : (err.message || 'Помилка мережі до LLM-проксі'),
    };
  }
}

/**
 * Test connectivity to the LLM Proxy
 */
export async function testLLMProxyConnection(
  url: string,
  apiKey: string,
  model: string
): Promise<{ success: boolean; message: string; availableModels?: string[] }> {
  const cleanUrl = url.replace(/\/+$/, '');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  // 1. Try GET /models
  try {
    const modelsRes = await fetch(`${cleanUrl}/models`, {
      method: 'GET',
      headers,
    });
    if (modelsRes.ok) {
      const modelsData = await modelsRes.json();
      const list = Array.isArray(modelsData?.data)
        ? modelsData.data.map((m: any) => m.id)
        : [];
      return {
        success: true,
        message: `З'єднання успішне! Доступно моделей: ${list.length}`,
        availableModels: list,
      };
    }
  } catch {
    // If GET /models fails (some proxies only expose /chat/completions), try a minimal ping
  }

  // 2. Try minimal /chat/completions ping
  try {
    const compRes = await fetch(`${cleanUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || 'meta/llama-3.3-70b-instruct',
        messages: [{ role: 'user', content: 'Ping' }],
        max_tokens: 2,
      }),
    });
    if (compRes.ok) {
      return {
        success: true,
        message: `Проксі відповідає на запити! Модель '${model}' активна.`,
      };
    }
    const errText = await compRes.text();
    return {
      success: false,
      message: `HTTP ${compRes.status}: ${errText.slice(0, 150)}`,
    };
  } catch (e: any) {
    return {
      success: false,
      message: `Помилка з'єднання: ${e.message}. (Примітка: якщо UI відкрито через HTTPS, прямі HTTP-запити до локальної мережі можуть блокуватись браузером. Використовуйте Cloudflare Tunnel URL або дозвіл Mixed Content).`,
    };
  }
}
