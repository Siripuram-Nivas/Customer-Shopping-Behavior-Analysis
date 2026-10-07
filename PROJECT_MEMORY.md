# PROJECT MEMORY
## Notebook-Driven Transformation

### Notebook Analysis Map to Dashboard
1. **Understand Dataset**: Row count, Columns, Missing Values, Duplicates.
2. **Data Prep**: Derived vars (`Subscribed`, `Discount_Flag`, `Promo_Flag`, `Age Group`, `Spend per Previous Purchase`).
3. **Customer Profile**: Distributions (Age, Gender, Frequency, Subscription).
4. **Revenue Behavior**: Aggregations by Category, Item, Season. Total Revenue vs Average Spend.
5. **Loyalty**: Previous Purchases vs Spend, Rating, Subscription.
6. **Promotions**: Subscription rate by Discount / Promo.
7. **Geography**: Top locations by revenue and avg spend.
8. **Relationships**: Correlation Matrix.
9. **Segmentation**: K-Means (K=4) on Age, Spend, Prev Purchases, Rating. Segment profiling.
10. **Prediction**: Predict `Subscribed` using Logistic Regression & Decision Tree.
11. **Interpretation**: Logistic coefficients.
12. **Statistical Summary**: Dynamic key findings.
13. **Recommendations**: Generated from findings.
14. **Interactive Plotly**: Revenue Treemap, Interactive Customer Segments.

### Analytical Formulas & Models
- `Subscribed = (Subscription Status == 'Yes')`
- `Discount_Flag = (Discount Applied == 'Yes')`
- `Promo_Flag = (Promo Code Used == 'Yes')`
- `Spend per Previous Purchase = Purchase Amount / Previous Purchases`
- **K-Means**: K=4 on StandardScaler(Age, Purchase Amount, Previous Purchases, Review Rating).
- **ML Pipeline**: 
  - Target: `Subscribed` (binary)
  - Numeric: Age, Purchase Amount, Review Rating, Previous Purchases (StandardScaler)
  - Categorical: Gender, Category, Season, Discount, Promo, Frequency, Payment, Size, Shipping (OneHotEncoder)
  - Models: Logistic Regression, Decision Tree (max_depth=4). Class weight: balanced.

### Current UI Architecture
React + Vite (Frontend) -> FastAPI (Backend). UI relies on `Claymorphism` components (`ClayCard`, `ClayButton`, `ClaySidebar`).
The routing logic in `App.tsx` will map the 14 notebook concepts into roughly 6 main cohesive screens/tabs.

### API Endpoints
- `GET /api/health`
- `GET /api/dataset/summary`
- `POST /api/analytics/dashboard` -> Returns all notebook aggregated metrics (Loyalty, Profile, Promotions, Revenue, Geo, Segments).
- `GET /api/model/metrics` -> Returns Logistic & Tree metrics.
- `POST /api/model/predict` -> Live prediction.

### Completed Sections
- [x] GSD Plan formulated
- [x] Project Memory established

### Known Issues & Test Status
- Pending backend refactoring.
- Pending frontend refactoring.
