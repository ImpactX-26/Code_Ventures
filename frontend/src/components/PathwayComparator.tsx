import React, { useState, useEffect } from 'react';
import {
  GitFork,
  ArrowRight,
  Clock,
  Euro,
  Languages,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  ShieldCheck,
  Building,
  GraduationCap,
  Briefcase,
  Layers,
  RotateCcw,
} from 'lucide-react';
import {
  ApplicantProfile,
  GoalTrack,
  PathwayComparisonResult,
  PathwaySimulationBranch,
} from '../types/index';
import { api } from '../services/api';
import { ProvenanceBadge } from './ProvenanceBadge';

interface PathwayComparatorProps {
  applicant: ApplicantProfile;
  onTrackSelected: (track: GoalTrack) => void;
}

export const PathwayComparator: React.FC<PathwayComparatorProps> = ({
  applicant,
  onTrackSelected,
}) => {
  const [comparison, setComparison] = useState<PathwayComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // What-If Sandbox Controls
  const [overrideGermanLevel, setOverrideGermanLevel] = useState<string>('A2');
  const [overrideGpa, setOverrideGpa] = useState<number>(8.4);
  const [overrideExpMonths, setOverrideExpMonths] = useState<number>(14);
  const [overrideAps, setOverrideAps] = useState<boolean>(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState<boolean>(false);

  useEffect(() => {
    // Initial fetch of pathway comparison
    loadComparison();
  }, [applicant.id]);

  const loadComparison = async () => {
    try {
      setIsLoading(true);
      const res = await api.getPathwayComparison(applicant.id);
      setComparison(res);

      // Initialize sandbox controls based on current applicant state
      const german = applicant.languages?.find((l) => l.language?.toLowerCase() === 'german')?.level || 'A2';
      const gpa = applicant.educations?.[0]?.gpaOrPercentage || 8.4;
      const exp = applicant.employments?.[0]?.totalMonths || 14;
      const hasAps = applicant.documents?.some((d) => d.docType === 'APS_CERTIFICATE' && d.verificationState === 'VERIFIED') || false;

      setOverrideGermanLevel(german);
      setOverrideGpa(gpa);
      setOverrideExpMonths(exp);
      setOverrideAps(hasAps);
    } catch (err) {
      console.error('Failed to load pathway comparison:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateWhatIf = async () => {
    try {
      setIsSimulating(true);
      const res = await api.simulateWhatIf(applicant.id, {
        germanLevel: overrideGermanLevel,
        gpaOrPercentage: overrideGpa,
        experienceMonths: overrideExpMonths,
        hasApsCertificate: overrideAps,
      });
      setComparison(res);
    } catch (err) {
      console.error('What-if simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetSandbox = () => {
    loadComparison();
  };

  if (isLoading || !comparison) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
        <Sparkles className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-300">
          Simulating parallel German career pathways (Study vs Ausbildung vs Employment)...
        </p>
      </div>
    );
  }

  const { study, ausbildung, employment } = comparison.pathways;
  const branches: PathwaySimulationBranch[] = [study, ausbildung, employment];

  return (
    <div className="space-y-6 pb-6">
      {/* Top Banner & Strategic Synthesis */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <GitFork className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Multi-Pathway "What-If" Simulation Branching
              </h2>
              <ProvenanceBadge provenance="AI_SUGGESTED" />
            </div>
            <p className="text-xs text-slate-400">
              Side-by-side evaluation of German immigration tracks tailored to Indian credentials
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSandboxOpen((prev) => !prev)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                isSandboxOpen
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSandboxOpen ? 'Hide What-If Sandbox' : 'Open What-If Sandbox'}</span>
            </button>
          </div>
        </div>

        {/* Strategic Counselor Advice Box */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Educaro Strategic Synthesis: </span>
            {comparison.counselorStrategicAdvice}
          </div>
        </div>

        {/* Interactive What-If Sandbox Drawer */}
        {isSandboxOpen && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Interactive What-If Branching Sandbox
                </h4>
              </div>
              <button
                onClick={handleResetSandbox}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {/* German Level Slider/Select */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold block">German CEFR Level</label>
                <select
                  value={overrideGermanLevel}
                  onChange={(e) => setOverrideGermanLevel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value="A1">A1 (Beginner)</option>
                  <option value="A2">A2 (Elementary)</option>
                  <option value="B1">B1 (Ausbildung Threshold)</option>
                  <option value="B2">B2 (Healthcare / Fluency)</option>
                  <option value="C1">C1 (Advanced Academic)</option>
                </select>
                <span className="text-[10px] text-slate-500">Affects Ausbildung & Chancenkarte</span>
              </div>

              {/* Indian GPA */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold block">
                  Indian CGPA: <strong className="text-blue-400">{overrideGpa}</strong>
                </label>
                <input
                  type="range"
                  min="6.0"
                  max="10.0"
                  step="0.1"
                  value={overrideGpa}
                  onChange={(e) => setOverrideGpa(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Calculates German Bavarian Grade</span>
              </div>

              {/* Work Experience */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold block">
                  Work Experience: <strong className="text-emerald-400">{overrideExpMonths} Mo</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="3"
                  value={overrideExpMonths}
                  onChange={(e) => setOverrideExpMonths(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Direct Employment / Chancenkarte</span>
              </div>

              {/* APS Certificate Toggle */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold block">APS India Certificate</label>
                <button
                  type="button"
                  onClick={() => setOverrideAps((prev) => !prev)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    overrideAps
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{overrideAps ? '✓ APS Cleared' : '⏳ APS Pending'}</span>
                </button>
                <span className="text-[10px] text-slate-500">Mandatory for Study track</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleSimulateWhatIf}
                disabled={isSimulating}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Recalculating Branches...' : 'Run Real-Time What-If Simulation'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Matrix (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {branches.map((b) => {
          const isCurrentActive = applicant.goalTrack === b.track;
          const isBestMatch = comparison.bestMatchedTrack === b.track;

          return (
            <div
              key={b.track}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xl ${
                isCurrentActive
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-blue-500/70 ring-1 ring-blue-500/40'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-800 space-y-3 relative">
                {isBestMatch && (
                  <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    ★ Algorithm Pick
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-xl border ${
                      b.track === 'Study'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : b.track === 'Ausbildung'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    }`}
                  >
                    {b.track === 'Study' && <GraduationCap className="w-5 h-5" />}
                    {b.track === 'Ausbildung' && <Building className="w-5 h-5" />}
                    {b.track === 'Employment' && <Briefcase className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {b.badge}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white">{b.title}</h3>
                  </div>
                </div>

                {/* Score & Status Gauge */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Eligibility Match
                    </div>
                    <div
                      className={`text-lg font-black ${
                        b.eligibilityScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {b.eligibilityScore}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Status</div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        b.eligibilityStatus === 'ELIGIBLE'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {b.eligibilityStatus === 'ELIGIBLE' ? '✓ Eligible' : '⚠️ Conditional'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Matrix Feature Rows */}
              <div className="p-5 space-y-4 text-xs flex-1">
                {/* 1. Timeline */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Timeline to Departure</span>
                  </div>
                  <div className="font-bold text-slate-200 pl-5">{b.timelineToDepartureMonths}</div>
                </div>

                {/* 2. Financial Threshold */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <Euro className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Financial Threshold</span>
                  </div>
                  <div className="pl-5 space-y-0.5">
                    <div
                      className={`font-bold ${
                        b.financialThreshold.blockedAccountRequired
                          ? 'text-amber-300'
                          : 'text-emerald-300'
                      }`}
                    >
                      {b.financialThreshold.blockedAccountRequired
                        ? `€${b.financialThreshold.blockedAccountAmountEur} Blocked Account (Sperrkonto)`
                        : `€0 Blocked Account (Paid Stipend ${b.financialThreshold.monthlyStipendAmountEur || 'Available'})`}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {b.financialThreshold.financialSummary}
                    </p>
                  </div>
                </div>

                {/* 3. Language Prerequisite */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <Languages className="w-3.5 h-3.5 text-purple-400" />
                    <span>Language Prerequisite</span>
                  </div>
                  <div className="pl-5 space-y-0.5">
                    <div className="font-bold text-slate-200">
                      {b.languagePrerequisite.minimumRequired}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Applicant: <strong className="text-slate-300">{b.languagePrerequisite.applicantCurrent}</strong>
                    </div>
                    <div
                      className={`text-[10px] font-semibold ${
                        b.languagePrerequisite.isFulfilled ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {b.languagePrerequisite.gapAnalysis}
                    </div>
                  </div>
                </div>

                {/* 4. Legal & APS Check */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>APS India & Regulatory Rules</span>
                  </div>
                  <div className="pl-5 space-y-0.5">
                    <div
                      className={`font-bold ${
                        b.legalAndVisaChecks.apsMandatory ? 'text-amber-300' : 'text-emerald-300'
                      }`}
                    >
                      {b.legalAndVisaChecks.apsMandatory ? 'APS Certificate Mandatory' : 'APS Certificate EXEMPT'}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {b.legalAndVisaChecks.apsStatusNotice}
                    </p>
                  </div>
                </div>

                {/* 5. PR & Career Outlook */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>Permanent Residency Track</span>
                  </div>
                  <div className="pl-5 space-y-0.5">
                    <div className="font-bold text-slate-200">
                      {b.careerAndPrOutlook.prEligibilityTimeline}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold">
                      Salary: {b.careerAndPrOutlook.startingSalaryRange}
                    </div>
                  </div>
                </div>

                {/* Pros and Risks */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Key Advantages:</span>
                    {b.pros.map((pro, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400">Risk Bottleneck:</span>
                    {b.riskBottlenecks.map((rb, rIdx) => (
                      <div key={rIdx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                        <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <span>{rb}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Action Button */}
              <div className="p-4 bg-slate-950/80 border-t border-slate-800">
                <button
                  onClick={() => onTrackSelected(b.track)}
                  disabled={isCurrentActive}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    isCurrentActive
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                  }`}
                >
                  <span>{isCurrentActive ? '✓ Currently Selected Track' : `Switch to ${b.track} Pathway`}</span>
                  {!isCurrentActive && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
