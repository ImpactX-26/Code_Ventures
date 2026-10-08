import React from 'react';
import { ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import { DataProvenance } from '../types/index';

interface ProvenanceBadgeProps {
  provenance?: DataProvenance | string;
  size?: 'sm' | 'md';
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  provenance = 'APPLICANT_PROVIDED',
  size = 'sm',
}) => {
  const isSm = size === 'sm';
  const padClass = isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (provenance === 'VERIFIED') {
    return (
      <span
        title="Document OCR or Official Authority Authenticated"
        className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${padClass}`}
      >
        <ShieldCheck className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>Verified</span>
      </span>
    );
  }

  if (provenance === 'AI_GENERATED') {
    return (
      <span
        title="AI-Inferred Recommendation or Pathway Computation"
        className={`inline-flex items-center gap-1 font-medium rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 ${padClass}`}
      >
        <Sparkles className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>AI-Generated</span>
      </span>
    );
  }

  return (
    <span
      title="Directly Stated by Applicant during Interview"
      className={`inline-flex items-center gap-1 font-medium rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 ${padClass}`}
    >
      <UserCheck className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>Applicant-Provided</span>
    </span>
  );
};
