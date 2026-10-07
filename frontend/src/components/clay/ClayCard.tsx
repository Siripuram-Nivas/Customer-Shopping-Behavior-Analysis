import React from "react";

interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  raised?: boolean;
  inset?: boolean;
  onClick?: () => void;
}

export const ClayCard: React.FC<ClayCardProps> = ({
  children,
  className = "",
  style,
  raised = false,
  inset = false,
  onClick,
}) => {
  const baseClass = inset
    ? "clay-inset"
    : raised
    ? "clay-surface-raised"
    : "clay-surface";

  return (
    <div
      onClick={onClick}
      style={style}
      className={`${baseClass} p-5 sm:p-6 transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
};
