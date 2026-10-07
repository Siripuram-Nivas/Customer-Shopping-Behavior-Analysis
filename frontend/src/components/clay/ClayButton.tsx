import React from "react";
import { LucideIcon } from "lucide-react";

interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  loading?: boolean;
}

export const ClayButton: React.FC<ClayButtonProps> = ({
  children,
  variant = "secondary",
  size = "md",
  icon: Icon,
  loading = false,
  className = "",
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  }[size];

  const variantClass = {
    primary: "clay-button-primary",
    secondary: "clay-button",
    outline: "bg-transparent border-2 border-[#1E293B]/20 text-[#1E293B] hover:bg-[#FAF8F5]",
    danger: "bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-md",
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold rounded-clay-sm space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClass} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        Icon && <Icon size={16} className="mr-1.5" />
      )}
      <span>{children}</span>
    </button>
  );
};
