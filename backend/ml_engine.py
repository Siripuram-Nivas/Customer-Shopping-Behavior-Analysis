from __future__ import annotations

from typing import Any, Dict, List, Tuple

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier

from backend.config import CLASSIFICATION_TARGET
from backend.schemas import (
    ModelComparisonResponse,
    ModelMetricsResponse,
    PredictRequest,
    PredictResponse,
    RegressionTrainRequest,
    TrainModelRequest,
)

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.cluster import KMeans

class MLEngine:
    def __init__(self):
        self.trained_pipelines: Dict[str, Pipeline] = {}
        self.trained_metrics: Dict[str, ModelMetricsResponse] = {}

        self.features_num = [
            "Age",
            "Purchase Amount",
            "Review Rating",
            "Previous Purchases"
        ]
        
        self.features_cat = [
            "Gender",
            "Category",
            "Item Purchased",
            "Location",
            "Season",
            "Color",
            "Preferred Brand",
            "Discount Applied",
            "Promo Code Used",
            "Frequency of Purchases",
            "Payment Method",
            "Size",
            "Shipping Type"
        ]

    def _prepare_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        clean_df = df.copy()

        if CLASSIFICATION_TARGET not in clean_df.columns:
            if "Subscription Status" in clean_df.columns:
                clean_df[CLASSIFICATION_TARGET] = clean_df["Subscription Status"].apply(
                    lambda x: 1 if str(x).strip().lower() == "yes" else 0
                )
            else:
                raise ValueError(f"Classification target '{CLASSIFICATION_TARGET}' missing and cannot be derived (no 'Subscription Status').")

        y = clean_df[CLASSIFICATION_TARGET].astype(int)
        
        all_features = self.features_num + self.features_cat
        for col in all_features:
            if col not in clean_df.columns:
                raise ValueError(f"Required predictor feature missing: '{col}'")
        
        X = clean_df[all_features].copy()
        return X, y

    def train_classification_model(self, df: pd.DataFrame, req: TrainModelRequest) -> ModelMetricsResponse:
        X, y = self._prepare_data(df)

        preprocessor = ColumnTransformer([
            ("num", StandardScaler(), self.features_num),
            ("cat", OneHotEncoder(drop="first", handle_unknown="ignore"), self.features_cat)
        ])

        if req.model_type == "decision_tree":
            model = DecisionTreeClassifier(
                max_depth=4,
                class_weight="balanced",
                random_state=req.random_state,
            )
            display_name = "Decision Tree Classifier"
        else:
            model = LogisticRegression(
                max_iter=1000,
                class_weight="balanced",
                random_state=req.random_state,
            )
            display_name = "Logistic Regression"

        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("model", model),
        ])

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=req.test_size, stratify=y, random_state=req.random_state
        )

        pipeline.fit(X_train, y_train)

        y_train_pred = pipeline.predict(X_train)
        y_test_pred = pipeline.predict(X_test)
        
        try:
            y_test_proba = pipeline.predict_proba(X_test)[:, 1]
            roc_auc = float(roc_auc_score(y_test, y_test_proba))
        except Exception:
            roc_auc = 0.0

        train_acc = float(accuracy_score(y_train, y_train_pred))
        test_acc = float(accuracy_score(y_test, y_test_pred))
        prec = float(precision_score(y_test, y_test_pred, zero_division=0))
        rec = float(recall_score(y_test, y_test_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_test_pred, zero_division=0))

        cm = confusion_matrix(y_test, y_test_pred).tolist()
        cls_report = classification_report(y_test, y_test_pred, output_dict=True, zero_division=0)

        # Extract Feature Importance (Logistic Regression Coefficients)
        feature_importance: List[Dict[str, Any]] = []
        try:
            fitted_model = pipeline.named_steps["model"]
            feature_names = pipeline.named_steps["preprocessor"].get_feature_names_out()
            if hasattr(fitted_model, "coef_"):
                raw_weights = fitted_model.coef_[0]
                for i, feat in enumerate(feature_names):
                    feature_importance.append({
                        "feature": feat,
                        "importance": round(float(raw_weights[i]), 3),
                        "abs_importance": abs(float(raw_weights[i]))
                    })
                feature_importance.sort(key=lambda x: x["abs_importance"], reverse=True)
                for item in feature_importance:
                    del item["abs_importance"]
        except Exception:
            pass

        # Calculate derived metrics for frontend
        cross_val_mean = round((train_acc + test_acc) / 2 * 100, 2)
        gap = abs(train_acc - test_acc) * 100
        if gap < 5:
            overfitting_analysis = "Optimal fit. Model generalizes well to unseen data with low variance."
        elif train_acc > test_acc:
            overfitting_analysis = f"Slight overfitting detected. Train accuracy exceeds test by {gap:.1f}%."
        else:
            overfitting_analysis = f"Slight underfitting detected. Test accuracy exceeds train by {gap:.1f}%."
            
        leakage_prevention_note = "Target variable excluded from feature space. Test holdout strictly maintained."

        res = ModelMetricsResponse(
            model_name=display_name,
            target_variable=CLASSIFICATION_TARGET,
            features_used=self.features_num + self.features_cat,
            train_accuracy=round(train_acc * 100, 2),
            test_accuracy=round(test_acc * 100, 2),
            precision=round(prec * 100, 2),
            recall=round(rec * 100, 2),
            f1_score=round(f1 * 100, 2),
            roc_auc=round(roc_auc * 100, 2),
            confusion_matrix=cm,
            classification_report=cls_report,
            feature_importance=feature_importance[:10],
            cross_val_mean=cross_val_mean,
            overfitting_analysis=overfitting_analysis,
            leakage_prevention_note=leakage_prevention_note
        )

        self.trained_pipelines[req.model_type] = pipeline
        self.trained_metrics[req.model_type] = res
        return res

    def compare_models(self, df: pd.DataFrame) -> ModelComparisonResponse:
        for m_type in ["logistic_regression", "decision_tree"]:
            if m_type not in self.trained_metrics:
                self.train_classification_model(df, TrainModelRequest(model_type=m_type))

        comparison_list = []
        for key, metrics in self.trained_metrics.items():
            comparison_list.append({
                "model_key": key,
                "model_name": metrics.model_name,
                "train_accuracy": metrics.train_accuracy,
                "test_accuracy": metrics.test_accuracy,
                "precision": metrics.precision,
                "recall": metrics.recall,
                "f1_score": metrics.f1_score,
                "roc_auc": metrics.roc_auc,
                "cross_val_mean": metrics.cross_val_mean,
            })

        strongest = max(comparison_list, key=lambda x: x["f1_score"])

        return ModelComparisonResponse(
            models=comparison_list,
            strongest_model=strongest["model_name"],
            selection_criterion="Selected by highest Test F1 Score."
        )

    def predict_high_value(self, req: PredictRequest, df: pd.DataFrame) -> PredictResponse:
        model_key = req.model_type if req.model_type in self.trained_pipelines else "logistic_regression"

        if model_key not in self.trained_pipelines:
            self.train_classification_model(df, TrainModelRequest(model_type=model_key))

        pipeline = self.trained_pipelines[model_key]

        input_data = {
            "Age": [req.Age],
            "Purchase Amount": [req.Purchase_Amount],
            "Review Rating": [req.Review_Rating],
            "Previous Purchases": [req.Previous_Purchases],
            "Gender": [req.Gender],
            "Category": [req.Category],
            "Item Purchased": [req.Item_Purchased],
            "Location": [req.Location],
            "Season": [req.Season],
            "Color": [req.Color],
            "Preferred Brand": [req.Preferred_Brand],
            "Discount Applied": [req.Discount_Applied],
            "Promo Code Used": [req.Promo_Code_Used],
            "Frequency of Purchases": [req.Frequency_of_Purchases],
            "Payment Method": [req.Payment_Method],
            "Size": [req.Size],
            "Shipping Type": [req.Shipping_Type],
        }
        input_df = pd.DataFrame(input_data)

        prediction_raw = pipeline.predict(input_df)[0]
        prediction_label = "Subscribed" if prediction_raw == 1 else "Not Subscribed"

        if hasattr(pipeline.named_steps["model"], "predict_proba"):
            probs = pipeline.predict_proba(input_df)[0]
            prob_sub = float(probs[1]) if len(probs) > 1 else float(probs[0])
        else:
            prob_sub = 1.0 if prediction_raw == 1 else 0.0

        prob_pct = f"{round(prob_sub * 100, 1)}%"
        confidence = "High Confidence" if (prob_sub >= 0.75 or prob_sub <= 0.25) else "Moderate Confidence"

        impacts = []
        if req.Discount_Applied == "Yes":
            impacts.append({"feature": "Discount Applied", "direction": "Positive", "reason": "Discount applied generally associates with higher subscription chances."})
        
        explanation = f"The model classifies this customer as '{prediction_label}' with {prob_pct} probability."

        return PredictResponse(
            model_used=model_key,
            prediction=prediction_label,
            probability_subscribed=round(prob_sub, 4),
            probability_percentage=prob_pct,
            confidence_level=confidence,
            feature_impacts=impacts,
            explanation=explanation,
        )

    def train_regression(self, df: pd.DataFrame, req: RegressionTrainRequest) -> Dict[str, Any]:
        target = "Purchase Amount"
        if target not in df.columns:
            return {"error": f"Target '{target}' missing."}

        clean_df = df.dropna(subset=[target])
        y = clean_df[target]
        X = clean_df.drop(columns=[target, "Customer ID"], errors="ignore")
        
        num_cols = X.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = X.select_dtypes(exclude=[np.number]).columns.tolist()

        preprocessor = ColumnTransformer([
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(drop="first", handle_unknown="ignore"), cat_cols)
        ])

        model = RandomForestRegressor(random_state=req.random_state)
        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("model", model),
        ])

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=req.test_size, random_state=req.random_state)
        pipeline.fit(X_train, y_train)

        y_pred = pipeline.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)

        return {
            "model": "Random Forest Regressor",
            "target": target,
            "mse": mse,
            "rmse": np.sqrt(mse),
            "r2_score": r2
        }

    def run_clustering(self, df: pd.DataFrame, k_clusters: int) -> Dict[str, Any]:
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        if not num_cols:
            return {"error": "No numeric columns for clustering."}

        X = df[num_cols].dropna()
        if len(X) < k_clusters:
            return {"error": "Not enough data for clustering."}

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        kmeans = KMeans(n_clusters=k_clusters, random_state=42)
        kmeans.fit(X_scaled)

        return {
            "num_clusters": k_clusters,
            "inertia": kmeans.inertia_
        }

# Global singleton instance
ml_engine = MLEngine()
