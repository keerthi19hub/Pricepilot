import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Save, RotateCcw, Check, User, Shield } from 'lucide-react';
import { api } from '../services/api';
import { Category, Brand } from '../types';
import { useAuth } from '../context/AuthContext';

export const PreferencesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // User preference values
  const [spendingBudget, setSpendingBudget] = useState('15000');
  const [preferredCats, setPreferredCats] = useState<string[]>([]);
  const [preferredBrands, setPreferredBrands] = useState<string[]>([]);
  const [qualityWeight, setQualityWeight] = useState(50);
  const [affordabilityWeight, setAffordabilityWeight] = useState(30);
  const [reliabilityWeight, setReliabilityWeight] = useState(20);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [cats, brs, pref] = await Promise.all([
          api.getCategories(),
          api.getBrands(),
          isAuthenticated ? api.getPreferences().catch(() => null) : null
        ]);
        setCategories(cats);
        setBrands(brs);

        if (pref) {
          if (pref.spending_budget) setSpendingBudget(pref.spending_budget.toString());
          if (pref.preferred_categories) setPreferredCats(pref.preferred_categories);
          if (pref.preferred_brands) setPreferredBrands(pref.preferred_brands);
          if (pref.quality_weight) setQualityWeight(Math.round(pref.quality_weight * 100));
          if (pref.affordability_weight) setAffordabilityWeight(Math.round(pref.affordability_weight * 100));
          if (pref.reliability_weight) setReliabilityWeight(Math.round(pref.reliability_weight * 100));
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [isAuthenticated]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const total = qualityWeight + affordabilityWeight + reliabilityWeight;
      const normalizedQ = qualityWeight / total;
      const normalizedA = affordabilityWeight / total;
      const normalizedR = reliabilityWeight / total;

      if (isAuthenticated) {
        await api.updatePreferences({
          spending_budget: Number(spendingBudget),
          preferred_categories: preferredCats,
          preferred_brands: preferredBrands,
          quality_weight: normalizedQ,
          affordability_weight: normalizedA,
          reliability_weight: normalizedR
        });
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCatToggle = (slug: string) => {
    setPreferredCats(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const handleBrandToggle = (name: string) => {
    setPreferredBrands(prev =>
      prev.includes(name) ? prev.filter(b => b !== name) : [...prev, name]
    );
  };

  const resetDefaults = () => {
    setQualityWeight(50);
    setAffordabilityWeight(30);
    setReliabilityWeight(20);
    setSpendingBudget('15000');
    setPreferredCats([]);
    setPreferredBrands([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
          <span>Personalized Intelligence Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          User Preferences & Weighting Controls
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Tune how PricePilot ranks products for your needs. Adjust weights to favor high-end build quality, strict budget limits, or brand reliability.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
        {/* Account summary banner */}
        {isAuthenticated && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Signed in as <strong>{user?.email}</strong></span>
            </div>
            <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Cloud Synced
            </span>
          </div>
        )}

        {/* Typical Spending Budget */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Typical Target Budget (₹ INR)
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
            <input
              type="number"
              value={spendingBudget}
              onChange={(e) => setSpendingBudget(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>
          <p className="text-xs text-slate-500">
            Used as the default baseline when evaluating affordability without an active search budget.
          </p>
        </div>

        {/* Weighting Sliders */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Algorithmic Weight Prioritization
            </h3>
            <p className="text-xs text-slate-500">
              Configure your personal scoring formula (Default: 50% Quality, 30% Affordability, 20% Reliability).
            </p>
          </div>

          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            {/* Quality Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-emerald-800">Quality Evidence ({qualityWeight}%)</span>
                <span className="text-slate-500">Specs, hardware tier, Bayesian rating</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={qualityWeight}
                onChange={(e) => setQualityWeight(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Affordability Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-blue-800">Affordability & Price Efficiency ({affordabilityWeight}%)</span>
                <span className="text-slate-500">Savings vs budget & normalized unit rate</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={affordabilityWeight}
                onChange={(e) => setAffordabilityWeight(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Reliability Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-purple-800">Reliability & Support ({reliabilityWeight}%)</span>
                <span className="text-slate-500">Warranty duration & retailer policy</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={reliabilityWeight}
                onChange={(e) => setReliabilityWeight(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>
          </div>
        </div>

        {/* Preferred Categories */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Frequent Categories of Interest
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => handleCatToggle(c.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  preferredCats.includes(c.slug)
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={resetDefaults}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" />
                Preferences Saved!
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
