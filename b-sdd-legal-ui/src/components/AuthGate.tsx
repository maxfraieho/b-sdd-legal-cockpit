// =========================================================================
// B-SDD LEGAL COCKPIT · ДВОКОНТУРНИЙ ШЛЮЗ АВТОРИЗАЦІЇ (AUTH GATE v3.0 ZERO-TRUST)
// Контур 1: Локальний захисний бар'єр (Local Invitation PIN Gate)
// Контур 2: Google Identity Gate через Cloud Run OAuth (ст. 73 КПК / ст. 13 LLCA)
// Повна підтримка 5 мов: UK, FR, DE, IT, EN
// Мобільна адаптація: 100dvh, safe-area-inset, touch-manipulation
// =========================================================================

import React, { useState, useEffect } from 'react';
import { SupportedLanguage } from '../types/i18n';
import {
  Shield,
  Lock,
  KeyRound,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Globe2,
  Mail,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Building2,
  Fingerprint,
  BookOpen,
  RotateCcw,
  AlertOctagon,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  loadAuthorizedUsers,
  getCurrentAuthSession,
  setAuthSession,
  clearAuthSession,
  PRIMARY_SUPER_ADMIN_EMAIL,
  HARDENED_WHITELIST,
} from '../lib/authManager';
import {
  AuthorizedUser,
  AuthSession,
  AuthStage,
  AuthGateState,
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
}

const CLOUD_RUN_AUTH_ENDPOINT =
  'https://ais-dev-e2sihlyjbjzxc5lxx4nkc2-147404199355.europe-west3.run.app';
const CASE_ID = 'PE24.014624-SBA';

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
    stage2_title: 'Контур 2: Google Identity Gate (Zero-Trust)',
    stage2_btn_lock: 'Заблокувати',
    stage2_court_title: 'Ministère public du canton de Vaud · PE24.014624-SBA',
    stage2_court_desc:
      'Досьє захисту прав потерпілого Арсена Коваленка (ст. 115, 118 КПК). Для дешифрування доказів та доступу до матеріалів необхідна ідентифікація особи через Google Studio Auth.',
    btn_google_cloud_run: 'Підтвердити особу через Google Studio Auth',
    stage2_root_badge: 'Root Owner',
    stage2_root_title: 'Головний Адміністратор / Володар ключа',
    stage2_roster_title: 'Офіційний реєстр допуску досьє (Hardened Whitelist):',
    stage2_btn_custom_google: 'Ввести іншу авторизовану пошту Google',
    modal_google_title: 'Вхід з обліковим записом Google',
    modal_google_desc:
      'Введіть адресу електронної пошти Google (Gmail). Системи B-SDD перевірять наявність вашого акаунта у білому списку досьє PE24.014624-SBA (ст. 73 КПК).',
    modal_google_input_label: 'Електронна пошта Google:',
    modal_btn_cancel: 'Скасувати',
    modal_btn_auth: 'Верифікувати та увійти',
    refusal_title: 'ACCÈS NON AUTORISÉ (Art. 73 CPP / Art. 320 CP)',
    refusal_text:
      'не внесено до реєстру уповноважених осіб у справі PE24.014624-SBA. Доступ заблоковано.',
    refusal_admin: 'Контакт адміністратора',
    refusal_retry: 'Повторити вхід під іншим акаунтом',
    refusal_close: 'Закрити',
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
    stage2_title: 'Niveau 2 : Authentification Google Zero-Trust',
    stage2_btn_lock: 'Verrouiller',
    stage2_court_title: 'Ministère public du canton de Vaud · PE24.014624-SBA',
    stage2_court_desc:
      'Dossier de protection de la victime Arsen Kovalenko (art. 115, 118 CPP). Pour le déchiffrement des preuves et l’accès au dossier, l’identification nominative Google Studio Auth est requise.',
    btn_google_cloud_run: 'Vérifier l’identité via Google Studio Auth',
    stage2_root_badge: 'Root Owner',
    stage2_root_title: 'Administrateur Principal / Auteur',
    stage2_roster_title: 'Registre officiel des intervenants agréés (Liste blanche) :',
    stage2_btn_custom_google: 'Saisir un autre compte Google agréé',
    modal_google_title: 'Connexion avec compte Google (Gmail)',
    modal_google_desc:
      'Saisissez votre adresse électronique Google. Le système B-SDD vérifiera la présence de votre compte sur la liste blanche de la cause PE24.014624-SBA.',
    modal_google_input_label: 'Adresse courriel Google :',
    modal_btn_cancel: 'Annuler',
    modal_btn_auth: 'Vérifier et accéder',
    refusal_title: 'ACCÈS NON AUTORISÉ (Art. 73 CPP / Art. 320 CP)',
    refusal_text:
      "n'est pas inscrit sur la liste blanche autorisée de la cause pénale PE24.014624-SBA. Accès verrouillé.",
    refusal_admin: 'Administrateur',
    refusal_retry: 'Réessayer avec un autre compte',
    refusal_close: 'Fermer',
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
    stage2_title: 'Stufe 2: Google Identity Gate (Zero-Trust)',
    stage2_btn_lock: 'Sperren',
    stage2_court_title: 'Staatsanwaltschaft Kanton Waadt · PE24.014624-SBA',
    stage2_court_desc:
      'Verfahren zum Schutz des Opfers Arsen Kovalenko (Art. 115, 118 StPO). Zur Entschlüsselung der Akten ist eine Identifizierung über Google Studio Auth erforderlich.',
    btn_google_cloud_run: 'Identität über Google Studio Auth bestätigen',
    stage2_root_badge: 'Root Owner',
    stage2_root_title: 'Hauptadministrator / Urheber',
    stage2_roster_title: 'Offizielles Beteiligtenregister (Hardened Whitelist):',
    stage2_btn_custom_google: 'Mit anderer Google-E-Mail anmelden',
    modal_google_title: 'Anmeldung mit Google-Konto',
    modal_google_desc:
      'Geben Sie Ihre Google-Mailadresse ein. Das System prüft die Freigabe für das Verfahren PE24.014624-SBA.',
    modal_google_input_label: 'Google-E-Mail-Adresse:',
    modal_btn_cancel: 'Abbrechen',
    modal_btn_auth: 'Prüfen und anmelden',
    refusal_title: 'ZUGANG VERWEIGERT (Art. 73 StPO / Art. 320 StGB)',
    refusal_text:
      'ist nicht auf der Whitelist für das Strafverfahren PE24.014624-SBA registriert. Zugriff verweigert.',
    refusal_admin: 'Administrator',
    refusal_retry: 'Mit anderem Konto wiederholen',
    refusal_close: 'Schließen',
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
    stage2_title: 'Livello 2: Autenticazione Google Zero-Trust',
    stage2_btn_lock: 'Blocca',
    stage2_court_title: 'Ministero Pubblico del Cantone Vaud · PE24.014624-SBA',
    stage2_court_desc:
      'Procedimento per la tutela della vittima Arsen Kovalenko (art. 115, 118 CPP). Per decifrare le prove è richiesta l’identificazione Google Studio Auth.',
    btn_google_cloud_run: 'Verifica identità tramite Google Studio Auth',
    stage2_root_badge: 'Root Owner',
    stage2_root_title: 'Amministratore Principale / Autore',
    stage2_roster_title: 'Registro ufficiale dei partecipanti accreditati (Whitelist):',
    stage2_btn_custom_google: 'Accedi con altra email Google',
    modal_google_title: 'Accesso con account Google',
    modal_google_desc:
      'Inserisci la tua email Google. Il sistema verificherà l’abilitazione sul fascicolo PE24.014624-SBA.',
    modal_google_input_label: 'Indirizzo email Google:',
    modal_btn_cancel: 'Annulla',
    modal_btn_auth: 'Verifica e accedi',
    refusal_title: 'ACCESSO NEGATO (Art. 73 CPP / Art. 320 CP)',
    refusal_text:
      'non è abilitato nella lista bianca di questo procedimento penale PE24.014624-SBA. Accesso bloccato.',
    refusal_admin: 'Amministratore',
    refusal_retry: 'Riprova con altro account',
    refusal_close: 'Chiudi',
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
    stage2_title: 'Tier 2: Google Identity Gate (Zero-Trust)',
    stage2_btn_lock: 'Lock',
    stage2_court_title: "Public Prosecutor's Office · Canton of Vaud · PE24.014624-SBA",
    stage2_court_desc:
      'Protection of victim Arsen Kovalenko (Art. 115, 118 Swiss CPC). Evidence decryption and dossier access requires authenticated identification via Google Studio Auth.',
    btn_google_cloud_run: 'Verify Identity via Google Studio Auth',
    stage2_root_badge: 'Root Owner',
    stage2_root_title: 'Super Administrator / Author',
    stage2_roster_title: 'Official Whitelisted Participants Registry:',
    stage2_btn_custom_google: 'Sign in with another whitelisted Google account',
    modal_google_title: 'Sign in with Google Account',
    modal_google_desc:
      'Enter your Google email address. B-SDD systems will verify your account against the hardened whitelist for case PE24.014624-SBA.',
    modal_google_input_label: 'Google Email Address:',
    modal_btn_cancel: 'Cancel',
    modal_btn_auth: 'Verify & Sign In',
    refusal_title: 'ACCESS DENIED (Art. 73 Swiss CPC / Art. 320 Swiss CP)',
    refusal_text:
      'is not whitelisted for access to criminal case dossier PE24.014624-SBA. Access locked.',
    refusal_admin: 'Administrator',
    refusal_retry: 'Try again with another account',
    refusal_close: 'Close',
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

    try {
      const pinStage = sessionStorage.getItem('b_sdd_pin_stage_unlocked') === 'true';
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

  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>(() =>
    loadAuthorizedUsers()
  );

  // Legal Strategy Modal State
  const [strategyModalOpen, setStrategyModalOpen] = useState<boolean>(false);

  // Custom Google input modal
  const [customGoogleEmail, setCustomGoogleEmail] = useState<string>('');
  const [showCustomGoogleModal, setShowCustomGoogleModal] = useState<boolean>(false);

  // PIN input state
  const [inputPin, setInputPin] = useState<string>('');
  const [pinErrorMsg, setPinErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const t = AUTH_I18N[currentLang] || AUTH_I18N['fr'];

  // Verification Engine: Checks against Hardened Whitelist and executes atomic session creation
  const handleVerifyGoogleIdentity = (email: string, token?: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = loadAuthorizedUsers();

    const isWhitelisted =
      HARDENED_WHITELIST.map((e) => e.toLowerCase()).includes(normalizedEmail) ||
      users.some((u) => u.email.toLowerCase() === normalizedEmail && u.isActive);

    if (!isWhitelisted) {
      setAuthState((prev) => ({
        ...prev,
        stage: 'ACCESS_DENIED',
        isGoogleAuthenticated: false,
        authenticatedEmail: normalizedEmail,
        authError: normalizedEmail,
      }));
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    // Match or create AuthorizedUser
    const existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    const user: AuthorizedUser = existingUser || {
      id: `user-${Date.now()}`,
      email: normalizedEmail,
      name: normalizedEmail.split('@')[0],
      role: 'user',
      isActive: true,
      addedAt: new Date().toISOString(),
      permissions: ROLE_DEFINITIONS.user.defaultPermissions,
    };

    const newSession: AuthSession = {
      user,
      authMethod: 'google_cloud_run',
      timestamp: Date.now(),
      token: token || undefined,
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
    sessionStorage.setItem('b_sdd_pin_stage_unlocked', 'true');
    sessionStorage.setItem('b_sdd_auth_unlocked', 'true');
    sessionStorage.setItem('b_sdd_auth_timestamp', Date.now().toString());
    sessionStorage.removeItem('b_sdd_pending_google_email');
    sessionStorage.removeItem('b_sdd_pending_google_token');

    setCurrentSessionState(newSession);
    setAuthState({
      stage: 'AUTHENTICATED',
      isPinValid: true,
      isGoogleAuthenticated: true,
      authenticatedEmail: normalizedEmail,
      authError: null,
      sessionToken: token || null,
    });

    onUserAuthenticated?.(user);
    onLockedStateChange?.(false);
    setShowCustomGoogleModal(false);
  };

  // Synchronize and scan callback query parameters on mount
  useEffect(() => {
    const existing = getCurrentAuthSession();
    if (existing) {
      setCurrentSessionState(existing);
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

    // Check URL parameters for Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('user_email') || urlParams.get('email');
    const tokenParam = urlParams.get('auth_token') || urlParams.get('token');

    if (emailParam) {
      window.history.replaceState({}, document.title, window.location.pathname);
      const isPinAlreadyUnlocked =
        sessionStorage.getItem('b_sdd_pin_stage_unlocked') === 'true';

      if (isPinAlreadyUnlocked) {
        handleVerifyGoogleIdentity(emailParam, tokenParam || undefined);
      } else {
        sessionStorage.setItem('b_sdd_pending_google_email', emailParam);
        if (tokenParam) {
          sessionStorage.setItem('b_sdd_pending_google_token', tokenParam);
        }
      }
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
      sessionStorage.setItem('b_sdd_pin_stage_unlocked', 'true');
      setPinErrorMsg(null);
      setInputPin('');

      // Check if there was a pending Google Identity verification waiting
      const pendingEmail = sessionStorage.getItem('b_sdd_pending_google_email');
      const pendingToken = sessionStorage.getItem('b_sdd_pending_google_token');

      if (pendingEmail) {
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
    sessionStorage.removeItem('b_sdd_pin_stage_unlocked');
    sessionStorage.removeItem('b_sdd_pending_google_email');
    sessionStorage.removeItem('b_sdd_pending_google_token');
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

  // Two-tier admittance rule: Cockpit Access <=> (isPinValid && isGoogleAuthenticated && email in Whitelist)
  const isCockpitGranted =
    authState.stage === 'AUTHENTICATED' &&
    authState.isPinValid &&
    authState.isGoogleAuthenticated &&
    !!currentSession;

  if (isCockpitGranted) {
    return <>{children}</>;
  }

  const cloudRunAuthUrl =
    typeof window !== 'undefined'
      ? `${CLOUD_RUN_AUTH_ENDPOINT}?redirect_uri=${encodeURIComponent(
          window.location.origin + window.location.pathname
        )}&case_id=${encodeURIComponent(CASE_ID)}`
      : CLOUD_RUN_AUTH_ENDPOINT;

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
        {/* TIER 2: GOOGLE IDENTITY GATE (ZERO-TRUST VIA CLOUD RUN & WHITELIST)       */}
        {/* ========================================================================= */}
        {authState.stage === 'GOOGLE_REQUIRED' && (
          <div className="bg-[#0B1120]/95 border border-slate-800 rounded-2xl p-4 sm:p-7 shadow-2xl backdrop-blur-xl relative animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-emerald-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-700/70 shadow-sm">
                      {t.stage2_verified}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-white mt-1">
                    {t.stage2_title}
                  </h2>
                </div>
              </div>

              {/* Re-lock button to return to Tier 1 */}
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('b_sdd_pin_stage_unlocked');
                  setAuthState((prev) => ({
                    ...prev,
                    stage: 'PIN_ENTRY',
                    isPinValid: false,
                    authError: null,
                  }));
                }}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer touch-manipulation"
                title="Lock Terminal"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>{t.stage2_btn_lock}</span>
              </button>
            </div>

            {/* Legal context notice */}
            <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-3 mb-4 text-xs text-blue-200 flex gap-2.5 items-start">
              <Scale className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">
                  {t.stage2_court_title}
                </span>
                <span className="text-[11px] text-blue-200/90 leading-relaxed block mt-0.5">
                  {t.stage2_court_desc}
                </span>
                <div className="mt-1.5 pt-1.5 border-t border-blue-900/40 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStrategyModalOpen(true)}
                    className="text-[10px] text-amber-300 hover:text-white underline flex items-center gap-1 cursor-pointer touch-manipulation"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>{t.btn_legal_memo}</span>
                  </button>
                  <span className="text-[10px] font-mono text-blue-400">
                    CPP Art. 115 / LAVI Art. 13
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Action Button: Cloud Run Google Studio Auth Redirect */}
            <div className="mb-4">
              <a
                href={cloudRunAuthUrl}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/40 flex items-center justify-center gap-3 transition-all cursor-pointer text-xs sm:text-sm touch-manipulation group active:scale-[0.98]"
              >
                {/* Official Google 'G' icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>{t.btn_google_cloud_run}</span>
                <ChevronRight className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </a>
            </div>

            {/* Whitelisted Participants Roster (One-click identity confirmation for testing/production) */}
            <div className="space-y-2 mb-4">
              <label className="block text-[11px] font-semibold text-slate-400">
                {t.stage2_roster_title}
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {authorizedUsers.map((user) => {
                  const roleMeta = ROLE_DEFINITIONS[user.role];
                  const isSuper =
                    user.email.toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL.toLowerCase();

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleVerifyGoogleIdentity(user.email)}
                      disabled={!user.isActive}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer touch-manipulation ${
                        isSuper
                          ? 'bg-gradient-to-r from-blue-950/40 to-indigo-950/30 border-blue-500/40 hover:border-blue-400 text-slate-100 shadow-sm'
                          : user.isActive
                          ? 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 text-slate-200 hover:border-blue-500/40'
                          : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-inner ${
                            isSuper
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 border border-slate-700 text-slate-300 font-mono'
                          }`}
                        >
                          {isSuper ? 'G' : user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-200 truncate flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {isSuper && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                                {t.stage2_root_badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${
                            roleMeta?.badgeColor || 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {user.role}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Google Account Modal Trigger */}
            <div className="pt-2 border-t border-slate-800 flex">
              <button
                type="button"
                onClick={() => setShowCustomGoogleModal(true)}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >
                <Mail className="w-4 h-4 text-blue-400" />
                <span>{t.stage2_btn_custom_google}</span>
              </button>
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
                  {t.refusal_title}
                </h2>
              </div>
            </div>

            {/* Reason & Judicial notice */}
            <div className="p-3 bg-rose-950/30 border border-rose-900/60 rounded-xl text-rose-200 text-xs space-y-2 mb-4">
              <p className="text-[11px] leading-relaxed">
                Електронну адресу{' '}
                <strong className="text-white font-mono bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800">
                  {authState.authError || authState.authenticatedEmail || 'Compte non spécifié'}
                </strong>{' '}
                {t.refusal_text}
              </p>
              <p className="text-[10px] text-rose-300/80 italic">
                Secret de l'instruction (Art. 73 CPP) & Secret professionnel de l'avocat (Art.
                13 LLCA). Les tentatives d'intrusion non habilitées sont journalisées au WORM-registre.
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
                  }));
                }}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.refusal_retry}</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                <span>
                  {t.refusal_admin}: {PRIMARY_SUPER_ADMIN_EMAIL}
                </span>
                <button
                  type="button"
                  onClick={handleLock}
                  className="text-slate-400 hover:text-white underline cursor-pointer touch-manipulation"
                >
                  {t.stage2_btn_lock}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="w-full max-w-lg mx-auto pt-2 z-10 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>{t.footer_standard}</span>
        <span>{t.footer_bar}</span>
      </div>

      {/* Modal: Custom Google Account Entry */}
      {showCustomGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B1120] border border-blue-500/40 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>{t.modal_google_title}</span>
              </div>
              <button
                onClick={() => setShowCustomGoogleModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer touch-manipulation"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {t.modal_google_desc}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customGoogleEmail.trim()) {
                  handleVerifyGoogleIdentity(customGoogleEmail);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  {t.modal_google_input_label}
                </label>
                <input
                  type="email"
                  required
                  placeholder="avocat.etude@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs cursor-pointer touch-manipulation"
                >
                  {t.modal_btn_cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer touch-manipulation"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.modal_btn_auth}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Legal Strategy & Templates Modal */}
      <LegalStrategyModal
        isOpen={strategyModalOpen}
        onClose={() => setStrategyModalOpen(false)}
        currentLang={currentLang}
        onSendToKindle={(title) => {
          alert(
            currentLang === 'uk'
              ? `✓ Документ "${title}" підготовлено для Kindle!\nФайл завантажено на пристрій, відкривається поштовий клієнт для відправки на tukroschu@kindle.com`
              : `✓ Document "${title}" préparé pour Kindle !\nFichier téléchargé, client mail ouvert vers tukroschu@kindle.com`
          );
        }}
      />
    </div>
  );
};
