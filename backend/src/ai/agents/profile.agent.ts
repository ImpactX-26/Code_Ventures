import { Injectable } from '@nestjs/common';

export interface CompletenessPillar {
  key: string;
  label: string;
  weight: number;
  completed: boolean;
  score: number;
  notes: string;
}

export interface ProfileCompletenessResult {
  overallPercentage: number;
  pillars: CompletenessPillar[];
  missingSummary: string[];
}

@Injectable()
export class ProfileAgent {
  calculateCompleteness(applicant: any): ProfileCompletenessResult {
    const pillars: CompletenessPillar[] = [];

    // 1. Personal Details (15%)
    const hasPersonal = Boolean(applicant?.fullName && (applicant?.phone || applicant?.location));
    pillars.push({
      key: 'PERSONAL',
      label: 'Personal Information',
      weight: 15,
      completed: hasPersonal,
      score: hasPersonal ? 15 : applicant?.fullName ? 8 : 0,
      notes: hasPersonal ? 'Contact and identity profile complete' : 'Phone or current location pending',
    });

    // 2. Education (20%)
    const educationRecords = applicant?.educationRecords || [];
    const hasEdu = educationRecords.length > 0 && educationRecords.some((e: any) => e.degree && e.institution);
    pillars.push({
      key: 'EDUCATION',
      label: 'Academic Records',
      weight: 20,
      completed: hasEdu,
      score: hasEdu ? 20 : 0,
      notes: hasEdu ? `${educationRecords.length} academic qualification(s) recorded` : 'Degree and university details required',
    });

    // 3. Employment / Practical Experience (15%)
    const employmentRecords = applicant?.employmentRecords || [];
    const hasEmp = employmentRecords.length > 0;
    pillars.push({
      key: 'EMPLOYMENT',
      label: 'Work / Internship Experience',
      weight: 15,
      completed: hasEmp,
      score: hasEmp ? 15 : 0,
      notes: hasEmp ? `${employmentRecords.length} employment entry(ies) verified` : 'No professional or internship experience recorded yet',
    });

    // 4. Skills (10%)
    const skills = applicant?.applicantSkills || [];
    const hasSkills = skills.length >= 2;
    pillars.push({
      key: 'SKILLS',
      label: 'Technical & Professional Skills',
      weight: 10,
      completed: hasSkills,
      score: hasSkills ? 10 : skills.length > 0 ? 5 : 0,
      notes: hasSkills ? `${skills.length} core competencies registered` : 'Add at least 2 relevant technical skills',
    });

    // 5. Languages (15%)
    const languages = applicant?.applicantLanguages || [];
    const hasGerman = languages.some((l: any) => l.languageName?.toLowerCase().includes('german'));
    const hasLang = languages.length > 0;
    pillars.push({
      key: 'LANGUAGES',
      label: 'Language Proficiency',
      weight: 15,
      completed: hasLang && hasGerman,
      score: hasLang && hasGerman ? 15 : hasLang ? 8 : 0,
      notes: hasGerman ? 'German proficiency recorded' : 'German language proficiency evaluation pending',
    });

    // 6. Documents (15%)
    const documents = applicant?.documents || [];
    const hasDocs = documents.length >= 1;
    pillars.push({
      key: 'DOCUMENTS',
      label: 'Uploaded Documents & Certificates',
      weight: 15,
      completed: hasDocs,
      score: hasDocs ? 15 : 0,
      notes: hasDocs ? `${documents.length} document(s) uploaded` : 'Please upload CV or degree transcripts',
    });

    // 7. Motivation & Target Goals (10%)
    const goals = applicant?.goals || [];
    const hasMotivation = goals.length > 0 && Boolean(goals[0]?.motivation);
    pillars.push({
      key: 'MOTIVATION',
      label: 'Pathway Motivation & Target Goals',
      weight: 10,
      completed: hasMotivation,
      score: hasMotivation ? 10 : 0,
      notes: hasMotivation ? 'Target semester & motivation statement submitted' : 'Target intake and motivation statement pending',
    });

    const totalScore = pillars.reduce((acc, p) => acc + p.score, 0);
    const missingSummary = pillars.filter((p) => !p.completed).map((p) => p.notes);

    return {
      overallPercentage: Math.min(100, Math.round(totalScore)),
      pillars,
      missingSummary,
    };
  }
}
