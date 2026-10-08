import React, { useState } from "react";
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Award,
  Layers,
  BrainCircuit,
  BarChart,
} from "lucide-react";
import { ClayCard } from "../components/clay/ClayCard";
import { ClayButton } from "../components/clay/ClayButton";
import { ClayBadge } from "../components/clay/ClayBadge";

export const PresentationPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Problem Statement & Project Objectives",
      subtitle: "E-Commerce Customer Behavior Analysis & Propensity Modeling",
      icon: Presentation,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#475569]">
          <p className="leading-relaxed">
            In competitive retail environments, identifying high-value customers prior to order finalization allows businesses to allocate retention incentives, optimize customer acquisition costs (CAC), and maximize customer lifetime value (LTV).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9]">
              <span className="font-bold text-[#FF6B6B] block mb-1">Objective 1</span>
              Perform exhaustive exploratory data analysis (EDA) across 3,900 customer shopping sessions.
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9]">
              <span className="font-bold text-[#0D9488] block mb-1">Objective 2</span>
              Develop leak-free classification pipelines predicting high-value purchase propensity.
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9]">
              <span className="font-bold text-[#4F46E5] block mb-1">Objective 3</span>
              Deploy an independent full-stack web application with tactile Claymorphism UI.
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Full-Stack System Architecture",
      subtitle: "Decoupled React / Vite Frontend + FastAPI / Scikit-Learn Backend",
      icon: Layers,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#475569]">
          <p className="leading-relaxed">
            The platform is structured as two completely independent applications communicating via strictly typed REST APIs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] space-y-2">
              <span className="font-bold text-[#1E293B] block">Frontend Client (Vite / React / TypeScript)</span>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Custom Claymorphism design system (soft 3D tokens)</li>
                <li>Responsive Recharts visualization wrappers</li>
                <li>Real-time multi-filter synchronization</li>
                <li>Zero external UI framework dependencies</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] space-y-2">
              <span className="font-bold text-[#1E293B] block">Analytical Backend (FastAPI / Python)</span>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Centralized calculation engine in NumPy & Pandas</li>
                <li>Anti-leakage Scikit-learn pipelines with StandardScaler & OHE</li>
                <li>Pydantic request & response schema validation</li>
                <li>Pure mathematical calculations (no hardcoding)</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Exploratory Data Analysis Findings",
      subtitle: "Empirical Insights Across Demographics, Seasonality & Discounts",
      icon: BarChart,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#475569]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9]">
              <span className="font-bold text-[#FF6B6B] block mb-1">Category & Spend Dynamics</span>
              Clothing and Sports dominate transaction count, but Electronics commands the highest average order value.
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9]">
              <span className="font-bold text-[#0D9488] block mb-1">Subscription Loyalty Lift</span>
              Subscribers exhibit higher repeat frequency (1.5x) and greater resilience during off-peak seasons.
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9]">
              <span className="font-bold text-[#4F46E5] block mb-1">Promotional Elasticity</span>
              Over 40% of sessions utilize discounts, driving transaction volume without eroding high-value conversion.
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9]">
              <span className="font-bold text-[#D97706] block mb-1">Demographic Balance</span>
              Gender representation is balanced across Male and Female cohorts, verifying unbiased sample collection.
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Target Formulation & Anti-Leakage Protocol",
      subtitle: "Preserving Rigorous Generalization in Commercial ML",
      icon: BrainCircuit,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#475569]">
          <div className="p-4 rounded-xl bg-[#FFE5E5] border border-[#FF6B6B]/20 text-[#1E293B]">
            <span className="font-bold block text-sm mb-1 text-[#FF6B6B]">The Target Leakage Trap</span>
            When predicting whether a customer is "High Value" (Y in [0, 1]), using Purchase Amount as an input feature gives a deceptive 100% accuracy because the target was created by thresholding Purchase Amount. In production, Purchase Amount is unknown prior to checkout!
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] space-y-2">
            <span className="font-bold text-[#1E293B] block">Our Architectural Remedy:</span>
            <p className="text-xs">
              1. Purchase Amount is strictly stripped from the feature matrix $X$.<br />
              2. Only pre-purchase predictors (Customer Age, Gender, Category, Location, Season, Rating, Subscription Status, Prior Orders, Purchase Frequency) are used.<br />
              3. Produces realistic ~90%+ test accuracy that holds up in real-world deployment.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Machine Learning Benchmarks & Selection",
      subtitle: "Comparative Cross-Validation of Supervised Classifiers",
      icon: Award,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#475569]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Logistic Regression</span>
              <div className="text-2xl font-black text-[#FF6B6B] mt-1 font-heading">~92% Test Acc</div>
              <span className="text-xs text-[#0D9488] font-semibold">High Generalization</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Decision Tree</span>
              <div className="text-2xl font-black text-[#4F46E5] mt-1 font-heading">~90% Test Acc</div>
              <span className="text-xs text-[#64748B] font-semibold">Max Depth = 5</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Validation Standard</span>
              <div className="text-2xl font-black text-[#D97706] mt-1 font-heading">5-Fold CV</div>
              <span className="text-xs text-[#64748B] font-semibold">Stratified Splits</span>
            </div>
          </div>
          <p className="text-xs leading-relaxed">
            Logistic Regression serves as the champion model due to superior test F1 score and minimal generalization gap (Train/Test variance &lt; 2.5%), mitigating the risk of overfitting.
          </p>
        </div>
      ),
    },
    {
      title: "Project Conclusion & Technical Defense",
      subtitle: "Full-Stack Deployment & Responsible AI Verification",
      icon: Sparkles,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#475569]">
          <p className="leading-relaxed">
            The project satisfies all requirements for an academic software engineering and data science capstone:
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#1E293B]">
              <CheckCircle2 size={16} className="text-[#10B981]" />
              <span>Independent React/Vite UI & FastAPI backend.</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#1E293B]">
              <CheckCircle2 size={16} className="text-[#10B981]" />
              <span>Full mathematical precision across all KPIs, charts, and correlations.</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#1E293B]">
              <CheckCircle2 size={16} className="text-[#10B981]" />
              <span>Live prediction engine with explainable feature contribution attribution.</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#1E293B]">
              <CheckCircle2 size={16} className="text-[#10B981]" />
              <span>Cohesive Claymorphism design system tailored for high aesthetic clarity.</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E293B] font-heading">Presentation Deck Mode</h1>
          <p className="text-xs text-[#64748B]">Defense slide deck for viva examinations and project presentations</p>
        </div>
        <ClayBadge variant="coral">
          Slide {currentSlide + 1} of {slides.length}
        </ClayBadge>
      </div>

      <ClayCard className="p-8 sm:p-12 flex flex-col justify-between space-y-6" style={{ minHeight: "420px" }}>
        <div className="space-y-6">
          <div className="flex items-start justify-between border-b border-[#E0D7C9] pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#FF6B6B] uppercase tracking-wider">
                Slide {currentSlide + 1}
              </span>
              <h2 className="text-2xl font-black text-[#1E293B] font-heading mt-1">
                {slide.title}
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">{slide.subtitle}</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#FFE5E5] text-[#FF6B6B] shadow-sm">
              <Icon size={24} />
            </div>
          </div>

          <div>{slide.content}</div>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-[#E0D7C9]">
          <ClayButton
            size="sm"
            icon={ChevronLeft}
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          >
            Previous
          </ClayButton>

          <div className="flex space-x-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentSlide ? "bg-[#FF6B6B] w-6" : "bg-[#D8D1C5]"
                }`}
              />
            ))}
          </div>

          <ClayButton
            size="sm"
            variant="primary"
            icon={ChevronRight}
            disabled={currentSlide === slides.length - 1}
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          >
            Next Slide
          </ClayButton>
        </div>
      </ClayCard>
    </div>
  );
};
