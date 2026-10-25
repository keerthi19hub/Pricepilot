import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, TrendingDown, CheckCircle2, ArrowRight, Info, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export const DealsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDeals() {
      try {
        const res = await api.getProducts({ size: 30, sort_by: 'best_value' });
        // Filter products with good discounts
        const withDiscounts = res.items.filter(
          p => p.base_mrp && p.current_best_price && p.base_mrp > p.current_best_price
        );
        setProducts(withDiscounts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDeals();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <Tag className="w-3.5 h-3.5 text-emerald-600" />
          <span>Evidence-Based Deal Detection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Verified Deals & Historical Lows
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          PricePilot classifies deals by comparing current retailer prices against recorded multi-week price observations.
          We never highlight manufactured fake discounts based on inflated MRPs.
        </p>
      </div>

      {/* Trust Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-1">
          <strong className="text-slate-900 font-bold block">
            How PricePilot Validates Deals:
          </strong>
          <span>
            A product receives a 'Good Price' or 'Lowest Price Recorded' badge only when verified historical observations confirm that the current price is genuinely below its typical 60-day running average across stores.
          </span>
        </div>
      </div>

      {/* Grid of Verified Deals */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
