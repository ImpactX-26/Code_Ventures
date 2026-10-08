import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { UserRole } from '@prisma/client';

@Injectable()
export class ConsultantService {
  private readonly logger = new Logger(ConsultantService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics() {
    if (this.prisma.isConnected) {
      const totalApplicants = await this.prisma.applicant.count();
      const readyCount = await this.prisma.applicant.count({ where: { qualificationStatus: 'READY' } });
      const additionalReqsCount = await this.prisma.applicant.count({
        where: { qualificationStatus: 'ADDITIONAL_REQUIREMENTS_NEEDED' },
      });
      const notReadyCount = await this.prisma.applicant.count({ where: { qualificationStatus: 'NOT_READY' } });
      const pendingConflicts = await this.prisma.documentConflict.count({ where: { status: 'OPEN' } });

      return {
        totalApplicants,
        readyCount,
        additionalReqsCount,
        notReadyCount,
        pendingConflicts,
        systemStatus: 'ONLINE_ACTIVE',
      };
    }

    return {
      totalApplicants: 12,
      readyCount: 4,
      additionalReqsCount: 6,
      notReadyCount: 2,
      pendingConflicts: 1,
      systemStatus: 'LOCAL_DEV_SIMULATED',
    };
  }

  async getAllApplicants() {
    if (this.prisma.isConnected) {
      const applicants = await this.prisma.applicant.findMany({
        include: {
          user: { select: { email: true, status: true, emailVerified: true } },
          goals: true,
          documents: true,
          documentConflicts: true,
          qualificationAssessments: { orderBy: { createdAt: 'desc' }, take: 1 },
          recommendations: { where: { status: 'ACTIVE' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
      });

      return applicants.map((a) => ({
        id: a.id,
        fullName: a.fullName,
        email: a.user?.email,
        targetPathway: a.targetPathway || 'STUDY',
        profileCompleteness: a.profileCompleteness,
        qualificationStatus: a.qualificationStatus,
        documentsCount: a.documents.length,
        openConflictsCount: a.documentConflicts.filter((c) => c.status === 'OPEN').length,
        recommendedStep: a.recommendations[0]?.recommendedStep || 'Complete Profile',
        missingRequirements: (a.qualificationAssessments[0]?.missingRequirements as any) || [],
        createdAt: a.createdAt,
      }));
    }

    return [
      {
        id: 'app-sample-1',
        fullName: 'Arun Kumar',
        email: 'arun.kumar@gmail.com',
        targetPathway: 'STUDY',
        profileCompleteness: 85,
        qualificationStatus: 'ADDITIONAL_REQUIREMENTS_NEEDED',
        documentsCount: 3,
        openConflictsCount: 1,
        recommendedStep: 'Enroll in German Language Mastery (Target B1/B2)',
        missingRequirements: ['Proof of German Language Proficiency (Goethe B1/B2)'],
        createdAt: new Date(),
      },
      {
        id: 'app-sample-2',
        fullName: 'Priya Sharma',
        email: 'priya.sharma@outlook.com',
        targetPathway: 'VOCATIONAL',
        profileCompleteness: 92,
        qualificationStatus: 'READY',
        documentsCount: 4,
        openConflictsCount: 0,
        recommendedStep: 'Book 1-on-1 Germany Vocational Strategic Consultation',
        missingRequirements: [],
        createdAt: new Date(),
      },
    ];
  }

  async getApplicantDetail(id: string) {
    if (this.prisma.isConnected) {
      const applicant = await this.prisma.applicant.findUnique({
        where: { id },
        include: {
          user: true,
          goals: true,
          educationRecords: true,
          employmentRecords: true,
          applicantSkills: true,
          applicantLanguages: true,
          documents: { include: { extractions: true } },
          documentConflicts: true,
          clarificationTasks: true,
          qualificationAssessments: { orderBy: { createdAt: 'desc' }, take: 5 },
          recommendations: { orderBy: { createdAt: 'desc' }, take: 5 },
          researchSources: { orderBy: { createdAt: 'desc' }, take: 10 },
          agentActions: { orderBy: { timestamp: 'desc' }, take: 30 },
          videoSubmissions: { include: { insights: true, transcripts: true } },
        },
      });

      if (!applicant) {
        throw new NotFoundException('Applicant not found');
      }

      return applicant;
    }

    // In-memory sample detail
    return {
      id,
      fullName: 'Arun Kumar',
      targetPathway: 'STUDY',
      profileCompleteness: 85,
      qualificationStatus: 'ADDITIONAL_REQUIREMENTS_NEEDED',
      user: { email: 'arun.kumar@gmail.com', emailVerified: true },
      goals: [{ pathway: 'STUDY', targetIntake: 'Winter 2025', motivation: 'Aspiring to study Computer Science in Germany' }],
      educationRecords: [{ institution: 'Anna University', degree: 'B.Tech IT', graduationDate: '2024', gradeCgpa: '8.4 CGPA' }],
      employmentRecords: [{ employer: 'Infosys', role: 'Systems Engineer', responsibilities: 'Java Backend Services' }],
      applicantSkills: [{ skillName: 'Java' }, { skillName: 'Spring Boot' }, { skillName: 'PostgreSQL' }],
      applicantLanguages: [{ languageName: 'English', proficiency: 'Fluent' }, { languageName: 'German', proficiency: 'A2' }],
      documents: [],
      documentConflicts: [],
      clarificationTasks: [],
      qualificationAssessments: [],
      recommendations: [],
      researchSources: [],
      agentActions: [],
    };
  }
}
