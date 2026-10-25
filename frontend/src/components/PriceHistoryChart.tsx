import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { TrendingDown, TrendingUp, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { PriceHistory } from '../types';

interface PriceHistoryChartProps {
  history: PriceHistory;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ history }) => {
  if (!history.has_sufficient_history || history.observations.length < 3) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
          <Info className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-800 text-base mb-1">Price history is not yet available</h4>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          PricePilot requires at least 3 genuine historical observations across retailers before displaying trends.
          Current listed price is ₹{history.current_price?.toLocaleString('en-IN')}.
        </p>
      </div>
    );
  }

  // Deal badge styles
  let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let badgeIcon = <CheckCircle className="w-4 h-4 text-emerald-600" />;
  let badgeText = 'Excellent Deal — Lowest Recorded Price';

  if (history.deal_rating === 'GOOD_PRICE') {
    badgeBg = 'bg-blue-50 text-blue-800 border-blue-200';
    badgeIcon = <TrendingDown className="w-4 h-4 text-blue-600" />;
    badgeText = 'Good Price — Below Historical Average';
  } else if (history.deal_rating === 'AVERAGE_PRICE' || history.deal_rating === 'FAIR_PRICE') {
    badgeBg = 'bg-slate-100 text-slate-800 border-slate-200';
    badgeIcon = <Info className="w-4 h-4 text-slate-600" />;
    badgeText = 'Fair Price — Near Recorded Average';
  } else if (history.deal_rating === 'ELEVATED_PRICE') {
    badgeBg = 'bg-rose-50 text-rose-800 border-rose-200';
    badgeIcon = <TrendingUp className="w-4 h-4 text-rose-600" />;
    badgeText = 'Elevated Price — Consider Waiting';
  }

  const chartData = history.observations.map(obs => ({
    date: obs.date,
    price: obs.price,
    retailer: obs.retailer
  }));

  const minPrice = history.lowest_recorded_price;
  const maxPrice = history.highest_recorded_price;
  const yDomain = [Math.floor(minPrice * 0.92), Math.ceil(maxPrice * 1.08)];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            Historical Price Tracking
            <span className="text-xs font-normal text-slate-500">
              ({history.observation_count} verified points)
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Recorded price trends across retailers over the observation period
          </p>
        </div>

        {/* Deal badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${badgeBg} shadow-sm self-start sm:self-auto`}>
          {badgeIcon}
          <span>{badgeText}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Current Best</div>
          <div className="text-lg font-extrabold text-slate-900 mt-0.5">
            ₹{history.current_price?.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase">Lowest Recorded</div>
          <div className="text-lg font-extrabold text-emerald-900 mt-0.5">
            ₹{history.lowest_recorded_price?.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Highest Recorded</div>
          <div className="text-lg font-extrabold text-slate-900 mt-0.5">
            ₹{history.highest_recorded_price?.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Recorded Average</div>
          <div className="text-lg font-extrabold text-slate-900 mt-0.5">
            ₹{history.average_recorded_price?.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              domain={yDomain}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl border border-slate-800">
                      <div className="font-bold text-emerald-400 text-sm">
                        ₹{data.price?.toLocaleString('en-IN')}
                      </div>
                      <div className="text-slate-300 mt-0.5">Date: {data.date}</div>
                      <div className="text-slate-400 text-[11px]">Retailer: {data.retailer}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={history.average_recorded_price}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{ value: 'Avg', position: 'insideTopRight', fill: '#94a3b8', fontSize: 10 }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#059669"
              strokeWidth={3}
              dot={{ r: 4, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#059669', stroke: '#d1fae5', strokeWidth: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Explanation Banner */}
      <div className="mt-4 p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800">Price Insight: </strong>
          {history.deal_explanation}
        </div>
      </div>
    </div>
  );
};
