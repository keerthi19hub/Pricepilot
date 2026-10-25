import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass, ArrowRight, Sparkles, Smartphone, Shirt, Home,
  Tv, ShoppingBag, HeartPulse, Baby, BookOpen, Dumbbell, Car, Luggage
} from 'lucide-react';
import { api } from '../services/api';
import { Category } from '../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'electronics': return <Smartphone className="w-6 h-6" />;
      case 'beauty-and-skincare': return <Sparkles className="w-6 h-6" />;
      case 'fashion': return <Shirt className="w-6 h-6" />;
      case 'home-and-kitchen': return <Home className="w-6 h-6" />;
      case 'appliances': return <Tv className="w-6 h-6" />;
      case 'grocery': return <ShoppingBag className="w-6 h-6" />;
      case 'health-and-wellness': return <HeartPulse className="w-6 h-6" />;
      case 'baby-and-kids': return <Baby className="w-6 h-6" />;
      case 'books-and-stationery': return <BookOpen className="w-6 h-6" />;
      case 'sports-and-fitness': return <Dumbbell className="w-6 h-6" />;
      case 'automotive': return <Car className="w-6 h-6" />;
      case 'travel-and-lifestyle': return <Luggage className="w-6 h-6" />;
      default: return <Compass className="w-6 h-6" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="max-w-2xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span>Extensible Category Taxonomy</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Explore All Product Categories
        </h1>
        <p className="text-sm text-slate-600">
          PricePilot features category-aware intelligence filters. Each department evaluates specialized specifications, relevant metrics, and normalized unit costs.
        </p>
      </div>

      {/* Grid of 12 Categories */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-48 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    {getCategoryIcon(cat.slug)}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Category #{cat.id}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-1.5">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {cat.description || 'Discover and compare products with verified prices and quality benchmarks.'}
                </p>

                {/* Relevant Filters Pills */}
                {cat.relevant_filters && cat.relevant_filters.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 mb-4">
                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                      Category-Specific Benchmarks:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.relevant_filters.map((rf: any, idx: number) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md"
                        >
                          {rf.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to={`/search?category_id=${cat.id}`}
                className="mt-2 w-full py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-600 hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-200 hover:border-emerald-600"
              >
                <span>Browse Products in {cat.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
