import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, SlidersHorizontal, ArrowUpDown, X, Filter,
  RotateCcw, Sparkles, Tag, ChevronDown, Check
} from 'lucide-react';
import { api } from '../services/api';
import { Product, Category, Brand, Retailer } from '../types';
import { ProductCard } from '../components/ProductCard';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states initialized from URL params
  const [queryInput, setQueryInput] = useState(searchParams.get('q') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category_id') || searchParams.get('category_slug') || '');
  const [selectedBrands, setSelectedBrands] = useState<number[]>(() => {
    const raw = searchParams.getAll('brand_ids');
    return raw.map(Number).filter(Boolean);
  });
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [minQuality, setMinQuality] = useState(searchParams.get('min_quality_score') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'best_value');

  // Load Categories, Brands & Retailers
  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, brs, rets] = await Promise.all([
          api.getCategories(),
          api.getBrands(),
          api.getRetailers()
        ]);
        setCategories(cats);
        setBrands(brs);
        setRetailers(rets);
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch products when filters or searchParams change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          q: searchParams.get('q') || undefined,
          category_id: searchParams.get('category_id') ? Number(searchParams.get('category_id')) : undefined,
          category_slug: searchParams.get('category_slug') || undefined,
          brand_ids: searchParams.getAll('brand_ids').length > 0 ? searchParams.getAll('brand_ids').map(Number) : undefined,
          min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
          max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
          min_quality_score: searchParams.get('min_quality_score') ? Number(searchParams.get('min_quality_score')) : undefined,
          sort_by: searchParams.get('sort_by') || 'best_value',
          size: 24
        };

        const res = await api.getProducts(params);
        setProducts(res.items);
        setTotalCount(res.total);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [searchParams]);

  // Synchronize internal state with URL updates
  const applyFilters = (updates: Record<string, any>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        nextParams.delete(key);
      } else if (Array.isArray(value)) {
        nextParams.delete(key);
        value.forEach(v => nextParams.append(key, v.toString()));
      } else {
        nextParams.set(key, value.toString());
      }
    });
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ q: queryInput.trim() });
  };

  const handleBrandToggle = (brandId: number) => {
    const updated = selectedBrands.includes(brandId)
      ? selectedBrands.filter(id => id !== brandId)
      : [...selectedBrands, brandId];
    setSelectedBrands(updated);
    applyFilters({ brand_ids: updated });
  };

  const clearAllFilters = () => {
    setQueryInput('');
    setSelectedCat('');
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setMinQuality('');
    setSortBy('best_value');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(
    searchParams.get('q') ||
    searchParams.get('category_id') ||
    searchParams.get('category_slug') ||
    searchParams.getAll('brand_ids').length > 0 ||
    searchParams.get('min_price') ||
    searchParams.get('max_price') ||
    searchParams.get('min_quality_score')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Search by product name, model number, brand, or 'washing machine under 30000'..."
              className="w-full bg-slate-50 text-slate-900 text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-600 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            {queryInput && (
              <button
                type="button"
                onClick={() => { setQueryInput(''); applyFilters({ q: '' }); }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Search</span>
          </button>
        </form>

        {/* Results count & sorting bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-bold text-slate-900">{totalCount}</span>
            <span>products available</span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-emerald-700 font-semibold hover:underline flex items-center gap-1 ml-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset all filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Sorting select */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  applyFilters({ sort_by: e.target.value });
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 text-xs outline-none focus:border-emerald-600"
              >
                <option value="best_value">✨ Value-for-Money Index</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="quality_desc">Quality Score (High to Low)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6 lg:sticky lg:top-24`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              Filter Catalog
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Category
            </label>
            <select
              value={selectedCat}
              onChange={(e) => {
                setSelectedCat(e.target.value);
                applyFilters({ category_id: e.target.value });
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-emerald-600 font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Price Range (₹ INR)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={() => applyFilters({ min_price: minPrice })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-emerald-600"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={() => applyFilters({ max_price: maxPrice })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Quality Benchmark Score Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider">Min Quality Score</span>
              <span className="font-bold text-emerald-700">{minQuality || 'Any'}{minQuality ? '/100' : ''}</span>
            </div>
            <input
              type="range"
              min="60"
              max="95"
              step="5"
              value={minQuality || '60'}
              onChange={(e) => {
                setMinQuality(e.target.value);
                applyFilters({ min_quality_score: e.target.value });
              }}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Standard (60)</span>
              <span>Flagship (90+)</span>
            </div>
          </div>

          {/* Brands Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Popular Brands
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {brands.map((b) => (
                <label
                  key={b.id}
                  className="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 cursor-pointer py-0.5"
                >
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b.id)}
                    onChange={() => handleBrandToggle(b.id)}
                    className="w-3.5 h-3.5 rounded text-emerald-600 accent-emerald-600"
                  />
                  <span className="truncate">{b.name}</span>
                  <span className="ml-auto text-[10px] text-slate-400">{b.trust_score}% trust</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* PRODUCTS RESULTS GRID */}
        <main className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">No matching products found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                We couldn't find any items matching your exact combination of search terms and filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
