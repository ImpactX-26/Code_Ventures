export interface BavarianCalculationResult {
  germanGrade: number;
  germanGradeClassification: string;
  isEligibleForGermanUniversities: boolean;
  minGermanPassing: number;
  inputScore: number;
  maxScore: number;
  minPassingScore: number;
  explanation: string;
}

/**
 * Calculates German GPA equivalent using the official Modified Bavarian Formula
 * used by German Universities (uni-assist & Kultusministerkonferenz).
 *
 * Formula: German Grade = 1 + 3 * ((Nmax - Nd) / (Nmax - Nmin))
 *
 * @param score Applicant's earned grade/percentage (Nd)
 * @param maxScore Maximum achievable grade (Nmax, default 10 for CGPA or 100 for %)
 * @param minPassingScore Minimum passing grade (Nmin, default 4 for CGPA or 40 for %)
 */
export function calculateBavarianGpa(
  score: number,
  maxScore: number = 10,
  minPassingScore: number = 4,
): BavarianCalculationResult {
  const nD = Math.min(Math.max(score, minPassingScore), maxScore);
  const nMax = maxScore;
  const nMin = minPassingScore;

  if (nMax <= nMin) {
    throw new Error('Maximum score must be greater than minimum passing score');
  }

  // Modified Bavarian Formula
  let germanGrade = 1 + 3 * ((nMax - nD) / (nMax - nMin));
  germanGrade = Math.round(germanGrade * 10) / 10; // Round to 1 decimal place

  // Bound between 1.0 (highest) and 4.0 (lowest passing)
  if (germanGrade < 1.0) germanGrade = 1.0;
  if (germanGrade > 4.0) germanGrade = 4.0;

  let classification = '';
  if (germanGrade <= 1.5) {
    classification = 'Sehr Gut (Very Good / Outstanding)';
  } else if (germanGrade <= 2.5) {
    classification = 'Gut (Good / Highly Competitive for Direct Master Entry)';
  } else if (germanGrade <= 3.5) {
    classification = 'Befriedigend (Satisfactory / Eligible for Select Programs & Studienkolleg)';
  } else {
    classification = 'Ausreichend (Sufficient / Minimum Passing)';
  }

  const isEligible = germanGrade <= 2.5;

  return {
    germanGrade,
    germanGradeClassification: classification,
    isEligibleForGermanUniversities: isEligible,
    minGermanPassing: 4.0,
    inputScore: score,
    maxScore,
    minPassingScore,
    explanation: `Calculated via Modified Bavarian Formula: 1 + 3 * (${nMax} - ${score}) / (${nMax} - ${nMin}) = ${germanGrade}`,
  };
}
