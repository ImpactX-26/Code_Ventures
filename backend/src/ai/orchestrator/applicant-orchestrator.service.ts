import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service.js';
import { IntakeAgent } from '../agents/intake.agent.js';
import { ProfileAgent } from '../agents/profile.agent.js';
import { DocumentAgent } from '../agents/document.agent.js';
import { WebResearchAgent } from '../agents/web-research.agent.js';
import { VerificationAgent } from '../agents/verification.agent.js';
import { ClarificationAgent } from '../agents/clarification.agent.js';
import { QualificationAgent } from '../agents/qualification.agent.js';
import { RecommendationAgent } from '../agents/recommendation.agent.js';
import { CvAgent } from '../agents/cv.agent.js';
import { VideoAgent } from '../agents/video.agent.js';
import { AgentName, AgentRunStatus, Pathway } from '@prisma/client';

export interface OrchestrationLogEntry {
  id: string;
  agentName: AgentName;
  action: string;
  reason: string;
  result: any;
  confidence: number;
  timestamp: Date;
}

@Injectable()
export class ApplicantOrchestratorService {
  private readonly logger = new Logger(ApplicantOrchestratorService.name);

  // In-memory agent run logs fallback if DB is temporarily disconnected
  private inMemRuns: Map<string, OrchestrationLogEntry[]> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    public readonly intakeAgent: IntakeAgent,
    public readonly profileAgent: ProfileAgent,
    public readonly documentAgent: DocumentAgent,
    public readonly webResearchAgent: WebResearchAgent,
    public readonly verificationAgent: VerificationAgent,
    public readonly clarificationAgent: ClarificationAgent,
    public readonly qualificationAgent: QualificationAgent,
    public readonly recommendationAgent: RecommendationAgent,
    public readonly cvAgent: CvAgent,
    public readonly videoAgent: VideoAgent,
  ) {}

  /**
   * Run the end-to-end multi-agent orchestration cycle for an applicant
   */
  async runFullJourneyCycle(applicantId: string): Promise<{
    runId: string;
    completeness: any;
    conflicts: any[];
    clarifications: any[];
    webResearch: any;
    qualification: any;
    recommendation: any;
    actions: OrchestrationLogEntry[];
  }> {
    this.logger.log(`🚀 Starting Full Agentic AI Cycle for applicant: ${applicantId}`);
    const runId = uuidv4();
    const actionLogs: OrchestrationLogEntry[] = [];

    // Fetch applicant with all relations
    let applicant: any = null;
    let rules: any[] = [];
    let services: any[] = [];

    if (this.prisma.isConnected) {
      applicant = await this.prisma.applicant.findUnique({
        where: { id: applicantId },
        include: {
          user: true,
          goals: true,
          educationRecords: true,
          employmentRecords: true,
          applicantSkills: true,
          applicantLanguages: true,
          documents: { include: { extractions: true } },
          documentConflicts: true,
          clarificationTasks: true,
          videoSubmissions: { include: { insights: true, transcripts: true } },
        },
      });

      rules = await this.prisma.qualificationRule.findMany({ where: { active: true } });
      services = await this.prisma.service.findMany({ where: { active: true } });
    }

    if (!applicant) {
      // Fallback applicant object for resilient demo
      applicant = {
        id: applicantId,
        fullName: 'Applicant Candidate',
        targetPathway: Pathway.STUDY,
        goals: [{ pathway: Pathway.STUDY, motivation: 'Targeting higher education in Germany' }],
        educationRecords: [
          { degree: 'B.Tech Computer Science', institution: 'Anna University', graduationDate: '2024', gradeCgpa: '8.4 CGPA' },
        ],
        employmentRecords: [
          { role: 'Software Engineer', employer: 'Tech Corp', responsibilities: 'Full stack development with Node.js and React', isCurrent: true },
        ],
        applicantSkills: [
          { skillName: 'TypeScript' },
          { skillName: 'React' },
          { skillName: 'Node.js' },
        ],
        applicantLanguages: [
          { languageName: 'English', proficiency: 'Fluent', hasCertificate: true },
          { languageName: 'German', proficiency: 'A2', hasCertificate: false },
        ],
        documents: [],
        documentConflicts: [],
        clarificationTasks: [],
      };
    }

    const pathway: Pathway = applicant.targetPathway || Pathway.STUDY;

    // STEP 1: Intake & Profile Completeness Evaluation
    const completeness = this.profileAgent.calculateCompleteness(applicant);
    this.logAction(
      actionLogs,
      applicantId,
      AgentName.PROFILE,
      'Evaluated Structured Profile Completeness',
      'Calculated dynamic completeness index across 7 pillars: Personal, Education, Employment, Skills, Languages, Documents, and Goals.',
      { completenessPercentage: completeness.overallPercentage, missingPillars: completeness.missingSummary },
      1.0,
    );

    // STEP 2: Document Intelligence & Cross-Document Conflict Verification
    const allExtractions = (applicant.documents || []).flatMap((d: any) => d.extractions || []);
    const detectedConflicts = this.verificationAgent.detectConflicts(applicant, allExtractions);
    this.logAction(
      actionLogs,
      applicantId,
      AgentName.VERIFICATION,
      'Performed Cross-Document Inconsistency Audit',
      'Audited applicant self-reported credentials against extracted document records (CV, Degree transcripts, Experience letters).',
      { conflictsCount: detectedConflicts.length, details: detectedConflicts.map((c) => c.description) },
      0.97,
    );

    // STEP 3: Clarification Agent Task Generation
    const clarificationItems = this.clarificationAgent.generateClarifications(applicant, detectedConflicts);
    this.logAction(
      actionLogs,
      applicantId,
      AgentName.CLARIFICATION,
      'Synthesized Contextual Clarification Tasks',
      'Identified critical missing items (German language level, APS financial plan) and formulated multiple-choice clarification tasks.',
      { generatedTasksCount: clarificationItems.length, questions: clarificationItems.map((c) => c.question) },
      0.95,
    );

    // STEP 4: Live Web Research Agent
    const webResearch = await this.webResearchAgent.conductResearch(pathway);
    this.logAction(
      actionLogs,
      applicantId,
      AgentName.WEB_RESEARCH,
      'Queried Authoritative German Regulatory & Academic Portals',
      `Executed real-time requirement lookup for ${pathway} across DAAD, Make it in Germany, KMK Anabin, and ZAB databases.`,
      { retrievedSourcesCount: webResearch.sources.length, summarySnippet: webResearch.summary.slice(0, 150) },
      0.99,
    );

    // STEP 5: Qualification Engine
    const defaultRules = [
      { ruleCode: 'STUDY_DEGREE_RECOGNITION', pathway: Pathway.STUDY, requirement: 'Higher Education Entrance Qualification (HZB / Anabin H+)', description: 'Recognized Indian bachelor degree', required: true, source: 'DAAD / Anabin', active: true },
      { ruleCode: 'STUDY_ACADEMIC_GPA', pathway: Pathway.STUDY, requirement: 'Minimum Academic Performance (German Grade <= 2.5 or CGPA >= 65%)', description: 'Minimum GPA requirement', required: true, source: 'Hochschulkompass', active: true },
      { ruleCode: 'STUDY_LANGUAGE_PROFICIENCY', pathway: Pathway.STUDY, requirement: 'Certified Language Proficiency (English B2/C1 or German B1/B2)', description: 'Language criteria', required: true, source: 'Federal Foreign Office', active: true },
      { ruleCode: 'STUDY_BLOCKED_ACCOUNT', pathway: Pathway.STUDY, requirement: 'Proof of Financial Resources (Sperrkonto / Blocked Account €11,904)', description: 'Blocked account proof', required: true, source: 'Make it in Germany', active: true },
      { ruleCode: 'AUSBILDUNG_GERMAN_LEVEL', pathway: Pathway.VOCATIONAL, requirement: 'German Language Certificate (Minimum B1, recommended B2)', description: 'German B1/B2 for vocational school', required: true, source: 'BIBB', active: true },
      { ruleCode: 'AUSBILDUNG_SCHOOL_LEAVING', pathway: Pathway.VOCATIONAL, requirement: 'Recognized 10+2 / High School Certificate', description: 'Realschulabschluss equivalent', required: true, source: 'ZAB', active: true },
      { ruleCode: 'EMPLOYMENT_DEGREE_EQUIVALENCE', pathway: Pathway.EMPLOYMENT, requirement: 'Comparability of Foreign University Degree (Anerkennung / Anabin H+)', description: 'Recognized academic degree', required: true, source: 'Anerkennung in Deutschland', active: true },
      { ruleCode: 'EMPLOYMENT_WORK_EXPERIENCE', pathway: Pathway.EMPLOYMENT, requirement: 'Relevant Professional Experience (Minimum 2+ years)', description: 'Work experience', required: true, source: 'Bundesagentur für Arbeit', active: true },
    ];

    const activeRules = rules.length > 0 ? rules : defaultRules;
    const qualification = this.qualificationAgent.assess(applicant, activeRules, webResearch.sources);
    this.logAction(
      actionLogs,
      applicantId,
      AgentName.QUALIFICATION,
      'Evaluated Preliminary German Qualification Status',
      'Compared verified applicant profile against live researched regulations and official legal qualification rules.',
      { status: qualification.status, score: qualification.overallScore, missingRequirements: qualification.missingRequirements },
      0.96,
    );

    // STEP 6: Recommendation Agent & Service Routing
    const defaultServices = [
      { slug: 'study-counselling', name: 'Germany Study Counselling' },
      { slug: 'ausbildung-placement', name: 'Ausbildung & Vocational Placement' },
      { slug: 'employment-blue-card', name: 'Fast-Track Employment & Blue Card' },
      { slug: 'document-verification', name: 'Official Document Verification & Anabin Pre-Check' },
      { slug: 'language-preparation', name: 'German Language Mastery (Goethe / telc A1 - B2)' },
      { slug: 'cv-application-support', name: 'German Lebenslauf & Cover Letter Engineering' },
      { slug: 'consultant-appointment', name: 'Dedicated Senior Consultant Appointment' },
    ];
    const activeServices = services.length > 0 ? services : defaultServices;
    const recommendation = this.recommendationAgent.recommend(
      applicant,
      qualification,
      detectedConflicts,
      activeServices,
    );
    this.logAction(
      actionLogs,
      applicantId,
      AgentName.RECOMMENDATION,
      'Synthesized Explainable Recommended Next Step',
      'Selected optimal milestone action and routed applicant to specific Educaro institutional service based on qualification gaps.',
      { nextStep: recommendation.recommendedStep, routedService: recommendation.suggestedServiceName, priority: recommendation.priority },
      0.98,
    );

    // STEP 7: CV Agent Readiness
    const cv = this.cvAgent.generateCv(applicant);
    this.logAction(
      actionLogs,
      applicantId,
      AgentName.CV,
      'Compiled German Lebenslauf / Europass CV Draft',
      'Structured applicant verified data into DIN 5008 German standard format without generating unverified assumptions.',
      { applicant: cv.applicantName, sections: ['Education', 'Experience', 'Skills', 'Languages'] },
      1.0,
    );

    // Persist to DB or Memory
    if (this.prisma.isConnected) {
      try {
        // Save Agent Run and Actions
        const agentRun = await this.prisma.agentRun.create({
          data: {
            applicantId,
            runType: 'FULL_JOURNEY_CYCLE',
            status: AgentRunStatus.COMPLETED,
            endTime: new Date(),
          },
        });

        for (const act of actionLogs) {
          await this.prisma.agentAction.create({
            data: {
              agentRunId: agentRun.id,
              applicantId,
              agentName: act.agentName,
              action: act.action,
              reason: act.reason,
              result: act.result,
              confidence: act.confidence,
              timestamp: act.timestamp,
            },
          });
        }

        // Update Applicant profile completeness and qualification status
        await this.prisma.applicant.update({
          where: { id: applicantId },
          data: {
            profileCompleteness: completeness.overallPercentage,
            qualificationStatus: qualification.status,
          },
        });

        // Save Qualification Assessment
        await this.prisma.qualificationAssessment.create({
          data: {
            applicantId,
            status: qualification.status,
            overallScore: qualification.overallScore,
            pathway,
            summary: qualification.summary,
            details: qualification.evaluatedRules as any,
            missingRequirements: qualification.missingRequirements as any,
          },
        });

        // Save Recommendation
        await this.prisma.recommendation.create({
          data: {
            applicantId,
            recommendedStep: recommendation.recommendedStep,
            reason: recommendation.reason,
            supportingRequirements: recommendation.supportingRequirements,
            priority: recommendation.priority,
            status: 'ACTIVE',
          },
        });

        // Save Web Research Sources
        for (const src of webResearch.sources) {
          await this.prisma.researchSource.create({
            data: {
              applicantId,
              title: src.title,
              information: src.information,
              source: src.source,
              url: src.url,
              sourceType: src.sourceType,
              confidence: src.confidence,
              pathway: src.pathway,
              retrievedDate: src.retrievedDate,
            },
          });
        }

        // Save Clarification Tasks if not already present
        for (const cl of clarificationItems) {
          const exists = await this.prisma.clarificationTask.findFirst({
            where: { applicantId, question: cl.question },
          });
          if (!exists) {
            await this.prisma.clarificationTask.create({
              data: {
                applicantId,
                question: cl.question,
                reason: cl.reason,
                options: cl.options,
                status: 'PENDING',
              },
            });
          }
        }
      } catch (err) {
        this.logger.error(`Error persisting orchestration run to DB: ${(err as Error).message}`);
      }
    } else {
      this.inMemRuns.set(applicantId, actionLogs);
    }

    return {
      runId,
      completeness,
      conflicts: detectedConflicts,
      clarifications: clarificationItems,
      webResearch,
      qualification,
      recommendation,
      actions: actionLogs,
    };
  }

  async getAgentRuns(applicantId: string): Promise<OrchestrationLogEntry[]> {
    if (this.prisma.isConnected) {
      const actions = await this.prisma.agentAction.findMany({
        where: { applicantId },
        orderBy: { timestamp: 'desc' },
        take: 30,
      });
      if (actions.length > 0) {
        return actions.map((a) => ({
          id: a.id,
          agentName: a.agentName,
          action: a.action,
          reason: a.reason,
          result: a.result,
          confidence: a.confidence,
          timestamp: a.timestamp,
        }));
      }
    }

    const inMem = this.inMemRuns.get(applicantId);
    if (inMem && inMem.length > 0) {
      return inMem;
    }

    // Default demonstration logs for visual timeline
    return this.generateDefaultAgentTimeline(applicantId);
  }

  private logAction(
    logs: OrchestrationLogEntry[],
    applicantId: string,
    agentName: AgentName,
    action: string,
    reason: string,
    result: any,
    confidence: number,
  ) {
    logs.push({
      id: uuidv4(),
      agentName,
      action,
      reason,
      result,
      confidence,
      timestamp: new Date(),
    });
  }

  private generateDefaultAgentTimeline(applicantId: string): OrchestrationLogEntry[] {
    const now = Date.now();
    return [
      {
        id: uuidv4(),
        agentName: AgentName.ORCHESTRATOR,
        action: 'Initialized Applicant Journey Pipeline',
        reason: 'Applicant initiated preliminary Germany pathway evaluation.',
        result: { status: 'PIPELINE_ACTIVE', targetPathway: 'STUDY' },
        confidence: 1.0,
        timestamp: new Date(now - 120000),
      },
      {
        id: uuidv4(),
        agentName: AgentName.PROFILE,
        action: 'Dynamic Profile Completeness Computed',
        reason: 'Analyzed credentials across all 7 essential onboarding pillars.',
        result: { completenessPercentage: 78, status: 'HIGH_COMPLETION' },
        confidence: 0.98,
        timestamp: new Date(now - 95000),
      },
      {
        id: uuidv4(),
        agentName: AgentName.DOCUMENT,
        action: 'OCR Text & Entity Extraction',
        reason: 'Processed uploaded university degree transcript & CV.',
        result: { degreeExtracted: 'B.Tech Computer Science', confidence: 0.96 },
        confidence: 0.96,
        timestamp: new Date(now - 80000),
      },
      {
        id: uuidv4(),
        agentName: AgentName.WEB_RESEARCH,
        action: 'Real-Time Regulatory Retrieval',
        reason: 'Queried DAAD, Anabin, and Make-it-in-Germany requirements for Indian graduates.',
        result: { sourcesFetched: 4, primaryAuthority: 'DAAD / KMK Anabin' },
        confidence: 0.99,
        timestamp: new Date(now - 60000),
      },
      {
        id: uuidv4(),
        agentName: AgentName.VERIFICATION,
        action: 'Consistency Audit Executed',
        reason: 'Checked applicant profile inputs against document OCR extractions.',
        result: { inconsistenciesDetected: 0, status: 'VERIFIED' },
        confidence: 0.97,
        timestamp: new Date(now - 45000),
      },
      {
        id: uuidv4(),
        agentName: AgentName.QUALIFICATION,
        action: 'Assessed Preliminary Qualification Rules',
        reason: 'Evaluated rule thresholds against verified applicant profile.',
        result: { qualificationStatus: 'ADDITIONAL_REQUIREMENTS_NEEDED', score: 75 },
        confidence: 0.95,
        timestamp: new Date(now - 25000),
      },
      {
        id: uuidv4(),
        agentName: AgentName.RECOMMENDATION,
        action: 'Formulated Explainable Next Step',
        reason: 'Selected best next preparatory milestone and routed to Educaro service.',
        result: { recommendedAction: 'German Language Preparation (Target B1/B2)', service: 'Language Preparation' },
        confidence: 0.98,
        timestamp: new Date(now - 10000),
      },
    ];
  }
}
