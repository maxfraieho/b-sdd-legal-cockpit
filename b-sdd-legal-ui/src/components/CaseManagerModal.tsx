import React, { useState } from "react";
import {
  FolderOpen,
  Plus,
  Scale,
  Trash2,
  Archive,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  X,
  FileText,
  Building2,
  DollarSign,
  Download,
  Upload,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import {
  LegalCase,
  BENCHMARK_CASE_ID,
  CaseType,
  createNewCase,
  deleteCase,
  updateCase,
} from "../lib/casesManager";

interface CaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: LegalCase[];
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  onCasesUpdated: (updated: LegalCase[]) => void;
  currentLang: SupportedLanguage;
  onShowToast: (title: string, description: string, type?: "success" | "info") => void;
}

export const CaseManagerModal: React.FC<CaseManagerModalProps> = ({
  isOpen,
  onClose,
  cases,
  activeCaseId,
  onSelectCase,
  onCasesUpdated,
  currentLang,
  onShowToast,
}) => {
  const [isCreating, setIsCreating] = useState(false);

  // New Case Form State
  const [newReference, setNewReference] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCourt, setNewCourt] = useState("");
  const [newCanton, setNewCanton] = useState("Vaud");
  const [newType, setNewType] = useState<CaseType>("penal");
  const [newClientName, setNewClientName] = useState("");
  const [newClientRole, setNewClientRole] = useState("Partie plaignante / Demandeur");
  const [newDescription, setNewDescription] = useState("");
  const [newTargetChf, setNewTargetChf] = useState<number>(0);

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReference.trim() || !newTitle.trim() || !newClientName.trim()) {
      alert("Veuillez renseigner au minimum la référence, le titre et le nom du client.");
      return;
    }

    const created = createNewCase({
      reference: newReference.trim(),
      title: { uk: newTitle.trim(), fr: newTitle.trim(), en: newTitle.trim() },
      court: { uk: newCourt.trim() || "Tribunal cantonal", fr: newCourt.trim() || "Tribunal cantonal", en: newCourt.trim() || "Cantonal Court" },
      canton: newCanton,
      type: newType,
      client_name: newClientName.trim(),
      client_role: { uk: newClientRole.trim(), fr: newClientRole.trim(), en: newClientRole.trim() },
      status: "active",
      description: { uk: newDescription.trim(), fr: newDescription.trim(), en: newDescription.trim() },
      sequestration_target_chf: newTargetChf,
    });

    onCasesUpdated([created, ...cases]);
    onSelectCase(created.id);
    setIsCreating(false);

    // Reset fields
    setNewReference("");
    setNewTitle("");
    setNewCourt("");
    setNewClientName("");
    setNewDescription("");
    setNewTargetChf(0);

    onShowToast(
      currentLang === "uk" ? "Нову справу створено" : "Nouveau dossier créé",
      `${created.reference} · ${created.client_name}`
    );
  };

  const handleDelete = (caseId: string) => {
    if (caseId === BENCHMARK_CASE_ID) {
      alert(currentLang === "uk" ? "Еталонну справу PE24.014624-SBA не можна видаляти (Інваріант L-01)." : "Impossible de supprimer le dossier étalon PE24.014624-SBA.");
      return;
    }

    if (confirm(currentLang === "uk" ? "Ви дійсно бажаєте видалити цю юридичну справу та всі її ізольовані матеріали?" : "Confirmer la suppression définitive de ce dossier ?")) {
      const res = deleteCase(caseId);
      if (res.success) {
        onCasesUpdated(res.remaining);
        onShowToast(
          currentLang === "uk" ? "Справу видалено" : "Dossier supprimé",
          `ID: ${caseId}`
        );
      }
    }
  };

  const handleToggleArchive = (caseItem: LegalCase) => {
    const updated = updateCase({
      ...caseItem,
      status: caseItem.status === "archived" ? "active" : "archived",
    });
    onCasesUpdated(updated);
    onShowToast(
      caseItem.status === "archived" ? "Dossier réactivé" : "Dossier archivé",
      caseItem.reference
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn select-text">
      <div className="bg-[#0B1120] border border-blue-600/50 rounded-2xl max-w-4xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#080E1B] border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold uppercase">
                  Multi-Dossiers · B-SDD ADR-011
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {cases.length} dossiers au registre
                </span>
              </div>
              <h2 className="text-sm font-bold text-white mt-0.5">
                {currentLang === "uk" ? "Менеджер юридичних справ та досьє адвоката" : "Gestionnaire de Dossiers Juridiques (Multi-Tenancy)"}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold flex items-center space-x-1 shadow-md shadow-blue-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{currentLang === "uk" ? "+ Нова справа" : "+ Nouveau dossier"}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* ========================================================================= */}
          {/* CREATE NEW CASE FORM                                                      */}
          {/* ========================================================================= */}
          {isCreating ? (
            <form onSubmit={handleCreateSubmit} className="space-y-4 max-w-2xl mx-auto bg-[#090E1A] p-5 rounded-2xl border border-blue-600/40">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white font-mono uppercase">
                  {currentLang === "uk" ? "Створення нового судового досьє" : "Création d'un Nouveau Dossier"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-white font-mono"
                >
                  ← {currentLang === "uk" ? "Назад до списку" : "Retour"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Номер / Референс справи * :</label>
                  <input
                    type="text"
                    required
                    value={newReference}
                    onChange={(e) => setNewReference(e.target.value)}
                    placeholder="Ex: PE25.099120-ABC"
                    className="w-full bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Кантон юрисдикції :</label>
                  <select
                    value={newCanton}
                    onChange={(e) => setNewCanton(e.target.value)}
                    className="w-full bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                  >
                    <option value="Vaud">Vaud (VD)</option>
                    <option value="Genève">Genève (GE)</option>
                    <option value="Zurich">Zurich (ZH)</option>
                    <option value="Berne">Berne (BE)</option>
                    <option value="Valais">Valais (VS)</option>
                    <option value="Fribourg">Fribourg (FR)</option>
                    <option value="Neuchâtel">Neuchâtel (NE)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Назва справи / Короткий заголовок * :</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Affaire X c/ Y (Escroquerie)"
                    className="w-full bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-white font-sans focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Тип судочинства :</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as CaseType)}
                    className="w-full bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                  >
                    <option value="penal">Кримінальне (Pénal / CPP)</option>
                    <option value="civil">Цивільне (Civil / CPC)</option>
                    <option value="administrative">Адміністративне (Droit administratif)</option>
                    <option value="arbitration">Арбітраж (Arbitrage)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Судовий орган / Прокуратура :</label>
                  <input
                    type="text"
                    value={newCourt}
                    onChange={(e) => setNewCourt(e.target.value)}
                    placeholder="Ex: Ministère public de l'arrondissement..."
                    className="w-full bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-white font-sans focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Клієнт / Довіритель * :</label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Ex: Jean DUPONT"
                    className="w-full bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-white font-sans focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Процесуальний статус клієнта :</label>
                  <input
                    type="text"
                    value={newClientRole}
                    onChange={(e) => setNewClientRole(e.target.value)}
                    placeholder="Ex: Partie plaignante / Demandeur"
                    className="w-full bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-white font-sans focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Цільова сума забезпечення (CHF) :</label>
                  <input
                    type="number"
                    value={newTargetChf}
                    onChange={(e) => setNewTargetChf(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-slate-300 font-mono mb-1">Фабула справи / Опис :</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Короткий опис обставин справи, вимог та предмета спору..."
                  className="w-full bg-[#050810] border border-slate-700 rounded-lg p-3 text-white font-sans focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold shadow-md shadow-blue-600/30"
                >
                  Створити справу та відкрити →
                </button>
              </div>
            </form>
          ) : (
            /* ========================================================================= */
            /* CASES LIST                                                                */
            /* ========================================================================= */
            <div className="space-y-3">
              {cases.map((c) => {
                const isActive = c.id === activeCaseId;
                return (
                  <div
                    key={c.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? "bg-[#0E172A] border-blue-500 shadow-lg shadow-blue-900/20"
                        : "bg-[#090E1A] hover:bg-slate-900 border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                            {c.reference}
                          </span>
                          <span className="text-xs font-mono text-amber-300">
                            Кантон {c.canton}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                            {c.type}
                          </span>
                          {c.is_benchmark && (
                            <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-300 border border-amber-500/60 rounded text-[9px] font-mono font-bold flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3 text-amber-400" />
                              <span>Еталон L-01..L-05</span>
                            </span>
                          )}
                          {c.status === "archived" && (
                            <span className="px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded text-[9px] font-mono">
                              Архів
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-white font-sans mt-1">
                          {c.title[currentLang] || c.title.fr}
                        </h3>

                        <div className="text-xs font-mono text-slate-400 mt-0.5">
                          {c.court[currentLang] || c.court.fr} · Клієнт: <strong className="text-slate-200">{c.client_name}</strong>
                        </div>
                      </div>

                      {/* Right buttons */}
                      <div className="flex items-center space-x-2 shrink-0">
                        {isActive ? (
                          <div className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 rounded-lg text-xs font-mono font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Активне досьє</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectCase(c.id);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold shadow-md shadow-blue-600/20"
                          >
                            Відкрити справу
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleArchive(c)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs transition-colors"
                          title={c.status === "archived" ? "Розархівувати" : "Архівувати"}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>

                        {!c.is_benchmark && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 rounded-lg text-xs border border-rose-900/60 transition-colors"
                            title="Видалити справу"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-2">
                      {c.description[currentLang] || c.description.fr}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 mt-2 border-t border-slate-800/80">
                      <span>Створено: {new Date(c.created_at).toLocaleDateString()}</span>
                      {c.sequestration_target_chf ? (
                        <span className="text-emerald-400 font-bold">
                          Забезпечення: CHF {c.sequestration_target_chf.toLocaleString("fr-CH", { minimumFractionDigits: 2 })}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
