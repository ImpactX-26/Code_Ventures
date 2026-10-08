import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { CvAgent } from '../ai/agents/cv.agent.js';
import { ApplicantsService } from '../applicants/applicants.service.js';

@Injectable()
export class CvService {
  private readonly logger = new Logger(CvService.name);
  private inMemCv: Map<string, any> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cvAgent: CvAgent,
    private readonly applicantsService: ApplicantsService,
  ) {}

  async generateCv(applicantId: string, template = 'GERMAN_STANDARD') {
    let applicant: any = null;

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
        },
      });
    }

    if (!applicant) {
      applicant = await this.applicantsService.getApplicantById(applicantId);
    }

    const cvData = this.cvAgent.generateCv(applicant || { id: applicantId });

    if (this.prisma.isConnected) {
      const savedVersion = await this.prisma.cvVersion.create({
        data: {
          applicantId,
          title: `German Lebenslauf - ${cvData.applicantName} (${cvData.generatedDate})`,
          cvData: cvData as any,
          template,
        },
      });
      return savedVersion;
    }

    const mockSaved = {
      id: `cv-${Date.now()}`,
      applicantId,
      title: `German Lebenslauf - ${cvData.applicantName}`,
      cvData,
      template,
      createdAt: new Date(),
    };
    this.inMemCv.set(applicantId, mockSaved);
    return mockSaved;
  }

  async getLatestCv(applicantId: string) {
    if (this.prisma.isConnected) {
      const cv = await this.prisma.cvVersion.findFirst({
        where: { applicantId },
        orderBy: { createdAt: 'desc' },
      });
      if (cv) {
        return cv;
      }
    }

    const inMem = this.inMemCv.get(applicantId);
    if (inMem) {
      return inMem;
    }

    return this.generateCv(applicantId);
  }
}
