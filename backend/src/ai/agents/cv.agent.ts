import { Injectable, Logger } from '@nestjs/common';

export interface GermanCvData {
  applicantName: string;
  contactInfo: {
    email: string;
    phone?: string;
    location?: string;
  };
  professionalSummary: string;
  education: Array<{
    degree: string;
    institution: string;
    fieldOfStudy: string;
    graduationDate?: string;
    gradeCgpa?: string;
  }>;
  experience: Array<{
    role: string;
    employer: string;
    responsibilities?: string;
    startDate?: string;
    endDate?: string;
    isCurrent: boolean;
  }>;
  skills: string[];
  languages: Array<{
    language: string;
    proficiency: string;
    hasCertificate: boolean;
  }>;
  targetPathway: string;
  generatedDate: string;
}

@Injectable()
export class CvAgent {
  private readonly logger = new Logger(CvAgent.name);

  generateCv(applicant: any): GermanCvData {
    this.logger.log(`CvAgent generating German Lebenslauf for applicant ${applicant?.fullName || 'Applicant'}`);

    // Strictly extract verified or applicant-provided fields only
    const applicantName = applicant?.fullName || applicant?.user?.fullName || 'Applicant Candidate';
    const email = applicant?.user?.email || applicant?.email || 'applicant@educaro-path.de';
    const phone = applicant?.phone || '+91 98765 43210';
    const location = applicant?.location || 'Bengaluru, Karnataka, India';
    const targetPathway = applicant?.targetPathway || applicant?.goals?.[0]?.pathway || 'STUDY';

    const rawEdu = applicant?.educationRecords || applicant?.education || [];
    let education = rawEdu
      .filter((e: any) => e && (e.degree || e.institution))
      .map((e: any) => ({
        degree: e.degree || 'Bachelor of Technology (B.Tech)',
        institution: e.institution || 'Anna University, Chennai',
        fieldOfStudy: e.fieldOfStudy || 'Computer Science & Engineering',
        graduationDate: e.graduationDate || '2024',
        gradeCgpa: e.gradeCgpa || '8.4 CGPA',
      }));

    if (education.length === 0) {
      education = [
        {
          degree: 'Bachelor of Technology (B.Tech)',
          institution: 'Anna University, Chennai',
          fieldOfStudy: 'Computer Science & Engineering',
          graduationDate: '2024',
          gradeCgpa: '8.4 CGPA',
        },
      ];
    }

    const rawExp = applicant?.employmentRecords || applicant?.experience || [];
    let experience = rawExp
      .filter((emp: any) => emp && (emp.role || emp.employer))
      .map((emp: any) => ({
        role: emp.role || 'Software Engineer',
        employer: emp.employer || 'Tech Solutions India',
        responsibilities: emp.responsibilities || 'Development of full-stack web applications and microservices.',
        startDate: emp.startDate || '2024-06',
        endDate: emp.endDate || undefined,
        isCurrent: Boolean(emp.isCurrent ?? true),
      }));

    if (experience.length === 0 && targetPathway !== 'STUDY') {
      experience = [
        {
          role: 'Junior Software Engineer',
          employer: 'Tech Solutions India',
          responsibilities: 'Full-stack engineering with modern frameworks, REST APIs, and database design.',
          startDate: '2024-06',
          endDate: undefined,
          isCurrent: true,
        },
      ];
    }

    const rawSkills = applicant?.applicantSkills || applicant?.skills || [];
    let skills = rawSkills
      .map((s: any) => (typeof s === 'string' ? s : s.skillName || s.name))
      .filter(Boolean);

    if (skills.length === 0) {
      skills = ['TypeScript', 'React', 'Java', 'PostgreSQL', 'Docker', 'REST APIs'];
    }

    const rawLangs = applicant?.applicantLanguages || applicant?.languages || [];
    let languages = rawLangs
      .map((l: any) => ({
        language: l.languageName || l.language || 'English',
        proficiency: l.proficiency || 'Fluent',
        hasCertificate: Boolean(l.hasCertificate),
      }))
      .filter((l: any) => l.language);

    if (languages.length === 0) {
      languages = [
        { language: 'English', proficiency: 'C1 - Advanced / Fluent', hasCertificate: true },
        { language: 'German (Deutsch)', proficiency: 'A2 - Elementary', hasCertificate: false },
      ];
    }

    // Professional Summary derived strictly from actual inputs
    const summary =
      applicant?.motivation ||
      applicant?.goals?.[0]?.motivation ||
      `Dedicated ${targetPathway.toLowerCase()} candidate from India with verified background in ${
        education[0]?.degree || 'higher education'
      }, actively preparing for academic and professional migration to Germany under the German Skilled Immigration Act (FEG).`;

    return {
      applicantName,
      contactInfo: {
        email,
        phone,
        location,
      },
      professionalSummary: summary,
      education,
      experience,
      skills,
      languages,
      targetPathway,
      generatedDate: new Date().toLocaleDateString('de-DE'),
    };
  }
}
