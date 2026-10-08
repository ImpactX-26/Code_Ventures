import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { QualificationAgent } from '../ai/agents/qualification.agent.js';
import { ApplicantOrchestratorService } from '../ai/orchestrator/applicant-orchestrator.service.js';
import { Pathway } from '@prisma/client';

@Injectable()
export class QualificationService {
  private readonly logger = new Logger(QualificationService.name);
  private inMemAssessments: Map<string, any> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly qualificationAgent: QualificationAgent,
    private readonly orchestrator: ApplicantOrchestratorService,
  ) {}

  async assessQualification(applicantId: string) {
    const orchestratorResult = await this.orchestrator.runFullJourneyCycle(applicantId);
    return orchestratorResult.qualification;
  }

  async getLatestQualification(applicantId: string) {
    if (this.prisma.isConnected) {
      const assessment = await this.prisma.qualificationAssessment.findFirst({
        where: { applicantId },
        orderBy: { createdAt: 'desc' },
      });

      if (assessment) {
        return assessment;
      }
    }

    return this.assessQualification(applicantId);
  }
}
