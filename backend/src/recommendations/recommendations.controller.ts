import { Controller, Get, Post, Param, Body, NotFoundException } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { calculateBavarianGpa } from '../common/bavarian-calculator.js';

@Controller('api/recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get(':applicantId')
  async getRecommendation(@Param('applicantId') applicantId: string) {
    const applicant = await this.prisma.getApplicantById(applicantId);
    if (!applicant) {
      throw new NotFoundException(`Applicant with ID ${applicantId} not found`);
    }

    const evaluation = this.recommendationsService.evaluateProfile(applicant);
    applicant.recommendation = {
      ...applicant.recommendation,
      ...evaluation,
      updatedAt: new Date(),
    };
    return applicant.recommendation;
  }

  @Post(':applicantId/recalculate')
  async recalculateRecommendation(@Param('applicantId') applicantId: string) {
    const applicant = await this.prisma.getApplicantById(applicantId);
    if (!applicant) {
      throw new NotFoundException(`Applicant with ID ${applicantId} not found`);
    }

    const evaluation = this.recommendationsService.evaluateProfile(applicant);
    applicant.recommendation = {
      id: applicant.recommendation?.id || `rec-${applicant.id}`,
      applicantId: applicant.id,
      ...evaluation,
      updatedAt: new Date(),
    };

    await this.prisma.updateApplicant(applicantId, {
      recommendation: applicant.recommendation,
    });

    return applicant.recommendation;
  }

  @Get(':applicantId/pathway-comparison')
  async getPathwayComparison(@Param('applicantId') applicantId: string) {
    const applicant = await this.prisma.getApplicantById(applicantId);
    if (!applicant) {
      throw new NotFoundException(`Applicant with ID ${applicantId} not found`);
    }

    return this.recommendationsService.simulateAllPathways(applicant);
  }

  @Post(':applicantId/simulate-what-if')
  async simulateWhatIf(
    @Param('applicantId') applicantId: string,
    @Body() overrides: {
      germanLevel?: string;
      gpaOrPercentage?: number;
      experienceMonths?: number;
      hasApsCertificate?: boolean;
      goalTrack?: 'Study' | 'Ausbildung' | 'Employment';
    },
  ) {
    const applicant = await this.prisma.getApplicantById(applicantId);
    if (!applicant) {
      throw new NotFoundException(`Applicant with ID ${applicantId} not found`);
    }

    return this.recommendationsService.simulateAllPathways(applicant, overrides);
  }

  @Post('calculate-bavarian-gpa')
  calculateGpa(
    @Body() body: { score: number; maxScore?: number; minPassingScore?: number },
  ) {
    const { score, maxScore = 10, minPassingScore = 4 } = body;
    return calculateBavarianGpa(score, maxScore, minPassingScore);
  }
}
