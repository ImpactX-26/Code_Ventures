import { Injectable } from '@nestjs/common';
import { calculateBavarianGpa } from '../common/bavarian-calculator.js';

export interface EvaluationResult {
  eligibilityStatus: 'ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'INELIGIBLE' | 'NEEDS_ASSESSMENT';
  completenessScore: number;
  pathwaySummary: string;
  missingRequirements: Array<{
    id: string;
    title: string;
    category: string;
    severity: 'CRITICAL' | 'RECOMMENDED';
    description: string;
    actionType: string;
    isCompleted: boolean;
  }>;
  anabinInstitutionalStatus: string;
  apsRequired: boolean;
  educaroServiceRouting: Array<{
    packageId: string;
    serviceName: string;
    tier: string;
    highlight: string;
    matchScore: number;
    features: string[];
  }>;
  actionableNextSteps: Array<{
    step: number;
    text: string;
  }>;
  aiSummaryNotes: string;
}

@Injectable()
export class RecommendationsService {
  /**
   * Evaluates an applicant's complete profile across Indian academic credentials,
   * German regulatory compliance (APS, Anabin, Bavarian GPA), language thresholds,
   * and maps them to appropriate Educaro service pathways.
   */
  evaluateProfile(applicant: any): EvaluationResult {
    const track = applicant.goalTrack || 'Study';
    const educations = applicant.educations || [];
    const employments = applicant.employments || [];
    const languages = applicant.languages || [];
    const documents = applicant.documents || [];
    const motivationMedia = applicant.motivationMedia;

    // 1. Calculate Completeness Score
    let score = 0;
    if (applicant.fullName && applicant.email) score += 10;
    if (applicant.city && applicant.targetIntake) score += 10;
    if (educations.length > 0) score += 25;
    if (languages.length > 0) score += 20;
    if (employments.length > 0) score += 10;
    if (documents.length > 0) score += 15;
    if (motivationMedia?.introVideoTranscript || motivationMedia?.primaryReasonToMigrate) score += 10;

    const completenessScore = Math.min(score, 100);

    // 2. Assess Highest Education & Bavarian GPA
    const primaryEducation =
      educations.find((e: any) => e.degreeType === 'FOUR_YEAR_BACHELOR' || e.degreeType === 'MASTER') ||
      educations[0];

    let bavarianGpa = primaryEducation?.germanGpaEquivalent;
    if (!bavarianGpa && primaryEducation?.gpaOrPercentage) {
      const calc = calculateBavarianGpa(
        primaryEducation.gpaOrPercentage,
        primaryEducation.maxGpaOrScale || 10,
        primaryEducation.maxGpaOrScale === 100 ? 40 : 4,
      );
      bavarianGpa = calc.germanGrade;
    }

    // 3. Language Proficiencies
    const germanLang = languages.find((l: any) => l.language?.toLowerCase() === 'german');
    const englishLang = languages.find((l: any) => l.language?.toLowerCase() === 'english');
    const germanLevel = germanLang?.level?.toUpperCase() || 'NONE';
    const hasEnglishC1 = ['C1', 'C2'].includes(englishLang?.level?.toUpperCase());
    const hasGermanB1OrHigher = ['B1', 'B2', 'C1', 'C2'].includes(germanLevel);
    const hasGermanB2OrHigher = ['B2', 'C1', 'C2'].includes(germanLevel);

    // 4. Missing Requirements List
    const missing: any[] = [];
    let apsRequired = false;
    let eligibilityStatus: 'ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'INELIGIBLE' | 'NEEDS_ASSESSMENT' =
      'NEEDS_ASSESSMENT';
    let pathwaySummary = '';
    const educaroServices: any[] = [];
    const nextSteps: any[] = [];

    // Track Specific Routing
    if (track === 'Study') {
      apsRequired = true;

      // Check APS
      const hasAps = documents.some((d: any) => d.docType === 'APS_CERTIFICATE' && d.verificationState === 'VERIFIED');
      if (!hasAps) {
        missing.push({
          id: 'req-aps',
          title: 'APS Certificate (Akademische Prüfstelle India)',
          category: 'Embassy Legal Requirement',
          severity: 'CRITICAL',
          description:
            'Mandatory document verification certificate issued by the German Embassy New Delhi. Indian university applicants cannot obtain student visas without it.',
          actionType: 'APS_APPLICATION',
          isCompleted: false,
        });
      }

      // Check Blocked Account
      missing.push({
        id: 'req-sperrkonto',
        title: 'Blocked Account (Sperrkonto €11,908 / year)',
        category: 'Visa Financial Proof',
        severity: 'CRITICAL',
        description:
          'German immigration requires proof of living costs (€992/month for 12 months) in a recognized escrow account.',
        actionType: 'BLOCKED_ACCOUNT',
        isCompleted: false,
      });

      // German language recommendation for career
      if (!hasGermanB1OrHigher) {
        missing.push({
          id: 'req-german-study',
          title: 'Advance German to B1/B2 Level',
          category: 'Career & Integration',
          severity: 'RECOMMENDED',
          description:
            'While your Master may be taught in English, reaching B1 enables high-paying student jobs (Werkstudent) and seamless post-grad employment in Germany.',
          actionType: 'GERMAN_STUDY',
          isCompleted: false,
        });
      }

      // Check Eligibility for Study
      const is4YearBachelor = primaryEducation?.degreeType === 'FOUR_YEAR_BACHELOR' || (primaryEducation?.graduationYear && primaryEducation?.startYear && (primaryEducation.graduationYear - primaryEducation.startYear >= 4));
      
      if (is4YearBachelor && (!bavarianGpa || bavarianGpa <= 2.5)) {
        eligibilityStatus = 'ELIGIBLE';
        pathwaySummary =
          'Direct Master Entry (Direkter Hochschulzugang) to top German Public Universities (TU9 / U15). 4-year Indian degree recognized as H+ equivalent without Studienkolleg.';
      } else if (!is4YearBachelor && primaryEducation?.degreeType === 'THREE_YEAR_BACHELOR') {
        eligibilityStatus = 'CONDITIONALLY_ELIGIBLE';
        pathwaySummary =
          'Conditional Master Entry: 3-year Indian Bachelor (B.Sc/BCA) typically requires either a 1-year Master in India or a German preparatory semester (Propädeutikum / Studienkolleg).';
      } else {
        eligibilityStatus = 'CONDITIONALLY_ELIGIBLE';
        pathwaySummary =
          'Profile meets university entry with academic GPA conditions or requires German language bridge program.';
      }

      educaroServices.push({
        packageId: 'EDU-MASTER-EXPRESS',
        serviceName: 'Educaro Master’s Direct Placement & APS Accelerator',
        tier: 'All-Inclusive Academic Pathway',
        highlight: 'Fast-track APS verification, university selection, SOP crafting & zero-tuition guarantee',
        matchScore: 97,
        features: [
          'Direct courier & liaison with APS India office in New Delhi',
          'Application to up to 6 accredited German public universities',
          'German standard academic CV and Statement of Purpose mentoring',
          'Official partner blocked account & statutory health insurance bundling',
          'German National Student Visa (Type D) dossier preparation',
        ],
      });

      educaroServices.push({
        packageId: 'EDU-GERMAN-IMMERSION',
        serviceName: 'Educaro German Language Immersion (A1 to B2)',
        tier: 'Language Excellence',
        highlight: 'Live cohort instruction with native speakers and Goethe exam warranty',
        matchScore: 89,
        features: [
          'Certified Goethe/telc curriculum preparation',
          'Technical German vocabulary modules for engineering & IT',
          'Mock oral examinations and confidence drills',
        ],
      });

      nextSteps.push(
        { step: 1, text: 'Submit university transcripts for official Educaro APS pre-audit' },
        { step: 2, text: 'Draft German academic Statement of Purpose tailored to target universities' },
        { step: 3, text: 'File applications through uni-assist and direct university portals' },
        { step: 4, text: 'Open Sperrkonto and finalize German health insurance (TK / Barmer)' },
      );
    } else if (track === 'Ausbildung') {
      apsRequired = false; // APS not required for vocational Ausbildung!

      if (!hasGermanB1OrHigher) {
        missing.push({
          id: 'req-german-ausbildung',
          title: 'Attain Certified German B1 or B2 (telc/Goethe)',
          category: 'Language Requirement',
          severity: 'CRITICAL',
          description:
            'German vocational schools (Berufsschule) conduct all theory classes in German. B1 is the legal minimum; B2 is required for healthcare/nursing.',
          actionType: 'GERMAN_B1_B2',
          isCompleted: false,
        });
      }

      missing.push({
        id: 'req-anerkennung',
        title: 'Defizitbescheid / Zeugnisanerkennung (Credential Evaluation)',
        category: 'Legal Licensing',
        severity: 'CRITICAL',
        description:
          'Official evaluation of your Indian 12th marksheet or diploma by the German state authority (Bezirksregierung).',
        actionType: 'ANERKENNUNG',
        isCompleted: false,
      });

      eligibilityStatus = hasGermanB1OrHigher ? 'ELIGIBLE' : 'CONDITIONALLY_ELIGIBLE';
      pathwaySummary =
        'Dual Vocational Training (Duale Ausbildung) in Germany. Monthly training stipend (€1,150 - €1,450/month), tuition-free school, and guaranteed employment upon graduation.';

      educaroServices.push({
        packageId: 'EDU-AUSBILDUNG-GUARANTEE',
        serviceName: 'Educaro Ausbildung Employer Placement & Language FastTrack',
        tier: 'Guaranteed Employment Contract',
        highlight: 'Direct interviews with German enterprise employers & paid monthly stipend',
        matchScore: 99,
        features: [
          'Guaranteed training contract with German partner hospital, IT firm, or hospitality group',
          'No blocked account required (training salary satisfies visa subsistence rule)',
          'Complete Zeugnisanerkennung and Defizitbescheid processing',
          'On-site accommodation assistance and German integration mentor in Germany',
        ],
      });

      nextSteps.push(
        { step: 1, text: 'Complete certified German B1/B2 language training' },
        { step: 2, text: 'Submit 10th/12th marksheets for German school equivalency certificate' },
        { step: 3, text: 'Interview with Educaro partner German employers virtually' },
        { step: 4, text: 'Receive signed Ausbildung contract and apply for German Training Visa' },
      );
    } else {
      // Employment Track
      apsRequired = false;

      missing.push({
        id: 'req-zab',
        title: 'ZAB Statement of Comparability / Anabin Verification',
        category: 'Legal Recognition',
        severity: 'CRITICAL',
        description:
          'Proof that your Indian Bachelor/Master degree is equivalent to a German university degree for the Skilled Worker Act (FEG).',
        actionType: 'ZAB_RECOGNITION',
        isCompleted: false,
      });

      if (germanLevel === 'NONE' || germanLevel === 'A1') {
        missing.push({
          id: 'req-german-work',
          title: 'Upgrade German to A2/B1',
          category: 'Market Employability',
          severity: 'RECOMMENDED',
          description:
            'German A2/B1 unlocks 4x more employer opportunities and grants additional points for the Opportunity Card (Chancenkarte).',
          actionType: 'GERMAN_A2',
          isCompleted: false,
        });
      }

      eligibilityStatus = employments.length > 0 ? 'ELIGIBLE' : 'CONDITIONALLY_ELIGIBLE';
      pathwaySummary =
        'German Skilled Worker Immigration (Fachkräfteeinwanderung) & Opportunity Card (Chancenkarte). Points-based candidate eligible for direct German job search.';

      educaroServices.push({
        packageId: 'EDU-CHANCENKARTE-PRO',
        serviceName: 'Educaro Opportunity Card (Chancenkarte) & Career Accelerator',
        tier: 'Direct Professional Pathway',
        highlight: 'Points audit, DIN 5008 German Lebenslauf redesign & employer introductions',
        matchScore: 95,
        features: [
          'Full Chancenkarte points calculation dossier & ZAB document preparation',
          'German standard resume and cover letter overhaul for German hiring managers',
          'Direct introductions to German tech, engineering, and healthcare recruiters',
          'German Opportunity Card visa filing support at VFS India',
        ],
      });

      nextSteps.push(
        { step: 1, text: 'Confirm degree equivalence on KMK Anabin portal (H+ status)' },
        { step: 2, text: 'Reformat Indian resume into German DIN 5008 Lebenslauf format' },
        { step: 3, text: 'Submit Chancenkarte application or schedule employer technical interviews' },
      );
    }

    const aiNotes = `AeroPath AI Assessment for ${applicant.fullName || 'Applicant'}: Track: ${track}. Bavarian GPA: ${
      bavarianGpa ? bavarianGpa : 'Pending'
    }. German level: ${germanLevel}. Status: ${eligibilityStatus}. ${
      apsRequired ? 'APS verification is mandatory for Indian degree recognition.' : 'Exempt from APS.'
    }`;

    return {
      eligibilityStatus,
      completenessScore,
      pathwaySummary,
      missingRequirements: missing,
      anabinInstitutionalStatus: primaryEducation?.anabinStatus || 'H+',
      apsRequired,
      educaroServiceRouting: educaroServices,
      actionableNextSteps: nextSteps,
      aiSummaryNotes: aiNotes,
    };
  }
}
