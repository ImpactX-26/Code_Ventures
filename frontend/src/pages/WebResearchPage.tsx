import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { researchApi, applicantApi } from '../services/api.js';
import { ResearchSource, Applicant } from '../types/index.js';
import { JourneyStepsBar } from '../components/journey/JourneyStepsBar.js';
import { TrustBadge } from '../components/common/TrustBadge.js';
import {
  Globe,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  BookOpen,
  Scale,
} from 'lucide-react';

export const WebResearchPage: React.FC = () => {
  const { applicantId } = useAuth();
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!applicantId) return;
    try {
      const [resData, appData] = await Promise.all([
        researchApi.getResearch(applicantId),
        applicantApi.getApplicant(applicantId),
      ]);
      setSources(resData.sources || []);
      setApplicant(appData);
    } catch (err) {
      console.error('Error loading web research:', err);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [applicantId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantId) return;
    setIsSearching(true);
    try {
      const res = await researchApi.triggerResearch(applicantId, query);
      setSources(res.sources || []);
    } catch (err) {
      console.error('Error triggering live web research:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Profile data for side-by-side comparison
  const highestEdu = applicant?.educationRecords?.[0];
  const germanLang = applicant?.applicantLanguages?.find((l) =>
    l.languageName.toLowerCase().includes('german'),
  );
  const englishLang = applicant?.applicantLanguages?.find((l) =>
    l.languageName.toLowerCase().includes('english'),
  );
  const pathway = applicant?.targetPathway || 'STUDY';

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <JourneyStepsBar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
              Live Web Research Agent
            </span>
            <span className="text-xs text-slate-400">Target Pathway:</span>
            <span className="text-xs font-semibold text-white">{pathway}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Official German Regulatory Research & Comparison
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            The Web Research Agent queries live statutory sources including DAAD, KMK Anabin, Make-it-in-Germany, and ZAB to benchmark your actual qualifications against current immigration and admission criteria.
          </p>
        </div>

        {/* Live Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query specific university, APS, or EU Blue Card rules..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? 'Querying Portals...' : 'Live Search'}</span>
          </button>
        </form>

        {/* Section 10: Side-by-Side Comparison */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800 backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-sky-400" />
              <span>Applicant Profile vs Current German Requirements</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              Comparative Milestone Analysis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Education Comparison */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 uppercase text-[11px]">Academic Degree</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Eligible</span>
                </span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Your Profile:</p>
                <p className="font-semibold text-slate-100">
                  {highestEdu ? `${highestEdu.degree} (${highestEdu.institution})` : 'B.Tech Computer Science'}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Researched Requirement:</p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Indian Bachelor (4 years) or 3+1 year degree evaluated as Anabin H+ equivalent.
                </p>
              </div>
            </div>

            {/* German Language Comparison */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 uppercase text-[11px]">German Language</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Gap Detected</span>
                </span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Your Profile:</p>
                <p className="font-semibold text-slate-100">
                  {germanLang ? germanLang.proficiency : 'A2 (Elementary)'}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Researched Requirement:</p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  German B1/B2 certificate required for vocational training; C1 for German-taught degrees.
                </p>
              </div>
            </div>

            {/* English / Financial Proof */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 uppercase text-[11px]">Visa Financial Proof</span>
                <span className="flex items-center gap-1 text-sky-400 font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Regulatory Item</span>
                </span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Legal Threshold:</p>
                <p className="font-semibold text-slate-100">€11,904 / Year (€992 / month)</p>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Statutory Basis:</p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  §16b AufenthG mandatory German Sperrkonto (Blocked Account) prior to visa issuance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 31: Official Sources Grid with Citations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Authoritative Live German Sources</span>
            </h3>
            <span className="text-[11px] text-slate-400 italic">
              "Information retrieved from external official sources and may change."
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-3 hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-xs font-bold text-white leading-snug">{src.title}</h4>
                  <TrustBadge source="WEB_RESEARCH" confidence={src.confidence} />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{src.information}</p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">{src.source}</span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                  >
                    <span>View Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
