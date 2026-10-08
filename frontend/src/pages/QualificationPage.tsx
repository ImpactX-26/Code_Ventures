import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { qualificationApi } from '../services/api.js';
import { QualificationAssessment } from '../types/index.js';
import { JourneyStepsBar } from '../components/journey/JourneyStepsBar.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { ProgressBar } from '../components/common/ProgressBar.js';
import {
  Award,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Scale,
  ExternalLink,
} from 'lucide-react';

export const QualificationPage: React.FC = () => {
  const { applicantId } = useAuth();
  const [assessment, setAssessment] = useState<QualificationAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssessing, setIsAssessing] = useState(false);

  const fetchAssessment = async () => {
    if (!applicantId) return;
    try {
      const data = await qualificationApi.getLatest(applicantId);
      setAssessment(data);
    } catch (err) {
      console.error('Error fetching qualification assessment:', err);
    } finally {
      setIsLoading(false);
      setIsAssessing(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [applicantId]);

  const handleReassess = async () => {
    if (!applicantId) return;
    setIsAssessing(true);
    try {
      const data = await qualificationApi.assess(applicantId);
      setAssessment(data);
    } catch (err) {
      console.error('Error re-assessing qualification:', err);
    } finally {
      setIsAssessing(false);
    }
  };

  const status = assessment?.status || 'ADDITIONAL_REQUIREMENTS_NEEDED';
  const score = assessment?.overallScore || 75;
  const missingReqs = assessment?.missingRequirements || [];
  const rules = assessment?.details || [];

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <JourneyStepsBar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
                Qualification Engine
              </span>
              <span className="text-xs text-slate-400">Standard:</span>
              <span className="text-xs font-semibold text-white">Educaro Preliminary Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              German Migration & Admission Readiness
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Evaluating your profile against statutory German admission guidelines (DAAD, KMK Anabin, BIBB, and the Skilled Immigration Act).
            </p>
          </div>

          <button
            onClick={handleReassess}
            disabled={isAssessing}
            className="px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAssessing ? 'animate-spin' : ''}`} />
            <span>{isAssessing ? 'Re-Evaluating Rules...' : 'Re-Run Qualification Engine'}</span>
          </button>
        </div>

        {/* Big Status Hero Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#111e38]/80 to-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                Preliminary Qualification Result
              </span>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Educaro Preliminary Assessment
                </h2>
                <StatusBadge status={status} />
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-slate-400 block mb-1">Qualification Readiness Index:</span>
              <span className="text-2xl font-black text-sky-400">{score}%</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
            {assessment?.summary ||
              'Your profile meets standard undergraduate accreditation criteria, but requires fulfillment of certified language proficiency and financial proof documentation before formal submission.'}
          </p>

          {/* Missing Requirements List */}
          {missingReqs.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Mandatory Actions to Unlock Unconditional Readiness ({missingReqs.length}):</span>
              </h4>
              <ul className="space-y-1.5">
                {missingReqs.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <Scale className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              <strong>Regulatory Disclaimer:</strong> Educaro Preliminary Qualification is an automated pre-assessment based on current German immigration (§16a, §16b, §18a/b AufenthG) and academic standards. It does not constitute official immigration or university admission approval.
            </span>
          </div>
        </div>

        {/* Rule by Rule Evaluation Cards */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-rose-400" />
            <span>Transparent Rule Evaluations ({rules.length} Rules Applied)</span>
          </h3>

          <div className="space-y-3">
            {rules.map((rule, idx) => {
              const isMet = rule.status === 'MET';
              const isPartial = rule.status === 'PARTIAL';

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-3 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isMet
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isPartial
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        {isMet ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isPartial ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white">{rule.requirement}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Source: {rule.source}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isMet
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isPartial
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{rule.description}</p>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Evaluated Applicant Evidence:</span>
                    </div>
                    <p className="text-slate-200 font-medium">{rule.applicantEvidence}</p>
                    {rule.remedyAction && (
                      <p className="text-amber-400 text-[11px] pt-1">
                        <strong>Action Needed:</strong> {rule.remedyAction}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
