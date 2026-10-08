import { PrismaClient, Pathway, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding EduPath AI Database (PostgreSQL / Neon)...');

  // 1. Seed Default Services Catalog
  const services = [
    {
      name: 'Germany Study Counselling',
      slug: 'study-counselling',
      description: 'Comprehensive 1-on-1 university selection, APS certificate guidance, and German visa interview preparation.',
      category: 'ACADEMIC',
      targetPathways: [Pathway.STUDY],
      duration: '4 weeks',
      active: true,
    },
    {
      name: 'Ausbildung & Vocational Placement',
      slug: 'ausbildung-placement',
      description: 'Matching with certified German training enterprises, school certificate recognition, and contract facilitation.',
      category: 'VOCATIONAL',
      targetPathways: [Pathway.VOCATIONAL],
      duration: '8 weeks',
      active: true,
    },
    {
      name: 'Fast-Track Employment & Blue Card',
      slug: 'employment-blue-card',
      description: 'Anerkennung qualification recognition, employer matching, and German EU Blue Card fast-track immigration filing.',
      category: 'CAREER',
      targetPathways: [Pathway.EMPLOYMENT],
      duration: '6 weeks',
      active: true,
    },
    {
      name: 'Official Document Verification & Anabin Pre-Check',
      slug: 'document-verification',
      description: 'Pre-assessment of Indian university degrees and transcripts against the German KMK Anabin database and ZAB standards.',
      category: 'VERIFICATION',
      targetPathways: [Pathway.STUDY, Pathway.VOCATIONAL, Pathway.EMPLOYMENT],
      duration: '5 business days',
      active: true,
    },
    {
      name: 'German Language Mastery (Goethe / telc A1 - B2)',
      slug: 'language-preparation',
      description: 'Intensive Goethe-Institut curriculum with certified German native trainers tailored for visa interview requirements.',
      category: 'LANGUAGE',
      targetPathways: [Pathway.STUDY, Pathway.VOCATIONAL, Pathway.EMPLOYMENT],
      duration: '12 weeks',
      active: true,
    },
    {
      name: 'German Lebenslauf & Cover Letter Engineering',
      slug: 'cv-application-support',
      description: 'Adapting Indian CVs to strict German DIN 5008 standards with ATS keyword optimization for German HR portals.',
      category: 'APPLICATION',
      targetPathways: [Pathway.STUDY, Pathway.VOCATIONAL, Pathway.EMPLOYMENT],
      duration: '3 business days',
      active: true,
    },
    {
      name: 'Dedicated Senior Consultant Appointment',
      slug: 'consultant-appointment',
      description: 'Direct 45-minute strategic evaluation with an Educaro Germany migration and education consultant.',
      category: 'CONSULTATION',
      targetPathways: [Pathway.STUDY, Pathway.VOCATIONAL, Pathway.EMPLOYMENT],
      duration: '45 minutes',
      active: true,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }
  console.log(`✅ Seeded ${services.length} Educaro services`);

  // 2. Seed Qualification Rules
  const rules = [
    // STUDY RULES
    {
      ruleCode: 'STUDY_DEGREE_RECOGNITION',
      pathway: Pathway.STUDY,
      requirement: 'Higher Education Entrance Qualification (HZB / Anabin H+)',
      description: 'Applicant bachelor or school certificate must be recognized in Germany via Anabin database or APS certification.',
      required: true,
      source: 'KMK Anabin / DAAD Academic Standards',
      active: true,
    },
    {
      ruleCode: 'STUDY_ACADEMIC_GPA',
      pathway: Pathway.STUDY,
      requirement: 'Minimum Academic Performance (German Grade <= 2.5 or CGPA >= 65%)',
      description: 'Most public universities in Germany require minimum Bavarian formula grade score under 2.5 for admission.',
      required: true,
      source: 'Hochschulkompass / German Universities Admission Office',
      active: true,
    },
    {
      ruleCode: 'STUDY_LANGUAGE_PROFICIENCY',
      pathway: Pathway.STUDY,
      requirement: 'Certified Language Proficiency (English B2/C1 or German B1/B2)',
      description: 'IELTS min 6.5 / TOEFL 90 for English programs or Goethe/TestDaF B2/C1 for German taught curricula.',
      required: true,
      source: 'German Federal Foreign Office (Auswärtiges Amt)',
      active: true,
    },
    {
      ruleCode: 'STUDY_BLOCKED_ACCOUNT',
      pathway: Pathway.STUDY,
      requirement: 'Proof of Financial Resources (Sperrkonto / Blocked Account)',
      description: 'Mandatory proof of minimum €11,904 per year deposited in a German blocked account (Sperrkonto).',
      required: true,
      source: 'Make it in Germany / German Immigration Law § 16b AufenthG',
      active: true,
    },

    // VOCATIONAL / AUSBILDUNG RULES
    {
      ruleCode: 'AUSBILDUNG_GERMAN_LEVEL',
      pathway: Pathway.VOCATIONAL,
      requirement: 'German Language Certificate (Minimum B1, recommended B2)',
      description: 'Vocational training schools (Berufsschule) conduct all theory classes strictly in German.',
      required: true,
      source: 'Federal Institute for Vocational Education and Training (BIBB)',
      active: true,
    },
    {
      ruleCode: 'AUSBILDUNG_SCHOOL_LEAVING',
      pathway: Pathway.VOCATIONAL,
      requirement: 'Recognized 10+2 / High School Certificate (Realschulabschluss equivalent)',
      description: 'High school diploma from recognized Indian state or central board (CBSE/ICSE/State Board).',
      required: true,
      source: 'Zentralstelle für ausländisches Bildungswesen (ZAB)',
      active: true,
    },
    {
      ruleCode: 'AUSBILDUNG_PRACTICAL_EXPERIENCE',
      pathway: Pathway.VOCATIONAL,
      requirement: 'Field Familiarity or Introductory Internship Evidence',
      description: 'Demonstrable interest or vocational internship certificates related to the target Ausbildung trade.',
      required: false,
      source: 'Educaro Enterprise Partner Requirements',
      active: true,
    },

    // EMPLOYMENT RULES
    {
      ruleCode: 'EMPLOYMENT_DEGREE_EQUIVALENCE',
      pathway: Pathway.EMPLOYMENT,
      requirement: 'Comparability of Foreign University Degree (Anerkennung / Anabin H+)',
      description: 'Recognized academic degree comparable to a German university degree (ZAB statement of comparability).',
      required: true,
      source: 'Anerkennung in Deutschland / Skilled Immigration Act (FEG)',
      active: true,
    },
    {
      ruleCode: 'EMPLOYMENT_WORK_EXPERIENCE',
      pathway: Pathway.EMPLOYMENT,
      requirement: 'Relevant Professional Experience (Minimum 2+ years in IT/Engineering/Nursing)',
      description: 'Documented work experience letters with clear technical roles and project responsibilities.',
      required: true,
      source: 'Bundesagentur für Arbeit (Federal Employment Agency)',
      active: true,
    },
    {
      ruleCode: 'EMPLOYMENT_LANGUAGE_LEVEL',
      pathway: Pathway.EMPLOYMENT,
      requirement: 'Professional Working Language (English B2+ for Tech, German B1/B2 for Non-Tech/Healthcare)',
      description: 'English fluency is sufficient for multinational tech roles; nursing and regulated professions strictly require German B2.',
      required: true,
      source: 'German Skilled Immigration Act (Fachkräfteeinwanderungsgesetz)',
      active: true,
    },
  ];

  for (const r of rules) {
    await prisma.qualificationRule.upsert({
      where: { ruleCode: r.ruleCode },
      update: r,
      create: r,
    });
  }
  console.log(`✅ Seeded ${rules.length} qualification rules`);

  // 3. Seed Standard Skills
  const defaultSkills = [
    { name: 'Python', category: 'Software Development' },
    { name: 'Java', category: 'Software Development' },
    { name: 'TypeScript', category: 'Software Development' },
    { name: 'React', category: 'Frontend Development' },
    { name: 'Node.js', category: 'Backend Development' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'Docker & Kubernetes', category: 'DevOps' },
    { name: 'AWS Cloud', category: 'Cloud Computing' },
    { name: 'Embedded Systems', category: 'Electrical Engineering' },
    { name: 'CAD / SolidWorks', category: 'Mechanical Engineering' },
    { name: 'General Patient Care', category: 'Nursing & Healthcare' },
    { name: 'Patient Documentation', category: 'Healthcare' },
  ];

  for (const s of defaultSkills) {
    await prisma.skill.upsert({
      where: { name: s.name },
      update: s,
      create: s,
    });
  }

  // 4. Seed Standard Languages
  const defaultLanguages = [
    { name: 'German', code: 'de' },
    { name: 'English', code: 'en' },
    { name: 'Hindi', code: 'hi' },
    { name: 'Tamil', code: 'ta' },
    { name: 'Telugu', code: 'te' },
    { name: 'Malayalam', code: 'ml' },
    { name: 'Marathi', code: 'mr' },
  ];

  for (const l of defaultLanguages) {
    await prisma.language.upsert({
      where: { name: l.name },
      update: l,
      create: l,
    });
  }

  // 5. Seed Consultant and Admin Accounts
  const consultantHash = await bcrypt.hash('ConsultantPass123!', 10);
  await prisma.user.upsert({
    where: { email: 'consultant@educaro.de' },
    update: {
      passwordHash: consultantHash,
      role: UserRole.CONSULTANT,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    create: {
      email: 'consultant@educaro.de',
      passwordHash: consultantHash,
      role: UserRole.CONSULTANT,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  const adminHash = await bcrypt.hash('AdminPass123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@educaro.de' },
    update: {
      passwordHash: adminHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    create: {
      email: 'admin@educaro.de',
      passwordHash: adminHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  console.log('✅ Seeded Consultant (consultant@educaro.de) and Admin (admin@educaro.de) credentials.');
  console.log('🎉 EduPath AI Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
