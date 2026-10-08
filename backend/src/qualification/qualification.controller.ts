import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { QualificationService } from './qualification.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('applicants')
export class QualificationController {
  constructor(private readonly qualificationService: QualificationService) {}

  @Post(':id/qualification/assess')
  async assessQualification(@Param('id') applicantId: string) {
    return this.qualificationService.assessQualification(applicantId);
  }

  @Get(':id/qualification')
  async getQualification(@Param('id') applicantId: string) {
    return this.qualificationService.getLatestQualification(applicantId);
  }
}
