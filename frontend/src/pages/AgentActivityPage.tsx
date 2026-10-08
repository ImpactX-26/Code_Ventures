import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { applicantApi } from '../services/api.js';
import { AgentAction } from '../types/index.js';
import { JourneyStepsBar } from '../components/journey/JourneyStepsBar.js';
import { AgentTimeline } from '../components/journey/AgentTimeline.js';
import { Bot, RefreshCw, Cpu, Layers, Sparkles, ShieldCheck } from 'lucide-react';

export const AgentActivityPage: React.FC = () => {
  const { applicantId } = useAuth();
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchActions = async () => {
    if (!applicantId) return;
    try {
      const data = await applicantApi.getAgentRuns(applicantId);
      setActions(data || []);
    } catch (err) {
      console.error('Error fetching agent runs:', err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [applicantId]);

  const handleSync = async () => {
    setIsSyncing(true);
    await fetchActions();
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <JourneyStepsBar />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 uppercase tracking-wider">
                Multi-Agent Coordination
              </span>
              <span className="text-xs text-slate-400">Judges Showcase</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Journey Intelligence
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Real-time audit log of all 10 specialized agents coordinated by the Applicant Orchestrator.
              Inspect how the AI reasons through requirements, detects inconsistencies, queries German statutes, and maps services.
            </p>
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Poll Agent Pipeline</span>
          </button>
        </div>

        {/* 10 Agents Architecture Matrix */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Applicant Orchestrator — Active Agent Roster</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-slate-200">1. Intake Agent</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-slate-200">2. Profile Agent</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-slate-200">3. Document Agent</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="font-semibold text-slate-200">4. Web Research</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-semibold text-slate-200">5. Verification</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="font-semibold text-slate-200">6. Clarification</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="font-semibold text-slate-200">7. Qualification</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="font-semibold text-slate-200">8. Recommendation</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span className="font-semibold text-slate-200">9. CV Agent</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="font-semibold text-slate-200">10. Video Agent</span>
            </div>
          </div>
        </div>

        {/* Live Timeline Display */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <AgentTimeline actions={actions} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
};
