from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier

from generate_data import DATA_PATH, generate_dataset


st.set_page_config(page_title="Customer Shopping Behavior Analysis", layout="wide")


@st.cache_data
def load_data(path: str | Path) -> pd.DataFrame:
    data_path = Path(path)
    if not data_path.exists():
        generate_dataset(data_path)
    df = pd.read_csv(data_path)
    return df


@st.cache_data
def build_feature_frame(df: pd.DataFrame) -> pd.DataFrame:
    feature_frame = df.copy()
    feature_frame["Age Group"] = pd.cut(
        feature_frame["Age"],
        bins=[0, 24, 34, 44, 54, 65, 120],
        labels=["18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
    )
    feature_frame["Spending Band"] = pd.cut(
        feature_frame["Purchase Amount"],
        bins=[0, 75, 150, 250, 500, 1000],
        labels=["Low", "Moderate", "High", "Very High", "Premium"],
    )
    feature_frame["Loyalty Index"] = feature_frame["Previous Purchases"] + feature_frame["Frequency of Purchases"]
    feature_frame["Discount Response"] = np.where(feature_frame["Discount Applied"] == "Yes", "Responsive", "Non-responsive")
    return feature_frame


@st.cache_data
def get_model_results(df: pd.DataFrame):
    target = "High Value Customer"
    features = [
        "Age",
        "Gender",
        "Category",
        "Location",
        "Season",
        "Review Rating",
        "Subscription Status",
        "Shipping Type",
        "Payment Method",
        "Discount Applied",
        "Previous Purchases",
        "Frequency of Purchases",
        "Preferred Brand",
    ]

    X = df[features]
    y = df[target].map({"Yes": 1, "No": 0})

    numeric_features = ["Age", "Review Rating", "Previous Purchases", "Frequency of Purchases"]
    categorical_features = [col for col in features if col not in numeric_features]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), numeric_features),
            ("cat", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore"))]), categorical_features),
        ],
        remainder="drop",
    )

    models = {
        "Logistic Regression": LogisticRegression(max_iter=2000, random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=5, random_state=42),
    }

    results = []
    for name, model in models.items():
        pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        summary = {
            "Model": name,
            "Accuracy": accuracy_score(y_test, y_pred),
            "Precision": precision_score(y_test, y_pred, zero_division=0),
            "Recall": recall_score(y_test, y_pred, zero_division=0),
            "F1": f1_score(y_test, y_pred, zero_division=0),
            "CV Mean Accuracy": np.mean(cross_val_score(pipeline, X, y, cv=5, scoring="accuracy")),
            "Confusion Matrix": confusion_matrix(y_test, y_pred),
            "Model Object": pipeline,
        }
        results.append(summary)

    return results, features, target


@st.cache_data
def describe_dataframe(df: pd.DataFrame):
    summary = {
        "Rows": len(df),
        "Columns": len(df.columns),
        "Missing Values": int(df.isna().sum().sum()),
        "Duplicate Records": int(df.duplicated().sum()),
        "Numerical Features": int(df.select_dtypes(include=[np.number]).shape[1]),
        "Categorical Features": int(df.select_dtypes(exclude=[np.number]).shape[1]),
    }
    return summary


def build_clay_css() -> str:
    return """
    <style>
        :root {
            --bg: #f2ede8;
            --surface: #f7f1ed;
            --surface-strong: #efe5df;
            --primary: #9ca9d9;
            --primary-strong: #6c7ec9;
            --mint: #dfeee7;
            --peach: #f5d8c6;
            --lavender: #e5dff8;
            --accent: #8ab6bf;
            --text: #2f2f34;
            --muted: #676b75;
            --success: #78b78a;
            --warning: #d7ad62;
            --error: #d98d86;
            --shadow-dark: rgba(165, 146, 136, 0.25);
            --shadow-light: rgba(255, 255, 255, 0.9);
        }
        .stApp {
            background: linear-gradient(135deg, #f5f0eb 0%, #f0efe8 100%);
            color: var(--text);
        }
        .main .block-container {
            padding-top: 2rem;
            padding-bottom: 2rem;
        }
        .kpi-card, .section-card, .insight-card, .filter-card, .result-card {
            background: linear-gradient(145deg, #f8f3ee, #ebe4df);
            border-radius: 24px;
            box-shadow: 8px 8px 18px var(--shadow-dark), -8px -8px 18px var(--shadow-light);
            padding: 1.2rem 1.2rem;
            border: 1px solid rgba(255,255,255,0.35);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .kpi-card:hover, .section-card:hover, .insight-card:hover, .result-card:hover {
            transform: translateY(-2px);
            box-shadow: 10px 10px 20px rgba(141, 123, 112, 0.2), -6px -6px 16px rgba(255,255,255,0.75);
        }
        .page-title {
            font-size: 2.3rem;
            font-weight: 800;
            letter-spacing: -0.04em;
            color: var(--text);
            margin-bottom: 0.35rem;
        }
        .subtitle {
            font-size: 0.96rem;
            color: var(--muted);
            margin-bottom: 1rem;
        }
        .kpi-label {
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--muted);
            font-weight: 700;
            margin-bottom: 0.3rem;
        }
        .kpi-value {
            font-size: 2.1rem;
            font-weight: 800;
            color: var(--text);
            line-height: 1.1;
        }
        .metric-pill {
            background: rgba(156, 169, 217, 0.14);
            border-radius: 999px;
            padding: 0.4rem 0.7rem;
            color: var(--primary-strong);
            font-size: 0.76rem;
            font-weight: 700;
        }
        .section-heading {
            font-size: 1.3rem;
            font-weight: 800;
            margin-bottom: 0.7rem;
            color: var(--text);
        }
        .muted {
            color: var(--muted);
        }
        .stDataFrame {
            border-radius: 18px;
            overflow: hidden;
        }
        .stTabs [role="tablist"] button {
            border-radius: 12px 12px 0 0;
            background: rgba(255,255,255,0.35);
            color: var(--muted);
        }
        .stTabs [role="tablist"] .st-emotion-cache-1x8y2q {
            background: linear-gradient(145deg, #f8f3ee, #ece5df);
            box-shadow: inset 2px 2px 8px rgba(255,255,255,0.8), inset -4px -4px 10px rgba(122, 114, 109, 0.08);
        }
        div[data-testid="stForm"] {
            background: transparent;
        }
        button[kind="primary"] {
            background: linear-gradient(135deg, var(--primary), var(--primary-strong));
            border: none;
            color: white;
            border-radius: 16px;
            box-shadow: 5px 5px 12px rgba(136, 125, 172, 0.25), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        button[kind="secondary"] {
            background: linear-gradient(145deg, #f7f2ef, #e7dfd8);
            border: none;
            color: var(--text);
            border-radius: 16px;
            box-shadow: 5px 5px 10px rgba(126, 118, 113, 0.18), inset 0 1px 0 rgba(255,255,255,0.25);
        }
    </style>
    """


def render_kpi_cards(df: pd.DataFrame, filtered: pd.DataFrame):
    n_customers = len(filtered)
    avg_purchase = round(filtered["Purchase Amount"].mean(), 2)
    avg_age = round(filtered["Age"].mean(), 1)
    avg_rating = round(filtered["Review Rating"].mean(), 2)
    avg_prev_purchases = round(filtered["Previous Purchases"].mean(), 1)
    subscription_rate = round((filtered["Subscription Status"] == "Yes").mean() * 100, 1)
    discount_rate = round((filtered["Discount Applied"] == "Yes").mean() * 100, 1)

    cards = [
        ("Total Customers", n_customers, "active users"),
        ("Avg Purchase Amount", f"${avg_purchase:,.2f}", "per customer"),
        ("Avg Customer Age", f"{avg_age}", "years"),
        ("Avg Review Rating", f"{avg_rating}", "/5.0"),
        ("Avg Previous Purchases", f"{avg_prev_purchases}", "orders"),
        ("Subscription Rate", f"{subscription_rate}%", "members"),
        ("Discount Usage Rate", f"{discount_rate}%", "responders"),
    ]

    kpi_columns = st.columns(7)
    for idx, (label, value, suffix) in enumerate(cards):
        with kpi_columns[idx]:
            st.markdown(f'<div class="kpi-card"><div class="kpi-label">{label}</div><div class="kpi-value">{value}</div><div class="muted">{suffix}</div></div>', unsafe_allow_html=True)


def render_sidebar_filters(df: pd.DataFrame):
    with st.sidebar:
        st.markdown("<h3 style='margin-top:0;'>Filters</h3>", unsafe_allow_html=True)
        gender = st.multiselect("Gender", sorted(df["Gender"].unique()), default=sorted(df["Gender"].unique()))
        category = st.multiselect("Category", sorted(df["Category"].unique()), default=sorted(df["Category"].unique()))
        location = st.multiselect("Location", sorted(df["Location"].unique()), default=sorted(df["Location"].unique()))
        subscription = st.multiselect("Subscription Status", sorted(df["Subscription Status"].unique()), default=sorted(df["Subscription Status"].unique()))
        shipping = st.multiselect("Shipping Type", sorted(df["Shipping Type"].unique()), default=sorted(df["Shipping Type"].unique()))

        filtered = df[
            df["Gender"].isin(gender)
            & df["Category"].isin(category)
            & df["Location"].isin(location)
            & df["Subscription Status"].isin(subscription)
            & df["Shipping Type"].isin(shipping)
        ]
        return filtered


def stat_summary(series: pd.Series, stat_name: str) -> str:
    values = {
        "Mean": series.mean(),
        "Median": series.median(),
        "Mode": series.mode().iloc[0] if len(series.mode()) else np.nan,
        "Variance": series.var(ddof=1) if len(series) > 1 else np.nan,
        "Std Dev": series.std(ddof=1) if len(series) > 1 else np.nan,
        "Min": series.min(),
        "Max": series.max(),
        "Q1": series.quantile(0.25),
        "Q3": series.quantile(0.75),
    }
    val = values[stat_name]
    if pd.isna(val):
        return "N/A"
    if stat_name in {"Mean", "Median", "Variance", "Std Dev", "Min", "Max", "Q1", "Q3"}:
        if series.dtype.kind in "fc":
            return f"{val:.2f}"
        return f"{val:,.2f}"
    return f"{val}"


def render_dashboard(df: pd.DataFrame):
    filtered = render_sidebar_filters(df)
    st.markdown(build_clay_css(), unsafe_allow_html=True)
    st.markdown("<div class='page-title'>Customer Shopping Behavior Analysis</div>", unsafe_allow_html=True)
    st.markdown("<div class='subtitle'>Explore customer purchasing patterns, statistical relationships, predictive models, and interactive insights.</div>", unsafe_allow_html=True)

    render_kpi_cards(df, filtered)

    st.markdown("<div class='section-heading'>Overview</div>", unsafe_allow_html=True)

    overview_cols = st.columns(3)
    with overview_cols[0]:
        st.markdown("<div class='section-card'><h4>Project Objective</h4><p>Assess how customer attributes and purchase behavior relate to higher-value buying patterns and model predicted outcomes.</p></div>", unsafe_allow_html=True)
    with overview_cols[1]:
        st.markdown("<div class='section-card'><h4>Dataset Size</h4><p>{0} customer records with {1} variables, designed for business analytics and predictive modeling.</p></div>".format(len(df), len(df.columns)), unsafe_allow_html=True)
    with overview_cols[2]:
        st.markdown("<div class='section-card'><h4>Research Lens</h4><p>Focus on age, category mix, review sentiment, discount usage, subscription behavior, and purchase frequency.</p></div>", unsafe_allow_html=True)

    # Dataset explorer
    st.markdown("<div class='section-heading'>Dataset Explorer</div>", unsafe_allow_html=True)
    dataset_summary = describe_dataframe(filtered)
    summary_cols = st.columns(6)
    for idx, (label, value) in enumerate(dataset_summary.items()):
        with summary_cols[idx]:
            st.markdown(f'<div class="kpi-card"><div class="kpi-label">{label}</div><div class="kpi-value">{value}</div></div>', unsafe_allow_html=True)

    st.markdown("<div class='section-heading'>Preview</div>", unsafe_allow_html=True)
    st.dataframe(filtered.head(12), use_container_width=True)

    # Preprocessing pipeline
    st.markdown("<div class='section-heading'>Data Preprocessing</div>", unsafe_allow_html=True)
    st.markdown("<div class='section-card'>Raw Data → Data Cleaning → Missing Value Handling → Encoding → Feature Transformation → Feature Selection → Model Training</div>", unsafe_allow_html=True)
    st.write("The dataset is checked for missing values and duplicate rows, then categorical fields are encoded, numerical measures are scaled when needed, and customer-level features such as age groups, loyalty indexes, and spend bands are created for higher-quality modeling.")

    # EDA plots
    st.markdown("<div class='section-heading'>Exploratory Data Analysis</div>", unsafe_allow_html=True)
    eda_cols = st.columns(2)
    with eda_cols[0]:
        fig_age = px.histogram(filtered, x="Age", nbins=25, title="Age Distribution", color_discrete_sequence=["#8ca0db"])
        fig_age.update_layout(template="plotly_white", paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
        st.plotly_chart(fig_age, use_container_width=True)
    with eda_cols[1]:
        fig_purchase = px.histogram(filtered, x="Purchase Amount", nbins=30, title="Purchase Amount Distribution", color_discrete_sequence=["#dca89a"])
        fig_purchase.update_layout(template="plotly_white", paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
        st.plotly_chart(fig_purchase, use_container_width=True)

    bar_cols = st.columns(2)
    with bar_cols[0]:
        category_sales = filtered.groupby("Category", as_index=False)["Purchase Amount"].mean().sort_values("Purchase Amount", ascending=False)
        fig_category = px.bar(category_sales, x="Category", y="Purchase Amount", title="Average Purchase Amount by Category", color="Category", color_discrete_sequence=px.colors.qualitative.Set2)
        st.plotly_chart(fig_category, use_container_width=True)
    with bar_cols[1]:
        gender_sales = filtered.groupby("Gender", as_index=False)["Purchase Amount"].mean().sort_values("Purchase Amount", ascending=False)
        fig_gender = px.bar(gender_sales, x="Gender", y="Purchase Amount", title="Average Purchase Amount by Gender", color="Gender", color_discrete_sequence=px.colors.qualitative.Pastel)
        st.plotly_chart(fig_gender, use_container_width=True)

    scatter_cols = st.columns(2)
    with scatter_cols[0]:
        fig_scatter = px.scatter(filtered, x="Previous Purchases", y="Purchase Amount", color="Subscription Status", title="Previous Purchases vs Purchase Amount", color_discrete_map={"Yes": "#7ea8c9", "No": "#d9a58f"})
        st.plotly_chart(fig_scatter, use_container_width=True)
    with scatter_cols[1]:
        fig_rating = px.scatter(filtered, x="Review Rating", y="Purchase Amount", color="Discount Applied", title="Review Rating vs Purchase Amount", color_discrete_map={"Yes": "#8fc3a9", "No": "#d78fb0"})
        st.plotly_chart(fig_rating, use_container_width=True)

    # Statistics
    st.markdown("<div class='section-heading'>Statistics</div>", unsafe_allow_html=True)
    numeric_cols = ["Age", "Purchase Amount", "Review Rating", "Previous Purchases", "Frequency of Purchases"]
    stats_df = pd.DataFrame({
        "Metric": ["Mean", "Median", "Mode", "Variance", "Std Dev", "Min", "Max", "Q1", "Q3"],
    })
    for numeric_col in numeric_cols:
        metrics = {
            "Metric": ["Mean", "Median", "Mode", "Variance", "Std Dev", "Min", "Max", "Q1", "Q3"],
            "Value": [
                stat_summary(filtered[numeric_col], "Mean"),
                stat_summary(filtered[numeric_col], "Median"),
                stat_summary(filtered[numeric_col], "Mode"),
                stat_summary(filtered[numeric_col], "Variance"),
                stat_summary(filtered[numeric_col], "Std Dev"),
                stat_summary(filtered[numeric_col], "Min"),
                stat_summary(filtered[numeric_col], "Max"),
                stat_summary(filtered[numeric_col], "Q1"),
                stat_summary(filtered[numeric_col], "Q3"),
            ],
        }
        metrics_df = pd.DataFrame(metrics)
        metrics_df.columns = ["Metric", numeric_col]
        stats_df = stats_df.merge(metrics_df, on="Metric", how="outer")
    st.dataframe(stats_df, use_container_width=True)

    # Correlation heatmap
    st.markdown("<div class='section-heading'>Correlation Analysis</div>", unsafe_allow_html=True)
    corr_df = filtered[["Age", "Purchase Amount", "Review Rating", "Previous Purchases", "Frequency of Purchases"]].corr().round(3)
    corr_fig = px.imshow(corr_df, text_auto=True, color_continuous_scale="RdBu_r", aspect="auto", title="Correlation Heatmap")
    corr_fig.update_layout(template="plotly_white", paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
    st.plotly_chart(corr_fig, use_container_width=True)
    corr_strength = corr_df.loc["Purchase Amount", ["Age", "Review Rating", "Previous Purchases", "Frequency of Purchases"]]
    strongest = corr_strength.abs().idxmax()
    st.write(f"The strongest relationship with purchase amount appears to be with {strongest} (absolute correlation {corr_strength.abs().max():.2f}), which is calculated from the active filtered dataset.")

    # Feature engineering
    st.markdown("<div class='section-heading'>Feature Engineering</div>", unsafe_allow_html=True)
    engineered = build_feature_frame(filtered)
    feature_examples = [
        ["Age", "Age Group", "Segments customer lifecycle and highlights where spending peaks."],
        ["Purchase Amount", "Spending Band", "Classifies value tiers for customer-value analysis."],
        ["Previous Purchases + Frequency of Purchases", "Loyalty Index", "Combines engagement signals to estimate repeat purchase intent."],
        ["Discount Applied", "Discount Response", "Helps assess whether discounting is associated with purchase behavior."],
    ]
    feature_df = pd.DataFrame(feature_examples, columns=["Original Feature", "Transformation", "Reason"])
    st.dataframe(feature_df, use_container_width=True)

    # selected features
    st.markdown("<div class='section-heading'>Selected Features</div>", unsafe_allow_html=True)
    selected_summary = pd.DataFrame([
        ["Age", "Captures lifecycle and spending profile"],
        ["Gender", "Supports basic segmentation analysis"],
        ["Category", "Important for category-specific behavior"],
        ["Location", "Reflects regional demand patterns"],
        ["Review Rating", "Measures customer satisfaction"],
        ["Subscription Status", "Signals retention orientation"],
        ["Previous Purchases", "Strong repeat-purchase signal"],
        ["Frequency of Purchases", "Captures purchasing cadence"],
        ["Discount Applied", "Indicates incentive responsiveness"],
    ], columns=["Feature", "Reason"])
    st.dataframe(selected_summary, use_container_width=True)

    # Machine learning
    st.markdown("<div class='section-heading'>Machine Learning</div>", unsafe_allow_html=True)
    results, features, target = get_model_results(engineered)
    metrics_df = pd.DataFrame([
        {
            "Model": item["Model"],
            "Accuracy": item["Accuracy"],
            "Precision": item["Precision"],
            "Recall": item["Recall"],
            "F1": item["F1"],
            "CV Mean Accuracy": item["CV Mean Accuracy"],
        }
        for item in results
    ])
    st.dataframe(metrics_df.round(3), use_container_width=True)

    model_cols = st.columns(2)
    for index, item in enumerate(results):
        with model_cols[index]:
            cm = item["Confusion Matrix"]
            fig_cm = px.imshow(cm, text_auto=True, labels=dict(x="Predicted", y="Actual", color="Count"), x=["No", "Yes"], y=["No", "Yes"], color_continuous_scale="Blues")
            fig_cm.update_layout(title=f"{item['Model']} Confusion Matrix", template="plotly_white", paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
            st.plotly_chart(fig_cm, use_container_width=True)

    # prediction form
    st.markdown("<div class='section-heading'>Prediction Interface</div>", unsafe_allow_html=True)
    with st.form("purchase_prediction"):
        prediction_cols = st.columns(3)
        with prediction_cols[0]:
            age = st.slider("Age", min_value=18, max_value=70, value=32)
            gender = st.selectbox("Gender", sorted(df["Gender"].unique()))
            category = st.selectbox("Category", sorted(df["Category"].unique()))
        with prediction_cols[1]:
            location = st.selectbox("Location", sorted(df["Location"].unique()))
            season = st.selectbox("Season", sorted(df["Season"].unique()))
            shipping = st.selectbox("Shipping Type", sorted(df["Shipping Type"].unique()))
        with prediction_cols[2]:
            payment_method = st.selectbox("Payment Method", sorted(df["Payment Method"].unique()))
            subscription = st.selectbox("Subscription Status", ["Yes", "No"])
            discount = st.selectbox("Discount Applied", ["Yes", "No"])

        review_rating = st.slider("Review Rating", min_value=1.0, max_value=5.0, value=4.5, step=0.1)
        previous_purchases = st.slider("Previous Purchases", min_value=0, max_value=40, value=8)
        frequency = st.slider("Frequency of Purchases", min_value=1, max_value=12, value=4)
        preferred_brand = st.selectbox("Preferred Brand", sorted(df["Preferred Brand"].unique()))
        submitted = st.form_submit_button("Predict Customer Behavior")

    if submitted:
        form_row = pd.DataFrame([
            {
                "Age": age,
                "Gender": gender,
                "Category": category,
                "Location": location,
                "Season": season,
                "Review Rating": review_rating,
                "Subscription Status": subscription,
                "Shipping Type": shipping,
                "Payment Method": payment_method,
                "Discount Applied": discount,
                "Previous Purchases": previous_purchases,
                "Frequency of Purchases": frequency,
                "Preferred Brand": preferred_brand,
            }
        ])

        model = next(item["Model Object"] for item in results if item["Model"] == "Logistic Regression")
        prediction = model.predict(form_row)[0]
        probability = model.predict_proba(form_row)[0, 1]
        label = "High-value customer" if prediction == 1 else "Lower-value customer"
        confidence = probability if prediction == 1 else 1 - probability

        st.markdown("<div class='result-card'><h3>Prediction Result</h3><p><strong>Prediction:</strong> {}</p><p><strong>Confidence:</strong> {:.1%}</p><p>Customers with strong repeat purchase patterns, high review sentiment, subscription engagement, and consistent purchase frequency are more likely to fall into the higher-value segment.</p></div>".format(label, confidence), unsafe_allow_html=True)

    # insights
    st.markdown("<div class='section-heading'>Dynamic Insights</div>", unsafe_allow_html=True)
    insight_slots = st.columns(4)
    top_category = filtered.groupby("Category")["Purchase Amount"].mean().idxmax()
    top_payment = filtered["Payment Method"].mode().iloc[0]
    avg_purchase = filtered["Purchase Amount"].mean()
    top_segment = filtered.groupby("Category")["Review Rating"].mean().idxmax()
    insight_values = [
        ("Highest Spending Category", top_category),
        ("Most Common Payment Method", top_payment),
        ("Average Purchase Amount", f"${avg_purchase:,.2f}"),
        ("Highest Rated Category", top_segment),
    ]
    for idx, (title, value) in enumerate(insight_values):
        with insight_slots[idx]:
            st.markdown(f'<div class="insight-card"><div class="kpi-label">{title}</div><div class="kpi-value" style="font-size:1.15rem;">{value}</div></div>', unsafe_allow_html=True)

    # academic mapping and ethics
    st.markdown("<div class='section-heading'>Data Science Concepts Demonstrated</div>", unsafe_allow_html=True)
    concepts = [
        "Module I — Dataset understanding and workflow design",
        "Module II — Pandas and NumPy preprocessing",
        "Module III — Descriptive statistics and EDA",
        "Module IV — Feature engineering and dimensionality awareness",
        "Module V — Classification and prediction",
        "Module VI — Model evaluation and validation",
        "Module VIII — Interactive data visualization",
        "Module IX — Dashboard design and analytic storytelling",
        "Module X — Ethical, fair, responsible data use",
    ]
    for concept in concepts:
        st.write(f"• {concept}")

    st.markdown("<div class='section-heading'>Ethical Considerations</div>", unsafe_allow_html=True)
    st.write("This project uses customer data responsibly by limiting focus to aggregate patterns and model interpretation. Privacy is respected through anonymized record-level analysis, predictions are used to support segmentation and business insight rather than discriminatory decisions, and model outcomes are interpreted with fairness and caution.")


# Entry point
if __name__ == "__main__":
    DATA_FILE = DATA_PATH
    if not DATA_FILE.exists():
        generate_dataset(DATA_FILE)
    df = load_data(DATA_FILE)
    render_dashboard(df)
