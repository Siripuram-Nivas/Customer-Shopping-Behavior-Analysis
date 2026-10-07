import React from "react";
import {
  Home,
  Database,
  BookOpen,
  Filter,
  BarChart3,
  Cpu,
  FlaskConical,
  Sparkles,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

export type NavTab =
  | "home"
  | "dashboard"
  | "data-center"
  | "data-understanding"
  | "data-preparation"
  | "statistics-eda"
  | "feature-engineering"
  | "model-lab"
  | "live-prediction";

interface ClaySidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onToggleMobile: () => void;
}

export const ClaySidebar: React.FC<ClaySidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onToggleMobile,
}) => {
  const navItems: Array<{ id: NavTab; label: string; icon: React.ElementType; section?: string }> = [
    { section: "OVERVIEW", id: "home", label: "Home", icon: Home },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { section: "DATA", id: "data-center", label: "Data Center", icon: Database },
    { id: "data-understanding", label: "Data Understanding", icon: BookOpen },
    { id: "data-preparation", label: "Data Preparation", icon: Filter },
    { section: "ANALYTICS & EDA", id: "statistics-eda", label: "Statistics & EDA", icon: BarChart3 },
    { section: "MACHINE LEARNING", id: "feature-engineering", label: "Feature Engineering", icon: Cpu },
    { id: "model-lab", label: "Model Lab", icon: FlaskConical },
    { id: "live-prediction", label: "Live Prediction", icon: Sparkles },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onToggleMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#ECE7DE] border-r border-[#E0D7C9] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="p-6 border-b border-[#E0D7C9]/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6B6B] flex items-center justify-center text-white shadow-md">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight text-[#1E293B] font-heading leading-tight">
                SHOPPING ANALYSIS
              </h2>
              <span className="text-[11px] font-semibold text-[#64748B] tracking-wider uppercase">
                Data Science Platform
              </span>
            </div>
          </div>
          <button
            onClick={onToggleMobile}
            className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:bg-[#E2DDD3]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <React.Fragment key={item.id}>
                {item.section && (
                  <div
                    className={`text-[10px] font-bold text-[#8C7E6A] uppercase tracking-wider px-3 ${
                      idx === 0 ? "mb-1" : "mt-5 mb-1"
                    }`}
                  >
                    {item.section}
                  </div>
                )}
                <button
                  onClick={() => {
                    onSelectTab(item.id);
                    if (isOpenMobile) onToggleMobile();
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 text-left ${
                    isActive
                      ? "bg-[#FAF8F5] text-[#FF6B6B] shadow-sm font-bold border border-white"
                      : "text-[#475569] hover:bg-[#E4DED4] hover:text-[#1E293B]"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-[#FF6B6B]" : "text-[#64748B]"} />
                  <span className="truncate">{item.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Footer — clean, no technical branding */}
        <div className="p-4 border-t border-[#E0D7C9]/60 bg-[#E6E1D7]/50">
          <p className="text-[10px] text-[#8C7E6A] font-medium">
            Analytical scope: Full Dataset Features
          </p>
          <p className="text-[10px] text-[#A8957C] mt-0.5">
            Notebook-driven KPIs & Analysis
          </p>
        </div>
      </aside>
    </>
  );
};
