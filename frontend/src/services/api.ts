import axios from 'axios';
import {
  User,
  Applicant,
  ProfileCompleteness,
  QualificationAssessment,
  Recommendation,
  ServiceCatalogItem,
  ResearchSource,
  AgentAction,
  DocumentRecord,
  DocumentConflict,
  ClarificationTask,
  Pathway,
  DocumentType,
} from '../types/index.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('edupath_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired or unauthorized
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register') && !path.includes('/verify-email') && path !== '/') {
        localStorage.removeItem('edupath_token');
        localStorage.removeItem('edupath_user');
      }
    }
    return Promise.reject(error);
  },
);

// Auth Endpoints
export const authApi = {
  register: async (data: { fullName: string; email: string; password: string; confirmPassword: string }) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },
  verifyEmail: async (data: { email: string; otp: string }) => {
    const res = await apiClient.post('/auth/verify-email', data);
    return res.data;
  },
  resendVerification: async (data: { email: string }) => {
    const res = await apiClient.post('/auth/resend-verification', data);
    return res.data;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', data);
    return res.data;
  },
  forgotPassword: async (data: { email: string }) => {
    const res = await apiClient.post('/auth/forgot-password', data);
    return res.data;
  },
  resetPassword: async (data: { email: string; otp: string; newPassword: string; confirmPassword: string }) => {
    const res = await apiClient.post('/auth/reset-password', data);
    return res.data;
  },
  getMe: async (): Promise<{ user: User; applicant: Applicant }> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
};

// Applicant & Journey Endpoints
export const applicantApi = {
  getApplicant: async (id: string): Promise<Applicant> => {
    const res = await apiClient.get(`/applicants/${id}`);
    return res.data;
  },
  updateApplicant: async (id: string, data: Partial<Applicant>): Promise<Applicant> => {
    const res = await apiClient.patch(`/applicants/${id}`, data);
    return res.data;
  },
  setGoal: async (
    id: string,
    goal: { pathway: Pathway; preferredField?: string; targetIntake?: string; motivation?: string },
  ) => {
    const res = await apiClient.post(`/applicants/${id}/goal`, goal);
    return res.data;
  },
  updateProfile: async (id: string, profileData: any) => {
    const res = await apiClient.patch(`/applicants/${id}/profile`, profileData);
    return res.data;
  },
  getCompleteness: async (id: string): Promise<ProfileCompleteness> => {
    const res = await apiClient.get(`/applicants/${id}/completeness`);
    return res.data;
  },
  getAgentRuns: async (id: string): Promise<AgentAction[]> => {
    const res = await apiClient.get(`/applicants/${id}/agent-runs`);
    return res.data;
  },
};

// Document Intelligence Endpoints
export const documentApi = {
  uploadDocument: async (applicantId: string, file: File, documentType: DocumentType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    const res = await apiClient.post(`/applicants/${applicantId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getDocuments: async (applicantId: string): Promise<{ documents: DocumentRecord[]; conflicts: DocumentConflict[] }> => {
    const res = await apiClient.get(`/applicants/${applicantId}/documents`);
    return res.data;
  },
  verifyExtraction: async (extractionId: string, status: string) => {
    const res = await apiClient.post(`/documents/${extractionId}/verify`, { status });
    return res.data;
  },
  resolveConflict: async (conflictId: string, resolvedValue: string, resolvedBy = 'Applicant') => {
    const res = await apiClient.post(`/documents/conflicts/${conflictId}/resolve`, {
      resolvedValue,
      resolvedBy,
    });
    return res.data;
  },
};

// Live Web Research Endpoints
export const researchApi = {
  triggerResearch: async (applicantId: string, query?: string) => {
    const res = await apiClient.post(`/applicants/${applicantId}/research`, { query });
    return res.data;
  },
  getResearch: async (applicantId: string): Promise<{ sources: ResearchSource[]; notice: string }> => {
    const res = await apiClient.get(`/applicants/${applicantId}/research`);
    return res.data;
  },
};

// Clarification Endpoints
export const clarificationApi = {
  getQuestions: async (applicantId: string): Promise<ClarificationTask[]> => {
    const res = await apiClient.get(`/applicants/${applicantId}/questions`);
    return res.data;
  },
  answerQuestion: async (questionId: string, answer: { selectedOption?: string; customAnswer?: string }) => {
    const res = await apiClient.post(`/questions/${questionId}/answer`, answer);
    return res.data;
  },
};

// Introduction Video Endpoints
export const videoApi = {
  uploadVideo: async (applicantId: string, file?: File | Blob, transcript?: string) => {
    const formData = new FormData();
    if (file) {
      formData.append('video', file, 'recorded_video.webm');
    }
    if (transcript) {
      formData.append('transcript', transcript);
    }
    const res = await apiClient.post(`/applicants/${applicantId}/video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getVideoDetails: async (applicantId: string) => {
    const res = await apiClient.get(`/applicants/${applicantId}/video`);
    return res.data;
  },
};

// Qualification Endpoints
export const qualificationApi = {
  assess: async (applicantId: string): Promise<QualificationAssessment> => {
    const res = await apiClient.post(`/applicants/${applicantId}/qualification/assess`);
    return res.data;
  },
  getLatest: async (applicantId: string): Promise<QualificationAssessment> => {
    const res = await apiClient.get(`/applicants/${applicantId}/qualification`);
    return res.data;
  },
};

// Recommendations & Service Catalog
export const recommendationApi = {
  getRecommendation: async (applicantId: string): Promise<Recommendation> => {
    const res = await apiClient.get(`/applicants/${applicantId}/recommendation`);
    return res.data;
  },
  refresh: async (applicantId: string): Promise<Recommendation> => {
    const res = await apiClient.post(`/applicants/${applicantId}/recommendation/refresh`);
    return res.data;
  },
  getServices: async (): Promise<ServiceCatalogItem[]> => {
    const res = await apiClient.get('/services');
    return res.data;
  },
};

// CV Endpoints
export const cvApi = {
  generateCv: async (applicantId: string, template?: string) => {
    const res = await apiClient.post(`/applicants/${applicantId}/cv/generate`, { template });
    return res.data;
  },
  getLatestCv: async (applicantId: string) => {
    const res = await apiClient.get(`/applicants/${applicantId}/cv`);
    return res.data;
  },
};

// Consultant Portal Endpoints
export const consultantApi = {
  getDashboard: async () => {
    const res = await apiClient.get('/consultants/dashboard');
    return res.data;
  },
  getApplicants: async () => {
    const res = await apiClient.get('/consultants/applicants');
    return res.data;
  },
  getApplicantDetail: async (id: string) => {
    const res = await apiClient.get(`/consultants/applicants/${id}`);
    return res.data;
  },
};
