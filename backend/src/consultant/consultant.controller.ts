import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ConsultantService } from './consultant.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/auth.decorators.js';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CONSULTANT, UserRole.ADMIN)
@Controller('consultants')
export class ConsultantController {
  constructor(private readonly consultantService: ConsultantService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.consultantService.getDashboardMetrics();
  }

  @Get('applicants')
  async getApplicants() {
    return this.consultantService.getAllApplicants();
  }

  @Get('applicants/:id')
  async getApplicantDetail(@Param('id') id: string) {
    return this.consultantService.getApplicantDetail(id);
  }
}
