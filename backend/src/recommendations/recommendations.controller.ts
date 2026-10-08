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

  @Post('calculate-bavarian-gpa')
  calculateGpa(
    @Body() body: { score: number; maxScore?: number; minPassingScore?: number },
  ) {
    const { score, maxScore = 10, minPassingScore = 4 } = body;
    return calculateBavarianGpa(score, maxScore, minPassingScore);
  }
}
