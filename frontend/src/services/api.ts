import {
  ApplicantProfile,
  ChatMessage,
  ReActStep,
  PathwayComparisonResult,
  EducaroCounselorDossier,
} from '../types/index';

const API_BASE = '/api';

export const api = {
  // Applicants
  async getApplicants(): Promise<ApplicantProfile[]> {
    const res = await fetch(`${API_BASE}/applicants`);
    if (!res.ok) throw new Error('Failed to fetch applicants');
    return res.json();
  },

  async getApplicant(id: string): Promise<ApplicantProfile> {
    const res = await fetch(`${API_BASE}/applicants/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch applicant ${id}`);
    return res.json();
  },

  async updateApplicant(id: string, patch: Partial<ApplicantProfile>): Promise<ApplicantProfile> {
    const res = await fetch(`${API_BASE}/applicants/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('Failed to update applicant');
    return res.json();
  },

  async createApplicant(data: Partial<ApplicantProfile>): Promise<ApplicantProfile> {
    const res = await fetch(`${API_BASE}/applicants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create applicant');
    return res.json();
  },

  async resetDemoApplicant(id: string): Promise<ApplicantProfile> {
    const res = await fetch(`${API_BASE}/applicants/${id}/reset-demo`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset demo applicant');
    return res.json();
  },

  // Export Counselor Dossier (Feature 3)
  async exportDossier(applicantId: string): Promise<EducaroCounselorDossier> {
    const res = await fetch(`${API_BASE}/applicants/${applicantId}/export-dossier`);
    if (!res.ok) throw new Error('Failed to export counselor dossier');
    return res.json();
  },

  // Multi-Pathway "What-If" Simulation Branching (Feature 2)
  async getPathwayComparison(applicantId: string): Promise<PathwayComparisonResult> {
    const res = await fetch(`${API_BASE}/recommendations/${applicantId}/pathway-comparison`);
    if (!res.ok) throw new Error('Failed to fetch pathway comparison');
    return res.json();
  },

  async simulateWhatIf(
    applicantId: string,
    overrides: {
      germanLevel?: string;
      gpaOrPercentage?: number;
      experienceMonths?: number;
      hasApsCertificate?: boolean;
      goalTrack?: 'Study' | 'Ausbildung' | 'Employment';
    },
  ): Promise<PathwayComparisonResult> {
    const res = await fetch(`${API_BASE}/recommendations/${applicantId}/simulate-what-if`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(overrides),
    });
    if (!res.ok) throw new Error('Failed to simulate what-if branching');
    return res.json();
  },

  // Agent Chat (ReAct loop)
  async sendChatMessage(
    applicantId: string,
    message: string,
    sessionId?: string,
  ): Promise<{
    sessionId: string;
    applicantId: string;
    response: string;
    reactSteps: ReActStep[];
    updatedProfileSummary: any;
  }> {
    const res = await fetch(`${API_BASE}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicantId, message, sessionId }),
    });
    if (!res.ok) throw new Error('Agent chat failed');
    return res.json();
  },

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const res = await fetch(`${API_BASE}/agent/history/${sessionId}`);
    if (!res.ok) return [];
    return res.json();
  },

  // Document OCR simulation
  async simulateOcr(applicantId: string, documentId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/documents/applicant/${applicantId}/ocr-simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId }),
    });
    if (!res.ok) throw new Error('Document OCR simulation failed');
    return res.json();
  },

  async uploadDocument(applicantId: string, docData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/documents/applicant/${applicantId}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docData),
    });
    if (!res.ok) throw new Error('Failed to upload document');
    return res.json();
  },

  // Media / Video Transcript
  async processVideoTranscript(
    applicantId: string,
    data: {
      transcript?: string;
      videoUrl?: string;
      durationSeconds?: number;
      primaryReason?: string;
      longTermGoals?: string;
      targetRegions?: string[];
    },
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/media/video-transcript`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicantId, ...data }),
    });
    if (!res.ok) throw new Error('Failed to parse video transcript');
    return res.json();
  },

  // Bavarian GPA Calculator
  async calculateBavarianGpa(score: number, maxScore = 10, minPassingScore = 4): Promise<any> {
    const res = await fetch(`${API_BASE}/recommendations/calculate-bavarian-gpa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, maxScore, minPassingScore }),
    });
    if (!res.ok) throw new Error('Failed to calculate Bavarian GPA');
    return res.json();
  },
};
