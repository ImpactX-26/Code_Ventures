export type GoalTrack = 'Study' | 'Ausbildung' | 'Employment';
export type OnboardingStatus = 'ONBOARDING' | 'IN_REVIEW' | 'ROADMAP_READY' | 'PLACED';
export type DataProvenance = 'APPLICANT_PROVIDED' | 'VERIFIED' | 'AI_GENERATED';
export type EligibilityStatus = 'ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'INELIGIBLE' | 'NEEDS_ASSESSMENT';

export interface Education {
  id: string;
  applicantId: string;
  institution: string;
  qualification: string;
  fieldOfStudy?: string;
  startYear?: number;
  graduationYear?: number;
  gpaOrPercentage?: number;
  maxGpaOrScale?: number;
  germanGpaEquivalent?: number;
  gradingSystem?: string;
  isIndianDegree?: boolean;
  degreeType?: string;
  anabinStatus?: string;
  isVerified: boolean;
  provenance: DataProvenance;
}

export interface Employment {
  id: string;
  applicantId: string;
  employer: string;
  role: string;
  responsibilities?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  totalMonths?: number;
  industry?: string;
  isVerified: boolean;
  provenance: DataProvenance;
}

export interface Language {
  id: string;
  applicantId: string;
  language: string;
  level: string;
  certificateName?: string;
  score?: string;
  isVerified: boolean;
  provenance: DataProvenance;
}

export interface Document {
  id: string;
  applicantId: string;
  title: string;
  docType: string;
  fileUrl: string;
  fileName: string;
  fileSizeBytes?: number;
  mimeType?: string;
  extractionFlags?: Record<string, any>;
  extractedData?: Record<string, any>;
  verificationState: 'PENDING' | 'VERIFIED' | 'FLAGGED_FOR_REVIEW' | 'REJECTED';
  verificationNotes?: string;
  uploadedAt: string;
}

export interface MotivationMedia {
  id: string;
  applicantId: string;
  primaryReasonToMigrate?: string;
  targetRegionsInGermany?: string[];
  longTermCareerGoals?: string;
  preferredLanguageOfStudyWork?: string;
  introVideoUrl?: string;
  introVideoTranscript?: string;
  audioTranscript?: string;
  sentimentScore?: number;
  motivationKeywords?: string[];
  videoDurationSeconds?: number;
  provenance: DataProvenance;
}

export interface MissingRequirement {
  id: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'RECOMMENDED';
  description: string;
  actionType: string;
  isCompleted: boolean;
}

export interface EducaroServicePackage {
  packageId: string;
  serviceName: string;
  tier: string;
  highlight: string;
  matchScore: number;
  features: string[];
}

export interface ActionableStep {
  step: number;
  text: string;
}

export interface QualificationRecommendation {
  id: string;
  applicantId: string;
  eligibilityStatus: EligibilityStatus;
  completenessScore: number;
  pathwaySummary?: string;
  missingRequirements?: MissingRequirement[];
  anabinInstitutionalStatus?: string;
  apsRequired: boolean;
  educaroServiceRouting?: EducaroServicePackage[];
  actionableNextSteps?: ActionableStep[];
  aiSummaryNotes?: string;
  generatedAt?: string;
  updatedAt?: string;
}

export interface ApplicantProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  country: string;
  targetIntake?: string;
  availabilityDate?: string;
  goalTrack: GoalTrack;
  status: OnboardingStatus;
  provenance: DataProvenance;
  createdAt: string;
  updatedAt: string;

  educations?: Education[];
  employments?: Employment[];
  languages?: Language[];
  documents?: Document[];
  motivationMedia?: MotivationMedia;
  recommendation?: QualificationRecommendation;
}

export interface ReActStep {
  thought: string;
  action: string;
  actionInput: Record<string, any>;
  observation: any;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reactSteps?: ReActStep[];
  timestamp?: string;
}
