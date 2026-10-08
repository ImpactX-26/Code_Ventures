import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { ApplicantOrchestratorService } from '../ai/orchestrator/applicant-orchestrator.service.js';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: ApplicantOrchestratorService,
  ) {}

  async getRecommendation(applicantId: string) {
    if (this.prisma.isConnected) {
      const rec = await this.prisma.recommendation.findFirst({
        where: { applicantId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });
      if (rec) {
        return rec;
      }
    }

    const cycle = await this.orchestrator.runFullJourneyCycle(applicantId);
    return cycle.recommendation;
  }

  async refreshRecommendation(applicantId: string) {
    const cycle = await this.orchestrator.runFullJourneyCycle(applicantId);
    return cycle.recommendation;
  }

  async getServicesCatalog() {
    if (this.prisma.isConnected) {
      const services = await this.prisma.service.findMany({ where: { active: true } });
      if (services.length > 0) {
        return services;
      }
    }

    // Default Educaro services catalog
    return [
      {
        slug: 'study-counselling',
        name: 'Germany Study Counselling',
        description: 'Comprehensive 1-on-1 university selection, APS certificate guidance, and German visa interview preparation.',
        category: 'ACADEMIC',
        duration: '4 weeks',
      },
      {
        slug: 'ausbildung-placement',
        name: 'Ausbildung & Vocational Placement',
        description: 'Matching with certified German training enterprises, school certificate recognition, and contract facilitation.',
        category: 'VOCATIONAL',
        duration: '8 weeks',
      },
      {
        slug: 'employment-blue-card',
        name: 'Fast-Track Employment & Blue Card',
        description: 'Anerkennung qualification recognition, employer matching, and German EU Blue Card fast-track immigration filing.',
        category: 'CAREER',
        duration: '6 weeks',
      },
      {
        slug: 'document-verification',
        name: 'Official Document Verification & Anabin Pre-Check',
        description: 'Pre-assessment of Indian university degrees and transcripts against the German KMK Anabin database and ZAB standards.',
        category: 'VERIFICATION',
        duration: '5 business days',
      },
      {
        slug: 'language-preparation',
        name: 'German Language Mastery (Goethe / telc A1 - B2)',
        description: 'Intensive Goethe-Institut curriculum with certified German native trainers tailored for visa interview requirements.',
        category: 'LANGUAGE',
        duration: '12 weeks',
      },
      {
        slug: 'cv-application-support',
        name: 'German Lebenslauf & Cover Letter Engineering',
        description: 'Adapting Indian CVs to strict German DIN 5008 standards with ATS keyword optimization for German HR portals.',
        category: 'APPLICATION',
        duration: '3 business days',
      },
      {
        slug: 'consultant-appointment',
        name: 'Dedicated Senior Consultant Appointment',
        description: 'Direct 45-minute strategic evaluation with an Educaro Germany migration and education consultant.',
        category: 'CONSULTATION',
        duration: '45 minutes',
      },
    ];
  }
}
