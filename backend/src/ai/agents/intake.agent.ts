import { Injectable } from '@nestjs/common';
import { Pathway } from '@prisma/client';

export interface IntakeQuestion {
  id: string;
  field: string;
  question: string;
  category: 'PERSONAL' | 'EDUCATION' | 'EMPLOYMENT' | 'SKILLS' | 'LANGUAGES' | 'MOTIVATION';
  type: 'TEXT' | 'SELECT' | 'NUMBER' | 'MULTISELECT' | 'TEXTAREA';
  options?: string[];
  placeholder?: string;
  required: boolean;
}

@Injectable()
export class IntakeAgent {
  getNextQuestions(pathway: Pathway, existingData: any): IntakeQuestion[] {
    const allQuestions: Record<Pathway, IntakeQuestion[]> = {
      STUDY: [
        {
          id: 'edu_degree',
          field: 'degree',
          question: 'What is your highest completed or ongoing academic qualification?',
          category: 'EDUCATION',
          type: 'SELECT',
          options: ['B.Tech / B.E.', 'Bachelor of Science (B.Sc)', 'Bachelor of Commerce / Business (B.Com / BBA)', 'Master of Science (M.Sc)', 'M.Tech', '12th Standard / Higher Secondary (CBSE/State Board)'],
          required: true,
        },
        {
          id: 'edu_field',
          field: 'fieldOfStudy',
          question: 'What is your field of study or major specialization?',
          category: 'EDUCATION',
          type: 'TEXT',
          placeholder: 'e.g. Computer Science, Mechanical Engineering, Biotechnology',
          required: true,
        },
        {
          id: 'edu_institution',
          field: 'institution',
          question: 'Which university or college did you attend in India?',
          category: 'EDUCATION',
          type: 'TEXT',
          placeholder: 'e.g. Anna University, Delhi University, VTU, Mumbai University',
          required: true,
        },
        {
          id: 'edu_grad_date',
          field: 'graduationDate',
          question: 'What is your graduation year or expected completion date?',
          category: 'EDUCATION',
          type: 'SELECT',
          options: ['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027'],
          required: true,
        },
        {
          id: 'edu_grade',
          field: 'gradeCgpa',
          question: 'What is your academic score (CGPA or Percentage)?',
          category: 'EDUCATION',
          type: 'TEXT',
          placeholder: 'e.g. 8.2 CGPA or 78%',
          required: true,
        },
        {
          id: 'lang_german',
          field: 'germanLevel',
          question: 'What is your current German language proficiency level?',
          category: 'LANGUAGES',
          type: 'SELECT',
          options: ['None / Beginner (A0)', 'A1 (Basic)', 'A2 (Elementary)', 'B1 (Intermediate)', 'B2 (Upper Intermediate)', 'C1 (Advanced)'],
          required: true,
        },
        {
          id: 'lang_english',
          field: 'englishProficiency',
          question: 'Do you have an English language certificate (IELTS / TOEFL)?',
          category: 'LANGUAGES',
          type: 'SELECT',
          options: ['IELTS 6.5 or above', 'IELTS 6.0', 'TOEFL 90+', 'Medium of Instruction was English (MOI Letter)', 'Planning to take exam'],
          required: true,
        },
        {
          id: 'goal_target_intake',
          field: 'targetIntake',
          question: 'Which university semester are you targeting in Germany?',
          category: 'MOTIVATION',
          type: 'SELECT',
          options: ['Winter Semester 2025 (October)', 'Summer Semester 2026 (April)', 'Winter Semester 2026 (October)'],
          required: true,
        },
        {
          id: 'goal_motivation',
          field: 'motivation',
          question: 'Why do you want to pursue your higher studies in Germany?',
          category: 'MOTIVATION',
          type: 'TEXTAREA',
          placeholder: 'Explain your academic motivation, interest in German research, and career aspirations...',
          required: true,
        },
      ],
      VOCATIONAL: [
        {
          id: 'voc_education',
          field: 'degree',
          question: 'What is your current highest school or educational qualification?',
          category: 'EDUCATION',
          type: 'SELECT',
          options: ['12th Standard Passed (Science/Commerce/Arts)', '10th Standard Passed + 2 Year Diploma/ITI', 'Bachelor Degree Graduate'],
          required: true,
        },
        {
          id: 'voc_target_trade',
          field: 'preferredField',
          question: 'Which Ausbildung (Vocational Training) trade are you targeting in Germany?',
          category: 'EDUCATION',
          type: 'SELECT',
          options: [
            'Nursing Specialist (Pflegefachmann/-frau)',
            'Mechatronics Technician (Mechatroniker)',
            'IT Specialist - Application Development (Fachinformatiker)',
            'Hotel Management Specialist (Hotelfachmann/-frau)',
            'Automotive Service Mechatronics (Kfz-Mechatroniker)',
            'Electrical Engineering Technician (Elektroniker)',
          ],
          required: true,
        },
        {
          id: 'voc_german',
          field: 'germanLevel',
          question: 'What is your current German proficiency? (German B1/B2 is required for vocational schooling)',
          category: 'LANGUAGES',
          type: 'SELECT',
          options: ['A1 (Learning)', 'A2 (Certified)', 'B1 (Passed Goethe/telc)', 'B2 (Intermediate-High)', 'None / Just Starting'],
          required: true,
        },
        {
          id: 'voc_practical_exp',
          field: 'practicalExperience',
          question: 'Do you have any practical internships, clinical experience, or workshop training?',
          category: 'EMPLOYMENT',
          type: 'SELECT',
          options: ['1+ Years Practical Experience', '6 Months Internship', 'Under 6 Months Introductory Workshop', 'No practical experience yet'],
          required: false,
        },
        {
          id: 'voc_motivation',
          field: 'motivation',
          question: 'Why do you want to complete a dual vocational training (Ausbildung) in Germany?',
          category: 'MOTIVATION',
          type: 'TEXTAREA',
          placeholder: 'Describe your hands-on passion, why the German dual training system appeals to you, and your long-term plans...',
          required: true,
        },
      ],
      EMPLOYMENT: [
        {
          id: 'emp_degree',
          field: 'degree',
          question: 'What is your university degree qualification?',
          category: 'EDUCATION',
          type: 'SELECT',
          options: ['Bachelor of Technology / Engineering (B.Tech / B.E.)', 'Master of Technology / M.Sc', 'Bachelor of Computer Applications / MCA', 'B.Sc Nursing / Healthcare', 'Other Bachelor Degree'],
          required: true,
        },
        {
          id: 'emp_current_role',
          field: 'role',
          question: 'What is your current or most recent job title?',
          category: 'EMPLOYMENT',
          type: 'TEXT',
          placeholder: 'e.g. Senior Software Engineer, DevOps Engineer, Staff Nurse, Mechanical CAD Designer',
          required: true,
        },
        {
          id: 'emp_years_exp',
          field: 'experienceYears',
          question: 'How many total years of relevant professional work experience do you have?',
          category: 'EMPLOYMENT',
          type: 'SELECT',
          options: ['Less than 1 year', '1 - 2 years', '3 - 5 years', '5 - 8 years', '8+ years'],
          required: true,
        },
        {
          id: 'emp_skills',
          field: 'skills',
          question: 'What are your primary core technical skills or competencies?',
          category: 'SKILLS',
          type: 'TEXT',
          placeholder: 'e.g. Java, Spring Boot, Microservices, AWS, Docker, Kubernetes',
          required: true,
        },
        {
          id: 'emp_german',
          field: 'germanLevel',
          question: 'What is your German language level?',
          category: 'LANGUAGES',
          type: 'SELECT',
          options: ['A0 (None / English-only roles)', 'A1 (Basic Phrases)', 'A2 (Conversational Basic)', 'B1 (Conversational Working)', 'B2 (Professional Business Fluency)'],
          required: true,
        },
        {
          id: 'emp_motivation',
          field: 'motivation',
          question: 'What are your career goals and expectations in the German job market?',
          category: 'MOTIVATION',
          type: 'TEXTAREA',
          placeholder: 'Outline your target industry sectors, expectations regarding EU Blue Card, and long-term career roadmap...',
          required: true,
        },
      ],
    };

    const questions = allQuestions[pathway] || allQuestions.STUDY;
    // Filter out questions that have already been answered in existingData
    return questions.filter((q) => {
      const val = existingData ? existingData[q.field] : undefined;
      return val === undefined || val === null || val === '';
    });
  }
}
