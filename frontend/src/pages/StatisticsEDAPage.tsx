import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, TrendingUp, Grid, Activity, ArrowUpDown, Table } from "lucide-react";
import { ClayCard } from "../components/clay/ClayCard";
import { ClaySelect } from "../components/clay/ClayInput";
import { ClayBadge } from "../components/clay/ClayBadge";
import { ClayChartCard } from "../components/clay/ClayBadge";
import { fetchStatistics, fetchDashboard, fetchFocusFeatureStats } from "../services/api";

export const StatisticsEDAPage: React.FC = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [selectedFeature, setSelectedFeature] = useState<string>("Age");
  const [focusData, setFocusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStatistics(), fetchDashboard()])
      .then(([s, d]) => {
        setStats(s.statistics || []);
        setDashboard(d);
        if (s.statistics?.length > 0) {
          setSelectedFeature(s.statistics[0].feature);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Load cross-variable focus stats whenever the selected feature changes
  useEffect(() => {
    if (!selectedFeature) return;
    fetchFocusFeatureStats(selectedFeature)
      .then(setFocusData)
      .catch(console.error);
  }, [selectedFeature]);

  const activeStat = stats.find((s) => s.feature === selectedFeature) || stats[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E293B] font-heading">
            Descriptive Statistics & Exploratory Data Analysis
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Pure mathematical summary metrics, non-parametric distribution binnings, and multi-variable correlations.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <ClaySelect
            label="Focus Feature"
            value={selectedFeature}
            onChange={(e) => setSelectedFeature(e.target.value)}
            options={stats.map((s) => ({ label: s.feature, value: s.feature }))}
          />
        </div>
      </div>

      {/* Feature Deep Dive Metrics Card */}
      {activeStat && (
        <ClayCard className="p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E0D7C9]">
            <div className="flex items-center space-x-2">
              <Activity size={18} className="text-[#FF6B6B]" />
              <h2 className="font-bold text-lg font-heading text-[#1E293B]">
                Univariate Profile: {activeStat.feature}
              </h2>
            </div>
            <ClayBadge variant={activeStat.mean !== undefined ? "teal" : "coral"}>
              {activeStat.mean !== undefined ? "Continuous / Numeric" : "Categorical / Discrete"}
            </ClayBadge>
          </div>

          {activeStat.mean !== undefined ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Mean ($\mu$)</span>
                <div className="text-base font-black text-[#1E293B] font-heading mt-0.5">
                  {activeStat.mean}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Median ($Q_2$)</span>
                <div className="text-base font-black text-[#1E293B] font-heading mt-0.5">
                  {activeStat.median}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Std Dev ($\sigma$)</span>
                <div className="text-base font-black text-[#0D9488] font-heading mt-0.5">
                  {activeStat.std}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Variance ($\sigma^2$)</span>
                <div className="text-base font-black text-[#1E293B] font-heading mt-0.5">
                  {activeStat.variance}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Min</span>
                <div className="text-base font-black text-[#1E293B] font-heading mt-0.5">
                  {activeStat.min}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Max</span>
                <div className="text-base font-black text-[#1E293B] font-heading mt-0.5">
                  {activeStat.max}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">IQR ($Q_3-Q_1$)</span>
                <div className="text-base font-black text-[#FF6B6B] font-heading mt-0.5">
                  {activeStat.iqr}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Skewness</span>
                <div className="text-base font-black text-[#4F46E5] font-heading mt-0.5">
                  {activeStat.skewness}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Total Valid Entries</span>
                <div className="text-xl font-black text-[#1E293B] font-heading mt-1">
                  {activeStat.count.toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Distinct Categories</span>
                <div className="text-xl font-black text-[#FF6B6B] font-heading mt-1">
                  {activeStat.unique_count}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Modal Category</span>
                <div className="text-xl font-black text-[#0D9488] font-heading mt-1 truncate">
                  {activeStat.mode ?? "—"}
                </div>
              </div>
            </div>
          )}

          {/* Distribution Chart */}
          {activeStat.distribution && activeStat.distribution.length > 0 && (
            <div className="pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
                Frequency Distribution Histogram / Bar Plot
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeStat.distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD5" vertical={false} />
                    <XAxis
                      dataKey={activeStat.mean !== undefined ? "range" : "label"}
                      tick={{ fill: "#64748B", fontSize: 11 }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fill: "#64748B", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FAF8F5",
                        borderRadius: "12px",
                        border: "1px solid #E0D7C9",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Bar dataKey="count" fill="#FF6B6B" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Cross-variable charts from focusData */}
          {focusData && focusData.cross_charts && Object.keys(focusData.cross_charts).length > 0 && (
            <div className="pt-4 border-t border-[#E0D7C9]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
                Cross-Variable Analysis: {selectedFeature} vs Numerical Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(focusData.cross_charts).map(([otherCol, chartData]: [string, any]) => (
                  <div key={otherCol} className="h-48">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase mb-1">
                      {focusData.is_numeric ? `${selectedFeature} vs ${otherCol}` : `${otherCol} by ${selectedFeature}`}
                    </p>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 10, left: -20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD5" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: "#64748B", fontSize: 10 }}
                          angle={-20}
                          textAnchor="end"
                        />
                        <YAxis tick={{ fill: "#64748B", fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#FAF8F5",
                            borderRadius: "12px",
                            border: "1px solid #E0D7C9",
                          }}
                        />
                        <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} name={`Avg ${otherCol}`} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ClayCard>
      )}

      {/* Correlation Heatmap Card */}
      {dashboard?.correlation_matrix?.columns?.length > 0 && (
        <ClayCard className="p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Grid size={18} className="text-[#4F46E5]" />
            <h3 className="font-bold text-lg font-heading text-[#1E293B]">
              Pearson Correlation Matrix ($r \in [-1, 1]$)
            </h3>
          </div>
          <p className="text-xs text-[#64748B]">
            Measures pairwise linear association across numerical features. Values near +1 indicate strong direct collinearity; values near 0 indicate orthogonality.
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#E0D7C9] mt-4">
            <table className="w-full text-center text-xs">
              <thead className="bg-[#EDE7DD] text-[#475569] font-bold">
                <tr>
                  <th className="px-3 py-2.5 text-left">Feature</th>
                  {dashboard.correlation_matrix.columns.map((c: string) => (
                    <th key={c} className="px-3 py-2.5 whitespace-nowrap">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D7C9]/60 bg-[#FAF8F5]">
                {dashboard.correlation_matrix.columns.map((rowName: string, rIdx: number) => (
                  <tr key={rowName}>
                    <td className="px-3 py-2 font-bold text-left text-[#1E293B] whitespace-nowrap bg-[#F2ECE1]">
                      {rowName}
                    </td>
                    {dashboard.correlation_matrix.matrix[rIdx].map((val: number, cIdx: number) => {
                      const isSelf = rIdx === cIdx;
                      const intensity = Math.abs(val);
                      const bg = isSelf
                        ? "bg-[#FFE5E5] text-[#FF6B6B] font-bold"
                        : val > 0.2
                        ? "bg-[#D1FAE5] text-[#065F46] font-semibold"
                        : val < -0.2
                        ? "bg-[#FEE2E2] text-[#991B1B] font-semibold"
                        : "text-[#475569]";
                      return (
                        <td key={cIdx} className={`px-3 py-2 whitespace-nowrap ${bg}`}>
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ClayCard>
      )}
    </div>
  );
};
