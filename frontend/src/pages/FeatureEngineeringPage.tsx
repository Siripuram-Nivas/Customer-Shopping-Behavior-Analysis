import React, { useEffect, useState } from "react";
import { Cpu, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Layers } from "lucide-react";
import { ClayCard } from "../components/clay/ClayCard";
import { ClayBadge } from "../components/clay/ClayBadge";
import { fetchFeatureEngineering } from "../services/api";

export const FeatureEngineeringPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatureEngineering()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1E293B] font-heading">
          Feature Engineering & Transformation Pipeline
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Derive domain-informed representations, interaction terms, and discrete ordinal tiers while enforcing anti-leakage boundaries.
        </p>
      </div>

      {/* Target Leakage Banner */}
      <div className="clay-surface p-6 border-l-4 border-[#0D9488] space-y-2">
        <div className="flex items-center space-x-2 text-[#0D9488]">
          <ShieldCheck size={20} />
          <h3 className="font-bold text-base font-heading text-[#1E293B]">
            Ground-Truth Target Definition & Leakage Insulation
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
          The classification target <code className="bg-[#E5DFD5] px-1.5 py-0.5 rounded text-[#1E293B]">High_Value_Purchase</code> is derived mathematically from the upper quartile ($Q_{75} \approx \$350+$) of historical customer spend.
          During feature selection, all direct representations of <code className="bg-[#E5DFD5] px-1.5 py-0.5 rounded text-[#1E293B]">Purchase Amount</code> are strictly pruned from training feature sets to ensure legitimate generalization.
        </p>
      </div>

      {/* Transformation Manifesto Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data?.features_documentation?.map((item: any, idx: number) => (
          <ClayCard key={idx} className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#FF6B6B] uppercase tracking-wider">
                  Transformation #{idx + 1}
                </span>
                <ClayBadge variant="teal" size="sm">Active</ClayBadge>
              </div>

              <div className="flex items-center space-x-2 text-sm font-bold text-[#1E293B]">
                <span className="px-2 py-1 rounded-lg bg-[#EDE7DD] text-xs font-mono">{item.source}</span>
                <ArrowRight size={14} className="text-[#FF6B6B]" />
                <span className="px-2 py-1 rounded-lg bg-[#FFE5E5] text-[#FF6B6B] text-xs font-mono">{item.feature}</span>
              </div>

              <div className="text-xs text-[#475569]">
                <span className="font-bold text-[#1E293B]">Method: </span>
                {item.transformation}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E0D7C9] text-xs text-[#64748B] italic">
              <span className="font-semibold text-[#1E293B] not-italic">Analytical Rationale: </span>
              {item.rationale}
            </div>
          </ClayCard>
        ))}
      </div>

      {/* Sample Transformed Observations Table */}
      {data?.sample_records && (
        <ClayCard className="p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Layers size={18} className="text-[#FF6B6B]" />
            <h3 className="font-bold text-lg font-heading text-[#1E293B]">
              Engineered Feature Preview (Active Sample)
            </h3>
          </div>
          <p className="text-xs text-[#64748B]">
            First 10 records transformed live through the feature engineering pipeline:
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#E0D7C9]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EDE7DD] text-[#475569] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Customer ID</th>
                  <th className="px-4 py-3">Raw Age</th>
                  <th className="px-4 py-3">Age Group</th>
                  <th className="px-4 py-3">Spending Band</th>
                  <th className="px-4 py-3">IsSubscribed</th>
                  <th className="px-4 py-3">Loyalty Index</th>
                  <th className="px-4 py-3">Target (High Value)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D7C9]/60 bg-[#FAF8F5]">
                {data.sample_records.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-[#F2ECE1]">
                    <td className="px-4 py-2.5 font-mono text-[#64748B]">{row["Customer ID"]}</td>
                    <td className="px-4 py-2.5 font-semibold text-[#1E293B]">{row["Age"]}</td>
                    <td className="px-4 py-2.5">
                      <ClayBadge size="sm" variant="neutral">{row["Age Group"]}</ClayBadge>
                    </td>
                    <td className="px-4 py-2.5">
                      <ClayBadge size="sm" variant="indigo">{row["Spending Band"]}</ClayBadge>
                    </td>
                    <td className="px-4 py-2.5 font-bold text-[#1E293B]">
                      {row["IsSubscribed"] === 1 ? "1 (Yes)" : "0 (No)"}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[#0D9488]">
                      {row["Loyalty Index"]?.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5">
                      <ClayBadge size="sm" variant={row["High_Value_Purchase"] === 1 ? "coral" : "neutral"}>
                        {row["High_Value_Purchase"] === 1 ? "High Value" : "Standard"}
                      </ClayBadge>
                    </td>
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
