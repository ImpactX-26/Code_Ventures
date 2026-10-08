import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApplicantsService } from './applicants.service.js';
import { CreateApplicantDto } from './dto/create-applicant.dto.js';

@Controller('api/applicants')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Get()
  async getAll() {
    return this.applicantsService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.applicantsService.findOne(id);
  }

  @Get(':id/export-dossier')
  async exportDossier(@Param('id') id: string) {
    return this.applicantsService.compileDossier(id);
  }

  @Post()
  async create(@Body() createDto: CreateApplicantDto) {
    return this.applicantsService.create(createDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() patch: any) {
    return this.applicantsService.update(id, patch);
  }

  @Post(':id/reset-demo')
  async resetDemo(@Param('id') id: string) {
    return this.applicantsService.resetToDemo(id);
  }

  @Post(':id/educations')
  async addEducation(@Param('id') id: string, @Body() eduData: any) {
    return this.applicantsService.addEducation(id, eduData);
  }

  @Post(':id/employments')
  async addEmployment(@Param('id') id: string, @Body() empData: any) {
    return this.applicantsService.addEmployment(id, empData);
  }

  @Post(':id/languages')
  async addLanguage(@Param('id') id: string, @Body() langData: any) {
    return this.applicantsService.addLanguage(id, langData);
  }
}
