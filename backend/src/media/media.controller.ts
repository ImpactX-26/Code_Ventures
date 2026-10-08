import { Controller, Post, Body } from '@nestjs/common';
import { MediaService } from './media.service.js';

@Controller('api/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('video-transcript')
  async processVideoTranscript(
    @Body()
    body: {
      applicantId: string;
      transcript?: string;
      videoUrl?: string;
      durationSeconds?: number;
      primaryReason?: string;
      longTermGoals?: string;
      targetRegions?: string[];
    },
  ) {
    return this.mediaService.processVideoTranscript(body.applicantId, body);
  }
}
