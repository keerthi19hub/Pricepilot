import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight, Bell, Tag, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { WishlistItem, PriceAlert } from '../types';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';

export const WishlistPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const [wData, aData] = await Promise.all([
          api.getWishlist(),
          api.getPriceAlerts()
        ]);
        setItems(wData);
        setAlerts(aData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadWishlist();
  }, [isAuthenticated]);

  const handleRemove = async (id: number) => {
    try {
      await api.removeFromWishlist(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-200">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Saved Wishlist</h2>
        <p className="text-sm text-slate-600">
          Sign in or create an account to persist saved products and receive target price alerts across your sessions.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md"
        >
          <span>Sign In to View Wishlist</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500 fill-current" />
            Saved Products & Price Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tracking price updates across stores for {items.length} saved item{items.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-72 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Your wishlist is currently empty</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Browse our categories or use universal search to find products and click the heart icon to track prices.
          </p>
          <Link
            to="/search"
            className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <ProductCard product={item.product} />
              <button
                onClick={() => handleRemove(item.id)}
                className="absolute top-3 left-3 z-20 p-2 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm"
                title="Remove from wishlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* In-app price alerts */}
      {alerts.length > 0 && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            Active Target Price Alerts ({alerts.length})
          </h2>
          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            {alerts.map((alert) => (
              <div key={alert.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-900">{alert.product_title}</div>
                  <div className="text-slate-500 text-xs">
                    Current: ₹{alert.current_price?.toLocaleString('en-IN')} • Desired Target: ₹{alert.desired_price?.toLocaleString('en-IN')}
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  alert.triggered
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {alert.triggered ? 'Target Reached!' : 'Monitoring'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
