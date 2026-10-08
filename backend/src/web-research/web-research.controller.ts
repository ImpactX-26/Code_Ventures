import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { WebResearchService } from './web-research.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('applicants')
export class WebResearchController {
  constructor(private readonly researchService: WebResearchService) {}

  @Post(':id/research')
  async triggerResearch(@Param('id') applicantId: string, @Body('query') query?: string) {
    return this.researchService.triggerResearch(applicantId, query);
  }

  @Get(':id/research')
  async getResearch(@Param('id') applicantId: string) {
    return this.researchService.getResearchForApplicant(applicantId);
  }
}
