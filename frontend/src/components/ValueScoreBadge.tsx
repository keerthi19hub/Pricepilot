import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

interface ValueScoreBadgeProps {
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ValueScoreBadge: React.FC<ValueScoreBadgeProps> = ({
  score = 75,
  size = 'md',
  showLabel = true
}) => {
  const rounded = Math.round(score);

  // Determine color scheme
  let bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let badgeColor = 'bg-emerald-600 text-white';
  let label = 'Excellent Value';

  if (rounded < 70) {
    bg = 'bg-amber-50 text-amber-800 border-amber-200';
    badgeColor = 'bg-amber-600 text-white';
    label = 'Moderate Value';
  } else if (rounded < 82) {
    bg = 'bg-blue-50 text-blue-800 border-blue-200';
    badgeColor = 'bg-blue-600 text-white';
    label = 'Solid Value';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs sm:text-sm px-2.5 py-1',
    lg: 'text-sm sm:text-base px-3 py-1.5'
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${bg} ${sizeClasses[size]} shadow-sm`}
      title={`PricePilot Value Score: ${rounded}/100 based on Quality (50%), Affordability (30%), Reliability (20%)`}
    >
      <span className={`inline-flex items-center justify-center font-bold px-1.5 py-0.2 rounded-full text-[11px] ${badgeColor}`}>
        {rounded}
      </span>
      {showLabel && (
        <span className="font-semibold tracking-tight flex items-center gap-1">
          <Sparkles className="w-3 h-3 inline text-emerald-600" />
          {label}
        </span>
      )}
    </div>
  );
};
