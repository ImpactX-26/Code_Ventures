import { Injectable, Logger } from '@nestjs/common';
import { AiProviderService, ExtractedDocData } from '../providers/ai-provider.service.js';
import { SourceType, VerificationStatus } from '@prisma/client';

export interface StructuredExtraction {
  fieldKey: string;
  fieldValue: string;
  confidence: number;
  source: SourceType;
  verificationStatus: VerificationStatus;
}

@Injectable()
export class DocumentAgent {
  private readonly logger = new Logger(DocumentAgent.name);

  constructor(private readonly aiProvider: AiProviderService) {}

  async processDocumentText(text: string, docType: string): Promise<{
    rawExtraction: ExtractedDocData;
    structuredExtractions: StructuredExtraction[];
  }> {
    this.logger.log(`DocumentAgent extracting structured intelligence from document type: ${docType}`);
    const rawExtraction = await this.aiProvider.extractDocumentFields(text, docType);

    const extractions: StructuredExtraction[] = [];

    if (rawExtraction.fullName) {
      extractions.push({
        fieldKey: 'fullName',
        fieldValue: rawExtraction.fullName,
        confidence: rawExtraction.confidence,
        source: SourceType.DOCUMENT_EXTRACTED,
        verificationStatus: VerificationStatus.PENDING,
      });
    }

    if (rawExtraction.degree) {
      extractions.push({
        fieldKey: 'degree',
        fieldValue: rawExtraction.degree,
        confidence: rawExtraction.confidence,
        source: SourceType.DOCUMENT_EXTRACTED,
        verificationStatus: VerificationStatus.PENDING,
      });
    }

    if (rawExtraction.institution) {
      extractions.push({
        fieldKey: 'institution',
        fieldValue: rawExtraction.institution,
        confidence: rawExtraction.confidence,
        source: SourceType.DOCUMENT_EXTRACTED,
        verificationStatus: VerificationStatus.PENDING,
      });
    }

    if (rawExtraction.graduationDate) {
      extractions.push({
        fieldKey: 'graduationDate',
        fieldValue: rawExtraction.graduationDate,
        confidence: rawExtraction.confidence,
        source: SourceType.DOCUMENT_EXTRACTED,
        verificationStatus: VerificationStatus.PENDING,
      });
    }

    if (rawExtraction.gradeCgpa) {
      extractions.push({
        fieldKey: 'gradeCgpa',
        fieldValue: rawExtraction.gradeCgpa,
        confidence: rawExtraction.confidence,
        source: SourceType.DOCUMENT_EXTRACTED,
        verificationStatus: VerificationStatus.PENDING,
      });
    }

    if (rawExtraction.employer) {
      extractions.push({
        fieldKey: 'employer',
        fieldValue: rawExtraction.employer,
        confidence: rawExtraction.confidence,
        source: SourceType.DOCUMENT_EXTRACTED,
        verificationStatus: VerificationStatus.PENDING,
      });
    }

    if (rawExtraction.role) {
      extractions.push({
        fieldKey: 'role',
        fieldValue: rawExtraction.role,
        confidence: rawExtraction.confidence,
        source: SourceType.DOCUMENT_EXTRACTED,
        verificationStatus: VerificationStatus.PENDING,
      });
    }

    if (rawExtraction.skills && rawExtraction.skills.length > 0) {
      extractions.push({
        fieldKey: 'skills',
        fieldValue: rawExtraction.skills.join(', '),
        confidence: rawExtraction.confidence,
        source: SourceType.DOCUMENT_EXTRACTED,
        verificationStatus: VerificationStatus.PENDING,
      });
    }

    if (rawExtraction.languages && rawExtraction.languages.length > 0) {
      const langsSummary = rawExtraction.languages.map((l) => `${l.language} (${l.level})`).join(', ');
      extractions.push({
        fieldKey: 'languages',
        fieldValue: langsSummary,
        confidence: rawExtraction.confidence,
        source: SourceType.DOCUMENT_EXTRACTED,
        verificationStatus: VerificationStatus.PENDING,
      });
    }

    return {
      rawExtraction,
      structuredExtractions: extractions,
    };
  }
}
