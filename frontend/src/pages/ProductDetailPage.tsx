import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Scale, Heart, Bell, ShieldCheck, Truck, RotateCcw,
  ExternalLink, Check, AlertCircle, ArrowLeft, Tag, Info, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { ProductDetail, PriceHistory } from '../types';
import { ValueScoreBadge } from '../components/ValueScoreBadge';
import { PriceHistoryChart } from '../components/PriceHistoryChart';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);

  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const prodId = Number(id);
        const [pData, hData] = await Promise.all([
          api.getProductDetail(prodId),
          api.getProductPriceHistory(prodId)
        ]);
        setProduct(pData);
        setPriceHistory(hData);
        if (pData.variants && pData.variants.length > 0) {
          setSelectedVariantId(pData.variants[0].id);
        }
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-6 w-32 bg-slate-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-200 animate-pulse rounded-2xl" />
          <div className="space-y-4">
            <div className="h-10 bg-slate-200 animate-pulse rounded" />
            <div className="h-24 bg-slate-200 animate-pulse rounded" />
            <div className="h-48 bg-slate-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
        <Link to="/search" className="text-emerald-600 font-semibold hover:underline">
          Return to product search
        </Link>
      </div>
    );
  }

  const inCompare = isInCompare(product.id);
  const discount = product.base_mrp && product.current_best_price
    ? Math.round(((product.base_mrp - product.current_best_price) / product.base_mrp) * 100)
    : 0;

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to save items to your wishlist.');
      return;
    }
    try {
      if (inWishlist) {
        setInWishlist(false);
      } else {
        await api.addToWishlist(product.id, product.current_best_price);
        setInWishlist(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to set price alerts.');
      return;
    }
    try {
      await api.createPriceAlert(product.id, Number(alertTargetPrice));
      setAlertSuccess(true);
      setTimeout(() => {
        setShowAlertModal(false);
        setAlertSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back button / Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          to={`/search?category_id=${product.category?.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {product.category?.name || 'Category'}</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Compare toggle */}
          <button
            onClick={() => inCompare ? removeFromCompare(product.id) : addToCompare(product)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              inCompare
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {inCompare ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
            <span>{inCompare ? 'In Comparison' : 'Add to Compare'}</span>
          </button>

          {/* Wishlist toggle */}
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-xl border transition-all ${
              inWishlist
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Top Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
          {discount > 0 && (
            <span className="absolute top-4 left-4 z-10 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              {discount}% OFF
            </span>
          )}
          <img
            src={product.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
            alt={product.title}
            className="w-full max-h-96 object-contain rounded-2xl"
          />
        </div>

        {/* Right: Info, VFM Score & Best Price */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                {product.brand?.name}
              </span>
              {product.model_number && (
                <span className="text-xs text-slate-500 font-mono">
                  Model: {product.model_number}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Price & Unit Price banner */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500 font-medium">Best Verified Listed Price</div>
              <div className="flex items-baseline gap-3 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  ₹{product.current_best_price ? product.current_best_price.toLocaleString('en-IN') : product.base_mrp.toLocaleString('en-IN')}
                </span>
                {product.base_mrp > (product.current_best_price || 0) && (
                  <span className="text-sm text-slate-500 line-through">
                    ₹{product.base_mrp.toLocaleString('en-IN')} MRP
                  </span>
                )}
              </div>
            </div>

            {/* Normalized Unit Price Callout */}
            {product.unit_price_display && (
              <div className="bg-white border border-emerald-200 px-3 py-1.5 rounded-xl shadow-xs text-right">
                <div className="text-[10px] font-bold uppercase text-emerald-800">Normalized Unit Rate</div>
                <div className="text-xs font-bold text-slate-900">{product.unit_price_display}</div>
              </div>
            )}
          </div>

          {/* Variants Selector if present */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Configuration / Variant:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedVariantId === variant.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {variant.variant_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VALUE SCORE BREAKDOWN METER */}
          {product.value_score_breakdown && (
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-slate-900 text-sm">
                    PricePilot Value-for-Money Evaluation
                  </span>
                </div>
                <ValueScoreBadge score={product.value_score_breakdown.overall_score} size="md" />
              </div>

              {/* 3 Component bars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <div className="text-[11px] text-slate-500 font-semibold">Quality Evidence (50%)</div>
                  <div className="text-base font-extrabold text-slate-900">
                    {Math.round(product.value_score_breakdown.quality_score)}/100
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <div className="text-[11px] text-slate-500 font-semibold">Price Efficiency (30%)</div>
                  <div className="text-base font-extrabold text-slate-900">
                    {Math.round(product.value_score_breakdown.affordability_score)}/100
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <div className="text-[11px] text-slate-500 font-semibold">Reliability Support (20%)</div>
                  <div className="text-base font-extrabold text-slate-900">
                    {Math.round(product.value_score_breakdown.reliability_score)}/100
                  </div>
                </div>
              </div>

              {/* Explainability bullets */}
              <div className="pt-2 border-t border-emerald-200/60 space-y-1.5">
                <div className="text-xs font-bold text-emerald-950">Why PricePilot recommends this:</div>
                <ul className="space-y-1 text-xs text-slate-700">
                  {product.value_score_breakdown.explainability_reasons.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAlertModal(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Bell className="w-4 h-4 text-emerald-600" />
              <span>Set In-App Price Alert</span>
            </button>
          </div>
        </div>
      </div>

      {/* CROSS-RETAILER PRICE COMPARISON TABLE */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Cross-Retailer Price Comparison
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare listed prices, shipping costs, estimated total purchase cost, and warranty terms across stores
            </p>
          </div>

          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            {product.listings?.length || 0} stores compared
          </span>
        </div>

        {/* Listings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Retailer</th>
                <th className="py-3 px-3">Listed Price</th>
                <th className="py-3 px-3">Shipping</th>
                <th className="py-3 px-3">Est. Total Cost</th>
                <th className="py-3 px-3">Warranty & Returns</th>
                <th className="py-3 px-3">Fulfillment</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {product.listings?.map((listing, index) => (
                <tr key={listing.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-3 font-bold text-slate-900 flex items-center gap-2">
                    {index === 0 && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                        Lowest
                      </span>
                    )}
                    <span>{listing.retailer?.name || 'Retailer'}</span>
                  </td>

                  <td className="py-4 px-3">
                    <span className="font-extrabold text-slate-900">
                      ₹{listing.listed_price.toLocaleString('en-IN')}
                    </span>
                    {listing.original_price && listing.original_price > listing.listed_price && (
                      <span className="text-[11px] text-slate-400 line-through block">
                        ₹{listing.original_price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-3 text-slate-600">
                    {listing.shipping_cost === 0 ? (
                      <span className="text-emerald-700 font-semibold">FREE</span>
                    ) : (
                      `₹${listing.shipping_cost}`
                    )}
                  </td>

                  <td className="py-4 px-3 font-extrabold text-slate-900 text-sm">
                    ₹{listing.estimated_total_cost.toLocaleString('en-IN')}
                  </td>

                  <td className="py-4 px-3 text-slate-600 text-xs">
                    <div>{listing.warranty_months} mo. warranty</div>
                    <div className="text-[11px] text-slate-400">{listing.return_days} day returns</div>
                  </td>

                  <td className="py-4 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {listing.source_type === 'DEMO' ? 'Labelled Demo' : 'Verified Partner'}
                    </span>
                  </td>

                  <td className="py-4 px-3 text-right">
                    <a
                      href={listing.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <span>Visit Store</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* HISTORICAL PRICE TRACKING CHART */}
      {priceHistory && (
        <section>
          <PriceHistoryChart history={priceHistory} />
        </section>
      )}

      {/* SPECIFICATIONS TABLE */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 pb-3 border-b border-slate-100">
            Technical Specifications & Attributes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b border-slate-100 text-xs sm:text-sm">
                <span className="font-semibold text-slate-500 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="font-bold text-slate-900 text-right">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PRICE ALERT MODAL */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" />
              Set Price Drop Alert
            </h3>
            <p className="text-xs text-slate-600">
              Receive an in-app alert when <strong>{product.title}</strong> drops to your target budget.
            </p>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Desired Target Price (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    value={alertTargetPrice}
                    onChange={(e) => setAlertTargetPrice(e.target.value)}
                    placeholder={(product.current_best_price ? product.current_best_price * 0.9 : 1000).toFixed(0)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:border-emerald-600 font-bold"
                  />
                </div>
              </div>

              {alertSuccess ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Price alert activated in your account!</span>
                </div>
              ) : (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAlertModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Save Alert
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
