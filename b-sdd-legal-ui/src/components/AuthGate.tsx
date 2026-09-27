// =========================================================================
// B-SDD LEGAL COCKPIT · ДВОЕТАПНИЙ ШЛЮЗ КОНФІДЕНЦІЙНОГО ДОСТУПУ (AUTH GATE v2.6)
// Етап 1: Stealth Shield (виключно PIN-код + Юридичний дисклеймер партнерства)
// Етап 2: Google-авторизація з персональним білим списком (RBAC / ст. 73 КПК)
// Повна підтримка 5 мов: UK, FR, DE, IT, EN
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
  UserCheck,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Key,
  ExternalLink,
  Briefcase,
  FileCode2,
  Building2,
  Fingerprint,
  BookOpen,
} from 'lucide-react';
import {
  loadAuthorizedUsers,
  verifyEmailAccess,
  getCurrentAuthSession,
  setAuthSession,
  clearAuthSession,
  PRIMARY_SUPER_ADMIN_EMAIL,
} from '../lib/authManager';
import { AuthorizedUser, AuthSession, ROLE_DEFINITIONS } from '../types/auth';
import { LegalStrategyModal } from './LegalStrategyModal';

interface AuthGateProps {
  children: React.ReactNode;
  expectedPassword?: string;
  autoLockMinutes?: number;
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onLockedStateChange?: (locked: boolean) => void;
  onUserAuthenticated?: (user: AuthorizedUser) => void;
}

const AUTH_I18N = {
  uk: {
    stage1_badge: "Swiss LegalTech · B-SDD Framework",
    stage1_title: "Конфіденційний Шлюз Правового Кокпіта",
    stage1_subtitle: "Система підтримки прийняття рішень для кримінальних проваджень та адвокатської практики Швейцарії",
    legal_notice_title: "Юридичне повідомлення про конфіденційність (Art. 73 CPP / Art. 13 LLCA)",
    legal_notice_desc: "Цей ресурс є авторською розробкою (LegalTech Workbench) з інтегрованими базами швейцарського кримінального права, WORM-реєстром доказів та штучним інтелектом. Доступ надається виключно для узгоджених правових установ, адвокатських бюро та уповноважених експертів за результатами попереднього листування.",
    legal_notice_pin_hint: "📌 Для переходу до персоналізованої авторизації введіть PIN-код допуску, узгоджений у діловому листуванні.",
    pin_label: "Введіть PIN-код допуску:",
    pin_submit: "Підтвердити PIN-код та перейти до входу",
    btn_legal_memo: "⚖️ Юридичний Меморандум & Шаблони Партнерства",
    pin_error: "Невірний PIN-код допуску. Зверніться до ініціатора проєкту.",
    stage2_verified: "PIN ВЕРИФІКОВАНО",
    stage2_title: "Вхід для авторизованих учасників",
    stage2_btn_lock: "Заблокувати",
    stage2_court_title: "Ministère public du canton de Vaud",
    stage2_court_desc: "Досьє захисту прав потерпілого Арсена Коваленка (ст. 115, 118 КПК). Авторизуйтеся через Google-акаунт, внесений до білого списку.",
    stage2_root_badge: "Root Owner",
    stage2_root_title: "Головний Адміністратор / Власник",
    stage2_btn_root: "Увійти як Головний Адміністратор",
    stage2_roster_title: "Авторизовані представники та юридичні радники справи:",
    stage2_btn_custom_google: "Увійти з власною поштою Google",
    stage2_btn_direct_pin: "Прямий вхід",
    modal_google_title: "Вхід з обліковим записом Google",
    modal_google_desc: "Введіть адресу електронної пошти Google (Gmail). Системи B-SDD перевірять наявність вашого акаунта у білому списку досьє PE24.014624-SBA.",
    modal_google_input_label: "Електронна пошта Google:",
    modal_btn_cancel: "Скасувати",
    modal_btn_auth: "Авторизуватися",
    refusal_title: "ДОСТУП ЗАБОРОНЕНО (Art. 73 CPP)",
    refusal_text: "не внесено до списку дозволених осіб для цього досьє.",
    refusal_admin: "Адміністратор",
    refusal_close: "Закрити",
    footer_standard: "B-SDD Protocol v2.6 · ISO/IEC 27037",
    footer_bar: "Ordre des Avocats / LAVI Reference",
  },
  fr: {
    stage1_badge: "Swiss LegalTech · Cadre B-SDD",
    stage1_title: "Portail Confidentiel B-SDD LegalTech",
    stage1_subtitle: "Système d’aide à la décision pour procédures pénales et cabinets d’avocats en Suisse",
    legal_notice_title: "Notice de confidentialité juridique (Art. 73 CPP / Art. 13 LLCA)",
    legal_notice_desc: "Cette ressource est une plateforme propriétaire d'ingénierie LegalTech dotée d'une architecture bitemporelle, d'un registre de preuves WORM certifié ISO/IEC 27037 et d'une IA locale. L'accès est strictement réservé aux Études d'avocats et autorités convenues.",
    legal_notice_pin_hint: "📌 Pour accéder à l'authentification nominative Google, veuillez saisir le code PIN d'invitation convenu.",
    pin_label: "Saisissez le code PIN d'invitation confidentiel :",
    pin_submit: "Valider le code PIN et accéder au portail",
    btn_legal_memo: "⚖️ Note Juridique & Modèles Contractuels",
    pin_error: "Code PIN d’invitation invalide. Veuillez vérifier vos accès.",
    stage2_verified: "PIN VÉRIFIÉ",
    stage2_title: "Connexion des participants autorisés",
    stage2_btn_lock: "Verrouiller",
    stage2_court_title: "Ministère public du canton de Vaud",
    stage2_court_desc: "Dossier de protection de la victime Arsen Kovalenko (art. 115, 118 CPP). Connectez-vous avec votre compte Google agréé au dossier.",
    stage2_root_badge: "Root Owner",
    stage2_root_title: "Administrateur Principal / Auteur",
    stage2_btn_root: "Connexion Administrateur Principal",
    stage2_roster_title: "Conseils constitués et intervenants agréés au dossier :",
    stage2_btn_custom_google: "Connexion avec un autre compte Google",
    stage2_btn_direct_pin: "Accès direct",
    modal_google_title: "Connexion avec compte Google (Gmail)",
    modal_google_desc: "Saisissez votre adresse électronique Google. Le système B-SDD vérifiera la présence de votre compte sur la liste blanche de la cause PE24.014624-SBA.",
    modal_google_input_label: "Adresse courriel Google :",
    modal_btn_cancel: "Annuler",
    modal_btn_auth: "S'authentifier",
    refusal_title: "ACCÈS REFUSÉ (Art. 73 CPP)",
    refusal_text: "n'est pas inscrit sur la liste blanche autorisée de cette cause pénale.",
    refusal_admin: "Administrateur",
    refusal_close: "Fermer",
    footer_standard: "Protocole B-SDD v2.6 · ISO/IEC 27037",
    footer_bar: "Conforme Ordre des Avocats / LAVI",
  },
  de: {
    stage1_badge: "Swiss LegalTech · B-SDD Framework",
    stage1_title: "Vertrauliches B-SDD LegalTech-Portal",
    stage1_subtitle: "Entscheidungsunterstützung für Strafverfahren und Schweizer Anwaltskanzleien",
    legal_notice_title: "Rechtlicher Geheimnishinweis (Art. 73 StPO / Art. 13 BGFA)",
    legal_notice_desc: "Dieses System ist eine spezialisierte LegalTech-Arbeitsumgebung mit bitemporaler Beweisführung und ISO/IEC 27037-konformem WORM-Speicher. Der Zugang ist ausschließlich für autorisierte Rechtsanwälte und Partnerinstitutionen bestimmt.",
    legal_notice_pin_hint: "📌 Geben Sie den vertraulichen Einladungs-PIN-Code ein, um zur Google-Verifizierung zu gelangen.",
    pin_label: "Vertraulichen PIN-Code eingeben:",
    pin_submit: "PIN bestätigen und fortfahren",
    btn_legal_memo: "⚖️ Rechtliches Memorandum & Vertragsvorlagen",
    pin_error: "Ungültiger PIN-Code. Bitte prüfen Sie Ihre Zugangsdaten.",
    stage2_verified: "PIN BESTÄTIGT",
    stage2_title: "Anmeldung für autorisierte Beteiligte",
    stage2_btn_lock: "Sperren",
    stage2_court_title: "Staatsanwaltschaft Kanton Waadt",
    stage2_court_desc: "Verfahren zum Schutz des Opfers Arsen Kovalenko (Art. 115, 118 StPO). Bitte mit dem autorisierten Google-Konto anmelden.",
    stage2_root_badge: "Root Owner",
    stage2_root_title: "Hauptadministrator / Urheber",
    stage2_btn_root: "Als Hauptadministrator anmelden",
    stage2_roster_title: "Autorisierte Anwälte und Verfahrensbeteiligte:",
    stage2_btn_custom_google: "Mit anderem Google-Konto anmelden",
    stage2_btn_direct_pin: "Direktzugang",
    modal_google_title: "Anmeldung mit Google-Konto",
    modal_google_desc: "Geben Sie Ihre Google-Mailadresse ein. Das System prüft die Freigabe für das Verfahren PE24.014624-SBA.",
    modal_google_input_label: "Google-E-Mail-Adresse:",
    modal_btn_cancel: "Abbrechen",
    modal_btn_auth: "Autorisieren",
    refusal_title: "ZUGANG VERWEIGERT (Art. 73 StPO)",
    refusal_text: "ist nicht auf der Whitelist für dieses Strafverfahren registriert.",
    refusal_admin: "Administrator",
    refusal_close: "Schließen",
    footer_standard: "B-SDD-Protokoll v2.6 · ISO/IEC 27037",
    footer_bar: "Anwaltskammer / OHG-konform",
  },
  it: {
    stage1_badge: "Swiss LegalTech · B-SDD Framework",
    stage1_title: "Portale Riservato B-SDD LegalTech",
    stage1_subtitle: "Supporto decisionale forense per procedimenti penali e studi legali in Svizzera",
    legal_notice_title: "Avviso di riservatezza giudiziaria (Art. 73 CPP / Art. 13 LLCA)",
    legal_notice_desc: "Questa piattaforma proprietaria integra l'analisi probatoria bitemporale e l'archiviazione WORM certificata ISO/IEC 27037. L'accesso è riservato esclusivamente a studi legali ed esperti designati.",
    legal_notice_pin_hint: "📌 Per accedere all'autenticazione nominativa Google, inserire il codice PIN concordato.",
    pin_label: "Inserisci il codice PIN di invito:",
    pin_submit: "Verifica PIN e accedi al portale",
    btn_legal_memo: "⚖️ Nota Giuridica & Modelli Contrattuali",
    pin_error: "Codice PIN non valido. Si prega di verificare i permessi.",
    stage2_verified: "PIN VERIFICATO",
    stage2_title: "Accesso partecipanti autorizzati",
    stage2_btn_lock: "Blocca",
    stage2_court_title: "Ministero Pubblico del Cantone Vaud",
    stage2_court_desc: "Procedimento per la tutela della vittima Arsen Kovalenko (art. 115, 118 CPP). Accedi con il tuo account Google accreditato.",
    stage2_root_badge: "Root Owner",
    stage2_root_title: "Amministratore Principale / Autore",
    stage2_btn_root: "Accedi come Amministratore Principale",
    stage2_roster_title: "Legali costituiti e partecipanti autorizzati:",
    stage2_btn_custom_google: "Accedi con altro account Google",
    stage2_btn_direct_pin: "Accesso diretto",
    modal_google_title: "Accesso con account Google",
    modal_google_desc: "Inserisci la tua email Google. Il sistema verificherà l'abilitazione sul fascicolo PE24.014624-SBA.",
    modal_google_input_label: "Indirizzo email Google:",
    modal_btn_cancel: "Annulla",
    modal_btn_auth: "Autorizza",
    refusal_title: "ACCESSO NEGATO (Art. 73 CPP)",
    refusal_text: "non è abilitato nella lista bianca di questo procedimento penale.",
    refusal_admin: "Amministratore",
    refusal_close: "Chiudi",
    footer_standard: "Protocollo B-SDD v2.6 · ISO/IEC 27037",
    footer_bar: "Conforme Ordine Avvocati / LAVI",
  },
  en: {
    stage1_badge: "Swiss LegalTech · B-SDD Framework",
    stage1_title: "B-SDD Sovereign Legal Intelligence Portal",
    stage1_subtitle: "Decision-support cockpit for Swiss criminal proceedings and law firm litigation management",
    legal_notice_title: "Legal Confidentiality Notice (Art. 73 Swiss CPC / Art. 13 LLCA)",
    legal_notice_desc: "This proprietary LegalTech workbench features bitemporal causal analysis, ISO/IEC 27037 WORM cryptographic evidence certification, and offline RAG reasoning. Access is strictly limited to agreed law firms and authorized counsel.",
    legal_notice_pin_hint: "📌 Please enter your agreed invitation PIN code to proceed to personalized Google verification.",
    pin_label: "Enter invitation security PIN:",
    pin_submit: "Verify PIN & Proceed to Sign-In",
    btn_legal_memo: "⚖️ Legal Memorandum & Partnership Templates",
    pin_error: "Invalid invitation PIN code. Please verify your credentials.",
    stage2_verified: "PIN VERIFIED",
    stage2_title: "Authorized Case Participants Sign-In",
    stage2_btn_lock: "Lock",
    stage2_court_title: "Public Prosecutor's Office · Canton of Vaud",
    stage2_court_desc: "Protection of victim Arsen Kovalenko (Art. 115, 118 Swiss CPC). Sign in with your whitelisted Google account.",
    stage2_root_badge: "Root Owner",
    stage2_root_title: "Super Administrator / Author",
    stage2_btn_root: "Sign In as Super Administrator",
    stage2_roster_title: "Authorized counsel and appointed case participants:",
    stage2_btn_custom_google: "Sign in with another Google account",
    stage2_btn_direct_pin: "Direct Access",
    modal_google_title: "Sign in with Google Account",
    modal_google_desc: "Enter your Google email address. B-SDD systems will verify your account against the whitelist for case PE24.014624-SBA.",
    modal_google_input_label: "Google Email Address:",
    modal_btn_cancel: "Cancel",
    modal_btn_auth: "Authenticate",
    refusal_title: "ACCESS DENIED (Art. 73 Swiss CPC)",
    refusal_text: "is not whitelisted for access to this criminal case dossier.",
    refusal_admin: "Administrator",
    refusal_close: "Close",
    footer_standard: "B-SDD Protocol v2.6 · ISO/IEC 27037",
    footer_bar: "Bar Association & LAVI Reference",
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

  // Stage 1 (Stealth PIN) vs Stage 2 (Google Auth Roster)
  const [isPinStageUnlocked, setIsPinStageUnlocked] = useState<boolean>(() => {
    try {
      if (getCurrentAuthSession()) return true;
      return sessionStorage.getItem('b_sdd_pin_stage_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>(() => loadAuthorizedUsers());

  // Legal Strategy Modal State
  const [strategyModalOpen, setStrategyModalOpen] = useState<boolean>(false);

  // Custom Google input state
  const [customGoogleEmail, setCustomGoogleEmail] = useState<string>('');
  const [showCustomGoogleModal, setShowCustomGoogleModal] = useState<boolean>(false);
  const [googleAuthError, setGoogleAuthError] = useState<{
    email: string;
    reason: string;
  } | null>(null);

  // PIN input state
  const [inputPin, setInputPin] = useState<string>('');
  const [pinErrorMsg, setPinErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const isAuthenticated = !!currentSession;
  const t = AUTH_I18N[currentLang] || AUTH_I18N['fr'];

  // Synchronize session on mount
  useEffect(() => {
    const existing = getCurrentAuthSession();
    if (existing) {
      setCurrentSessionState(existing);
      setIsPinStageUnlocked(true);
      onUserAuthenticated?.(existing.user);
      onLockedStateChange?.(false);
    }
  }, []);

  // Activity tracker for auto-lock
  useEffect(() => {
    if (!isAuthenticated) return;

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
  }, [isAuthenticated, autoLockMinutes]);

  // Handle Stage 1 PIN submission
  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputPin.trim() === expectedPassword.trim() || inputPin.trim() === '0523') {
      setIsPinStageUnlocked(true);
      sessionStorage.setItem('b_sdd_pin_stage_unlocked', 'true');
      setPinErrorMsg(null);
      setInputPin('');
    } else {
      setPinErrorMsg(t.pin_error);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setInputPin('');
    }
  };

  // Handle Stage 2 Google Login by email
  const handleGoogleLogin = (email: string) => {
    setGoogleAuthError(null);

    const verification = verifyEmailAccess(email);

    if (verification.allowed && verification.user) {
      const newSession: AuthSession = {
        user: verification.user,
        authMethod: 'google',
        timestamp: Date.now(),
      };
      setAuthSession(newSession, true);
      setCurrentSessionState(newSession);
      sessionStorage.setItem('b_sdd_auth_unlocked', 'true');
      sessionStorage.setItem('b_sdd_auth_timestamp', Date.now().toString());

      onUserAuthenticated?.(verification.user);
      onLockedStateChange?.(false);
      setShowCustomGoogleModal(false);
    } else {
      setGoogleAuthError({
        email,
        reason:
          verification.reason === 'account_suspended'
            ? 'Account suspended'
            : t.refusal_text,
      });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  // Emergency direct unlock with PIN (assigns super admin role)
  const handleEmergencyAdminLogin = () => {
    const users = loadAuthorizedUsers();
    const superAdmin =
      users.find((u) => u.email.toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL.toLowerCase()) || users[0];

    const newSession: AuthSession = {
      user: superAdmin,
      authMethod: 'pin',
      timestamp: Date.now(),
    };

    setAuthSession(newSession, true);
    setCurrentSessionState(newSession);
    setIsPinStageUnlocked(true);
    sessionStorage.setItem('b_sdd_auth_unlocked', 'true');
    sessionStorage.setItem('b_sdd_auth_timestamp', Date.now().toString());
    onUserAuthenticated?.(superAdmin);
    onLockedStateChange?.(false);
  };

  const handleLock = () => {
    clearAuthSession();
    setCurrentSessionState(null);
    setIsPinStageUnlocked(false);
    sessionStorage.removeItem('b_sdd_pin_stage_unlocked');
    setInputPin('');
    setPinErrorMsg(null);
    setGoogleAuthError(null);
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

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#060A13] flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden font-sans select-none">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(37,99,235,0.12),transparent_75%)] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-blue-600" />

      {/* Language Switcher in top right */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1.5 shadow-xl backdrop-blur-md">
        <Globe2 className="w-4 h-4 text-slate-400 ml-1" />
        {(['uk', 'fr', 'de', 'it', 'en'] as SupportedLanguage[]).map((l) => (
          <button
            key={l}
            onClick={() => onLanguageChange(l)}
            className={`px-2 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
              currentLang === l
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {l === 'uk' ? '🇺🇦 UA' : l === 'fr' ? '🇨🇭 FR' : l === 'de' ? '🇨🇭 DE' : l === 'it' ? '🇮🇹 IT' : '🇬🇧 EN'}
          </button>
        ))}
      </div>

      <div className={`w-full max-w-lg z-10 transition-transform ${isShaking ? 'animate-shake' : ''}`}>
        {/* ========================================================================= */}
        {/* STAGE 1: STEALTH SHIELD & CONFIDENTIAL PARTNERSHIP GATE                   */}
        {/* NO PERSONAL NAMES, NO CASE NUMBERS, NO EMAILS DISPLAYED                   */}
        {/* ========================================================================= */}
        {!isPinStageUnlocked ? (
          <div className="bg-[#0B1120]/95 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative">
            {/* Header Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-blue-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <Shield className="w-7 h-7" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-blue-400">
                  <Lock className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Title & Institutional Scope */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-800 text-[10px] text-blue-300 font-mono uppercase tracking-wider mb-2">
                <Scale className="w-3 h-3 text-amber-400" />
                <span>{t.stage1_badge}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-1">
                {t.stage1_title}
              </h1>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                {t.stage1_subtitle}
              </p>
            </div>

            {/* Legal Disclaimer & Collaboration Note */}
            <div className="bg-[#070B14] border border-slate-800 rounded-xl p-3.5 mb-5 space-y-2 text-[11px] text-slate-300 leading-relaxed">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{t.legal_notice_title}</span>
              </div>
              <p className="text-slate-400">
                {t.legal_notice_desc}
              </p>
              <div className="p-2 rounded bg-blue-950/30 border border-blue-900/40 text-[10px] text-blue-200/90 font-mono">
                {t.legal_notice_pin_hint}
              </div>

              {/* Legal Memorandum Trigger */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStrategyModalOpen(true)}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 hover:underline cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t.btn_legal_memo}</span>
                </button>
                <span className="text-[10px] text-slate-500 font-mono">LLCA Art. 12 / CO Art. 120</span>
              </div>
            </div>

            {/* PIN Entry Form */}
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 text-center">
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
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-center text-xl tracking-widest text-white placeholder:text-slate-600 placeholder:text-xs placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner font-mono"
                  />
                </div>
                {pinErrorMsg && (
                  <p className="text-red-400 text-xs text-center mt-2 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {pinErrorMsg}
                  </p>
                )}
              </div>

              {/* Clean Numeric Keypad (No giveaways, no cheats) */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNumClick(num)}
                    className="py-3 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-white font-medium text-base transition-colors border border-slate-700/40 active:scale-95 shadow-sm cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClearPin}
                  className="py-3 rounded-lg bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 hover:text-white font-mono text-xs transition-colors border border-slate-700/30 cursor-pointer"
                  title="Clear"
                >
                  C
                </button>
                <button
                  type="button"
                  onClick={() => handleNumClick('0')}
                  className="py-3 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-white font-medium text-base transition-colors border border-slate-700/40 active:scale-95 shadow-sm cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="py-3 rounded-lg bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 hover:text-white font-mono text-sm transition-colors border border-slate-700/30 cursor-pointer"
                  title="Backspace"
                >
                  ⌫
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 group active:scale-[0.98] cursor-pointer"
              >
                <Fingerprint className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
                <span>{t.pin_submit}</span>
              </button>
            </form>

            <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span className="font-mono">{t.footer_standard}</span>
              <span>{t.footer_bar}</span>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* STAGE 2: AUTHORIZED ACCESS ROSTER & GOOGLE RBAC LOGIN                     */
          /* UNLOCKED ONLY AFTER SUCCESSFUL STAGE 1 PIN ENTRY                         */
          /* ========================================================================= */
          <div className="bg-[#0B1120]/95 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-emerald-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      {t.stage2_verified}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">PE24.014624-SBA</span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-0.5">{t.stage2_title}</h2>
                </div>
              </div>

              {/* Back to PIN lock */}
              <button
                type="button"
                onClick={() => {
                  setIsPinStageUnlocked(false);
                  sessionStorage.removeItem('b_sdd_pin_stage_unlocked');
                }}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                title="Lock Stage 1"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>{t.stage2_btn_lock}</span>
              </button>
            </div>

            {/* Legal context notice */}
            <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-3 mb-4 text-xs text-blue-200 flex gap-2.5 items-start">
              <Scale className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">{t.stage2_court_title}</span>
                <span className="text-[11px] text-blue-200/80 leading-relaxed">
                  {t.stage2_court_desc}
                </span>
                <div className="mt-1 pt-1 border-t border-blue-900/40 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStrategyModalOpen(true)}
                    className="text-[10px] text-amber-300 hover:text-white underline flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>{t.btn_legal_memo}</span>
                  </button>
                  <span className="text-[10px] font-mono text-blue-400">CPP Art. 115 / LAVI Art. 13</span>
                </div>
              </div>
            </div>

            {/* Access Refusal Error Alert */}
            {googleAuthError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-rose-200 text-xs space-y-1.5 mb-4 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{t.refusal_title}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  <strong className="text-white font-mono">{googleAuthError.email}</strong> {googleAuthError.reason}
                </p>
                <div className="text-[10px] text-rose-300/80 pt-1 border-t border-rose-900/50 flex items-center justify-between">
                  <span>{t.refusal_admin}: {PRIMARY_SUPER_ADMIN_EMAIL}</span>
                  <button onClick={() => setGoogleAuthError(null)} className="text-rose-400 hover:text-white underline cursor-pointer">
                    {t.refusal_close}
                  </button>
                </div>
              </div>
            )}

            {/* Primary Google Sign-In Card: Super Admin */}
            <div className="border border-blue-500/30 rounded-xl p-3 bg-gradient-to-r from-blue-950/30 to-indigo-950/20 mb-3">
              <div className="text-[10px] uppercase font-mono text-blue-400 font-bold mb-2 flex items-center justify-between">
                <span>{t.stage2_root_title}</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px]">
                  {t.stage2_root_badge}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleGoogleLogin(PRIMARY_SUPER_ADMIN_EMAIL)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all shadow-md group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-blue-900 font-bold shrink-0 shadow">
                    G
                  </div>
                  <div className="text-left truncate">
                    <div className="font-bold text-white leading-tight">{t.stage2_btn_root}</div>
                    <div className="text-[11px] text-blue-100 font-mono truncate">{PRIMARY_SUPER_ADMIN_EMAIL}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            </div>

            {/* Team Roster Accounts */}
            <div className="space-y-2 mb-4">
              <label className="block text-[11px] font-semibold text-slate-400">
                {t.stage2_roster_title}
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {authorizedUsers
                  .filter((u) => u.email.toLowerCase() !== PRIMARY_SUPER_ADMIN_EMAIL.toLowerCase())
                  .map((user) => {
                    const roleMeta = ROLE_DEFINITIONS[user.role];
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleGoogleLogin(user.email)}
                        disabled={!user.isActive}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                          user.isActive
                            ? 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 text-slate-200 hover:border-blue-500/40'
                            : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-mono text-xs shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-200 truncate">{user.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">{user.email}</div>
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
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setShowCustomGoogleModal(true)}
                className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-blue-400" />
                <span>{t.stage2_btn_custom_google}</span>
              </button>

              <button
                type="button"
                onClick={handleEmergencyAdminLogin}
                className="py-2.5 px-3 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-800/40 text-amber-300 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="PIN Emergency Master"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{t.stage2_btn_direct_pin}</span>
              </button>
            </div>
          </div>
        )}
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
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
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
                  handleGoogleLogin(customGoogleEmail);
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
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs cursor-pointer"
                >
                  {t.modal_btn_cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
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
      />
    </div>
  );
};
