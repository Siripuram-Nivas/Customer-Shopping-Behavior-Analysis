from __future__ import annotations

from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

from backend.config import ALLOWED_FEATURES, NUMERICAL_FEATURES
from backend.schemas import ColumnStatistics, DashboardResponse

# ============================================================
# COLUMN STATISTICS
# ============================================================

def compute_column_statistics(df: pd.DataFrame, col: str) -> ColumnStatistics:
    if col not in df.columns or df.empty:
        return ColumnStatistics(feature=col, count=0, unique_count=0)

    series = df[col].dropna()
    count = len(series)
    unique_count = int(series.nunique())

    if np.issubdtype(series.dtype, np.number):
        mean_val = float(series.mean())
        median_val = float(series.median())
        std_val = float(series.std()) if count > 1 else 0.0
        var_val = float(series.var()) if count > 1 else 0.0
        min_val = float(series.min())
        max_val = float(series.max())
        q25 = float(series.quantile(0.25))
        q75 = float(series.quantile(0.75))
        iqr = float(q75 - q25)
        skew_val = float(series.skew()) if count > 2 else 0.0
        mode_series = series.mode()
        mode_val = float(mode_series.iloc[0]) if not mode_series.empty else None

        counts_arr, bin_edges = np.histogram(series, bins=10)
        distribution = [
            {
                "range": f"{round(float(bin_edges[i]), 1)} - {round(float(bin_edges[i + 1]), 1)}",
                "count": int(counts_arr[i]),
                "percentage": round((int(counts_arr[i]) / count) * 100, 1),
            }
            for i in range(len(counts_arr))
        ]

        return ColumnStatistics(
            feature=col,
            count=count,
            mean=round(mean_val, 3),
            median=round(median_val, 3),
            std=round(std_val, 3),
            variance=round(var_val, 3),
            min=round(min_val, 3),
            max=round(max_val, 3),
            q25=round(q25, 3),
            q75=round(q75, 3),
            iqr=round(iqr, 3),
            skewness=round(skew_val, 3),
            mode=round(mode_val, 3) if mode_val is not None else None,
            unique_count=unique_count,
            distribution=distribution,
        )
    else:
        mode_series = series.mode()
        mode_val = str(mode_series.iloc[0]) if not mode_series.empty else None
        value_counts = series.value_counts().head(20)
        distribution = [
            {"label": str(k), "count": int(v), "percentage": round((v / count) * 100, 1)}
            for k, v in value_counts.items()
        ]

        return ColumnStatistics(
            feature=col,
            count=count,
            mode=mode_val,
            unique_count=unique_count,
            distribution=distribution,
        )


# ============================================================
# DASHBOARD DATA (Notebook Transformation)
# ============================================================

def safe_value_counts(df: pd.DataFrame, col: str) -> List[Dict[str, Any]]:
    if col not in df.columns or df.empty:
        return []
    res = df[col].value_counts(normalize=True).mul(100).round(2)
    return [{"label": str(k), "value": float(v)} for k, v in res.items()]

def compute_dashboard_data(df: pd.DataFrame, full_df: pd.DataFrame) -> DashboardResponse:
    if df.empty:
        raise ValueError("DataFrame is empty. Cannot compute dashboard data.")

    # Derive notebook features required for dashboard visualization
    if "Subscription Status" in df.columns and "Subscribed" not in df.columns:
        df["Subscribed"] = (df["Subscription Status"].str.lower() == "yes").astype(int)
    
    if "Discount Applied" in df.columns and "Discount_Flag" not in df.columns:
        df["Discount_Flag"] = (df["Discount Applied"].str.lower() == "yes").astype(int)
        
    if "Promo Code Used" in df.columns and "Promo_Flag" not in df.columns:
        df["Promo_Flag"] = (df["Promo Code Used"].str.lower() == "yes").astype(int)
        
    if "Age" in df.columns and "Age Group" not in df.columns:
        df["Age Group"] = pd.cut(
            df["Age"],
            bins=[17, 25, 35, 45, 55, 100],
            labels=["18-25", "26-35", "36-45", "46-55", "56-70+"]
        ).astype(str)

    # 1. Dataset Profile KPIs
    total_revenue = float(df["Purchase Amount"].sum()) if "Purchase Amount" in df.columns else 0.0
    total_customers = len(df)
    avg_spend = float(df["Purchase Amount"].mean()) if "Purchase Amount" in df.columns else 0.0
    sub_rate = float(df["Subscribed"].mean() * 100) if "Subscribed" in df.columns else 0.0

    profile_kpis = {
        "Total Customers": total_customers,
        "Total Revenue": round(total_revenue, 2),
        "Average Spend": round(avg_spend, 2),
        "Subscription Rate": round(sub_rate, 2)
    }

    # Distributions
    age_dist = []
    if "Age" in df.columns:
        counts_arr, edges = np.histogram(df["Age"], bins=20)
        age_dist = [{"bin": f"{int(edges[i])}-{int(edges[i + 1])}", "count": int(counts_arr[i])} for i in range(len(counts_arr))]

    age_group_distribution = []
    if "Age Group" in df.columns:
        ag_counts = df["Age Group"].value_counts().sort_index()
        age_group_distribution = [{"label": str(k), "count": int(v)} for k, v in ag_counts.items()]

    gender_distribution = []
    if "Gender" in df.columns:
        g_counts = df["Gender"].value_counts()
        gender_distribution = [{"label": str(k), "count": int(v)} for k, v in g_counts.items()]

    subscription_distribution = safe_value_counts(df, "Subscription Status")
    frequency_distribution = safe_value_counts(df, "Frequency of Purchases")
    season_distribution = safe_value_counts(df, "Season")

    # 2. Revenue Behavior
    category_analysis = []
    if "Category" in df.columns and "Purchase Amount" in df.columns:
        cat_df = df.groupby("Category").agg(
            Customers=("Customer ID", "count") if "Customer ID" in df.columns else ("Age", "count"),
            Total_Revenue=("Purchase Amount", "sum"),
            Average_Spend=("Purchase Amount", "mean")
        ).sort_values("Total_Revenue", ascending=False).round(2).reset_index()
        category_analysis = cat_df.to_dict(orient="records")

    item_revenue = []
    if "Item Purchased" in df.columns and "Purchase Amount" in df.columns:
        item_df = df.groupby("Item Purchased")["Purchase Amount"].agg(["count", "sum", "mean"]).sort_values("sum", ascending=False).head(10).round(2).reset_index()
        item_df.columns = ["Item Purchased", "Transactions", "Revenue", "Average_Spend"]
        item_revenue = item_df.to_dict(orient="records")

    season_revenue = []
    if "Season" in df.columns and "Purchase Amount" in df.columns:
        sea_df = df.groupby("Season").agg(
            Total_Revenue=("Purchase Amount", "sum"),
            Average_Spend=("Purchase Amount", "mean")
        ).sort_values("Total_Revenue", ascending=False).round(2).reset_index()
        season_revenue = sea_df.to_dict(orient="records")

    # 3. Loyalty
    loyalty_analysis = []
    if "Previous Purchases" in df.columns and "Purchase Amount" in df.columns and "Subscribed" in df.columns:
        loyalty_df = df.groupby("Previous Purchases").agg(
            Average_Current_Spend=("Purchase Amount", "mean"),
            Subscription_Rate=("Subscribed", "mean")
        ).reset_index()
        loyalty_df["Subscription_Rate"] = (loyalty_df["Subscription_Rate"] * 100).round(2)
        loyalty_df["Average_Current_Spend"] = loyalty_df["Average_Current_Spend"].round(2)
        loyalty_analysis = loyalty_df.sort_values("Previous Purchases").to_dict(orient="records")

    # 4. Promotions
    discount_subscription = []
    if "Discount Applied" in df.columns and "Subscription Status" in df.columns:
        discount_df = pd.crosstab(df["Discount Applied"], df["Subscription Status"], normalize="index").mul(100).round(2)
        discount_df = discount_df.reset_index()
        discount_subscription = discount_df.to_dict(orient="records")

    promo_subscription = []
    if "Promo Code Used" in df.columns and "Subscription Status" in df.columns:
        promo_df = pd.crosstab(df["Promo Code Used"], df["Subscription Status"], normalize="index").mul(100).round(2)
        promo_df = promo_df.reset_index()
        promo_subscription = promo_df.to_dict(orient="records")

    # 5. Geography
    location_analysis = []
    if "Location" in df.columns and "Purchase Amount" in df.columns and "Subscribed" in df.columns:
        loc_df = df.groupby("Location").agg(
            Customers=("Age", "count"),
            Revenue=("Purchase Amount", "sum"),
            Average_Spend=("Purchase Amount", "mean"),
            Subscription_Rate=("Subscribed", "mean")
        ).reset_index()
        loc_df["Subscription_Rate"] = (loc_df["Subscription_Rate"] * 100).round(2)
        loc_df["Revenue"] = loc_df["Revenue"].round(2)
        loc_df["Average_Spend"] = loc_df["Average_Spend"].round(2)
        location_analysis = loc_df.sort_values("Revenue", ascending=False).head(10).to_dict(orient="records")

    # 6. Relationships (Correlation)
    corr_matrix_data = {"columns": [], "matrix": []}
    corr_with_sub = []
    corr_cols = ["Age", "Purchase Amount", "Review Rating", "Previous Purchases", "Subscribed", "Discount_Flag", "Promo_Flag"]
    available_corr_cols = [c for c in corr_cols if c in df.columns]
    
    if len(available_corr_cols) > 1:
        corr_df = df[available_corr_cols].corr().fillna(0)
        corr_matrix_data["columns"] = available_corr_cols
        corr_matrix_data["matrix"] = [
            [round(float(corr_df.loc[r, c]), 3) for c in available_corr_cols]
            for r in available_corr_cols
        ]
        if "Subscribed" in corr_df.columns:
            sub_corr = corr_df["Subscribed"].drop("Subscribed").sort_values(key=np.abs, ascending=False).reset_index()
            sub_corr.columns = ["Feature", "Correlation"]
            sub_corr["Correlation"] = sub_corr["Correlation"].round(3)
            corr_with_sub = sub_corr.to_dict(orient="records")

    # 7. Segmentation (K-Means)
    segment_profile = []
    elbow_curve = []
    seg_cols = ["Age", "Purchase Amount", "Previous Purchases", "Review Rating"]
    available_seg_cols = [c for c in seg_cols if c in df.columns]
    
    if len(available_seg_cols) == 4:
        seg_data = df[available_seg_cols].copy().dropna()
        if len(seg_data) > 10:
            seg_scaled = StandardScaler().fit_transform(seg_data)
            
            # Elbow curve up to K=8
            for k in range(2, min(9, len(seg_data))):
                km = KMeans(n_clusters=k, n_init=10, random_state=42)
                km.fit(seg_scaled)
                elbow_curve.append({"k": k, "inertia": float(km.inertia_)})
            
            # Final K=4 Profile
            final_km = KMeans(n_clusters=4, n_init=10, random_state=42)
            seg_data["Segment"] = final_km.fit_predict(seg_scaled)
            if "Subscribed" in df.columns:
                seg_data["Subscribed"] = df.loc[seg_data.index, "Subscribed"]
                
                sp = seg_data.groupby("Segment").agg(
                    Customers=("Age", "count"),
                    Avg_Age=("Age", "mean"),
                    Avg_Spend=("Purchase Amount", "mean"),
                    Avg_Previous=("Previous Purchases", "mean"),
                    Avg_Rating=("Review Rating", "mean"),
                    Subscription_Rate=("Subscribed", "mean"),
                    Revenue=("Purchase Amount", "sum")
                ).round(2).reset_index()
                sp["Subscription_Rate"] = (sp["Subscription_Rate"] * 100).round(2)
                sp["Segment"] = sp["Segment"].astype(str)
                segment_profile = sp.sort_values("Revenue", ascending=False).to_dict(orient="records")

    # 8. Statistical Summary
    stat_summary = {}
    try:
        top_category = df.groupby("Category")["Purchase Amount"].sum().idxmax() if "Category" in df.columns else ""
        top_category_rev = df.groupby("Category")["Purchase Amount"].sum().max() if "Category" in df.columns else 0.0
        
        top_season = df.groupby("Season")["Purchase Amount"].sum().idxmax() if "Season" in df.columns else ""
        top_season_rev = df.groupby("Season")["Purchase Amount"].sum().max() if "Season" in df.columns else 0.0
        
        top_item = df.groupby("Item Purchased")["Purchase Amount"].sum().idxmax() if "Item Purchased" in df.columns else ""
        
        disc_yes_rate = df.loc[df["Discount Applied"].str.lower() == "yes", "Subscribed"].mean() * 100 if "Discount Applied" in df.columns else 0.0
        disc_no_rate = df.loc[df["Discount Applied"].str.lower() == "no", "Subscribed"].mean() * 100 if "Discount Applied" in df.columns else 0.0
        
        stat_summary = {
            "top_category": top_category,
            "top_category_revenue": round(top_category_rev, 2),
            "top_season": top_season,
            "top_season_revenue": round(top_season_rev, 2),
            "top_item": top_item,
            "discount_yes_rate": round(disc_yes_rate, 2),
            "discount_no_rate": round(disc_no_rate, 2),
        }
    except Exception:
        pass

    return DashboardResponse(
        profile_kpis=profile_kpis,
        age_distribution=age_dist,
        age_group_distribution=age_group_distribution,
        gender_distribution=gender_distribution,
        subscription_distribution=subscription_distribution,
        frequency_distribution=frequency_distribution,
        season_distribution=season_distribution,
        category_analysis=category_analysis,
        item_revenue=item_revenue,
        season_revenue=season_revenue,
        loyalty_analysis=loyalty_analysis,
        discount_subscription=discount_subscription,
        promo_subscription=promo_subscription,
        location_analysis=location_analysis,
        correlation_matrix=corr_matrix_data,
        correlation_with_subscription=corr_with_sub,
        segment_profile=segment_profile,
        elbow_curve=elbow_curve,
        stat_summary=stat_summary
    )
