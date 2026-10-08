// ============================================================
// API Service — Full Dataset Mode
// All 18 analytical columns are exposed; no five-feature restriction.
// ============================================================

export const API_BASE = "http://127.0.0.1:8000/api";

// Complete analytical feature list (matches backend ALLOWED_FEATURES)
export const ALLOWED_FEATURES = [
  "Age", "Gender", "Category", "Item Purchased", "Purchase Amount",
  "Location", "Size", "Color", "Season", "Review Rating",
  "Subscription Status", "Shipping Type", "Payment Method",
  "Discount Applied", "Promo Code Used", "Previous Purchases",
  "Preferred Brand", "Frequency of Purchases",
] as const;

export type AllowedFeature = (typeof ALLOWED_FEATURES)[number];

// ============================================================
// FILTER TYPE — all categorical and numerical dimensions
// ============================================================

export interface DataFilters {
  // Numerical ranges
  age_min?: number;
  age_max?: number;
  purchase_min?: number;
  purchase_max?: number;
  rating_min?: number;
  rating_max?: number;
  prev_purchases_min?: number;
  prev_purchases_max?: number;
  // Categorical multi-selects
  frequency_categories?: string[];
  gender?: string[];
  season?: string[];
  category?: string[];
  subscription_status?: string[];
  shipping_type?: string[];
  payment_method?: string[];
  discount_applied?: string[];
  promo_code_used?: string[];
  size?: string[];
  color?: string[];
  preferred_brand?: string[];
  location?: string[];
}

// ============================================================
// SCHEMA TYPE — returned by /api/dataset/schema
// ============================================================

export interface ColumnSchema {
  name: string;
  dtype: string;
  is_numeric: boolean;
  unique_count: number;
  missing_count: number;
  unique_values?: string[];
  min?: number;
  max?: number;
}

export interface DatasetSchema {
  columns: ColumnSchema[];
  total_analytical_features: number;
  numerical_features: string[];
  categorical_features: string[];
}

export interface ColumnStatistics {
  feature: string;
  count: number;
  unique_count: number;
  mean?: number | null;
  median?: number | null;
  std?: number | null;
  variance?: number | null;
  min?: number | null;
  max?: number | null;
  q25?: number | null;
  q75?: number | null;
  iqr?: number | null;
  skewness?: number | null;
  mode?: number | string | null;
  distribution?: Array<{
    range?: string;
    label?: string;
    count: number;
    percentage?: number;
  }> | null;
}

export interface StatisticsResponse {
  statistics: ColumnStatistics[];
  record_count: number;
  correlation_matrix: {
    columns: string[];
    matrix: number[][];
  };
}

// ============================================================
// DASHBOARD TYPES — Notebook-driven DashboardResponse
// ============================================================

export interface DashboardData {
  // Dataset Profile
  profile_kpis: {
    "Total Customers": number;
    "Total Revenue": number;
    "Average Spend": number;
    "Subscription Rate": number;
  };
  age_distribution: Array<{ bin: string; count: number }>;
  age_group_distribution: Array<{ label: string; count: number }>;
  gender_distribution: Array<{ label: string; count: number }>;
  subscription_distribution: Array<{ label: string; value: number }>;
  frequency_distribution: Array<{ label: string; value: number }>;
  season_distribution: Array<{ label: string; value: number }>;
  // Revenue Behavior
  category_analysis: Array<Record<string, unknown>>;
  item_revenue: Array<Record<string, unknown>>;
  season_revenue: Array<Record<string, unknown>>;
  // Loyalty
  loyalty_analysis: Array<Record<string, unknown>>;
  // Promotions
  discount_subscription: Array<Record<string, unknown>>;
  promo_subscription: Array<Record<string, unknown>>;
  // Geography
  location_analysis: Array<Record<string, unknown>>;
  // Relationships
  correlation_matrix: { columns: string[]; matrix: number[][] };
  correlation_with_subscription: Array<{ Feature: string; Correlation: number }>;
  // Segmentation
  segment_profile: Array<Record<string, unknown>>;
  elbow_curve: Array<{ k: number; inertia: number }>;
  // Statistical Summary
  stat_summary: Record<string, unknown>;
}

// ============================================================
// PREDICTION TYPES — Full 13-feature model contract
// ============================================================

export interface PredictPayload {
  model_type: string;
  Age: number;
  "Purchase Amount": number;
  "Review Rating": number;
  "Previous Purchases": number;
  Gender: string;
  Category: string;
  "Item Purchased": string;
  Location: string;
  Size: string;
  Color: string;
  Season: string;
  "Shipping Type": string;
  "Payment Method": string;
  "Discount Applied": string;
  "Promo Code Used": string;
  "Preferred Brand": string;
  "Frequency of Purchases": string;
}

export interface PredictResponse {
  model_used: string;
  prediction: string;
  probability_subscribed: number;
  probability_percentage: string;
  confidence_level: string;
  feature_impacts: Array<{ feature: string; direction: string; reason: string }>;
  explanation: string;
}

// ============================================================
// API FUNCTIONS
// ============================================================

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, string>;
    throw new Error(err.detail || `API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return handleResponse<Record<string, unknown>>(res);
}

export async function fetchDatasetSummary() {
  const res = await fetch(`${API_BASE}/dataset/summary`);
  return handleResponse<Record<string, unknown>>(res);
}

export async function fetchDatasetSchema(): Promise<DatasetSchema> {
  const res = await fetch(`${API_BASE}/dataset/schema`);
  return handleResponse<DatasetSchema>(res);
}

export async function fetchDatasetPreview(
  page: number = 1,
  pageSize: number = 15,
  search?: string,
  sortBy?: string,
  sortDir: string = "asc",
  filters?: DataFilters
) {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    sort_dir: sortDir,
  });
  if (search) params.append("search", search);
  if (sortBy) params.append("sort_by", sortBy);

  const res = await fetch(`${API_BASE}/dataset/preview?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters || {}),
  });
  return handleResponse<Record<string, unknown>>(res);
}

export async function resetDataset() {
  const res = await fetch(`${API_BASE}/dataset/reset`, { method: "POST" });
  return handleResponse<Record<string, unknown>>(res);
}

export async function uploadDataset(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/dataset/upload`, {
    method: "POST",
    body: formData,
  });
  return handleResponse<Record<string, unknown>>(res);
}

export async function prepareDataset(options: {
  handle_missing: string;
  remove_duplicates: boolean;
  remove_outliers: boolean;
  outlier_method: string;
}) {
  const res = await fetch(`${API_BASE}/data/prepare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });
  return handleResponse<Record<string, unknown>>(res);
}

export async function fetchDashboard(filters?: DataFilters): Promise<DashboardData> {
  const res = await fetch(`${API_BASE}/dashboard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters || {}),
  });
  return handleResponse<DashboardData>(res);
}

export async function fetchStatistics(filters?: DataFilters): Promise<StatisticsResponse> {
  const res = await fetch(`${API_BASE}/statistics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters || {}),
  });
  return handleResponse<StatisticsResponse>(res);
}

export async function fetchFocusFeatureStats(feature: string, filters?: DataFilters) {
  const params = new URLSearchParams({ feature });
  const res = await fetch(`${API_BASE}/statistics/focus?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters || {}),
  });
  return handleResponse<Record<string, unknown>>(res);
}

export async function fetchFeatureEngineering() {
  const res = await fetch(`${API_BASE}/feature-engineering`);
  return handleResponse<Record<string, unknown>>(res);
}

export async function trainClassificationModel(req: {
  model_type: string;
  test_size?: number;
  random_state?: number;
}) {
  const res = await fetch(`${API_BASE}/model/train`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<Record<string, unknown>>(res);
}

export async function compareClassificationModels() {
  const res = await fetch(`${API_BASE}/model/compare`);
  return handleResponse<Record<string, unknown>>(res);
}

export async function predictCustomerValue(payload: PredictPayload): Promise<PredictResponse> {
  const res = await fetch(`${API_BASE}/model/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<PredictResponse>(res);
}

export async function runClustering(k: number = 3) {
  const res = await fetch(`${API_BASE}/model/clustering?k_clusters=${k}`, {
    method: "POST",
  });
  return handleResponse<Record<string, unknown>>(res);
}

export async function runRegression(model_type: string = "random_forest") {
  const res = await fetch(`${API_BASE}/model/regression`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model_type }),
  });
  return handleResponse<Record<string, unknown>>(res);
}
