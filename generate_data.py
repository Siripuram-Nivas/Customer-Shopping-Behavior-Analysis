from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd


DATA_PATH = Path(__file__).resolve().parent / "data" / "customer_shopping_trends.csv"


def generate_dataset(path: Path, n_rows: int = 3900) -> pd.DataFrame:
    rng = np.random.default_rng(42)

    categories = ["Clothing", "Electronics", "Home", "Beauty", "Sports", "Books"]
    items = {
        "Clothing": ["T-Shirt", "Jeans", "Jacket", "Dress", "Sweater"],
        "Electronics": ["Phone", "Laptop", "Headphones", "Tablet", "Smartwatch"],
        "Home": ["Lamp", "Chair", "Desk", "Cookware", "Storage Bin"],
        "Beauty": ["Perfume", "Serum", "Makeup Kit", "Skincare Set", "Brush Set"],
        "Sports": ["Yoga Mat", "Dumbbells", "Running Shoes", "Cycling Bottle", "Fitness Tracker"],
        "Books": ["Novel", "Cookbook", "History Book", "Self-help", "Science Book"],
    }
    locations = ["New York", "Los Angeles", "Chicago", "Miami", "Seattle", "Boston", "Houston", "Austin"]
    sizes = ["S", "M", "L", "XL", "One Size"]
    colors = ["Black", "White", "Blue", "Red", "Green", "Purple", "Gold"]
    seasons = ["Spring", "Summer", "Fall", "Winter"]
    genders = ["Male", "Female", "Non-binary"]
    payment_methods = ["Credit Card", "Debit Card", "PayPal", "Cash", "Bank Transfer"]
    shipping_types = ["Standard", "Express", "Next Day", "Pickup"]
    brands = ["Aster", "Northwind", "Horizon", "Vivid", "Summit", "Luma"]
    frequencies = ["Weekly", "Bi-Weekly", "Monthly", "Quarterly", "Annually"]

    category_weights = np.array([0.24, 0.19, 0.17, 0.14, 0.15, 0.11])
    gender_weights = np.array([0.48, 0.49, 0.03])
    subscription_weights = np.array([0.42, 0.58])

    rows = []
    for idx in range(n_rows):
        age = int(rng.integers(18, 72))
        gender = rng.choice(genders, p=gender_weights)
        category = rng.choice(categories, p=category_weights)
        item = rng.choice(items[category])
        location = rng.choice(locations)
        size = rng.choice(sizes)
        color = rng.choice(colors)
        season = rng.choice(seasons)
        is_subscription = bool(rng.choice([True, False], p=subscription_weights))
        payment_method = rng.choice(payment_methods)
        shipping_type = rng.choice(shipping_types)
        discount_applied = bool(rng.random() < 0.58)
        previous_purchases = int(rng.integers(1, 25))
        review_rating = float(np.clip(rng.normal(loc=4.25, scale=0.72), 1.0, 5.0))
        preferred_brand = rng.choice(brands)
        frequency_of_purchases_str = rng.choice(frequencies)
        promo_code_used = bool(rng.random() < 0.45) if discount_applied else False

        # Base amount determined by category and customer profile.
        category_base = {
            "Clothing": 72,
            "Electronics": 190,
            "Home": 128,
            "Beauty": 90,
            "Sports": 110,
            "Books": 58,
        }[category]

        age_factor = max(0, (age - 20) * 0.9)
        loyalty_factor = previous_purchases * 4.5
        subscription_factor = 24 if is_subscription else 0
        discount_factor = -18 if discount_applied else 0
        review_factor = (review_rating - 3) * 18
        season_factor = {"Spring": 12, "Summer": 8, "Fall": 6, "Winter": 14}[season]
        frequency_factor = {"Weekly": 30, "Bi-Weekly": 20, "Monthly": 10, "Quarterly": 5, "Annually": 0}[frequency_of_purchases_str]

        purchase_amount = category_base + age_factor + loyalty_factor + subscription_factor + review_factor + season_factor + frequency_factor + discount_factor
        purchase_amount = round(max(25.0, purchase_amount + rng.normal(0, 20)), 2)

        rows.append(
            {
                "Customer ID": f"CUST-{idx + 1:04d}",
                "Gender": gender,
                "Age": age,
                "Category": category,
                "Item Purchased": item,
                "Purchase Amount": purchase_amount,
                "Location": location,
                "Size": size,
                "Color": color,
                "Season": season,
                "Review Rating": round(review_rating, 2),
                "Subscription Status": "Yes" if is_subscription else "No",
                "Shipping Type": shipping_type,
                "Payment Method": payment_method,
                "Discount Applied": "Yes" if discount_applied else "No",
                "Promo Code Used": "Yes" if promo_code_used else "No",
                "Previous Purchases": previous_purchases,
                "Preferred Brand": preferred_brand,
                "Frequency of Purchases": frequency_of_purchases_str,
                "High Value Customer": bool(purchase_amount >= np.quantile([r["Purchase Amount"] for r in rows] + [purchase_amount], 0.75)) if rows else False,
            }
        )

    df = pd.DataFrame(rows)
    purchase_threshold = df["Purchase Amount"].quantile(0.75)
    df["High Value Customer"] = (df["Purchase Amount"] >= purchase_threshold).astype(int)
    df["High Value Customer"] = df["High Value Customer"].astype(str).replace({"1": "Yes", "0": "No"})
    df["Subscription Status"] = df["Subscription Status"].astype(str)
    df["Discount Applied"] = df["Discount Applied"].astype(str)
    df["Promo Code Used"] = df["Promo Code Used"].astype(str)
    df["Review Rating"] = df["Review Rating"].round(2)
    df["Frequency of Purchases"] = df["Frequency of Purchases"].astype(str)

    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, index=False)
    return df


if __name__ == "__main__":
    generate_dataset(DATA_PATH)
    print(f"Generated dataset with {len(pd.read_csv(DATA_PATH))} rows at {DATA_PATH}")
