import React, { useEffect, useState } from "react";
import {
  FlaskConical,
  Play,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Award,
  Layers,
  ScatterChart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart as RechartsScatter,
  Scatter,
  ZAxis,
} from "recharts";
import { ClayCard } from "../components/clay/ClayCard";
import { ClayButton } from "../components/clay/ClayButton";
import { ClaySelect } from "../components/clay/ClayInput";
import { ClayBadge } from "../components/clay/ClayBadge";
import {
  trainClassificationModel,
  compareClassificationModels,
  runRegression,
  runClustering,
} from "../services/api";

export const ModelLabPage: React.FC = () => {
  const [modelType, setModelType] = useState<string>("logistic_regression");
  const [testSize, setTestSize] = useState<number>(0.25);
  const [metrics, setMetrics] = useState<any>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [regressionData, setRegressionData] = useState<any>(null);
  const [clusteringData, setClusteringData] = useState<any>(null);
  const [kClusters, setKClusters] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrain = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await trainClassificationModel({
        model_type: modelType,
        test_size: testSize,
      });
      setMetrics(res);

      // Refresh comparison
      const comp = await compareClassificationModels();
      setComparison(comp);
    } catch (err: any) {
      setError(err.message || "Failed to train model.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunRegression = async () => {
    try {
      setLoading(true);
      const res = await runRegression("linear_regression");
      setRegressionData(res);
    } catch (err: any) {
      setError(err.message || "Failed to run regression.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunClustering = async () => {
    try {
      setLoading(true);
      const res = await runClustering(kClusters);
      setClusteringData(res);
    } catch (err: any) {
      setError(err.message || "Failed to run clustering.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleTrain();
  }, [modelType]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E293B] font-heading">Machine Learning Model Lab</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Fit, benchmark, and cross-validate supervised classifiers & unsupervised clusters under strict anti-leakage rules.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <ClayButton size="sm" onClick={handleRunRegression}>
            Run Regression
          </ClayButton>
          <ClayButton size="sm" onClick={handleRunClustering}>
            Run K-Means (PCA)
          </ClayButton>
        </div>
      </div>

      {/* Training Configuration Panel */}
      <ClayCard className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <ClaySelect
              label="Classifier Architecture"
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              options={[
                { label: "Logistic Regression (L2 Regularized Linear)", value: "logistic_regression" },
                { label: "Decision Tree Classifier (CART Entropy/Gini)", value: "decision_tree" },
              ]}
            />

            <ClaySelect
              label="Test Dataset Split Ratio"
              value={testSize.toString()}
              onChange={(e) => setTestSize(parseFloat(e.target.value))}
              options={[
                { label: "75% Train / 25% Test (Recommended)", value: "0.25" },
                { label: "80% Train / 20% Test (Large Sample)", value: "0.20" },
                { label: "70% Train / 30% Test (Conservative)", value: "0.30" },
              ]}
            />
          </div>

          <ClayButton
            variant="primary"
            loading={loading}
            icon={Play}
            onClick={handleTrain}
          >
            Retrain Model
          </ClayButton>
        </div>
      </ClayCard>

      {error && (
        <div className="p-4 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/30 text-[#991B1B] text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Metrics Banner */}
      {metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <ClayCard className="p-4 text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Test Accuracy</span>
              <div className="text-2xl font-black text-[#1E293B] font-heading mt-1">
                {metrics.test_accuracy}%
              </div>
            </ClayCard>

            <ClayCard className="p-4 text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Precision</span>
              <div className="text-2xl font-black text-[#0D9488] font-heading mt-1">
                {metrics.precision}%
              </div>
            </ClayCard>

            <ClayCard className="p-4 text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Recall</span>
              <div className="text-2xl font-black text-[#FF6B6B] font-heading mt-1">
                {metrics.recall}%
              </div>
            </ClayCard>

            <ClayCard className="p-4 text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">F1 Score</span>
              <div className="text-2xl font-black text-[#4F46E5] font-heading mt-1">
                {metrics.f1_score}%
              </div>
            </ClayCard>

            <ClayCard className="p-4 text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">5-Fold CV Mean</span>
              <div className="text-2xl font-black text-[#D97706] font-heading mt-1">
                {metrics.cross_val_mean}%
              </div>
            </ClayCard>

            <ClayCard className="p-4 text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Train Accuracy</span>
              <div className="text-2xl font-black text-[#64748B] font-heading mt-1">
                {metrics.train_accuracy}%
              </div>
            </ClayCard>
          </div>

          {/* Overfitting Analysis & Target Leakage Note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ClayCard className="p-6 space-y-3">
              <div className="flex items-center space-x-2 text-[#4F46E5]">
                <TrendingUp size={18} />
                <h3 className="font-bold text-base font-heading text-[#1E293B]">
                  Overfitting & Variance Analysis
                </h3>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                {metrics.overfitting_analysis}
              </p>
              <div className="pt-2 text-xs font-semibold text-[#64748B] flex items-center space-x-2">
                <span>Train: {metrics.train_accuracy}%</span>
                <span>•</span>
                <span>Test: {metrics.test_accuracy}%</span>
                <span>•</span>
                <span>Gap: {Math.abs(metrics.train_accuracy - metrics.test_accuracy).toFixed(2)}%</span>
              </div>
            </ClayCard>

            <ClayCard className="p-6 space-y-3">
              <div className="flex items-center space-x-2 text-[#0D9488]">
                <CheckCircle2 size={18} />
                <h3 className="font-bold text-base font-heading text-[#1E293B]">
                  Leakage Safeguards Active
                </h3>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                {metrics.leakage_prevention_note}
              </p>
              <div className="text-[11px] text-[#64748B]">
                Features utilized: {metrics.features_used?.join(", ")}
              </div>
            </ClayCard>
          </div>

          {/* Confusion Matrix & Feature Importance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Confusion Matrix */}
            <ClayCard className="p-6 space-y-4">
              <h3 className="font-bold text-base font-heading text-[#1E293B]">
                Confusion Matrix (Test Split)
              </h3>
              <p className="text-xs text-[#64748B]">
                Evaluation on unseen test holdout observations:
              </p>

              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-2">
                <div className="p-4 rounded-2xl bg-[#D1FAE5] border border-[#10B981]/30 text-center">
                  <span className="text-[10px] font-bold uppercase text-[#065F46]">True Negative (TN)</span>
                  <div className="text-2xl font-black text-[#065F46] mt-1 font-heading">
                    {metrics.confusion_matrix?.[0]?.[0]}
                  </div>
                  <span className="text-[10px] text-[#065F46]/80 font-medium">Standard Correct</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FEE2E2] border border-[#EF4444]/30 text-center">
                  <span className="text-[10px] font-bold uppercase text-[#991B1B]">False Positive (FP)</span>
                  <div className="text-2xl font-black text-[#991B1B] mt-1 font-heading">
                    {metrics.confusion_matrix?.[0]?.[1]}
                  </div>
                  <span className="text-[10px] text-[#991B1B]/80 font-medium">Type I Error</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FEF3C7] border border-[#F59E0B]/30 text-center">
                  <span className="text-[10px] font-bold uppercase text-[#92400E]">False Negative (FN)</span>
                  <div className="text-2xl font-black text-[#92400E] mt-1 font-heading">
                    {metrics.confusion_matrix?.[1]?.[0]}
                  </div>
                  <span className="text-[10px] text-[#92400E]/80 font-medium">Type II Error</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFE5E5] border border-[#FF6B6B]/30 text-center">
                  <span className="text-[10px] font-bold uppercase text-[#FF6B6B]">True Positive (TP)</span>
                  <div className="text-2xl font-black text-[#FF6B6B] mt-1 font-heading">
                    {metrics.confusion_matrix?.[1]?.[1]}
                  </div>
                  <span className="text-[10px] text-[#FF6B6B]/80 font-medium">High Value Correct</span>
                </div>
              </div>
            </ClayCard>

            {/* Feature Importance Bar Chart */}
            <ClayCard className="p-6 space-y-4">
              <h3 className="font-bold text-base font-heading text-[#1E293B]">
                Feature Importance / Weight Coefficients
              </h3>
              <p className="text-xs text-[#64748B]">
                Relative predictive contribution toward High-Value classification:
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.feature_importance}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD5" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#64748B", fontSize: 11 }} />
                    <YAxis dataKey="feature" type="category" tick={{ fill: "#1E293B", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FAF8F5",
                        borderRadius: "12px",
                        border: "1px solid #E0D7C9",
                      }}
                    />
                    <Bar dataKey="importance" fill="#FF6B6B" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ClayCard>
          </div>
        </div>
      )}

      {/* Model Comparison Table */}
      {comparison && (
        <ClayCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award size={20} className="text-[#D97706]" />
              <h3 className="font-bold text-lg font-heading text-[#1E293B]">
                Automated Model Benchmark & Champion Selection
              </h3>
            </div>
            <ClayBadge variant="amber">
              Champion: {comparison.strongest_model}
            </ClayBadge>
          </div>

          <p className="text-xs text-[#64748B]">
            {comparison.selection_criterion}
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#E0D7C9]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EDE7DD] text-[#475569] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Architecture</th>
                  <th className="px-4 py-3">Train Acc</th>
                  <th className="px-4 py-3">Test Acc</th>
                  <th className="px-4 py-3">Precision</th>
                  <th className="px-4 py-3">Recall</th>
                  <th className="px-4 py-3">F1 Score</th>
                  <th className="px-4 py-3">5-Fold CV</th>
                  <th className="px-4 py-3">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D7C9]/60 bg-[#FAF8F5]">
                {comparison.models?.map((m: any) => {
                  const isBest = m.model_name === comparison.strongest_model;
                  return (
                    <tr key={m.model_key} className={isBest ? "bg-[#FFE5E5]/40 font-semibold" : ""}>
                      <td className="px-4 py-3 font-bold text-[#1E293B]">{m.model_name}</td>
                      <td className="px-4 py-3 text-[#64748B]">{m.train_accuracy}%</td>
                      <td className="px-4 py-3">{m.test_accuracy}%</td>
                      <td className="px-4 py-3">{m.precision}%</td>
                      <td className="px-4 py-3">{m.recall}%</td>
                      <td className="px-4 py-3 text-[#4F46E5] font-bold">{m.f1_score}%</td>
                      <td className="px-4 py-3">{m.cross_val_mean}%</td>
                      <td className="px-4 py-3">
                        {isBest ? (
                          <ClayBadge variant="coral" size="sm">Champion</ClayBadge>
                        ) : (
                          <ClayBadge variant="neutral" size="sm">Challenger</ClayBadge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ClayCard>
      )}

      {/* Regression Results (if executed) */}
      {regressionData && (
        <ClayCard className="p-6 space-y-4">
          <h3 className="font-bold text-base font-heading text-[#1E293B]">
            Regression Benchmark: Continuous Purchase Amount ($ USD)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Algorithm</span>
              <div className="text-base font-bold text-[#1E293B] mt-1">{regressionData.model_name}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">R² Score (Goodness of Fit)</span>
              <div className="text-xl font-black text-[#0D9488] mt-1">{regressionData.r2_score}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Mean Absolute Error (MAE)</span>
              <div className="text-xl font-black text-[#FF6B6B] mt-1">${regressionData.mae}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Root Mean Squared Error (RMSE)</span>
              <div className="text-xl font-black text-[#4F46E5] mt-1">${regressionData.rmse}</div>
            </div>
          </div>
        </ClayCard>
      )}

      {/* Clustering Results (if executed) */}
      {clusteringData && (
        <ClayCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base font-heading text-[#1E293B]">
              Unsupervised K-Means Clustering & 2D PCA Space ($k={clusteringData.k_clusters}$)
            </h3>
            <ClayBadge variant="indigo">
              Explained Variance: {(clusteringData.explained_variance_ratio.reduce((a: number, b: number) => a + b, 0) * 100).toFixed(1)}%
            </ClayBadge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clusteringData.cluster_profiles?.map((prof: any) => (
              <div key={prof.cluster_id} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] space-y-2">
                <span className="text-xs font-bold text-[#FF6B6B] uppercase">{prof.label}</span>
                <div className="text-sm font-bold text-[#1E293B]">{prof.size} Customers</div>
                <div className="text-xs text-[#64748B] space-y-1">
                  <div>Avg Age: {prof.avg_age} yrs</div>
                  <div>Avg Basket: ${prof.avg_purchase}</div>
                  <div>Avg Past Purchases: {prof.avg_loyalty}</div>
                </div>
              </div>
            ))}
          </div>
        </ClayCard>
      )}
    </div>
  );
};
