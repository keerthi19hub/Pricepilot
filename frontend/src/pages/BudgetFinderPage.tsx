import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles, Sliders, ArrowRight, Check, Award,
  ShieldCheck, TrendingDown, Tag, Scale, CheckCircle2, Info
} from 'lucide-react';
import { api } from '../services/api';
import { Category, Brand, BudgetFinderResult, RecommendationCard } from '../types';
import { ValueScoreBadge } from '../components/ValueScoreBadge';
import { ProductCard } from '../components/ProductCard';

export const BudgetFinderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Form states
  const [selectedCatSlug, setSelectedCatSlug] = useState(searchParams.get('category') || 'electronics');
  const [budgetInput, setBudgetInput] = useState(searchParams.get('budget') || '16000');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'balanced');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Result state
  const [result, setResult] = useState<BudgetFinderResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, brs] = await Promise.all([
          api.getCategories(),
          api.getBrands()
        ]);
        setCategories(cats);
        setBrands(brs);
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  // Run calculation whenever form is submitted or initial url params arrive
  const runFinder = async () => {
    if (!budgetInput || Number(budgetInput) <= 0) return;
    setLoading(true);
    try {
      const res = await api.runBudgetFinder({
        category_slug: selectedCatSlug,
        budget: Number(budgetInput),
        priority,
        brand_preferences: selectedBrands.length > 0 ? selectedBrands : undefined
      });
      setResult(res);
    } catch (err) {
      console.error('Failed to run budget finder:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (budgetInput) {
      runFinder();
    }
  }, [selectedCatSlug, priority]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runFinder();
  };

  const renderRecommendationCard = (card?: RecommendationCard) => {
    if (!card) return null;
    const p = card.product;

    let borderClr = 'border-emerald-300 bg-emerald-50/20';
    let badgeBg = 'bg-emerald-600 text-white';
    let icon = <Sparkles className="w-4 h-4" />;

    if (card.badge_type === 'BEST_BUDGET_PICK') {
      borderClr = 'border-blue-300 bg-blue-50/20';
      badgeBg = 'bg-blue-600 text-white';
      icon = <TrendingDown className="w-4 h-4" />;
    } else if (card.badge_type === 'BEST_QUALITY_WITHIN_BUDGET') {
      borderClr = 'border-purple-300 bg-purple-50/20';
      badgeBg = 'bg-purple-600 text-white';
      icon = <Award className="w-4 h-4" />;
    }

    return (
      <div className={`rounded-3xl border-2 ${borderClr} p-5 sm:p-6 bg-white shadow-lg flex flex-col justify-between space-y-4 relative overflow-hidden`}>
        {/* Top Tier Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${badgeBg} shadow-sm`}>
            {icon}
            <span>{card.badge_title}</span>
          </div>

          {p.best_value_score && (
            <ValueScoreBadge score={p.best_value_score} size="sm" showLabel={false} />
          )}
        </div>

        <div>
          <div className="text-xs text-slate-500 font-medium mb-1">{card.badge_subtitle}</div>
          <Link to={`/products/${p.id}`} className="block group">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
              {p.title}
            </h3>
          </Link>
        </div>

        {/* Product image */}
        <Link to={`/products/${p.id}`} className="block h-44 bg-slate-100 rounded-2xl p-3 overflow-hidden flex items-center justify-center">
          <img
            src={p.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
            alt={p.title}
            className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Price & Savings */}
        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
          <div>
            <div className="text-xs text-slate-400">Current Best Price</div>
            <div className="text-xl font-black text-slate-900">
              ₹{p.current_best_price?.toLocaleString('en-IN')}
            </div>
          </div>
          {Number(budgetInput) > (p.current_best_price || 0) && (
            <div className="text-right">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                ₹{(Number(budgetInput) - (p.current_best_price || 0)).toLocaleString('en-IN')} Under Budget
              </span>
            </div>
          )}
        </div>

        {/* Why this product was recommended */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5">
          <div className="text-xs font-bold text-slate-800">Why PricePilot Picked This:</div>
          <ul className="space-y-1 text-xs text-slate-600">
            {card.why_recommended.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          to={`/products/${p.id}`}
          className="mt-3 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <span>View Store Listings & Specs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Intelligent Value Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Budget-Based Product Finder
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Tell us your budget and what matters most to you. We evaluate quality benchmarks, customer evidence, and multi-retailer pricing to uncover your three ideal choices.
        </p>
      </div>

      {/* Interactive Controls Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Category
              </label>
              <select
                value={selectedCatSlug}
                onChange={(e) => setSelectedCatSlug(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-3.5 py-3 outline-none focus:border-emerald-600 focus:bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Your Maximum Budget (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="200"
                  step="500"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl pl-8 pr-3.5 py-3 outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Priority Weight Preset */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Your Shopping Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-3.5 py-3 outline-none focus:border-emerald-600 focus:bg-white"
              >
                <option value="balanced">⚖️ Balanced (50% Quality, 30% Price, 20% Trust)</option>
                <option value="quality_focused">🏆 Quality & Specs Focused (65% Quality)</option>
                <option value="budget_focused">💰 Maximum Savings Focused (55% Affordability)</option>
                <option value="reliability_focused">🛡️ Long Warranty & Brand Trust (40% Reliability)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Prices updated across Amazon India, Flipkart, Croma, Nykaa and partner feeds.
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Calculate Recommendations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* RESULTS SECTION: 3 RECOMMENDATION TIERS */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 bg-slate-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : result ? (
        <div className="space-y-12">
          {/* Section title */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Calculated Best Matches for ₹{Number(budgetInput).toLocaleString('en-IN')} Budget
            </h2>
            <p className="text-xs text-slate-500">
              {result.methodology_note}
            </p>
          </div>

          {/* 3 TIERS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderRecommendationCard(result.best_overall_value)}
            {renderRecommendationCard(result.best_budget_pick)}
            {renderRecommendationCard(result.best_quality_pick)}
          </div>

          {/* All eligible products within pool */}
          {result.all_eligible_products.length > 0 && (
            <div className="pt-8 border-t border-slate-200 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Other Eligible Contenders within or near ₹{Number(budgetInput).toLocaleString('en-IN')}
                </h3>
                <p className="text-xs text-slate-500">
                  Ranked by Value-for-Money index according to your selected {priority} priorities
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {result.all_eligible_products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
