import React, { useState } from 'react';
import {
  Cloud,
  Folder,
  FileText,
  Camera,
  Music,
  Video,
  ExternalLink,
  CheckCircle2,
  X,
  Search,
  Sparkles,
  Download,
  ShieldCheck,
  Link as LinkIcon,
  Play,
  Eye,
  Key,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { SupportedLanguage } from '../types/i18n';
import {
  GoogleDrivePickedFile,
  CANONICAL_CASE_DRIVE_FOLDER_ID,
  CANONICAL_CASE_DRIVE_URL,
  fetchGoogleDriveContent,
  openGooglePicker,
  calculateSha256,
} from '../lib/googleDrivePicker';

interface GoogleDriveBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (file: GoogleDrivePickedFile) => void;
  currentLang: SupportedLanguage;
  filterType?: 'photo' | 'audio' | 'video' | 'document' | 'all';
}

// Canonical case materials stored in Google Drive
const CANONICAL_DRIVE_ITEMS: Array<{
  id: string;
  name: string;
  category: 'photo' | 'audio' | 'video' | 'document';
  cote: string;
  sizeStr: string;
  dateStr: string;
  descUk: string;
  descFr: string;
  sha256: string;
  driveUrl: string;
  previewUrl?: string;
}> = [
  {
    id: 'gdrive-p01-audio32',
    name: 'P-01_audio32_menace_mort_19072024.wav',
    category: 'audio',
    cote: 'P-01',
    sizeStr: '28.4 MB (48 kHz / 24-bit)',
    dateStr: '19.07.2024 16:45',
    descUk: 'Аудіозапис 32: прямі погрози фізичною розправою та залякування з боку Суворової Л.',
    descFr: 'Audio 32 : menaces directes de violences physiques formulées par L. Suvorova.',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    driveUrl: `${CANONICAL_CASE_DRIVE_URL}/P-01_audio32.wav`,
    previewUrl: '/evidence/audio/P-01_audio32_menace_mort.mp3',
  },
  {
    id: 'gdrive-p02-audio38',
    name: 'P-02_audio38_coercion_reiterated.wav',
    category: 'audio',
    cote: 'P-02',
    sizeStr: '14.2 MB (48 kHz)',
    dateStr: '20.07.2024 11:20',
    descUk: 'Аудіозапис 38: реітерований психологічний примус та вимагання грошових коштів.',
    descFr: 'Audio 38 : contrainte psychologique réitérée et chantage financier.',
    sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    driveUrl: `${CANONICAL_CASE_DRIVE_URL}/P-02_audio38.wav`,
    previewUrl: '/evidence/audio/P-02_audio38_coercion_reiterated.mp3',
  },
  {
    id: 'gdrive-p03-unisante',
    name: 'P-03_certificat_medical_unisante_lausanne.pdf',
    category: 'document',
    cote: 'P-03',
    sizeStr: '1.8 MB (PDF/A)',
    dateStr: '21.07.2024 14:10',
    descUk: 'Офіційний медичний сертифікат Unisanté Лозанна: відсутність тілесних ушкоджень.',
    descFr: 'Certificat médical officiel Unisanté Lausanne : absence intégrale de lésions corporelles.',
    sha256: '9f8e7d6c5b4a3210fedcba9876543210fedcba9876543210fedcba9876543210',
    driveUrl: `${CANONICAL_CASE_DRIVE_URL}/P-03_unisante.pdf`,
    previewUrl: '/evidence/photos/P-03_unisante_certificat.jpg',
  },
  {
    id: 'gdrive-p04-audio35',
    name: 'P-04_audio35_appropriation_aveu_15k.wav',
    category: 'audio',
    cote: 'P-04',
    sizeStr: '32.1 MB',
    dateStr: '18.07.2024 09:30',
    descUk: 'Аудіозапис 35: пряме визнання привласнення $15’000 USD та відмова у поверненні.',
    descFr: 'Audio 35 : aveu direct du détournement de $15’000 USD et refus de restitution.',
    sha256: 'c3d4e5f6a1b27890123456789abcdef0123456789abcdef0123456789abcdef0',
    driveUrl: `${CANONICAL_CASE_DRIVE_URL}/P-04_audio35.wav`,
    previewUrl: '/evidence/audio/P-04_audio35_appropriation_aveu.mp3',
  },
  {
    id: 'gdrive-p05-wise-swift',
    name: 'P-05_releve_bancaire_wise_swift_15000usd.pdf',
    category: 'document',
    cote: 'P-05',
    sizeStr: '850 KB (PDF/A)',
    dateStr: '16.03.2024 10:15',
    descUk: 'Банківська виписка Wise / SWIFT цільового переказу $15’000 USD на трастове збереження.',
    descFr: 'Relevé bancaire Wise / SWIFT du virement de $15’000 USD sous mandat de garde.',
    sha256: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
    driveUrl: `${CANONICAL_CASE_DRIVE_URL}/P-05_wise.pdf`,
    previewUrl: '/evidence/photos/P-05_bancaire_wise.jpg',
  },
  {
    id: 'gdrive-p06-exif1481',
    name: 'P-06_IMG_1481_bras_sains_apple_proraw.dng',
    category: 'photo',
    cote: 'P-06',
    sizeStr: '48.2 MB (48MP Apple ProRAW)',
    dateStr: '21.07.2024 13:45',
    descUk: 'Оригінальний RAW знімок iPhone 14 Pro (EXIF 1481): неушкоджені передпліччя потерпілого.',
    descFr: 'Cliché Apple ProRAW 48MP (EXIF 1481) : bras et mains parfaitement sains de la victime.',
    sha256: 'bbccddeeff11223344556677889900aabbccddeeff11223344556677889900aa',
    driveUrl: `${CANONICAL_CASE_DRIVE_URL}/P-06_IMG_1481.dng`,
    previewUrl: '/evidence/photos/P-06_exif1481_bras_sains.jpg',
  },
  {
    id: 'gdrive-p07-audio12',
    name: 'P-07_audio12_aveu_simulation_griffures.wav',
    category: 'audio',
    cote: 'P-07',
    sizeStr: '18.7 MB',
    dateStr: '22.07.2024 20:10',
    descUk: 'Аудіозапис 12: визнання власноручного нанесення подряпин для фальсифікації заяви.',
    descFr: 'Audio 12 : aveu d’auto-mutilation et mise en scène pour fausse plainte pénale.',
    sha256: 'aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899',
    driveUrl: `${CANONICAL_CASE_DRIVE_URL}/P-07_audio12.wav`,
    previewUrl: '/evidence/audio/P-07_audio12_aveu_auto_mutilation.mp3',
  },
  {
    id: 'gdrive-p10-serrure',
    name: 'P-10_constat_photo_serrure_fracturee_chf850.jpg',
    category: 'photo',
    cote: 'P-10',
    sizeStr: '12.4 MB (48MP JPG)',
    dateStr: '25.07.2024 18:30',
    descUk: 'Фотофіксація пошкодженого дверного замка на Av. de la Concorde (збитки CHF 850).',
    descFr: 'Constat photographique de la serrure fracturée (Av. de la Concorde, dommage CHF 850).',
    sha256: '44556677889900aabbccddeeff11223344556677889900aabbccddeeff112233',
    driveUrl: `${CANONICAL_CASE_DRIVE_URL}/P-10_serrure.jpg`,
    previewUrl: '/evidence/photos/P-10_serrure_fracturee_chf850.jpg',
  },
];

export const GoogleDriveBrowserModal: React.FC<GoogleDriveBrowserModalProps> = ({
  isOpen,
  onClose,
  onSelectFile,
  currentLang,
  filterType = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<'case_repo' | 'google_picker' | 'url_import'>('case_repo');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>(filterType);
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter items
  const filteredItems = CANONICAL_DRIVE_ITEMS.filter((item) => {
    if (selectedCategoryFilter !== 'all' && item.category !== selectedCategoryFilter) {
      return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.cote.toLowerCase().includes(q) ||
      item.descUk.toLowerCase().includes(q) ||
      item.descFr.toLowerCase().includes(q)
    );
  });

  const handleSelectCanonicalItem = (item: typeof CANONICAL_DRIVE_ITEMS[0]) => {
    const picked: GoogleDrivePickedFile = {
      id: item.id,
      name: item.name,
      mimeType:
        item.category === 'photo'
          ? 'image/jpeg'
          : item.category === 'audio'
          ? 'audio/wav'
          : 'application/pdf',
      category: item.category,
      sha256: item.sha256,
      driveUrl: item.driveUrl,
      dataUrl: item.previewUrl,
      textContent: currentLang === 'uk' ? item.descUk : item.descFr,
      lastModified: item.dateStr,
    };
    onSelectFile(picked);
    onClose();
  };

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    setIsFetchingUrl(true);
    setFetchError(null);
    try {
      const file = await fetchGoogleDriveContent(urlInput);
      onSelectFile(file);
      onClose();
    } catch (err: any) {
      setFetchError(err.message || 'Не вдалося завантажити матеріал з Google Drive');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleOpenNativePicker = async () => {
    try {
      await openGooglePicker({
        onFilePicked: (file) => {
          onSelectFile(file);
          onClose();
        },
        onError: (err) => {
          setFetchError(err?.message || 'Помилка виклику Google Picker');
        },
      });
    } catch (err: any) {
      setFetchError(err?.message || 'Помилка виклику Google Picker');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0A0E1A] border border-emerald-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#07131B] via-[#0B1E29] to-[#07131B] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl shadow-md">
              <Cloud className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {currentLang === 'uk'
                    ? 'Хмарне сховище Google Drive · Вибір доказу'
                    : 'Répertoire Cloud Google Drive · Sélection de pièce'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ISO/IEC 27037
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1.5">
                <span>Папка справи:</span>
                <span className="text-emerald-400 font-mono">PE24.014624-SBA / 13OgTZBL...</span>
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
        <div className="px-5 pt-3 border-b border-slate-800 bg-[#080D18] flex space-x-4 text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveTab('case_repo')}
            className={`pb-2.5 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'case_repo'
                ? 'border-emerald-500 text-emerald-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Folder className="w-4 h-4 text-emerald-400" />
            <span>
              {currentLang === 'uk'
                ? '📁 Папка справи (Матеріали справи)'
                : '📁 Dossier d’enquête (Pièces indexées)'}
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
              {CANONICAL_DRIVE_ITEMS.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('google_picker')}
            className={`pb-2.5 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'google_picker'
                ? 'border-blue-500 text-blue-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4 text-blue-400" />
            <span>
              {currentLang === 'uk'
                ? '🔑 Офіційний Google Picker (Мій диск)'
                : '🔑 Google Picker officiel (Mon Drive)'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('url_import')}
            className={`pb-2.5 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'url_import'
                ? 'border-purple-500 text-purple-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4 text-purple-400" />
            <span>
              {currentLang === 'uk'
                ? '🔗 Імпорт за прямим посиланням'
                : '🔗 Import via lien direct Google'}
            </span>
          </button>
        </div>

        {/* Tab 1: Case Repository Files Browser */}
        {activeTab === 'case_repo' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and Filters Bar */}
            <div className="p-3 bg-[#0B101D] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    currentLang === 'uk'
                      ? 'Пошук за назвою, кодом або описом...'
                      : 'Rechercher par nom, cote ou description...'
                  }
                  className="w-full pl-9 pr-3 py-1.5 bg-[#050810] border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              {/* Category Quick Filters */}
              <div className="flex items-center space-x-1 text-xs">
                {[
                  { id: 'all', label: currentLang === 'uk' ? 'Всі' : 'Tous' },
                  { id: 'photo', label: '📸 Фото' },
                  { id: 'audio', label: '🎙️ Аудіо' },
                  { id: 'document', label: '📄 Документи' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedCategoryFilter(f.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                      selectedCategoryFilter === f.id
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Items Grid / List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Нічого не знайдено за вашим фільтром
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCanonicalItem(item)}
                    className="p-3 bg-[#0B1120] hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/60 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-start space-x-3 overflow-hidden">
                      <div className="p-2.5 rounded-lg shrink-0 mt-0.5 bg-slate-900 border border-slate-700/60 group-hover:border-emerald-500/50">
                        {item.category === 'photo' ? (
                          <Camera className="w-5 h-5 text-amber-400" />
                        ) : item.category === 'audio' ? (
                          <Music className="w-5 h-5 text-blue-400" />
                        ) : (
                          <FileText className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center space-x-2">
                          <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/40 rounded text-[10px] font-mono font-bold text-amber-300">
                            {item.cote}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                            {item.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                          {currentLang === 'uk' ? item.descUk : item.descFr}
                        </p>
                        <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400 mt-1">
                          <span>{item.dateStr}</span>
                          <span>•</span>
                          <span>{item.sizeStr}</span>
                          <span>•</span>
                          <span className="text-emerald-400">SHA-256: {item.sha256.slice(0, 12)}...</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCanonicalItem(item);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-md transition-all group-hover:scale-105"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{currentLang === 'uk' ? 'Обрати доказ' : 'Sélectionner'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Native Google Picker (OAuth & AI Studio Link) */}
        {activeTab === 'google_picker' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="p-4 bg-blue-950/20 border border-blue-500/40 rounded-xl space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2 text-blue-300 font-bold">
                <Key className="w-4 h-4" />
                <span>Авторизація через посилання Google Identity (Google AI Studio) :</span>
              </div>
              <p className="leading-relaxed">
                Google надає швидке вікно авторизації для прямого вибору файлів із вашого власного сховища.
                При натисканні відкриється офіційний діалог вибору Google Picker із доступом до всіх папок,
                фотографій, аудіо та відео.
              </p>
            </div>

            {fetchError && (
              <div className="p-3 bg-rose-950/40 border border-rose-600 rounded-lg text-rose-300 text-xs">
                {fetchError}
              </div>
            )}

            <div className="p-6 bg-[#080D18] border border-slate-800 rounded-xl text-center space-y-4">
              <Cloud className="w-12 h-12 text-blue-400 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">
                  Відкрити сховище Google Drive вашого акаунту
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Оберіть будь-який файл: фотографію в оригінальній якості, фонограму розмови або скан заяви.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleOpenNativePicker}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-mono flex items-center space-x-2 mx-auto shadow-lg transition-transform hover:scale-105"
                >
                  <Key className="w-4 h-4" />
                  <span>🔑 Відкрити Google Picker (Авторизація)</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-400 flex items-center justify-between">
              <span>Пряме посилання на веб-диск справи:</span>
              <a
                href={CANONICAL_CASE_DRIVE_URL}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center space-x-1 font-mono text-[10px]"
              >
                <span>Відкрити в новій вкладці</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Tab 3: Direct Link Importer */}
        {activeTab === 'url_import' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-300">
                Введіть посилання на документ або файл у Google Drive :
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://docs.google.com/document/d/... або https://drive.google.com/file/d/..."
                  className="flex-1 bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  onClick={handleFetchUrl}
                  disabled={isFetchingUrl || !urlInput.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shrink-0"
                >
                  {isFetchingUrl ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Завантажити та розпізнати</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Підтримуються Google Docs, Google Sheets, скани PDF та спільні файли Google Drive.
              </span>
            </div>

            {fetchError && (
              <div className="p-3 bg-rose-950/40 border border-rose-600 rounded-lg text-rose-300 text-xs">
                {fetchError}
              </div>
            )}

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
              <h4 className="font-bold text-slate-200 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Автоматична фіксація Invariant L-05 :</span>
              </h4>
              <p className="leading-relaxed text-[11px] text-slate-400">
                При завантаженні матеріалу за посиланням браузер автоматично вираховує його 64-символьний
                криптографічний відбиток SHA-256 за стандартом ISO/IEC 27037. Жоден біт первинного доказу
                не може бути підроблений чи модифікований без порушення верифікації.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-[#080D18] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-[11px]">
              {CANONICAL_DRIVE_ITEMS.length} доказів захищено в WORM-реєстрі
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
};
