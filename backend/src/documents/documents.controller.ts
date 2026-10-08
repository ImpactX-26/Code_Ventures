import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { DocumentsService } from './documents.service.js';

@Controller('api/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('applicant/:applicantId')
  async getForApplicant(@Param('applicantId') applicantId: string) {
    return this.documentsService.getDocumentsForApplicant(applicantId);
  }

  @Post('applicant/:applicantId/upload')
  async uploadDoc(
    @Param('applicantId') applicantId: string,
    @Body() body: any,
  ) {
    return this.documentsService.uploadDocument(applicantId, body);
  }

  @Post('applicant/:applicantId/ocr-simulate')
  async simulateOcr(
    @Param('applicantId') applicantId: string,
    @Body() body: { documentId: string },
  ) {
    return this.documentsService.simulateOcr(applicantId, body.documentId);
  }
}
