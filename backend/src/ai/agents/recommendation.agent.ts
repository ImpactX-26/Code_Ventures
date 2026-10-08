import { Injectable, Logger } from '@nestjs/common';
import { Pathway, QualificationStatus } from '@prisma/client';
import { QualificationAssessmentResult } from './qualification.agent.js';

export interface NextStepRecommendation {
  recommendedStep: string;
  reason: string;
  supportingRequirements: string[];
  sources: string[];
  suggestedServiceSlug: string;
  suggestedServiceName: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

@Injectable()
export class RecommendationAgent {
  private readonly logger = new Logger(RecommendationAgent.name);

  recommend(
    applicant: any,
    assessment: QualificationAssessmentResult,
    conflicts: any[],
    services: any[],
  ): NextStepRecommendation {
    const pathway = applicant?.targetPathway || Pathway.STUDY;
    const missing = assessment.missingRequirements || [];
    const openConflicts = conflicts.filter((c) => c.status === 'OPEN');

    // 1. If open conflicts exist, resolve conflicts first
    if (openConflicts.length > 0) {
      return {
        recommendedStep: 'Resolve Detected Profile & Document Inconsistency',
        reason: `Verification Agent flagged ${openConflicts.length} discrepancy between your profile and uploaded documents. Official German visa officers reject files with discrepancies.`,
        supportingRequirements: openConflicts.map((c) => c.description),
        sources: ['KMK Anabin Standards', 'German Visa Application Guidelines'],
        suggestedServiceSlug: 'document-verification',
        suggestedServiceName: 'Official Document Verification & Anabin Pre-Check',
        priority: 'CRITICAL',
      };
    }

    // 2. If German language is missing or partial
    const langIssue = missing.some((m) => m.toLowerCase().includes('language') || m.toLowerCase().includes('german'));
    if (langIssue) {
      return {
        recommendedStep: 'Enroll in German Language Mastery (Target B1/B2)',
        reason: 'Current evaluation shows language proficiency is the primary pending hurdle for your German visa and placement readiness.',
        supportingRequirements: missing.filter((m) => m.toLowerCase().includes('german') || m.toLowerCase().includes('language')),
        sources: ['Federal Foreign Office (§16b/§16a AufenthG)', 'BIBB Vocational Framework'],
        suggestedServiceSlug: 'language-preparation',
        suggestedServiceName: 'German Language Mastery (Goethe / telc A1 - B2)',
        priority: 'HIGH',
      };
    }

    // 3. If degree recognition / APS is pending
    const degreeIssue = missing.some((m) => m.toLowerCase().includes('recognition') || m.toLowerCase().includes('equivalence'));
    if (degreeIssue) {
      return {
        recommendedStep: 'Submit Academic Credentials for Official ZAB / APS Verification',
        reason: 'Indian educational degrees require verification via APS certificate or Anabin database comparability before university application or visa submission.',
        supportingRequirements: missing,
        sources: ['DAAD Admission Database', 'KMK Central Office for Foreign Education (ZAB)'],
        suggestedServiceSlug: 'document-verification',
        suggestedServiceName: 'Official Document Verification & Anabin Pre-Check',
        priority: 'HIGH',
      };
    }

    // 4. If Ready for next review
    if (assessment.status === QualificationStatus.READY) {
      const pathwaySlug =
        pathway === Pathway.STUDY
          ? 'study-counselling'
          : pathway === Pathway.VOCATIONAL
          ? 'ausbildung-placement'
          : 'employment-blue-card';
      const pathwayService = services.find((s) => s.slug === pathwaySlug);

      return {
        recommendedStep: `Book 1-on-1 Germany ${pathway} Strategic Consultation`,
        reason: 'Your profile has achieved full preliminary qualification readiness. You are eligible for immediate university application filing or employer matching.',
        supportingRequirements: ['Profile 100% verified', 'Language criteria met', 'No pending discrepancies'],
        sources: ['Make it in Germany', 'German Chamber of Commerce'],
        suggestedServiceSlug: pathwaySlug,
        suggestedServiceName: pathwayService?.name || 'Dedicated Senior Consultant Appointment',
        priority: 'HIGH',
      };
    }

    // 5. Default next step
    return {
      recommendedStep: 'Schedule Senior Consultant Strategy Session',
      reason: 'Our automated qualification engine has identified specific preparatory steps. A dedicated Educaro consultant will build your tailored migration roadmap.',
      supportingRequirements: missing,
      sources: ['Educaro Professional Advisory Standards'],
      suggestedServiceSlug: 'consultant-appointment',
      suggestedServiceName: 'Dedicated Senior Consultant Appointment',
      priority: 'MEDIUM',
    };
  }
}
