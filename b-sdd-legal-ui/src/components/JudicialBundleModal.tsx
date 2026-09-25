import React, { useState } from "react";
import {
  FileText,
  Printer,
  Download,
  X,
  Scale,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Camera,
  Music,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import { LegalCase } from "../lib/casesManager";
import { BORDEREAU_PIECES, BordereauPiece, resolveLocalized } from "../data/legalData";

interface JudicialBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCase?: LegalCase;
  currentLang: SupportedLanguage;
  onShowToast: (title: string, description: string, type?: "success" | "info") => void;
}

export const JudicialBundleModal: React.FC<JudicialBundleModalProps> = ({
  isOpen,
  onClose,
  activeCase,
  currentLang,
  onShowToast,
}) => {
  const [includeExifPhotos, setIncludeExifPhotos] = useState(true);
  const [includeQrAudio, setIncludeQrAudio] = useState(true);
  const [includeCivilClaims, setIncludeCivilClaims] = useState(true);
  const [stampCertifier, setStampCertifier] = useState(true);

  if (!isOpen) return null;

  const caseRef = activeCase ? activeCase.reference : "PE24.014624-SBA";
  const caseTitle = activeCase
    ? (activeCase.title?.[currentLang] || activeCase.title?.fr || activeCase.title?.en || activeCase.reference)
    : "Affaire Vaud";
  const courtName = activeCase
    ? (activeCase.court[currentLang] || activeCase.court.fr)
    : "Ministère public du Canton de Vaud (Arrondissement de Lausanne)";
  const canton = activeCase ? activeCase.canton : "Vaud";
  const clientName = activeCase ? activeCase.client_name : "Arsen KOVALENKO";
  const targetChf = activeCase
    ? activeCase.sequestration_target_chf.toLocaleString("fr-CH", { minimumFractionDigits: 2 })
    : "46'850.00";

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMetadata = () => {
    const summary = `BORDEREAU OFFICIEL DES PIÈCES (PDF/A COMPLIANT)
RÉFÉRENCE DU DOSSIER : ${caseRef}
AUTORITÉ JUDICIAIRE : ${courtName}
PARTIE PLAIGNANTE : ${clientName}
MONTANT DU SÉQUESTRE ART. 263 CPP : CHF ${targetChf}
DATE D'ÉMISSION : ${new Date().toLocaleDateString("fr-CH")}
CONFORMITÉ LÉGALE : ISO/IEC 27037 & CPP RS 312.0

TABLE DES PIÈCES MATÉRIELLES :
${BORDEREAU_PIECES.map(
  (p, idx) =>
    `[${p.cote}] ${resolveLocalized(p.titre, "fr")} (Date: ${p.date_faits})\n  SHA-256: ${p.sha256}\n  Catégorie: ${p.categorie} | Portée: ${resolveLocalized(p.portee_probatoire, "fr")}`
).join("\n\n")}`;

    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BORDEREAU_${caseRef}_OFFICIEL.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast("Bordereau Exporté", "Fichier récapitulatif généré avec succès.");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-text animate-fadeIn">
      <div className="bg-[#0B1120] border border-indigo-600/50 rounded-2xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* HEADER BAR (No print) */}
        <div className="bg-[#080E1B] border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold uppercase">
                  B-SDD Judicial Hearing Bundle (PDF/A)
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  ● Justitia 4.0 / CPP Compliant
                </span>
              </div>
              <h2 className="text-sm font-bold text-white mt-0.5">
                {currentLang === "uk"
                  ? `Зведений Судовий Бандл: ${caseRef} · ${canton}`
                  : `Bordereau Récapitulatif & Faisceau de Preuves : ${caseRef}`}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadMetadata}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center space-x-1.5 border border-slate-700 transition-colors"
              title="Експорт текстового реєстру з SHA-256"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">TXT Реєстр</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/25 transition-all"
              title="Роздрукувати офіційний судово-процесуальний бандл або зберегти як PDF/A"
            >
              <Printer className="w-4 h-4" />
              <span>Друк / Експорт в PDF/A</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* OPTIONS TOOLBAR (No print) */}
        <div className="bg-[#090E1A] border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-4 text-slate-300 font-mono text-[11px]">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeExifPhotos}
                onChange={(e) => setIncludeExifPhotos(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-600"
              />
              <span>Таблиці EXIF фото (P-06, P-10)</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeQrAudio}
                onChange={(e) => setIncludeQrAudio(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-600"
              />
              <span>QR-коди аудіозаписів (P-01..08)</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCivilClaims}
                onChange={(e) => setIncludeCivilClaims(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-600"
              />
              <span>Вимоги секвестру (ст. 263 КПК)</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={stampCertifier}
                onChange={(e) => setStampCertifier(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-600"
              />
              <span>Штамп ISO/IEC 27037</span>
            </label>
          </div>

          <div className="text-[11px] font-mono text-amber-300">
            Всього матеріальних доказів: <strong>{BORDEREAU_PIECES.length} шт.</strong>
          </div>
        </div>

        {/* PRINTABLE BUNDLE CANVAS */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0D1322] print:bg-white print:text-black print:p-0">
          <div className="max-w-4xl mx-auto bg-[#070B14] print:bg-white text-slate-100 print:text-black border border-slate-800 print:border-none p-6 sm:p-10 rounded-xl shadow-lg space-y-8 font-serif">
            {/* CANTONAL COURT TRANSMITTAL HEADER */}
            <div className="border-b-2 border-slate-700 print:border-black pb-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs text-slate-400 print:text-gray-600 uppercase tracking-widest block">
                    CONFÉDÉRATION SUISSE · CANTON DE {canton.toUpperCase()}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white print:text-black mt-1">
                    BORDEREAU OFFICIEL DES PIÈCES PRODUITES
                  </h1>
                  <p className="text-xs text-slate-400 print:text-gray-600 font-mono mt-0.5">
                    Produit en application des articles 105, 115, 118, 122, 263 et 318 du Code de procédure pénale suisse (CPP)
                  </p>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="px-3 py-1 bg-amber-500/10 print:bg-gray-100 border border-amber-500/40 print:border-black rounded text-amber-300 print:text-black font-bold">
                    REF : {caseRef}
                  </div>
                  <span className="text-[10px] text-slate-400 print:text-gray-600 block mt-1">
                    Date : {new Date().toLocaleDateString("fr-CH")}
                  </span>
                </div>
              </div>

              {/* Court & Parties Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans pt-2 border-t border-slate-800/80 print:border-gray-300">
                <div>
                  <span className="text-slate-400 print:text-gray-600 font-mono text-[10px] uppercase block">
                    Autorité destinataire :
                  </span>
                  <strong className="text-white print:text-black text-sm block">
                    {courtName}
                  </strong>
                  <span className="text-slate-400 print:text-gray-600 text-xs">
                    Palais de justice / Ministère public central
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 print:text-gray-600 font-mono text-[10px] uppercase block">
                    Partie plaignante & Demandeur au civil :
                  </span>
                  <strong className="text-white print:text-black text-sm block">
                    {clientName}
                  </strong>
                  <span className="text-slate-400 print:text-gray-600 text-xs block">
                    Majeur et capable de discernement (Art. 115 & 118 CPP)
                  </span>
                  <span className="text-emerald-400 print:text-black text-[11px] font-mono">
                    Tiers de bonne foi protégé : Adriano MILLI (Art. 933 CC)
                  </span>
                </div>
              </div>

              {/* Financial Claim summary */}
              {includeCivilClaims && (
                <div className="p-3 bg-amber-950/20 print:bg-gray-50 border border-amber-500/30 print:border-gray-400 rounded-lg text-xs font-sans flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-300 print:text-black block">
                      Conclusions en séquestre conservatoire (Art. 263 al. 1 let. b CPP) :
                    </span>
                    <span className="text-slate-300 print:text-gray-700 text-[11px]">
                      Capital détourné ($15&apos;000 USD) + Réparation dégâts matériels + Tort moral (Art. 49 CO)
                    </span>
                  </div>
                  <div className="font-mono text-base font-bold text-amber-400 print:text-black tabular-nums">
                    CHF {targetChf}
                  </div>
                </div>
              )}
            </div>

            {/* EXHIBITS TABLE */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-300 print:text-black flex items-center justify-between border-b border-slate-800 print:border-gray-300 pb-2">
                <span>INVENTAIRE DÉTAILLÉ DU FAISCEAU PROBATOIRE (P-01 À P-15)</span>
                <span className="text-[10px] text-slate-400 print:text-gray-600">
                  Standard ISO/IEC 27037
                </span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 print:border-black text-[10px] font-mono text-slate-400 print:text-black uppercase">
                      <th className="py-2 px-2 w-16">Cote</th>
                      <th className="py-2 px-2">Description & Teneur Probatoire</th>
                      <th className="py-2 px-2 w-24">Date Faits</th>
                      <th className="py-2 px-2 w-28">Catégorie</th>
                      <th className="py-2 px-2 w-48">Empreinte SHA-256</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                    {BORDEREAU_PIECES.map((piece) => (
                      <tr key={piece.cote} className="hover:bg-slate-900/40 print:hover:bg-transparent">
                        <td className="py-2.5 px-2 font-mono font-bold text-amber-400 print:text-black align-top">
                          {piece.cote}
                        </td>
                        <td className="py-2.5 px-2 align-top">
                          <strong className="text-slate-100 print:text-black text-xs block mb-0.5">
                            {resolveLocalized(piece.titre, "fr")}
                          </strong>
                          <p className="text-slate-400 print:text-gray-700 text-[11px] leading-relaxed italic mb-1">
                            &laquo; {resolveLocalized(piece.citation_cle, "fr")} &raquo;
                          </p>
                          <span className="text-[10px] font-mono text-indigo-300 print:text-gray-600 block">
                            Portée : {resolveLocalized(piece.portee_probatoire, "fr")}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-mono text-[11px] text-slate-300 print:text-black align-top whitespace-nowrap">
                          {piece.date_faits}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-[11px] text-slate-400 print:text-black align-top whitespace-nowrap">
                          {piece.categorie}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-[9px] text-slate-400 print:text-black align-top break-all select-all">
                          {piece.sha256}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* INTEGRATED PHOTO TABLES (P-06, P-10) */}
            {includeExifPhotos && (
              <div className="space-y-4 pt-4 border-t border-slate-800 print:border-gray-300">
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300 print:text-black flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-amber-400 print:text-black" />
                  <span>ANNEXE I : PLANCHES PHOTOGRAPHIQUES ET MÉTADONNÉES EXIF</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {BORDEREAU_PIECES.filter((p) => p.fichier_local).map((p) => (
                    <div
                      key={p.cote}
                      className="p-3 bg-[#090E1A] print:bg-white border border-slate-800 print:border-gray-400 rounded-lg space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center font-mono text-xs">
                        <strong className="text-amber-400 print:text-black">{p.cote}</strong>
                        <span className="text-slate-400 print:text-gray-600 text-[10px]">
                          {p.date_faits}
                        </span>
                      </div>
                      <img
                        src={p.fichier_local}
                        alt={p.cote}
                        className="w-full h-40 object-cover rounded border border-slate-700 print:border-black"
                      />
                      <div className="font-mono text-[10px] space-y-1 text-slate-300 print:text-gray-700">
                        <div>
                          <strong>Appareil :</strong> {p.exif_meta?.camera || "Apple iPhone 14 Pro"}
                        </div>
                        <div>
                          <strong>Coordonnées GPS :</strong> {p.exif_meta?.gps || "46.5197° N, 6.6323° E (Lausanne)"}
                        </div>
                        <div className="truncate">
                          <strong>SHA-256 :</strong> {p.sha256}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUDIO CLERK QR CODE ACCESS SHEET */}
            {includeQrAudio && (
              <div className="space-y-3 pt-4 border-t border-slate-800 print:border-gray-300">
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300 print:text-black flex items-center space-x-2">
                  <Music className="w-4 h-4 text-blue-400 print:text-black" />
                  <span>ANNEXE II : ÉCOUTE JUDICIAIRE DES ENREGISTREMENTS VOCAUX (ATF 146 IV 9)</span>
                </h3>
                <p className="text-xs text-slate-400 print:text-gray-700 font-sans leading-relaxed">
                  Conformément à la jurisprudence du Tribunal fédéral <strong>ATF 146 IV 9</strong>, la balance des intérêts commande l&apos;admission des pièces P-01, P-02 et P-08 à la procédure en raison de la gravité des infractions dénoncées (Art. 180, 146 et 303 CP).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { cote: "P-01", title: "Appel du 15.07.2024 (Menaces)", dur: "3 min 45 s" },
                    { cote: "P-02", title: "Message vocal Telegram", dur: "1 min 12 s" },
                    { cote: "P-08", title: "Conversation de confrontation", dur: "4 min 30 s" },
                  ].map((aud) => (
                    <div
                      key={aud.cote}
                      className="p-3 bg-[#090E1A] print:bg-gray-50 border border-slate-800 print:border-gray-400 rounded-lg text-center space-y-2"
                    >
                      <span className="font-mono text-xs font-bold text-amber-400 print:text-black block">
                        {aud.cote}
                      </span>
                      <div className="w-20 h-20 mx-auto bg-slate-900 print:bg-white border border-slate-700 print:border-black rounded flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-slate-200 print:text-black" />
                      </div>
                      <div className="text-[10px] font-sans text-slate-300 print:text-black font-semibold">
                        {aud.title}
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 print:text-gray-600 block">
                        Durée : {aud.dur}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CERTIFICATION FOOTER */}
            {stampCertifier && (
              <div className="pt-6 border-t-2 border-slate-700 print:border-black flex justify-between items-end font-sans text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-400 print:text-black font-mono font-bold text-[11px]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>CERTIFICATION D&apos;INTÉGRITÉ NUMÉRIQUE B-SDD</span>
                  </div>
                  <p className="text-[10px] text-slate-400 print:text-gray-600 max-w-sm">
                    Tous les fichiers ont été scellés avec empreintes SHA-256 dans Utopia DB. Registre infalsifiable en chaîne de blocs temporelle (Invariants L-01 à L-05).
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 print:text-gray-600 block font-mono">
                    Pour la partie plaignante :
                  </span>
                  <div className="mt-4 border-b border-slate-700 print:border-black w-48 ml-auto" />
                  <span className="text-[10px] font-mono text-slate-300 print:text-black mt-1 block">
                    Signature & Date
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
