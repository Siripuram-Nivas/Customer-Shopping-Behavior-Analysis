import React, { useEffect, useState } from "react";
import { BookOpen, Hash, Tag, Key, HelpCircle, CheckCircle, ShieldAlert } from "lucide-react";
import { ClayCard } from "../components/clay/ClayCard";
import { ClayBadge } from "../components/clay/ClayBadge";
import { fetchDatasetSummary } from "../services/api";

export const DataUnderstandingPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetchDatasetSummary().then(setSummary).catch(console.error);
  }, []);

  const variableDictionary = [
    { name: "Customer ID", type: "Identifier", role: "Key", desc: "Unique synthetic token representing an individual shopper. Dropped prior to modeling — zero analytical variance." },
    { name: "Gender", type: "Categorical (Nominal)", role: "Feature", desc: "Self-reported gender identification (Male, Female). Encoded as binary dummy variable." },
    { name: "Age", type: "Numerical (Discrete)", role: "Feature", desc: "Customer age in years (Range: 18 - 70). Binned into generational cohorts for non-linear analysis." },
    { name: "Category", type: "Categorical (Nominal)", role: "Feature", desc: "Product category of purchase (Clothing, Footwear, Outerwear, Accessories). One-hot encoded." },
    { name: "Item Purchased", type: "Categorical (Nominal)", role: "Feature", desc: "Specific product title within the broader category taxonomy." },
    { name: "Purchase Amount", type: "Numerical (Continuous)", role: "Feature", desc: "Gross transaction amount in USD. Used as revenue metric in dashboard analytics." },
    { name: "Location", type: "Categorical (Nominal)", role: "Feature", desc: "US metropolitan territory where transaction originated. Analyzed in geography module." },
    { name: "Size", type: "Categorical (Ordinal)", role: "Feature", desc: "Sizing specification for apparel and gear (S, M, L, XL, One Size). Included as predictor." },
    { name: "Color", type: "Categorical (Nominal)", role: "Feature", desc: "Primary aesthetic colorway of the purchased product. Captures product-preference trends." },
    { name: "Season", type: "Categorical (Nominal)", role: "Feature", desc: "Fiscal seasonality of purchase (Spring, Summer, Fall, Winter). Seasonal revenue analysis key." },
    { name: "Review Rating", type: "Numerical (Continuous)", role: "Feature", desc: "Customer satisfaction review score on a 1.0 to 5.0 rating scale. Loyalty signal." },
    { name: "Subscription Status", type: "Categorical (Binary)", role: "Target Source", desc: "Active recurring membership status ('Yes' / 'No'). Binarized into 'Subscribed' (1/0) as the classification target. Excluded from predictor matrix." },
    { name: "Shipping Type", type: "Categorical (Nominal)", role: "Feature", desc: "Fulfillment delivery speed chosen (Standard, Express, Next Day Air, Store Pickup, Free Shipping, 2-Day Shipping)." },
    { name: "Discount Applied", type: "Categorical (Binary)", role: "Feature", desc: "Indicator whether a promotional price discount was activated. Binarized as Discount_Flag." },
    { name: "Promo Code Used", type: "Categorical (Binary)", role: "Feature", desc: "Indicator whether a promo/coupon code was applied at checkout. Binarized as Promo_Flag." },
    { name: "Previous Purchases", type: "Numerical (Discrete)", role: "Feature", desc: "Count of historic orders placed before this transaction. Primary loyalty metric." },
    { name: "Preferred Brand", type: "Categorical (Nominal)", role: "Feature", desc: "Customer's stated preferred brand. Captures brand loyalty patterns." },
    { name: "Frequency of Purchases", type: "Categorical (Ordinal)", role: "Feature", desc: "Self-reported purchase cadence (Daily, Weekly, Bi-Weekly, Monthly, Quarterly, Annually, Every 3 Months)." },
    { name: "High Value Customer", type: "Categorical (Binary)", role: "Alternate Target", desc: "Pre-derived label: 1 if Purchase Amount ≥ 75th percentile. Available as an alternate regression/classification target." },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1E293B] font-heading">Data Understanding</h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Formal taxonomy, variable roles, measurement scales, and academic methodology for the customer shopping study.
        </p>
      </div>

      {/* Structural Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ClayCard className="space-y-3">
          <div className="flex items-center space-x-2 text-[#0D9488]">
            <Hash size={18} />
            <h3 className="font-bold text-sm text-[#1E293B]">Numerical Features</h3>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            Continuous and discrete ratio-scale attributes representing physical quantities (Age, Order Amount, Rating, Order counts). Scaled using standard z-score normalization (z = (x - mean) / std) before linear modeling.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {summary?.numerical_features?.map((f: string) => (
              <ClayBadge key={f} variant="teal" size="sm">{f}</ClayBadge>
            ))}
          </div>
        </ClayCard>

        <ClayCard className="space-y-3">
          <div className="flex items-center space-x-2 text-[#FF6B6B]">
            <Tag size={18} />
            <h3 className="font-bold text-sm text-[#1E293B]">Categorical Features</h3>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            Nominal and binary qualitative descriptors without intrinsic numeric magnitude. Encoded via sparse One-Hot Encoding ($k$ binary dummy indicators) with unknown category fallback.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {summary?.categorical_features?.map((f: string) => (
              <ClayBadge key={f} variant="coral" size="sm">{f}</ClayBadge>
            ))}
          </div>
        </ClayCard>

        <ClayCard className="space-y-3">
          <div className="flex items-center space-x-2 text-[#4F46E5]">
            <Key size={18} />
            <h3 className="font-bold text-sm text-[#1E293B]">Identifiers & Governance</h3>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            High-cardinality keys (`Customer ID`) carry zero generalizing variance and are strictly removed from feature matrices to prevent identity memorization and high dimensional leakage.
          </p>
          <ClayBadge variant="indigo" size="sm">Customer ID (Excluded from X)</ClayBadge>
        </ClayCard>
      </div>

      {/* Target Leakage Academic Advisory */}
      <div className="clay-surface p-6 border-l-4 border-[#FF6B6B] space-y-2">
        <div className="flex items-center space-x-2 text-[#FF6B6B]">
          <ShieldAlert size={20} />
          <h3 className="font-bold text-base font-heading text-[#1E293B]">
            Academic Principle: Target Leakage Prevention
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
          In educational and corporate machine learning projects, a fatal error is training a model to predict <code className="bg-[#E5DFD5] px-1.5 py-0.5 rounded text-[#1E293B]">High_Value_Customer</code> while retaining <code className="bg-[#E5DFD5] px-1.5 py-0.5 rounded text-[#1E293B]">Purchase Amount</code> as an input feature.
          Because High-Value status is derived by thresholding Purchase Amount ($Amount \ge Q_{75}$), including Purchase Amount produces artificial 100% test accuracy that collapses in production when evaluating shoppers before checkout.
          Our architecture strictly removes Purchase Amount from the input feature tensor $X$.
        </p>
      </div>

      {/* Data Dictionary Table */}
      <ClayCard className="p-6 space-y-4">
        <h3 className="font-bold text-base font-heading text-[#1E293B]">Comprehensive Data Dictionary</h3>
        <div className="overflow-x-auto rounded-xl border border-[#E0D7C9]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EDE7DD] text-[#475569] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Variable Name</th>
                <th className="px-4 py-3">Statistical Scale</th>
                <th className="px-4 py-3">ML Role</th>
                <th className="px-4 py-3">Academic Definition & Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D7C9]/60 bg-[#FAF8F5]">
              {variableDictionary.map((v) => (
                <tr key={v.name} className="hover:bg-[#F2ECE1] transition-colors">
                  <td className="px-4 py-2.5 font-bold text-[#1E293B]">{v.name}</td>
                  <td className="px-4 py-2.5 text-[#64748B]">{v.type}</td>
                  <td className="px-4 py-2.5">
                    <ClayBadge
                      size="sm"
                      variant={
                        v.role.includes("Target") ? "coral" : v.role.includes("Key") ? "indigo" : v.role.includes("Leakage") ? "danger" : "neutral"
                      }
                    >
                      {v.role}
                    </ClayBadge>
                  </td>
                  <td className="px-4 py-2.5 text-[#475569]">{v.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ClayCard>
    </div>
  );
};
