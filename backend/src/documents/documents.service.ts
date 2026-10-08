import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RecommendationsService } from '../recommendations/recommendations.service.js';
import { calculateBavarianGpa } from '../common/bavarian-calculator.js';

export interface OcrSimulationResult {
  documentId: string;
  applicantId: string;
  extractedTitle: string;
  detectedType: string;
  confidenceScore: number;
  extractedData: Record<string, any>;
  verificationState: 'VERIFIED' | 'FLAGGED_FOR_REVIEW';
  verificationNotes: string;
  autoSyncedEntity?: {
    entityType: 'Education' | 'Language' | 'Employment' | 'APS';
    updatedId: string;
    previousProvenance: string;
    newProvenance: 'DOCUMENT_VERIFIED';
  };
}

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  async getDocumentsForApplicant(applicantId: string) {
    const applicant = await this.prisma.getApplicantById(applicantId);
    if (!applicant) {
      throw new NotFoundException(`Applicant ${applicantId} not found`);
    }
    return applicant.documents || [];
  }

  async uploadDocument(applicantId: string, data: any) {
    const applicant = await this.prisma.getApplicantById(applicantId);
    if (!applicant) {
      throw new NotFoundException(`Applicant ${applicantId} not found`);
    }

    const docId = data.id || `doc-${Date.now()}`;
    const newDoc = {
      id: docId,
      applicantId,
      title: data.title || 'Academic / Identity Document',
      docType: data.docType || 'DEGREE_CERTIFICATE',
      fileUrl: data.fileUrl || `/uploads/${data.fileName || 'document.pdf'}`,
      fileName: data.fileName || 'uploaded_document.pdf',
      fileSizeBytes: data.fileSizeBytes || 1540000,
      mimeType: data.mimeType || 'application/pdf',
      extractionFlags: {
        parsed: false,
        ocrPending: true,
      },
      extractedData: null,
      verificationState: 'PENDING',
      verificationNotes: 'Uploaded document awaiting OCR verification.',
      provenance: 'USER_TYPED',
      provenanceMetadata: {
        title: 'USER_TYPED',
        docType: 'USER_TYPED',
      },
      uploadedAt: new Date(),
      updatedAt: new Date(),
    };

    if (!applicant.documents) applicant.documents = [];
    applicant.documents.push(newDoc);

    await this.prisma.updateApplicant(applicantId, { documents: applicant.documents });
    return newDoc;
  }

  /**
   * Simulates intelligent OCR extraction and verification of Indian academic documents,
   * language certificates, and employment records.
   */
  async simulateOcr(applicantId: string, documentId: string): Promise<OcrSimulationResult> {
    const applicant = await this.prisma.getApplicantById(applicantId);
    if (!applicant) {
      throw new NotFoundException(`Applicant ${applicantId} not found`);
    }

    const doc = (applicant.documents || []).find((d: any) => d.id === documentId);
    if (!doc) {
      throw new NotFoundException(`Document ${documentId} not found for applicant`);
    }

    let extractedData: Record<string, any> = {};
    let confidenceScore = 0.96;
    let verificationNotes = '';
    let autoSyncedEntity: any = undefined;

    const docType = doc.docType;

    if (docType === 'DEGREE_CERTIFICATE' || docType === 'TRANSCRIPT') {
      // Indian Degree OCR Simulation
      confidenceScore = 0.98;
      const university =
        applicant.educations?.[0]?.institution || 'Savitribai Phule Pune University';
      const qualification =
        applicant.educations?.[0]?.qualification || 'Bachelor of Engineering';
      const gpa = applicant.educations?.[0]?.gpaOrPercentage || 8.4;
      const bavarian = calculateBavarianGpa(gpa, 10, 4);

      extractedData = {
        issuingUniversity: university,
        degreeTitle: qualification,
        studentName: applicant.fullName,
        degreeClassification: 'First Class with Distinction',
        cgpaOrMarks: `${gpa} / 10.0`,
        bavarianGermanEquivalent: bavarian.germanGrade,
        anabinDatabaseMatch: {
          institutionStatus: 'H+',
          isRecognizedInGermany: true,
          degreeEquivalency: 'Entspricht (Directly Equivalent to German Bachelor)',
        },
        securityWatermarkDetected: true,
        digitalSignatureValid: true,
      };

      verificationNotes = `Verified against KMK Anabin Database. Institution '${university}' recognized with status H+. German Grade: ${bavarian.germanGrade}.`;

      // Update primary education to DOCUMENT_VERIFIED
      if (applicant.educations && applicant.educations.length > 0) {
        const primaryEdu = applicant.educations[0];
        const prevProv = primaryEdu.provenance;
        primaryEdu.isVerified = true;
        primaryEdu.provenance = 'DOCUMENT_VERIFIED';
        primaryEdu.provenanceMetadata = {
          institution: 'DOCUMENT_VERIFIED',
          qualification: 'DOCUMENT_VERIFIED',
          gpaOrPercentage: 'DOCUMENT_VERIFIED',
          germanGpaEquivalent: 'AI_SUGGESTED',
          anabinStatus: 'DOCUMENT_VERIFIED',
        };
        primaryEdu.anabinStatus = 'H+';
        primaryEdu.germanGpaEquivalent = bavarian.germanGrade;
        autoSyncedEntity = {
          entityType: 'Education',
          updatedId: primaryEdu.id,
          previousProvenance: prevProv,
          newProvenance: 'DOCUMENT_VERIFIED',
        };
      }
    } else if (docType === 'LANGUAGE_CERTIFICATE') {
      // Language certificate OCR Simulation
      confidenceScore = 0.99;
      const targetLang =
        applicant.languages?.[0]?.language === 'German' ? 'German' : 'English';
      const level = applicant.languages?.[0]?.level || 'A2';
      const issuer =
        targetLang === 'German' ? 'Goethe-Institut Max Mueller Bhavan' : 'IELTS / British Council';

      extractedData = {
        certifyingBody: issuer,
        examinedLanguage: targetLang,
        candidateName: applicant.fullName,
        cefrLevelAwarded: level,
        modularScores: {
          reading: '22/25',
          listening: '21/25',
          writing: '20/25',
          speaking: '21/25',
        },
        verificationCode: `GI-IND-${Math.floor(100000 + Math.random() * 900000)}`,
        issueDate: '2024-11-15',
      };

      verificationNotes = `Official ${issuer} digital seal confirmed. CEFR Level ${level} authenticated.`;

      if (applicant.languages && applicant.languages.length > 0) {
        const langObj = applicant.languages[0];
        const prevProv = langObj.provenance;
        langObj.isVerified = true;
        langObj.provenance = 'DOCUMENT_VERIFIED';
        langObj.provenanceMetadata = {
          language: 'DOCUMENT_VERIFIED',
          level: 'DOCUMENT_VERIFIED',
          score: 'DOCUMENT_VERIFIED',
        };
        autoSyncedEntity = {
          entityType: 'Language',
          updatedId: langObj.id,
          previousProvenance: prevProv,
          newProvenance: 'DOCUMENT_VERIFIED',
        };
      }
    } else if (docType === 'EXPERIENCE_LETTER') {
      confidenceScore = 0.95;
      const emp = applicant.employments?.[0];
      const employer = emp?.employer || 'Infosys Limited';
      const role = emp?.role || 'Software Engineer';

      extractedData = {
        employerName: employer,
        employeeName: applicant.fullName,
        designation: role,
        serviceTenure: `${emp?.totalMonths || 14} Months`,
        hrAuthorizedSignatory: 'Verified Corporate Seal',
      };

      verificationNotes = `Experience certificate from ${employer} verified.`;

      if (emp) {
        const prevProv = emp.provenance;
        emp.isVerified = true;
        emp.provenance = 'DOCUMENT_VERIFIED';
        emp.provenanceMetadata = {
          employer: 'DOCUMENT_VERIFIED',
          role: 'DOCUMENT_VERIFIED',
          totalMonths: 'DOCUMENT_VERIFIED',
        };
        autoSyncedEntity = {
          entityType: 'Employment',
          updatedId: emp.id,
          previousProvenance: prevProv,
          newProvenance: 'DOCUMENT_VERIFIED',
        };
      }
    } else if (docType === 'APS_CERTIFICATE') {
      confidenceScore = 0.99;
      extractedData = {
        apsCertificateNumber: `APS-DELHI-2025-${Math.floor(10000 + Math.random() * 90000)}`,
        applicantName: applicant.fullName,
        issuingAuthority: 'Akademische Prüfstelle New Delhi',
        verificationOutcome: 'POSITIV (Confirmed Authentic)',
        embassyDigitalStamp: true,
      };

      verificationNotes = 'APS Certificate authenticated. Indian academic credentials cleared for German Student Visa.';

      // Mark APS requirement completed in recommendations
      if (applicant.recommendation?.missingRequirements) {
        const apsReq = applicant.recommendation.missingRequirements.find(
          (r: any) => r.actionType === 'APS_APPLICATION',
        );
        if (apsReq) apsReq.isCompleted = true;
      }

      autoSyncedEntity = {
        entityType: 'APS',
        updatedId: 'aps-cleared',
        previousProvenance: 'PENDING',
        newProvenance: 'DOCUMENT_VERIFIED',
      };
    } else {
      confidenceScore = 0.92;
      extractedData = {
        documentName: doc.title,
        extractedLinesCount: 42,
        detectedLanguage: 'English',
        timestamp: new Date().toISOString(),
      };
      verificationNotes = 'Standard OCR completed. Formats and text verified.';
    }

    // Update document record
    doc.extractionFlags = {
      parsed: true,
      ocrConfidence: confidenceScore,
      ocrEngine: 'AeroOCR-v2 (Educaro Optimized)',
      fieldsDetected: Object.keys(extractedData),
    };
    doc.extractedData = extractedData;
    doc.verificationState = 'VERIFIED';
    doc.verificationNotes = verificationNotes;
    doc.provenance = 'DOCUMENT_VERIFIED';
    doc.updatedAt = new Date();

    // Re-evaluate recommendations
    const evalResult = this.recommendationsService.evaluateProfile(applicant);
    applicant.recommendation = {
      ...applicant.recommendation,
      ...evalResult,
      updatedAt: new Date(),
    };

    await this.prisma.updateApplicant(applicantId, {
      documents: applicant.documents,
      educations: applicant.educations,
      languages: applicant.languages,
      employments: applicant.employments,
      recommendation: applicant.recommendation,
    });

    return {
      documentId: doc.id,
      applicantId,
      extractedTitle: doc.title,
      detectedType: docType,
      confidenceScore,
      extractedData,
      verificationState: 'VERIFIED',
      verificationNotes,
      autoSyncedEntity,
    };
  }
}
