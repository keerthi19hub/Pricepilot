import React from 'react';
import { ShieldCheck, Award, TrendingDown, Scale, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Transparent Science of Shopping</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          PricePilot Scoring Methodology & Data Integrity
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          PricePilot was built on a simple premise: <em>The cheapest product is rarely the smartest purchase.</em>
          Here is how our algorithms evaluate value-for-money, match cross-retailer variants, and protect data accuracy.
        </p>
      </div>

      {/* The 3-Pillar Value-for-Money Formula */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-600" />
          1. The Multi-Factor Value Formula
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Every product in PricePilot receives an explainable <strong>Value-for-Money Score (0 to 100)</strong> calculated using a weighted composite of three distinct evidence pillars:
        </p>

        <div className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs sm:text-sm text-center font-bold">
          Value Score = (0.50 × Quality) + (0.30 × Affordability) + (0.20 × Reliability)
        </div>

        <div className="space-y-4 pt-2">
          <div className="border-l-4 border-emerald-600 pl-4 space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">Pillar A: Quality Evidence (50% Default Weight)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Considers objective hardware/formulation specifications (40%), brand reputation (15%), and customer review feedback (45%).
              We apply <strong>Bayesian average smoothing</strong> to customer ratings so a 5-star product with only 3 reviews cannot falsely outrank a 4.6-star product tested by 20,000 verified buyers.
            </p>
          </div>

          <div className="border-l-4 border-blue-600 pl-4 space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">Pillar B: Affordability & Unit Economics (30% Default Weight)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Normalizes price relative to your specific budget limit and category median pricing. For divisible consumables (skincare, packaged foods, bulk groceries), PricePilot computes normalized unit rates (per 100ml, per 100g, or per unit) so package sizing tricks are made transparent.
            </p>
          </div>

          <div className="border-l-4 border-purple-600 pl-4 space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">Pillar C: Reliability & Customer Protection (20% Default Weight)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Weights documented warranty length (up to 35 points), retailer return/replacement windows (up to 25 points), authorized service infrastructure (up to 25 points), and store fulfillment reliability.
            </p>
          </div>
        </div>
      </section>

      {/* The 3 Recommendation Badges */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" />
          2. The Three Recommendation Types
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <div className="font-bold text-emerald-900 text-sm">🌟 Best Overall Value</div>
            <p className="text-slate-600 leading-relaxed">
              The highest-scoring balanced product within budget, delivering optimal utility per rupee spent.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-2">
            <div className="font-bold text-blue-900 text-sm">💰 Best Budget Pick</div>
            <p className="text-slate-600 leading-relaxed">
              The most affordable option that still meets a solid minimum quality threshold (quality &ge; 60/100).
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 space-y-2">
            <div className="font-bold text-purple-900 text-sm">🏆 Best Quality Within Budget</div>
            <p className="text-slate-600 leading-relaxed">
              The highest-tier hardware and build quality available that still remains inside your maximum stated limit.
            </p>
          </div>
        </div>
      </section>

      {/* Duplicate Detection & Matching Rules */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          3. Variant Sensitivity & Duplicate Prevention
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          A common failure mode in shopping comparison engines is falsely comparing a 128GB smartphone listing with a 256GB listing, or comparing a 50ml skincare bottle with a 100ml bottle.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          PricePilot features an intelligent discriminator extraction module. If storage capacity, RAM, volume, apparel size, or AC tonnage differs between listings, the duplicate detector immediately flags them as distinct variants and rejects the match.
        </p>
      </section>

      {/* Ethical Sourcing & Data Integrity */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl border border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-emerald-400" />
          4. Ethical Data Sourcing & Honesty Policy
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            • <strong>No Unauthorized Scraping:</strong> We connect through official affiliate feeds, public product datasets, and authorized partner APIs.
          </p>
          <p>
            • <strong>No Fabricated Live Claims:</strong> When third-party real-time APIs are unavailable during local development, products are transparently marked as <em>Labelled Demo</em>. We never present synthetic numbers as live prices.
          </p>
          <p>
            • <strong>No Fabricated Price History:</strong> If fewer than 3 historical price observations exist for an item, PricePilot explicitly displays <em>"Price history is not yet available"</em> rather than inventing a line chart.
          </p>
        </div>
      </section>
    </div>
  );
};
