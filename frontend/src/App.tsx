import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { ClaySidebar, NavTab } from "./components/clay/ClaySidebar";
import { HomePage } from "./pages/HomePage";
import { DataCenterPage } from "./pages/DataCenterPage";
import { DataUnderstandingPage } from "./pages/DataUnderstandingPage";
import { DataPrepPage } from "./pages/DataPrepPage";
import { StatisticsEDAPage } from "./pages/StatisticsEDAPage";
import { FeatureEngineeringPage } from "./pages/FeatureEngineeringPage";
import { ModelLabPage } from "./pages/ModelLabPage";
import { LivePredictionPage } from "./pages/LivePredictionPage";
import { DashboardPage } from "./pages/DashboardPage";
import { fetchHealth } from "./services/api";

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetchHealth()
      .then(() => setServerOnline(true))
      .catch(() => setServerOnline(false));

    const interval = setInterval(() => {
      fetchHealth()
        .then(() => setServerOnline(true))
        .catch(() => setServerOnline(false));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1E293B] flex">
      <ClaySidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileMenuOpen}
        onToggleMobile={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#FAF8F5]/85 backdrop-blur-md border-b border-[#E0D7C9] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#EDE7DD] text-[#1E293B]"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-extrabold font-heading text-[#1E293B]">
              Customer Shopping Behavior Analysis
            </span>
          </div>

          {/* Status indicator — minimal, no branding text */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#EDE7DD]/60 border border-white/60">
            <span
              className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                serverOnline === null
                  ? "bg-[#94A3B8]"
                  : serverOnline
                  ? "bg-[#10B981] animate-pulse"
                  : "bg-[#EF4444]"
              }`}
            />
            <span className="text-xs font-semibold text-[#475569] hidden sm:inline">
              {serverOnline === null ? "Connecting…" : serverOnline ? "Online" : "Offline"}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8">
          {currentTab === "home"               && <HomePage onNavigate={setCurrentTab} />}
          {currentTab === "dashboard"          && <DashboardPage />}
          {currentTab === "data-center"        && <DataCenterPage />}
          {currentTab === "data-understanding" && <DataUnderstandingPage />}
          {currentTab === "data-preparation"   && <DataPrepPage />}
          {currentTab === "statistics-eda"     && <StatisticsEDAPage />}
          {currentTab === "feature-engineering"&& <FeatureEngineeringPage />}
          {currentTab === "model-lab"          && <ModelLabPage />}
          {currentTab === "live-prediction"    && <LivePredictionPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
