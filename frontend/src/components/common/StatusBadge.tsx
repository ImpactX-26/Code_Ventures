import React from 'react';
import { QualificationStatus } from '../../types/index.js';
import { CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: QualificationStatus;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', showIcon = true }) => {
  switch (status) {
    case 'READY':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5" />}
          <span>Ready for Next Review</span>
        </span>
      );
    case 'ADDITIONAL_REQUIREMENTS_NEEDED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${className}`}
        >
          {showIcon && <AlertCircle className="w-3.5 h-3.5" />}
          <span>Additional Requirements Needed</span>
        </span>
      );
    case 'NOT_READY':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 ${className}`}
        >
          {showIcon && <XCircle className="w-3.5 h-3.5" />}
          <span>Profile Not Yet Ready</span>
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-300 border border-slate-500/30 ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5" />}
          <span>Assessment Pending</span>
        </span>
      );
  }
};
