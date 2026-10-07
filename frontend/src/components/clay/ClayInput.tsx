import React from "react";

interface ClayInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const ClayInput: React.FC<ClayInputProps> = ({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`clay-input px-4 py-2.5 text-sm w-full placeholder:text-[#94A3B8] ${error ? "border-[#EF4444] ring-1 ring-[#EF4444]" : ""} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[#EF4444] font-medium">{error}</span>}
      {!error && helperText && <span className="text-xs text-[#64748B]">{helperText}</span>}
    </div>
  );
};

interface ClaySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ label: string; value: string | number } | string>;
  error?: string;
}

export const ClaySelect: React.FC<ClaySelectProps> = ({
  label,
  options,
  error,
  className = "",
  id,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`clay-input px-4 py-2.5 text-sm w-full bg-[#EDE7DD] cursor-pointer ${className}`}
        {...props}
      >
        {options.map((opt, idx) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const lbl = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={idx} value={val} className="bg-[#FAF8F5] text-[#1E293B]">
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <span className="text-xs text-[#EF4444] font-medium">{error}</span>}
    </div>
  );
};
