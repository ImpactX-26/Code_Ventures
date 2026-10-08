import { Injectable, Logger } from '@nestjs/common';
import { Pathway } from '@prisma/client';

export interface ClarificationItem {
  question: string;
  reason: string;
  options: string[];
}

@Injectable()
export class ClarificationAgent {
  private readonly logger = new Logger(ClarificationAgent.name);

  generateClarifications(applicant: any, conflicts: any[]): ClarificationItem[] {
    const tasks: ClarificationItem[] = [];

    // 1. Conflict-derived clarification tasks
    for (const conflict of conflicts) {
      if (conflict.status === 'OPEN') {
        tasks.push({
          question: `Which is the correct value for your ${conflict.fieldName}?`,
          reason: `Discrepancy detected between ${conflict.sourceA} ("${conflict.valueA}") and ${conflict.sourceB} ("${conflict.valueB}").`,
          options: [
            conflict.valueA,
            conflict.valueB,
            'Neither (I will provide a corrected document)',
          ],
        });
      }
    }

    // 2. Missing German Language Level
    const languages = applicant?.applicantLanguages || [];
    const hasGerman = languages.some((l: any) => l.languageName?.toLowerCase().includes('german'));
    if (!hasGerman) {
      tasks.push({
        question: 'Your German language certification status is currently missing from your profile.',
        reason: 'German proficiency is a critical visa and qualification requirement for vocational training and study in Germany.',
        options: [
          'I have an official certificate (Goethe / telc / TestDaF)',
          'I am currently enrolled and learning German',
          'I do not speak German yet (interested in beginner A1 courses)',
          'I only target 100% English-taught programs / English IT roles',
        ],
      });
    }

    // 3. Missing APS or Document verification (for Study pathway)
    const pathway = applicant?.targetPathway || Pathway.STUDY;
    const documents = applicant?.documents || [];
    const hasDegreeDoc = documents.some((d: any) => d.documentType === 'DEGREE' || d.documentType === 'CV');

    if (!hasDegreeDoc) {
      tasks.push({
        question: 'No formal degree transcript or CV document has been uploaded yet.',
        reason: 'Official university accreditation and German recognition check (Anabin) cannot proceed without primary documents.',
        options: [
          'I have my degree certificate and can upload it now',
          'My final degree is pending (I have provisional marks cards)',
          'I need Educaro document retrieval guidance',
        ],
      });
    }

    // 4. Missing financial proof plan (for Study pathway)
    if (pathway === Pathway.STUDY) {
      const hasGoal = applicant?.goals?.length > 0;
      if (!hasGoal) {
        tasks.push({
          question: 'Have you planned for the mandatory German Blocked Account (Sperrkonto €11,904)?',
          reason: 'Federal German immigration law §16b AufenthG requires proof of living costs prior to visa issuance.',
          options: [
            'Self-funded (I have funds ready for the blocked account)',
            'Planning to secure an education loan (via Educaro banking partners)',
            'Applying for DAAD or institutional scholarship',
            'I need guidance on blocked account options (Expatrio / Coracle / Fintiba)',
          ],
        });
      }
    }

    this.logger.log(`ClarificationAgent synthesized ${tasks.length} contextual clarification task(s).`);
    return tasks;
  }
}
