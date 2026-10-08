import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { CvService } from './cv.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('applicants')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post(':id/cv/generate')
  async generateCv(@Param('id') applicantId: string, @Body('template') template?: string) {
    return this.cvService.generateCv(applicantId, template);
  }

  @Get(':id/cv')
  async getCv(@Param('id') applicantId: string) {
    return this.cvService.getLatestCv(applicantId);
  }
}
