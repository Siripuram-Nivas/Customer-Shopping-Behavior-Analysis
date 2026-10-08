from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.analytics import (
    compute_column_statistics,
    compute_correlation_data,
    compute_dashboard_data,
)
from backend.config import ALLOWED_FEATURES, NUMERICAL_FEATURES, CATEGORICAL_FEATURES
from backend.data_manager import data_manager
from backend.ml_engine import ml_engine
from backend.schemas import (
    ColumnStatistics,
    DashboardResponse,
    DataFilterRequest,
    DataPrepRequest,
    DataPreviewResponse,
    DatasetSummary,
    ModelComparisonResponse,
    ModelMetricsResponse,
    PredictRequest,
    PredictResponse,
    RegressionTrainRequest,
    TrainModelRequest,
)

app = FastAPI(
    title="Customer Shopping Behavior Analysis API",
    description="Backend Data Science Analytics & Machine Learning Engine — Full Dataset Mode",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", include_in_schema=False)
def read_root():
    return RedirectResponse(url="/docs")


# ============================================================
# HEALTH
# ============================================================

@app.get("/api/health")
def health_check() -> Dict[str, Any]:
    active_df = data_manager.get_active_df()
    num_cols = data_manager.get_numerical_columns()
    cat_cols = data_manager.get_categorical_columns()
    return {
        "status": "healthy",
        "service": "Customer Shopping Behavior Analysis Engine",
        "dataset_loaded": not active_df.empty,
        "active_records": len(active_df),
        "total_columns": len(active_df.columns),
        "analytical_features": data_manager.get_analytical_columns(),
        "numerical_features": num_cols,
        "categorical_features": cat_cols,
        "trained_models": list(ml_engine.trained_pipelines.keys()),
    }


# ============================================================
# DATASET ENDPOINTS
# ============================================================

@app.get("/api/dataset/summary", response_model=DatasetSummary)
def get_dataset_summary() -> DatasetSummary:
    return data_manager.get_summary()


@app.get("/api/dataset/schema")
def get_dataset_schema() -> Dict[str, Any]:
    """
    Returns full schema metadata: column names, types, roles, unique values for
    categorical columns. Used by the frontend to dynamically build dropdowns and filters.
    """
    df = data_manager.get_active_df()
    schema = []
    for col in df.columns:
        if col not in ALLOWED_FEATURES:
            continue
        is_numeric = pd.api.types.is_numeric_dtype(df[col])
        entry: Dict[str, Any] = {
            "name": col,
            "dtype": str(df[col].dtype),
            "is_numeric": is_numeric,
            "unique_count": int(df[col].nunique()),
            "missing_count": int(df[col].isnull().sum()),
        }
        if not is_numeric:
            entry["unique_values"] = sorted(df[col].dropna().unique().tolist())
        else:
            entry["min"] = float(df[col].min())
            entry["max"] = float(df[col].max())
        schema.append(entry)
    return {
        "columns": schema,
        "total_analytical_features": len(schema),
        "numerical_features": data_manager.get_numerical_columns(),
        "categorical_features": data_manager.get_categorical_columns(),
    }


@app.post("/api/dataset/preview", response_model=DataPreviewResponse)
def get_dataset_preview(
    filters: Optional[DataFilterRequest] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_dir: Optional[str] = Query("asc"),
) -> DataPreviewResponse:
    df = data_manager.apply_filters(filters)
    total_active = len(data_manager.get_active_df())
    filtered_count = len(df)

    if search and not df.empty:
        search_lower = search.strip().lower()
        match_mask = pd.Series(False, index=df.index)
        for col in df.columns:
            match_mask = match_mask | df[col].astype(str).str.lower().str.contains(
                search_lower, regex=False
            )
        df = df[match_mask]
        filtered_count = len(df)

    if sort_by and sort_by in df.columns:
        ascending = (sort_dir or "asc").lower() == "asc"
        df = df.sort_values(by=sort_by, ascending=ascending)

    total_pages = max(1, (filtered_count + page_size - 1) // page_size)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size

    # Show all columns in preview (full dataset mode)
    preview_cols = [c for c in df.columns if c in ALLOWED_FEATURES]
    records_slice = df[preview_cols].iloc[start_idx:end_idx].replace({np.nan: None}).to_dict(orient="records")

    return DataPreviewResponse(
        total_records=total_active,
        filtered_records=filtered_count,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        columns=preview_cols,
        records=records_slice,
    )


@app.post("/api/dataset/reset")
def reset_dataset() -> Dict[str, Any]:
    df = data_manager.reset_dataset()
    return {
        "status": "success",
        "message": "Dataset successfully reset to default factory baseline.",
        "records": len(df),
    }


@app.post("/api/dataset/upload")
async def upload_csv(file: UploadFile = File(...)) -> Dict[str, Any]:
    content = await file.read()
    success, msg = data_manager.load_uploaded_csv(content, file.filename or "uploaded.csv")
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {
        "status": "success",
        "message": msg,
        "records": len(data_manager.get_active_df()),
    }


@app.post("/api/data/prepare")
def prepare_data(req: DataPrepRequest) -> Dict[str, Any]:
    return data_manager.prepare_data(req)


# ============================================================
# STATISTICS & EDA — Full dataset, all analytical variables
# ============================================================

@app.post("/api/statistics")
def get_all_statistics(filters: Optional[DataFilterRequest] = None) -> Dict[str, Any]:
    df = data_manager.apply_filters(filters)
    correlation_matrix, _ = compute_correlation_data(df)
    if df.empty:
        return {
            "statistics": [],
            "record_count": 0,
            "correlation_matrix": correlation_matrix,
        }

    stats = []
    # Iterate all analytical columns actually present in the dataframe
    for col in data_manager.get_analytical_columns():
        if col in df.columns:
            col_stat = compute_column_statistics(df, col)
            stats.append(col_stat.model_dump())

    return {
        "statistics": stats,
        "record_count": len(df),
        "correlation_matrix": correlation_matrix,
    }


@app.get("/api/statistics/column/{column_name}", response_model=ColumnStatistics)
def get_column_statistics_detail(column_name: str) -> ColumnStatistics:
    # Accept any column that exists in the active dataframe and is in ALLOWED_FEATURES
    df = data_manager.get_active_df()
    if column_name not in ALLOWED_FEATURES:
        raise HTTPException(
            status_code=400,
            detail=f"Column '{column_name}' is not in the analytical feature set.",
        )
    if column_name not in df.columns:
        raise HTTPException(status_code=404, detail=f"Column '{column_name}' not found in dataset.")
    return compute_column_statistics(df, column_name)


@app.post("/api/statistics/focus")
def get_focus_feature_stats(
    feature: str = Query(...),
    filters: Optional[DataFilterRequest] = None,
) -> Dict[str, Any]:
    """
    Returns full statistics for the selected Focus Feature plus cross-variable
    relationships. Handles both numerical and categorical features.
    """
    analytical_cols = data_manager.get_analytical_columns()
    if feature not in analytical_cols:
        raise HTTPException(
            status_code=400,
            detail=f"'{feature}' is not a valid analytical feature.",
        )
    df = data_manager.apply_filters(filters)
    if df.empty:
        return {"feature": feature, "statistics": None, "relationships": []}

    primary_stat = compute_column_statistics(df, feature)
    num_cols = data_manager.get_numerical_columns()
    feature_is_numeric = feature in num_cols

    # Cross-variable relationships
    relationships = []
    for other_col in analytical_cols:
        if other_col == feature or other_col not in df.columns:
            continue
        other_is_numeric = other_col in num_cols

        if feature_is_numeric and other_is_numeric:
            # Pearson correlation for numeric-numeric pairs
            corr = float(
                df[[feature, other_col]].dropna().corr().loc[feature, other_col]
            )
            relationships.append({
                "with": other_col,
                "type": "numeric-numeric",
                "correlation": round(corr, 4),
                "abs_correlation": round(abs(corr), 4),
                "direction": "positive" if corr >= 0 else "negative",
            })
        elif feature_is_numeric and not other_is_numeric:
            # Numeric feature vs categorical: show group means
            group_means = df.groupby(other_col)[feature].mean().round(3).to_dict()
            relationships.append({
                "with": other_col,
                "type": "numeric-categorical",
                "correlation": None,
                "group_means": group_means,
            })
        elif not feature_is_numeric and other_is_numeric:
            # Categorical feature vs numeric: show group means of numeric by category
            group_means = df.groupby(feature)[other_col].mean().round(3).to_dict()
            relationships.append({
                "with": other_col,
                "type": "categorical-numeric",
                "correlation": None,
                "group_means": group_means,
            })
        else:
            # Categorical vs categorical: cross-tab
            relationships.append({
                "with": other_col,
                "type": "categorical-categorical",
                "correlation": None,
            })

    # Cross charts — numerical scatters for numeric features, group bar for categoricals
    cross_charts: Dict[str, Any] = {}

    if feature_is_numeric:
        # Scatter with other numeric columns
        for other_col in num_cols:
            if other_col == feature or other_col not in df.columns:
                continue
            sample = df[[feature, other_col]].dropna().head(300)
            cross_charts[other_col] = [
                {feature: float(r[feature]), other_col: float(r[other_col])}
                for _, r in sample.iterrows()
            ]
    else:
        # Bar charts: group means of numeric columns by this categorical feature
        for other_col in num_cols:
            if other_col not in df.columns:
                continue
            group_means = (
                df.groupby(feature)[other_col].mean().round(2).reset_index()
                .rename(columns={feature: "label", other_col: "value"})
                .to_dict(orient="records")
            )
            cross_charts[other_col] = group_means

    return {
        "feature": feature,
        "statistics": primary_stat.model_dump(),
        "relationships": sorted(
            relationships,
            key=lambda x: x.get("abs_correlation") or 0,
            reverse=True,
        ),
        "cross_charts": cross_charts,
        "record_count": len(df),
        "is_numeric": feature_is_numeric,
    }


# ============================================================
# FEATURE ENGINEERING
# ============================================================

@app.get("/api/feature-engineering")
def get_feature_engineering_info() -> Dict[str, Any]:
    feat_df = data_manager.get_feature_engineered_df()

    features_info = [
        {
            "feature": "Age Group",
            "source": "Age",
            "transformation": "Binned into demographic bands: 18-25, 26-35, 36-45, 46-55, 56-70+",
            "rationale": "Captures generational purchasing patterns non-linearly.",
        },
        {
            "feature": "Purchase Band",
            "source": "Purchase Amount",
            "transformation": "Cut into 5 tiers: Budget, Economy, Mid, High, Premium",
            "rationale": "Categorizes basket tiers for commercial pricing segmentation.",
        },
        {
            "feature": "Rating Band",
            "source": "Review Rating",
            "transformation": "Cut into Poor, Fair, Good, Excellent",
            "rationale": "Converts satisfaction score into interpretable quality tier.",
        },
        {
            "feature": "Activity Level",
            "source": "Previous Purchases",
            "transformation": "Binned into: Newcomer, Occasional, Regular, Loyal, Champion",
            "rationale": "Encodes repeat purchase behavior as a loyalty classification.",
        },
        {
            "feature": "Subscribed",
            "source": "Subscription Status",
            "transformation": "Binary flag: Yes → 1, No → 0",
            "rationale": "Derived classification target. Subscription Status is excluded as a predictor.",
        },
        {
            "feature": "Discount_Flag",
            "source": "Discount Applied",
            "transformation": "Binary flag: Yes → 1, No → 0",
            "rationale": "Enables numeric correlation analysis for discount behavior.",
        },
        {
            "feature": "Promo_Flag",
            "source": "Promo Code Used",
            "transformation": "Binary flag: Yes → 1, No → 0",
            "rationale": "Enables numeric correlation analysis for promotional engagement.",
        },
    ]

    display_cols = [
        "Age", "Age Group",
        "Purchase Amount",
        "Review Rating",
        "Previous Purchases",
        "Subscription Status", "Subscribed",
        "Discount Applied", "Discount_Flag",
        "Promo Code Used", "Promo_Flag",
    ]
    valid_display_cols = [c for c in display_cols if c in feat_df.columns]
    sample_records = feat_df[valid_display_cols].head(10).replace({np.nan: None}).to_dict(orient="records")

    return {
        "features_documentation": features_info,
        "sample_records": sample_records,
        "anti_leakage_note": (
            "CRITICAL: 'Subscription Status' is the classification target source. "
            "The derived binary 'Subscribed' column is the actual target. "
            "'Subscription Status' and 'Subscribed' are both excluded from the predictor matrix X."
        ),
    }


# ============================================================
# DASHBOARD & INSIGHTS
# ============================================================

@app.post("/api/dashboard", response_model=DashboardResponse)
def get_dashboard(filters: Optional[DataFilterRequest] = None) -> DashboardResponse:
    full_df = data_manager.get_active_df()
    filtered_df = data_manager.apply_filters(filters)
    return compute_dashboard_data(filtered_df, full_df)


# ============================================================
# MACHINE LEARNING
# ============================================================

@app.post("/api/model/train", response_model=ModelMetricsResponse)
def train_model(req: TrainModelRequest) -> ModelMetricsResponse:
    df = data_manager.get_active_df()
    if len(df) < 20:
        raise HTTPException(status_code=400, detail="Insufficient records (minimum 20 required).")
    try:
        metrics = ml_engine.train_classification_model(df, req)
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training error: {str(e)}")


@app.get("/api/model/metrics")
def get_all_model_metrics() -> Dict[str, Any]:
    df = data_manager.get_active_df()
    for m in ["logistic_regression", "decision_tree"]:
        if m not in ml_engine.trained_metrics:
            ml_engine.train_classification_model(df, TrainModelRequest(model_type=m))
    return {
        key: metrics.model_dump()
        for key, metrics in ml_engine.trained_metrics.items()
    }


@app.get("/api/model/compare", response_model=ModelComparisonResponse)
def compare_models() -> ModelComparisonResponse:
    df = data_manager.get_active_df()
    return ml_engine.compare_models(df)


@app.post("/api/model/predict", response_model=PredictResponse)
def predict_customer(req: PredictRequest) -> PredictResponse:
    df = data_manager.get_active_df()
    try:
        pred = ml_engine.predict_high_value(req, df)
        return pred
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/api/model/regression")
def train_regression(req: RegressionTrainRequest) -> Dict[str, Any]:
    df = data_manager.get_active_df()
    return ml_engine.train_regression(df, req)


@app.post("/api/model/clustering")
def run_clustering(k_clusters: int = Query(3, ge=2, le=8)) -> Dict[str, Any]:
    df = data_manager.get_active_df()
    return ml_engine.run_clustering(df, k_clusters)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
