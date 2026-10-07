import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { ClayCard } from "../components/clay/ClayCard";
import { ClayButton } from "../components/clay/ClayButton";
import { ClayInput, ClaySelect } from "../components/clay/ClayInput";
import { predictCustomerValue, PredictPayload, PredictResponse } from "../services/api";

const FREQUENCIES = ["Weekly", "Bi-Weekly", "Monthly", "Quarterly", "Every 3 Months", "Annually"];
const CATEGORIES = ["Clothing", "Footwear", "Outerwear", "Accessories"];
const GENDERS = ["Male", "Female"];
const SEASONS = ["Spring", "Summer", "Fall", "Winter"];
const DISCOUNT_OPTIONS = ["Yes", "No"];
const PAYMENT_METHODS = ["Credit Card", "Debit Card", "PayPal", "Cash", "Bank Transfer", "Venmo"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SHIPPING_TYPES = ["Standard", "Express", "Free Shipping", "Next Day Air", "2-Day Shipping", "Store Pickup"];
const ITEMS_PURCHASED = ["Brush Set", "Chair", "Cookbook", "Cookware", "Cycling Bottle", "Desk", "Dress", "Dumbbells", "Fitness Tracker", "Headphones", "History Book", "Jacket", "Jeans", "Lamp", "Laptop", "Makeup Kit", "Novel", "Perfume", "Phone", "Running Shoes", "Science Book", "Self-help", "Serum", "Skincare Set", "Smartwatch", "Storage Bin", "Sweater", "T-Shirt", "Tablet", "Yoga Mat"];
const LOCATIONS = ["Austin", "Boston", "Chicago", "Houston", "Los Angeles", "Miami", "New York", "Seattle"];
const COLORS = ["Black", "Blue", "Gold", "Green", "Purple", "Red", "White"];
const PREFERRED_BRANDS = ["Aster", "Horizon", "Luma", "Northwind", "Summit", "Vivid"];

export const LivePredictionPage: React.FC = () => {
  const [modelType, setModelType] = useState<string>("logistic_regression");
  const [age, setAge] = useState<number>(35);
  const [purchaseAmount, setPurchaseAmount] = useState<number>(60);
  const [reviewRating, setReviewRating] = useState<number>(4.0);
  const [previousPurchases, setPreviousPurchases] = useState<number>(18);
  const [gender, setGender] = useState<string>("Male");
  const [category, setCategory] = useState<string>("Clothing");
  const [itemPurchased, setItemPurchased] = useState<string>("Sweater");
  const [location, setLocation] = useState<string>("New York");
  const [season, setSeason] = useState<string>("Fall");
  const [discountApplied, setDiscountApplied] = useState<string>("Yes");
  const [promoCodeUsed, setPromoCodeUsed] = useState<string>("Yes");
  const [frequency, setFrequency] = useState<string>("Monthly");
  const [paymentMethod, setPaymentMethod] = useState<string>("Credit Card");
  const [size, setSize] = useState<string>("M");
  const [color, setColor] = useState<string>("Black");
  const [shippingType, setShippingType] = useState<string>("Standard");
  const [preferredBrand, setPreferredBrand] = useState<string>("Vivid");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const payload: PredictPayload = {
        model_type: modelType,
        Age: Number(age),
        "Purchase Amount": Number(purchaseAmount),
        "Review Rating": Number(reviewRating),
        "Previous Purchases": Number(previousPurchases),
        Gender: gender,
        Category: category,
        "Item Purchased": itemPurchased,
        Location: location,
        Size: size,
        Color: color,
        Season: season,
        "Shipping Type": shippingType,
        "Payment Method": paymentMethod,
        "Discount Applied": discountApplied,
        "Promo Code Used": promoCodeUsed,
        "Preferred Brand": preferredBrand,
        "Frequency of Purchases": frequency,
      };
      const res = await predictCustomerValue(payload);
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Prediction request failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = result?.prediction?.toLowerCase().includes("subscribed") && !result?.prediction?.toLowerCase().includes("not");
  const prob = result ? Math.round(result.probability_subscribed * 100) : 0;

  const directionIcon = (dir: string) => {
    if (dir === "Positive") return <TrendingUp size={14} className="text-[#10B981]" />;
    if (dir === "Negative") return <TrendingDown size={14} className="text-[#EF4444]" />;
    return <Minus size={14} className="text-[#94A3B8]" />;
  };

  const directionColor = (dir: string) => {
    if (dir === "Positive") return "text-[#10B981] bg-[#ECFDF5] border-[#10B981]/20";
    if (dir === "Negative") return "text-[#EF4444] bg-[#FEF2F2] border-[#EF4444]/20";
    return "text-[#94A3B8] bg-[#F8FAFC] border-[#CBD5E1]/40";
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1E293B] font-heading">
          Live Subscription Prediction
        </h1>
        <p className="text-sm text-[#64748B] mt-1.5 max-w-2xl">
          Enter customer behavioural features to predict whether a customer is{" "}
          <span className="font-semibold text-[#0D9488]">Subscribed</span> or{" "}
          <span className="font-semibold text-[#FF6B6B]">Not Subscribed</span>.
        </p>
      </div>

      {/* Anti-Leakage Notice */}
      <ClayCard className="p-4 flex items-start space-x-3 bg-[#FFF7ED] border-[#D97706]/30">
        <ShieldCheck size={18} className="text-[#D97706] shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-[#92400E] uppercase tracking-wider">
            Classification Target: Subscription Status
          </p>
          <p className="text-xs text-[#78350F] mt-0.5 leading-relaxed">
            The model predicts whether a customer is Subscribed using all available behavioral features.
            No analytical leakage is present in this pipeline.
          </p>
        </div>
      </ClayCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <ClayCard className="p-6 space-y-5">
          <div className="flex items-center space-x-2">
            <Sparkles size={18} className="text-[#FF6B6B]" />
            <h2 className="text-base font-bold text-[#1E293B] font-heading">Customer Features</h2>
          </div>

          <form onSubmit={handlePredict} className="space-y-4">
            {/* Model Selection */}
            <ClaySelect
              label="Classification Model"
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              options={["logistic_regression", "decision_tree"]}
            />

            {/* Numerical Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <ClayInput
                label="Age"
                type="number"
                min={10} max={100} step={1}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
              <ClayInput
                label="Purchase Amount ($)"
                type="number"
                min={0} max={500} step={1}
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(Number(e.target.value))}
              />
              <ClayInput
                label="Review Rating (1-5)"
                type="number"
                min={1} max={5} step={0.1}
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
              />
              <ClayInput
                label="Previous Purchases"
                type="number"
                min={0} max={100} step={1}
                value={previousPurchases}
                onChange={(e) => setPreviousPurchases(Number(e.target.value))}
              />
            </div>

            {/* Categorical Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <ClaySelect label="Gender" value={gender} onChange={(e) => setGender(e.target.value)} options={GENDERS} />
              <ClaySelect label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES} />
              <ClaySelect label="Item Purchased" value={itemPurchased} onChange={(e) => setItemPurchased(e.target.value)} options={ITEMS_PURCHASED} />
              <ClaySelect label="Location" value={location} onChange={(e) => setLocation(e.target.value)} options={LOCATIONS} />
              <ClaySelect label="Size" value={size} onChange={(e) => setSize(e.target.value)} options={SIZES} />
              <ClaySelect label="Color" value={color} onChange={(e) => setColor(e.target.value)} options={COLORS} />
              <ClaySelect label="Season" value={season} onChange={(e) => setSeason(e.target.value)} options={SEASONS} />
              <ClaySelect label="Shipping Type" value={shippingType} onChange={(e) => setShippingType(e.target.value)} options={SHIPPING_TYPES} />
              <ClaySelect label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} options={PAYMENT_METHODS} />
              <ClaySelect label="Discount Applied" value={discountApplied} onChange={(e) => setDiscountApplied(e.target.value)} options={DISCOUNT_OPTIONS} />
              <ClaySelect label="Promo Code Used" value={promoCodeUsed} onChange={(e) => setPromoCodeUsed(e.target.value)} options={DISCOUNT_OPTIONS} />
              <ClaySelect label="Preferred Brand" value={preferredBrand} onChange={(e) => setPreferredBrand(e.target.value)} options={PREFERRED_BRANDS} />
              <ClaySelect label="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} options={FREQUENCIES} />
            </div>

            <ClayButton
              type="submit"
              variant="primary"
              size="lg"
              icon={Sparkles}
              disabled={loading}
            >
              {loading ? "Running Prediction…" : "Predict Subscription Status"}
            </ClayButton>
          </form>
        </ClayCard>

        {/* Results Panel */}
        <div className="space-y-5">
          {error && (
            <ClayCard className="p-5 flex items-start space-x-3 bg-[#FEF2F2] border-[#EF4444]/30">
              <AlertCircle size={20} className="text-[#EF4444] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#991B1B]">Prediction Error</p>
                <p className="text-xs text-[#B91C1C] mt-1">{error}</p>
              </div>
            </ClayCard>
          )}

          {result ? (
            <>
              {/* Main Result Card */}
              <ClayCard
                className={`p-6 space-y-4 border-2 ${
                  isSubscribed ? "border-[#0D9488]/40 bg-[#F0FDFA]" : "border-[#FF6B6B]/40 bg-[#FFF5F5]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isSubscribed ? "bg-[#0D9488]/15" : "bg-[#FF6B6B]/15"
                      }`}
                    >
                      {isSubscribed ? (
                        <CheckCircle size={24} className="text-[#0D9488]" />
                      ) : (
                        <AlertCircle size={24} className="text-[#FF6B6B]" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                        Prediction
                      </p>
                      <p
                        className={`text-xl font-black font-heading ${
                          isSubscribed ? "text-[#0D9488]" : "text-[#FF6B6B]"
                        }`}
                      >
                        {result.prediction}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Probability</p>
                    <p className="text-2xl font-black font-heading text-[#1E293B]">
                      {result.probability_percentage}
                    </p>
                    <p className="text-[10px] text-[#64748B]">{result.confidence_level}</p>
                  </div>
                </div>

                {/* Probability Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#64748B]">
                    <span>Not Subscribed</span>
                    <span>Subscribed</span>
                  </div>
                  <div className="h-3 bg-[#E5DFD5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-[#FF6B6B] to-[#0D9488] rounded-full transition-all duration-700"
                      style={{ width: `${prob}%` }}
                    />
                  </div>
                </div>
              </ClayCard>

              {/* Explanation */}
              <ClayCard className="p-5 space-y-2">
                <div className="flex items-center space-x-2">
                  <Info size={15} className="text-[#4F46E5]" />
                  <p className="text-xs font-bold text-[#1E293B]">Model Explanation</p>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">{result.explanation}</p>
                <p className="text-[10px] text-[#94A3B8]">
                  Model used: <span className="font-semibold">{result.model_used}</span>
                </p>
              </ClayCard>

              {/* Feature Impacts */}
              {result.feature_impacts && result.feature_impacts.length > 0 && (
                <ClayCard className="p-5 space-y-3">
                  <p className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                    Feature Impact Analysis
                  </p>
                  {result.feature_impacts.map((impact, i) => (
                    <div
                      key={i}
                      className={`flex items-start space-x-3 p-3 rounded-xl border ${directionColor(impact.direction)}`}
                    >
                      {directionIcon(impact.direction)}
                      <div>
                        <p className="text-[11px] font-bold">{impact.feature}</p>
                        <p className="text-[10px] mt-0.5 opacity-80">{impact.reason}</p>
                      </div>
                    </div>
                  ))}
                </ClayCard>
              )}
            </>
          ) : (
            !loading && (
              <ClayCard className="p-8 text-center space-y-3 border-dashed border-2 border-[#E5DFD5]">
                <Sparkles size={32} className="mx-auto text-[#CBD5E1]" />
                <p className="text-sm font-medium text-[#94A3B8]">
                  Fill in the customer profile and click Predict
                </p>
                <p className="text-xs text-[#CBD5E1]">
                  Results will appear here with probability estimates and feature impact analysis
                </p>
              </ClayCard>
            )
          )}
        </div>
      </div>
    </div>
  );
};
