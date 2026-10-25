import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Sparkles, Scale, TrendingDown, ArrowRight, ShieldCheck,
  Zap, Award, CheckCircle, Info, ChevronRight, Sliders, ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ValueScoreBadge } from '../components/ValueScoreBadge';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickBudget, setQuickBudget] = useState('15000');
  const [quickCategory, setQuickCategory] = useState('electronics');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, featuredRes] = await Promise.all([
          api.getCategories(),
          api.getFeaturedRecommendations()
        ]);
        setCategories(cats);
        setFeaturedProducts(featuredRes.featured || []);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleChipClick = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleQuickBudgetFinder = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/budget-finder?category=${quickCategory}&budget=${quickBudget}`);
  };

  const sampleChips = [
    'Best smartphone under ₹15,000',
    'Good skincare under ₹500',
    'Affordable washing machine for a family',
    'Best headphones for online classes',
    'Comfortable running shoes under ₹2,000',
    'Best air fryer for a small family'
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 bg-gradient-to-b from-emerald-50/60 via-slate-50/40 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            {/* Pill Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Universal Shopping Intelligence</span>
              <span className="w-1 h-1 rounded-full bg-emerald-600" />
              <span className="font-semibold text-emerald-700">Shop Smart. Choose Better.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Don't just buy the cheapest.{' '}
              <span className="text-emerald-700 block sm:inline">
                Find the best value.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              PricePilot compares live listings across Amazon, Flipkart, Croma, Nykaa and more. We benchmark specifications, customer reliability, and historical price trends so you make smart decisions.
            </p>

            {/* UNIVERSAL SEARCH BAR */}
            <div className="pt-4 max-w-2xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative shadow-xl rounded-2xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you looking for? (e.g., 'headphones under ₹3,000' or 'Samsung M34')"
                  className="w-full bg-white text-slate-900 text-sm sm:text-base pl-12 pr-32 py-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-500 font-medium"
                />
                <Search className="w-5 h-5 text-slate-500 absolute left-4 top-4.5" />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Natural Language Search Chips */}
              <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" /> Try queries:
                </span>
                {sampleChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChipClick(chip)}
                    className="text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg transition-all shadow-xs text-left cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK BUDGET-BASED PRODUCT FINDER WIDGET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-slate-700">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left text */}
            <div className="lg:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <Sliders className="w-3.5 h-3.5" />
                <span>Feature Spotlight</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Budget-Based Product Finder
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Enter your exact budget and category. PricePilot instantly computes the 3 distinct recommendation picks: Best Overall Value, Best Budget Pick, and Best Quality within your stated limit.
              </p>
            </div>

            {/* Right Interactive Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleQuickBudgetFinder} className="bg-slate-800/90 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-slate-700 shadow-lg space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Target Category
                    </label>
                    <select
                      value={quickCategory}
                      onChange={(e) => setQuickCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Budget (₹ INR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        min="100"
                        step="500"
                        value={quickBudget}
                        onChange={(e) => setQuickBudget(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl pl-8 pr-3 py-2.5 outline-none focus:border-emerald-500 font-bold"
                        placeholder="e.g. 15000"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Includes Bayesian ratings & brand trust</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Run Intelligent Match</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES (12 MULTI-CATEGORY DIRECTORY) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Browse Multi-Category Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Universal coverage across tech, lifestyle, appliances, and daily essentials
            </p>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All 12</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/search?category_id=${cat.id}`}
              className="group bg-white rounded-2xl border border-slate-200 p-4 text-center hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col items-center justify-center min-h-[120px]"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Award className="w-6 h-6" />
              </div>
              <span className="font-bold text-slate-900 text-xs sm:text-sm leading-tight group-hover:text-emerald-700 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* BEST-VALUE RECOMMENDATIONS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 gap-2">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Algorithmic Rankings</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Highest Value-for-Money Picks
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Top products evaluated by quality benchmarks (50%), price efficiency (30%), and reliability (20%)
            </p>
          </div>

          <Link
            to="/search?sort_by=best_value"
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Explore All Ranked Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* HOW PRICEPILOT WORKS — METHODOLOGY EXPLAINER */}
      <section className="bg-slate-100/80 border-y border-slate-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              How PricePilot Evaluates Products
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Unlike generic price-checkers that merely sort by lowest cost, PricePilot runs an explainable 3-pillar scoring engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
              <div className="text-2xl font-black text-emerald-600 mb-2">50%</div>
              <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                Quality Evidence
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Objective benchmark specifications, build tier, and Bayesian customer rating adjustments to prevent low-sample 5-star bias.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
              <div className="text-2xl font-black text-blue-600 mb-2">30%</div>
              <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-blue-600" />
                Price Efficiency
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Affordability relative to user budget, historical median category pricing, and normalized unit cost (per 100ml / 100g / item).
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
              <div className="text-2xl font-black text-purple-600 mb-2">20%</div>
              <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                Reliability & Support
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Documented manufacturer warranty duration, retailer return window, authorized service network, and verified fulfillment status.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              to="/methodology"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-4"
            >
              <span>Read complete mathematical methodology & scoring docs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
