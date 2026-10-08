import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { DocumentType, VerificationStatus } from '@prisma/client';
import { UploadedFileType } from '../common/types/file.types.js';

@UseGuards(JwtAuthGuard)
@Controller()
export class DocumentsController {
  constructor(private readonly docsService: DocumentsService) {}

  @Post('applicants/:id/documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('id') applicantId: string,
    @UploadedFile() file: UploadedFileType,
    @Body('documentType') documentType: DocumentType,
  ) {
    if (!file) {
      throw new BadRequestException('Please provide a file to upload');
    }
    const docType = documentType || DocumentType.DEGREE;
    return this.docsService.uploadDocument(applicantId, file, docType);
  }

  @Get('applicants/:id/documents')
  async getApplicantDocuments(@Param('id') applicantId: string) {
    return this.docsService.getApplicantDocuments(applicantId);
  }

  @Post('documents/:id/verify')
  async verifyExtraction(
    @Param('id') extractionId: string,
    @Body('status') status: VerificationStatus,
  ) {
    return this.docsService.verifyExtraction(extractionId, status || VerificationStatus.VERIFIED);
  }

  @Post('documents/conflicts/:id/resolve')
  async resolveConflict(
    @Param('id') conflictId: string,
    @Body('resolvedValue') resolvedValue: string,
    @Body('resolvedBy') resolvedBy: string,
  ) {
    if (!resolvedValue) {
      throw new BadRequestException('resolvedValue is required');
    }
    return this.docsService.resolveConflict(conflictId, resolvedValue, resolvedBy || 'Applicant');
  }
}
