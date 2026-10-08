import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  GraduationCap,
  Wrench,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  Cpu,
  FileCheck,
  ChevronRight,
  Sparkles,
  Award,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPathway, setSelectedPathway] = useState<'STUDY' | 'VOCATIONAL' | 'EMPLOYMENT'>('STUDY');

  const pathways = [
    {
      id: 'STUDY',
      title: 'Study in Germany',
      tagline: 'Tuition-Free & World-Class Degrees',
      badge: 'Academic Pathway',
      icon: GraduationCap,
      description:
        'Access over 400 prestigious German public universities, tuition-free master & bachelor programs, and post-study 18-month job search visas.',
      highlights: [
        'APS certificate assistance & evaluation',
        'Direct admission matching against DAAD & KMK Anabin standards',
        'English-taught & German-taught program search',
        'Blocked Account (€11,904) and visa proof guidance',
      ],
      color: 'from-sky-500/20 to-blue-600/20 border-sky-500/40 text-sky-400',
      accentColor: 'text-sky-400',
    },
    {
      id: 'VOCATIONAL',
      title: 'Vocational Training (Ausbildung)',
      tagline: 'Paid Apprenticeship + Dual Education',
      badge: 'Dual System',
      icon: Wrench,
      description:
        'Earn a monthly stipend (€900 – €1,400) while completing a 3-year dual apprenticeship in nursing, mechatronics, IT, or hospitality with guaranteed job placement.',
      highlights: [
        'ZAB high school certificate equivalence evaluation',
        'Direct matching with certified German training enterprises',
        'Intensive German B1/B2 Goethe preparation',
        'Full support under §16a AufenthG vocational visa law',
      ],
      color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/40 text-emerald-400',
      accentColor: 'text-emerald-400',
    },
    {
      id: 'EMPLOYMENT',
      title: 'Employment & EU Blue Card',
      tagline: 'High-Skilled Professional Careers',
      badge: 'Fast-Track Migration',
      icon: Briefcase,
      description:
        'Leverage the reformed Skilled Immigration Act (FEG) and fast-track EU Blue Card. Open to IT professionals, engineers, and healthcare specialists from India.',
      highlights: [
        'Anerkennung qualification recognition pre-check',
        'Salary threshold validation (€41,041+ for shortage occupations)',
        'German DIN 5008 CV conversion & recruiter optimization',
        'Permanent residency eligibility after just 21-27 months',
      ],
      color: 'from-purple-500/20 to-indigo-600/20 border-purple-500/40 text-purple-400',
      accentColor: 'text-purple-400',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#080d1a] text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-36">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">
              EduPath AI — Agentic Applicant Journey for Germany
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-[1.1]">
            Your journey to Germany{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">
              starts here.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            One integrated, multi-agent AI pipeline guiding Indian applicants through Study, Vocational Training (Ausbildung), and Skilled Employment in Germany.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Start My Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all hover:border-slate-600 flex items-center justify-center"
            >
              Sign In to Journey
            </button>
          </div>

          {/* Trust stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-left">
              <p className="text-2xl font-bold text-white mb-1">10 Agents</p>
              <p className="text-xs text-slate-400">Coordinated AI Orchestrator</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-left">
              <p className="text-2xl font-bold text-sky-400 mb-1">100% Live</p>
              <p className="text-xs text-slate-400">German Government Web Research</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-left">
              <p className="text-2xl font-bold text-emerald-400 mb-1">Zero Mocks</p>
              <p className="text-xs text-slate-400">Real Profile & Document Verification</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-left">
              <p className="text-2xl font-bold text-amber-400 mb-1">DIN 5008</p>
              <p className="text-xs text-slate-400">Verified German CV Generation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pathway Selection Showcase */}
      <section className="py-20 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Choose Your Germany Pathway
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              EduPath AI dynamically adapts requirements, document OCR, live web research, and qualification rules based on your chosen route.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {pathways.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedPathway === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedPathway(item.id as any)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? `bg-slate-900/90 ${item.color} shadow-xl shadow-sky-500/10 scale-[1.02]`
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                        <Icon className={`w-6 h-6 ${item.accentColor}`} />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                    <p className={`text-xs font-semibold mb-3 ${item.accentColor}`}>{item.tagline}</p>
                    <p className="text-xs text-slate-300 leading-relaxed mb-6">{item.description}</p>

                    <div className="space-y-2 mb-6">
                      {item.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${item.accentColor}`} />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/register');
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-sky-400 text-slate-950 hover:bg-sky-300 shadow-md shadow-sky-500/20'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <span>Apply via {item.title}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The 10-Agent Integrated Journey Flow */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 mb-3 inline-block">
              Integrated Multi-Agent Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              How EduPath AI Works
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm">
              Not a collection of disjointed AI demos. An autonomous 10-agent pipeline that processes your real credentials and reasons through your migration milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">1. Intake & Profile Agent</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Progressively asks only relevant questions for your pathway and dynamically calculates completeness across 7 key pillars.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">2. Document Intelligence & Conflict Check</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Extracts degree, grades, and experience via OCR with confidence scores, auditing for cross-document inconsistencies (e.g. CV vs Degree graduation year).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">3. Live German Web Research</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Queries live authoritative portals: DAAD, Make it in Germany, KMK Anabin, and ZAB for current legal thresholds and visa regulations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">4. Qualification Engine</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluates your profile against transparent PostgreSQL rules: Ready, Additional Requirements Needed, or Not Ready, with explainable reasons.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">5. Recommendation Agent</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Determines your optimal next milestone action and automatically routes you to the matching Educaro institutional service.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">6. German CV & Consultant Sync</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Compiles verified credentials into DIN 5008 German Lebenslauf and streams full audit trails to senior Educaro consultants.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-[#0b132b] border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">
            Ready to begin your pathway to Germany?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            Create an account, verify your email, and let EduPath AI evaluate your qualification for Study, Ausbildung, or Employment.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-sm shadow-xl shadow-sky-500/20 transition-all hover:scale-105"
          >
            Create Your Free Account
          </button>
        </div>
      </section>
    </div>
  );
};
