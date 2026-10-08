export type UserRole = 'APPLICANT' | 'CONSULTANT' | 'ADMIN';
export type UserStatus = 'EMAIL_VERIFICATION_PENDING' | 'ACTIVE' | 'SUSPENDED';
export type Pathway = 'STUDY' | 'VOCATIONAL' | 'EMPLOYMENT';

export type SourceType =
  | 'APPLICANT_PROVIDED'
  | 'DOCUMENT_EXTRACTED'
  | 'VIDEO_EXTRACTED'
  | 'WEB_RESEARCH'
  | 'VERIFIED'
  | 'AI_GENERATED';

export type QualificationStatus =
  | 'READY'
  | 'ADDITIONAL_REQUIREMENTS_NEEDED'
  | 'NOT_READY'
  | 'PENDING';

export type DocumentType =
  | 'CV'
  | 'DEGREE'
  | 'CERTIFICATE'
  | 'EXPERIENCE_LETTER'
  | 'LANGUAGE_CERTIFICATE'
  | 'OTHER';

export type DocumentStatus =
  | 'UPLOADED'
  | 'PROCESSING'
  | 'EXTRACTED'
  | 'VERIFIED'
  | 'CONFLICT';

export type ConflictStatus = 'OPEN' | 'RESOLVED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  fullName?: string;
}

export interface EducationRecord {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate?: string;
  gradeCgpa?: string;
  source: SourceType;
  confidence?: number;
  verified?: boolean;
}

export interface EmploymentRecord {
  id?: string;
  employer: string;
  role: string;
  responsibilities?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  source: SourceType;
  confidence?: number;
  verified?: boolean;
}

export interface ApplicantSkill {
  id?: string;
  skillName: string;
  level?: string;
  source: SourceType;
  confidence?: number;
  verified?: boolean;
}

export interface ApplicantLanguage {
  id?: string;
  languageName: string;
  proficiency: string;
  hasCertificate?: boolean;
  certificateType?: string;
  source: SourceType;
  confidence?: number;
  verified?: boolean;
}

export interface DocumentExtraction {
  id: string;
  documentId: string;
  fieldKey: string;
  fieldValue: string;
  confidence: number;
  source: SourceType;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface DocumentRecord {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  documentType: DocumentType;
  filePath: string;
  fileSize: number;
  status: DocumentStatus;
  createdAt: string;
  extractions?: DocumentExtraction[];
}

export interface DocumentConflict {
  id: string;
  fieldName: string;
  valueA: string;
  sourceA: string;
  valueB: string;
  sourceB: string;
  status: ConflictStatus;
  resolvedValue?: string;
  description?: string;
}

export interface ClarificationTask {
  id: string;
  question: string;
  reason: string;
  options: string[];
  status: 'PENDING' | 'ANSWERED';
  selectedOption?: string;
  customAnswer?: string;
}

export interface ResearchSource {
  id: string;
  title: string;
  information: string;
  source: string;
  url: string;
  sourceType: string;
  confidence: number;
  pathway: Pathway;
  retrievedDate: string;
}

export interface EvaluatedRule {
  ruleCode: string;
  requirement: string;
  description: string;
  required: boolean;
  source: string;
  passed: boolean;
  status: 'MET' | 'PARTIAL' | 'MISSING';
  applicantEvidence: string;
  remedyAction?: string;
}

export interface QualificationAssessment {
  id?: string;
  status: QualificationStatus;
  overallScore: number;
  pathway: Pathway;
  summary: string;
  missingRequirements: string[];
  details: EvaluatedRule[];
  disclaimer?: string;
}

export interface Recommendation {
  id?: string;
  recommendedStep: string;
  reason: string;
  supportingRequirements: string[];
  sources: string[];
  suggestedServiceSlug?: string;
  suggestedServiceName?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface ServiceCatalogItem {
  id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  duration?: string;
  active?: boolean;
}

export interface AgentAction {
  id: string;
  agentName: string;
  action: string;
  reason: string;
  result: any;
  confidence: number;
  timestamp: string;
}

export interface CompletenessPillar {
  key: string;
  label: string;
  weight: number;
  completed: boolean;
  score: number;
  notes: string;
}

export interface ProfileCompleteness {
  overallPercentage: number;
  pillars: CompletenessPillar[];
  missingSummary: string[];
}

export interface Applicant {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  location?: string;
  targetPathway?: Pathway;
  profileCompleteness: number;
  qualificationStatus: QualificationStatus;
  goals?: Array<{ pathway: Pathway; targetIntake?: string; motivation?: string; preferredField?: string }>;
  educationRecords?: EducationRecord[];
  employmentRecords?: EmploymentRecord[];
  applicantSkills?: ApplicantSkill[];
  applicantLanguages?: ApplicantLanguage[];
  documents?: DocumentRecord[];
  documentConflicts?: DocumentConflict[];
  clarificationTasks?: ClarificationTask[];
  qualificationAssessments?: QualificationAssessment[];
  recommendations?: Recommendation[];
}
