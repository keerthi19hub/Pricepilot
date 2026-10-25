import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

export const CompareTray: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xl border border-slate-700/80 transition-all animate-in slide-in-from-bottom duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Info & items */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
              <Scale className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-100">{compareList.length} / 4 Products</div>
              <div className="text-[11px] text-slate-400">Comparing specs & value</div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block shrink-0" />

          {/* Thumbnails */}
          <div className="flex items-center gap-2 shrink-0">
            {compareList.map((product) => (
              <div
                key={product.id}
                className="relative group w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0"
              >
                <img
                  src={product.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute inset-0 bg-rose-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from comparison"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {Array.from({ length: 4 - compareList.length }).map((_, i) => (
              <div
                key={i}
                className="w-11 h-11 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-[10px] shrink-0"
              >
                +Slot
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            onClick={clearCompare}
            className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={() => navigate('/compare')}
            disabled={compareList.length < 2}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md ${
              compareList.length >= 2
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <span>Compare Now {compareList.length < 2 ? '(Pick 2+)' : ''}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
