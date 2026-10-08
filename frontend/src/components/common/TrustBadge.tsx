import React from 'react';
import { SourceType } from '../../types/index.js';
import { ShieldCheck, FileText, Video, Globe, Sparkles, UserCheck } from 'lucide-react';

interface TrustBadgeProps {
  source: SourceType;
  confidence?: number;
  className?: string;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ source, confidence, className = '' }) => {
  const getBadgeConfig = () => {
    switch (source) {
      case 'VERIFIED':
        return {
          label: 'Official Verified',
          icon: ShieldCheck,
          bgColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        };
      case 'DOCUMENT_EXTRACTED':
        return {
          label: confidence ? `Document Extracted (${Math.round(confidence * 100)}%)` : 'Document Extracted',
          icon: FileText,
          bgColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        };
      case 'VIDEO_EXTRACTED':
        return {
          label: 'Video Extracted',
          icon: Video,
          bgColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        };
      case 'WEB_RESEARCH':
        return {
          label: 'Live Web Source',
          icon: Globe,
          bgColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        };
      case 'AI_GENERATED':
        return {
          label: 'AI Synthesized',
          icon: Sparkles,
          bgColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
      case 'APPLICANT_PROVIDED':
      default:
        return {
          label: 'Applicant Provided',
          icon: UserCheck,
          bgColor: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgColor} ${className}`}
      title={`Data origin: ${source}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};
