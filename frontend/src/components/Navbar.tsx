import React from 'react';
import {
  Compass,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  Download,
  GitFork,
} from 'lucide-react';
import { ApplicantProfile, GoalTrack } from '../types/index';

interface NavbarProps {
  applicants: ApplicantProfile[];
  currentApplicant: ApplicantProfile | null;
  onSelectApplicant: (id: string) => void;
  onTrackChange: (track: GoalTrack) => void;
  onResetDemo: () => void;
  isResetting: boolean;
  onOpenDossierModal: () => void;
  onOpenPathwayComparator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  applicants,
  currentApplicant,
  onSelectApplicant,
  onTrackChange,
  onResetDemo,
  isResetting,
  onOpenDossierModal,
  onOpenPathwayComparator,
}) => {
  const completeness = currentApplicant?.recommendation?.completenessScore || 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                AeroPath<span className="text-blue-400 font-bold">.AI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Educaro Hackathon
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>🇮🇳 India</span>
              <span className="text-slate-600">➔</span>
              <span>🇩🇪 Germany Corridor</span>
            </div>
          </div>
        </div>

        {/* Track Switcher */}
        {currentApplicant && (
          <div className="hidden lg:flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            {(['Study', 'Ausbildung', 'Employment'] as GoalTrack[]).map((track) => {
              const active = currentApplicant.goalTrack === track;
              return (
                <button
                  key={track}
                  onClick={() => onTrackChange(track)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {track === 'Study' && '🎓 Higher Study (M.Sc)'}
                  {track === 'Ausbildung' && '🩺 Dual Ausbildung'}
                  {track === 'Employment' && '💼 Chancenkarte & Work'}
                </button>
              );
            })}
          </div>
        )}

        {/* Right Tools: Export Dossier, What-If, Profile Switcher & Meter */}
        <div className="flex items-center gap-2.5">
          {/* What-If Branches Quick Button */}
          <button
            onClick={onOpenPathwayComparator}
            title="Multi-Pathway What-If Simulation"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition"
          >
            <GitFork className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">What-If Branches</span>
          </button>

          {/* Export Dossier for Educaro Button */}
          <button
            onClick={onOpenDossierModal}
            title="Export One-Click Counselor Handoff Package"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Dossier</span>
          </button>

          {/* Completeness meter */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">
                Readiness
              </div>
              <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {completeness}%
              </div>
            </div>
            <div className="w-10 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          {/* Persona selector dropdown */}
          <div className="relative">
            <select
              value={currentApplicant?.id || ''}
              onChange={(e) => onSelectApplicant(e.target.value)}
              className="appearance-none bg-slate-900 hover:bg-slate-850 text-slate-200 text-xs font-medium pl-3 pr-8 py-2 rounded-lg border border-slate-800 hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {applicants.map((a) => (
                <option key={a.id} value={a.id}>
                  👤 {a.fullName} ({a.goalTrack})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reset profile data to seed defaults"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
