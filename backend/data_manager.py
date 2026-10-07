from __future__ import annotations

import io
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from backend.config import (
    ALLOWED_FEATURES,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    IDENTIFIER_COLUMNS,
    CLASSIFICATION_TARGET,
)
from backend.schemas import DataFilterRequest, DataPrepRequest, DatasetSummary

DATA_FILE_DEFAULT = Path(__file__).resolve().parent.parent / "data" / "customer_shopping_trends.csv"


class DataManager:
    def __init__(self, data_path: Path = DATA_FILE_DEFAULT):
        self.data_path = data_path
        self._raw_df: pd.DataFrame = pd.DataFrame()
        self._active_df: pd.DataFrame = pd.DataFrame()
        self._engineered_df: Optional[pd.DataFrame] = None
        self.load_initial_data()

    def load_initial_data(self) -> None:
        if not self.data_path.exists():
            from generate_data import generate_dataset
            self.data_path.parent.mkdir(parents=True, exist_ok=True)
            generate_dataset(self.data_path)

        df = pd.read_csv(self.data_path)

        # Validate that the required analytical features are present
        missing_required = [f for f in ALLOWED_FEATURES if f not in df.columns]
        if missing_required:
            raise ValueError(
                f"Required features missing from dataset: {missing_required}. "
                "Dataset must contain all required analytical variables."
            )

        # Load FULL dataset — only drop pure identifier columns (Customer ID)
        # This preserves Color, Preferred Brand, and all other analytical columns
        cols_to_load = [c for c in df.columns if c not in IDENTIFIER_COLUMNS]
        self._raw_df = df[cols_to_load].copy()
        self._active_df = df[cols_to_load].copy()
        self._engineered_df = None

    def reset_dataset(self) -> pd.DataFrame:
        self._active_df = self._raw_df.copy()
        self._engineered_df = None
        return self._active_df

    def load_uploaded_csv(self, file_bytes: bytes, filename: str) -> Tuple[bool, str]:
        try:
            df = pd.read_csv(io.BytesIO(file_bytes))
            if df.empty:
                return False, "Uploaded CSV file is empty."

            # Validate that the core required features are present
            missing_required = [f for f in ALLOWED_FEATURES if f not in df.columns]
            if missing_required:
                return False, (
                    f"Required feature(s) missing: {missing_required}. "
                    f"Dataset must contain: {ALLOWED_FEATURES}"
                )

            # Load full dataset, excluding identifiers
            cols_to_load = [c for c in df.columns if c not in IDENTIFIER_COLUMNS]
            self._raw_df = df[cols_to_load].copy()
            self._active_df = df[cols_to_load].copy()
            self._engineered_df = None
            return True, f"Successfully loaded {len(df)} records from {filename}."
        except Exception as e:
            return False, f"Failed to parse CSV file: {str(e)}"

    def get_active_df(self) -> pd.DataFrame:
        return self._active_df

    def get_analytical_columns(self) -> List[str]:
        """Return all columns available for analysis (excludes identifiers, derived targets)."""
        return [c for c in self._active_df.columns if c in ALLOWED_FEATURES]

    def get_numerical_columns(self) -> List[str]:
        """Dynamically detect numerical columns from the active dataframe."""
        return [
            c for c in self._active_df.columns
            if c in ALLOWED_FEATURES and pd.api.types.is_numeric_dtype(self._active_df[c])
        ]

    def get_categorical_columns(self) -> List[str]:
        """Dynamically detect categorical columns from the active dataframe."""
        return [
            c for c in self._active_df.columns
            if c in ALLOWED_FEATURES and not pd.api.types.is_numeric_dtype(self._active_df[c])
        ]

    def apply_filters(self, filters: Optional[DataFilterRequest]) -> pd.DataFrame:
        df = self._active_df.copy()
        if not filters:
            return df

        if filters.age_min is not None and "Age" in df.columns:
            df = df[df["Age"] >= filters.age_min]

        if filters.age_max is not None and "Age" in df.columns:
            df = df[df["Age"] <= filters.age_max]

        if filters.purchase_min is not None and "Purchase Amount" in df.columns:
            df = df[df["Purchase Amount"] >= filters.purchase_min]

        if filters.purchase_max is not None and "Purchase Amount" in df.columns:
            df = df[df["Purchase Amount"] <= filters.purchase_max]

        if filters.rating_min is not None and "Review Rating" in df.columns:
            df = df[df["Review Rating"] >= filters.rating_min]

        if filters.rating_max is not None and "Review Rating" in df.columns:
            df = df[df["Review Rating"] <= filters.rating_max]

        if filters.prev_purchases_min is not None and "Previous Purchases" in df.columns:
            df = df[df["Previous Purchases"] >= filters.prev_purchases_min]

        if filters.prev_purchases_max is not None and "Previous Purchases" in df.columns:
            df = df[df["Previous Purchases"] <= filters.prev_purchases_max]

        if filters.frequency_categories and "Frequency of Purchases" in df.columns:
            df = df[df["Frequency of Purchases"].isin(filters.frequency_categories)]

        if filters.gender and "Gender" in df.columns:
            df = df[df["Gender"].isin(filters.gender)]

        if filters.season and "Season" in df.columns:
            df = df[df["Season"].isin(filters.season)]

        if filters.category and "Category" in df.columns:
            df = df[df["Category"].isin(filters.category)]

        if filters.subscription_status and "Subscription Status" in df.columns:
            df = df[df["Subscription Status"].isin(filters.subscription_status)]

        if filters.shipping_type and "Shipping Type" in df.columns:
            df = df[df["Shipping Type"].isin(filters.shipping_type)]

        if filters.payment_method and "Payment Method" in df.columns:
            df = df[df["Payment Method"].isin(filters.payment_method)]

        if filters.discount_applied and "Discount Applied" in df.columns:
            df = df[df["Discount Applied"].isin(filters.discount_applied)]

        if filters.promo_code_used and "Promo Code Used" in df.columns:
            df = df[df["Promo Code Used"].isin(filters.promo_code_used)]

        if filters.size and "Size" in df.columns:
            df = df[df["Size"].isin(filters.size)]

        if filters.color and "Color" in df.columns:
            df = df[df["Color"].isin(filters.color)]

        if filters.preferred_brand and "Preferred Brand" in df.columns:
            df = df[df["Preferred Brand"].isin(filters.preferred_brand)]

        if filters.location and "Location" in df.columns:
            df = df[df["Location"].isin(filters.location)]

        return df

    def get_summary(self, df: Optional[pd.DataFrame] = None) -> DatasetSummary:
        target_df = self._active_df if df is None else df
        missing_by_col = {col: int(target_df[col].isnull().sum()) for col in target_df.columns}
        total_missing = int(sum(missing_by_col.values()))
        duplicate_count = int(target_df.duplicated().sum())

        # Dynamically detect numerical and categorical columns
        num_cols = [
            c for c in target_df.columns
            if c in ALLOWED_FEATURES and pd.api.types.is_numeric_dtype(target_df[c])
        ]
        cat_cols = [
            c for c in target_df.columns
            if c in ALLOWED_FEATURES and not pd.api.types.is_numeric_dtype(target_df[c])
        ]
        analytical_cols = [c for c in target_df.columns if c in ALLOWED_FEATURES]
        col_types = {col: str(dtype) for col, dtype in target_df.dtypes.items() if col in ALLOWED_FEATURES}

        return DatasetSummary(
            name="Customer Shopping Trends Dataset",
            rows=len(target_df),
            columns=len(analytical_cols),
            missing_values=total_missing,
            missing_by_column=missing_by_col,
            duplicate_records=duplicate_count,
            numerical_features=num_cols,
            categorical_features=cat_cols,
            column_types=col_types,
        )

    def prepare_data(self, req: DataPrepRequest) -> Dict[str, Any]:
        df = self._active_df.copy()
        initial_rows = len(df)
        initial_missing = int(df.isnull().sum().sum())

        num_cols = df.select_dtypes(include=[np.number]).columns
        cat_cols = df.select_dtypes(exclude=[np.number]).columns

        if req.handle_missing == "drop":
            df = df.dropna()
        elif req.handle_missing == "mean":
            for c in num_cols:
                df[c] = df[c].fillna(df[c].mean())
            for c in cat_cols:
                if not df[c].mode().empty:
                    df[c] = df[c].fillna(df[c].mode()[0])
        else:  # default median
            for c in num_cols:
                df[c] = df[c].fillna(df[c].median())
            for c in cat_cols:
                if not df[c].mode().empty:
                    df[c] = df[c].fillna(df[c].mode()[0])

        dupes_removed = 0
        if req.remove_duplicates:
            dupes_count = int(df.duplicated().sum())
            if dupes_count > 0:
                df = df.drop_duplicates()
                dupes_removed = dupes_count

        outliers_removed = 0
        if req.remove_outliers and "Purchase Amount" in df.columns:
            if req.outlier_method == "iqr":
                q25 = df["Purchase Amount"].quantile(0.25)
                q75 = df["Purchase Amount"].quantile(0.75)
                iqr = q75 - q25
                lower_bound = q25 - 1.5 * iqr
                upper_bound = q75 + 1.5 * iqr
                mask = (df["Purchase Amount"] >= lower_bound) & (df["Purchase Amount"] <= upper_bound)
                outliers_removed = int((~mask).sum())
                df = df[mask]
            elif req.outlier_method == "zscore":
                mean = df["Purchase Amount"].mean()
                std = df["Purchase Amount"].std()
                if std > 0:
                    z = (df["Purchase Amount"] - mean).abs() / std
                    mask = z <= 3.0
                    outliers_removed = int((~mask).sum())
                    df = df[mask]

        self._active_df = df
        final_rows = len(df)
        final_missing = int(df.isnull().sum().sum())

        return {
            "initial_rows": initial_rows,
            "final_rows": final_rows,
            "initial_missing": initial_missing,
            "final_missing": final_missing,
            "duplicates_removed": dupes_removed,
            "outliers_removed": outliers_removed,
            "message": f"Data preparation complete. Active records: {final_rows} (removed {initial_rows - final_rows} rows).",
        }

    def get_feature_engineered_df(self) -> pd.DataFrame:
        """
        Feature engineering using notebook logic.
        """
        df = self._active_df.copy()

        if "Subscription Status" in df.columns:
            df["Subscribed"] = (df["Subscription Status"].str.lower() == "yes").astype(int)

        if "Discount Applied" in df.columns:
            df["Discount_Flag"] = (df["Discount Applied"].str.lower() == "yes").astype(int)

        if "Promo Code Used" in df.columns:
            df["Promo_Flag"] = (df["Promo Code Used"].str.lower() == "yes").astype(int)

        if "Age" in df.columns:
            df["Age Group"] = pd.cut(
                df["Age"],
                bins=[17, 25, 35, 45, 55, 100],
                labels=["18-25", "26-35", "36-45", "46-55", "56-70+"]
            ).astype(str)

        if "Purchase Amount" in df.columns and "Previous Purchases" in df.columns:
            df["Spend per Previous Purchase"] = (
                df["Purchase Amount"] / df["Previous Purchases"].replace(0, np.nan)
            )

        self._engineered_df = df
        return df


# Global singleton instance
data_manager = DataManager()
