import React, { useEffect, useState } from "react";
import { ShieldCheck, Lock, EyeOff, AlertCircle, CheckCircle2, Scale } from "lucide-react";
import { ClayCard } from "../components/clay/ClayCard";
import { ClayBadge } from "../components/clay/ClayBadge";
import { fetchResponsibleAI } from "../services/api";

export const ResponsibleAIPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResponsibleAI()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1E293B] font-heading">
          Responsible Data Science & Model Governance
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Algorithmic fairness audits, demographic representation parity, target leakage immunity, and privacy compliance.
        </p>
      </div>

      {/* Fairness & Parity Card */}
      <ClayCard className="p-6 space-y-4">
        <div className="flex items-center space-x-2 text-[#0D9488]">
          <Scale size={20} />
          <h3 className="font-bold text-lg font-heading text-[#1E293B]">
            Demographic Parity & High-Value Acceptance Rates
          </h3>
        </div>
        <p className="text-xs text-[#475569] leading-relaxed">
          Assessing statistical parity across demographic cohorts to verify that the classification target is not biased against any group:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {data?.high_value_rate_by_gender &&
            Object.entries(data.high_value_rate_by_gender).map(([group, rate]: any) => (
              <div key={group} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">{group} Cohort</span>
                <div className="text-2xl font-black text-[#1E293B] font-heading mt-1">{rate}%</div>
                <span className="text-[10px] text-[#0D9488] font-semibold">High Value Rate</span>
              </div>
            ))}
        </div>
      </ClayCard>

      {/* Target Leakage Safeguards */}
      <ClayCard className="p-6 space-y-4">
        <div className="flex items-center space-x-2 text-[#FF6B6B]">
          <ShieldCheck size={20} />
          <h3 className="font-bold text-lg font-heading text-[#1E293B]">
            Architectural Safeguards Against Data Leakage
          </h3>
        </div>

        <div className="space-y-3">
          {data?.leakage_safeguards?.map((item: string, i: number) => (
            <div key={i} className="flex items-start space-x-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9]">
              <CheckCircle2 size={16} className="text-[#10B981] mt-0.5 flex-shrink-0" />
              <span className="text-xs text-[#475569] font-medium leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </ClayCard>

      {/* Privacy & Ethics */}
      <ClayCard className="p-6 space-y-4">
        <div className="flex items-center space-x-2 text-[#4F46E5]">
          <Lock size={20} />
          <h3 className="font-bold text-lg font-heading text-[#1E293B]">
            Privacy & Anonymization Standards
          </h3>
        </div>

        <div className="space-y-3">
          {data?.privacy_compliance?.map((item: string, i: number) => (
            <div key={i} className="flex items-start space-x-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9]">
              <EyeOff size={16} className="text-[#4F46E5] mt-0.5 flex-shrink-0" />
              <span className="text-xs text-[#475569] font-medium leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </ClayCard>
    </div>
  );
};
