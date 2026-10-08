import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { applicantApi } from '../services/api.js';
import { JourneyStepsBar } from '../components/journey/JourneyStepsBar.js';
import {
  Bot,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Cpu,
  GraduationCap,
} from 'lucide-react';

interface QuestionStep {
  id: string;
  field: string;
  question: string;
  category: string;
  type: 'SELECT' | 'TEXT' | 'TEXTAREA';
  options?: string[];
  placeholder?: string;
}

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { applicantId } = useAuth();

  const [pathway, setPathway] = useState<'STUDY' | 'VOCATIONAL' | 'EMPLOYMENT'>('STUDY');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [applicantName, setApplicantName] = useState('Applicant');

  // Load applicant details
  useEffect(() => {
    if (applicantId) {
      applicantApi.getApplicant(applicantId).then((app) => {
        if (app.targetPathway) setPathway(app.targetPathway);
        if (app.fullName) setApplicantName(app.fullName);
      }).catch(console.error);
    }
  }, [applicantId]);

  // Questions tailored strictly for the chosen pathway
  const studyQuestions: QuestionStep[] = [
    {
      id: 'degree',
      field: 'degree',
      category: 'Academic Background',
      question: 'What is your current highest academic degree in India?',
      type: 'SELECT',
      options: [
        'Bachelor of Technology (B.Tech / B.E.)',
        'Bachelor of Science (B.Sc - 3 Years)',
        'Bachelor of Commerce / Business (B.Com / BBA)',
        'Master of Science (M.Sc) / M.Tech',
        '12th Standard High School Graduate',
      ],
    },
    {
      id: 'fieldOfStudy',
      field: 'fieldOfStudy',
      category: 'Specialization',
      question: 'What is your primary field of study or engineering branch?',
      type: 'TEXT',
      placeholder: 'e.g. Computer Science, Mechanical Engineering, Biotechnology',
    },
    {
      id: 'institution',
      field: 'institution',
      category: 'University Accreditation',
      question: 'Which university or college in India did you attend?',
      type: 'TEXT',
      placeholder: 'e.g. Anna University, Delhi University, VTU, Mumbai University',
    },
    {
      id: 'graduationDate',
      field: 'graduationDate',
      category: 'Completion Year',
      question: 'What is your year of graduation or expected completion?',
      type: 'SELECT',
      options: ['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027'],
    },
    {
      id: 'gradeCgpa',
      field: 'gradeCgpa',
      category: 'Academic Performance',
      question: 'What is your cumulative grade point average (CGPA) or percentage?',
      type: 'TEXT',
      placeholder: 'e.g. 8.4 CGPA or 78%',
    },
    {
      id: 'germanLevel',
      field: 'germanLevel',
      category: 'Language Competence',
      question: 'What is your current German language proficiency level?',
      type: 'SELECT',
      options: [
        'A0 (None / Just beginning)',
        'A1 (Basic phrases / Enrolled in course)',
        'A2 (Elementary)',
        'B1 (Intermediate - Goethe/telc Certified)',
        'B2 (Upper Intermediate)',
        'C1 (Advanced Academic)',
      ],
    },
    {
      id: 'englishProficiency',
      field: 'englishProficiency',
      category: 'English Proficiency',
      question: 'What is your English proficiency certification status?',
      type: 'SELECT',
      options: [
        'IELTS 6.5 or above (Certified)',
        'IELTS 6.0',
        'TOEFL iBT 90+',
        'Medium of Instruction was English (MOI Letter available)',
        'Planning to take exam soon',
      ],
    },
  ];

  const vocationalQuestions: QuestionStep[] = [
    {
      id: 'degree',
      field: 'degree',
      category: 'School Credentials',
      question: 'What is your current highest educational qualification?',
      type: 'SELECT',
      options: [
        '12th Standard Passed (Science/Biology)',
        '12th Standard Passed (Commerce/Arts)',
        '10th Standard Passed + ITI/Diploma',
        'Bachelor Degree Graduate seeking vocational training',
      ],
    },
    {
      id: 'preferredField',
      field: 'preferredField',
      category: 'Target Ausbildung Trade',
      question: 'Which vocational apprenticeship (Ausbildung) are you targeting?',
      type: 'SELECT',
      options: [
        'Nursing Specialist (Pflegefachmann/-frau)',
        'Mechatronics Technician (Mechatroniker)',
        'IT Specialist - Application Development (Fachinformatiker)',
        'Hotel Management Specialist (Hotelfachmann/-frau)',
        'Automotive Mechatronics (Kfz-Mechatroniker)',
      ],
    },
    {
      id: 'germanLevel',
      field: 'germanLevel',
      category: 'German Language (Mandatory)',
      question: 'What is your current German level? (German B1/B2 required for vocational schooling)',
      type: 'SELECT',
      options: [
        'A1 (Currently learning)',
        'A2 (Certified)',
        'B1 (Passed Goethe / telc)',
        'B2 (Intermediate-High)',
        'None / Interested in beginner course',
      ],
    },
    {
      id: 'practicalExperience',
      field: 'practicalExperience',
      category: 'Practical Background',
      question: 'Do you have clinical, workshop, or internship experience?',
      type: 'SELECT',
      options: [
        '1+ Years Clinical / Hands-on Hospital Experience',
        '6 Months Technical Internship',
        'Vocational Workshop Training',
        'No practical experience yet',
      ],
    },
  ];

  const employmentQuestions: QuestionStep[] = [
    {
      id: 'degree',
      field: 'degree',
      category: 'Academic Degree',
      question: 'What is your degree qualification for EU Blue Card recognition?',
      type: 'SELECT',
      options: [
        'Bachelor of Technology / Engineering (B.Tech / B.E.)',
        'Master of Technology / M.Sc Computer Science',
        'Bachelor of Computer Applications / MCA',
        'B.Sc Nursing / Healthcare',
      ],
    },
    {
      id: 'role',
      field: 'role',
      category: 'Current Role',
      question: 'What is your current professional job designation?',
      type: 'TEXT',
      placeholder: 'e.g. Senior Java Backend Developer, Staff Nurse, DevOps Engineer',
    },
    {
      id: 'employer',
      field: 'employer',
      category: 'Current Organization',
      question: 'Which company or hospital do you currently work for?',
      type: 'TEXT',
      placeholder: 'e.g. Infosys, TCS, Apollo Hospitals, Wipro, Bosch India',
    },
    {
      id: 'experienceYears',
      field: 'experienceYears',
      category: 'Total Experience',
      question: 'How many years of relevant professional work experience do you have?',
      type: 'SELECT',
      options: ['1 - 2 years', '3 - 5 years', '5 - 8 years', '8+ years'],
    },
    {
      id: 'skills',
      field: 'skills',
      category: 'Core Competencies',
      question: 'List your top technical skills or clinical competencies:',
      type: 'TEXT',
      placeholder: 'e.g. Java, Spring Boot, Microservices, AWS, Docker, Kubernetes',
    },
    {
      id: 'germanLevel',
      field: 'germanLevel',
      category: 'German Proficiency',
      question: 'What is your German proficiency level?',
      type: 'SELECT',
      options: [
        'A0 (None - targeting English-speaking tech roles)',
        'A1 (Basic conversation)',
        'A2 (Elementary)',
        'B1 (Working conversational)',
        'B2 (Professional fluency - required for healthcare)',
      ],
    },
  ];

  const questions =
    pathway === 'VOCATIONAL'
      ? vocationalQuestions
      : pathway === 'EMPLOYMENT'
      ? employmentQuestions
      : studyQuestions;

  const currentQ = questions[currentStep];

  const handleSelectAnswer = (val: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.field]: val }));
  };

  const handleNext = async () => {
    if (!answers[currentQ.field]) return;

    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Completed all questions -> Save to profile and proceed to Dashboard
      setIsLoading(true);
      try {
        if (applicantId) {
          const profilePayload: any = {
            fullName: applicantName,
            educationRecords: [
              {
                degree: answers.degree || 'Bachelor Degree',
                institution: answers.institution || 'Indian University',
                fieldOfStudy: answers.fieldOfStudy || 'Technical',
                graduationDate: answers.graduationDate || '2024',
                gradeCgpa: answers.gradeCgpa || '8.0 CGPA',
              },
            ],
            applicantLanguages: [
              {
                languageName: 'German',
                proficiency: answers.germanLevel || 'A1',
                hasCertificate: answers.germanLevel?.includes('Certified') || false,
              },
              {
                languageName: 'English',
                proficiency: answers.englishProficiency?.includes('6.5') ? 'C1' : 'Fluent',
                hasCertificate: Boolean(answers.englishProficiency?.includes('Certified')),
              },
            ],
          };

          if (answers.employer || answers.role) {
            profilePayload.employmentRecords = [
              {
                employer: answers.employer || 'Technology Services',
                role: answers.role || 'Engineer',
                responsibilities: 'Core technical and engineering duties',
                isCurrent: true,
              },
            ];
          }

          if (answers.skills) {
            const skillList = answers.skills.split(',').map((s) => ({ skillName: s.trim() }));
            profilePayload.applicantSkills = skillList;
          }

          await applicantApi.updateProfile(applicantId, profilePayload);
        }
        navigate('/dashboard');
      } catch (err) {
        console.error('Error saving onboarding data:', err);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const progressPercent = Math.round(((currentStep + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <JourneyStepsBar />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full flex flex-col justify-center">
        {/* Agent Header */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 backdrop-blur-md mb-8">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">EduGuide AI</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-400 text-slate-950">
                Intake Agent
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Gathering credentials for your <strong>{pathway}</strong> pathway. Question {currentStep + 1} of{' '}
              {questions.length}.
            </p>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-4 border-b border-slate-800">
            <span className="font-semibold text-sky-400 uppercase tracking-wider text-[11px]">
              {currentQ.category}
            </span>
            <span>{progressPercent}% Complete</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            {currentQ.question}
          </h2>

          {/* Options Renderer */}
          <div className="space-y-3 pt-2">
            {currentQ.type === 'SELECT' && currentQ.options ? (
              currentQ.options.map((opt, i) => {
                const isSelected = answers[currentQ.field] === opt;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectAnswer(opt)}
                    className={`w-full p-4 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-400 text-sky-300 font-semibold shadow-md shadow-sky-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <span>{opt}</span>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-sky-400 text-slate-950' : 'border border-slate-700 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })
            ) : currentQ.type === 'TEXTAREA' ? (
              <textarea
                rows={4}
                value={answers[currentQ.field] || ''}
                onChange={(e) => handleSelectAnswer(e.target.value)}
                placeholder={currentQ.placeholder}
                className="w-full p-4 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            ) : (
              <input
                type="text"
                value={answers[currentQ.field] || ''}
                onChange={(e) => handleSelectAnswer(e.target.value)}
                placeholder={currentQ.placeholder}
                className="w-full p-4 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              />
            )}
          </div>

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!answers[currentQ.field] || isLoading}
              className="px-6 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-2 disabled:opacity-40"
            >
              {isLoading ? (
                <span>Synthesizing Profile...</span>
              ) : currentStep === questions.length - 1 ? (
                <>
                  <span>Complete Onboarding & View Dashboard</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
