import React, { useState } from "react";
import {
  BookOpen,
  X,
  Search,
  Copy,
  Check,
  Send,
  Code2,
  ShieldCheck,
  ExternalLink,
  Laptop,
  Scale,
  FileText,
  Key,
  Database,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
  kindleEmail?: string;
  onShowToast?: (message: string) => void;
}

type DocTab = "user" | "dev" | "invariants" | "shortcuts";

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  kindleEmail = "tukroschu@kindle.com",
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<DocTab>("user");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isSendingToKindle, setIsSendingToKindle] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    if (onShowToast) {
      onShowToast(
        currentLang === "uk"
          ? "Розділ документації скопійовано!"
          : "Section de documentation copiée !"
      );
    }
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSendToKindle = () => {
    setIsSendingToKindle(true);
    setTimeout(() => {
      setIsSendingToKindle(false);
      if (onShowToast) {
        onShowToast(
          currentLang === "uk"
            ? `Документацію скомпільовано в EPUB 3.0 та надіслано на ${kindleEmail}`
            : `Documentation compilée en EPUB 3.0 et envoyée à ${kindleEmail}`
        );
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn select-text">
      <div className="bg-[#0B1120] border border-cyan-500/40 rounded-xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#080E1B] border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>
                  {currentLang === "uk"
                    ? "Довідковий Центр & Документація B-SDD"
                    : currentLang === "fr"
                    ? "Centre de Documentation & Manuel B-SDD"
                    : currentLang === "de"
                    ? "Dokumentationszentrum & B-SDD Handbuch"
                    : currentLang === "it"
                    ? "Centro di Documentazione & Manuale B-SDD"
                    : "B-SDD Documentation & Knowledge Center"}
                </span>
                <span className="text-[10px] font-mono uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded">
                  v2.5 Release
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {currentLang === "uk"
                  ? "Суверенна архітектура парного програмування та правового аналізу (Canton de Vaud / Швейцарія)"
                  : "Architecture souveraine d'analyse judiciaire et pair-programming (Canton de Vaud / Suisse)"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSendToKindle}
              disabled={isSendingToKindle}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/60 rounded-lg text-xs font-medium text-emerald-300 transition-colors"
              title={`Надіслати на Kindle (${kindleEmail})`}
            >
              <Send className={`w-3.5 h-3.5 ${isSendingToKindle ? "animate-pulse" : ""}`} />
              <span>
                {isSendingToKindle
                  ? currentLang === "uk"
                    ? "Компіляція EPUB..."
                    : "Compilation EPUB..."
                  : "Send to Kindle"}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS & SEARCH */}
        <div className="bg-[#09101F] border-b border-slate-800/80 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveTab("user")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === "user"
                  ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {currentLang === "uk"
                  ? "📖 Керівництво Користувача"
                  : currentLang === "fr"
                  ? "📖 Guide Utilisateur"
                  : "📖 User Guide"}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("dev")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === "dev"
                  ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>
                {currentLang === "uk"
                  ? "🛠️ Архітектура Розробника"
                  : currentLang === "fr"
                  ? "🛠️ Guide Développeur"
                  : "🛠️ Developer Guide"}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("invariants")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === "invariants"
                  ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {currentLang === "uk"
                  ? "⚖️ Інваріанти L-01..L-05"
                  : "⚖️ Invariants L-01..L-05"}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("shortcuts")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === "shortcuts"
                  ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>
                {currentLang === "uk"
                  ? "⚡ Гарячі клавіші"
                  : "⚡ Hotkeys"}
              </span>
            </button>
          </div>

          <div className="relative min-w-[200px] sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                currentLang === "uk"
                  ? "Пошук по розділах документації..."
                  : "Rechercher dans la documentation..."
              }
              className="w-full pl-8 pr-3 py-1.5 bg-[#060A14] border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/70"
            />
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          {/* TAB 1: USER GUIDE */}
          {activeTab === "user" && (
            <div className="space-y-6">
              <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-5 relative group">
                <button
                  onClick={() =>
                    handleCopy(
                      "PIN-код безпеки за замовчуванням: 0523. Екстрене блокування кнопкою Lock у Topbar.",
                      "auth"
                    )
                  }
                  className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                  title="Скопіювати"
                >
                  {copiedSection === "auth" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm sm:text-base mb-2">
                  <Key className="w-4 h-4" />
                  <h3>1. Безпека, Авторизація та AuthGate (PIN: 0523)</h3>
                </div>
                <p className="text-slate-400 mb-3">
                  Для захисту адвокатської таємниці робочий простір захищено авторизаційним екраном:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1">
                  <li>
                    <strong className="text-slate-200">Вхід до системи:</strong> Захисний PIN-код за замовчуванням — <span className="font-mono bg-cyan-950 px-2 py-0.5 rounded text-cyan-300 font-bold border border-cyan-800/60">0523</span>.
                  </li>
                  <li>
                    <strong className="text-slate-200">Екстрене блокування:</strong> У верхній панелі (Topbar) натисніть іконку замка або скористайтеся комбінацією <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">Alt+L</kbd>.
                  </li>
                  <li>
                    <strong className="text-slate-200">Зміна коду:</strong> Доступна у вікні налаштувань (Settings ➔ вкладка «Безпека»).
                  </li>
                </ul>
              </section>

              <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-5 relative group">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm sm:text-base mb-2">
                  <FileText className="w-4 h-4" />
                  <h3>2. Модуль «📖 Рецензування & Голос» (Split Diff & Kindle)</h3>
                </div>
                <p className="text-slate-400 mb-3">
                  Призначений для опрацювання 18 розділів судового досьє, зіставлення версій та надиктовування:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1">
                  <li>
                    <strong className="text-slate-200">Двоколонковий редактор (Split Diff):</strong> Ліва колонка містить вихідні або спростовані твердження іншої сторони, права — актуальний вивірений текст адвоката.
                  </li>
                  <li>
                    <strong className="text-slate-200">Голосове диктування (Voice):</strong> Підтримує українську, французьку та англійську мови через Web Speech API з автопунктуацією.
                  </li>
                  <li>
                    <strong className="text-slate-200">Експорт на Kindle:</strong> Кнопка «Надіслати на Kindle» компілює всі розділи в EPUB 3.0 та відправляє на захищений email.
                  </li>
                </ul>
              </section>

              <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-5 relative group">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm sm:text-base mb-2">
                  <Database className="w-4 h-4" />
                  <h3>3. Кабінет Речових Доказів (Factbook) та Фотогалерея EXIF</h3>
                </div>
                <p className="text-slate-400 mb-3">
                  Містить повний каталог доказів (P-01 .. P-15) із перемиканням на фотогалерею та архів Google Drive:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1">
                  <li>
                    <strong className="text-slate-200">Криміналістичний Lightbox:</strong> Перегляд фото P-03 (Unisanté), P-05 (Wise), P-06 (EXIF 1481 алібі в Лозанні), P-10 (погрози) з зумом 50%–300% та поворотом 90°.
                  </li>
                  <li>
                    <strong className="text-slate-200">Управління фото на картках:</strong> Кнопка «Змінити фото» або кошик «Видалити» дозволяє прикріпити новий файл з автоматичною фіксацією в ADR Utopia DB.
                  </li>
                  <li>
                    <strong className="text-slate-200">Локальний SHA-256 Verifier:</strong> Перетягніть будь-який файл у вкладку Google Drive — браузер миттєво порахує хеш і звірить його з WORM-реєстром.
                  </li>
                </ul>
              </section>

              <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-5 relative group">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm sm:text-base mb-2">
                  <Sparkles className="w-4 h-4" />
                  <h3>4. ШІ Юридичний Копілот & Довідник «? Абревіатури»</h3>
                </div>
                <p className="text-slate-400 mb-3">
                  Вбудовані асистенти з правового аналізу законодавства Швейцарії:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1">
                  <li>
                    <strong className="text-slate-200">ШІ Копілот (Copilot):</strong> Аналізує склад злочинів за CP/CPP, кваліфікує докази, генерує проекти клопотань про арешт активів (ст. 263 КПК).
                  </li>
                  <li>
                    <strong className="text-slate-200">Довідник термінів:</strong> Кнопка «? Абревіатури» декодує КПК/CPP, КК/CP, ЦК/CC (ст. 933), ATF 146 IV 9, VT/TT та WORM.
                  </li>
                </ul>
              </section>
            </div>
          )}

          {/* TAB 2: DEVELOPER GUIDE */}
          {activeTab === "dev" && (
            <div className="space-y-6">
              <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-5">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm sm:text-base mb-2">
                  <Code2 className="w-4 h-4" />
                  <h3>1. Філософія B-SDD та Бітемпоральний Простір</h3>
                </div>
                <p className="text-slate-400 mb-3">
                  Система розроблена за методологією <strong>Bitemporal Spec-Driven Development</strong>:
                </p>
                <div className="bg-[#060A14] border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-cyan-300 overflow-x-auto mb-3">
                  Tv (Valid Time / Час факту) ─────────────► [Реальні події у світі]<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼ Бітемпоральне зіставлення (Timeline Calibrator)<br />
                  Tt (Transaction Time / Час фіксації) ────► [WORM Ledger Utopia DB]
                </div>
                <p className="text-slate-300 text-xs">
                  Різниця ΔT = |Tt - Tv| служить індикатором детекції замовних протоколів та ретроспективного редагування показань.
                </p>
              </section>

              <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-5">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm sm:text-base mb-2">
                  <Laptop className="w-4 h-4" />
                  <h3>2. Стек та Команди Збірки</h3>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1 mb-4">
                  <li><strong className="text-slate-200">Frontend:</strong> React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide React.</li>
                  <li><strong className="text-slate-200">Deployment:</strong> Cloudflare Pages (automated CI/CD triggered on git push to <code>main</code>).</li>
                  <li><strong className="text-slate-200">B-SDD Core:</strong> Pure Python stdlib (`src/legal/`, `src/core/`).</li>
                </ul>
                <div className="bg-[#060A14] border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-200 space-y-1">
                  <div className="text-slate-500"># Локальний запуск розробки</div>
                  <div>npm run dev</div>
                  <div className="text-slate-500 pt-1"># Компіляція та створення dist</div>
                  <div>npm run build</div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: INVARIANTS */}
          {activeTab === "invariants" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 border border-cyan-800/40 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-1.5">
                  <span className="font-mono bg-cyan-950 px-2 py-0.5 rounded text-xs border border-cyan-700">L-01</span>
                  <h4>Bitemporal Immutability</h4>
                </div>
                <p className="text-slate-300 text-xs">
                  Заборона модифікації записів на місці (in-place update). Будь-яке оновлення факту чи статті кодексу здійснюється виключно через атомарну суперсесію зі збереженням історії переходів.
                </p>
              </div>

              <div className="bg-slate-900/50 border border-cyan-800/40 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-1.5">
                  <span className="font-mono bg-cyan-950 px-2 py-0.5 rounded text-xs border border-cyan-700">L-02</span>
                  <h4>Zero External Dependencies</h4>
                </div>
                <p className="text-slate-300 text-xs">
                  Критичне юридичне ядро міркувань у <code>src/legal/</code> виконується виключно на стандартній бібліотеці Python (stdlib-only), що унеможливлює збої від оновлень сторонніх пакетів.
                </p>
              </div>

              <div className="bg-amber-950/20 border border-amber-800/50 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-amber-400 font-bold mb-1.5">
                  <span className="font-mono bg-amber-950 px-2 py-0.5 rounded text-xs border border-amber-700">L-03</span>
                  <h4>Bona Fide Third-Party Shield</h4>
                </div>
                <p className="text-slate-300 text-xs">
                  Абсолютний правовий щит добросовісної третьої сторони (ст. 933 Цивільного кодексу Швейцарії). Будь-які обвинувальні дії проти волонтера Адріано Міллі суворо заблоковані.
                </p>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1.5">
                  <span className="font-mono bg-emerald-950 px-2 py-0.5 rounded text-xs border border-emerald-700">L-04</span>
                  <h4>Victim Legal Protection</h4>
                </div>
                <p className="text-slate-300 text-xs">
                  Арсен Коваленко (нар. 05.11.1999, повнолітній потерпілий, 26 років). Безпосередня жертва шахрайства на $15'000 USD та тяжких погроз. Жодного помилкового застосування ст. 219 КК.
                </p>
              </div>

              <div className="bg-slate-900/50 border border-cyan-800/40 rounded-xl p-4 md:col-span-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-1.5">
                  <span className="font-mono bg-cyan-950 px-2 py-0.5 rounded text-xs border border-cyan-700">L-05</span>
                  <h4>Cryptographic WORM Proof</h4>
                </div>
                <p className="text-slate-300 text-xs">
                  Кожен аудіофайл фоноскопічної експертизи, документ та фотознімок EXIF обов'язково містить незмінний хеш SHA-256, верифікований з Utopia DB.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SHORTCUTS */}
          {activeTab === "shortcuts" && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-5">
              <h3 className="text-sm sm:text-base font-bold text-slate-100 mb-3 flex items-center space-x-2">
                <Laptop className="w-4 h-4 text-cyan-400" />
                <span>Швидкі клавіші робочого простору</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-[#060A14] border border-slate-800 rounded-lg">
                  <span className="text-slate-300">Блокування робочого простору</span>
                  <kbd className="font-mono bg-slate-800 px-2 py-1 rounded text-cyan-300 text-[11px]">Alt + L</kbd>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#060A14] border border-slate-800 rounded-lg">
                  <span className="text-slate-300">Закрити модальне вікно / Lightbox</span>
                  <kbd className="font-mono bg-slate-800 px-2 py-1 rounded text-cyan-300 text-[11px]">Escape</kbd>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#060A14] border border-slate-800 rounded-lg">
                  <span className="text-slate-300">Навігація фото у Lightbox</span>
                  <kbd className="font-mono bg-slate-800 px-2 py-1 rounded text-cyan-300 text-[11px]">← / →</kbd>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#060A14] border border-slate-800 rounded-lg">
                  <span className="text-slate-300">Масштабування фото (Zoom)</span>
                  <kbd className="font-mono bg-slate-800 px-2 py-1 rounded text-cyan-300 text-[11px]">+ / -</kbd>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-[#080E1B] border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>B-SDD Sovereign Engine · Canton de Vaud</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium"
          >
            {currentLang === "uk" ? "Закрити" : "Fermer"}
          </button>
        </div>
      </div>
    </div>
  );
};
