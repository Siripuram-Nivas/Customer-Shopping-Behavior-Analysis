import React from "react";

interface ClayBadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "coral" | "teal" | "amber" | "indigo" | "success" | "danger";
  size?: "sm" | "md";
  className?: string;
}

export const ClayBadge: React.FC<ClayBadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  className = "",
}) => {
  const variantStyles = {
    neutral: "bg-[#E5DFD5] text-[#475569] shadow-sm",
    coral: "bg-[#FFE5E5] text-[#FF6B6B] border border-[#FF6B6B]/20",
    teal: "bg-[#E6F7F5] text-[#0D9488] border border-[#0D9488]/20",
    amber: "bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/20",
    indigo: "bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/20",
    success: "bg-[#D1FAE5] text-[#059669] border border-[#059669]/20",
    danger: "bg-[#FEE2E2] text-[#DC2626] border border-[#DC2626]/20",
  }[variant];

  const sizeStyles = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded-lg ${sizeStyles} ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};

interface ClayChartCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const ClayChartCard: React.FC<ClayChartCardProps> = ({
  title,
  subtitle,
  badge,
  children,
  action,
  className = "",
}) => {
  return (
    <div className={`clay-surface p-6 flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-[#1E293B] font-heading">{title}</h3>
            {badge && <ClayBadge variant="coral" size="sm">{badge}</ClayBadge>}
          </div>
          {subtitle && <p className="text-xs text-[#64748B] mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="w-full flex-1 min-h-[260px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
