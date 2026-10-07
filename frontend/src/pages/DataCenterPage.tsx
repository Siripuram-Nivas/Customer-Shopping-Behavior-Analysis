import React, { useEffect, useState } from "react";
import {
  Database,
  Upload,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { ClayCard } from "../components/clay/ClayCard";
import { ClayButton } from "../components/clay/ClayButton";
import { ClayBadge } from "../components/clay/ClayBadge";
import { ClayInput } from "../components/clay/ClayInput";
import {
  fetchDatasetSummary,
  fetchDatasetPreview,
  resetDataset,
  uploadDataset,
} from "../services/api";

export const DataCenterPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("Customer ID");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadData = async (currentPage = 1, searchQuery = search, sortColumn = sortBy, sortDirection = sortDir) => {
    try {
      setLoading(true);
      const [sumRes, prevRes] = await Promise.all([
        fetchDatasetSummary(),
        fetchDatasetPreview(currentPage, 12, searchQuery, sortColumn, sortDirection),
      ]);
      setSummary(sumRes);
      setPreview(prevRes);
    } catch (err: any) {
      console.error("Data Center Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page, search, sortBy, sortDir);
  }, [page, sortBy, sortDir]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1, search, sortBy, sortDir);
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await resetDataset();
      setSearch("");
      setPage(1);
      await loadData(1, "", "Customer ID", "asc");
      setUploadStatus("Dataset restored to standard factory baseline.");
      setTimeout(() => setUploadStatus(null), 4000);
    } catch (err: any) {
      setUploadError("Failed to reset dataset.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setUploadError(null);
      const res = await uploadDataset(file);
      setUploadStatus(res.message);
      setPage(1);
      await loadData(1);
      setTimeout(() => setUploadStatus(null), 4000);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload dataset.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E293B] font-heading">Data Center</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Central repository manager: inspect schema, query records, upload custom tabular CSVs, and reset baselines.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="clay-button px-4 py-2 text-xs cursor-pointer inline-flex items-center space-x-1.5 font-semibold">
            <Upload size={14} className="text-[#0D9488]" />
            <span>Upload CSV</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <ClayButton size="sm" icon={RotateCcw} onClick={handleReset}>
            Reset Dataset
          </ClayButton>
        </div>
      </div>

      {/* Notifications */}
      {uploadStatus && (
        <div className="p-4 rounded-xl bg-[#D1FAE5] border border-[#10B981]/30 text-[#065F46] flex items-center space-x-2 text-xs font-semibold">
          <CheckCircle2 size={16} />
          <span>{uploadStatus}</span>
        </div>
      )}
      {uploadError && (
        <div className="p-4 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/30 text-[#991B1B] flex items-center space-x-2 text-xs font-semibold">
          <AlertCircle size={16} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <ClayCard className="p-4 text-center">
          <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Total Rows</span>
          <div className="text-2xl font-black text-[#1E293B] font-heading mt-1">
            {summary?.rows?.toLocaleString() ?? "..."}
          </div>
        </ClayCard>

        <ClayCard className="p-4 text-center">
          <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Total Features</span>
          <div className="text-2xl font-black text-[#1E293B] font-heading mt-1">
            {summary?.columns ?? "..."}
          </div>
        </ClayCard>

        <ClayCard className="p-4 text-center">
          <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Missing Values</span>
          <div className="text-2xl font-black text-[#10B981] font-heading mt-1">
            {summary?.missing_values ?? 0}
          </div>
        </ClayCard>

        <ClayCard className="p-4 text-center">
          <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Duplicates</span>
          <div className="text-2xl font-black text-[#1E293B] font-heading mt-1">
            {summary?.duplicate_records ?? 0}
          </div>
        </ClayCard>

        <ClayCard className="p-4 text-center">
          <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Numeric Cols</span>
          <div className="text-2xl font-black text-[#FF6B6B] font-heading mt-1">
            {summary?.numerical_features?.length ?? "..."}
          </div>
        </ClayCard>

        <ClayCard className="p-4 text-center">
          <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Categorical Cols</span>
          <div className="text-2xl font-black text-[#4F46E5] font-heading mt-1">
            {summary?.categorical_features?.length ?? "..."}
          </div>
        </ClayCard>
      </div>

      {/* Table & Exploration Container */}
      <ClayCard className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 flex items-center space-x-2">
            <ClayInput
              placeholder="Search across all columns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <ClayButton size="sm" type="submit" icon={Search}>
              Search
            </ClayButton>
          </form>

          <div className="text-xs text-[#64748B] font-medium self-end sm:self-center">
            Showing {preview?.records?.length ? ((page - 1) * 12 + 1) : 0} - {Math.min(page * 12, preview?.filtered_records || 0)} of {preview?.filtered_records?.toLocaleString()} records
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-xl border border-[#E0D7C9]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EDE7DD] text-[#475569] uppercase font-bold tracking-wider border-b border-[#E0D7C9]">
              <tr>
                {preview?.columns?.map((col: string) => (
                  <th
                    key={col}
                    onClick={() => toggleSort(col)}
                    className="px-4 py-3 cursor-pointer hover:bg-[#E2DDD3] whitespace-nowrap"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{col}</span>
                      {sortBy === col && (
                        <span className="text-[#FF6B6B]">{sortDir === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D7C9]/60 bg-[#FAF8F5]">
              {loading ? (
                <tr>
                  <td colSpan={preview?.columns?.length || 10} className="px-4 py-8 text-center text-[#64748B]">
                    Loading records from backend...
                  </td>
                </tr>
              ) : preview?.records?.length === 0 ? (
                <tr>
                  <td colSpan={preview?.columns?.length || 10} className="px-4 py-8 text-center text-[#64748B]">
                    No records match the current search or filters.
                  </td>
                </tr>
              ) : (
                preview?.records?.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#F2ECE1] transition-colors">
                    {preview.columns.map((col: string) => {
                      const val = row[col];
                      const isHighValue = col === "High Value Customer" || col === "High_Value_Purchase";
                      return (
                        <td key={col} className="px-4 py-2.5 whitespace-nowrap text-[#1E293B]">
                          {isHighValue ? (
                            <ClayBadge variant={val === "Yes" || val === 1 ? "coral" : "neutral"} size="sm">
                              {val === 1 ? "Yes" : val === 0 ? "No" : String(val)}
                            </ClayBadge>
                          ) : typeof val === "number" ? (
                            col.includes("Amount") ? `$${val.toFixed(2)}` : val
                          ) : (
                            String(val ?? "—")
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-2">
          <ClayButton
            size="sm"
            icon={ChevronLeft}
            disabled={page <= 1}
            onClick={() => setPage(Math.max(1, page - 1))}
          >
            Previous
          </ClayButton>

          <span className="text-xs font-semibold text-[#64748B]">
            Page {page} of {preview?.total_pages || 1}
          </span>

          <ClayButton
            size="sm"
            icon={ChevronRight}
            disabled={page >= (preview?.total_pages || 1)}
            onClick={() => setPage(page + 1)}
          >
            Next
          </ClayButton>
        </div>
      </ClayCard>
    </div>
  );
};
