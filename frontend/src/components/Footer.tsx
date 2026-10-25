import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Scale, Info, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-lg">
                P
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">PricePilot</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              PricePilot is a universal shopping intelligence platform that helps shoppers discover products, compare prices across major retailers, evaluate quality benchmarks, and determine true value-for-money.
            </p>
            <div className="text-xs font-semibold text-emerald-400">
              Shop Smart. Choose Better.
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Core Platform</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/budget-finder" className="hover:text-emerald-400 transition-colors">
                  Budget-Based Product Finder
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-emerald-400 transition-colors">
                  Side-by-Side Comparison Workspace
                </Link>
              </li>
              <li>
                <Link to="/deals" className="hover:text-emerald-400 transition-colors">
                  Price History & Deal Insights
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-emerald-400 transition-colors">
                  All 12 Product Categories
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-emerald-400 transition-colors">
                  Universal Product Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Principles & Methodology */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Integrity & Method</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/methodology" className="hover:text-emerald-400 transition-colors">
                  VFM Scoring Methodology
                </Link>
              </li>
              <li>
                <Link to="/methodology#quality" className="hover:text-emerald-400 transition-colors">
                  Quality vs Affordability Weights
                </Link>
              </li>
              <li>
                <Link to="/methodology#matching" className="hover:text-emerald-400 transition-colors">
                  Variant Matching & Duplicate Rules
                </Link>
              </li>
              <li>
                <Link to="/methodology#sourcing" className="hover:text-emerald-400 transition-colors">
                  Ethical Data Sourcing Standards
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-emerald-400 transition-colors">
                  Administrator Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Data Trust Callout */}
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Trust & Accuracy Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              PricePilot operates with zero hidden affiliations. Recommendations are calculated strictly by algorithm weights. All demonstration prices and cached observations are transparently flagged.
            </p>
            <div className="pt-2 border-t border-slate-700 text-[10px] text-slate-500">
              Default currency: INR (₹) • Updated 2026
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} PricePilot Intelligence Platform. Built for authentic decision support.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/methodology" className="hover:text-slate-300">Methodology</Link>
            <span>•</span>
            <span className="text-slate-400">INR Pricing</span>
            <span>•</span>
            <span className="text-emerald-400">Production Ready Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
