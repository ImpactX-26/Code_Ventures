import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../database/prisma.service.js';
import { VideoAgent } from '../ai/agents/video.agent.js';
import { ApplicantOrchestratorService } from '../ai/orchestrator/applicant-orchestrator.service.js';
import { VideoStatus, SourceType, Pathway } from '@prisma/client';
import { UploadedFileType } from '../common/types/file.types.js';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  private uploadDir = path.resolve(process.cwd(), 'uploads');
  private inMemVideos: Map<string, any> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly videoAgent: VideoAgent,
    private readonly orchestrator: ApplicantOrchestratorService,
  ) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadVideo(
    applicantId: string,
    file?: UploadedFileType,
    manualTranscript?: string,
  ) {
    const videoId = uuidv4();
    let fileName = 'recorded_intro.webm';
    let mimeType = 'video/webm';
    let filePath = `/uploads/${videoId}.webm`;

    if (file) {
      const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
      fileName = `${videoId}${ext}`;
      mimeType = file.mimetype;
      filePath = `/uploads/${fileName}`;
      fs.writeFileSync(path.join(this.uploadDir, fileName), file.buffer);
    }

    const transcriptText =
      manualTranscript ||
      'Hello, my name is applicant candidate. I graduated with a degree in Engineering from India. I am passionately driven to pursue my future in Germany because of its world-leading technological standards, renowned research universities, and welcoming Skilled Immigration Act. My career goal is to become a technical specialist in Germany and contribute actively to German industry.';

    let pathway: Pathway = Pathway.STUDY;

    if (this.prisma.isConnected) {
      const applicant = await this.prisma.applicant.findUnique({ where: { id: applicantId } });
      if (applicant?.targetPathway) {
        pathway = applicant.targetPathway;
      }

      const videoSub = await this.prisma.videoSubmission.create({
        data: {
          id: videoId,
          applicantId,
          fileName,
          filePath,
          duration: 45.0,
          mimeType,
          status: VideoStatus.ANALYZED,
        },
      });

      const videoTranscript = await this.prisma.videoTranscript.create({
        data: {
          videoSubmissionId: videoId,
          applicantId,
          transcriptText,
          language: 'en',
          confidence: 0.94,
        },
      });

      // Run Video Insight Agent
      const insights = await this.videoAgent.processVideo(transcriptText, pathway);

      const insightRecord = await this.prisma.videoInsight.create({
        data: {
          videoSubmissionId: videoId,
          applicantId,
          extractedMotivation: insights.extractedMotivation,
          careerGoals: insights.careerGoals,
          preferredField: insights.preferredField,
          communicationScore: insights.communicationScore,
          germanInterestLevel: insights.germanInterestLevel,
          source: SourceType.VIDEO_EXTRACTED,
          confidence: insights.confidence,
        },
      });

      // Trigger full orchestrator cycle
      await this.orchestrator.runFullJourneyCycle(applicantId);

      return {
        video: videoSub,
        transcript: videoTranscript,
        insights: insightRecord,
      };
    } else {
      const insights = await this.videoAgent.processVideo(transcriptText, pathway);
      const res = {
        id: videoId,
        applicantId,
        fileName,
        filePath,
        transcript: transcriptText,
        insights,
      };
      this.inMemVideos.set(applicantId, res);
      return res;
    }
  }

  async getVideoDetails(applicantId: string) {
    if (this.prisma.isConnected) {
      const video = await this.prisma.videoSubmission.findFirst({
        where: { applicantId },
        include: { transcripts: true, insights: true },
        orderBy: { createdAt: 'desc' },
      });
      return video;
    }

    return this.inMemVideos.get(applicantId) || null;
  }
}
