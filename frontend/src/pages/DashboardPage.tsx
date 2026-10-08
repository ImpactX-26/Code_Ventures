import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { applicantApi, clarificationApi, documentApi } from '../services/api.js';
import { Applicant, ClarificationTask, DocumentConflict } from '../types/index.js';
import { JourneyStepsBar } from '../components/journey/JourneyStepsBar.js';
import { ProgressBar } from '../components/common/ProgressBar.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import {
  Compass,
  FileText,
  Globe,
  Award,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Video,
  Bot,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, applicantId } = useAuth();

  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [clarifications, setClarifications] = useState<ClarificationTask[]>([]);
  const [conflicts, setConflicts] = useState<DocumentConflict[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = async () => {
    if (!applicantId) {
      setIsLoading(false);
      return;
    }

    try {
      const [appData, questionsData, docsData] = await Promise.all([
        applicantApi.getApplicant(applicantId),
        clarificationApi.getQuestions(applicantId),
        documentApi.getDocuments(applicantId),
      ]);

      setApplicant(appData);
      setClarifications(questionsData);
      setConflicts(docsData.conflicts || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [applicantId]);

  const handleRefreshJourney = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
  };

  const completeness = applicant?.profileCompleteness || 65;
  const qualStatus = applicant?.qualificationStatus || 'ADDITIONAL_REQUIREMENTS_NEEDED';
  const latestAssessment = applicant?.qualificationAssessments?.[0];
  const latestRecommendation = applicant?.recommendations?.[0];
  const missingReqs = latestAssessment?.missingRequirements || [
    'Proof of German Language Proficiency (Minimum B1/B2)',
    'Official University Degree Transcript (APS Verification)',
  ];

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <JourneyStepsBar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Top Welcome Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#111e38]/80 to-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 uppercase tracking-wider">
                Active Germany Journey
              </span>
              <span className="text-xs text-slate-400">Pathway:</span>
              <span className="text-xs font-semibold text-white">
                {applicant?.targetPathway || 'STUDY IN GERMANY'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.fullName || applicant?.fullName || 'Applicant'}!
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              EduPath AI is coordinating your credentials, live German immigration search, and university eligibility milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshJourney}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
              <span>Sync AI Pipeline</span>
            </button>

            <Link
              to="/agent-activity"
              className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-xs font-semibold text-sky-300 flex items-center gap-1.5 transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span>AI Intelligence (10 Agents)</span>
            </Link>
          </div>
        </div>

        {/* Inconsistency Alert Banner (if conflicts exist) */}
        {conflicts.some((c) => c.status === 'OPEN') && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  Potential Document Inconsistency Detected
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Verification Agent flagged a discrepancy between your profile and uploaded certificates.
                  Please confirm the correct value so immigration reviewers do not reject your file.
                </p>
              </div>
            </div>
            <Link
              to="/documents"
              className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 shrink-0 flex items-center gap-1"
            >
              <span>Resolve Inconsistency</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* 2-Column Overview Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Completeness & Qualification Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Qualification Assessment Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Educaro Preliminary Qualification</h3>
                    <p className="text-[11px] text-slate-400">Rule-based assessment against German standards</p>
                  </div>
                </div>

                <StatusBadge status={qualStatus} />
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {latestAssessment?.summary ||
                    'Your profile establishes a solid academic foundation. However, German language certification and official document verification must be completed prior to formal visa submission.'}
                </p>

                {/* Missing Requirements List */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Missing Requirements to Fulfill:</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {missingReqs.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-amber-400 font-bold mt-0.5">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  to="/qualification"
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <span>Inspect Detailed Rule-by-Rule Breakdown</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Recommended Next Step Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-sky-950/30 border border-sky-500/30 backdrop-blur-xl shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Recommended Next Step (AI Synthesis)
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                {latestRecommendation?.recommendedStep || 'Enroll in German Language Mastery (Target B1/B2)'}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {latestRecommendation?.reason ||
                  'The Recommendation Agent verified that language qualification is your highest priority bottleneck. Completing German B1/B2 ensures seamless university admission and vocational training placement.'}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-sky-500/20">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Mapped Educaro Service:</span>
                  <span className="font-semibold text-sky-300">
                    {latestRecommendation?.suggestedServiceName || 'German Language Preparation'}
                  </span>
                </div>

                <Link
                  to="/recommendation"
                  className="px-4 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-bold shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <span>Explore Recommendation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Profile Completeness & Clarifications */}
          <div className="space-y-6">
            {/* Profile Completeness Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Profile Completeness
                </h3>
                <span className="text-xs font-bold text-sky-400">{completeness}%</span>
              </div>

              <ProgressBar percentage={completeness} showPercentText={false} size="lg" />

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Personal Info</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">100%</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Academic Records</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">100%</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>German Language</span>
                  </span>
                  <span className="text-amber-400 font-semibold">Partial</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Uploaded Documents</span>
                  </span>
                  <span className="text-amber-400 font-semibold">Pending Transcripts</span>
                </div>
              </div>

              <Link
                to="/profile"
                className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors block text-center"
              >
                <span>Edit Structured Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Pending Clarification Questions Card */}
            {clarifications.length > 0 && (
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-sky-400" />
                    <span>Pending Clarifications</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-bold text-[10px]">
                    {clarifications.length} Tasks
                  </span>
                </div>

                <div className="space-y-3">
                  {clarifications.slice(0, 2).map((task) => (
                    <div key={task.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <p className="text-xs font-semibold text-slate-200 leading-tight">
                        {task.question}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {task.reason}
                      </p>
                      <button
                        onClick={() => navigate('/documents')}
                        className="text-[11px] font-semibold text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <span>Answer Questions</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Journey Hub Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
          <Link
            to="/documents"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-900/90 transition-all group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
              Document Intelligence Hub
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload PDF/DOCX degree certificates, view AI OCR confidence, and check consistency.
            </p>
          </Link>

          <Link
            to="/web-research"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-900/90 transition-all group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
              Live Web Research
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compare your profile side-by-side with official German government portals and DAAD standards.
            </p>
          </Link>

          <Link
            to="/video"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-900/90 transition-all group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
              Introduction Video Studio
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Record or upload your 1-minute intro video for automated speech-to-text insight extraction.
            </p>
          </Link>

          <Link
            to="/cv"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-900/90 transition-all group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
              German Lebenslauf CV
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate a DIN 5008 German standard CV using strictly verified credentials and print/export.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
};
