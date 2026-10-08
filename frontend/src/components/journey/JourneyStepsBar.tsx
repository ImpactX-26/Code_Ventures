import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  User,
  FileText,
  Globe,
  ShieldAlert,
  Award,
  ListOrdered,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export interface StepItem {
  id: string;
  name: string;
  path: string;
  icon: any;
}

const JOURNEY_STEPS: StepItem[] = [
  { id: 'goal', name: 'Goal', path: '/goal', icon: Compass },
  { id: 'profile', name: 'Profile', path: '/profile', icon: User },
  { id: 'documents', name: 'Documents', path: '/documents', icon: FileText },
  { id: 'web-research', name: 'Web Research', path: '/web-research', icon: Globe },
  { id: 'verification', name: 'Verification', path: '/documents', icon: ShieldAlert },
  { id: 'qualification', name: 'Qualification', path: '/qualification', icon: Award },
  { id: 'recommendation', name: 'Recommendation', path: '/recommendation', icon: Sparkles },
  { id: 'cv', name: 'German CV', path: '/cv', icon: ListOrdered },
];

export const JourneyStepsBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveIndex = () => {
    const current = location.pathname;
    const idx = JOURNEY_STEPS.findIndex((s) => s.path === current);
    return idx >= 0 ? idx : 0;
  };

  const activeIndex = getActiveIndex();

  return (
    <div className="w-full bg-slate-900/60 border-y border-slate-800/80 px-4 py-3 backdrop-blur-md">
      <div className="max-w-7xl mx-auto overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between min-w-[780px] gap-2">
          {JOURNEY_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => navigate(step.path)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm shadow-sky-500/20 font-semibold'
                      : isCompleted
                      ? 'text-emerald-400 hover:bg-slate-800/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isCurrent
                        ? 'bg-sky-500 text-slate-950'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="whitespace-nowrap">{step.name}</span>
                </button>

                {idx < JOURNEY_STEPS.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0 mx-0.5" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
