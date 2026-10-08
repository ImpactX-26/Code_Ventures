import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { recommendationApi } from '../services/api.js';
import { Recommendation, ServiceCatalogItem } from '../types/index.js';
import { JourneyStepsBar } from '../components/journey/JourneyStepsBar.js';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Calendar,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const RecommendationPage: React.FC = () => {
  const { applicantId } = useAuth();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bookedService, setBookedService] = useState<string | null>(null);

  const loadData = async () => {
    if (!applicantId) return;
    try {
      const [recData, servData] = await Promise.all([
        recommendationApi.getRecommendation(applicantId),
        recommendationApi.getServices(),
      ]);
      setRecommendation(recData);
      setServices(servData || []);
    } catch (err) {
      console.error('Error loading recommendations:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [applicantId]);

  const handleRefresh = async () => {
    if (!applicantId) return;
    setIsRefreshing(true);
    try {
      const recData = await recommendationApi.refresh(applicantId);
      setRecommendation(recData);
    } catch (err) {
      console.error('Error refreshing recommendation:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBookService = (slug: string) => {
    setBookedService(slug);
    setTimeout(() => {
      setBookedService(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <JourneyStepsBar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 uppercase tracking-wider">
                Recommendation Agent
              </span>
              <span className="text-xs text-slate-400">Integrated Routing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Recommended Next Step & Educaro Services
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Based on qualification bottlenecks and live German statutory regulations, the Recommendation Agent routes you to your optimal next milestone action.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Re-Calculate Optimal Step</span>
          </button>
        </div>

        {/* Primary Recommended Step Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900/95 via-sky-950/40 to-slate-900/95 border border-sky-400/40 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Primary Recommended Action ({recommendation?.priority || 'HIGH'} Priority)
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            {recommendation?.recommendedStep || 'Enroll in German Language Mastery (Target B1/B2)'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
            {recommendation?.reason ||
              'Evaluation confirms that language proficiency is your primary pending visa hurdle. Closing this gap unlocks unconditional university admission and vocational training placement.'}
          </p>

          {/* Supporting Requirements & Sources */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-sky-500/20 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Supporting Requirements Addressed:
              </span>
              <ul className="space-y-1 text-slate-300">
                {(recommendation?.supportingRequirements || [
                  'Proof of German Language Proficiency (Minimum B1/B2)',
                  'APS Certificate Verification',
                ]).map((req, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 mt-0.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Regulatory Sources & Standards:
              </span>
              <ul className="space-y-1 text-slate-300">
                {(recommendation?.sources || [
                  'Make it in Germany Statutory Guidelines',
                  'German Federal Foreign Office (§16b AufenthG)',
                ]).map((src, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{src}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Section 18: Educaro Service Catalog */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Educaro Service Catalog</span>
            </h3>
            <span className="text-xs text-slate-400">Institutional Service Ecosystem</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {services.map((svc) => (
              <div
                key={svc.slug}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {svc.category}
                    </span>
                    {svc.duration && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{svc.duration}</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white mb-2">{svc.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">{svc.description}</p>
                </div>

                <div>
                  {bookedService === svc.slug ? (
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Service Request Received!</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBookService(svc.slug)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 hover:text-white"
                    >
                      <span>Request Service Consultation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
