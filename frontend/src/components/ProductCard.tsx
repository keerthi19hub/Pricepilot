import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Check, ShieldCheck, Tag } from 'lucide-react';
import { Product } from '../types';
import { ValueScoreBadge } from './ValueScoreBadge';
import { useCompare } from '../context/CompareContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const inCompare = isInCompare(product.id);

  const discount = product.base_mrp && product.current_best_price
    ? Math.round(((product.base_mrp - product.current_best_price) / product.base_mrp) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 items-center">
        {product.best_value_score && (
          <ValueScoreBadge score={product.best_value_score} size="sm" showLabel={false} />
        )}
        {discount > 0 && (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Compare button shortcut */}
      <button
        onClick={(e) => {
          e.preventDefault();
          inCompare ? removeFromCompare(product.id) : addToCompare(product);
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-xl border text-xs font-medium transition-all ${
          inCompare
            ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
            : 'bg-white/90 backdrop-blur-sm border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
        }`}
        title={inCompare ? 'Remove from comparison' : 'Add to side-by-side comparison'}
      >
        <span className="flex items-center gap-1">
          {inCompare ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{inCompare ? 'Added' : 'Compare'}</span>
        </span>
      </button>

      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="block relative pt-[75%] bg-slate-100 overflow-hidden">
        <img
          src={product.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Category & Brand */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-semibold uppercase tracking-wider text-emerald-700">
            {product.brand?.name || 'Brand'}
          </span>
          <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            {product.category?.name || 'Category'}
          </span>
        </div>

        {/* Title */}
        <Link to={`/products/${product.id}`} className="block group-hover:text-emerald-700 transition-colors">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 leading-snug mb-2">
            {product.title}
          </h3>
        </Link>

        {/* Normalized unit price if applicable */}
        {product.normalized_unit_price && product.unit_measure && (
          <div className="text-[11px] font-semibold text-slate-700 bg-emerald-50/70 border border-emerald-100 px-2 py-0.5 rounded-md self-start mb-2.5">
            ₹{product.normalized_unit_price.toFixed(2)} per {product.unit_measure === 'ml' ? '100 ml' : product.unit_measure === 'g' ? '100 g' : 'unit'}
          </div>
        )}

        {/* Pricing block */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-baseline justify-between">
          <div>
            <div className="text-xs text-slate-500 mb-0.5">Best Price Available</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                ₹{product.current_best_price ? product.current_best_price.toLocaleString('en-IN') : product.base_mrp.toLocaleString('en-IN')}
              </span>
              {product.base_mrp > (product.current_best_price || 0) && (
                <span className="text-xs text-slate-500 line-through">
                  ₹{product.base_mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-full">
              {product.retailer_count || 1} retailer{product.retailer_count === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Reliability & Quality proof */}
        <div className="mt-3 pt-2 text-[11px] text-slate-600 flex items-center justify-between border-t border-dashed border-slate-100">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Quality: <strong className="text-slate-800">{Math.round(product.quality_score)}/100</strong>
          </span>
          {product.lowest_listing_retailer && (
            <span className="truncate max-w-[120px] text-slate-700" title={`Lowest price on ${product.lowest_listing_retailer}`}>
              on {product.lowest_listing_retailer}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
