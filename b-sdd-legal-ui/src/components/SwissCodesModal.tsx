import React, { useState } from "react";
import {
  Scale,
  X,
  Search,
  BookOpen,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  ExternalLink,
  Layers,
  ChevronRight,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import { SWISS_LAW_ARTICLES, LawArticle } from "../data/swissLawCodes";

interface SwissCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
  onSelectArticle?: (article: LawArticle) => void;
}

export const SwissCodesModal: React.FC<SwissCodesModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSelectArticle,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<LawArticle>(SWISS_LAW_ARTICLES[0]);

  if (!isOpen) return null;

  const filteredArticles = SWISS_LAW_ARTICLES.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      item.article.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.title[currentLang].toLowerCase().includes(q) ||
      item.content_fr.toLowerCase().includes(q) ||
      item.content_uk.toLowerCase().includes(q) ||
      item.corroborating_cotes.some((c) => c.toLowerCase().includes(q));

    const matchesJurisdiction =
      selectedJurisdiction === "all" || item.jurisdiction === selectedJurisdiction;

    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesJurisdiction && matchesCategory;
  });

  const handleCopyCitation = (article: LawArticle) => {
    const text = `${article.article} — ${article.title[currentLang]}\n${
      currentLang === "uk" ? article.content_uk : article.content_fr
    }`;
    navigator.clipboard.writeText(text);
    setCopiedId(article.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn select-text">
      <div className="bg-[#0B1120] border border-blue-600/40 rounded-xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#080E1B] border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>
                  {currentLang === "uk"
                    ? "База кодексів Швейцарії & Законодавство кантону Во (MemPalace)"
                    : currentLang === "fr"
                    ? "Corpus Juridique Suisse & Droit Vaudois (MemPalace KùzuDB)"
                    : "Swiss Legal Codes & Vaud Cantonal Corpus (MemPalace)"}
                </span>
                <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  KùzuDB 8'746 зв'язків
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {currentLang === "uk"
                  ? "Офіційні норми CP, CPP, CC, CO, кантональне право Во (LOJV, TDIP) та прецеденти ATF"
                  : "Normes pénales, procédure vaudoise et jurisprudence fédérale de référence"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="p-3 bg-[#070B14] border-b border-slate-800/80 flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                currentLang === "uk"
                  ? "Пошук статті (напр. Art. 146, 180, 263, ATF 146 IV 9, кантон Во...)"
                  : "Rechercher un article (ex. Art. 146, 180, 263, ATF 146 IV 9...)"
              }
              className="w-full pl-8 pr-3 py-1.5 bg-[#0D1527] border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Jurisdiction Filter */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => setSelectedJurisdiction("all")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                selectedJurisdiction === "all"
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              {currentLang === "uk" ? "Всі юрисдикції" : "Toutes"}
            </button>
            <button
              onClick={() => setSelectedJurisdiction("federal")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                selectedJurisdiction === "federal"
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              🇨🇭 {currentLang === "uk" ? "Федеральне (CH)" : "Fédéral"}
            </button>
            <button
              onClick={() => setSelectedJurisdiction("canton_vaud")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                selectedJurisdiction === "canton_vaud"
                  ? "bg-emerald-600 text-white font-semibold"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              🏛️ {currentLang === "uk" ? "Кантон Во (VD)" : "Canton Vaud"}
            </button>
          </div>
        </div>

        {/* TWO-COLUMN BODY: LIST (LEFT) & DEEP DETAIL INSPECTOR (RIGHT) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT: Scrollable Articles List */}
          <div className="w-full md:w-1/2 lg:w-5/12 border-r border-slate-800/80 overflow-y-auto p-2 sm:p-3 space-y-2">
            {filteredArticles.map((art) => {
              const isSelected = activeArticle.id === art.id;
              return (
                <div
                  key={art.id}
                  onClick={() => setActiveArticle(art)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#0F1A2E] border-blue-500/80 shadow-md"
                      : "bg-[#070B12] hover:bg-[#0D1424] border-slate-800/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                        {art.article}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {art.code}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        art.jurisdiction === "canton_vaud"
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                          : "bg-blue-950/60 text-blue-300 border-blue-800/50"
                      }`}
                    >
                      {art.jurisdiction === "canton_vaud" ? "Canton VD" : "Fédéral CH"}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-100 mb-1 leading-snug">
                    {art.title[currentLang]}
                  </h4>

                  <p className="text-[11px] text-slate-400 line-clamp-2 font-serif italic mb-2 leading-relaxed">
                    {currentLang === "uk" ? art.content_uk : art.content_fr}
                  </p>

                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/80">
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-500 font-mono">Докази:</span>
                      {art.corroborating_cotes.slice(0, 3).map((cote) => (
                        <span
                          key={cote}
                          className="bg-slate-800 text-blue-300 px-1 rounded font-mono"
                        >
                          {cote}
                        </span>
                      ))}
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              );
            })}

            {filteredArticles.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                {currentLang === "uk"
                  ? "Статей за цим запитом не знайдено."
                  : "Aucun article trouvé."}
              </div>
            )}
          </div>

          {/* RIGHT: Article Deep Legal Inspector */}
          <div className="hidden md:flex flex-1 bg-[#090E1A] overflow-y-auto p-4 flex-col space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="font-mono text-sm font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {activeArticle.article}
                  </span>
                  <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {activeArticle.jurisdiction === "canton_vaud"
                      ? "Кантональне право Во (BLV)"
                      : "Федеральне право Швейцарії (RS)"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  {activeArticle.title[currentLang]}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyCitation(activeArticle)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors shadow-sm"
                  title="Скопіювати статтю для позову чи клопотання"
                >
                  {copiedId === activeArticle.id ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === activeArticle.id ? "Скопійовано!" : "Копіювати цитату"}</span>
                </button>

                {onSelectArticle && (
                  <button
                    onClick={() => {
                      onSelectArticle(activeArticle);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors"
                  >
                    Вставити в аналіз
                  </button>
                )}
              </div>
            </div>

            {/* Sanction Pill if penal */}
            {activeArticle.sanction && (
              <div className="p-2.5 bg-rose-950/30 border border-rose-800/50 rounded-lg text-xs font-mono text-rose-300 flex items-center justify-between">
                <span>Санкція за правопорушення :</span>
                <strong className="text-white">{activeArticle.sanction}</strong>
              </div>
            )}

            {/* Official French Legal Text */}
            <div className="bg-[#050810] border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] font-mono uppercase text-blue-400 font-bold block mb-1">
                Офіційний автентичний текст французькою мовою (Droit officiel CH) :
              </span>
              <p className="text-xs text-slate-200 font-serif leading-relaxed italic">
                « {activeArticle.content_fr} »
              </p>
            </div>

            {/* Ukrainian Translation */}
            <div className="bg-[#050810] border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">
                Точний український юридичний переклад :
              </span>
              <p className="text-xs text-emerald-100 font-sans leading-relaxed">
                {activeArticle.content_uk}
              </p>
            </div>

            {/* Relevance to Case PE24.014624-SBA */}
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-1.5 mb-1 text-amber-400 text-xs font-bold font-mono">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Застосування у справі Арсена Коваленка :</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {activeArticle.relevance_case[currentLang]}
              </p>
            </div>

            {/* Associated Corroborating Pieces from MemPalace */}
            <div className="p-3 bg-[#070B12] rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Пов'язані речові докази у справі (MemPalace Graph) :</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  {activeArticle.mempalace_node_id}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {activeArticle.corroborating_cotes.map((cote) => (
                  <span
                    key={cote}
                    className="px-2 py-1 bg-blue-950/60 border border-blue-700/60 rounded text-xs font-mono font-bold text-blue-300"
                  >
                    {cote}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-[#080E1B] border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-2">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Tribunal d'arrondissement de Lausanne · Ministère public du Canton de Vaud</span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
          >
            {currentLang === "uk" ? "Закрити" : "Fermer"}
          </button>
        </div>
      </div>
    </div>
  );
};
