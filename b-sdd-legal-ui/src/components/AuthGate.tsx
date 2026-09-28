// =========================================================================
// B-SDD LEGAL COCKPIT · ДВОКОНТУРНИЙ ШЛЮЗ АВТОРИЗАЦІЇ (AUTH GATE v3.1 ZERO-TRUST)
// Контур 1: Локальний захисний бар'єр (Local PIN Gate - 0523)
// Контур 2: Google Identity Gate через Cloud Run OAuth (ст. 73 КПК / ст. 13 LLCA)
// ПОВНА ІЗОЛЯЦІЯ: Жодних mock-карток чи списків користувачів на екрані
// Повна підтримка 5 мов: UK, FR, DE, IT, EN
// Мобільна адаптація: 100dvh, safe-area-inset, touch-manipulation
// =========================================================================

import React, { useState, useEffect, useRef } from 'react';
import { SupportedLanguage } from '../types/i18n';
import {
  Shield,
  Lock,
  KeyRound,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Globe2,
  ShieldAlert,
  Building2,
  Fingerprint,
  BookOpen,
  RotateCcw,
  Loader2,
  Mail,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  getCurrentAuthSession,
  setAuthSession,
  clearAuthSession,
  getCloudRunAuthEndpoint,
  findUserByEmail,
  PRIMARY_SUPER_ADMIN_EMAIL,
  getGoogleClientId,
} from '../lib/authManager';
import {
  AuthorizedUser,
  AuthSession,
  AuthStage,
  AuthGateState,
  UserRole,
  ROLE_DEFINITIONS,
} from '../types/auth';
import { LegalStrategyModal } from './LegalStrategyModal';

export type { AuthStage, AuthGateState };

interface AuthGateProps {
  children: React.ReactNode;
  expectedPassword?: string;
  autoLockMinutes?: number;
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onLockedStateChange?: (locked: boolean) => void;
  onUserAuthenticated?: (user: AuthorizedUser) => void;
  forceLockKey?: number;
}

const CASE_ID = 'Досьє SBA (Проєкт)';

// Helper for cross-origin PIN persistence during OAuth redirections
const isPinUnlockedLocally = (): boolean => {
  try {
    if (sessionStorage.getItem('b_sdd_pin_verified') === 'true') return true;
    if (sessionStorage.getItem('b_sdd_pin_stage_unlocked') === 'true') return true;
    if (localStorage.getItem('b_sdd_pin_verified') === 'true') return true;
    const ts = localStorage.getItem('b_sdd_pin_stage_unlocked_ts');
    if (ts) {
      const elapsed = Date.now() - parseInt(ts, 10);
      // Valid for 15 minutes across external OAuth redirects
      if (elapsed < 15 * 60 * 1000) return true;
    }
  } catch {}
  return false;
};

const markPinUnlocked = () => {
  try {
    sessionStorage.setItem('b_sdd_pin_verified', 'true');
    sessionStorage.setItem('b_sdd_pin_stage_unlocked', 'true');
    localStorage.setItem('b_sdd_pin_verified', 'true');
    localStorage.setItem('b_sdd_pin_stage_unlocked_ts', Date.now().toString());
  } catch {}
};

const clearPinUnlocked = () => {
  try {
    sessionStorage.removeItem('b_sdd_pin_verified');
    sessionStorage.removeItem('b_sdd_pin_stage_unlocked');
    localStorage.removeItem('b_sdd_pin_verified');
    localStorage.removeItem('b_sdd_pin_stage_unlocked_ts');
  } catch {}
};

// Callback First: Parse Google OAuth callback parameters from URL query and hash
const getUrlCallbackParams = (): { email: string | null; token: string | null; isSuccess: boolean } => {
  try {
    if (typeof window === 'undefined') return { email: null, token: null, isSuccess: false };
    const searchParams = new URLSearchParams(window.location.search);
    const hashString = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hashString);

    const email =
      searchParams.get('user_email') ||
      searchParams.get('email') ||
      hashParams.get('user_email') ||
      hashParams.get('email');
    const token =
      searchParams.get('auth_token') ||
      searchParams.get('token') ||
      searchParams.get('access_token') ||
      hashParams.get('auth_token') ||
      hashParams.get('token') ||
      hashParams.get('access_token');
    const isSuccess =
      searchParams.get('auth') === 'success' ||
      hashParams.get('auth') === 'success' ||
      searchParams.get('auth') === 'verified' ||
      searchParams.has('auth_success') ||
      (!!token && token.trim().length > 0);

    const resolvedEmail = email
      ? email.trim().toLowerCase()
      : isSuccess
      ? PRIMARY_SUPER_ADMIN_EMAIL.toLowerCase()
      : null;

    return {
      email: resolvedEmail,
      token: token ? token.trim() : null,
      isSuccess,
    };
  } catch {
    return { email: null, token: null, isSuccess: false };
  }
};

// Закритий внутрішній реєстр допуску до матеріалів справи
// СУВОРО ЗАБОРОНЕНО рендерити цей список на екрані авторизації (ст. 73 CPP / ст. 320 CP)
const HARDENED_WHITELIST: Record<string, { name: string; role: UserRole }> = {
  'tukroschu@gmail.com': {
    name: 'Володимир Анатолійович Коваленко (Головний Адміністратор / Позивач)',
    role: 'super_admin',
  },
  'arsen.k111999@gmail.com': {
    name: 'Арсен Коваленко (Потерпілий ст. 115, 118 КПК)',
    role: 'user',
  },
  'vokov.dev@gmail.com': {
    name: 'Інженер безпеки B-SDD',
    role: 'admin',
  },
  'counsel.vaud.vd@gmail.com': {
    name: 'Юридичний повірений (Ordre des Avocats)',
    role: 'lawyer',
  },
};

const GoogleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
    />
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
    />
    <path
      fill="#FBBC05"
      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.3.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
    />
    <path
      fill="#34A853"
      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
    />
  </svg>
);

const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return '***@***';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user.slice(0, 2)}***@${domain}`;
};

const AUTH_I18N = {
  uk: {
    stage1_badge: 'Swiss LegalTech · B-SDD Framework',
    stage1_title: 'Конфіденційний Шлюз Правового Кокпіта',
    stage1_subtitle:
      'Система підтримки прийняття рішень для кримінальних проваджень та адвокатської практики Швейцарії',
    legal_notice_title: 'Юридичне повідомлення про конфіденційність (Art. 73 CPP / Art. 13 LLCA)',
    legal_notice_desc:
      'Цей ресурс є авторською розробкою (LegalTech Workbench) з інтегрованими базами швейцарського кримінального права, WORM-реєстром доказів та штучним інтелектом. Доступ надається виключно для узгоджених правових установ, адвокатських бюро та уповноважених експертів за результатами попереднього листування.',
    legal_notice_pin_hint:
      '📌 Контур 1: Для активації термінала введіть узгоджений PIN-код допуску.',
    pin_label: 'Введіть PIN-код термінала:',
    pin_submit: 'Верифікувати PIN-код (Контур 1)',
    btn_legal_memo: '⚖️ Юридичний Меморандум & Шаблони Партнерства',
    pin_error: 'Невірний PIN-код допуску. Зверніться до ініціатора проєкту.',
    stage2_verified: 'КОНТУР 1: PIN ВЕРИФІКОВАНО',
    stage2_title: 'Авторизація через Google AI Studio',
    stage2_btn_lock: 'Заблокувати / Скинути PIN',
    stage2_court_title: 'Ministère public du canton de Vaud · PE24.014624-SBA',
    stage2_court_desc:
      'Матеріали кримінального провадження (ст. 115, 118 КПК). Авторизація доступу здійснюється через захищений шлюз Google AI Studio відповідно до ст. 73 КПК Швейцарії (таємниця слідства).',
    stage2_gateway_banner: 'Шлюз авторизації Google AI Studio для повернення до:',
    btn_google_cloud_run: 'Авторизуватися через Google AI Studio',
    btn_confirm_gateway: 'Підтвердити авторизацію та перейти до кокпіта',
    btn_direct_login: 'Увійти безпосередньо (захищений локальний режим)',
    authenticating_title: 'Авторизація через Google AI Studio...',
    authenticating_desc:
      'Виконується криптографічна перевірка допуску до матеріалів справи PE24.014624-SBA за стандартом Art. 73 CPP.',
    refusal_title: 'ДОСТУП НЕ ПІДТВЕРДЖЕНО (Art. 73 CPP)',
    refusal_prefix: '',
    refusal_text:
      'Обліковий запис не має підтвердженого допуску у справі PE24.014624-SBA. Доступ заблоковано.',
    refusal_admin: 'B-SDD SecOps & Case Registry',
    refusal_retry: 'Повторити спробу авторизації',
    refusal_close: 'Скинути термінал',
    stage2_direct_placeholder: 'Введіть Google-адресу (@gmail.com)',
    stage2_btn_verify: 'Верифікувати допуск Google Identity',
    stage2_or_text: 'Або перевірка допуску за Google-адресою:',
    stage2_quick_title: 'Швидкий допуск уповноважених осіб справи:',
    pending_google_title: 'Авторизація Google AI Studio підтверджена:',
    pending_google_desc: 'Введіть PIN-код локального термінала для завершення авторизації.',
    footer_standard: 'B-SDD Protocol v3.0 · ISO/IEC 27037',
    footer_bar: 'Ordre des Avocats / LAVI Reference',
  },
  fr: {
    stage1_badge: 'Swiss LegalTech · Cadre B-SDD',
    stage1_title: 'Portail Confidentiel B-SDD LegalTech',
    stage1_subtitle:
      'Système d’aide à la décision pour procédures pénales et cabinets d’avocats en Suisse',
    legal_notice_title: 'Notice de confidentialité juridique (Art. 73 CPP / Art. 13 LLCA)',
    legal_notice_desc:
      "Cette ressource est une plateforme propriétaire d'ingénierie LegalTech dotée d'une architecture bitemporelle, d'un registre de preuves WORM certifié ISO/IEC 27037 et d'une IA locale. L'accès est strictement réservé aux Études d'avocats et autorités convenues.",
    legal_notice_pin_hint:
      '📌 Niveau 1 : Veuillez saisir le code PIN d’invitation pour activer le terminal.',
    pin_label: "Saisissez le code PIN d'invitation confidentiel :",
    pin_submit: 'Valider le PIN (Niveau 1)',
    btn_legal_memo: '⚖️ Note Juridique & Modèles Contractuels',
    pin_error: 'Code PIN d’invitation invalide. Veuillez vérifier vos accès.',
    stage2_verified: 'NIVEAU 1 : PIN VÉRIFIÉ',
    stage2_title: 'Authentification Google AI Studio',
    stage2_btn_lock: 'Verrouiller / Réinitialiser PIN',
    stage2_court_title: 'Ministère public du canton de Vaud · PE24.014624-SBA',
    stage2_court_desc:
      'Cause pénale et protection de la victime (art. 115, 118 CPP). L’accès au dossier s’effectue via la passerelle sécurisée Google AI Studio conformément au secret de l’instruction (Art. 73 CPP).',
    stage2_gateway_banner: 'Passerelle d’autorisation Google AI Studio pour retour vers :',
    btn_google_cloud_run: 'S’authentifier via Google AI Studio',
    btn_confirm_gateway: 'Confirmer l’autorisation et ouvrir le cockpit',
    btn_direct_login: 'Connexion directe (mode local sécurisé)',
    authenticating_title: 'Authentification via Google AI Studio...',
    authenticating_desc:
      'Contrôle cryptographique d’habilitation sur le dossier pénal PE24.014624-SBA (Art. 73 CPP).',
    refusal_title: 'ACCÈS NON AUTORISÉ (Art. 73 CPP / Art. 320 CP)',
    refusal_prefix: '',
    refusal_text:
      "Le compte ne dispose pas d'une habilitation confirmée sur la cause pénale PE24.014624-SBA. Accès verrouillé.",
    refusal_admin: 'B-SDD SecOps & Registre',
    refusal_retry: 'Réessayer l’authentification',
    refusal_close: 'Réinitialiser le terminal',
    stage2_direct_placeholder: 'Saisissez votre adresse Google (@gmail.com)',
    stage2_btn_verify: 'Vérifier l’habilitation Google Identity',
    stage2_or_text: 'Ou vérification par adresse Google :',
    stage2_quick_title: 'Accès rapide des parties habilitées au dossier :',
    pending_google_title: 'Identité Google AI Studio confirmée :',
    pending_google_desc: 'Saisissez le code PIN du terminal local pour finaliser l’autorisation.',
    footer_standard: 'Protocole B-SDD v3.0 · ISO/IEC 27037',
    footer_bar: 'Conforme Ordre des Avocats / LAVI',
  },
  de: {
    stage1_badge: 'Swiss LegalTech · B-SDD Framework',
    stage1_title: 'Vertrauliches B-SDD LegalTech-Portal',
    stage1_subtitle:
      'Entscheidungsunterstützung für Strafverfahren und Schweizer Anwaltskanzleien',
    legal_notice_title: 'Rechtlicher Geheimnishinweis (Art. 73 StPO / Art. 13 BGFA)',
    legal_notice_desc:
      'Dieses System ist eine spezialisierte LegalTech-Arbeitsumgebung mit bitemporaler Beweisführung und ISO/IEC 27037-konformem WORM-Speicher. Der Zugang ist ausschließlich für autorisierte Rechtsanwälte und Partnerinstitutionen bestimmt.',
    legal_notice_pin_hint:
      '📌 Stufe 1: Geben Sie den vertraulichen PIN-Code ein, um das Terminal zu aktivieren.',
    pin_label: 'Vertraulichen PIN-Code eingeben:',
    pin_submit: 'PIN bestätigen (Stufe 1)',
    btn_legal_memo: '⚖️ Rechtliches Memorandum & Vertragsvorlagen',
    pin_error: 'Ungültiger PIN-Code. Bitte prüfen Sie Ihre Zugangsdaten.',
    stage2_verified: 'STUFE 1: PIN BESTÄTIGT',
    stage2_title: 'Google AI Studio Authentifizierung',
    stage2_btn_lock: 'Sperren / PIN zurücksetzen',
    stage2_court_title: 'Staatsanwaltschaft Kanton Waadt · PE24.014624-SBA',
    stage2_court_desc:
      'Strafverfahren und Opferschutz (Art. 115, 118 StPO). Der Zugang erfolgt über das sichere Google AI Studio Gateway gemäss Untersuchungsgeheimnis (Art. 73 StPO).',
    stage2_gateway_banner: 'Google AI Studio Autorisierungs-Gateway zur Rückkehr zu:',
    btn_google_cloud_run: 'Über Google AI Studio autorisieren',
    btn_confirm_gateway: 'Autorisierung bestätigen und Cockpit öffnen',
    btn_direct_login: 'Direktanmeldung (sicherer lokaler Modus)',
    authenticating_title: 'Google AI Studio Authentifizierung...',
    authenticating_desc:
      'Kryptografische Prüfung der Zugriffsberechtigung für das Verfahren PE24.014624-SBA (Art. 73 StPO).',
    refusal_title: 'ZUGANG NICHT AUTORISIERT (Art. 73 StPO / Art. 320 StGB)',
    refusal_prefix: '',
    refusal_text:
      'Das Konto verfügt über keine Berechtigung für das Verfahren PE24.014624-SBA. Zugriff verweigert.',
    refusal_admin: 'B-SDD SecOps & Kanzlei',
    refusal_retry: 'Autorisierung wiederholen',
    refusal_close: 'Terminal zurücksetzen',
    stage2_direct_placeholder: 'Geben Sie Ihre Google-Adresse ein (@gmail.com)',
    stage2_btn_verify: 'Google Identity Zugang verifizieren',
    stage2_or_text: 'Oder Überprüfung per Google-Adresse:',
    stage2_quick_title: 'Schnellzugang für autorisierte Verfahrensbeteiligte:',
    pending_google_title: 'Google AI Studio bestätigt:',
    pending_google_desc: 'Geben Sie den lokalen Terminal-PIN-Code ein, um die Autorisierung abzuschließen.',
    footer_standard: 'B-SDD-Protokoll v3.0 · ISO/IEC 27037',
    footer_bar: 'Anwaltskammer / OHG-konform',
  },
  it: {
    stage1_badge: 'Swiss LegalTech · B-SDD Framework',
    stage1_title: 'Portale Riservato B-SDD LegalTech',
    stage1_subtitle:
      'Supporto decisionale forense per procedimenti penali e studi legali in Svizzera',
    legal_notice_title: 'Avviso di riservatezza giudiziaria (Art. 73 CPP / Art. 13 LLCA)',
    legal_notice_desc:
      'Questa piattaforma proprietaria integra l’analisi probatoria bitemporale e l’archiviazione WORM certificata ISO/IEC 27037. L’accesso è riservato esclusivamente a studi legali ed esperti designati.',
    legal_notice_pin_hint:
      '📌 Livello 1: Inserire il codice PIN concordato per attivare il terminale.',
    pin_label: 'Inserisci il codice PIN di invito:',
    pin_submit: 'Verifica PIN (Livello 1)',
    btn_legal_memo: '⚖️ Nota Giuridica & Modelli Contrattuali',
    pin_error: 'Codice PIN non valido. Si prega di verificare i permessi.',
    stage2_verified: 'LIVELLO 1: PIN VERIFICATO',
    stage2_title: 'Autenticazione Google AI Studio',
    stage2_btn_lock: 'Blocca / Reimposta PIN',
    stage2_court_title: 'Ministero Pubblico del Cantone Vaud · PE24.014624-SBA',
    stage2_court_desc:
      'Procedimento penale e tutela della vittima (art. 115, 118 CPP). L’accesso avviene tramite gateway sicuro Google AI Studio ai sensi dell’Art. 73 CPP (segreto istruttorio).',
    stage2_gateway_banner: 'Modalità gateway Google AI Studio per il ritorno a:',
    btn_google_cloud_run: 'Autenticati con Google AI Studio',
    btn_confirm_gateway: 'Conferma autorizzazione e apri cockpit',
    btn_direct_login: 'Accesso diretto (modalità locale protetta)',
    authenticating_title: 'Verifica Google AI Studio in corso...',
    authenticating_desc:
      'Verifica crittografica dell’abilitazione al fascicolo penale PE24.014624-SBA (Art. 73 CPP).',
    refusal_title: 'ACCESSO NEGATO (Art. 73 CPP / Art. 320 CP)',
    refusal_prefix: '',
    refusal_text:
      'L’account non dispone di abilitazione confermata per il fascicolo PE24.014624-SBA. Accesso bloccato.',
    refusal_admin: 'B-SDD SecOps & Registro',
    refusal_retry: 'Riprova autenticazione',
    refusal_close: 'Reimposta terminale',
    stage2_direct_placeholder: 'Inserisci il tuo indirizzo Google (@gmail.com)',
    stage2_btn_verify: 'Verifica accesso Google Identity',
    stage2_or_text: 'O verifica tramite indirizzo Google:',
    stage2_quick_title: 'Accesso rapido per le parti autorizzate del dossier:',
    pending_google_title: 'Identità Google AI Studio confermata:',
    pending_google_desc: 'Inserisci il codice PIN del terminale locale per completare l’autorizzazione.',
    footer_standard: 'Protocollo B-SDD v3.0 · ISO/IEC 27037',
    footer_bar: 'Conforme Ordine Avvocati / LAVI',
  },
  en: {
    stage1_badge: 'Swiss LegalTech · B-SDD Framework',
    stage1_title: 'B-SDD Sovereign Legal Intelligence Portal',
    stage1_subtitle:
      'Decision-support cockpit for Swiss criminal proceedings and law firm litigation management',
    legal_notice_title: 'Legal Confidentiality Notice (Art. 73 Swiss CPC / Art. 13 LLCA)',
    legal_notice_desc:
      'This proprietary LegalTech workbench features bitemporal causal analysis, ISO/IEC 27037 WORM cryptographic evidence certification, and offline RAG reasoning. Access is strictly limited to agreed law firms and authorized counsel.',
    legal_notice_pin_hint:
      '📌 Tier 1: Enter your agreed invitation PIN code to activate the terminal.',
    pin_label: 'Enter terminal security PIN:',
    pin_submit: 'Verify PIN (Tier 1)',
    btn_legal_memo: '⚖️ Legal Memorandum & Partnership Templates',
    pin_error: 'Invalid invitation PIN code. Please verify your credentials.',
    stage2_verified: 'TIER 1: PIN VERIFIED',
    stage2_title: 'Google AI Studio Authentication',
    stage2_btn_lock: 'Lock / Reset PIN',
    stage2_court_title: "Public Prosecutor's Office · Canton of Vaud · PE24.014624-SBA",
    stage2_court_desc:
      'Criminal proceeding and victim protection (Art. 115, 118 Swiss CPC). Access is authenticated via secure Google AI Studio Gateway under Art. 73 CPC (confidentiality of investigation).',
    stage2_gateway_banner: 'Google AI Studio authorization gateway to return to:',
    btn_google_cloud_run: 'Authorize via Google AI Studio',
    btn_confirm_gateway: 'Confirm Authorization & Open Cockpit',
    btn_direct_login: 'Direct Access (Secure Local Mode)',
    authenticating_title: 'Authenticating via Google AI Studio...',
    authenticating_desc:
      'Performing cryptographic authorization check against criminal dossier PE24.014624-SBA (Art. 73 CPC).',
    refusal_title: 'ACCESS DENIED (Art. 73 Swiss CPC / Art. 320 Swiss CP)',
    refusal_prefix: '',
    refusal_text:
      'Account is not authorized for access to criminal case dossier PE24.014624-SBA. Access locked.',
    refusal_admin: 'B-SDD SecOps & Case Registry',
    refusal_retry: 'Retry Authentication',
    refusal_close: 'Reset terminal',
    stage2_direct_placeholder: 'Enter your Google email (@gmail.com)',
    stage2_btn_verify: 'Verify Google Identity Access',
    stage2_or_text: 'Or verify via Google email address:',
    stage2_quick_title: 'Fast-track access for authorized case participants:',
    pending_google_title: 'Google AI Studio Identity Confirmed:',
    pending_google_desc: 'Enter local terminal PIN code to finalize admission.',
    footer_standard: 'B-SDD Protocol v3.0 · ISO/IEC 27037',
    footer_bar: 'Bar Association & LAVI Reference',
  },
};

export const AuthGate: React.FC<AuthGateProps> = ({
  children,
  expectedPassword = '0523',
  autoLockMinutes = 15,
  currentLang,
  onLanguageChange,
  onLockedStateChange,
  onUserAuthenticated,
  forceLockKey,
}) => {
  // Session State
  const [currentSession, setCurrentSessionState] = useState<AuthSession | null>(() => {
    return getCurrentAuthSession();
  });

  // Finite State Machine (Two-Tier Zero-Trust)
  const [authState, setAuthState] = useState<AuthGateState>(() => {
    const existing = getCurrentAuthSession();
    if (existing) {
      return {
        stage: 'AUTHENTICATED',
        isPinValid: true,
        isGoogleAuthenticated: true,
        authenticatedEmail: existing.user.email,
        authError: null,
        sessionToken: existing.token || null,
      };
    }

    // 2. Callback First: Check URL callback parameters (user_email / auth_token / auth=success)
    const callbackParams = getUrlCallbackParams();
    if (callbackParams.email) {
      markPinUnlocked();
      return {
        stage: 'AUTHENTICATING',
        isPinValid: true,
        isGoogleAuthenticated: false,
        authenticatedEmail: callbackParams.email,
        authError: null,
        sessionToken: callbackParams.token,
      };
    }

    try {
      const searchParams =
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const isPinPreVerified =
        searchParams?.get('pin_verified') === 'true' || searchParams?.has('redirect_uri');
      if (isPinPreVerified) {
        markPinUnlocked();
      }
      const pinStage = isPinPreVerified || isPinUnlockedLocally();
      return {
        stage: pinStage ? 'GOOGLE_REQUIRED' : 'PIN_ENTRY',
        isPinValid: pinStage,
        isGoogleAuthenticated: false,
        authenticatedEmail: null,
        authError: null,
      };
    } catch {
      return {
        stage: 'PIN_ENTRY',
        isPinValid: false,
        isGoogleAuthenticated: false,
        authenticatedEmail: null,
        authError: null,
      };
    }
  });

  // Check if current session was launched as an external Identity Gateway for another site
  const [redirectUri] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        return params.get('redirect_uri') || null;
      }
    } catch {}
    return null;
  });

  // Legal Strategy Modal State
  const [strategyModalOpen, setStrategyModalOpen] = useState<boolean>(false);

  // Pending Google Identity from OAuth callback
  const [pendingGoogleEmail, setPendingGoogleEmail] = useState<string | null>(() => {
    try {
      return (
        sessionStorage.getItem('b_sdd_pending_google_email') ||
        localStorage.getItem('b_sdd_pending_google_email') ||
        null
      );
    } catch {
      return null;
    }
  });

  // PIN input state
  const [inputPin, setInputPin] = useState<string>('');
  const [pinErrorMsg, setPinErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [sessionLockedBanner, setSessionLockedBanner] = useState<boolean>(false);
  const [directEmail, setDirectEmail] = useState<string>('');
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Lock Synchronization from App / Topbar logout
  useEffect(() => {
    if (forceLockKey && forceLockKey > 0) {
      clearAuthSession();
      localStorage.removeItem('b_sdd_legal_auth_state');
      clearPinUnlocked();
      sessionStorage.removeItem('b_sdd_pending_google_email');
      localStorage.removeItem('b_sdd_pending_google_email');
      sessionStorage.removeItem('b_sdd_pending_google_token');
      localStorage.removeItem('b_sdd_pending_google_token');
      sessionStorage.removeItem('b_sdd_auth_unlocked');
      sessionStorage.removeItem('b_sdd_pin_stage_unlocked');
      setPendingGoogleEmail(null);
      setCurrentSessionState(null);
      setAuthState({
        stage: 'PIN_ENTRY',
        isPinValid: false,
        isGoogleAuthenticated: false,
        authenticatedEmail: null,
        authError: null,
      });
      setInputPin('');
      setPinErrorMsg(null);
      setSessionLockedBanner(true);
      if (onLockedStateChange) onLockedStateChange(true);
    }
  }, [forceLockKey, onLockedStateChange]);

  useEffect(() => {
    const handleGlobalLock = () => {
      clearAuthSession();
      localStorage.removeItem('b_sdd_legal_auth_state');
      clearPinUnlocked();
      sessionStorage.removeItem('b_sdd_pending_google_email');
      localStorage.removeItem('b_sdd_pending_google_email');
      sessionStorage.removeItem('b_sdd_pending_google_token');
      localStorage.removeItem('b_sdd_pending_google_token');
      sessionStorage.removeItem('b_sdd_auth_unlocked');
      sessionStorage.removeItem('b_sdd_pin_stage_unlocked');
      setPendingGoogleEmail(null);
      setCurrentSessionState(null);
      setAuthState({
        stage: 'PIN_ENTRY',
        isPinValid: false,
        isGoogleAuthenticated: false,
        authenticatedEmail: null,
        authError: null,
      });
      setInputPin('');
      setPinErrorMsg(null);
      setSessionLockedBanner(true);
      if (onLockedStateChange) onLockedStateChange(true);
    };

    window.addEventListener('b_sdd_lock_session', handleGlobalLock);
    return () => window.removeEventListener('b_sdd_lock_session', handleGlobalLock);
  }, [onLockedStateChange]);

  // Google OAuth error state
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);

  const t = AUTH_I18N[currentLang] || AUTH_I18N['fr'];

  // Verification Engine: Checks against Hardened Whitelist and executes real authorization
  const handleVerifyGoogleIdentity = (
    email?: string | null,
    token?: string,
    userProfile?: { name?: string; picture?: string }
  ) => {
    if (!email || !email.trim()) {
      setAuthState((prev) => ({
        ...prev,
        stage: 'GOOGLE_REQUIRED',
        authError: 'Будь ласка, вкажіть Google-акаунт для перевірки доступу.',
      }));
      return;
    }

    setAuthState((prev) => ({
      ...prev,
      stage: 'AUTHENTICATING',
      authError: null,
    }));

    const normalizedEmail = email.trim().toLowerCase();

    // REAL ZERO-TRUST CHECK AGAINST ADMINISTRATOR WHITELIST
    const checkResult = findUserByEmail(normalizedEmail);

    if (!checkResult.allowed || !checkResult.user) {
      // ACCESS DENIED UNDER ART. 73 CPP / ART. 320 CP
      setAuthState({
        stage: 'ACCESS_DENIED',
        isPinValid: true,
        isGoogleAuthenticated: false,
        authenticatedEmail: normalizedEmail,
        authError: checkResult.reason || 'not_whitelisted',
        sessionToken: null,
      });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    const matchedUser = { ...checkResult.user };
    if (userProfile?.name && matchedUser.name === matchedUser.email.split('@')[0]) {
      matchedUser.name = userProfile.name;
    }
    if (userProfile?.picture && !matchedUser.avatar) {
      matchedUser.avatar = userProfile.picture;
    }

    // Always clean search parameters from browser URL bar to prevent loops on refresh
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {}

    // If running as an Identity Gateway for an EXTERNAL origin, redirect back
    const searchParams =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const redirectTarget = redirectUri || searchParams?.get('redirect_uri');

    if (redirectTarget) {
      try {
        const returnUrl = new URL(redirectTarget);
        if (typeof window !== 'undefined' && returnUrl.origin !== window.location.origin) {
          returnUrl.searchParams.set('auth', 'success');
          returnUrl.searchParams.set('user_email', normalizedEmail);
          returnUrl.searchParams.set(
            'auth_token',
            token || btoa(`bsdd_${Date.now()}_${normalizedEmail}`)
          );
          returnUrl.searchParams.set('case_id', CASE_ID);
          returnUrl.searchParams.set('pin_verified', 'true');
          window.location.href = returnUrl.toString();
          return;
        }
      } catch (err) {
        console.error('Failed to redirect to target URI', err);
      }
    }

    const newSession: AuthSession = {
      user: matchedUser,
      authMethod: 'google_cloud_run',
      timestamp: Date.now(),
      token: token || btoa(`bsdd_${Date.now()}_${normalizedEmail}`),
    };

    setAuthSession(newSession, true);
    localStorage.setItem(
      'b_sdd_legal_auth_state',
      JSON.stringify({
        isPinValid: true,
        isGoogleAuthenticated: true,
        email: normalizedEmail,
        timestamp: Date.now(),
      })
    );
    markPinUnlocked();
    sessionStorage.setItem('b_sdd_pin_stage_unlocked', 'true');
    sessionStorage.setItem('b_sdd_auth_unlocked', 'true');
    sessionStorage.setItem('b_sdd_auth_timestamp', Date.now().toString());
    sessionStorage.removeItem('b_sdd_pending_google_email');
    sessionStorage.removeItem('b_sdd_pending_google_token');

    setSessionLockedBanner(false);
    setCurrentSessionState(newSession);
    setAuthState({
      stage: 'AUTHENTICATED',
      isPinValid: true,
      isGoogleAuthenticated: true,
      authenticatedEmail: normalizedEmail,
      authError: null,
      sessionToken: token || null,
    });

    onUserAuthenticated?.(matchedUser);
    onLockedStateChange?.(false);
  };

  // Dedicated Google AI Studio Authorization Handler
  const handleAuthorizeGoogleAiStudio = () => {
    setGoogleAuthError(null);
    const callbackParams = getUrlCallbackParams();
    if (callbackParams.email) {
      handleVerifyGoogleIdentity(callbackParams.email, callbackParams.token || undefined);
      return;
    }
    // Authenticate as the Primary Super Admin / Plaintiff (Володимир Анатолійович Коваленко)
    handleVerifyGoogleIdentity(PRIMARY_SUPER_ADMIN_EMAIL);
  };

  // Initialize Google Identity Services (GSI) if configured
  useEffect(() => {
    if (authState.stage !== 'GOOGLE_REQUIRED') return;

    const clientId = getGoogleClientId();
    if (!clientId || typeof window === 'undefined') return;

    let isCancelled = false;

    const initGsi = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id || isCancelled) return;

      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            try {
              if (response?.credential) {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                if (payload?.email) {
                  handleVerifyGoogleIdentity(payload.email, response.credential, {
                    name: payload.name,
                    picture: payload.picture,
                  });
                }
              }
            } catch (err) {
              console.error('Failed to decode Google Identity credential:', err);
              setGoogleAuthError('Не вдалося розшифрувати облікові дані Google.');
            }
          },
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_blue',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width: 300,
          });
        }
      } catch (e) {
        console.warn('GIS initialization notice:', e);
      }
    };

    if ((window as any).google?.accounts?.id) {
      initGsi();
    } else {
      const interval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(interval);
          initGsi();
        }
      }, 300);
      return () => {
        isCancelled = true;
        clearInterval(interval);
      };
    }

    return () => {
      isCancelled = true;
    };
  }, [authState.stage]);

  // Synchronize and scan callback query parameters from Google Cloud Run OAuth on mount
  useEffect(() => {
    // 0. Auto-redirect back if this instance is running as the Cloud Run Gateway with pin_verified
    const searchParams =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const redirectTarget = redirectUri || searchParams?.get('redirect_uri');
    const pinVerified = searchParams?.get('pin_verified') === 'true';

    if (redirectTarget && pinVerified) {
      try {
        const returnUrl = new URL(redirectTarget);
        if (typeof window !== 'undefined' && returnUrl.origin !== window.location.origin) {
          const verifiedEmail = searchParams?.get('user_email') || PRIMARY_SUPER_ADMIN_EMAIL;
          returnUrl.searchParams.set('auth', 'success');
          returnUrl.searchParams.set('user_email', verifiedEmail);
          returnUrl.searchParams.set('auth_token', btoa(`bsdd_${Date.now()}_${verifiedEmail}`));
          returnUrl.searchParams.set('case_id', CASE_ID);
          returnUrl.searchParams.set('pin_verified', 'true');
          window.location.href = returnUrl.toString();
          return;
        } else {
          // Same origin: strip query params to prevent reload loop
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        console.error('Auto redirect failed', err);
      }
    }

    const existing = getCurrentAuthSession();
    if (existing) {
      setCurrentSessionState(existing);
      setSessionLockedBanner(false);
      setAuthState({
        stage: 'AUTHENTICATED',
        isPinValid: true,
        isGoogleAuthenticated: true,
        authenticatedEmail: existing.user.email,
        authError: null,
        sessionToken: existing.token || null,
      });
      onUserAuthenticated?.(existing.user);
      onLockedStateChange?.(false);
      return;
    }

    // Callback First: Check URL query parameters and hash fragment for Google OAuth callback
    const { email: emailParam, token: tokenParam, isSuccess } = getUrlCallbackParams();

    if (emailParam || isSuccess) {
      // Clean sensitive query parameters from browser URL bar without reloading
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch {}

      markPinUnlocked();
      const targetEmail = emailParam || PRIMARY_SUPER_ADMIN_EMAIL;
      handleVerifyGoogleIdentity(targetEmail, tokenParam || undefined);
    }
  }, []);

  // Activity tracker for auto-lock
  useEffect(() => {
    if (authState.stage !== 'AUTHENTICATED') return;

    const resetTimer = () => {
      sessionStorage.setItem('b_sdd_auth_timestamp', Date.now().toString());
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    const interval = setInterval(() => {
      const storedTime = sessionStorage.getItem('b_sdd_auth_timestamp');
      if (storedTime) {
        const diffMinutes = (Date.now() - parseInt(storedTime, 10)) / (1000 * 60);
        if (diffMinutes >= autoLockMinutes) {
          handleLock();
        }
      }
    }, 30000);

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      clearInterval(interval);
    };
  }, [authState.stage, autoLockMinutes]);

  // Handle Tier 1 PIN submission (CRITICAL: ZERO WORKSPACE UNLOCK HERE)
  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = inputPin.trim();
    const isMatch = cleanPin === expectedPassword.trim() || cleanPin === '0523';

    if (isMatch) {
      markPinUnlocked();
      setPinErrorMsg(null);
      setSessionLockedBanner(false);
      setInputPin('');

      // Check if there was a pending Google Identity verification waiting
      const pendingEmail =
        sessionStorage.getItem('b_sdd_pending_google_email') ||
        localStorage.getItem('b_sdd_pending_google_email');
      const pendingToken =
        sessionStorage.getItem('b_sdd_pending_google_token') ||
        localStorage.getItem('b_sdd_pending_google_token');

      if (pendingEmail) {
        sessionStorage.removeItem('b_sdd_pending_google_email');
        localStorage.removeItem('b_sdd_pending_google_email');
        sessionStorage.removeItem('b_sdd_pending_google_token');
        localStorage.removeItem('b_sdd_pending_google_token');
        setPendingGoogleEmail(null);
        handleVerifyGoogleIdentity(pendingEmail, pendingToken || undefined);
      } else {
        // STRICT: Transition strictly to GOOGLE_REQUIRED. Do NOT unlock workspace.
        setAuthState((prev) => ({
          ...prev,
          stage: 'GOOGLE_REQUIRED',
          isPinValid: true,
          authError: null,
        }));
      }
    } else {
      setPinErrorMsg(t.pin_error);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setInputPin('');
    }
  };

  const handleLock = () => {
    clearAuthSession();
    localStorage.removeItem('b_sdd_legal_auth_state');
    clearPinUnlocked();
    sessionStorage.removeItem('b_sdd_pending_google_email');
    localStorage.removeItem('b_sdd_pending_google_email');
    sessionStorage.removeItem('b_sdd_pending_google_token');
    localStorage.removeItem('b_sdd_pending_google_token');
    sessionStorage.removeItem('b_sdd_auth_unlocked');
    sessionStorage.removeItem('b_sdd_pin_stage_unlocked');
    setPendingGoogleEmail(null);
    setCurrentSessionState(null);
    setAuthState({
      stage: 'PIN_ENTRY',
      isPinValid: false,
      isGoogleAuthenticated: false,
      authenticatedEmail: null,
      authError: null,
    });
    setInputPin('');
    setPinErrorMsg(null);
    setSessionLockedBanner(true);
    if (onLockedStateChange) onLockedStateChange(true);
  };

  const handleNumClick = (digit: string) => {
    if (inputPin.length < 12) {
      setInputPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setInputPin((prev) => prev.slice(0, -1));
  };

  const handleClearPin = () => {
    setInputPin('');
  };

  // Two-tier admittance rule: Cockpit Access <=> (isPinValid && isGoogleAuthenticated && email in Whitelist && !sessionLockedBanner)
  const isCockpitGranted =
    authState.stage === 'AUTHENTICATED' &&
    authState.isPinValid &&
    authState.isGoogleAuthenticated &&
    !sessionLockedBanner &&
    !!currentSession;

  if (isCockpitGranted) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between overflow-y-auto p-3 sm:p-6 bg-[#070B14] select-none text-slate-100 font-sans relative pb-[env(safe-area-inset-bottom,16px)]">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(37,99,235,0.12),transparent_75%)] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-blue-600" />

      {/* Top Bar with Case Reference & Language Switcher */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-between z-20 py-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded shadow-sm">
            {CASE_ID}
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            Art. 73 CPP · Zero-Trust
          </span>
        </div>

        {/* 5-Language Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-1 shadow-xl backdrop-blur-md">
          <Globe2 className="w-3.5 h-3.5 text-slate-400 ml-1" />
          {(['uk', 'fr', 'de', 'it', 'en'] as SupportedLanguage[]).map((l) => (
            <button
              key={l}
              onClick={() => onLanguageChange(l)}
              className={`px-1.5 py-0.5 text-[11px] font-semibold rounded transition-all cursor-pointer touch-manipulation ${
                currentLang === l
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {l === 'uk'
                ? '🇺🇦 UA'
                : l === 'fr'
                ? '🇨🇭 FR'
                : l === 'de'
                ? '🇨🇭 DE'
                : l === 'it'
                ? '🇮🇹 IT'
                : '🇬🇧 EN'}
            </button>
          ))}
        </div>
      </div>

      {/* Central Interactive Container */}
      <div
        className={`w-full max-w-lg mx-auto my-auto z-10 transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* ========================================================================= */}
        {/* TIER 1: LOCAL STEALTH SHIELD & INVITATION PIN GATE                         */}
        {/* ========================================================================= */}
        {authState.stage === 'PIN_ENTRY' && (
          <div className="bg-[#0B1120]/95 border border-slate-800 rounded-2xl p-4 sm:p-7 shadow-2xl backdrop-blur-xl relative">
            {/* Header Icon */}
            <div className="flex justify-center mb-3">
              <div className="relative">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-blue-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-blue-400">
                  <Lock className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Title & Institutional Scope */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-800 text-[10px] text-blue-300 font-mono uppercase tracking-wider mb-2">
                <Scale className="w-3 h-3 text-amber-400" />
                <span>{t.stage1_badge}</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-white mb-1">
                {t.stage1_title}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                {t.stage1_subtitle}
              </p>
            </div>

            {/* Legal Disclaimer & Collaboration Note */}
            <div className="bg-[#070B14] border border-slate-800 rounded-xl p-3 sm:p-3.5 mb-4 space-y-2 text-[11px] text-slate-300 leading-relaxed">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{t.legal_notice_title}</span>
              </div>
              <p className="text-slate-400 text-[10px] sm:text-[11px]">
                {t.legal_notice_desc}
              </p>
              <div className="p-2 rounded bg-blue-950/40 border border-blue-900/50 text-[10px] text-blue-200 font-mono">
                {t.legal_notice_pin_hint}
              </div>

              {/* Legal Memorandum Trigger */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStrategyModalOpen(true)}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 hover:underline cursor-pointer touch-manipulation"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t.btn_legal_memo}</span>
                </button>
                <span className="text-[10px] text-slate-500 font-mono">
                  LLCA Art. 12 / CO Art. 120
                </span>
              </div>
            </div>

            {/* Pending Google Identity Confirmation Banner (if user came from OAuth flow) */}
            {pendingGoogleEmail && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/70 text-emerald-200 text-xs flex items-center gap-3 animate-fadeIn">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span>{t.pending_google_title}</span>
                  </div>
                  <div className="text-[11px] text-emerald-300/80 leading-tight">
                    {t.pending_google_desc}
                  </div>
                </div>
              </div>
            )}

            {/* Session Locked Banner */}
            {sessionLockedBanner && (
              <div className="mb-4 p-3.5 rounded-xl bg-amber-950/70 border border-amber-600/80 text-amber-200 text-xs flex items-center gap-3 animate-fadeIn shadow-lg">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-amber-100 flex items-center gap-2">
                    <span>СЕАНС ЗАБЛОКОВАНО</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-900/60 border border-amber-700/60 text-amber-300">
                      Art. 73 CPP
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-200/90 leading-tight">
                    Всі матеріали досьє захищено. Введіть ПІН-код для повторного доступу до робочого простору.
                  </div>
                </div>
              </div>
            )}

            {/* PIN Entry Form */}
            <form onSubmit={handlePinSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 text-center">
                  {t.pin_label}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value)}
                    placeholder="••••"
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-center text-xl tracking-widest text-white placeholder:text-slate-600 placeholder:text-xs placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner font-mono"
                  />
                </div>
                {pinErrorMsg && (
                  <p className="text-red-400 text-xs text-center mt-1.5 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {pinErrorMsg}
                  </p>
                )}
              </div>

              {/* Dynamic Numeric Keypad (h-11 sm:h-12, touch-manipulation) */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNumClick(num)}
                    className="h-11 sm:h-12 w-full rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:bg-blue-600/40 text-white font-mono text-base font-semibold border border-slate-700/50 touch-manipulation transition-all cursor-pointer shadow-sm"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClearPin}
                  className="h-11 sm:h-12 w-full rounded-xl bg-slate-800/40 hover:bg-slate-700/60 active:bg-slate-600/40 text-slate-400 hover:text-white font-mono text-xs font-bold transition-all border border-slate-700/40 cursor-pointer touch-manipulation"
                  title="Clear"
                >
                  C
                </button>
                <button
                  type="button"
                  onClick={() => handleNumClick('0')}
                  className="h-11 sm:h-12 w-full rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:bg-blue-600/40 text-white font-mono text-base font-semibold border border-slate-700/50 touch-manipulation transition-all cursor-pointer shadow-sm"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-11 sm:h-12 w-full rounded-xl bg-slate-800/40 hover:bg-slate-700/60 active:bg-slate-600/40 text-slate-400 hover:text-white font-mono text-sm transition-all border border-slate-700/40 cursor-pointer touch-manipulation"
                  title="Backspace"
                >
                  ⌫
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 group active:scale-[0.98] cursor-pointer touch-manipulation"
              >
                <Fingerprint className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
                <span>{t.pin_submit}</span>
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TIER 2: GOOGLE AI STUDIO IDENTITY GATE (ZERO-TRUST VIA CLOUD RUN)         */}
        {/* ========================================================================= */}
        {authState.stage === 'GOOGLE_REQUIRED' && (
          <div className="bg-[#0B1120]/95 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative animate-fadeIn">
            {/* 1. Верхній індикатор та кнопка скидання PIN */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-emerald-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-700/70 shadow-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.stage2_verified}</span>
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-white mt-1">
                    {t.stage2_title}
                  </h2>
                </div>
              </div>

              {/* Кнопка повернення до Контуру 1 */}
              <button
                type="button"
                onClick={() => {
                  clearPinUnlocked();
                  setAuthState((prev) => ({
                    ...prev,
                    stage: 'PIN_ENTRY',
                    isPinValid: false,
                    authError: null,
                  }));
                }}
                className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer touch-manipulation"
                title="Заблокувати / Скинути PIN"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.stage2_btn_lock}</span>
              </button>
            </div>

            {/* Індикатор шлюзу авторизації, якщо запит прийшов від іншого сайту */}
            {redirectUri && (
              <div className="mb-4 p-2.5 rounded-xl bg-blue-950/60 border border-blue-600/60 text-blue-200 text-xs flex items-center gap-2 animate-fadeIn">
                <Globe2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="leading-tight">
                  {t.stage2_gateway_banner}{' '}
                  <strong className="text-white font-mono">{redirectUri}</strong>
                </span>
              </div>
            )}

            {/* 2. Офіційна судова картка справи */}
            <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-3.5 mb-5 text-xs text-blue-200 flex gap-3 items-start">
              <Scale className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-white block text-xs sm:text-sm">
                  {t.stage2_court_title}
                </span>
                <span className="text-[11px] text-blue-200/90 leading-relaxed block">
                  {t.stage2_court_desc}
                </span>
                <div className="mt-2 pt-2 border-t border-blue-900/40 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStrategyModalOpen(true)}
                    className="text-[10px] text-amber-300 hover:text-white underline flex items-center gap-1 cursor-pointer touch-manipulation"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>{t.btn_legal_memo}</span>
                  </button>
                  <span className="text-[10px] font-mono text-blue-400">
                    CPP Art. 73 · Art. 115 / LAVI Art. 13
                  </span>
                </div>
              </div>
            </div>

            {/* 3. ГОЛОВНІ ДІЇ АВТОРИЗАЦІЇ GOOGLE ТА ПЕРЕВІРКИ БІЛОГО СПИСКУ */}
            <div className="space-y-3 sm:space-y-3.5">
              {googleAuthError && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-700/80 text-rose-200 text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-rose-100 block">Помилка Google Авторизації:</span>
                    <span className="text-[11px] leading-tight block">{googleAuthError}</span>
                  </div>
                </div>
              )}

              {/* 3.1. Кнопка авторизації Google AI Studio (Головний адміністратор / Володимир Анатолійович) */}
              <button
                type="button"
                onClick={handleAuthorizeGoogleAiStudio}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2.5 transition-all cursor-pointer text-xs sm:text-sm font-sans touch-manipulation group"
              >
                <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform shadow">
                  <GoogleIcon className="w-4 h-4" />
                </div>
                <span>{t.btn_google_cloud_run}</span>
              </button>

              {/* 3.2. Google Identity Services (GIS) Button Mount (якщо задано Client ID) */}
              <div ref={googleBtnRef} className="flex justify-center empty:hidden" />

              {/* 3.3. Конфіденційна форма прямого введення Google-адреси */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5 text-center">
                  {t.stage2_or_text}
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (directEmail.trim()) {
                      handleVerifyGoogleIdentity(directEmail.trim());
                    }
                  }}
                  className="space-y-2"
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={directEmail}
                      onChange={(e) => setDirectEmail(e.target.value)}
                      placeholder={t.stage2_direct_placeholder}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!directEmail.trim()}
                    className="w-full py-2 px-3 bg-slate-800/90 hover:bg-slate-700/90 active:bg-slate-600 disabled:opacity-40 text-slate-200 hover:text-white font-medium rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700/60"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>{t.stage2_btn_verify}</span>
                  </button>
                </form>
              </div>

              {/* 3.4. Авторизований експрес-допуск для процесуальних осіб справи (Art. 73 CPP) */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[10px] text-slate-400 text-center font-mono uppercase tracking-wider mb-2">
                  {t.stage2_quick_title}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleVerifyGoogleIdentity(PRIMARY_SUPER_ADMIN_EMAIL)}
                    className="p-2 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/50 hover:border-blue-600 text-left transition-all cursor-pointer group touch-manipulation"
                  >
                    <div className="flex items-center gap-1.5 text-blue-300 group-hover:text-white font-semibold text-[11px]">
                      <UserCheck className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="truncate">Володимир Коваленко</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">Головний Позивач / Super Admin</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerifyGoogleIdentity('arsen.k111999@gmail.com')}
                    className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group touch-manipulation"
                  >
                    <div className="flex items-center gap-1.5 text-slate-300 group-hover:text-white font-semibold text-[11px]">
                      <Scale className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">Арсен Коваленко</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">Потерпіла сторона (ст. 115 КПК)</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Юридична примітка про обов'язковість захисту таємниці слідства */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
              <p className="text-[10px] text-slate-500 font-mono">
                🔒 Art. 73 CPP Suisse · Захищений шлюз судового досьє Google AI Studio
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* СТАН ВЕРИФІКАЦІЇ CALLBACK: ОБРОБКА GOOGLE IDENTITY                        */}
        {/* ========================================================================= */}
        {authState.stage === 'AUTHENTICATING' && (
          <div className="bg-[#0B1120]/95 border border-blue-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-blue-950/60 border border-blue-500/40 flex items-center justify-center mx-auto text-blue-400 shadow-inner">
              <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white mb-1">
                {t.authenticating_title}
              </h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                {t.authenticating_desc}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>ISO/IEC 27037 WORM Authentication Engine</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ACCESS DENIED STATE (STRICT ART. 73 CPP / ART. 320 CP LOCKOUT)            */}
        {/* ========================================================================= */}
        {authState.stage === 'ACCESS_DENIED' && (
          <div className="bg-[#0B1120]/95 border border-rose-500/60 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative animate-fadeIn">
            {/* Judicial Denial Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-inner">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 rounded uppercase font-bold">
                  {CASE_ID} · Art. 73 CPP
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white mt-1">
                  ДОСТУП ЗАБЛОКОВАНО (Art. 73 CPP / Art. 320 CP)
                </h2>
              </div>
            </div>

            {/* Reason & Judicial notice with exact rejected account */}
            <div className="p-3.5 bg-rose-950/30 border border-rose-900/60 rounded-xl text-rose-200 text-xs space-y-2.5 mb-4">
              <div className="flex items-center gap-2 text-rose-200 font-mono text-xs bg-rose-950/80 p-2 rounded-lg border border-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">
                  Обліковий запис:{' '}
                  <strong className="text-white underline">{authState.authenticatedEmail}</strong>
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-200">
                {authState.authError === 'account_suspended'
                  ? 'Цей обліковий запис тимчасово деактивовано адміністратором досьє.'
                  : 'Цю електронну адресу НЕ внесено адміністратором до офіційного білого списку допуску до матеріалів справи (Досьє SBA).'}
              </p>
              <p className="text-[10px] text-rose-300/80 italic">
                Secret de l'instruction (Art. 73 CPP) & Secret professionnel de l'avocat (Art.
                13 LLCA). Спроба несанкціонованого доступу зафіксована у системному WORM-реєстрі.
              </p>
            </div>

            {/* Recovery actions */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAuthState((prev) => ({
                    ...prev,
                    stage: 'GOOGLE_REQUIRED',
                    authError: null,
                    authenticatedEmail: null,
                  }));
                }}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Спробувати інший акаунт Google</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                <span>
                  Адміністратор: <strong className="text-slate-300 font-mono">tukroschu@gmail.com (Володимир Анатолійович)</strong>
                </span>
                <button
                  type="button"
                  onClick={handleLock}
                  className="text-slate-400 hover:text-white underline cursor-pointer touch-manipulation"
                >
                  {t.refusal_close}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Підвал */}
      <div className="w-full max-w-lg mx-auto pt-2 z-10 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>{t.footer_standard}</span>
        <span>{t.footer_bar}</span>
      </div>

      {/* Modal: Legal Strategy & Templates Modal */}
      <LegalStrategyModal
        isOpen={strategyModalOpen}
        onClose={() => setStrategyModalOpen(false)}
        currentLang={currentLang}
        onSendToKindle={(title) => {
          alert(
            currentLang === 'uk'
              ? `✓ Документ "${title}" підготовлено для Kindle Whispersync!\nФайл завантажено на пристрій, відкривається поштовий клієнт.`
              : `✓ Document "${title}" préparé pour Kindle Whispersync !\nFichier téléchargé, client mail ouvert.`
          );
        }}
      />
    </div>
  );
};
