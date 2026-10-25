import React, { useState, useEffect } from 'react';
import {
  Shield, Upload, CheckCircle, XCircle, AlertTriangle,
  RotateCcw, Database, Store, Tag, FileText, Check, X, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminPage: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ov, m] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminMatches('TENTATIVE')
      ]);
      setOverview(ov);
      setMatches(m);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);
    setUploadError(null);

    try {
      const res = await api.uploadCsv(file);
      setUploadResult(res);
      await loadAdminData();
    } catch (err: any) {
      setUploadError(err.message || 'CSV ingestion failed');
    } finally {
      setUploading(false);
    }
  };

  const handleResolveMatch = async (id: number, status: 'CONFIRMED' | 'REJECTED') => {
    try {
      await api.resolveMatch(id, status);
      setMatches(prev => prev.filter(m => m.id !== id));
      if (overview?.stats) {
        setOverview({
          ...overview,
          stats: {
            ...overview.stats,
            pending_matches: Math.max(0, overview.stats.pending_matches - 1)
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRetailer = async (retailerId: number) => {
    try {
      await api.toggleRetailerStatus(retailerId);
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center border border-purple-200">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Admin Privileges Required</h2>
        <p className="text-xs text-slate-600">
          Please sign in using administrator credentials to view ingestion telemetry and duplicate review workflows.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold mb-1">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>Administrative Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            PricePilot Operations & Ingestion Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data integrity monitoring, cross-retailer synchronization, and product matching review
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* METRIC OVERVIEW STATS */}
      {overview?.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Products</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{overview.stats.total_products}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Listings</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{overview.stats.total_listings}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Retailers</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{overview.stats.total_retailers}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Price Records</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{overview.stats.total_observations}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Users</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{overview.stats.total_users}</div>
          </div>
          <div className="bg-white rounded-2xl border border-purple-200 bg-purple-50/40 p-4">
            <div className="text-[11px] font-bold text-purple-700 uppercase">Pending Matches</div>
            <div className="text-2xl font-black text-purple-900 mt-1">{overview.stats.pending_matches}</div>
          </div>
        </div>
      )}

      {/* CSV DATASET INGESTION TOOL */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">
            Batch Product & Price Dataset Ingestion
          </h2>
        </div>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Upload product datasets (CSV format) to update retailer prices, ingest new products, and automatically evaluate duplicate match candidates.
          Required CSV columns: <code>title, brand, category, price, retailer, url, mrp, model_number</code>.
        </p>

        <div className="pt-2">
          <label className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-all shadow-md">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>{uploading ? 'Processing & Validating CSV...' : 'Select CSV Dataset to Ingest'}</span>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Upload success summary */}
        {uploadResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Ingestion Succeeded: Audit #{uploadResult.id}
            </div>
            <div className="text-slate-700">
              Processed <strong>{uploadResult.records_processed}</strong> records •{' '}
              <strong>{uploadResult.records_valid}</strong> valid •{' '}
              <strong>{uploadResult.records_failed}</strong> failed
            </div>
          </div>
        )}

        {uploadError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
            {uploadError}
          </div>
        )}
      </section>

      {/* TENTATIVE DUPLICATE MATCH CANDIDATES REVIEW */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              Duplicate Product Matching Review ({matches.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated duplicate detector flags ambiguous matches as TENTATIVE rather than falsely merging distinct models or variants.
            </p>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No pending tentative matches requiring administrator resolution.
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">{m.source_title}</div>
                  <div className="text-slate-500">
                    Source: <span className="font-semibold text-slate-700">{m.source_retailer}</span> • Listed: ₹{m.source_price?.toLocaleString('en-IN')} • Match Confidence: <strong>{m.confidence_score}%</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleResolveMatch(m.id, 'CONFIRMED')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Match</span>
                  </button>

                  <button
                    onClick={() => handleResolveMatch(m.id, 'REJECTED')}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject (Separate)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RETAILER CONNECTIVITY & DATA SOURCE STATUS */}
      {overview?.retailers && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Store className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Retailer Connection & Data Source Status
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overview.retailers.map((r: any) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{r.name}</div>
                  <div className="text-slate-500 text-[11px]">
                    {r.listings_count} catalog listings • Rating {r.rating}★
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {r.is_partner ? 'Partner API Connected' : 'Labelled Import Feed'}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleRetailer(r.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                    r.is_active
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {r.is_active ? 'Active' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
