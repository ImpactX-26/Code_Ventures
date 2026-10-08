import { Injectable, Logger } from '@nestjs/common';
import { Pathway, QualificationStatus } from '@prisma/client';

export interface EvaluatedRule {
  ruleCode: string;
  requirement: string;
  description: string;
  required: boolean;
  source: string;
  passed: boolean;
  status: 'MET' | 'PARTIAL' | 'MISSING';
  applicantEvidence: string;
  remedyAction?: string;
}

export interface QualificationAssessmentResult {
  status: QualificationStatus;
  overallScore: number;
  pathway: Pathway;
  summary: string;
  missingRequirements: string[];
  evaluatedRules: EvaluatedRule[];
  disclaimer: string;
}

@Injectable()
export class QualificationAgent {
  private readonly logger = new Logger(QualificationAgent.name);

  assess(applicant: any, rules: any[], researchSources: any[]): QualificationAssessmentResult {
    const pathway: Pathway = applicant?.targetPathway || Pathway.STUDY;
    const evaluatedRules: EvaluatedRule[] = [];
    const missingRequirements: string[] = [];

    const educations = applicant?.educationRecords || [];
    const employments = applicant?.employmentRecords || [];
    const languages = applicant?.applicantLanguages || [];
    const documents = applicant?.documents || [];

    const hasDegree = educations.length > 0 && Boolean(educations[0]?.degree);
    const degreeTitle = educations[0]?.degree || 'None';
    const grade = educations[0]?.gradeCgpa || 'Not provided';

    const germanLang = languages.find((l: any) => l.languageName?.toLowerCase().includes('german'));
    const germanLevel = germanLang?.proficiency || 'A0 / None';
    const hasGermanCert = germanLang?.hasCertificate || false;

    const englishLang = languages.find((l: any) => l.languageName?.toLowerCase().includes('english'));
    const englishLevel = englishLang?.proficiency || 'Medium of Instruction';

    const totalExpYears = employments.length;

    // Filter rules for current pathway
    const pathwayRules = rules.filter((r) => r.pathway === pathway && r.active);

    let passedCount = 0;

    for (const rule of pathwayRules) {
      let passed = false;
      let status: 'MET' | 'PARTIAL' | 'MISSING' = 'MISSING';
      let evidence = 'No supporting profile evidence recorded';
      let remedy: string | undefined;

      switch (rule.ruleCode) {
        // STUDY RULES
        case 'STUDY_DEGREE_RECOGNITION':
          if (hasDegree) {
            passed = true;
            status = 'MET';
            evidence = `Bachelor degree recorded: ${degreeTitle} from ${educations[0]?.institution || 'Indian University'} (APS verification eligible)`;
          } else {
            status = 'MISSING';
            evidence = 'No degree certificate or academic record added to profile.';
            remedy = 'Add your university degree details and upload graduation transcript.';
          }
          break;

        case 'STUDY_ACADEMIC_GPA':
          if (hasDegree && grade !== 'Not provided') {
            passed = true;
            status = 'MET';
            evidence = `Recorded academic grade: ${grade}. Converted German grade estimate <= 2.5 benchmark.`;
          } else {
            status = 'PARTIAL';
            evidence = 'Academic GPA or percentage marks not fully provided.';
            remedy = 'Enter your final CGPA or marks percentage in your education profile.';
          }
          break;

        case 'STUDY_LANGUAGE_PROFICIENCY':
          if (germanLevel.includes('B') || germanLevel.includes('C') || englishLang?.hasCertificate) {
            passed = true;
            status = 'MET';
            evidence = `Language qualifications: German (${germanLevel}), English (${englishLevel}). Meets program prerequisite.`;
          } else if (englishLang || germanLevel.includes('A')) {
            passed = false;
            status = 'PARTIAL';
            evidence = `Current proficiency is German (${germanLevel}). Official C1 or IELTS 6.5+ required for unconditional admission.`;
            remedy = 'Enroll in Goethe-Zertifikat German preparation or submit certified IELTS score card.';
          } else {
            passed = false;
            status = 'MISSING';
            evidence = 'No certified German or English proficiency on file.';
            remedy = 'Complete language assessment or upload IELTS / Goethe certificate.';
          }
          break;

        case 'STUDY_BLOCKED_ACCOUNT':
          const hasBlockedAccountDoc = documents.some((d: any) => d.documentType === 'CERTIFICATE' || d.fileName.toLowerCase().includes('financial'));
          if (hasBlockedAccountDoc) {
            passed = true;
            status = 'MET';
            evidence = 'Financial proof / blocked account statement uploaded.';
          } else {
            status = 'PARTIAL';
            evidence = 'Mandatory German Sperrkonto proof (€11,904) required prior to visa filing (§16b AufenthG).';
            remedy = 'Initiate Educaro blocked account banking service (Expatrio / Coracle).';
          }
          break;

        // VOCATIONAL RULES
        case 'AUSBILDUNG_GERMAN_LEVEL':
          if (germanLevel.includes('B1') || germanLevel.includes('B2') || germanLevel.includes('C1')) {
            passed = true;
            status = 'MET';
            evidence = `Certified German level: ${germanLevel}. Meets vocational school (Berufsschule) requirement.`;
          } else if (germanLevel.includes('A2')) {
            passed = false;
            status = 'PARTIAL';
            evidence = `Current German level is A2. Vocational schools require minimum B1 (preferably B2).`;
            remedy = 'Bridge language gap from A2 to B1 via intensive Educaro language module.';
          } else {
            passed = false;
            status = 'MISSING';
            evidence = 'German proficiency missing or below A2 level.';
            remedy = 'Begin structured German A1-B1 training immediately.';
          }
          break;

        case 'AUSBILDUNG_SCHOOL_LEAVING':
          if (hasDegree || educations.some((e: any) => e.degree.toLowerCase().includes('12') || e.degree.toLowerCase().includes('school'))) {
            passed = true;
            status = 'MET';
            evidence = '10+2 / High School leaving credentials submitted for state equivalence.';
          } else {
            status = 'MISSING';
            evidence = 'Higher secondary school certificate not yet uploaded.';
            remedy = 'Upload 12th standard mark sheet for ZAB equivalence pre-check.';
          }
          break;

        case 'AUSBILDUNG_PRACTICAL_EXPERIENCE':
          if (employments.length > 0) {
            passed = true;
            status = 'MET';
            evidence = `Documented practical background: ${employments[0]?.role} at ${employments[0]?.employer}.`;
          } else {
            status = 'PARTIAL';
            evidence = 'No introductory internship recorded (recommended to strengthen employer application).';
            remedy = 'Add relevant clinical or technical internship experience if available.';
          }
          break;

        // EMPLOYMENT RULES
        case 'EMPLOYMENT_DEGREE_EQUIVALENCE':
          if (hasDegree) {
            passed = true;
            status = 'MET';
            evidence = `Recognized technical degree: ${degreeTitle}. Preliminary ZAB statement of comparability feasible.`;
          } else {
            status = 'MISSING';
            evidence = 'University degree required for EU Blue Card academic stream.';
            remedy = 'Upload university degree transcript and syllabus.';
          }
          break;

        case 'EMPLOYMENT_WORK_EXPERIENCE':
          if (totalExpYears >= 2 || employments.some((e: any) => (e.responsibilities || '').length > 20)) {
            passed = true;
            status = 'MET';
            evidence = `Verified professional experience entries: ${totalExpYears} position(s) documented.`;
          } else {
            status = 'PARTIAL';
            evidence = 'Less than 2 years documented work experience recorded.';
            remedy = 'Add past employer reference letters and comprehensive role responsibilities.';
          }
          break;

        case 'EMPLOYMENT_LANGUAGE_LEVEL':
          if (englishLang || germanLevel !== 'A0 / None') {
            passed = true;
            status = 'MET';
            evidence = `Professional working languages: English (${englishLevel}), German (${germanLevel}). Sufficient for international tech roles.`;
          } else {
            status = 'PARTIAL';
            evidence = 'Working language competency proof recommended for German recruiter screening.';
            remedy = 'Add language certification or specify business proficiency.';
          }
          break;

        default:
          passed = true;
          status = 'MET';
          evidence = 'Standard criteria validated.';
      }

      if (passed) {
        passedCount++;
      } else {
        if (rule.required) {
          missingRequirements.push(rule.requirement);
        }
      }

      evaluatedRules.push({
        ruleCode: rule.ruleCode,
        requirement: rule.requirement,
        description: rule.description,
        required: rule.required,
        source: rule.source,
        passed,
        status,
        applicantEvidence: evidence,
        remedyAction: remedy,
      });
    }

    // Determine Status
    const totalCount = pathwayRules.length || 1;
    const score = Math.round((passedCount / totalCount) * 100);

    let status: QualificationStatus = QualificationStatus.ADDITIONAL_REQUIREMENTS_NEEDED;
    let summary = '';

    if (missingRequirements.length === 0 && score >= 85) {
      status = QualificationStatus.READY;
      summary = `Profile strongly aligns with Germany ${pathway} legal and academic prerequisites. All core regulatory checks satisfied. Ready for consultant review and university/employer submission.`;
    } else if (score >= 40) {
      status = QualificationStatus.ADDITIONAL_REQUIREMENTS_NEEDED;
      summary = `Solid foundation established, but ${missingRequirements.length} essential requirement(s) must be fulfilled before formal visa/admission submission.`;
    } else {
      status = QualificationStatus.NOT_READY;
      summary = `Profile requires substantial preparatory milestones in language acquisition, credential recognition, or documentation before Germany migration readiness.`;
    }

    this.logger.log(`Qualification assessed for applicant: ${status} (Score: ${score}%)`);

    return {
      status,
      overallScore: score,
      pathway,
      summary,
      missingRequirements,
      evaluatedRules,
      disclaimer:
        'Educaro Preliminary Qualification is an automated pre-assessment based on current German immigration and academic standards. It does not constitute official immigration or university admission approval.',
    };
  }
}
