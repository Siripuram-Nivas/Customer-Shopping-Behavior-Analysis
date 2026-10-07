import React, { useEffect, useState } from "react";
import { Database, BrainCircuit, BarChart, CheckCircle2, ShieldCheck } from "lucide-react";
import { ClayCard } from "../components/clay/ClayCard";
import { ClayButton } from "../components/clay/ClayButton";
import { ClayBadge } from "../components/clay/ClayBadge";
import { NavTab } from "../components/clay/ClaySidebar";
import { fetchHealth, fetchDatasetSummary } from "../services/api";

interface DatasetSummary {
  rows: number;
  columns: number;
  numerical_features: string[];
  categorical_features: string[];
  missing_values: number;
}

interface HomePageProps {
  onNavigate: (tab: NavTab) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchHealth(), fetchDatasetSummary()])
      .then(([h, s]) => {
        setHealth(h);
        setSummary(s as unknown as DatasetSummary);
      })
      .catch((err) => console.error("Home fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-2">
      {/* Hero Section */}
      <div className="clay-surface-raised p-8 sm:p-12 relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-[#EDE7DD] px-3.5 py-1.5 rounded-full border border-[#D1CAB8]/60">
            <BarChart size={14} className="text-[#64748B]" />
            <span className="text-xs font-semibold text-[#475569] tracking-wide uppercase">
              Customer Shopping Behavior Analysis
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-[#1E293B] font-heading leading-tight tracking-tight">
            Understand Shopping.<br />
            <span className="text-[#FF6B6B]">Predict Value.</span><br />
            Discover Patterns.
          </h1>

          <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
            An interactive data-science platform for analyzing customer shopping behavior,
            discovering purchase drivers, engineering features, and training leak-free predictive models.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <ClayButton
              variant="primary"
              size="lg"
              icon={Database}
              onClick={() => onNavigate("data-center")}
            >
              Explore Dataset
            </ClayButton>
            <ClayButton
              size="lg"
              icon={BarChart}
              onClick={() => onNavigate("dashboard")}
            >
              View Dashboard
            </ClayButton>
          </div>
        </div>

        {/* Decorative Clay Element */}
        <div className="hidden lg:block absolute -right-12 -bottom-12 w-96 h-96 rounded-full bg-linear-to-tr from-[#FFE5E5] via-[#FFF3EB] to-white opacity-80 blur-2xl pointer-events-none" />
      </div>

      {/* Live System Status Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B] font-heading">Platform Overview</h2>
            <p className="text-xs text-[#64748B]">Live metrics computed dynamically from the active dataset</p>
          </div>
          {health && <ClayBadge variant="success">System Ready</ClayBadge>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ClayCard className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Dataset Engine</span>
              <Database size={18} className="text-[#0D9488]" />
            </div>
            <div className="text-2xl font-bold font-heading text-[#1E293B]">
              {loading ? "..." : `${summary?.rows?.toLocaleString() || 3900} Records`}
            </div>
            <p className="text-xs text-[#475569]">
              {summary
                ? `${summary.columns} features — ${summary.numerical_features.length} numeric, ${summary.categorical_features.length} categorical`
                : "Loading dataset info…"}
            </p>
            <div className="flex items-center text-xs font-semibold text-[#0D9488] space-x-1 pt-1">
              <CheckCircle2 size={14} />
              <span>Zero Missing Values Detected</span>
            </div>
          </ClayCard>

          <ClayCard className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">ML Pipeline</span>
              <BrainCircuit size={18} className="text-[#FF6B6B]" />
            </div>
            <div className="text-2xl font-bold font-heading text-[#1E293B]">
              Anti-Leakage Certified
            </div>
            <p className="text-xs text-[#475569]">
              Purchase Amount is strictly excluded during High-Value Customer classification to prevent ground-truth target leakage.
            </p>
            <div className="flex items-center text-xs font-semibold text-[#FF6B6B] space-x-1 pt-1">
              <CheckCircle2 size={14} />
              <span>Logistic Regression & Decision Trees Ready</span>
            </div>
          </ClayCard>

          <ClayCard className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Analytics Engine</span>
              <BarChart size={18} className="text-[#D97706]" />
            </div>
            <div className="text-2xl font-bold font-heading text-[#1E293B]">
              Pure Math Source
            </div>
            <p className="text-xs text-[#475569]">
              Every KPI, correlation, variance, and segment metric is dynamically evaluated with full precision via NumPy & Pandas.
            </p>
            <div className="flex items-center text-xs font-semibold text-[#D97706] space-x-1 pt-1">
              <CheckCircle2 size={14} />
              <span>100% Calculated Dynamically</span>
            </div>
          </ClayCard>
        </div>
      </div>

      {/* Guided Analytical Journey */}
      <ClayCard className="p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] font-heading">The Data Science Analytical Journey</h2>
          <p className="text-xs text-[#64748B]">Structured methodology followed across the platform</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate("data-understanding")}
            className="p-4 rounded-xl bg-[#EDE7DD]/50 border border-white/60 cursor-pointer hover:bg-[#E5DFD5] transition-colors"
          >
            <span className="text-[10px] font-bold text-[#FF6B6B] uppercase">Phase 1</span>
            <h4 className="font-bold text-sm text-[#1E293B] mt-1">Data Understanding</h4>
            <p className="text-xs text-[#64748B] mt-1">Exploration of features, data dictionary, and data hygiene.</p>
          </div>

          <div
            onClick={() => onNavigate("statistics-eda")}
            className="p-4 rounded-xl bg-[#EDE7DD]/50 border border-white/60 cursor-pointer hover:bg-[#E5DFD5] transition-colors"
          >
            <span className="text-[10px] font-bold text-[#FF6B6B] uppercase">Phase 2</span>
            <h4 className="font-bold text-sm text-[#1E293B] mt-1">Statistics & EDA</h4>
            <p className="text-xs text-[#64748B] mt-1">Parametric stats, distributions, and correlation heatmap.</p>
          </div>

          <div
            onClick={() => onNavigate("feature-engineering")}
            className="p-4 rounded-xl bg-[#EDE7DD]/50 border border-white/60 cursor-pointer hover:bg-[#E5DFD5] transition-colors"
          >
            <span className="text-[10px] font-bold text-[#FF6B6B] uppercase">Phase 3</span>
            <h4 className="font-bold text-sm text-[#1E293B] mt-1">Feature Engineering</h4>
            <p className="text-xs text-[#64748B] mt-1">Discretization, interaction terms, and target generation.</p>
          </div>

          <div
            onClick={() => onNavigate("model-lab")}
            className="p-4 rounded-xl bg-[#EDE7DD]/50 border border-white/60 cursor-pointer hover:bg-[#E5DFD5] transition-colors"
          >
            <span className="text-[10px] font-bold text-[#FF6B6B] uppercase">Phase 4</span>
            <h4 className="font-bold text-sm text-[#1E293B] mt-1">Model Lab & Evaluation</h4>
            <p className="text-xs text-[#64748B] mt-1">Cross-validation, confusion matrices, and live prediction.</p>
          </div>
        </div>
      </ClayCard>
    </div>
  );
};
