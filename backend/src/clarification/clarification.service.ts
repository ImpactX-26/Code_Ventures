import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { ApplicantOrchestratorService } from '../ai/orchestrator/applicant-orchestrator.service.js';
import { ClarificationStatus } from '@prisma/client';

@Injectable()
export class ClarificationService {
  private readonly logger = new Logger(ClarificationService.name);
  private inMemQuestions: Map<string, any[]> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: ApplicantOrchestratorService,
  ) {}

  async getQuestions(applicantId: string) {
    if (this.prisma.isConnected) {
      const tasks = await this.prisma.clarificationTask.findMany({
        where: { applicantId, status: ClarificationStatus.PENDING },
        orderBy: { createdAt: 'desc' },
      });
      return tasks;
    }

    const inMem = this.inMemQuestions.get(applicantId);
    if (inMem) {
      return inMem.filter((q) => q.status === ClarificationStatus.PENDING);
    }

    // Default questions
    const applicant = await this.prisma.isConnected
      ? await this.prisma.applicant.findUnique({ where: { id: applicantId } })
      : null;
    return this.orchestrator.clarificationAgent.generateClarifications(applicant, []);
  }

  async answerQuestion(
    questionId: string,
    body: { selectedOption?: string; customAnswer?: string; applicantId?: string },
  ) {
    this.logger.log(`Answering clarification question: ${questionId}`);

    if (this.prisma.isConnected) {
      const task = await this.prisma.clarificationTask.findUnique({
        where: { id: questionId },
      });

      if (!task) {
        throw new NotFoundException('Clarification task not found');
      }

      const updated = await this.prisma.clarificationTask.update({
        where: { id: questionId },
        data: {
          status: ClarificationStatus.ANSWERED,
          selectedOption: body.selectedOption,
          customAnswer: body.customAnswer,
          answeredAt: new Date(),
        },
      });

      // Update applicant profile based on answer
      if (task.question.toLowerCase().includes('german')) {
        const selected = body.selectedOption || '';
        let level = 'A1';
        let hasCert = false;
        if (selected.includes('official certificate')) {
          level = 'B1';
          hasCert = true;
        } else if (selected.includes('currently enrolled')) {
          level = 'A2';
        }

        const existingLang = await this.prisma.applicantLanguage.findFirst({
          where: { applicantId: task.applicantId, languageName: 'German' },
        });

        if (existingLang) {
          await this.prisma.applicantLanguage.update({
            where: { id: existingLang.id },
            data: { proficiency: level, hasCertificate: hasCert },
          });
        } else {
          await this.prisma.applicantLanguage.create({
            data: {
              applicantId: task.applicantId,
              languageName: 'German',
              proficiency: level,
              hasCertificate: hasCert,
            },
          });
        }
      }

      // Re-run orchestrator
      await this.orchestrator.runFullJourneyCycle(task.applicantId);
      return updated;
    }

    return {
      id: questionId,
      status: ClarificationStatus.ANSWERED,
      selectedOption: body.selectedOption,
      customAnswer: body.customAnswer,
    };
  }
}
