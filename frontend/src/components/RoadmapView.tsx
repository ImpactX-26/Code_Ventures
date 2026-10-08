import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  Euro,
  FileCheck,
} from 'lucide-react';
import { ApplicantProfile, MissingRequirement, EducaroServicePackage } from '../types/index';
import { ProvenanceBadge } from './ProvenanceBadge';

interface RoadmapViewProps {
  applicant: ApplicantProfile;
  onRefreshRecommendation: () => void;
  onOpenOcrModal: () => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  applicant,
  onRefreshRecommendation,
  onOpenOcrModal,
}) => {
  const recommendation = applicant.recommendation;
  const missingReqs = recommendation?.missingRequirements || [];
  const educaroServices = recommendation?.educaroServiceRouting || [];
  const nextSteps = recommendation?.actionableNextSteps || [];

  const isEligible = recommendation?.eligibilityStatus === 'ELIGIBLE';

  const milestones = [
    {
      title: '1. Language Competence',
      desc: applicant.goalTrack === 'Ausbildung' ? 'Target B1/B2 German' : 'IELTS 6.5+ / German A2-B1',
      status: applicant.languages && applicant.languages.length > 0 ? 'COMPLETED' : 'IN_PROGRESS',
      badge: applicant.languages?.[0]?.level || 'A1 Pending',
    },
    {
      title: '2. Academic Credential Check',
      desc: applicant.recommendation?.apsRequired
        ? 'APS India Embassy Verification (Mandatory)'
        : 'KMK Anabin / Anerkennung Equivalence',
      status: applicant.recommendation?.apsRequired ? 'ACTION_REQUIRED' : 'VERIFIED',
      badge: applicant.recommendation?.anabinInstitutionalStatus || 'H+',
    },
    {
      title: '3. University / Employer Contract',
      desc:
        applicant.goalTrack === 'Study'
          ? 'Application to TU9 & Public Universities'
          : applicant.goalTrack === 'Ausbildung'
          ? 'Guaranteed German Hospital/Firm Contract'
          : 'Opportunity Card (Chancenkarte) Dossier',
      status: 'IN_PROGRESS',
      badge: 'Educaro Match',
    },
    {
      title: '4. Visa Financial Proof',
      desc:
        applicant.goalTrack === 'Study'
          ? 'Blocked Account (Sperrkonto €11,908)'
          : 'Monthly Stipend Contract (€1,200+/mo)',
      status: applicant.goalTrack === 'Ausbildung' ? 'WAIVED_BY_STIPEND' : 'REQUIRED',
      badge: applicant.goalTrack === 'Ausbildung' ? 'Stipend Backed' : '€11,908',
    },
    {
      title: '5. German National Visa (Type D)',
      desc: 'Embassy VFS Filing & Relocation Onboarding',
      status: 'UPCOMING',
      badge: 'Final Step',
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Overall Assessment Status Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Evaluation Result
              </span>
              <ProvenanceBadge provenance="AI_GENERATED" />
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xl sm:text-2xl font-black tracking-tight ${
                  isEligible ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isEligible ? 'Directly Eligible' : 'Conditionally Eligible'}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                German {applicant.goalTrack} Track
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Completeness</div>
              <div className="text-sm font-bold text-emerald-400">
                {recommendation?.completenessScore || 0}%
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">APS India Status</div>
              <div className="text-sm font-bold text-amber-300">
                {recommendation?.apsRequired ? 'Mandatory' : 'Exempt'}
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Summary */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
          {recommendation?.pathwaySummary ||
            'Comprehensive evaluation completed based on Indian academic standards and German immigration legal frameworks.'}
        </p>

        {/* Actionable Next Steps List */}
        {nextSteps.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Immediate Action Items:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {nextSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {step.step}
                  </span>
                  <span className="leading-snug">{step.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Migration Milestones Tracker */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">German Migration Pathway Roadmap</h3>
              <p className="text-[11px] text-slate-400">Chronological Milestones from India to Germany</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
          {milestones.map((m, mIdx) => (
            <div
              key={mIdx}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Step {mIdx + 1}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  {m.badge}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-100">{m.title}</h4>
              <p className="text-[11px] text-slate-400 leading-tight">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Missing Requirements Checklist */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Missing Requirements Checklist</h3>
              <p className="text-[11px] text-slate-400">Prerequisites & Legal Compliance Items</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {missingReqs.length} Pending
          </span>
        </div>

        {missingReqs.length === 0 ? (
          <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-emerald-300 font-semibold">
              All critical requirements fulfilled! Your dossier is ready for submission.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {missingReqs.map((req: MissingRequirement) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        req.severity === 'CRITICAL'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {req.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-100">{req.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl">{req.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={onOpenOcrModal}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition flex items-center gap-1"
                  >
                    <span>Upload Proof / Clear</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Educaro Service Routing */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Recommended Educaro Service Routing</h3>
              <p className="text-[11px] text-slate-400">Tailored Program Packages & Guarantees</p>
            </div>
          </div>
          <ProvenanceBadge provenance="AI_GENERATED" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {educaroServices.map((pkg: EducaroServicePackage) => (
            <div
              key={pkg.packageId}
              className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 hover:border-blue-500/50 space-y-4 transition shadow-lg relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                    {pkg.tier}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100 mt-0.5">{pkg.serviceName}</h4>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-emerald-400">
                    {pkg.matchScore}% Match
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Algorithm Score</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-900/30 text-xs text-blue-200">
                💡 <strong>Highlight:</strong> {pkg.highlight}
              </div>

              <div className="space-y-2">
                <div className="text-[11px] uppercase font-semibold text-slate-400">
                  Included Features:
                </div>
                {pkg.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <button className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 transition">
                <span>Select & Enroll with Educaro</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
