import React from 'react';
import {
  GraduationCap,
  Briefcase,
  Languages,
  FileText,
  Video,
  Award,
  Calendar,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Calculator,
  Building,
} from 'lucide-react';
import { ApplicantProfile } from '../types/index';
import { ProvenanceBadge } from './ProvenanceBadge';

interface ProfileDashboardProps {
  applicant: ApplicantProfile;
  onOpenOcrModal: () => void;
  onOpenVideoRecorder: () => void;
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  applicant,
  onOpenOcrModal,
  onOpenVideoRecorder,
}) => {
  const educations = applicant.educations || [];
  const employments = applicant.employments || [];
  const languages = applicant.languages || [];
  const documents = applicant.documents || [];
  const motivation = applicant.motivationMedia;

  return (
    <div className="space-y-5 pb-6">
      {/* Top Banner Card: Personal Overview */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-blue-500/20">
              {applicant.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {applicant.fullName}
                </h1>
                <ProvenanceBadge provenance={applicant.provenance} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  {applicant.city || 'India'}, {applicant.state || ''}
                </span>
                <span>•</span>
                <span>{applicant.email}</span>
                {applicant.phone && (
                  <>
                    <span>•</span>
                    <span>{applicant.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Target Intake</div>
              <div className="text-xs font-bold text-blue-300">
                {applicant.targetIntake || 'Winter Semester 2025/26'}
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-blue-600/10 border border-blue-500/30 text-right">
              <div className="text-[10px] text-blue-400 uppercase font-semibold">Track</div>
              <div className="text-xs font-bold text-white">{applicant.goalTrack}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Education & Bavarian GPA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Education Section */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Education & Bavarian GPA</h3>
                <p className="text-[11px] text-slate-400">Indian Degree & German KMK Equivalence</p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400">
              {educations.length} records
            </span>
          </div>

          {educations.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">No educational qualifications added yet.</p>
          ) : (
            <div className="space-y-3">
              {educations.map((edu) => (
                <div
                  key={edu.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 space-y-2.5 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                        <span>{edu.qualification}</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3 h-3 text-slate-500" />
                        <span>{edu.institution}</span>
                        {edu.graduationYear && <span>• Class of {edu.graduationYear}</span>}
                      </div>
                    </div>
                    <ProvenanceBadge provenance={edu.provenance} />
                  </div>

                  {/* Bavarian Formula Result Pill */}
                  <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-slate-300 font-medium">
                        Indian Score: <strong className="text-white">{edu.gpaOrPercentage}</strong>
                        {edu.maxGpaOrScale === 10 ? ' CGPA' : '%'}
                      </span>
                    </div>

                    {edu.germanGpaEquivalent && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">German Grade:</span>
                        <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                          {edu.germanGpaEquivalent} (
                          {edu.germanGpaEquivalent <= 1.5
                            ? 'Sehr Gut'
                            : edu.germanGpaEquivalent <= 2.5
                            ? 'Gut'
                            : 'Befriedigend'}
                          )
                        </span>
                        <ProvenanceBadge provenance="AI_GENERATED" size="sm" />
                      </div>
                    )}
                  </div>

                  {/* Anabin Tag */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                      Anabin: {edu.anabinStatus || 'H+'}
                    </span>
                    <span>Recognized German Higher Education Equivalent</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Language Proficiencies */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Languages className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Language Proficiencies</h3>
                <p className="text-[11px] text-slate-400">CEFR Benchmarks (German & English)</p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400">{languages.length} languages</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {languages.map((lang) => (
              <div
                key={lang.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{lang.language}</span>
                  <ProvenanceBadge provenance={lang.provenance} />
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-400 tracking-tight">
                    {lang.level}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {lang.language === 'German' ? 'CEFR German' : 'English Proficiency'}
                  </span>
                </div>

                {lang.certificateName && (
                  <div className="text-[11px] text-slate-400 font-medium truncate" title={lang.certificateName}>
                    📜 {lang.certificateName}
                  </div>
                )}
                {lang.score && (
                  <div className="text-[10px] text-emerald-400 font-semibold">
                    Score: {lang.score}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Employment & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Employment & Experience */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Employment & Work History</h3>
                <p className="text-[11px] text-slate-400">Professional Experience in India</p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400">{employments.length} roles</span>
          </div>

          {employments.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">No employment records logged.</p>
          ) : (
            <div className="space-y-3">
              {employments.map((emp) => (
                <div
                  key={emp.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100">{emp.role}</h4>
                      <div className="text-xs text-blue-400 font-medium">{emp.employer}</div>
                    </div>
                    <ProvenanceBadge provenance={emp.provenance} />
                  </div>

                  {emp.responsibilities && (
                    <p className="text-xs text-slate-400 leading-relaxed">{emp.responsibilities}</p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>Duration: {emp.totalMonths ? `${emp.totalMonths} Months` : 'Active'}</span>
                    <span>•</span>
                    <span>Industry: {emp.industry || 'General'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Uploaded Documents & OCR State */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Documents & OCR Extraction</h3>
                <p className="text-[11px] text-slate-400">Certificates, Marksheets & APS Audits</p>
              </div>
            </div>
            <button
              onClick={onOpenOcrModal}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 transition"
            >
              + Upload / Test
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800">
              <p className="text-xs text-slate-400">No documents uploaded yet.</p>
              <button
                onClick={onOpenOcrModal}
                className="mt-2 text-xs font-semibold text-blue-400 hover:underline"
              >
                Upload Indian degree or Goethe certificate for OCR test ➔
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-lg bg-slate-900 text-slate-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-200 truncate">{doc.title}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>{doc.docType}</span>
                        {doc.extractionFlags?.ocrConfidence && (
                          <span className="text-emerald-400">
                            OCR Confidence: {Math.round(doc.extractionFlags.ocrConfidence * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <ProvenanceBadge
                      provenance={doc.verificationState === 'VERIFIED' ? 'VERIFIED' : 'APPLICANT_PROVIDED'}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Motivation & Intro Video Pitch Card */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Video Introduction & Motivation Pitch</h3>
              <p className="text-[11px] text-slate-400">German Cultural Alignment & Aspirations</p>
            </div>
          </div>
          <button
            onClick={onOpenVideoRecorder}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition"
          >
            {motivation?.introVideoTranscript ? 'Re-record Pitch' : 'Record Intro Video'}
          </button>
        </div>

        {motivation ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Speech-to-Text Pitch Transcript
                </span>
                <div className="flex items-center gap-2">
                  {motivation.sentimentScore && (
                    <span className="text-xs font-bold text-emerald-400">
                      Sentiment: {Math.round(motivation.sentimentScore * 100)}% Positive
                    </span>
                  )}
                  <ProvenanceBadge provenance={motivation.provenance} />
                </div>
              </div>

              <p className="text-xs text-slate-300 italic leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                "{motivation.introVideoTranscript || motivation.audioTranscript}"
              </p>

              {/* Motivation Keywords */}
              {motivation.motivationKeywords && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {motivation.motivationKeywords.map((kw, kwIdx) => (
                    <span
                      key={kwIdx}
                      className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 text-[10px] font-semibold border border-blue-500/20"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-2">
            No video pitch recorded. Click 'Record Intro Video' to simulate or capture a short pitch.
          </p>
        )}
      </div>
    </div>
  );
};
