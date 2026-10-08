import { Injectable, Logger } from '@nestjs/common';
import { AiProviderService } from '../providers/ai-provider.service.js';
import { Pathway, SourceType } from '@prisma/client';

export interface VideoProcessedResult {
  transcriptText: string;
  extractedMotivation: string;
  careerGoals: string;
  preferredField: string;
  communicationScore: number;
  germanInterestLevel: string;
  source: SourceType;
  confidence: number;
}

@Injectable()
export class VideoAgent {
  private readonly logger = new Logger(VideoAgent.name);

  constructor(private readonly aiProvider: AiProviderService) {}

  async processVideo(
    transcript: string,
    pathway: Pathway,
  ): Promise<VideoProcessedResult> {
    this.logger.log(`VideoAgent analyzing speech-to-text transcript (${transcript.length} chars)`);

    const insights = await this.aiProvider.extractVideoInsights(transcript, pathway);

    return {
      transcriptText: transcript,
      extractedMotivation: insights.extractedMotivation,
      careerGoals: insights.careerGoals,
      preferredField: insights.preferredField,
      communicationScore: insights.communicationScore,
      germanInterestLevel: insights.germanInterestLevel,
      source: SourceType.VIDEO_EXTRACTED,
      confidence: insights.confidence,
    };
  }
}
