import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { applicantApi } from '../services/api.js';
import { Pathway } from '../types/index.js';
import {
  GraduationCap,
  Wrench,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { JourneyStepsBar } from '../components/journey/JourneyStepsBar.js';

export const GoalSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { applicantId } = useAuth();

  const [pathway, setPathway] = useState<Pathway>('STUDY');
  const [preferredField, setPreferredField] = useState('Computer Science / Data Engineering');
  const [targetIntake, setTargetIntake] = useState('Winter Semester 2025 (October)');
  const [motivation, setMotivation] = useState(
    'I want to study in Germany to access world-class technical education, gain hands-on industrial research experience, and build an international engineering career.',
  );
  const [isLoading, setIsLoading] = useState(false);

  const pathwayOptions = [
    {
      id: 'STUDY' as Pathway,
      title: 'Study in Germany',
      tagline: 'Higher Education / Master / Bachelor',
      icon: GraduationCap,
      description: 'Tuition-free public universities, internationally recognized degrees, post-study work visa.',
      badge: 'Academic Stream',
      fieldsDefault: 'Computer Science / Data Engineering',
    },
    {
      id: 'VOCATIONAL' as Pathway,
      title: 'Vocational Training (Ausbildung)',
      tagline: 'Dual Apprenticeship + Monthly Stipend',
      icon: Wrench,
      description: 'Paid on-the-job training in nursing, tech, or mechatronics with guaranteed German employment.',
      badge: 'Dual Apprenticeship',
      fieldsDefault: 'Nursing Specialist / Mechatronics',
    },
    {
      id: 'EMPLOYMENT' as Pathway,
      title: 'Employment & EU Blue Card',
      tagline: 'Direct Professional Career Entry',
      icon: Briefcase,
      description: 'Skilled immigration for experienced engineers, healthcare workers, and IT professionals.',
      badge: 'Skilled Worker (FEG)',
      fieldsDefault: 'Full Stack Software Engineer',
    },
  ];

  const handleSelectPathway = (p: Pathway, defaultField: string) => {
    setPathway(p);
    setPreferredField(defaultField);
    if (p === 'STUDY') {
      setMotivation(
        'I want to study in Germany to access world-class technical education, gain hands-on industrial research experience, and build an international engineering career.',
      );
    } else if (p === 'VOCATIONAL') {
      setMotivation(
        'I want to complete an Ausbildung in Germany because I value the dual education model combining clinical/workshop practice with vocational schooling.',
      );
    } else {
      setMotivation(
        'I am targeting professional employment under the German Skilled Immigration Act to contribute my engineering expertise and secure an EU Blue Card.',
      );
    }
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantId) {
      navigate('/onboarding');
      return;
    }

    setIsLoading(true);

    try {
      await applicantApi.setGoal(applicantId, {
        pathway,
        preferredField,
        targetIntake,
        motivation,
      });

      navigate('/onboarding');
    } catch (err) {
      console.error('Error saving pathway choice:', err);
      navigate('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <JourneyStepsBar />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 mb-3 inline-block">
            Step 1 of 8 — Germany Objective
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Select Your Germany Pathway
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Choose your primary objective. EduPath AI will tailor web research, document parsing, and qualification rules specifically for your route.
          </p>
        </div>

        <form onSubmit={handleContinue} className="space-y-8">
          {/* Pathway Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pathwayOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = pathway === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectPathway(opt.id, opt.fieldsDefault)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900/90 border-sky-400 shadow-xl shadow-sky-500/10 scale-[1.02]'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 rounded-xl border ${
                          isSelected
                            ? 'bg-sky-500/20 border-sky-400/40 text-sky-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                        {opt.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1">{opt.title}</h3>
                    <p className="text-xs font-semibold text-sky-400 mb-2">{opt.tagline}</p>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">{opt.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className={isSelected ? 'font-bold text-sky-400' : 'text-slate-400'}>
                      {isSelected ? 'Selected Pathway' : 'Click to select'}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        isSelected
                          ? 'bg-sky-400 text-slate-950 font-bold'
                          : 'border border-slate-700 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details Form Box */}
          <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Target Objectives & Timeline</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Field / Industry Specialization
                </label>
                <input
                  type="text"
                  required
                  value={preferredField}
                  onChange={(e) => setPreferredField(e.target.value)}
                  placeholder="e.g. Computer Science, Nursing, Automotive Engineering"
                  className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Intake / Start Date
                </label>
                <div className="relative">
                  <select
                    value={targetIntake}
                    onChange={(e) => setTargetIntake(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500 appearance-none"
                  >
                    <option value="Winter Semester 2025 (October)">Winter Semester 2025 (October)</option>
                    <option value="Summer Semester 2026 (April)">Summer Semester 2026 (April)</option>
                    <option value="Winter Semester 2026 (October)">Winter Semester 2026 (October)</option>
                    <option value="Immediate / Rolling (Within 3-6 Months)">Immediate / Rolling (Within 3-6 Months)</option>
                  </select>
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Initial Statement of Motivation
              </label>
              <textarea
                rows={3}
                required
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Why do you want to pursue this pathway in Germany? Explain your goals..."
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.01] flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Saving Objective...</span>
                ) : (
                  <>
                    <span>Proceed to AI Onboarding (EduGuide AI)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};
