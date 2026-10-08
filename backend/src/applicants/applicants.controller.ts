import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApplicantsService } from './applicants.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/auth.decorators.js';
import { Pathway } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('applicants')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Get(':id')
  async getApplicant(@Param('id') id: string) {
    return this.applicantsService.getApplicantById(id);
  }

  @Patch(':id')
  async updateApplicant(@Param('id') id: string, @Body() data: any) {
    return this.applicantsService.updateApplicant(id, data);
  }

  @Post(':id/goal')
  async setGoal(
    @Param('id') id: string,
    @Body() body: { pathway: Pathway; preferredField?: string; targetIntake?: string; motivation?: string; timeline?: string },
  ) {
    return this.applicantsService.setGoal(id, body.pathway, body);
  }

  @Get(':id/profile')
  async getProfile(@Param('id') id: string) {
    return this.applicantsService.getApplicantById(id);
  }

  @Patch(':id/profile')
  async updateProfile(@Param('id') id: string, @Body() body: any) {
    return this.applicantsService.updateProfile(id, body);
  }

  @Get(':id/completeness')
  async getCompleteness(@Param('id') id: string) {
    return this.applicantsService.getCompleteness(id);
  }

  @Get(':id/agent-runs')
  async getAgentRuns(@Param('id') id: string) {
    return this.applicantsService.getAgentRuns(id);
  }
}
