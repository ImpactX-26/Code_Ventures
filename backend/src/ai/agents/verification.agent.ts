import { Injectable, Logger } from '@nestjs/common';
import { ConflictStatus } from '@prisma/client';

export interface DetectedConflict {
  fieldName: string;
  valueA: string;
  sourceA: string;
  valueB: string;
  sourceB: string;
  status: ConflictStatus;
  description: string;
}

@Injectable()
export class VerificationAgent {
  private readonly logger = new Logger(VerificationAgent.name);

  detectConflicts(applicant: any, extractions: any[]): DetectedConflict[] {
    const conflicts: DetectedConflict[] = [];

    // 1. Graduation year check between applicant input vs extracted documents
    const applicantGradDate = applicant?.educationRecords?.[0]?.graduationDate;
    const extractedGradDate = extractions.find(
      (e) => e.fieldKey === 'graduationDate' && e.fieldValue,
    );

    if (
      applicantGradDate &&
      extractedGradDate &&
      applicantGradDate.trim() !== extractedGradDate.fieldValue.trim()
    ) {
      conflicts.push({
        fieldName: 'graduationDate',
        valueA: applicantGradDate,
        sourceA: 'Applicant Input',
        valueB: extractedGradDate.fieldValue,
        sourceB: 'Uploaded Degree / CV Extraction',
        status: ConflictStatus.OPEN,
        description: `Potential inconsistency detected: You specified graduation year ${applicantGradDate}, but document extraction shows ${extractedGradDate.fieldValue}.`,
      });
    }

    // 2. Degree title check
    const applicantDegree = applicant?.educationRecords?.[0]?.degree;
    const extractedDegree = extractions.find((e) => e.fieldKey === 'degree' && e.fieldValue);

    if (
      applicantDegree &&
      extractedDegree &&
      !applicantDegree.toLowerCase().includes(extractedDegree.fieldValue.toLowerCase().slice(0, 5)) &&
      !extractedDegree.fieldValue.toLowerCase().includes(applicantDegree.toLowerCase().slice(0, 5))
    ) {
      conflicts.push({
        fieldName: 'degree',
        valueA: applicantDegree,
        sourceA: 'Applicant Input',
        valueB: extractedDegree.fieldValue,
        sourceB: 'Uploaded Degree Extraction',
        status: ConflictStatus.OPEN,
        description: `Potential inconsistency detected: Academic degree profile is listed as "${applicantDegree}", while document shows "${extractedDegree.fieldValue}".`,
      });
    }

    // 3. Name mismatch check
    const applicantName = applicant?.fullName;
    const extractedName = extractions.find((e) => e.fieldKey === 'fullName' && e.fieldValue);

    if (
      applicantName &&
      extractedName &&
      extractedName.fieldValue.length > 4 &&
      !applicantName.toLowerCase().includes(extractedName.fieldValue.toLowerCase().split(' ')[0])
    ) {
      conflicts.push({
        fieldName: 'fullName',
        valueA: applicantName,
        sourceA: 'Applicant Registration',
        valueB: extractedName.fieldValue,
        sourceB: 'Identity Document Extraction',
        status: ConflictStatus.OPEN,
        description: `Potential inconsistency detected: Name on account is "${applicantName}", but document displays "${extractedName.fieldValue}". Please verify your official passport name.`,
      });
    }

    this.logger.log(`VerificationAgent evaluated consistency. Detected ${conflicts.length} conflict(s).`);
    return conflicts;
  }
}
