import React, { useState } from "react";
import { Filter, SlidersHorizontal, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { ClayCard } from "../components/clay/ClayCard";
import { ClayButton } from "../components/clay/ClayButton";
import { ClaySelect } from "../components/clay/ClayInput";
import { ClayBadge } from "../components/clay/ClayBadge";
import { prepareDataset, resetDataset } from "../services/api";

export const DataPrepPage: React.FC = () => {
  const [handleMissing, setHandleMissing] = useState("median");
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [removeOutliers, setRemoveOutliers] = useState(false);
  const [outlierMethod, setOutlierMethod] = useState("iqr");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApplyPreparation = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await prepareDataset({
        handle_missing: handleMissing,
        remove_duplicates: removeDuplicates,
        remove_outliers: removeOutliers,
        outlier_method: outlierMethod,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to execute preprocessing pipeline.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetToRaw = async () => {
    try {
      setLoading(true);
      await resetDataset();
      setResult(null);
      setError(null);
    } catch (err: any) {
      setError("Failed to reset dataset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1E293B] font-heading">Data Preparation & Cleaning</h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Perform deterministic data cleaning, missing imputation, duplicate stripping, and parametric outlier filtering with live before/after audits.
        </p>
      </div>

      {/* Control Panel */}
      <ClayCard className="p-6 space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-[#E0D7C9]">
          <SlidersHorizontal size={18} className="text-[#FF6B6B]" />
          <h2 className="font-bold text-base text-[#1E293B] font-heading">Preprocessing Configuration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClaySelect
            label="Missing Values Imputation Strategy"
            value={handleMissing}
            onChange={(e) => setHandleMissing(e.target.value)}
            options={[
              { label: "Median Imputation (Robust to Skewed Outliers)", value: "median" },
              { label: "Mean Imputation (Standard Normal)", value: "mean" },
              { label: "Drop Incomplete Rows", value: "drop" },
            ]}
          />

          <div className="flex flex-col space-y-2">
            <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
              Deduplication Rule
            </span>
            <label className="flex items-center space-x-3 p-3 rounded-xl bg-[#EDE7DD] cursor-pointer">
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="w-4 h-4 text-[#FF6B6B] rounded focus:ring-0"
              />
              <span className="text-xs font-semibold text-[#1E293B]">
                Prune Duplicate Observation Rows
              </span>
            </label>
          </div>

          <div className="flex flex-col space-y-2">
            <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
              Outlier Truncation
            </span>
            <label className="flex items-center space-x-3 p-3 rounded-xl bg-[#EDE7DD] cursor-pointer">
              <input
                type="checkbox"
                checked={removeOutliers}
                onChange={(e) => setRemoveOutliers(e.target.checked)}
                className="w-4 h-4 text-[#FF6B6B] rounded focus:ring-0"
              />
              <span className="text-xs font-semibold text-[#1E293B]">
                Filter Extreme Purchase Amount Outliers
              </span>
            </label>
          </div>

          {removeOutliers && (
            <ClaySelect
              label="Outlier Detection Threshold"
              value={outlierMethod}
              onChange={(e) => setOutlierMethod(e.target.value)}
              options={[
                { label: "Interquartile Range: [Q1 - 1.5*IQR, Q3 + 1.5*IQR]", value: "iqr" },
                { label: "Standard Z-Score: |Z| > 3.0 Standard Deviations", value: "zscore" },
              ]}
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#E0D7C9]">
          <ClayButton size="sm" onClick={handleResetToRaw}>
            Reset Raw Baseline
          </ClayButton>

          <ClayButton
            variant="primary"
            loading={loading}
            icon={Filter}
            onClick={handleApplyPreparation}
          >
            Execute Cleaning Pipeline
          </ClayButton>
        </div>
      </ClayCard>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/30 text-[#991B1B] text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Before / After Audit Results */}
      {result && (
        <ClayCard className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg font-heading text-[#1E293B]">Transformation Audit Results</h3>
            <ClayBadge variant="success">Executed</ClayBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Initial Row Count</span>
              <div className="text-xl font-black text-[#1E293B] mt-1 font-heading">
                {result.initial_rows.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Active Retained Rows</span>
              <div className="text-xl font-black text-[#0D9488] mt-1 font-heading">
                {result.final_rows.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Duplicates Pruned</span>
              <div className="text-xl font-black text-[#FF6B6B] mt-1 font-heading">
                {result.duplicates_removed}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Outliers Filtered</span>
              <div className="text-xl font-black text-[#D97706] mt-1 font-heading">
                {result.outliers_removed}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#D1FAE5]/60 border border-[#10B981]/20 text-[#065F46] text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 size={16} />
            <span>{result.message}</span>
          </div>
        </ClayCard>
      )}
    </div>
  );
};
