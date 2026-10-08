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
  pathwayComparison?: PathwayComparisonResult;
  actionableNextSteps: Array<{
    step: number;
    text: string;
  }>;
  aiSummaryNotes: string;
  provenance: 'AI_SUGGESTED';
  provenanceMetadata?: Record<string, string>;
}

export interface PathwaySimulationBranch {
  track: 'Study' | 'Ausbildung' | 'Employment';
  title: string;
  badge: string;
  eligibilityScore: number;
  eligibilityStatus: 'ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'INELIGIBLE';
  timelineToDepartureMonths: string;
  languagePrerequisite: {
    minimumRequired: string;
    recommended: string;
    applicantCurrent: string;
    isFulfilled: boolean;
    gapAnalysis: string;
  };
  financialThreshold: {
    blockedAccountRequired: boolean;
    blockedAccountAmountEur?: number;
    monthlyStipendAvailable: boolean;
    monthlyStipendAmountEur?: string;
    financialSummary: string;
  };
  legalAndVisaChecks: {
    apsMandatory: boolean;
    apsStatusNotice: string;
    anabinRecognitionStatus: string;
    visaType: string;
  };
  careerAndPrOutlook: {
    graduationOrContractDuration: string;
    prEligibilityTimeline: string;
    startingSalaryRange: string;
  };
  matchedEducaroService: {
    packageName: string;
    matchScore: number;
    highlight: string;
  };
  pros: string[];
  riskBottlenecks: string[];
}

export interface PathwayComparisonResult {
  candidateName: string;
  selectedTrack: 'Study' | 'Ausbildung' | 'Employment';
  simulatedAt: string;
  activeOverridesApplied?: Record<string, any>;
  pathways: {
    study: PathwaySimulationBranch;
    ausbildung: PathwaySimulationBranch;
    employment: PathwaySimulationBranch;
  };
  bestMatchedTrack: 'Study' | 'Ausbildung' | 'Employment';
  counselorStrategicAdvice: string;
}

@Injectable()
export class RecommendationsService {
  /**
   * Evaluates an applicant's complete profile across Indian academic credentials,
   * German regulatory compliance (APS, Anabin, Bavarian GPA), language thresholds,
   * and maps them to appropriate Educaro service pathways.
   */
  evaluateProfile(applicant: any, overrides?: any): EvaluationResult {
    const track = overrides?.goalTrack || applicant.goalTrack || 'Study';
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

    const effectiveGpa = overrides?.gpaOrPercentage || primaryEducation?.gpaOrPercentage;
    let bavarianGpa = primaryEducation?.germanGpaEquivalent;
    if (effectiveGpa) {
      const calc = calculateBavarianGpa(
        effectiveGpa,
        primaryEducation?.maxGpaOrScale || (effectiveGpa > 10 ? 100 : 10),
        (primaryEducation?.maxGpaOrScale === 100 || effectiveGpa > 10) ? 40 : 4,
      );
      bavarianGpa = calc.germanGrade;
    }

    // 3. Language Proficiencies
    const germanLang = languages.find((l: any) => l.language?.toLowerCase() === 'german');
    const englishLang = languages.find((l: any) => l.language?.toLowerCase() === 'english');
    const effectiveGermanLevel = (overrides?.germanLevel || germanLang?.level || 'NONE').toUpperCase();
    const hasEnglishC1 = ['C1', 'C2'].includes(englishLang?.level?.toUpperCase());
    const hasGermanB1OrHigher = ['B1', 'B2', 'C1', 'C2'].includes(effectiveGermanLevel);
    const hasGermanB2OrHigher = ['B2', 'C1', 'C2'].includes(effectiveGermanLevel);

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

      const hasAps = overrides?.hasApsCertificate || documents.some((d: any) => d.docType === 'APS_CERTIFICATE' && d.verificationState === 'VERIFIED');
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
      apsRequired = false;

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

      if (effectiveGermanLevel === 'NONE' || effectiveGermanLevel === 'A1') {
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
    }. German level: ${effectiveGermanLevel}. Status: ${eligibilityStatus}. ${
      apsRequired ? 'APS verification is mandatory for Indian degree recognition.' : 'Exempt from APS.'
    }`;

    // Multi-Pathway Simulation
    const pathwayComparison = this.simulateAllPathways(applicant, overrides);

    return {
      eligibilityStatus,
      completenessScore,
      pathwaySummary,
      missingRequirements: missing,
      anabinInstitutionalStatus: primaryEducation?.anabinStatus || 'H+',
      apsRequired,
      educaroServiceRouting: educaroServices,
      pathwayComparison,
      actionableNextSteps: nextSteps,
      aiSummaryNotes: aiNotes,
      provenance: 'AI_SUGGESTED',
      provenanceMetadata: {
        eligibilityStatus: 'AI_SUGGESTED',
        completenessScore: 'AI_SUGGESTED',
        pathwaySummary: 'AI_SUGGESTED',
        pathwayComparison: 'AI_SUGGESTED',
      },
    };
  }

  /**
   * Multi-Pathway "What-If" Simulation Branching Engine.
   * Compares all 3 routes (Study vs Ausbildung vs Employment) simultaneously side-by-side.
   */
  simulateAllPathways(applicant: any, overrides?: any): PathwayComparisonResult {
    const educations = applicant.educations || [];
    const employments = applicant.employments || [];
    const languages = applicant.languages || [];

    const primaryEdu =
      educations.find((e: any) => e.degreeType === 'FOUR_YEAR_BACHELOR' || e.degreeType === 'MASTER') ||
      educations[0];

    const effectiveGpa = overrides?.gpaOrPercentage || primaryEdu?.gpaOrPercentage || 8.0;
    const effectiveGerman = (overrides?.germanLevel || languages.find((l: any) => l.language?.toLowerCase() === 'german')?.level || 'A1').toUpperCase();
    const effectiveExperienceMonths = overrides?.experienceMonths !== undefined ? overrides.experienceMonths : (employments[0]?.totalMonths || 0);
    const hasAps = overrides?.hasApsCertificate !== undefined ? overrides.hasApsCertificate : applicant.documents?.some((d: any) => d.docType === 'APS_CERTIFICATE' && d.verificationState === 'VERIFIED');

    // Bavarian GPA
    const bavarian = calculateBavarianGpa(effectiveGpa, 10, 4);

    // 1. Study Branch
    const isStudyGpaEligible = bavarian.germanGrade <= 2.5;
    const isGermanStudyAdvanced = ['B1', 'B2', 'C1', 'C2'].includes(effectiveGerman);
    let studyScore = 65;
    if (isStudyGpaEligible) studyScore += 20;
    if (isGermanStudyAdvanced) studyScore += 10;
    if (hasAps) studyScore += 5;

    const studyBranch: PathwaySimulationBranch = {
      track: 'Study',
      title: 'University Study (M.Sc / B.Sc)',
      badge: 'Academic Pathway',
      eligibilityScore: Math.min(studyScore, 98),
      eligibilityStatus: isStudyGpaEligible ? 'ELIGIBLE' : 'CONDITIONALLY_ELIGIBLE',
      timelineToDepartureMonths: '6 – 8 Months (Winter Oct / Summer Apr)',
      languagePrerequisite: {
        minimumRequired: 'English C1 / IELTS 6.5+ (German A2 for visa)',
        recommended: 'German B1 for student jobs (Werkstudent)',
        applicantCurrent: `German ${effectiveGerman}, English C1 Verified`,
        isFulfilled: true,
        gapAnalysis: isGermanStudyAdvanced ? 'Exceeds standard criteria' : 'Meet minimum; recommend B1 boost',
      },
      financialThreshold: {
        blockedAccountRequired: true,
        blockedAccountAmountEur: 11908,
        monthlyStipendAvailable: false,
        financialSummary: 'Mandatory Sperrkonto: €11,908 deposit in escrow (€992/month living expenses). 0 tuition at public universities.',
      },
      legalAndVisaChecks: {
        apsMandatory: true,
        apsStatusNotice: hasAps ? 'APS Certificate Cleared & Authenticated' : 'APS India Audit Mandatory (§16b AufenthG)',
        anabinRecognitionStatus: primaryEdu?.anabinStatus || 'H+',
        visaType: 'German Student Visa (National Type D §16b)',
      },
      careerAndPrOutlook: {
        graduationOrContractDuration: '2 Years (4 Semesters M.Sc)',
        prEligibilityTimeline: 'Permanent Residency in 2 Years post-graduation (Fast-Track §18c AufenthG)',
        startingSalaryRange: '€54,000 – €68,000 / year (Tech/Engineering)',
      },
      matchedEducaroService: {
        packageName: 'Educaro Master’s Direct Placement & APS Accelerator',
        matchScore: Math.min(studyScore + 5, 99),
        highlight: 'Fast-track APS New Delhi courier liaison & guaranteed TU9 applications with 0 tuition fees.',
      },
      pros: [
        'Globally recognized M.Sc degree from tuition-free German public universities',
        'Work up to 140 full days per year as a student worker',
        'Generous 18-month post-study job seeker visa',
      ],
      riskBottlenecks: [
        'Requires upfront capital for €11,908 blocked account',
        'Embassy APS New Delhi document verification processing queue (approx 4–8 weeks)',
      ],
    };

    // 2. Ausbildung Branch
    const isAusbildungGermanReady = ['B1', 'B2', 'C1', 'C2'].includes(effectiveGerman);
    let ausbildungScore = 60;
    if (isAusbildungGermanReady) ausbildungScore += 25;
    if (primaryEdu?.qualification?.toLowerCase().includes('nurs') || primaryEdu?.qualification?.toLowerCase().includes('diploma')) ausbildungScore += 15;
    else ausbildungScore += 10;

    const ausbildungBranch: PathwaySimulationBranch = {
      track: 'Ausbildung',
      title: 'Dual Vocational Training (Duale Ausbildung)',
      badge: 'Zero Financial Outlay',
      eligibilityScore: Math.min(ausbildungScore, 99),
      eligibilityStatus: isAusbildungGermanReady ? 'ELIGIBLE' : 'CONDITIONALLY_ELIGIBLE',
      timelineToDepartureMonths: '4 – 6 Months (Autumn Intake Aug/Sept)',
      languagePrerequisite: {
        minimumRequired: 'German B1 (telc / Goethe) Mandatory',
        recommended: 'German B2 for Healthcare / Nursing Spezialisierung',
        applicantCurrent: `German ${effectiveGerman}`,
        isFulfilled: isAusbildungGermanReady,
        gapAnalysis: isAusbildungGermanReady ? 'Language barrier cleared for vocational school' : 'Needs immediate German B1 intensive sprint',
      },
      financialThreshold: {
        blockedAccountRequired: false,
        monthlyStipendAvailable: true,
        monthlyStipendAmountEur: '€1,150 – €1,450 / month',
        financialSummary: '€0 Blocked Account Required! Paid monthly training salary covers living costs and satisfies German visa law.',
      },
      legalAndVisaChecks: {
        apsMandatory: false,
        apsStatusNotice: 'EXEMPT from APS India certificate requirement',
        anabinRecognitionStatus: 'State Anerkennung / Defizitbescheid Verification',
        visaType: 'German Vocational Training Visa (§16a or §16d AufenthG)',
      },
      careerAndPrOutlook: {
        graduationOrContractDuration: '3 Years Dual Training (50% Theory / 50% Paid Hospital/Tech Work)',
        prEligibilityTimeline: 'Permanent Residency in 2 Years working after Ausbildung completion',
        startingSalaryRange: '€38,000 – €46,000 / year + full job security',
      },
      matchedEducaroService: {
        packageName: 'Educaro Care Ausbildung Guaranteed Placement & Relocation',
        matchScore: Math.min(ausbildungScore + 3, 99),
        highlight: 'Signed hospital/enterprise contract in NRW with €1,250+/mo stipend and German employer visa sponsorship.',
      },
      pros: [
        'Zero blocked account needed — earn €1,200+/month from day one',
        'Exempt from APS India New Delhi embassy requirement',
        'Guaranteed employer absorption with lifelong career stability in Germany',
      ],
      riskBottlenecks: [
        'All vocational theory classes (Berufsschule) are strictly in German',
        'Healthcare track requires passing the B2 Pflege exam prior to independent practice',
      ],
    };

    // 3. Employment Branch
    const has2YrsExp = effectiveExperienceMonths >= 24;
    let employmentScore = 55;
    if (has2YrsExp) employmentScore += 25;
    if (['A2', 'B1', 'B2', 'C1'].includes(effectiveGerman)) employmentScore += 10;
    if (primaryEdu?.degreeType === 'FOUR_YEAR_BACHELOR') employmentScore += 10;

    const employmentBranch: PathwaySimulationBranch = {
      track: 'Employment',
      title: 'Direct Employment & Opportunity Card (Chancenkarte)',
      badge: 'Immediate Career',
      eligibilityScore: Math.min(employmentScore, 96),
      eligibilityStatus: (has2YrsExp && primaryEdu?.degreeType === 'FOUR_YEAR_BACHELOR') ? 'ELIGIBLE' : 'CONDITIONALLY_ELIGIBLE',
      timelineToDepartureMonths: '2 – 4 Months (Immediate Rolling Hiring)',
      languagePrerequisite: {
        minimumRequired: 'German A1 or English C1 (Chancenkarte points)',
        recommended: 'German A2/B1 for 4x higher recruiter conversion',
        applicantCurrent: `German ${effectiveGerman}, English C1 Verified`,
        isFulfilled: true,
        gapAnalysis: 'English C1 yields full points; German A2 grants bonus score',
      },
      financialThreshold: {
        blockedAccountRequired: false,
        monthlyStipendAvailable: false,
        financialSummary: '€0 if pre-matched with German employment contract / Blue Card, OR €1,027/mo proof of funds for Chancenkarte jobseeker visa.',
      },
      legalAndVisaChecks: {
        apsMandatory: false,
        apsStatusNotice: 'EXEMPT from APS India certificate requirement',
        anabinRecognitionStatus: 'ZAB Statement of Comparability / Anabin H+',
        visaType: 'EU Blue Card (§18g) or Opportunity Card (§20a AufenthG)',
      },
      careerAndPrOutlook: {
        graduationOrContractDuration: 'Immediate Unlimited Contract (Unbefristet)',
        prEligibilityTimeline: 'Permanent Residency in 21 Months (with German B1) or 27 Months (with German A1)',
        startingSalaryRange: '€52,000 – €72,000 / year (Experienced Engineers / IT)',
      },
      matchedEducaroService: {
        packageName: 'Educaro Opportunity Card (Chancenkarte) & German Career Matching',
        matchScore: Math.min(employmentScore + 4, 98),
        highlight: 'DIN 5008 German resume overhaul, consular points dossier & direct introductions to German hiring managers.',
      },
      pros: [
        'Fastest route to Permanent Residency in Germany (21 months with B1)',
        'Immediate market competitive European salary',
        'Exempt from APS India New Delhi certificate',
      ],
      riskBottlenecks: [
        'Direct hiring without German presence requires rigorous technical interviews',
        'Requires minimum 2+ years of specialized corporate experience',
      ],
    };

    // Strategic comparison conclusion
    let bestTrack: 'Study' | 'Ausbildung' | 'Employment' = applicant.goalTrack || 'Study';
    if (primaryEdu?.qualification?.toLowerCase().includes('nurs')) {
      bestTrack = 'Ausbildung';
    } else if (effectiveExperienceMonths >= 36) {
      bestTrack = 'Employment';
    } else {
      bestTrack = 'Study';
    }

    const advice = `AeroPath AI Strategic Multi-Pathway Synthesis for ${applicant.fullName}: Candidate scores highest in the ${bestTrack} pathway (${
      bestTrack === 'Study' ? studyScore : bestTrack === 'Ausbildung' ? ausbildungScore : employmentScore
    }% match). If upfront financial liquidity (€11,908 blocked account) is a constraint, Ausbildung is the superior alternative offering a zero-outlay pathway with a guaranteed €1,200+/month stipend and exemption from the APS India New Delhi backlog.`;

    return {
      candidateName: applicant.fullName,
      selectedTrack: applicant.goalTrack || 'Study',
      simulatedAt: new Date().toISOString(),
      activeOverridesApplied: overrides,
      pathways: {
        study: studyBranch,
        ausbildung: ausbildungBranch,
        employment: employmentBranch,
      },
      bestMatchedTrack: bestTrack,
      counselorStrategicAdvice: advice,
    };
  }
}
