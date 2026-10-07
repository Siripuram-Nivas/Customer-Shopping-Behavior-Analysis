import React from "react";
import { LucideIcon } from "lucide-react";

interface ClayKPIProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  subtitle?: string;
  accentColor?: "coral" | "teal" | "amber" | "indigo" | "rose";
}

export const ClayKPI: React.FC<ClayKPIProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  subtitle,
  accentColor = "coral",
}) => {
  const iconBg = {
    coral: "bg-[#FFE5E5] text-[#FF6B6B]",
    teal: "bg-[#E6F7F5] text-[#0D9488]",
    amber: "bg-[#FEF3C7] text-[#D97706]",
    indigo: "bg-[#EEF2FF] text-[#4F46E5]",
    rose: "bg-[#FFE4E6] text-[#E11D48]",
  }[accentColor];

  return (
    <div className="clay-surface p-5 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#64748B]">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconBg} shadow-sm flex items-center justify-center`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-1.5 my-1">
        <span className="text-3xl font-extrabold tracking-tight font-heading text-[#1E293B]">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-[#64748B]">{unit}</span>}
      </div>

      {subtitle && (
        <p className="text-xs text-[#64748B] mt-1 font-medium">{subtitle}</p>
      )}
    </div>
  );
};
