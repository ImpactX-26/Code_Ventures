import React from 'react';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  showPercentText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  label,
  showPercentText = true,
  size = 'md',
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));

  const getHeight = () => {
    switch (size) {
      case 'sm':
        return 'h-1.5';
      case 'lg':
        return 'h-4';
      case 'md':
      default:
        return 'h-2.5';
    }
  };

  const getGradient = () => {
    if (clamped >= 80) return 'from-emerald-500 to-teal-400';
    if (clamped >= 50) return 'from-sky-500 to-blue-500';
    return 'from-amber-500 to-orange-400';
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentText) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-medium text-slate-300">
          {label && <span>{label}</span>}
          {showPercentText && <span className="font-semibold text-sky-400">{clamped}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 ${getHeight()}`}>
        <div
          className={`h-full bg-gradient-to-r ${getGradient()} transition-all duration-700 ease-out rounded-full`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
