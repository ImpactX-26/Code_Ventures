import React from 'react';
import { AgentAction } from '../../types/index.js';
import {
  Cpu,
  Bot,
  FileCheck,
  Search,
  CheckCircle,
  HelpCircle,
  Award,
  Sparkles,
  FileText,
  Video,
  Layers,
} from 'lucide-react';

interface AgentTimelineProps {
  actions: AgentAction[];
  isLoading?: boolean;
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ actions, isLoading = false }) => {
  const getAgentMeta = (agentName: string) => {
    switch (agentName.toUpperCase()) {
      case 'ORCHESTRATOR':
        return { label: 'Applicant Orchestrator', icon: Layers, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
      case 'INTAKE':
        return { label: 'EduGuide Intake Agent', icon: Bot, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
      case 'PROFILE':
        return { label: 'Profile Intelligence Agent', icon: Cpu, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'DOCUMENT':
        return { label: 'Document Intelligence Agent', icon: FileCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'WEB_RESEARCH':
        return { label: 'Live Web Research Agent', icon: Search, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
      case 'VERIFICATION':
        return { label: 'Verification & Conflict Agent', icon: CheckCircle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'CLARIFICATION':
        return { label: 'Clarification Agent', icon: HelpCircle, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
      case 'QUALIFICATION':
        return { label: 'German Qualification Agent', icon: Award, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
      case 'RECOMMENDATION':
        return { label: 'Recommendation Agent', icon: Sparkles, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
      case 'CV':
        return { label: 'German CV Agent', icon: FileText, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' };
      case 'VIDEO':
        return { label: 'Video Insight Agent', icon: Video, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      default:
        return { label: agentName, icon: Bot, color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-slate-400">
        <Bot className="w-5 h-5 animate-spin mr-2 text-sky-400" />
        Synchronizing AI Journey Intelligence...
      </div>
    );
  }

  if (!actions || actions.length === 0) {
    return (
      <div className="text-center p-6 text-sm text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
        No agent actions recorded yet. Interact with your profile or upload a document to trigger the multi-agent pipeline.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-sky-500 before:via-indigo-500 before:to-slate-800">
      {actions.map((act) => {
        const meta = getAgentMeta(act.agentName);
        const Icon = meta.icon;
        const confidencePct = Math.round(act.confidence * 100);

        return (
          <div key={act.id} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-slate-950 border-2 border-sky-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 group-hover:scale-125 transition-transform" />
            </div>

            {/* Card Content */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 backdrop-blur-md transition-all shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${meta.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {meta.label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Confidence:</span>
                  <span className={`font-semibold ${confidencePct >= 95 ? 'text-emerald-400' : 'text-sky-400'}`}>
                    {confidencePct}%
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-slate-100 mb-1">{act.action}</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-2.5">{act.reason}</p>

              {act.result && (
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-36">
                  <pre className="whitespace-pre-wrap">{typeof act.result === 'string' ? act.result : JSON.stringify(act.result, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
