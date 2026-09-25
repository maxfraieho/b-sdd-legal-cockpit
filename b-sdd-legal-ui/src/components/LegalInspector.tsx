import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Scale,
  Award,
  Lock,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import {
  ACTORS,
  CHARGES,
  ActorItem,
  CriminalCharge,
  resolveLocalized,
  resolveLocalizedArray,
} from "../data/legalData";

interface LegalInspectorProps {
  currentLang: SupportedLanguage;
  onSelectCharge?: (charge: CriminalCharge) => void;
  onSelectActor?: (actor: ActorItem) => void;
}

export const LegalInspector: React.FC<LegalInspectorProps> = ({
  currentLang,
  onSelectCharge,
  onSelectActor,
}) => {
  // Collapsible inspector sections
  const [openSection, setOpenSection] = useState<{
    actors: boolean;
    lawMatrix: boolean;
    radar: boolean;
    deadlines: boolean;
  }>({
    actors: true,
    deadlines: true,
    lawMatrix: true,
    radar: true,
  });

  // Selected actor for details modal/card
  const [selectedActor, setSelectedActor] = useState<ActorItem>(ACTORS[0]);

  // Live 10-Day Appeal Countdown for Art. 393 CPP
  const [appealTimeLeft, setAppealTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 8, hours: 14, minutes: 22, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setAppealTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggle = (section: keyof typeof openSection) => {
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className="h-full w-full bg-[#0B1120] flex flex-col overflow-hidden text-slate-100 select-none">
      {/* INSPECTOR TITLE BAR */}
      <div className="h-9 bg-[#070B12] border-b border-slate-800/80 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1.5">
          <Scale className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            {currentLang === 'uk' ? 'Юридичний інспектор' : 'Inspecteur Juridique (CPP)'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400">
          ● 8'746 relations
        </span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
        {/* 1. PROCEDURAL DEADLINES RADAR (SWISS CPP COMPLIANCE) */}
        <section className="p-3">
          <button
            onClick={() => toggle("deadlines")}
            className="w-full flex items-center justify-between text-xs font-mono font-bold text-slate-200 mb-2 hover:text-white"
          >
            <div className="flex items-center space-x-1.5 text-rose-400">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>{currentLang === 'uk' ? 'Строки оскарження (Art. 393 CPP)' : 'Délais de Recours (Art. 393 CPP)'}</span>
            </div>
            {openSection.deadlines ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openSection.deadlines && (
            <div className="space-y-2">
              {/* High-Visibility 10-Day Appeal Countdown */}
              <div className="p-2.5 bg-rose-950/30 border border-rose-600/50 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                    Délai de recours strict (10 jours) :
                  </span>
                  <span className="text-[10px] font-mono text-rose-300">
                    Art. 396 al. 1 CPP
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1 text-center font-mono">
                  <div className="bg-[#070B12] p-1.5 rounded border border-rose-900/60">
                    <span className="text-base font-bold text-rose-300 tabular-nums">
                      {appealTimeLeft.days}j
                    </span>
                    <span className="block text-[8px] text-slate-400 uppercase">Jours</span>
                  </div>
                  <div className="bg-[#070B12] p-1.5 rounded border border-rose-900/60">
                    <span className="text-base font-bold text-rose-300 tabular-nums">
                      {String(appealTimeLeft.hours).padStart(2, '0')}h
                    </span>
                    <span className="block text-[8px] text-slate-400 uppercase">Heures</span>
                  </div>
                  <div className="bg-[#070B12] p-1.5 rounded border border-rose-900/60">
                    <span className="text-base font-bold text-rose-300 tabular-nums">
                      {String(appealTimeLeft.minutes).padStart(2, '0')}m
                    </span>
                    <span className="block text-[8px] text-slate-400 uppercase">Min</span>
                  </div>
                  <div className="bg-[#070B12] p-1.5 rounded border border-rose-900/60">
                    <span className="text-base font-bold text-rose-400 tabular-nums animate-pulse">
                      {String(appealTimeLeft.seconds).padStart(2, '0')}s
                    </span>
                    <span className="block text-[8px] text-slate-400 uppercase">Sec</span>
                  </div>
                </div>

                <p className="text-[10px] text-rose-300/80 mt-1.5 font-sans leading-tight">
                  {currentLang === 'uk'
                    ? '10-денний присічний строк на оскарження постанов прокурора до Кантонального суду Во.'
                    : 'Délai de rigueur de 10 jours pour déférer les ordonnances du MP devant la Chambre des recours pénale.'}
                </p>
              </div>

              {/* Other statutory limits */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <div className="p-2 bg-[#070B12] rounded border border-slate-800">
                  <span className="text-slate-500 block">Art. 97 CP Prescription:</span>
                  <span className="text-emerald-400 font-bold">15 ans (2039)</span>
                </div>
                <div className="p-2 bg-[#070B12] rounded border border-slate-800">
                  <span className="text-slate-500 block">Art. 318 CPP Clôture:</span>
                  <span className="text-amber-400 font-bold">Instruction active</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 2. CAST OF CHARACTERS (RELATIVITY CASE DYNAMICS PATTERN) */}
        <section className="p-3">
          <button
            onClick={() => toggle("actors")}
            className="w-full flex items-center justify-between text-xs font-mono font-bold text-slate-200 mb-2 hover:text-white"
          >
            <span>{currentLang === 'uk' ? 'Сторони справи (Cast of Characters)' : 'Acteurs & Statuts Procéduraux'}</span>
            {openSection.actors ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openSection.actors && (
            <div className="space-y-2">
              {ACTORS.map((actor) => {
                const isSelected = selectedActor.id === actor.id;
                return (
                  <div
                    key={actor.id}
                    onClick={() => {
                      setSelectedActor(actor);
                      if (onSelectActor) onSelectActor(actor);
                    }}
                    className={`p-2.5 rounded border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0F1A2E] border-blue-600/80 shadow-md"
                        : "bg-[#070B12] hover:bg-slate-900 border-slate-800/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{actor.name}</span>
                          {actor.age && (
                            <span className="text-[10px] font-mono text-emerald-400 font-normal">
                              ({actor.age} ans, né le {actor.birthdate})
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {actor.legal_reference}
                        </span>
                      </div>

                      {/* IMMUTABLE BADGES (L-03 & L-04) */}
                      {actor.protected_bona_fide ? (
                        <div className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/70 text-amber-300 rounded text-[10px] font-mono font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(212,175,55,0.25)] shrink-0">
                          <Award className="w-3 h-3 text-amber-400" />
                          <span>PROTÉGÉ (Art. 933 CC)</span>
                        </div>
                      ) : actor.id === "ACT-ARSEN-KOVALENKO" ? (
                        <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/60 text-emerald-300 rounded text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>VICTIME ADULTE</span>
                        </div>
                      ) : (
                        <div className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-800/60 text-rose-300 rounded text-[10px] font-mono font-bold shrink-0">
                          PRÉVENUE
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed line-clamp-2">
                      {resolveLocalized(actor.role, currentLang)}
                    </p>

                    {actor.protected_bona_fide && (
                      <div className="mt-1.5 p-1.5 bg-amber-950/30 border border-amber-500/30 rounded text-[10px] font-mono text-amber-300 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Toute action accusatoire strictement forclose (L-03)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. SWISS CRIMINAL LAW MATRIX (CP / CPP) */}
        <section className="p-3">
          <button
            onClick={() => toggle("lawMatrix")}
            className="w-full flex items-center justify-between text-xs font-mono font-bold text-slate-200 mb-2 hover:text-white"
          >
            <span>{currentLang === 'uk' ? 'Склади злочинів (CP / CPP Matrix)' : 'Matrice Pénale (CP / CPP)'}</span>
            {openSection.lawMatrix ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openSection.lawMatrix && (
            <div className="space-y-1.5">
              {CHARGES.map((charge) => (
                <div
                  key={charge.id}
                  onClick={() => {
                    if (onSelectCharge) onSelectCharge(charge);
                  }}
                  className="p-2 bg-[#070B12] hover:bg-slate-900 border border-slate-800/80 rounded transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {charge.code}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1 py-0.2 rounded">
                      Corroboré
                    </span>
                  </div>

                  <h5 className="text-[11px] font-semibold text-slate-200 leading-snug">
                    {resolveLocalized(charge.title, currentLang)}
                  </h5>

                  <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Auteur: {charge.accused}</span>
                    <div className="flex gap-1">
                      {charge.supporting_cotes.map((cote) => (
                        <span key={cote} className="bg-slate-800 text-blue-300 px-1 rounded">
                          {cote}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. MEMPALACE KNOWLEDGE GRAPH & BLAST RADIUS RADAR */}
        <section className="p-3">
          <button
            onClick={() => toggle("radar")}
            className="w-full flex items-center justify-between text-xs font-mono font-bold text-slate-200 mb-2 hover:text-white"
          >
            <div className="flex items-center space-x-1.5 text-blue-400">
              <Layers className="w-3.5 h-3.5" />
              <span>MemPalace Blast Radius Radar</span>
            </div>
            {openSection.radar ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openSection.radar && (
            <div className="p-2.5 bg-[#070B12] border border-slate-800 rounded space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">KùzuDB Relations :</span>
                <strong className="text-emerald-400">8'746 arêtes</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Entités Procédurales :</span>
                <strong className="text-slate-200">412 nœuds</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Chapitres ED10 Impactés :</span>
                <strong className="text-amber-400">18 / 18 synchronisés</strong>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-sans">
                Toute modification d'un fait déclenche la réévaluation automatique du graphe de causalité et met à jour les chapitres correspondants dans le WORM Ledger.
              </div>
            </div>
          )}
        </section>
      </div>
    </aside>
  );
};
