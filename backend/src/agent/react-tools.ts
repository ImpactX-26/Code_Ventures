import { calculateBavarianGpa } from '../common/bavarian-calculator.js';

export interface ReActTool {
  name: string;
  description: string;
  parameters: Record<string, string>;
  execute: (args: any, context: { applicant: any; prisma: any; recommendationsService: any }) => Promise<any>;
}

export const REACT_TOOLS: Record<string, ReActTool> = {
  update_profile_info: {
    name: 'update_profile_info',
    description: 'Updates applicant personal details, location in India, target intake semester, or goal track.',
    parameters: {
      fullName: 'string (optional)',
      city: 'string (optional)',
      phone: 'string (optional)',
      targetIntake: 'string (optional, e.g. "Winter Semester 2025/26")',
      goalTrack: '"Study" | "Ausbildung" | "Employment" (optional)',
    },
    execute: async (args, { applicant, prisma }) => {
      const patch: any = { provenance: 'USER_TYPED' };
      if (args.fullName) patch.fullName = args.fullName;
      if (args.city) patch.city = args.city;
      if (args.phone) patch.phone = args.phone;
      if (args.targetIntake) patch.targetIntake = args.targetIntake;
      if (args.goalTrack) patch.goalTrack = args.goalTrack;

      await prisma.updateApplicant(applicant.id, patch);
      return {
        success: true,
        updatedFields: Object.keys(patch),
        message: `Profile personal details updated with provenance: USER_TYPED`,
      };
    },
  },

  extract_education_details: {
    name: 'extract_education_details',
    description:
      'Extracts Indian degree, university, GPA or percentage, and automatically converts to German Bavarian GPA scale (1.0 - 4.0).',
    parameters: {
      institution: 'string (e.g. "Pune University", "Anna University", "Delhi University")',
      qualification: 'string (e.g. "B.Tech Computer Science", "GNM Nursing", "B.Sc Physics")',
      gpaOrPercentage: 'number (e.g. 8.4 or 85)',
      maxScale: 'number (10 for CGPA, 100 for Percentage)',
      graduationYear: 'number (optional)',
      degreeType: '"FOUR_YEAR_BACHELOR" | "THREE_YEAR_BACHELOR" | "DIPLOMA" | "MASTER" | "TWELFTH_GRADE"',
    },
    execute: async (args, { applicant, prisma, recommendationsService }) => {
      const maxScale = args.maxScale || (args.gpaOrPercentage > 10 ? 100 : 10);
      const minPass = maxScale === 100 ? 40 : 4;
      const bavarian = calculateBavarianGpa(args.gpaOrPercentage, maxScale, minPass);

      const newEdu = {
        id: `edu-${Date.now()}`,
        applicantId: applicant.id,
        institution: args.institution || 'Indian University',
        qualification: args.qualification || 'Bachelor Degree',
        fieldOfStudy: args.fieldOfStudy || args.qualification,
        startYear: args.graduationYear ? args.graduationYear - 4 : null,
        graduationYear: args.graduationYear ? Number(args.graduationYear) : 2024,
        gpaOrPercentage: Number(args.gpaOrPercentage),
        maxGpaOrScale: maxScale,
        germanGpaEquivalent: bavarian.germanGrade,
        gradingSystem: maxScale === 100 ? 'PERCENTAGE' : 'CGPA_10',
        isIndianDegree: true,
        degreeType: args.degreeType || (args.qualification?.toLowerCase().includes('b.tech') || args.qualification?.toLowerCase().includes('b.e') ? 'FOUR_YEAR_BACHELOR' : 'THREE_YEAR_BACHELOR'),
        anabinStatus: 'H+',
        isVerified: false,
        provenance: 'USER_TYPED',
        provenanceMetadata: {
          institution: 'USER_TYPED',
          qualification: 'USER_TYPED',
          gpaOrPercentage: 'USER_TYPED',
          germanGpaEquivalent: 'AI_SUGGESTED',
          anabinStatus: 'AI_SUGGESTED',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!applicant.educations) applicant.educations = [];
      applicant.educations.unshift(newEdu);

      const evalResult = recommendationsService.evaluateProfile(applicant);
      applicant.recommendation = { ...applicant.recommendation, ...evalResult };

      await prisma.updateApplicant(applicant.id, {
        educations: applicant.educations,
        recommendation: applicant.recommendation,
      });

      return {
        success: true,
        bavarianGermanGpa: bavarian.germanGrade,
        classification: bavarian.germanGradeClassification,
        anabinStatus: 'H+ (Recognized in Germany)',
        isDirectEntryEligible: bavarian.isEligibleForGermanUniversities,
        provenance: 'USER_TYPED',
      };
    },
  },

  record_employment_experience: {
    name: 'record_employment_experience',
    description: 'Records employment history, company, role, and total experience in months.',
    parameters: {
      employer: 'string (e.g. "Infosys", "Tata Motors", "Apollo Hospitals")',
      role: 'string (e.g. "Software Engineer", "Staff Nurse")',
      totalMonths: 'number',
      industry: 'string (optional)',
      responsibilities: 'string (optional)',
    },
    execute: async (args, { applicant, prisma, recommendationsService }) => {
      const newEmp = {
        id: `emp-${Date.now()}`,
        applicantId: applicant.id,
        employer: args.employer,
        role: args.role,
        responsibilities: args.responsibilities || `${args.role} at ${args.employer}`,
        totalMonths: Number(args.totalMonths) || 12,
        isCurrent: true,
        industry: args.industry || 'IT / Software',
        isVerified: false,
        provenance: 'USER_TYPED',
        provenanceMetadata: {
          employer: 'USER_TYPED',
          role: 'USER_TYPED',
          totalMonths: 'USER_TYPED',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!applicant.employments) applicant.employments = [];
      applicant.employments.unshift(newEmp);

      const evalResult = recommendationsService.evaluateProfile(applicant);
      applicant.recommendation = { ...applicant.recommendation, ...evalResult };

      await prisma.updateApplicant(applicant.id, {
        employments: applicant.employments,
        recommendation: applicant.recommendation,
      });

      return {
        success: true,
        recordedEmployer: args.employer,
        totalMonths: args.totalMonths,
        provenance: 'USER_TYPED',
      };
    },
  },

  assess_language_proficiency: {
    name: 'assess_language_proficiency',
    description: 'Records or updates German or English language level (A1 to C2).',
    parameters: {
      language: '"German" | "English"',
      level: '"A1" | "A2" | "B1" | "B2" | "C1" | "C2"',
      certificateName: 'string (optional, e.g. "Goethe A2", "telc B1", "IELTS")',
      score: 'string (optional)',
    },
    execute: async (args, { applicant, prisma, recommendationsService }) => {
      const isDocVerified = !!args.certificateName;
      const newLang = {
        id: `lang-${Date.now()}`,
        applicantId: applicant.id,
        language: args.language || 'German',
        level: args.level?.toUpperCase() || 'A1',
        certificateName: args.certificateName || null,
        score: args.score || null,
        isVerified: isDocVerified,
        provenance: isDocVerified ? 'DOCUMENT_VERIFIED' : 'USER_TYPED',
        provenanceMetadata: {
          language: 'USER_TYPED',
          level: isDocVerified ? 'DOCUMENT_VERIFIED' : 'USER_TYPED',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!applicant.languages) applicant.languages = [];
      const idx = applicant.languages.findIndex(
        (l: any) => l.language?.toLowerCase() === newLang.language.toLowerCase(),
      );
      if (idx !== -1) {
        applicant.languages[idx] = newLang;
      } else {
        applicant.languages.push(newLang);
      }

      const evalResult = recommendationsService.evaluateProfile(applicant);
      applicant.recommendation = { ...applicant.recommendation, ...evalResult };

      await prisma.updateApplicant(applicant.id, {
        languages: applicant.languages,
        recommendation: applicant.recommendation,
      });

      return {
        success: true,
        language: newLang.language,
        level: newLang.level,
        meetsPrerequisite:
          applicant.goalTrack === 'Ausbildung'
            ? ['B1', 'B2', 'C1'].includes(newLang.level)
            : true,
        provenance: isDocVerified ? 'DOCUMENT_VERIFIED' : 'USER_TYPED',
      };
    },
  },

  query_eligibility_and_aps: {
    name: 'query_eligibility_and_aps',
    description:
      'Queries German regulatory rules regarding Indian academic recognition, Anabin database status, and APS certificate necessity.',
    parameters: {
      goalTrack: '"Study" | "Ausbildung" | "Employment"',
    },
    execute: async (args, { applicant, recommendationsService }) => {
      const evalResult = recommendationsService.evaluateProfile(applicant);
      return {
        eligibilityStatus: evalResult.eligibilityStatus,
        apsMandatoryForTrack: evalResult.apsRequired,
        apsInfo: evalResult.apsRequired
          ? 'Mandatory for Indian university applicants since Nov 2022. German Embassy New Delhi fee: ₹18,000.'
          : 'Vocational Ausbildung and Employment tracks are exempt from APS New Delhi certificate.',
        anabinStatus: evalResult.anabinInstitutionalStatus,
        completenessScore: evalResult.completenessScore,
        missingRequirementsCount: evalResult.missingRequirements.length,
        provenance: 'AI_SUGGESTED',
      };
    },
  },

  suggest_educaro_pathway: {
    name: 'suggest_educaro_pathway',
    description: 'Generates tailored Educaro service packages and step-by-step roadmap.',
    parameters: {
      goalTrack: '"Study" | "Ausbildung" | "Employment"',
    },
    execute: async (args, { applicant, recommendationsService }) => {
      const evalResult = recommendationsService.evaluateProfile(applicant);
      return {
        recommendedPackages: evalResult.educaroServiceRouting,
        nextMilestones: evalResult.actionableNextSteps,
        completenessScore: evalResult.completenessScore,
        provenance: 'AI_SUGGESTED',
      };
    },
  },
};
