import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale, X, Sparkles, Check, AlertCircle, ArrowLeft,
  ToggleLeft, ToggleRight, Award, ShieldCheck, Tag, Info
} from 'lucide-react';
import { api } from '../services/api';
import { ComparisonWorkspace, Product } from '../types';
import { useCompare } from '../context/CompareContext';
import { ValueScoreBadge } from '../components/ValueScoreBadge';

export const ComparePage: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [workspace, setWorkspace] = useState<ComparisonWorkspace | null>(null);
  const [loading, setLoading] = useState(false);
  const [highlightDiffOnly, setHighlightDiffOnly] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load catalog for quick add picker
    api.getProducts({ size: 30 }).then(res => setAllProducts(res.items)).catch(() => {});
  }, []);

  useEffect(() => {
    async function loadComparison() {
      if (compareList.length < 2) {
        setWorkspace(null);
        return;
      }
      setLoading(true);
      try {
        const ids = compareList.map(p => p.id);
        const data = await api.compareProducts(ids);
        setWorkspace(data);
      } catch (err) {
        console.error('Error fetching comparison', err);
      } finally {
        setLoading(false);
      }
    }
    loadComparison();
  }, [compareList]);

  if (compareList.length < 2) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Product Comparison Workspace
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Select at least 2 products (up to 4) from our catalog to compare specifications, prices across retailers, and algorithmic value verdicts.
        </p>

        {compareList.length === 1 && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 truncate mr-2">1. {compareList[0].title}</span>
            <span className="text-emerald-700 font-semibold shrink-0">Need 1 more</span>
          </div>
        )}

        <div className="pt-4 flex justify-center gap-3">
          <Link
            to="/search"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
          >
            Browse & Add Products
          </Link>
        </div>

        {/* Quick sample pickers */}
        {allProducts.length >= 2 && (
          <div className="pt-10 border-t border-slate-200 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Or quickly compare these top-rated items:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allProducts.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-emerald-300 transition-all text-xs"
                >
                  <div className="truncate mr-2">
                    <div className="font-bold text-slate-900 truncate">{p.title}</div>
                    <div className="text-slate-500">₹{p.current_best_price?.toLocaleString('en-IN')}</div>
                  </div>
                  <button
                    onClick={() => {
                      if (!compareList.some(item => item.id === p.id)) {
                        useCompare().addToCompare(p);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all shrink-0 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const displayedSpecs = workspace
    ? highlightDiffOnly
      ? workspace.spec_comparisons.filter(spec => spec.is_different)
      : workspace.spec_comparisons
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Scale className="w-3.5 h-3.5" />
            <span>Side-by-Side Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Comparison Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Evaluating {compareList.length} products across price, build quality, and verified specifications
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHighlightDiffOnly(!highlightDiffOnly)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              highlightDiffOnly
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {highlightDiffOnly ? (
              <ToggleRight className="w-5 h-5 text-emerald-600" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-slate-400" />
            )}
            <span>Highlight Differences Only</span>
          </button>

          <button
            onClick={clearCompare}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* DEFINITIVE PRICEPILOT VERDICT BANNER */}
      {workspace && (
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>PricePilot Value Verdict</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
            {workspace.value_verdict}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {workspace.verdict_reasons.map((reason, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-xs text-slate-200 leading-relaxed">
                <div className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Key Finding #{idx + 1}
                </div>
                {reason}
              </div>
            ))}
          </div>

          {/* Best For Scenario Badges */}
          {workspace.best_for_scenarios && (
            <div className="pt-3 border-t border-emerald-800/60 flex flex-wrap gap-2 text-xs">
              {Object.entries(workspace.best_for_scenarios).map(([scenario, prodTitle]) => (
                <div key={scenario} className="bg-emerald-950/80 border border-emerald-700/50 px-3 py-1.5 rounded-xl text-slate-300">
                  <span className="font-semibold text-emerald-400">{scenario}:</span>{' '}
                  <strong className="text-white">{prodTitle}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COMPARISON MATRIX TABLE */}
      {loading ? (
        <div className="h-96 bg-slate-100 animate-pulse rounded-3xl" />
      ) : workspace ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              {/* Product Header Row */}
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="p-4 w-48 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Product
                  </th>
                  {workspace.products.map((p) => (
                    <th key={p.id} className="p-4 min-w-[220px] max-w-[280px] align-top">
                      <div className="relative group space-y-3">
                        <button
                          onClick={() => removeFromCompare(p.id)}
                          className="absolute -top-1 -right-1 p-1 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-600 transition-colors"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-full h-36 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-2">
                          <img
                            src={p.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                            alt={p.title}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            {p.brand?.name}
                          </span>
                          <Link to={`/products/${p.id}`} className="block font-bold text-slate-900 hover:text-emerald-700 line-clamp-2">
                            {p.title}
                          </Link>
                        </div>

                        <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
                          <span className="text-base font-black text-slate-900">
                            ₹{p.current_best_price?.toLocaleString('en-IN')}
                          </span>
                          {p.best_value_score && (
                            <ValueScoreBadge score={p.best_value_score} size="sm" showLabel={false} />
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Attributes Body */}
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {displayedSpecs.map((spec) => (
                  <tr
                    key={spec.attribute_key}
                    className={`transition-colors ${
                      spec.is_different ? 'bg-amber-50/40 hover:bg-amber-50/70 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-4 text-xs font-bold text-slate-600 flex items-center justify-between">
                      <span>{spec.attribute_label}</span>
                      {spec.is_different && (
                        <span className="text-[10px] font-extrabold text-amber-700 uppercase bg-amber-100/80 px-1.5 py-0.2 rounded">
                          Differs
                        </span>
                      )}
                    </td>

                    {workspace.products.map((p) => (
                      <td key={p.id} className="p-4 text-xs sm:text-sm">
                        {spec.values_by_product_id[String(p.id)] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};
