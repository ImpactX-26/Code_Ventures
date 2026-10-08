import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { applicantApi } from '../services/api.js';
import { Applicant } from '../types/index.js';
import { JourneyStepsBar } from '../components/journey/JourneyStepsBar.js';
import { TrustBadge } from '../components/common/TrustBadge.js';
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  Languages,
  Target,
  Plus,
  Save,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { applicantId, user } = useAuth();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'EDUCATION' | 'EMPLOYMENT' | 'SKILLS' | 'LANGUAGES' | 'MOTIVATION'>('PERSONAL');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [location, setLocation] = useState('Bengaluru, Karnataka, India');

  const [educationRecords, setEducationRecords] = useState<any[]>([]);
  const [employmentRecords, setEmploymentRecords] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [applicantLanguages, setApplicantLanguages] = useState<any[]>([]);
  const [motivation, setMotivation] = useState('');

  useEffect(() => {
    if (applicantId) {
      applicantApi.getApplicant(applicantId).then((app) => {
        setApplicant(app);
        setFullName(app.fullName || user?.fullName || '');
        setPhone(app.phone || '+91 98765 43210');
        setLocation(app.location || 'Bengaluru, India');
        setEducationRecords(app.educationRecords || [
          {
            institution: 'Anna University, Chennai',
            degree: 'Bachelor of Technology (B.Tech)',
            fieldOfStudy: 'Computer Science & Engineering',
            graduationDate: '2024',
            gradeCgpa: '8.4 CGPA',
            source: 'APPLICANT_PROVIDED',
            confidence: 1.0,
          },
        ]);
        setEmploymentRecords(app.employmentRecords || [
          {
            employer: 'Tech Innovations India',
            role: 'Software Engineer',
            responsibilities: 'Developed full stack microservices using Java, Spring Boot, React, and PostgreSQL.',
            startDate: '2024-06',
            isCurrent: true,
            source: 'APPLICANT_PROVIDED',
            confidence: 1.0,
          },
        ]);
        setSkills(app.applicantSkills || [
          { skillName: 'TypeScript', source: 'APPLICANT_PROVIDED' },
          { skillName: 'React', source: 'APPLICANT_PROVIDED' },
          { skillName: 'Java', source: 'APPLICANT_PROVIDED' },
          { skillName: 'PostgreSQL', source: 'APPLICANT_PROVIDED' },
          { skillName: 'Docker', source: 'APPLICANT_PROVIDED' },
        ]);
        setApplicantLanguages(app.applicantLanguages || [
          { languageName: 'English', proficiency: 'C1 / Fluent', hasCertificate: true, source: 'APPLICANT_PROVIDED' },
          { languageName: 'German', proficiency: 'A2 (Elementary)', hasCertificate: false, source: 'APPLICANT_PROVIDED' },
        ]);
        setMotivation(
          app.goals?.[0]?.motivation ||
            'I am driven to pursue my engineering career in Germany because of its world-leading high-tech industrial ecosystem, exceptional research institutions, and structured skilled immigration pathways.',
        );
      }).catch(console.error).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [applicantId]);

  const handleSave = async () => {
    if (!applicantId) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await applicantApi.updateProfile(applicantId, {
        fullName,
        phone,
        location,
        educationRecords,
        employmentRecords,
        applicantSkills: skills,
        applicantLanguages,
        motivation,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const addEducation = () => {
    setEducationRecords([
      ...educationRecords,
      {
        institution: '',
        degree: 'Bachelor Degree',
        fieldOfStudy: '',
        graduationDate: '2025',
        gradeCgpa: '',
        source: 'APPLICANT_PROVIDED',
        confidence: 1.0,
      },
    ]);
  };

  const addEmployment = () => {
    setEmploymentRecords([
      ...employmentRecords,
      {
        employer: '',
        role: '',
        responsibilities: '',
        startDate: '',
        isCurrent: true,
        source: 'APPLICANT_PROVIDED',
        confidence: 1.0,
      },
    ]);
  };

  const addSkill = (name: string) => {
    if (!name.trim()) return;
    setSkills([...skills, { skillName: name.trim(), source: 'APPLICANT_PROVIDED', confidence: 1.0 }]);
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <JourneyStepsBar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Structured Applicant Profile
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Every credential displays its exact verified provenance badge to maintain strict audit integrity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Profile Synchronized</span>
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'PERSONAL', label: 'Personal Details', icon: User },
            { id: 'EDUCATION', label: 'Education Records', icon: GraduationCap },
            { id: 'EMPLOYMENT', label: 'Employment History', icon: Briefcase },
            { id: 'SKILLS', label: 'Core Skills', icon: Code },
            { id: 'LANGUAGES', label: 'Language Competence', icon: Languages },
            { id: 'MOTIVATION', label: 'Germany Motivation', icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          {activeTab === 'PERSONAL' && (
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Contact & Identity Information</h3>
                <TrustBadge source="APPLICANT_PROVIDED" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Official Passport Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-400 text-xs cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Phone Number (with Country Code)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Current Location in India
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'EDUCATION' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">University Degrees & Academic Records</h3>
                <button
                  onClick={addEducation}
                  className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Degree Record</span>
                </button>
              </div>

              <div className="space-y-4">
                {educationRecords.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-400">Record #{idx + 1}</span>
                      <TrustBadge source={edu.source || 'APPLICANT_PROVIDED'} confidence={edu.confidence} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">University / Institute</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...educationRecords];
                            updated[idx].institution = e.target.value;
                            setEducationRecords(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Degree Title</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...educationRecords];
                            updated[idx].degree = e.target.value;
                            setEducationRecords(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => {
                            const updated = [...educationRecords];
                            updated[idx].fieldOfStudy = e.target.value;
                            setEducationRecords(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Graduation Year</label>
                        <input
                          type="text"
                          value={edu.graduationDate || ''}
                          onChange={(e) => {
                            const updated = [...educationRecords];
                            updated[idx].graduationDate = e.target.value;
                            setEducationRecords(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Grade / CGPA</label>
                        <input
                          type="text"
                          value={edu.gradeCgpa || ''}
                          onChange={(e) => {
                            const updated = [...educationRecords];
                            updated[idx].gradeCgpa = e.target.value;
                            setEducationRecords(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'EMPLOYMENT' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Work Experience & Practical Internships</h3>
                <button
                  onClick={addEmployment}
                  className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Employment</span>
                </button>
              </div>

              <div className="space-y-4">
                {employmentRecords.map((emp, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-400">Position #{idx + 1}</span>
                      <TrustBadge source={emp.source || 'APPLICANT_PROVIDED'} confidence={emp.confidence} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Company / Organization</label>
                        <input
                          type="text"
                          value={emp.employer}
                          onChange={(e) => {
                            const updated = [...employmentRecords];
                            updated[idx].employer = e.target.value;
                            setEmploymentRecords(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Role / Job Title</label>
                        <input
                          type="text"
                          value={emp.role}
                          onChange={(e) => {
                            const updated = [...employmentRecords];
                            updated[idx].role = e.target.value;
                            setEmploymentRecords(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Responsibilities & Technical Stack</label>
                      <textarea
                        rows={2}
                        value={emp.responsibilities || ''}
                        onChange={(e) => {
                          const updated = [...employmentRecords];
                          updated[idx].responsibilities = e.target.value;
                          setEmploymentRecords(updated);
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'SKILLS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Registered Competencies & Technical Skills</h3>
                <TrustBadge source="APPLICANT_PROVIDED" />
              </div>

              <div className="flex flex-wrap gap-2.5">
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs font-semibold text-slate-200"
                  >
                    <span>{s.skillName || s}</span>
                    <button
                      onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="pt-4 flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="e.g. Python, Docker, Kubernetes"
                  id="newSkillInput"
                  className="flex-1 px-3 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-slate-100"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('newSkillInput') as HTMLInputElement;
                    if (el) {
                      addSkill(el.value);
                      el.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-sky-500/20 text-sky-300 font-bold text-xs rounded-xl hover:bg-sky-500/30"
                >
                  Add Skill
                </button>
              </div>
            </div>
          )}

          {activeTab === 'LANGUAGES' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Language Proficiencies</h3>
                <TrustBadge source="APPLICANT_PROVIDED" />
              </div>

              <div className="space-y-4">
                {applicantLanguages.map((lang, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">{lang.languageName}</h4>
                      <p className="text-xs text-sky-400 font-semibold">{lang.proficiency}</p>
                      <p className="text-[11px] text-slate-400">
                        {lang.hasCertificate ? 'Official Certificate Verified' : 'Self-Assessed Proficiency'}
                      </p>
                    </div>

                    <TrustBadge source={lang.source || 'APPLICANT_PROVIDED'} confidence={lang.confidence} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'MOTIVATION' && (
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Target Germany Motivation Statement</h3>
                <TrustBadge source="APPLICANT_PROVIDED" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Why Germany? What are your academic & professional goals?
                </label>
                <textarea
                  rows={6}
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  className="w-full p-4 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500 leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
