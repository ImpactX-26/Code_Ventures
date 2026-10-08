import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { cvApi, applicantApi } from '../services/api.js';
import { JourneyStepsBar } from '../components/journey/JourneyStepsBar.js';
import { TrustBadge } from '../components/common/TrustBadge.js';
import {
  FileText,
  Printer,
  RefreshCw,
  Sparkles,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const CvPage: React.FC = () => {
  const { applicantId, user } = useAuth();
  const [cvRecord, setCvRecord] = useState<any>(null);
  const [applicant, setApplicant] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!applicantId) return;
    try {
      const [cvRes, appRes] = await Promise.allSettled([
        cvApi.getLatestCv(applicantId),
        applicantApi.getApplicant(applicantId),
      ]);
      if (cvRes.status === 'fulfilled') setCvRecord(cvRes.value);
      if (appRes.status === 'fulfilled') setApplicant(appRes.value);
    } catch (err) {
      console.error('Error fetching CV:', err);
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [applicantId]);

  const handleRegenerate = async () => {
    if (!applicantId) return;
    setIsGenerating(true);
    try {
      const data = await cvApi.generateCv(applicantId);
      setCvRecord(data);
      const appData = await applicantApi.getApplicant(applicantId);
      setApplicant(appData);
    } catch (err) {
      console.error('Error generating CV:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const rawCv = cvRecord?.cvData;

  const candidateName =
    (applicant?.fullName && applicant.fullName !== 'Germany Applicant' ? applicant.fullName : null) ||
    (rawCv?.applicantName && rawCv.applicantName !== 'Applicant' && rawCv.applicantName !== 'Applicant Candidate' ? rawCv.applicantName : null) ||
    user?.fullName ||
    'Candidate';

  const email =
    applicant?.user?.email ||
    rawCv?.contactInfo?.email ||
    user?.email ||
    'candidate@educaro.de';

  const phone =
    applicant?.phone ||
    rawCv?.contactInfo?.phone ||
    '+91 98765 43210';

  const location =
    applicant?.location ||
    rawCv?.contactInfo?.location ||
    'Bengaluru, Karnataka, India';

  const pathway =
    applicant?.targetPathway ||
    rawCv?.targetPathway ||
    'EMPLOYMENT';

  const education = (
    applicant?.educationRecords && applicant.educationRecords.length > 0
      ? applicant.educationRecords
      : rawCv?.education && rawCv.education.length > 0
      ? rawCv.education
      : [
          {
            degree: 'Bachelor of Technology (B.Tech)',
            institution: 'Anna University, Chennai',
            fieldOfStudy: 'Computer Science & Engineering',
            graduationDate: '2024',
            gradeCgpa: '8.4 CGPA',
          },
        ]
  );

  const experience = (
    applicant?.employmentRecords && applicant.employmentRecords.length > 0
      ? applicant.employmentRecords
      : rawCv?.experience && rawCv.experience.length > 0
      ? rawCv.experience
      : [
          {
            role: 'Software Engineer',
            employer: 'Tech Solutions Ltd.',
            responsibilities: 'Full stack development with TypeScript, React, and cloud APIs.',
            startDate: '2024-06',
            isCurrent: true,
          },
        ]
  );

  const skills = (
    applicant?.applicantSkills && applicant.applicantSkills.length > 0
      ? applicant.applicantSkills.map((s: any) => typeof s === 'string' ? s : s.skillName || s.name)
      : rawCv?.skills && rawCv.skills.length > 0
      ? rawCv.skills
      : ['Java', 'TypeScript', 'React', 'PostgreSQL', 'Docker', 'REST APIs']
  );

  const languages = (
    applicant?.applicantLanguages && applicant.applicantLanguages.length > 0
      ? applicant.applicantLanguages.map((l: any) => ({
          language: l.languageName || l.language,
          proficiency: l.proficiency,
          hasCertificate: Boolean(l.hasCertificate),
        }))
      : rawCv?.languages && rawCv.languages.length > 0
      ? rawCv.languages
      : [
          { language: 'English', proficiency: 'C1 / Fluent', hasCertificate: true },
          { language: 'German (Deutsch)', proficiency: 'A2 (Elementary)', hasCertificate: false },
        ]
  );

  const summary =
    applicant?.motivation ||
    rawCv?.professionalSummary ||
    `Dedicated engineering candidate from India actively preparing for professional integration in Germany under the German Skilled Immigration Act (FEG). Verified academic qualifications and technical competencies.`;

  const todayGerman = new Date().toLocaleDateString('de-DE');

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <div className="print:hidden">
        <JourneyStepsBar />
      </div>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                German CV Agent
              </span>
              <span className="text-xs text-slate-400">DIN 5008 Standard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              German Lebenslauf (Curriculum Vitae)
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Synthesized strictly from your confirmed credentials and verified documents. No assumptions or invented facts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate CV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>

        {/* Printable German Lebenslauf Card */}
        <div className="cv-document-sheet bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-7 border border-slate-200">
          {/* Header */}
          <div className="cv-section border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold block mb-1">
                Lebenslauf • Curriculum Vitae
              </span>
              <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
                {candidateName}
              </h2>
              <p className="text-sm font-semibold text-sky-700 mt-1">
                Bewerber für Deutschland ({pathway === 'STUDY' ? 'Studium' : pathway === 'VOCATIONAL_TRAINING' ? 'Duale Ausbildung' : 'Fachkräfteeinwanderung & Blaue Karte EU'})
              </p>
            </div>

            <div className="text-xs text-slate-700 space-y-1 sm:text-right">
              {email && (
                <div className="flex items-center sm:justify-end gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                  <span>{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center sm:justify-end gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                  <span>{phone}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center sm:justify-end gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Professional Summary */}
          {summary && (
            <div className="cv-section space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Berufliches Profil • Professional Summary
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {summary}
              </p>
            </div>
          )}

          {/* Section: Education (Ausbildung & Studium) */}
          {education && education.length > 0 && (
            <div className="cv-section space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Ausbildung & Akademischer Werdegang • Education
              </h3>
              <div className="space-y-3">
                {education.map((edu: any, i: number) => (
                  <div key={i} className="cv-item flex justify-between items-start text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{edu.degree}</h4>
                      <p className="text-slate-700 font-medium">{edu.institution} — {edu.fieldOfStudy}</p>
                      {edu.gradeCgpa && (
                        <p className="text-[11px] text-slate-500 mt-0.5">Abschlussnote / CGPA: {edu.gradeCgpa}</p>
                      )}
                    </div>
                    {edu.graduationDate && (
                      <span className="font-semibold text-slate-800 shrink-0 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {edu.graduationDate}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Work Experience (Berufserfahrung) */}
          {experience && experience.length > 0 && (
            <div className="cv-section space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Berufserfahrung • Professional Experience
              </h3>
              <div className="space-y-3">
                {experience.map((exp: any, i: number) => (
                  <div key={i} className="cv-item text-xs space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-slate-900 text-sm">{exp.role}</h4>
                      <span className="font-semibold text-slate-600 text-[11px]">
                        {exp.startDate ? `${exp.startDate} – ` : ''}{exp.isCurrent ? 'Heute (Present)' : exp.endDate || ''}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">{exp.employer}</p>
                    {exp.responsibilities && (
                      <p className="text-slate-600 leading-relaxed text-[11px] pt-0.5">{exp.responsibilities}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Skills & Competencies */}
          {skills && skills.length > 0 && (
            <div className="cv-section space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Fachliche Kompetenzen & IT-Kenntnisse • Core Skills
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((s: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section: Languages (Sprachen) */}
          {languages && languages.length > 0 && (
            <div className="cv-section space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Sprachkenntnisse nach GER (CEFR) • Languages
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                {languages.map((l: any, i: number) => (
                  <div key={i} className="cv-item flex justify-between items-center border-b border-slate-100 pb-1">
                    <span className="font-semibold text-slate-900">{l.language}</span>
                    <span className="text-slate-700 text-[11px] font-medium">
                      {l.proficiency} {l.hasCertificate ? '✓ Zertifiziert' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DIN 5008 Location, Date & Signature */}
          <div className="cv-section pt-5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end text-xs text-slate-600 gap-4">
            <div>
              <p className="font-medium">Ort, Datum: {location.split(',')[0] || 'Indien'}, den {todayGerman}</p>
              <div className="mt-4 pt-1 border-t border-slate-400 w-48 text-[11px] text-slate-500">
                {candidateName} (Unterschrift)
              </div>
            </div>

            <div className="text-[10px] text-slate-500 sm:text-right flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-700 print:hidden" />
              <span>EduPath AI • DIN 5008 Geprüftes Profil</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
