import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SEED_APPLICANTS } from './seed-data.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isConnectedToDb = false;
  // In-memory fallback store initialized with realistic Indian applicant profiles
  public memoryStore: any[] = JSON.parse(JSON.stringify(SEED_APPLICANTS));
  public chatHistoryStore: Map<string, any[]> = new Map();

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnectedToDb = true;
      this.logger.log(' Connected to PostgreSQL database successfully via Prisma ORM.');
      await this.ensureSeedDataInPostgres();
    } catch (error) {
      this.isConnectedToDb = false;
      this.logger.warn(
        ` PostgreSQL connection unavailable (${(error as Error).message}). Activating High-Speed Resilient In-Memory Data Store populated with realistic Indian applicant profiles.`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.isConnectedToDb) {
      await this.$disconnect();
    }
  }

  private async ensureSeedDataInPostgres() {
    try {
      const count = await this.applicantProfile.count();
      if (count === 0) {
        this.logger.log('Seeding PostgreSQL with initial Indian applicant profiles...');
        for (const applicant of SEED_APPLICANTS) {
          const { educations, employments, languages, documents, motivationMedia, recommendation, ...profileData } =
            applicant;

          await this.applicantProfile.create({
            data: {
              ...profileData,
              educations: {
                create: educations.map((e) => {
                  const { applicantId, ...rest } = e;
                  return rest;
                }),
              },
              employments: {
                create: employments.map((emp) => {
                  const { applicantId, ...rest } = emp;
                  return rest;
                }),
              },
              languages: {
                create: languages.map((lang) => {
                  const { applicantId, ...rest } = lang;
                  return rest;
                }),
              },
              documents: {
                create: documents.map((doc) => {
                  const { applicantId, ...rest } = doc;
                  return rest;
                }),
              },
              motivationMedia: motivationMedia
                ? {
                    create: {
                      primaryReasonToMigrate: motivationMedia.primaryReasonToMigrate,
                      targetRegionsInGermany: motivationMedia.targetRegionsInGermany,
                      longTermCareerGoals: motivationMedia.longTermCareerGoals,
                      preferredLanguageOfStudyWork: motivationMedia.preferredLanguageOfStudyWork,
                      introVideoUrl: motivationMedia.introVideoUrl,
                      introVideoTranscript: motivationMedia.introVideoTranscript,
                      audioTranscript: motivationMedia.audioTranscript,
                      sentimentScore: motivationMedia.sentimentScore,
                      motivationKeywords: motivationMedia.motivationKeywords,
                      videoDurationSeconds: motivationMedia.videoDurationSeconds,
                      provenance: motivationMedia.provenance,
                    },
                  }
                : undefined,
              recommendation: recommendation
                ? {
                    create: {
                      eligibilityStatus: recommendation.eligibilityStatus,
                      completenessScore: recommendation.completenessScore,
                      pathwaySummary: recommendation.pathwaySummary,
                      missingRequirements: recommendation.missingRequirements,
                      anabinInstitutionalStatus: recommendation.anabinInstitutionalStatus,
                      apsRequired: recommendation.apsRequired,
                      educaroServiceRouting: recommendation.educaroServiceRouting,
                      actionableNextSteps: recommendation.actionableNextSteps,
                      aiSummaryNotes: recommendation.aiSummaryNotes,
                    },
                  }
                : undefined,
            },
          });
        }
        this.logger.log('PostgreSQL seed data successfully populated.');
      }
    } catch (e) {
      this.logger.warn(`Could not seed PostgreSQL (tables might require migration): ${(e as Error).message}`);
    }
  }

  // --- Resilient Helper Methods that work across both PostgreSQL & In-Memory Mode ---

  async getAllApplicants() {
    if (this.isConnectedToDb) {
      try {
        return await this.applicantProfile.findMany({
          include: {
            educations: true,
            employments: true,
            languages: true,
            documents: true,
            motivationMedia: true,
            recommendation: true,
          },
          orderBy: { createdAt: 'desc' },
        });
      } catch (err) {
        this.logger.warn('Error reading from DB, falling back to memory store: ' + (err as Error).message);
      }
    }
    return this.memoryStore;
  }

  async getApplicantById(id: string) {
    if (this.isConnectedToDb) {
      try {
        const profile = await this.applicantProfile.findUnique({
          where: { id },
          include: {
            educations: true,
            employments: true,
            languages: true,
            documents: true,
            motivationMedia: true,
            recommendation: true,
          },
        });
        if (profile) return profile;
      } catch (err) {
        this.logger.warn('Error querying applicant from DB: ' + (err as Error).message);
      }
    }
    const found = this.memoryStore.find((a) => a.id === id);
    if (found) return found;
    // Default to first applicant if id not found
    return this.memoryStore[0];
  }

  async createApplicant(data: any) {
    const id = data.id || `applicant-${Date.now()}`;
    const newApplicant = {
      id,
      fullName: data.fullName || 'New Applicant',
      email: data.email || `applicant-${Date.now()}@example.com`,
      phone: data.phone || null,
      city: data.city || 'Mumbai',
      state: data.state || 'Maharashtra',
      country: 'India',
      targetIntake: data.targetIntake || 'Winter Semester 2025/26',
      availabilityDate: data.availabilityDate ? new Date(data.availabilityDate) : new Date(),
      goalTrack: data.goalTrack || 'Study',
      status: 'ONBOARDING',
      provenance: data.provenance || 'APPLICANT_PROVIDED',
      createdAt: new Date(),
      updatedAt: new Date(),
      educations: data.educations || [],
      employments: data.employments || [],
      languages: data.languages || [],
      documents: data.documents || [],
      motivationMedia: data.motivationMedia || null,
      recommendation: data.recommendation || {
        id: `rec-${id}`,
        applicantId: id,
        eligibilityStatus: 'NEEDS_ASSESSMENT',
        completenessScore: 35,
        pathwaySummary: 'Assessment in progress',
        missingRequirements: [],
        anabinInstitutionalStatus: 'PENDING_CHECK',
        apsRequired: data.goalTrack === 'Study',
        educaroServiceRouting: [],
        actionableNextSteps: [],
        aiSummaryNotes: 'Profile created. Conversational assessment ongoing.',
        generatedAt: new Date(),
        updatedAt: new Date(),
      },
    };

    if (this.isConnectedToDb) {
      try {
        await this.applicantProfile.create({
          data: {
            id: newApplicant.id,
            fullName: newApplicant.fullName,
            email: newApplicant.email,
            phone: newApplicant.phone,
            city: newApplicant.city,
            state: newApplicant.state,
            country: newApplicant.country,
            targetIntake: newApplicant.targetIntake,
            goalTrack: newApplicant.goalTrack,
            status: newApplicant.status as any,
            provenance: newApplicant.provenance as any,
          },
        });
      } catch (err) {
        this.logger.warn('Failed to insert new applicant into DB, saving in-memory: ' + (err as Error).message);
      }
    }

    this.memoryStore.unshift(newApplicant);
    return newApplicant;
  }

  async updateApplicant(id: string, patch: any) {
    const applicant = await this.getApplicantById(id);
    if (!applicant) return null;

    Object.assign(applicant, patch);
    applicant.updatedAt = new Date();

    if (this.isConnectedToDb) {
      try {
        const { educations, employments, languages, documents, motivationMedia, recommendation, ...directFields } = patch;
        await this.applicantProfile.update({
          where: { id },
          data: directFields,
        });
      } catch (err) {
        this.logger.warn('Could not sync update to DB: ' + (err as Error).message);
      }
    }

    return applicant;
  }

  async resetApplicantToSeed(id: string) {
    const seed = SEED_APPLICANTS.find((a) => a.id === id);
    if (!seed) return null;
    const index = this.memoryStore.findIndex((a) => a.id === id);
    const cloned = JSON.parse(JSON.stringify(seed));
    if (index !== -1) {
      this.memoryStore[index] = cloned;
    } else {
      this.memoryStore.push(cloned);
    }
    return cloned;
  }
}
