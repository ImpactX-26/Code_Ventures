# EduPath AI — Your Intelligent Pathway to Germany
> **Hackathon-Ready Integrated Agentic AI Applicant Journey**  
> Powered by **Educaro** • Built for Indian applicants pursuing Study, Vocational Training (Ausbildung), and High-Skilled Employment in Germany.

---

## 🌟 Executive Summary

**EduPath AI** is an integrated, agentic AI platform that guides Indian applicants through the complex German educational and immigration landscape. Unlike disjointed chatbots or hardcoded mock demos, EduPath AI operates as **ONE coordinated 10-agent orchestration system**, reasoning over real user inputs, uploaded certificates, live German government regulations, and transparent qualification rules.

### Key Value Pillars
1. **Three Complete Pathways:**
   - 🎓 **Study in Germany:** Master & Bachelor degree matching, APS certificate guidance, and Bavarian GPA formula evaluation.
   - 🛠️ **Vocational Training (Ausbildung):** Dual vocational school placement, German language requirements (B1/B2), and school equivalence.
   - 💼 **Employment & EU Blue Card:** Skilled Immigration Act (FEG) salary threshold benchmarks, Anabin H+ recognition, and German CV formatting.
2. **Transparent Trust & Provenance Badge System:**
   - Every credential field distinguishes its exact data origin: `APPLICANT_PROVIDED`, `DOCUMENT_EXTRACTED`, `VIDEO_EXTRACTED`, `WEB_RESEARCH`, `VERIFIED`, or `AI_GENERATED`.
3. **Cross-Document Inconsistency & Conflict Detection:**
   - Compares self-reported inputs against CV, Degree certificates, and Experience letters (e.g. CV graduation 2025 vs Degree graduation 2024) and prompts the applicant to resolve.
4. **Live Regulatory Web Research Agent:**
   - Real-time statutory lookup from authoritative German government sources: DAAD, Make-it-in-Germany, KMK Anabin, and ZAB.
5. **Explainable Qualification Engine & Service Routing:**
   - Evaluates PostgreSQL-backed qualification rules (Ready / Additional Requirements / Not Ready) and routes gaps to Educaro's service catalog.

---

## 🛠️ Mandatory Technology Stack

### Frontend
- **Core:** ReactJS (v19) + TypeScript
- **Styling:** Tailwind CSS v4 + Vanilla CSS Design Tokens (Dark Navy, German Flag Accents, Glassmorphism)
- **Routing & State:** React Router v7, TanStack Query
- **Icons & Visualization:** Lucide React, Recharts

### Backend
- **Core:** NestJS (v12) + TypeScript
- **Database:** PostgreSQL (with cloud-based **Neon PostgreSQL** serverless integration)
- **ORM:** Prisma ORM (v6.4.1) with connection pooling & automated migrations
- **Authentication:** JWT, Passport, Bcrypt password hashing, 6-digit Email Verification OTP
- **File & Document Intelligence:** Multer, pdf-parse, mammoth (DOCX text extractor)
- **API Documentation:** OpenAPI / Swagger (`/api/docs`)
- **Email Service:** Nodemailer with automated Server Development Console OTP fallback

---

## 🤖 Multi-Agent Architecture (AI Journey Intelligence)

EduPath AI is driven by the **Applicant Orchestrator**, which manages 10 specialized agents:

```
Applicant
   │
   ▼
[Applicant Orchestrator]
   ├── 1. Intake Agent               (Progressive, pathway-specific questions)
   ├── 2. Profile Agent              (Dynamic completeness index across 7 pillars)
   ├── 3. Document Intelligence Agent (OCR extraction, entity parsing, confidence scoring)
   ├── 4. Web Research Agent         (Live search across DAAD, Anabin, Make it in Germany)
   ├── 5. Verification Agent         (Cross-document discrepancy & conflict detection)
   ├── 6. Clarification Agent        (Synthesizes targeted multiple-choice clarification tasks)
   ├── 7. Qualification Agent        (Assesses PostgreSQL rules: Ready / Additional Reqs / Not Ready)
   ├── 8. Recommendation Agent       (Determines next best action & routes to Educaro service)
   ├── 9. German CV Agent            (Formats verified data into DIN 5008 Lebenslauf)
   └── 10. Video Insight Agent       (Analyzes speech-to-text transcript for motivation & goals)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v20+ or v24)
- npm (v10+ or v11)

---

### Step 1: Cloud Database Setup with Neon PostgreSQL

EduPath AI is configured to use cloud-based **Neon PostgreSQL** (`neon.tech`):

1. Create a free project at [Neon](https://neon.tech).
2. Copy your PostgreSQL connection string from your Neon dashboard:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require"
   ```
3. Open `backend/.env` and paste your Neon connection string.
4. Push the schema and seed initial German qualification rules & Educaro services:
   ```bash
   cd backend
   npx prisma db push
   npx prisma db seed
   ```

*(Note: If you run without a Neon URL during local testing, EduPath AI features an automatic resilient in-memory fallback so registration, OTP verification, and all multi-agent journeys work immediately without crashing.)*

---

### Step 2: Start the NestJS Backend

```bash
cd backend
npm run start:dev
```
- **Backend API:** `http://localhost:3000`
- **Swagger Documentation:** `http://localhost:3000/api/docs`
- **Static Uploads:** `http://localhost:3000/uploads`

---

### Step 3: Start the React Frontend

Open a new terminal:
```bash
cd frontend
npm run dev
```
- **Frontend Application:** `http://localhost:5173`

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Applicant** | *Register any real email* | *Your password* | `/dashboard`, `/profile`, `/documents`, `/qualification` |
| **Consultant** | `consultant@educaro.de` | `ConsultantPass123!` | `/consultant` (Applicant inspection, audit logs, conflicts) |
| **Admin** | `admin@educaro.de` | `AdminPass123!` | Global administration |

---

## 📧 Email Verification & Development OTP Mode

When registering a new applicant:
1. User receives a secure single-use 6-digit OTP (expires in 10 minutes, max 5 attempts, 60s cooldown).
2. If SMTP credentials (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`) are configured in `backend/.env`, an HTML email is delivered to the inbox.
3. If SMTP is unconfigured during local development, **EduPath AI safely logs the OTP to the server console**:
   ```
   ======================================================
   📨 [EDUPATH AI EMAIL DISPATCHER - DEV CONSOLE MODE]
   TO:      applicant@gmail.com
   SUBJECT: [EduPath AI] Your 6-Digit Email Verification Code: 482915
   DETAILS:
   Hello Candidate,
   Your Germany Journey verification OTP is: >>> 482915 <<<
   Expires in 10 minutes.
   ======================================================
   ```
4. You can also view the auto-filled OTP directly on the `/verify-email` page in local test mode!

---

## 🗺️ Journey Roadmap & Key Screens

| Step | Page | Functionality |
| :---: | :--- | :--- |
| **1** | `/goal` | Choose Study vs Vocational Training (Ausbildung) vs Employment |
| **2** | `/onboarding` | EduGuide AI progressive questioning |
| **3** | `/dashboard` | Progress bar (82%), qualification status, missing items, next step |
| **4** | `/profile` | Structured profile with trust badges (`APPLICANT_PROVIDED`, `VERIFIED`) |
| **5** | `/documents` | OCR upload, extractions with confidence %, and conflict resolver |
| **6** | `/video` | 1-minute intro video recording, speech transcription, insight agent |
| **7** | `/web-research` | Live search of DAAD, Anabin, Make it in Germany with citations |
| **8** | `/qualification` | Preliminary Qualification engine: 🟢 Ready / 🟡 Additional Reqs / 🔴 Not Ready |
| **9** | `/recommendation` | Next best action & Educaro service catalog booking |
| **10** | `/cv` | German DIN 5008 Lebenslauf preview, export, and printable layout |
| **11** | `/agent-activity` | AI Journey Intelligence visual multi-agent timeline for judges |
| **12** | `/consultant` | Consultant evaluation center, applicant inspection, audit history |

---

## 🛡️ Trust & Security

- **Password Hashing:** Bcrypt with 10 salt rounds.
- **JWT Protection:** Signed Bearer tokens with role authorization (`APPLICANT`, `CONSULTANT`, `ADMIN`).
- **Data Grounding:** Zero hallucination. If a credential cannot be extracted from a document, it is never invented.
- **Audit Logging:** Every agent action records confidence scores, reasoning, and timestamps in PostgreSQL.

---

*EduPath AI — Designed and Engineered for Educaro Hackathon 2026.*
