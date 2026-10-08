import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { consultantApi } from '../services/api.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { TrustBadge } from '../components/common/TrustBadge.js';
import { ProgressBar } from '../components/common/ProgressBar.js';
import {
  Shield,
  User,
  GraduationCap,
  FileText,
  AlertTriangle,
  Award,
  Globe,
  Sparkles,
  Bot,
  ArrowLeft,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const ApplicantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [applicant, setApplicant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DOCUMENTS' | 'CONFLICTS' | 'QUALIFICATION' | 'RESEARCH' | 'AUDIT'>('OVERVIEW');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      consultantApi.getApplicantDetail(id).then(setApplicant).catch(console.error).finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex items-center justify-center text-slate-300 text-sm">
        <Bot className="w-5 h-5 animate-spin mr-2 text-amber-400" />
        Loading Applicant Dossier...
      </div>
    );
  }

  const app = applicant || {
    id: id || 'app-sample',
    fullName: 'Candidate File',
    targetPathway: 'STUDY',
    profileCompleteness: 80,
    qualificationStatus: 'ADDITIONAL_REQUIREMENTS_NEEDED',
  };

  const educations = app.educationRecords || [];
  const employments = app.employmentRecords || [];
  const documents = app.documents || [];
  const conflicts = app.documentConflicts || [];
  const qualification = app.qualificationAssessments?.[0];
  const recommendation = app.recommendations?.[0];
  const sources = app.researchSources || [];
  const agentActions = app.agentActions || [];

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/consultant"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Consultant Dashboard</span>
          </Link>
          <span className="text-xs font-mono text-slate-400">Dossier ID: {app.id}</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Candidate Dossier Hero */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-[#161a29] to-slate-900 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 uppercase tracking-wider">
                  Pathway: {app.targetPathway}
                </span>
                <span className="text-xs text-slate-400">• Email: {app.user?.email || app.email}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{app.fullName}</h1>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={app.qualificationStatus || 'ADDITIONAL_REQUIREMENTS_NEEDED'} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Profile Completeness</span>
              <span className="font-bold text-white text-base">{app.profileCompleteness}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Documents on File</span>
              <span className="font-bold text-white text-base">{documents.length} Records</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Discrepancy Flags</span>
              <span className={`font-bold text-base ${conflicts.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {conflicts.filter((c: any) => c.status === 'OPEN').length} Open
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Recommended Action</span>
              <span className="font-semibold text-sky-300 truncate block">{recommendation?.recommendedStep || 'Language Prep'}</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'OVERVIEW', label: 'Candidate Dossier', icon: User },
            { id: 'DOCUMENTS', label: `Documents (${documents.length})`, icon: FileText },
            { id: 'CONFLICTS', label: `Inconsistencies (${conflicts.length})`, icon: AlertTriangle },
            { id: 'QUALIFICATION', label: 'Qualification Engine Audit', icon: Award },
            { id: 'RESEARCH', label: 'Researched Portals', icon: Globe },
            { id: 'AUDIT', label: 'Agent Activity Trail', icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-sky-400" />
                <span>Academic Record</span>
              </h3>
              {educations.length > 0 ? (
                educations.map((edu: any, i: number) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                    <p className="font-bold text-white">{edu.degree}</p>
                    <p className="text-slate-400">{edu.institution} ({edu.graduationDate})</p>
                    <p className="text-[11px] text-sky-400 font-semibold">Grade/CGPA: {edu.gradeCgpa}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No education records.</p>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Active Recommendation</span>
              </h3>
              <p className="text-xs font-bold text-sky-300">{recommendation?.recommendedStep}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{recommendation?.reason}</p>
            </div>
          </div>
        )}

        {/* Tab 2: Documents */}
        {activeTab === 'DOCUMENTS' && (
          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900/40 text-xs text-slate-400 text-center">No documents uploaded.</div>
            ) : (
              documents.map((doc: any) => (
                <div key={doc.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{doc.originalName}</span>
                    <span className="text-[10px] uppercase font-bold text-sky-400">{doc.documentType}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    {(doc.extractions || []).map((ext: any) => (
                      <div key={ext.id} className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{ext.fieldKey}:</span>
                        <span className="text-slate-200 font-medium">{ext.fieldValue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Conflicts */}
        {activeTab === 'CONFLICTS' && (
          <div className="space-y-4">
            {conflicts.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900/40 text-xs text-emerald-400 text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>No cross-document inconsistencies detected. All credentials verified concordant.</span>
              </div>
            ) : (
              conflicts.map((conf: any) => (
                <div key={conf.id} className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 text-xs space-y-2">
                  <span className="font-bold text-amber-400 uppercase">Inconsistency on: {conf.fieldName}</span>
                  <p className="text-slate-300">Source A ({conf.sourceA}): {conf.valueA}</p>
                  <p className="text-slate-300">Source B ({conf.sourceB}): {conf.valueB}</p>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Status: {conf.status}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Qualification */}
        {activeTab === 'QUALIFICATION' && (
          <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase">Qualification Rule Assessment</h3>
            <p className="text-xs text-slate-300">{qualification?.summary}</p>
          </div>
        )}

        {/* Tab 5: Research */}
        {activeTab === 'RESEARCH' && (
          <div className="space-y-3">
            {sources.map((src: any) => (
              <div key={src.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <h4 className="font-bold text-white">{src.title}</h4>
                <p className="text-slate-300">{src.information}</p>
                <a href={src.url} target="_blank" rel="noreferrer" className="text-sky-400 text-[11px] hover:underline block pt-1">
                  {src.source} →
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Tab 6: Audit */}
        {activeTab === 'AUDIT' && (
          <div className="space-y-3">
            {agentActions.map((act: any) => (
              <div key={act.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span className="font-bold text-sky-400">{act.agentName}</span>
                  <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="font-semibold text-white">{act.action}</p>
                <p className="text-slate-300">{act.reason}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
