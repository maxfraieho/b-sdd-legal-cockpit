import React from "react";
import {
  FileText,
  FolderOpen,
  Users,
  Scale,
  Brain,
  Menu,
  ShieldCheck,
} from "lucide-react";
import { WorkspaceTab } from "./Topbar";
import { SupportedLanguage } from "../types/i18n";

interface MobileBottomNavProps {
  currentTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  mobileTab: "workspace" | "inspector";
  onMobileTabChange: (tab: "workspace" | "inspector") => void;
  currentLang: SupportedLanguage;
  onOpenQuickMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  mobileTab,
  onMobileTabChange,
  currentLang,
  onOpenQuickMenu,
}) => {
  const tabs: { id: WorkspaceTab; labelUk: string; labelFr: string; labelEn: string; icon: any }[] = [
    { id: "kindle_review", labelUk: "Студія", labelFr: "Studio", labelEn: "Studio", icon: FileText },
    { id: "factbook", labelUk: "Докази", labelFr: "Preuves", labelEn: "Exhibits", icon: FolderOpen },
    { id: "actors", labelUk: "Фігуранти", labelFr: "Parties", labelEn: "Parties", icon: Users },
    { id: "pleadings", labelUk: "Секвестр", labelFr: "Requêtes", labelEn: "Pleadings", icon: Scale },
    { id: "ai_copilot", labelUk: "ШІ-Копілот", labelFr: "IA", labelEn: "AI", icon: Brain },
  ];

  return (
    <nav className="lg:hidden h-[54px] min-h-[54px] bg-[#0A0F1D]/95 backdrop-blur-md border-t border-slate-800 px-1 flex items-center justify-around select-none z-40 shrink-0 pb-safe">
      {/* 5 Primary Workspace Tabs */}
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id && mobileTab === "workspace";
        const label =
          currentLang === "uk"
            ? tab.labelUk
            : currentLang === "fr"
            ? tab.labelFr
            : tab.labelEn;

        return (
          <button
            key={tab.id}
            onClick={() => {
              onTabChange(tab.id);
              onMobileTabChange("workspace");
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-lg transition-all min-h-[44px] ${
              isActive
                ? "text-blue-400 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className={`p-1 rounded-md transition-colors ${isActive ? "bg-blue-600/20" : ""}`}>
              <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
            </div>
            <span className="text-[10px] leading-none mt-0.5 truncate max-w-[56px]">
              {label}
            </span>
          </button>
        );
      })}

      {/* Inspector Quick Switch Button */}
      <button
        onClick={() => {
          onMobileTabChange(mobileTab === "inspector" ? "workspace" : "inspector");
        }}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-lg transition-all min-h-[44px] ${
          mobileTab === "inspector"
            ? "text-amber-400 font-bold"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="Перемкнути між робочим документом та Юридичним інспектором КПК"
      >
        <div className={`p-1 rounded-md transition-colors ${mobileTab === "inspector" ? "bg-amber-500/20" : ""}`}>
          <Scale className={`w-4 h-4 ${mobileTab === "inspector" ? "text-amber-400" : "text-slate-400"}`} />
        </div>
        <span className="text-[10px] leading-none mt-0.5">
          {mobileTab === "inspector" ? "Досьє" : "Інспектор"}
        </span>
      </button>

      {/* Quick Action Drawer Trigger (Menu button with badge) */}
      <button
        onClick={onOpenQuickMenu}
        className="flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-lg text-slate-300 hover:text-white transition-all min-h-[44px] relative"
        title="Швидке меню інструментів"
      >
        <div className="p-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-200">
          <Menu className="w-4 h-4" />
        </div>
        <span className="text-[10px] leading-none mt-0.5 text-slate-300">
          {currentLang === "uk" ? "Меню" : "Menu"}
        </span>
        <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      </button>
    </nav>
  );
};
