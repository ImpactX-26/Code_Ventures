export type GoalTrack = 'Study' | 'Ausbildung' | 'Employment';
export type OnboardingStatus = 'ONBOARDING' | 'IN_REVIEW' | 'ROADMAP_READY' | 'PLACED';
export type DataProvenance = 'DOCUMENT_VERIFIED' | 'USER_TYPED' | 'AI_SUGGESTED';
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
  provenanceMetadata?: Record<string, string>;
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
  provenanceMetadata?: Record<string, string>;
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
  provenanceMetadata?: Record<string, string>;
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
  provenance?: DataProvenance;
  provenanceMetadata?: Record<string, string>;
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
  provenanceMetadata?: Record<string, string>;
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

export interface PathwaySimulationBranch {
  track: GoalTrack;
  title: string;
  badge: string;
  eligibilityScore: number;
  eligibilityStatus: 'ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'INELIGIBLE';
  timelineToDepartureMonths: string;
  languagePrerequisite: {
    minimumRequired: string;
    recommended: string;
    applicantCurrent: string;
    isFulfilled: boolean;
    gapAnalysis: string;
  };
  financialThreshold: {
    blockedAccountRequired: boolean;
    blockedAccountAmountEur?: number;
    monthlyStipendAvailable: boolean;
    monthlyStipendAmountEur?: string;
    financialSummary: string;
  };
  legalAndVisaChecks: {
    apsMandatory: boolean;
    apsStatusNotice: string;
    anabinRecognitionStatus: string;
    visaType: string;
  };
  careerAndPrOutlook: {
    graduationOrContractDuration: string;
    prEligibilityTimeline: string;
    startingSalaryRange: string;
  };
  matchedEducaroService: {
    packageName: string;
    matchScore: number;
    highlight: string;
  };
  pros: string[];
  riskBottlenecks: string[];
}

export interface PathwayComparisonResult {
  candidateName: string;
  selectedTrack: GoalTrack;
  simulatedAt: string;
  activeOverridesApplied?: Record<string, any>;
  pathways: {
    study: PathwaySimulationBranch;
    ausbildung: PathwaySimulationBranch;
    employment: PathwaySimulationBranch;
  };
  bestMatchedTrack: GoalTrack;
  counselorStrategicAdvice: string;
}

export interface EducaroCounselorDossier {
  dossierId: string;
  applicantId: string;
  compiledAt: string;
  compilationVersion: string;
  auditIntegritySignature: string;
  executiveSummary: {
    applicantName: string;
    email: string;
    phone: string | null;
    city: string;
    state: string;
    country: string;
    primaryTrack: string;
    targetIntake: string;
    eligibilityStatus: string;
    completenessScore: number;
    highestBavarianGpa: number | null;
    bavarianClassification: string;
    primaryGermanLevel: string;
    primaryEnglishLevel: string;
  };
  provenanceAuditBreakdown: {
    totalEvaluatedAttributes: number;
    documentVerifiedCount: number;
    userTypedCount: number;
    aiSuggestedCount: number;
    documentVerifiedPercentage: number;
    userTypedPercentage: number;
    aiSuggestedPercentage: number;
    antiHallucinationGuarantee: string;
  };
  regulatoryChecklist: {
    apsMandatory: boolean;
    apsStatus: string;
    anabinInstitutionalStatus: string;
    blockedAccountRequired: boolean;
    blockedAccountAmountEur: number | null;
    trainingStipendEligible: boolean;
    visaCategory: string;
  };
  structuredProfileData: {
    educations: Education[];
    employments: Employment[];
    languages: Language[];
    documents: Document[];
    motivationMedia: MotivationMedia | null;
  };
  pathwayComparisonMatrix: PathwayComparisonResult;
  educaroServiceRouting: EducaroServicePackage[];
  counselorPriorityActionItems: Array<{
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    action: string;
    targetDepartment: string;
    estimatedTurnaround: string;
  }>;
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
  pathwayComparison?: PathwayComparisonResult;
  actionableNextSteps?: ActionableStep[];
  aiSummaryNotes?: string;
  provenance: DataProvenance;
  provenanceMetadata?: Record<string, string>;
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
  provenanceMetadata?: Record<string, string>;
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
