import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { UploadedFileType } from '../common/types/file.types.js';

@UseGuards(JwtAuthGuard)
@Controller('applicants')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post(':id/video')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(
    @Param('id') applicantId: string,
    @UploadedFile() file?: UploadedFileType,
    @Body('transcript') transcript?: string,
  ) {
    return this.videoService.uploadVideo(applicantId, file, transcript);
  }

  @Get(':id/video')
  async getVideoDetails(@Param('id') applicantId: string) {
    return this.videoService.getVideoDetails(applicantId);
  }
}
