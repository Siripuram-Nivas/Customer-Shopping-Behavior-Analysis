import React, { useEffect, useState } from "react";
import {
  Users,
  DollarSign,
  ShoppingBag,
  Award,
  Filter,
  RotateCcw,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { ClayKPI } from "../components/clay/ClayKPI";
import { ClayCard } from "../components/clay/ClayCard";
import { ClayButton } from "../components/clay/ClayButton";
import { ClaySelect } from "../components/clay/ClayInput";
import { ClayChartCard } from "../components/clay/ClayBadge";
import { fetchDashboard, fetchDatasetSchema, DashboardData, DataFilters, ColumnSchema } from "../services/api";

const PIE_COLORS = ["#FF6B6B", "#0D9488", "#4F46E5", "#D97706", "#EC4899", "#8B5CF6", "#06B6D4"];

const TOOLTIP_STYLE = {
  backgroundColor: "#FAF8F5",
  borderRadius: "12px",
  border: "1px solid #E0D7C9",
};

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [schemaMap, setSchemaMap] = useState<Record<string, string[]>>({});

  const [selectedGender, setSelectedGender] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSeason, setSelectedSeason] = useState<string>("All");
  const [selectedSubscription, setSelectedSubscription] = useState<string>("All");
  const [selectedPayment, setSelectedPayment] = useState<string>("All");
  const [selectedShipping, setSelectedShipping] = useState<string>("All");
  const [selectedDiscount, setSelectedDiscount] = useState<string>("All");

  const loadData = async (filters: DataFilters) => {
    try {
      setLoading(true);
      const res = await fetchDashboard(filters);
      setData(res);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load schema for dynamic filter options
    fetchDatasetSchema()
      .then((schema) => {
        const map: Record<string, string[]> = {};
        schema.columns.forEach((col: ColumnSchema) => {
          if (!col.is_numeric && col.unique_values) {
            map[col.name] = col.unique_values;
          }
        });
        setSchemaMap(map);
      })
      .catch(console.error);
    loadData({});
  }, []);

  const opts = (col: string) => ["All", ...(schemaMap[col] || [])];

  const handleApplyFilters = () => {
    const f: DataFilters = {};
    if (selectedGender !== "All") f.gender = [selectedGender];
    if (selectedCategory !== "All") f.category = [selectedCategory];
    if (selectedSeason !== "All") f.season = [selectedSeason];
    if (selectedSubscription !== "All") f.subscription_status = [selectedSubscription];
    if (selectedPayment !== "All") f.payment_method = [selectedPayment];
    if (selectedShipping !== "All") f.shipping_type = [selectedShipping];
    if (selectedDiscount !== "All") f.discount_applied = [selectedDiscount];
    loadData(f);
  };

  const handleClearFilters = () => {
    setSelectedGender("All");
    setSelectedCategory("All");
    setSelectedSeason("All");
    setSelectedSubscription("All");
    setSelectedPayment("All");
    setSelectedShipping("All");
    setSelectedDiscount("All");
    loadData({});
  };

  const isFilterActive =
    selectedGender !== "All" || selectedCategory !== "All" || selectedSeason !== "All" ||
    selectedSubscription !== "All" || selectedPayment !== "All" || selectedShipping !== "All" ||
    selectedDiscount !== "All";

  const kpis = data?.profile_kpis;
  const totalCustomers = kpis?.["Total Customers"] ?? 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E293B] font-heading">
            Analytics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Notebook-driven KPIs, revenue behaviour, loyalty, geography, and customer segmentation.
          </p>
        </div>
        {isFilterActive && (
          <ClayButton size="sm" icon={RotateCcw} onClick={handleClearFilters}>
            Clear Filters
          </ClayButton>
        )}
      </div>

      {/* Filter Bar */}
      <ClayCard className="p-5 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#64748B]">
          <Filter size={16} className="text-[#FF6B6B]" />
          <span>Cohort Filters — Full Dataset</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <ClaySelect
            label="Gender"
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            options={opts("Gender").length > 1 ? opts("Gender") : ["All", "Male", "Female"]}
          />
          <ClaySelect
            label="Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={opts("Category").length > 1 ? opts("Category") : ["All", "Clothing", "Footwear", "Outerwear", "Accessories"]}
          />
          <ClaySelect
            label="Season"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            options={opts("Season").length > 1 ? opts("Season") : ["All", "Spring", "Summer", "Fall", "Winter"]}
          />
          <ClaySelect
            label="Subscription Status"
            value={selectedSubscription}
            onChange={(e) => setSelectedSubscription(e.target.value)}
            options={opts("Subscription Status").length > 1 ? opts("Subscription Status") : ["All", "Yes", "No"]}
          />
          <ClaySelect
            label="Payment Method"
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            options={opts("Payment Method").length > 1 ? opts("Payment Method") : ["All", "Credit Card", "Debit Card", "Cash", "PayPal", "Venmo"]}
          />
          <ClaySelect
            label="Shipping Type"
            value={selectedShipping}
            onChange={(e) => setSelectedShipping(e.target.value)}
            options={opts("Shipping Type").length > 1 ? opts("Shipping Type") : ["All", "Standard", "Express", "Next Day Air", "Store Pickup", "Free Shipping", "2-Day Shipping"]}
          />
          <ClaySelect
            label="Discount Applied"
            value={selectedDiscount}
            onChange={(e) => setSelectedDiscount(e.target.value)}
            options={opts("Discount Applied").length > 1 ? opts("Discount Applied") : ["All", "Yes", "No"]}
          />
          <div className="flex items-end">
            <ClayButton size="sm" variant="primary" onClick={handleApplyFilters}>
              Apply Filters
            </ClayButton>
          </div>
        </div>
      </ClayCard>

      {/* Zero Record State */}
      {totalCustomers === 0 && !loading ? (
        <ClayCard className="p-12 text-center space-y-4">
          <AlertCircle size={40} className="mx-auto text-[#FF6B6B]" />
          <h3 className="text-xl font-bold text-[#1E293B] font-heading">
            No records match the selected filters.
          </h3>
          <ClayButton onClick={handleClearFilters}>Reset Filters</ClayButton>
        </ClayCard>
      ) : (
        <>
          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ClayKPI
              title="Active Customers"
              value={loading ? "..." : totalCustomers.toLocaleString()}
              icon={Users}
              accentColor="coral"
            />
            <ClayKPI
              title="Total Revenue"
              value={loading ? "..." : `$${(kpis?.["Total Revenue"] ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`}
              icon={DollarSign}
              accentColor="teal"
            />
            <ClayKPI
              title="Average Spend"
              value={loading ? "..." : `$${(kpis?.["Average Spend"] ?? 0).toFixed(2)}`}
              icon={ShoppingBag}
              accentColor="amber"
            />
            <ClayKPI
              title="Subscription Rate"
              value={loading ? "..." : `${(kpis?.["Subscription Rate"] ?? 0).toFixed(1)}%`}
              icon={Award}
              accentColor="rose"
            />
          </div>

          {/* Row 1: Category Analysis & Gender Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClayChartCard
              title="Revenue by Category"
              subtitle="Total purchase revenue grouped by product category"
              badge="Revenue"
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.category_analysis as any[]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD5" vertical={false} />
                    <XAxis dataKey="Category" tick={{ fill: "#64748B", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748B", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="Total_Revenue" fill="#FF6B6B" radius={[8, 8, 0, 0]} name="Total Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ClayChartCard>

            <ClayChartCard
              title="Gender Distribution"
              subtitle="Customer demographic split"
              badge="Profile"
            >
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.gender_distribution}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label={(entry: any) => `${entry.label}: ${entry.count}`}
                    >
                      {data?.gender_distribution?.map((_entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ClayChartCard>
          </div>

          {/* Row 2: Season Revenue & Subscription Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClayChartCard
              title="Revenue by Season"
              subtitle="Total revenue and average spend per season"
              badge="Seasonal"
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.season_revenue as any[]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD5" vertical={false} />
                    <XAxis dataKey="Season" tick={{ fill: "#64748B", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748B", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(val: any, name: string) => [
                        `$${Number(val).toLocaleString()}`,
                        name === "Total_Revenue" ? "Total Revenue" : "Avg Spend",
                      ]}
                    />
                    <Bar dataKey="Total_Revenue" fill="#4F46E5" radius={[8, 8, 0, 0]} name="Total Revenue" />
                    <Bar dataKey="Average_Spend" fill="#D97706" radius={[8, 8, 0, 0]} name="Avg Spend" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ClayChartCard>

            <ClayChartCard
              title="Subscription Status"
              subtitle="Proportion of subscribed vs non-subscribed customers"
              badge="Loyalty"
            >
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.subscription_distribution}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label={(entry: any) => `${entry.label}: ${entry.value.toFixed(1)}%`}
                    >
                      {data?.subscription_distribution?.map((_entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ClayChartCard>
          </div>

          {/* Row 3: Frequency Distribution & Age Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClayChartCard
              title="Purchase Frequency Distribution"
              subtitle="How often customers make purchases"
              badge="Behaviour"
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.frequency_distribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD5" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#64748B", fontSize: 11 }} />
                    <YAxis dataKey="label" type="category" tick={{ fill: "#1E293B", fontSize: 10 }} width={110} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="value" fill="#0D9488" radius={[0, 8, 8, 0]} name="%" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ClayChartCard>

            <ClayChartCard
              title="Age Distribution"
              subtitle="Histogram of customer age across the dataset"
              badge="Profile"
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.age_distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD5" vertical={false} />
                    <XAxis dataKey="bin" tick={{ fill: "#64748B", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#64748B", fontSize: 11 }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill="#EC4899" radius={[8, 8, 0, 0]} name="Customers" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ClayChartCard>
          </div>

          {/* Row 4: Loyalty — Previous Purchases vs Spend */}
          <ClayChartCard
            title="Customer Loyalty: Purchase History vs Spend"
            subtitle="Average current spend and subscription rate by number of previous purchases"
            badge="Loyalty"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.loyalty_analysis as any[]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD5" />
                  <XAxis dataKey="Previous Purchases" tick={{ fill: "#64748B", fontSize: 11 }} label={{ value: "Previous Purchases", position: "insideBottom", offset: -2, fill: "#64748B", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748B", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(val: any, name: string) => [
                      name.includes("Rate") ? `${val}%` : `$${val}`,
                      name,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="Average_Current_Spend"
                    stroke="#FF6B6B"
                    strokeWidth={2.5}
                    dot={false}
                    name="Avg Spend ($)"
                  />
                  <Line
                    type="monotone"
                    dataKey="Subscription_Rate"
                    stroke="#0D9488"
                    strokeWidth={2.5}
                    dot={false}
                    name="Subscription Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ClayChartCard>

          {/* Row 5: Top Items & Location Revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClayChartCard
              title="Top Items by Revenue"
              subtitle="Top 10 purchased items ranked by total revenue"
              badge="Revenue"
            >
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(data?.item_revenue as any[])?.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD5" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#64748B", fontSize: 11 }} />
                    <YAxis dataKey="Item Purchased" type="category" tick={{ fill: "#1E293B", fontSize: 10 }} width={100} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="Revenue" fill="#D97706" radius={[0, 8, 8, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ClayChartCard>

            <ClayChartCard
              title="Top Locations by Revenue"
              subtitle="Top 10 locations ranked by total purchase revenue"
              badge="Geography"
            >
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(data?.location_analysis as any[])?.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD5" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#64748B", fontSize: 11 }} />
                    <YAxis dataKey="Location" type="category" tick={{ fill: "#1E293B", fontSize: 10 }} width={90} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="Revenue" fill="#8B5CF6" radius={[0, 8, 8, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ClayChartCard>
          </div>

          {/* Row 6: Customer Segments */}
          {data?.segment_profile && data.segment_profile.length > 0 && (
            <ClayChartCard
              title="Customer Segmentation (K-Means, K=4)"
              subtitle="Behavioural clusters ranked by revenue contribution"
              badge="Segmentation"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#E5DFD5]">
                      {["Segment", "Customers", "Avg Age", "Avg Spend ($)", "Avg Prev. Purchases", "Avg Rating", "Subscription Rate (%)", "Revenue ($)"].map((h) => (
                        <th key={h} className="text-left py-2 px-3 font-bold text-[#64748B] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data.segment_profile as any[]).map((seg, i) => (
                      <tr key={i} className="border-b border-[#F0EBE3] hover:bg-[#FAF8F5]">
                        <td className="py-2 px-3 font-bold text-[#FF6B6B]">Segment {seg.Segment}</td>
                        <td className="py-2 px-3">{seg.Customers?.toLocaleString()}</td>
                        <td className="py-2 px-3">{seg.Avg_Age?.toFixed(1)}</td>
                        <td className="py-2 px-3">${seg.Avg_Spend?.toFixed(2)}</td>
                        <td className="py-2 px-3">{seg.Avg_Previous?.toFixed(1)}</td>
                        <td className="py-2 px-3">{seg.Avg_Rating?.toFixed(2)}</td>
                        <td className="py-2 px-3">{seg.Subscription_Rate?.toFixed(1)}%</td>
                        <td className="py-2 px-3">${seg.Revenue?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ClayChartCard>
          )}

          {/* Row 7: Correlation with Subscription */}
          {data?.correlation_with_subscription && data.correlation_with_subscription.length > 0 && (
            <ClayChartCard
              title="Correlation with Subscription Status"
              subtitle="Pearson correlation of numeric features with the Subscribed target variable"
              badge="Statistics"
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.correlation_with_subscription} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD5" horizontal={false} />
                    <XAxis type="number" domain={[-1, 1]} tick={{ fill: "#64748B", fontSize: 11 }} />
                    <YAxis dataKey="Feature" type="category" tick={{ fill: "#1E293B", fontSize: 11 }} width={130} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar
                      dataKey="Correlation"
                      radius={[0, 6, 6, 0]}
                      name="Correlation"
                      fill="#4F46E5"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ClayChartCard>
          )}

          {/* Statistical Summary Footer */}
          {data?.stat_summary && Object.keys(data.stat_summary).length > 0 && (
            <ClayCard className="p-6 space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp size={18} className="text-[#FF6B6B]" />
                <h3 className="text-base font-bold text-[#1E293B] font-heading">Key Analytical Findings</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { label: "Top Category", value: data.stat_summary.top_category as string },
                  { label: "Top Category Revenue", value: `$${Number(data.stat_summary.top_category_revenue ?? 0).toLocaleString()}` },
                  { label: "Top Season", value: data.stat_summary.top_season as string },
                  { label: "Top Season Revenue", value: `$${Number(data.stat_summary.top_season_revenue ?? 0).toLocaleString()}` },
                  { label: "Best-Selling Item", value: data.stat_summary.top_item as string },
                  { label: "Sub Rate (Discount)", value: `${Number(data.stat_summary.discount_yes_rate ?? 0).toFixed(1)}%` },
                  { label: "Sub Rate (No Discount)", value: `${Number(data.stat_summary.discount_no_rate ?? 0).toFixed(1)}%` },
                ].map((item) => (
                  <div key={item.label} className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E5DFD5]">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-bold text-[#1E293B] mt-1 truncate">{item.value ?? "—"}</p>
                  </div>
                ))}
              </div>
            </ClayCard>
          )}
        </>
      )}
    </div>
  );
};
