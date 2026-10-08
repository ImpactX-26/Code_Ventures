import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { ApplicantOrchestratorService } from '../ai/orchestrator/applicant-orchestrator.service.js';
import { Pathway, SourceType } from '@prisma/client';

@Injectable()
export class ApplicantsService {
  private readonly logger = new Logger(ApplicantsService.name);

  // In-memory applicants cache for demo/offline fallback
  private inMemApplicants: Map<string, any> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: ApplicantOrchestratorService,
  ) {}

  async getApplicantById(id: string) {
    if (this.prisma.isConnected) {
      const applicant = await this.prisma.applicant.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, email: true, role: true, status: true, emailVerified: true } },
          goals: true,
          educationRecords: true,
          employmentRecords: true,
          applicantSkills: true,
          applicantLanguages: true,
          documents: { include: { extractions: true } },
          documentConflicts: true,
          clarificationTasks: true,
          qualificationAssessments: { orderBy: { createdAt: 'desc' }, take: 1 },
          recommendations: { where: { status: 'ACTIVE' }, take: 1 },
          videoSubmissions: { include: { insights: true, transcripts: true } },
        },
      });

      if (applicant) {
        return applicant;
      }
    }

    const inMem = this.inMemApplicants.get(id);
    if (inMem) {
      return inMem;
    }

    // Default template applicant
    return {
      id,
      userId: 'user-default',
      fullName: 'Germany Applicant',
      targetPathway: Pathway.STUDY,
      profileCompleteness: 35,
      qualificationStatus: 'PENDING',
      goals: [],
      educationRecords: [],
      employmentRecords: [],
      applicantSkills: [],
      applicantLanguages: [],
      documents: [],
      documentConflicts: [],
      clarificationTasks: [],
      qualificationAssessments: [],
      recommendations: [],
    };
  }

  async updateApplicant(id: string, data: any) {
    if (this.prisma.isConnected) {
      try {
        const updated = await this.prisma.applicant.update({
          where: { id },
          data: {
            fullName: data.fullName,
            phone: data.phone,
            location: data.location,
            targetPathway: data.targetPathway,
          },
        });

        // Trigger orchestrator full cycle after updating core info
        await this.orchestrator.runFullJourneyCycle(id);
        return updated;
      } catch (err) {
        this.logger.error(`Error updating applicant in DB: ${(err as Error).message}`);
      }
    }

    let applicant = this.inMemApplicants.get(id) || { id, ...data };
    applicant = { ...applicant, ...data };
    this.inMemApplicants.set(id, applicant);
    return applicant;
  }

  async setGoal(applicantId: string, pathway: Pathway, details: any) {
    if (this.prisma.isConnected) {
      await this.prisma.applicant.update({
        where: { id: applicantId },
        data: { targetPathway: pathway },
      });

      // Clear old goals or add new
      await this.prisma.applicantGoal.deleteMany({ where: { applicantId } });
      await this.prisma.applicantGoal.create({
        data: {
          applicantId,
          pathway,
          preferredField: details.preferredField,
          targetIntake: details.targetIntake,
          motivation: details.motivation,
          timeline: details.timeline,
        },
      });

      return this.orchestrator.runFullJourneyCycle(applicantId);
    }

    const applicant = await this.getApplicantById(applicantId);
    applicant.targetPathway = pathway;
    applicant.goals = [
      {
        pathway,
        preferredField: details.preferredField,
        targetIntake: details.targetIntake,
        motivation: details.motivation,
        timeline: details.timeline,
      },
    ];
    this.inMemApplicants.set(applicantId, applicant);
    return this.orchestrator.runFullJourneyCycle(applicantId);
  }

  async updateProfile(applicantId: string, profileData: any) {
    if (this.prisma.isConnected) {
      // 1. Personal details
      await this.prisma.applicant.update({
        where: { id: applicantId },
        data: {
          fullName: profileData.fullName,
          phone: profileData.phone,
          location: profileData.location,
        },
      });

      // 2. Education records
      if (profileData.educationRecords && profileData.educationRecords.length > 0) {
        await this.prisma.educationRecord.deleteMany({ where: { applicantId } });
        for (const edu of profileData.educationRecords) {
          if (edu.degree && edu.institution) {
            await this.prisma.educationRecord.create({
              data: {
                applicantId,
                institution: edu.institution,
                degree: edu.degree,
                fieldOfStudy: edu.fieldOfStudy || 'General',
                graduationDate: edu.graduationDate,
                gradeCgpa: edu.gradeCgpa,
                source: SourceType.APPLICANT_PROVIDED,
                verified: false,
              },
            });
          }
        }
      }

      // 3. Employment records
      if (profileData.employmentRecords && profileData.employmentRecords.length > 0) {
        await this.prisma.employmentRecord.deleteMany({ where: { applicantId } });
        for (const emp of profileData.employmentRecords) {
          if (emp.employer && emp.role) {
            await this.prisma.employmentRecord.create({
              data: {
                applicantId,
                employer: emp.employer,
                role: emp.role,
                responsibilities: emp.responsibilities,
                startDate: emp.startDate,
                endDate: emp.endDate,
                isCurrent: Boolean(emp.isCurrent),
                source: SourceType.APPLICANT_PROVIDED,
                verified: false,
              },
            });
          }
        }
      }

      // 4. Skills
      if (profileData.applicantSkills && profileData.applicantSkills.length > 0) {
        await this.prisma.applicantSkill.deleteMany({ where: { applicantId } });
        for (const s of profileData.applicantSkills) {
          const sName = typeof s === 'string' ? s : s.skillName;
          if (sName) {
            await this.prisma.applicantSkill.create({
              data: {
                applicantId,
                skillName: sName,
                level: typeof s === 'object' ? s.level || 'Intermediate' : 'Intermediate',
                source: SourceType.APPLICANT_PROVIDED,
                verified: false,
              },
            });
          }
        }
      }

      // 5. Languages
      if (profileData.applicantLanguages && profileData.applicantLanguages.length > 0) {
        await this.prisma.applicantLanguage.deleteMany({ where: { applicantId } });
        for (const l of profileData.applicantLanguages) {
          if (l.languageName && l.proficiency) {
            await this.prisma.applicantLanguage.create({
              data: {
                applicantId,
                languageName: l.languageName,
                proficiency: l.proficiency,
                hasCertificate: Boolean(l.hasCertificate),
                certificateType: l.certificateType,
                source: SourceType.APPLICANT_PROVIDED,
                verified: false,
              },
            });
          }
        }
      }

      // 6. Motivation / Goals
      if (profileData.motivation || profileData.targetIntake) {
        const goal = await this.prisma.applicantGoal.findFirst({ where: { applicantId } });
        if (goal) {
          await this.prisma.applicantGoal.update({
            where: { id: goal.id },
            data: {
              motivation: profileData.motivation || goal.motivation,
              targetIntake: profileData.targetIntake || goal.targetIntake,
              preferredField: profileData.preferredField || goal.preferredField,
            },
          });
        }
      }

      return this.orchestrator.runFullJourneyCycle(applicantId);
    }

    // In-memory update
    const applicant = await this.getApplicantById(applicantId);
    Object.assign(applicant, profileData);
    this.inMemApplicants.set(applicantId, applicant);
    return this.orchestrator.runFullJourneyCycle(applicantId);
  }

  async getCompleteness(applicantId: string) {
    const applicant = await this.getApplicantById(applicantId);
    return this.orchestrator.profileAgent.calculateCompleteness(applicant);
  }

  async getAgentRuns(applicantId: string) {
    return this.orchestrator.getAgentRuns(applicantId);
  }
}
