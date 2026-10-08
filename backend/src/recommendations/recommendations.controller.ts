import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { Public } from '../common/decorators/auth.decorators.js';

@Controller()
export class RecommendationsController {
  constructor(private readonly recService: RecommendationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('applicants/:id/recommendation')
  async getRecommendation(@Param('id') applicantId: string) {
    return this.recService.getRecommendation(applicantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('applicants/:id/recommendation/refresh')
  async refreshRecommendation(@Param('id') applicantId: string) {
    return this.recService.refreshRecommendation(applicantId);
  }

  @Public()
  @Get('services')
  async getServicesCatalog() {
    return this.recService.getServicesCatalog();
  }
}
