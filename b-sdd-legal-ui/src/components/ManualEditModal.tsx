// =========================================================================
// B-SDD LEGAL COCKPIT · ДІАЛОГ РУЧНОГО РЕДАГУВАННЯ ТА ШІ-ПЕРЕКЛАДУ (MANUAL EDIT MODAL)
// Дозволяє юристу звіряти французький оригінал, генерувати ШІ-переклад та вносити правки
// =========================================================================

import React, { useState, useEffect } from 'react';
import { SupportedLanguage } from '../types/i18n';
import { translateWithLLM } from '../lib/translator';
import { AppSettings } from '../types/i18n';
import { X, Sparkles, Check, RotateCcw, Edit3, FileText, AlertCircle, RefreshCw } from 'lucide-react';

interface ManualEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetKey: string;
  fieldLabel: string;
  sourceFrenchText: string;
  currentTranslation: string;
  targetLang: SupportedLanguage;
  settings: AppSettings;
  onSaveOverride: (key: string, value: string) => void;
  onResetOverride: (key: string) => void;
}

export const ManualEditModal: React.FC<ManualEditModalProps> = ({
  isOpen,
  onClose,
  targetKey,
  fieldLabel,
  sourceFrenchText,
  currentTranslation,
  targetLang,
  settings,
  onSaveOverride,
  onResetOverride,
}) => {
  const [editText, setEditText] = useState(currentTranslation);
  const [isTranslating, setIsTranslating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    setEditText(currentTranslation);
    setAiError(null);
  }, [currentTranslation, isOpen]);

  if (!isOpen) return null;

  const handleAiTranslate = async () => {
    if (!sourceFrenchText.trim()) return;
    setIsTranslating(true);
    setAiError(null);

    const res = await translateWithLLM(sourceFrenchText, targetLang, settings);
    setIsTranslating(false);

    if (res.error) {
      setAiError(res.error);
    } else {
      setEditText(res.text);
    }
  };

  const handleSave = () => {
    onSaveOverride(targetKey, editText.trim());
    onClose();
  };

  const handleReset = () => {
    onResetOverride(targetKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Ручне редагування судового тексту</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                  {targetLang.toUpperCase()}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Поле: {fieldLabel} ({targetKey})
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

        {/* Body */}
        <div className="p-6 space-y-4 text-xs sm:text-sm">
          {/* French Original (Swiss Judicial Reference) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Оригінальний процесуальний текст (Français suisse · CPP Vaud) :</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Офіційний текст справи</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs leading-relaxed max-h-32 overflow-y-auto">
              {sourceFrenchText || '(Текст французького оригіналу відсутній)'}
            </div>
          </div>

          {/* AI Helper Bar */}
          <div className="flex items-center justify-between bg-blue-950/30 border border-blue-900/40 p-2.5 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-blue-300">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>ШІ-переклад через проксі ({settings.llmModel.split('/').pop()}):</span>
            </div>
            <button
              type="button"
              onClick={handleAiTranslate}
              disabled={isTranslating || !sourceFrenchText.trim()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isTranslating ? 'animate-spin' : ''}`} />
              <span>{isTranslating ? 'Переклад...' : 'Перекласти через LLM'}</span>
            </button>
          </div>

          {aiError && (
            <div className="p-2.5 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {/* Editable Translation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Переклад для відображення ({targetLang === 'uk' ? 'Українська' : targetLang === 'fr' ? 'Français' : 'English'}) :
              </label>
              <span className="text-[10px] text-amber-400 font-mono">Ручна правка юриста</span>
            </div>
            <textarea
              rows={5}
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-sans text-xs sm:text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Введіть або скоригуйте переклад..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Скинути до оригіналу</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Скасувати
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-blue-900/30 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Зберегти виправлення</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
