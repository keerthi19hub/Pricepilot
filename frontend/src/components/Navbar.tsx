import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass, Search, Scale, Heart, Sparkles, SlidersHorizontal,
  Shield, User as UserIcon, LogOut, Menu, X, Info, Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { compareList } = useCompare();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDataNotice, setShowDataNotice] = useState(false);
  const navigate = useNavigate();

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Utility Banner / Transparency Note */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PricePilot Engine v1.0 • INR (₹) Default Currency</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDataNotice(!showDataNotice)}
              className="text-slate-300 hover:text-white underline decoration-slate-600 underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3 h-3 text-emerald-400" />
              <span>Data Sources & Freshness Disclosure</span>
            </button>

            {showDataNotice && (
              <div className="absolute right-0 top-6 w-72 sm:w-80 bg-white text-slate-800 p-4 rounded-xl shadow-2xl border border-slate-200 text-xs z-50">
                <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Transparent Sourcing Standards
                </div>
                <p className="text-slate-600 leading-relaxed mb-2">
                  PricePilot indexes multi-retailer listings (Amazon India, Flipkart, Croma, Nykaa, etc.) using authorized affiliate feeds, partner APIs, and clearly labelled demonstration datasets.
                </p>
                <p className="text-slate-500 text-[11px]">
                  We never scrape illegally or fabricate real-time live prices. All demo datasets are transparently identified.
                </p>
                <button
                  onClick={() => setShowDataNotice(false)}
                  className="mt-2 text-emerald-600 font-bold hover:underline"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              P
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-lg tracking-tight flex items-center gap-1">
                PricePilot
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                  VFM
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium -mt-1 hidden sm:block">
                Shop Smart. Choose Better.
              </div>
            </div>
          </Link>

          {/* Quick Universal Search Input (Desktop) */}
          <form onSubmit={handleQuickSearch} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands, or try 'phone under ₹15,000'..."
              className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </form>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 font-medium text-xs sm:text-sm text-slate-600">
            <Link
              to="/categories"
              className="px-3 py-2 rounded-xl hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-slate-600" />
              <span>Categories</span>
            </Link>

            <Link
              to="/budget-finder"
              className="px-3 py-2 rounded-xl text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-colors flex items-center gap-1.5 font-semibold"
            >
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Budget Finder</span>
            </Link>

            <Link
              to="/compare"
              className="px-3 py-2 rounded-xl hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 relative"
            >
              <Scale className="w-4 h-4 text-slate-600" />
              <span>Compare</span>
              {compareList.length > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {compareList.length}
                </span>
              )}
            </Link>

            <Link
              to="/deals"
              className="px-3 py-2 rounded-xl hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Tag className="w-4 h-4 text-slate-600" />
              <span>Deal Insights</span>
            </Link>

            <Link
              to="/wishlist"
              className="px-3 py-2 rounded-xl hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4 text-slate-600" />
              <span>Wishlist</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-xl text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center gap-1.5 font-bold"
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Auth / Account */}
          <div className="hidden sm:flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/preferences"
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                  title="Preferences & Settings"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleQuickSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products or 'phones under ₹15k'..."
              className="w-full bg-slate-100 text-sm pl-9 pr-4 py-2 rounded-xl border border-slate-200"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              Categories
            </Link>
            <Link
              to="/budget-finder"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-800 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Budget Finder
            </Link>
            <Link
              to="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 flex items-center gap-2"
            >
              <Scale className="w-4 h-4 text-emerald-600" />
              Compare ({compareList.length})
            </Link>
            <Link
              to="/deals"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 flex items-center gap-2"
            >
              <Tag className="w-4 h-4 text-emerald-600" />
              Deals
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 flex items-center gap-2"
            >
              <Heart className="w-4 h-4 text-emerald-600" />
              Wishlist
            </Link>
            <Link
              to="/methodology"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-emerald-600" />
              Methodology
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            {isAuthenticated ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-slate-500 truncate max-w-[180px]">{user?.email}</span>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-xs font-bold text-rose-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
