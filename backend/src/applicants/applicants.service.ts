import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RecommendationsService } from '../recommendations/recommendations.service.js';
import { calculateBavarianGpa } from '../common/bavarian-calculator.js';

@Injectable()
export class ApplicantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  async findAll() {
    return this.prisma.getAllApplicants();
  }

  async findOne(id: string) {
    const applicant = await this.prisma.getApplicantById(id);
    if (!applicant) {
      throw new NotFoundException(`Applicant with ID ${id} not found`);
    }
    // Re-evaluate live recommendation & completeness
    const evalResult = this.recommendationsService.evaluateProfile(applicant);
    applicant.recommendation = {
      ...applicant.recommendation,
      ...evalResult,
    };
    return applicant;
  }

  async create(data: any) {
    const applicant = await this.prisma.createApplicant(data);
    const evalResult = this.recommendationsService.evaluateProfile(applicant);
    applicant.recommendation = {
      id: `rec-${applicant.id}`,
      applicantId: applicant.id,
      ...evalResult,
      generatedAt: new Date(),
      updatedAt: new Date(),
    };
    await this.prisma.updateApplicant(applicant.id, { recommendation: applicant.recommendation });
    return applicant;
  }

  async update(id: string, patch: any) {
    const applicant = await this.findOne(id);
    const updated = await this.prisma.updateApplicant(id, patch);
    const evalResult = this.recommendationsService.evaluateProfile(updated);
    updated.recommendation = {
      ...updated.recommendation,
      ...evalResult,
      updatedAt: new Date(),
    };
    await this.prisma.updateApplicant(id, { recommendation: updated.recommendation });
    return updated;
  }

  async resetToDemo(id: string) {
    const reset = await this.prisma.resetApplicantToSeed(id);
    if (!reset) {
      throw new NotFoundException(`Demo applicant with ID ${id} not found`);
    }
    return reset;
  }

  async addEducation(applicantId: string, eduData: any) {
    const applicant = await this.findOne(applicantId);

    // Calculate Bavarian GPA if not already present
    let bavarianGpa = eduData.germanGpaEquivalent;
    if (!bavarianGpa && eduData.gpaOrPercentage) {
      const calc = calculateBavarianGpa(
        eduData.gpaOrPercentage,
        eduData.maxGpaOrScale || 10,
        eduData.maxGpaOrScale === 100 ? 40 : 4,
      );
      bavarianGpa = calc.germanGrade;
    }

    const newEdu = {
      id: eduData.id || `edu-${Date.now()}`,
      applicantId,
      institution: eduData.institution,
      qualification: eduData.qualification,
      fieldOfStudy: eduData.fieldOfStudy || null,
      startYear: eduData.startYear ? Number(eduData.startYear) : null,
      graduationYear: eduData.graduationYear ? Number(eduData.graduationYear) : null,
      gpaOrPercentage: eduData.gpaOrPercentage ? Number(eduData.gpaOrPercentage) : null,
      maxGpaOrScale: eduData.maxGpaOrScale ? Number(eduData.maxGpaOrScale) : 10.0,
      germanGpaEquivalent: bavarianGpa || null,
      gradingSystem: eduData.gradingSystem || 'CGPA_10',
      isIndianDegree: eduData.isIndianDegree ?? true,
      degreeType: eduData.degreeType || 'FOUR_YEAR_BACHELOR',
      anabinStatus: eduData.anabinStatus || 'H+',
      isVerified: eduData.isVerified ?? false,
      provenance: eduData.provenance || 'APPLICANT_PROVIDED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!applicant.educations) applicant.educations = [];
    applicant.educations.push(newEdu);

    // Re-evaluate
    const evalResult = this.recommendationsService.evaluateProfile(applicant);
    applicant.recommendation = {
      ...applicant.recommendation,
      ...evalResult,
      updatedAt: new Date(),
    };

    await this.prisma.updateApplicant(applicantId, {
      educations: applicant.educations,
      recommendation: applicant.recommendation,
    });

    return newEdu;
  }

  async addEmployment(applicantId: string, empData: any) {
    const applicant = await this.findOne(applicantId);

    const newEmp = {
      id: empData.id || `emp-${Date.now()}`,
      applicantId,
      employer: empData.employer,
      role: empData.role,
      responsibilities: empData.responsibilities || null,
      startDate: empData.startDate ? new Date(empData.startDate) : null,
      endDate: empData.endDate ? new Date(empData.endDate) : null,
      isCurrent: empData.isCurrent ?? false,
      totalMonths: empData.totalMonths ? Number(empData.totalMonths) : null,
      industry: empData.industry || 'IT / Software',
      isVerified: empData.isVerified ?? false,
      provenance: empData.provenance || 'APPLICANT_PROVIDED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!applicant.employments) applicant.employments = [];
    applicant.employments.push(newEmp);

    const evalResult = this.recommendationsService.evaluateProfile(applicant);
    applicant.recommendation = {
      ...applicant.recommendation,
      ...evalResult,
      updatedAt: new Date(),
    };

    await this.prisma.updateApplicant(applicantId, {
      employments: applicant.employments,
      recommendation: applicant.recommendation,
    });

    return newEmp;
  }

  async addLanguage(applicantId: string, langData: any) {
    const applicant = await this.findOne(applicantId);

    const newLang = {
      id: langData.id || `lang-${Date.now()}`,
      applicantId,
      language: langData.language,
      level: langData.level,
      certificateName: langData.certificateName || null,
      score: langData.score || null,
      isVerified: langData.isVerified ?? false,
      provenance: langData.provenance || 'APPLICANT_PROVIDED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!applicant.languages) applicant.languages = [];
    // Replace or push
    const existingIdx = applicant.languages.findIndex(
      (l: any) => l.language?.toLowerCase() === langData.language?.toLowerCase(),
    );
    if (existingIdx !== -1) {
      applicant.languages[existingIdx] = newLang;
    } else {
      applicant.languages.push(newLang);
    }

    const evalResult = this.recommendationsService.evaluateProfile(applicant);
    applicant.recommendation = {
      ...applicant.recommendation,
      ...evalResult,
      updatedAt: new Date(),
    };

    await this.prisma.updateApplicant(applicantId, {
      languages: applicant.languages,
      recommendation: applicant.recommendation,
    });

    return newLang;
  }
}
