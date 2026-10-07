"""
Centralized feature configuration — single source of truth.
All analytics, filters, ML, and API responses reference these lists.

FULL DATASET MODE: The application loads and exposes the complete CSV schema.
Each analysis then selects only the features it actually needs.
"""

# Identifier columns — excluded from all analytical pipelines
IDENTIFIER_COLUMNS = ["Customer ID"]

# Derived target columns — excluded from predictors; only used as targets
DERIVED_TARGET_COLUMNS = ["High Value Customer", "Subscribed"]

# The complete list of analytical variables available from the dataset.
# Customer ID is an identifier and is excluded. Derived targets are excluded.
# Everything else is fair game for analysis.
ALLOWED_FEATURES = [
    "Age",
    "Gender",
    "Category",
    "Item Purchased",
    "Purchase Amount",
    "Location",
    "Size",
    "Color",
    "Season",
    "Review Rating",
    "Subscription Status",
    "Shipping Type",
    "Payment Method",
    "Discount Applied",
    "Promo Code Used",
    "Previous Purchases",
    "Preferred Brand",
    "Frequency of Purchases",
]

# Columns that are truly numeric (continuous/discrete) in the dataset
NUMERICAL_FEATURES = [
    "Age",
    "Purchase Amount",
    "Review Rating",
    "Previous Purchases",
]

# Categorical features (nominal/ordinal/binary)
CATEGORICAL_FEATURES = [
    "Gender",
    "Category",
    "Item Purchased",
    "Location",
    "Size",
    "Color",
    "Season",
    "Subscription Status",
    "Shipping Type",
    "Payment Method",
    "Discount Applied",
    "Promo Code Used",
    "Preferred Brand",
    "Frequency of Purchases",
]

# Features used as predictors for subscription classification
# Target: Subscription Status → Subscribed (1/0)
# Subscription Status itself is excluded (it IS the target)
# Customer ID is an identifier — excluded
# High Value Customer is a derived alternate target — excluded
CLASSIFICATION_PREDICTOR_FEATURES = [
    "Age",
    "Purchase Amount",
    "Review Rating",
    "Previous Purchases",
    "Gender",
    "Category",
    "Item Purchased",
    "Location",
    "Size",
    "Color",
    "Season",
    "Shipping Type",
    "Payment Method",
    "Discount Applied",
    "Promo Code Used",
    "Preferred Brand",
    "Frequency of Purchases",
]

REGRESSION_PREDICTOR_FEATURES: list = []
REGRESSION_TARGET: str = ""

# Classification Target — derived from "Subscription Status" == "Yes"
CLASSIFICATION_TARGET = "Subscribed"
