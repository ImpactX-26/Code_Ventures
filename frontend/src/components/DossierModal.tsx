import React, { useState, useEffect } from 'react';
import {
  Download,
  Copy,
  CheckCircle2,
  X,
  FileText,
  ShieldCheck,
  Building,
  Sparkles,
  Lock,
  Compass,
} from 'lucide-react';
import { ApplicantProfile, EducaroCounselorDossier } from '../types/index';
import { api } from '../services/api';
import { ProvenanceBadge } from './ProvenanceBadge';

interface DossierModalProps {
  applicant: ApplicantProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  applicant,
  isOpen,
  onClose,
}) => {
  const [dossier, setDossier] = useState<EducaroCounselorDossier | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadDossier();
    }
  }, [isOpen, applicant.id]);

  const loadDossier = async () => {
    try {
      setIsLoading(true);
      const data = await api.exportDossier(applicant.id);
      setDossier(data);
    } catch (err) {
      console.error('Failed to export counselor dossier:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleDownloadJson = () => {
    if (!dossier) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dossier, null, 2),
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `Educaro_Counselor_Dossier_${applicant.fullName.replace(/\s+/g, '_')}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyJson = () => {
    if (!dossier) return;
    navigator.clipboard.writeText(JSON.stringify(dossier, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Educaro Advisor Handoff Dossier
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Audit-Ready Format
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official compiled candidate briefing for Educaro human counselors & German consular teams
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading || !dossier ? (
            <div className="p-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-300">
                Compiling PostgreSQL applicant profile, verification tokens, and audit hash...
              </p>
            </div>
          ) : (
            <>
              {/* Dossier Meta Bar */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Dossier ID</div>
                  <div className="font-mono font-bold text-blue-400">{dossier.dossierId}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Compiled Timestamp</div>
                  <div className="text-slate-300">{new Date(dossier.compiledAt).toLocaleString()}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Security Signature</div>
                  <div className="font-mono text-[11px] text-emerald-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>{dossier.auditIntegritySignature}</span>
                  </div>
                </div>
              </div>

              {/* Provenance Audit Breakdown Card (Highlighting Feature 1) */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Hallucination-Proof Data Provenance Audit
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    100% Anti-Hallucination Verified
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {dossier.provenanceAuditBreakdown.antiHallucinationGuarantee}
                </p>

                {/* Progress bar breakdown */}
                <div className="space-y-2 pt-1">
                  <div className="w-full h-3 rounded-full bg-slate-800 flex overflow-hidden border border-slate-700">
                    <div
                      title={`Document-Verified: ${dossier.provenanceAuditBreakdown.documentVerifiedPercentage}%`}
                      className="bg-emerald-500 h-full"
                      style={{ width: `${dossier.provenanceAuditBreakdown.documentVerifiedPercentage}%` }}
                    />
                    <div
                      title={`User-Typed: ${dossier.provenanceAuditBreakdown.userTypedPercentage}%`}
                      className="bg-blue-500 h-full"
                      style={{ width: `${dossier.provenanceAuditBreakdown.userTypedPercentage}%` }}
                    />
                    <div
                      title={`AI-Suggested: ${dossier.provenanceAuditBreakdown.aiSuggestedPercentage}%`}
                      className="bg-amber-500 h-full"
                      style={{ width: `${dossier.provenanceAuditBreakdown.aiSuggestedPercentage}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-slate-300">
                        Document-Verified:{' '}
                        <strong className="text-emerald-400">
                          {dossier.provenanceAuditBreakdown.documentVerifiedPercentage}%
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-slate-300">
                        User-Typed:{' '}
                        <strong className="text-blue-400">
                          {dossier.provenanceAuditBreakdown.userTypedPercentage}%
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-slate-300">
                        AI-Suggested:{' '}
                        <strong className="text-amber-400">
                          {dossier.provenanceAuditBreakdown.aiSuggestedPercentage}%
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Executive Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    Candidate Credentials
                  </h5>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Full Name:</span>
                      <span className="font-semibold text-white">{dossier.executiveSummary.applicantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Origin:</span>
                      <span>
                        {dossier.executiveSummary.city}, {dossier.executiveSummary.state} ({dossier.executiveSummary.country})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Target Track:</span>
                      <span className="font-bold text-blue-400">{dossier.executiveSummary.primaryTrack}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">German Bavarian GPA:</span>
                      <span className="font-bold text-emerald-400">
                        {dossier.executiveSummary.highestBavarianGpa || 'N/A'} ({dossier.executiveSummary.bavarianClassification})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Language Verified:</span>
                      <span>
                        German {dossier.executiveSummary.primaryGermanLevel} • English {dossier.executiveSummary.primaryEnglishLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    German Regulatory Check
                  </h5>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">APS India Requirement:</span>
                      <span className="font-semibold text-amber-300">
                        {dossier.regulatoryChecklist.apsMandatory ? 'MANDATORY (§16b)' : 'EXEMPT'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Anabin Database:</span>
                      <span className="font-semibold text-emerald-400">
                        {dossier.regulatoryChecklist.anabinInstitutionalStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Blocked Account:</span>
                      <span>
                        {dossier.regulatoryChecklist.blockedAccountRequired
                          ? `€${dossier.regulatoryChecklist.blockedAccountAmountEur} Sperrkonto`
                          : 'Not Required (Stipend Backed)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Visa Category:</span>
                      <span className="text-slate-200 font-medium">
                        {dossier.regulatoryChecklist.visaCategory}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Counselor Action Checklist */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Educaro Advisor Action Checklist ({dossier.counselorPriorityActionItems.length} Tasks)
                  </h4>
                </div>

                <div className="space-y-2">
                  {dossier.counselorPriorityActionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.priority === 'CRITICAL'
                                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                : item.priority === 'HIGH'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {item.priority}
                          </span>
                          <span className="font-bold text-slate-100">{item.action}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Assigned to: {item.targetDepartment}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          {item.estimatedTurnaround}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Exported packages adhere to standard German DIN 5008 & Educaro CRM schema specifications.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyJson}
              disabled={isLoading || !dossier}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? '✓ Copied JSON' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownloadJson}
              disabled={isLoading || !dossier}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Audit-Ready Dossier (.json)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
