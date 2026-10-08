import React from 'react';
import { ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import { DataProvenance } from '../types/index';

interface ProvenanceBadgeProps {
  provenance?: DataProvenance | string;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  provenance = 'USER_TYPED',
  size = 'sm',
  showLabel = true,
}) => {
  // Normalize legacy names if encountered
  const normalized =
    provenance === 'VERIFIED' || provenance === 'DOCUMENT_VERIFIED'
      ? 'DOCUMENT_VERIFIED'
      : provenance === 'AI_GENERATED' || provenance === 'AI_SUGGESTED'
      ? 'AI_SUGGESTED'
      : 'USER_TYPED';

  const isXs = size === 'xs';
  const isSm = size === 'sm';
  const padClass = isXs ? 'px-1.5 py-0.2 text-[10px]' : isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  const iconSize = isXs ? 'w-2.5 h-2.5' : isSm ? 'w-3 h-3' : 'w-3.5 h-3.5';

  if (normalized === 'DOCUMENT_VERIFIED') {
    return (
      <span
        title="Document-Verified: Extracted via official OCR (Degree, Marksheet, Goethe Scorecard, or APS Token)"
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 shadow-sm shadow-emerald-500/10 ${padClass}`}
      >
        <ShieldCheck className={`${iconSize} text-emerald-400 shrink-0`} />
        {showLabel && <span>Document-Verified</span>}
      </span>
    );
  }

  if (normalized === 'AI_SUGGESTED') {
    return (
      <span
        title="AI-Suggested: Algorithmically inferred, Bavarian formula calculated, or forecasted recommendation"
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/35 shadow-sm shadow-amber-500/10 ${padClass}`}
      >
        <Sparkles className={`${iconSize} text-amber-400 shrink-0`} />
        {showLabel && <span>AI-Suggested</span>}
      </span>
    );
  }

  // Blue for User-Typed
  return (
    <span
      title="User-Typed: Directly stated by applicant during interview or typed in onboarding questionnaire"
      className={`inline-flex items-center gap-1 font-semibold rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/35 shadow-sm shadow-blue-500/10 ${padClass}`}
    >
      <UserCheck className={`${iconSize} text-blue-400 shrink-0`} />
      {showLabel && <span>User-Typed</span>}
    </span>
  );
};
