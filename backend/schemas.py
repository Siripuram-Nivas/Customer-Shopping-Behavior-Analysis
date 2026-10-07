from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class BaseConfigModel(BaseModel):
    model_config = {"protected_namespaces": ()}


# ============================================================
# DATASET / SUMMARY SCHEMAS
# ============================================================

class DatasetSummary(BaseConfigModel):
    name: str
    rows: int
    columns: int
    missing_values: int
    missing_by_column: Dict[str, int]
    duplicate_records: int
    numerical_features: List[str]
    categorical_features: List[str]
    column_types: Dict[str, str]


class ColumnStatistics(BaseConfigModel):
    feature: str
    count: int
    unique_count: int
    # Numeric fields
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None
    variance: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    q25: Optional[float] = None
    q75: Optional[float] = None
    iqr: Optional[float] = None
    skewness: Optional[float] = None
    mode: Optional[Any] = None
    # Distribution (bins for numeric, value counts for categorical)
    distribution: Optional[List[Dict[str, Any]]] = None
    # Shared
    missing_count: Optional[int] = None
    missing_percentage: Optional[float] = None



class DataPreviewResponse(BaseConfigModel):
    total_records: int
    filtered_records: int
    page: int
    page_size: int
    total_pages: int
    columns: List[str]
    records: List[Dict[str, Any]]


# ============================================================
# FILTER SCHEMA
# ============================================================

class DataFilterRequest(BaseConfigModel):
    # Numerical range filters
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    purchase_min: Optional[float] = None
    purchase_max: Optional[float] = None
    rating_min: Optional[float] = None
    rating_max: Optional[float] = None
    prev_purchases_min: Optional[int] = None
    prev_purchases_max: Optional[int] = None
    # Categorical filters — all support multi-select
    frequency_categories: Optional[List[str]] = None
    gender: Optional[List[str]] = None
    season: Optional[List[str]] = None
    category: Optional[List[str]] = None
    subscription_status: Optional[List[str]] = None
    shipping_type: Optional[List[str]] = None
    payment_method: Optional[List[str]] = None
    discount_applied: Optional[List[str]] = None
    promo_code_used: Optional[List[str]] = None
    size: Optional[List[str]] = None
    color: Optional[List[str]] = None
    preferred_brand: Optional[List[str]] = None
    location: Optional[List[str]] = None


# ============================================================
# DASHBOARD SCHEMAS
# ============================================================

class DashboardResponse(BaseConfigModel):
    # Dataset Profile
    profile_kpis: Dict[str, Any]
    age_distribution: List[Dict[str, Any]]
    age_group_distribution: List[Dict[str, Any]]
    gender_distribution: List[Dict[str, Any]]
    subscription_distribution: List[Dict[str, Any]]
    frequency_distribution: List[Dict[str, Any]]
    season_distribution: List[Dict[str, Any]]
    
    # Revenue Behavior
    category_analysis: List[Dict[str, Any]]
    item_revenue: List[Dict[str, Any]]
    season_revenue: List[Dict[str, Any]]
    
    # Loyalty
    loyalty_analysis: List[Dict[str, Any]]
    
    # Promotions
    discount_subscription: List[Dict[str, Any]]
    promo_subscription: List[Dict[str, Any]]
    
    # Geography
    location_analysis: List[Dict[str, Any]]
    
    # Relationships
    correlation_matrix: Dict[str, Any]
    correlation_with_subscription: List[Dict[str, Any]]
    
    # Segmentation (K-Means)
    segment_profile: List[Dict[str, Any]]
    elbow_curve: List[Dict[str, Any]]
    
    # Statistical Summary
    stat_summary: Dict[str, Any]


# ============================================================
# DATA PREPARATION SCHEMA
# ============================================================

class DataPrepRequest(BaseConfigModel):
    handle_missing: str = "median"   # median, mean, drop
    remove_duplicates: bool = True
    remove_outliers: bool = False
    outlier_method: str = "iqr"      # iqr, zscore


# ============================================================
# MACHINE LEARNING SCHEMAS
# ============================================================

class TrainModelRequest(BaseConfigModel):
    model_type: str = "logistic_regression"  # logistic_regression, decision_tree
    test_size: float = 0.20
    random_state: int = 42


class RegressionTrainRequest(BaseConfigModel):
    model_type: str = "random_forest"
    test_size: float = 0.20
    random_state: int = 42


class ModelMetricsResponse(BaseConfigModel):
    model_name: str
    target_variable: str
    features_used: List[str]
    train_accuracy: float
    test_accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    confusion_matrix: List[List[int]]
    classification_report: Dict[str, Any]
    feature_importance: List[Dict[str, Any]]
    cross_val_mean: Optional[float] = None
    overfitting_analysis: Optional[str] = None
    leakage_prevention_note: Optional[str] = None


class ModelComparisonResponse(BaseConfigModel):
    models: List[Dict[str, Any]]
    strongest_model: str
    selection_criterion: str


# ============================================================
# PREDICTION SCHEMA
# ============================================================

class PredictRequest(BaseConfigModel):
    model_config = {"protected_namespaces": (), "populate_by_name": True}

    model_type: str = "logistic_regression"
    
    # Numerical
    Age: int = Field(..., ge=10, le=120)
    Purchase_Amount: float = Field(..., alias="Purchase Amount", ge=0)
    Review_Rating: float = Field(..., alias="Review Rating", ge=1.0, le=5.0)
    Previous_Purchases: int = Field(..., alias="Previous Purchases", ge=0)
    
    # Categorical
    Gender: str = Field(...)
    Category: str = Field(...)
    Item_Purchased: str = Field(..., alias="Item Purchased")
    Location: str = Field(...)
    Season: str = Field(...)
    Color: str = Field(...)
    Preferred_Brand: str = Field(..., alias="Preferred Brand")
    Discount_Applied: str = Field(..., alias="Discount Applied")
    Promo_Code_Used: str = Field(..., alias="Promo Code Used")
    Frequency_of_Purchases: str = Field(..., alias="Frequency of Purchases")
    Payment_Method: str = Field(..., alias="Payment Method")
    Size: str = Field(...)
    Shipping_Type: str = Field(..., alias="Shipping Type")


class PredictResponse(BaseConfigModel):
    model_used: str
    prediction: str          # "Subscribed" or "Not Subscribed"
    probability_subscribed: float
    probability_percentage: str
    confidence_level: str
    feature_impacts: List[Dict[str, Any]]
    explanation: str
