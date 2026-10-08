# AeroPath AI 🇮🇳 ➔ 🇩🇪
### Intelligent AI-Powered Applicant Journey Platform for Germany Migration
**Built for the Educaro Hackathon**

[![NestJS](https://img.shields.io/badge/Backend-NestJS%2012-ea284e?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%206-2d3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 🎯 Executive Overview

**AeroPath AI** is an autonomous, agentic applicant journey platform designed specifically to guide Indian aspirants through the complex legal, academic, and vocational pathways required to study or work in Germany.

Moving to Germany from India involves rigorous checkpoints:
1. **APS India Verification:** Mandatory academic screening certificate from the German Embassy New Delhi since November 2022.
2. **KMK Anabin Institutional Equivalence:** Ensuring Indian universities hold `H+` recognition status.
3. **Bavarian GPA Conversion:** Translating Indian 10-point CGPA or percentage into the inverted German 1.0 – 4.0 grade scale via the official *Modified Bavarian Formula*.
4. **CEFR Language Benchmarks:** Meeting Goethe-Zertifikat / telc requirements (A2/B1 for Ausbildung; C1/IELTS for Masters).
5. **Subsistence Proof:** Setting up a Blocked Account (*Sperrkonto* of €11,908/year) or obtaining a paid vocational training contract (*Ausbildungsvertrag* with €1,200+/month stipend).

AeroPath AI solves these bottlenecks through an **agentic ReAct onboarding counselor**, **zero-hallucination data provenance**, and **real-time profile synchronization**.

---

## 🌟 Core Functionalities & System Modules

### 1. Database Schema & Prisma PostgreSQL Models
- **`ApplicantProfile`**: Full contact details, Indian origin city, target intake semester, goal track (`Study` | `Ausbildung` | `Employment`), onboarding lifecycle state.
- **`Education`**: Institutions, degrees, 4-year vs 3-year Bachelor distinction, graduation years, Indian CGPA/percentage, and computed Bavarian German grade equivalent.
- **`Employment`**: Work history, company, role, responsibilities, and total experience in months.
- **`Language`**: German & English CEFR proficiencies (A1–C2), certifying body (Goethe-Institut, telc, IELTS, TOEFL), modular scores, and verification status.
- **`Document`**: Degree certificates, transcripts, experience letters, CVs, and APS tokens with OCR confidence scores and verification flags.
- **`MotivationMedia`**: Aspirations, target federal states in Germany (Bavaria, NRW, Baden-Württemberg), speech-to-text video pitch transcript, and sentiment scores.
- **`QualificationRecommendation`**: Real-time completeness score (0–100%), overall eligibility determination (`ELIGIBLE` vs `CONDITIONALLY_ELIGIBLE`), missing requirement checklists, and matched **Educaro Service Packages**.

### 2. Autonomous Agentic ReAct Engine (`/api/agent/chat`)
Implements an authoritative **Reasoning + Acting (ReAct)** loop with full transparency:
- 💭 **Thought:** Agent reasons step-by-step about what the applicant stated and which German criteria must be verified.
- ⚡ **Action:** Calls discrete tools:
  - `update_profile_info`: Ingests contact, intake, and track preferences.
  - `extract_education_details`: Normalizes Indian degrees and calculates Bavarian GPA.
  - `record_employment_experience`: Logs Indian work experience.
  - `assess_language_proficiency`: Updates German CEFR levels.
  - `query_eligibility_and_aps`: Assesses Anabin `H+` status and APS New Delhi requirements.
  - `suggest_educaro_pathway`: Evaluates tailored Educaro service packages.
- 👁️ **Observation:** Structured tool execution outcome.
- 💬 **Final Answer:** Empathic counselor response delivered with clear provenance attribution.

### 3. Strict Data Provenance Separation (Zero Hallucination)
Every entity and field across the UI is strictly tagged:
- 🟢 **`[Verified]`**: Document OCR validated or certified test record.
- 🔵 **`[Applicant-Provided]`**: Direct conversational claims from the applicant.
- 🟣 **`[AI-Generated]`**: Bavarian grade conversions, completeness scores, and tailored Educaro routing.

### 4. Modified Bavarian Formula Converter
Calculates the official German GPA equivalent used by *uni-assist* and German public universities:
$$\text{German Grade} = 1 + 3 \times \frac{N_{\max} - N_d}{N_{\max} - N_{\min}}$$
Where $N_{\max} = 10.0$ (or 100%), $N_{\min} = 4.0$ (or 40%), and $N_d$ is the applicant's Indian score.
- **1.0 – 1.5:** *Sehr Gut* (Very Good)
- **1.6 – 2.5:** *Gut* (Competitive for Direct Master Entry)
- **2.6 – 3.5:** *Befriedigend* (Satisfactory)

### 5. Document OCR & Anabin Simulation (`/api/documents/...`)
Simulates document scanning on Indian degrees (SPPU, Anna University, VTU), Goethe-Zertifikate, and APS certificates, generating confidence scores, extracting metadata, and automatically upgrading profile records to **`[Verified]`**.

### 6. Speech-to-Text Video Pitch Analyzer (`/api/media/...`)
Captures video introduction pitches, transcribes audio, performs positive sentiment analysis, extracts motivation keywords, and updates profile readiness.

---

## 👥 Pre-Seeded Real-World Indian Personas

AeroPath AI includes 3 pre-seeded demo personas ready for immediate review:
1. **Aarav Sharma (Study Track)**
   - 4-Year B.E. Computer Engineering from Savitribai Phule Pune University (8.4 CGPA ➔ 1.8 German Grade *Gut*).
   - Goethe-Zertifikat A2 German, IELTS 7.5.
   - Target: English-taught M.Sc Data Science at TU Munich / RWTH Aachen.
   - Requirement: APS Certificate New Delhi & Blocked Account (€11,908).
2. **Ananya Nair (Ausbildung Track)**
   - General Nursing & Midwifery (GNM) Diploma from KUHS Kerala + 18 months ICU experience.
   - telc Deutsch B1 certified.
   - Target: *Pflegefachfrau* Dual Vocational Training in North Rhine-Westphalia with monthly stipend (€1,250+/month).
   - Requirement: *Defizitbescheid* & B2 Pflege upgrade.
3. **Vikram Patel (Employment Track)**
   - B.Tech Mechanical Engineering from Anna University + 3.5 years automotive CAE experience at Tata Motors.
   - Target: German Opportunity Card (*Chancenkarte* — 8 points scored).

---

## 🏗️ Architecture & Directory Layout

```
impact/
├── backend/                        # NestJS Backend Application
│   ├── prisma/
│   │   ├── schema.prisma           # Prisma PostgreSQL Schema
│   │   └── seed-data.ts            # Realistic Indian Applicant Personas
│   ├── src/
│   │   ├── agent/                  # ReAct Agent Orchestration & Tools
│   │   │   ├── agent.service.ts    # Thought -> Action -> Observation loop
│   │   │   ├── agent.controller.ts # /api/agent/chat endpoints
│   │   │   └── react-tools.ts      # ReAct tool definitions & executors
│   │   ├── applicants/             # Profile CRUD & Ingestion
│   │   ├── documents/              # OCR Simulation & Anabin Verification
│   │   ├── media/                  # Video Transcript Parser & Sentiment Engine
│   │   ├── recommendations/        # Bavarian GPA & Educaro Routing
│   │   ├── common/                 # Bavarian Calculator Formula
│   │   ├── prisma/                 # PrismaService with In-Memory Resilience Fallback
│   │   ├── app.module.ts           # Root Module
│   │   └── main.ts                 # Bootstrap with CORS & Port 4000
│   └── package.json
│
├── frontend/                       # ReactJS + TypeScript + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Corridor branding, track switcher & readiness meter
│   │   │   ├── ChatInterface.tsx   # Interactive counselor with ReAct trace dropdowns
│   │   │   ├── ProfileDashboard.tsx# Live structured categories with Provenance Badges
│   │   │   ├── RoadmapView.tsx     # Step-by-step milestones & Educaro service cards
│   │   │   ├── VideoRecorder.tsx   # Video pitch capture & speech-to-text analyzer
│   │   │   ├── DocumentOcrModal.tsx# OCR inspection drawer & Anabin verification
│   │   │   └── ProvenanceBadge.tsx # Provenance indicators (Verified, Provided, AI)
│   │   ├── services/
│   │   │   └── api.ts              # Full REST API client
│   │   ├── types/
│   │   │   └── index.ts            # Strict TypeScript interfaces
│   │   ├── App.tsx                 # Split-pane & multi-tab workspace
│   │   ├── index.css               # Tailwind CSS v4 design system
│   │   └── main.tsx
│   ├── vite.config.ts              # Vite config with /api proxy to Port 4000
│   └── package.json
│
├── package.json                    # Root orchestration scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on v24)
- **npm**: v9+
- Optional: PostgreSQL running locally at port 5432 (If PostgreSQL is not running, AeroPath AI's **Resilient Data Store** automatically activates so all features run without downtime).

### 1. Installation
Clone the repository:
```bash
git clone https://github.com/ImpactX-26/Code_Ventures.git
cd Code_Ventures
```

Install backend dependencies:
```bash
cd backend
npm install
npx prisma generate
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### 2. Running Locally

**Terminal 1 — Run Backend:**
```bash
cd backend
npm run start
# Running at http://localhost:4000
```

**Terminal 2 — Run Frontend:**
```bash
cd frontend
npm run dev
# Running at http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 🧪 Testing the Live Prototype

1. **ReAct Agent Conversational Interview:**
   - In the left pane, try sending:
     > *"I graduated with 8.4 CGPA in B.Tech Computer Engineering from Pune University and have German A2. What is my German GPA and is APS needed?"*
   - Expand the **"🧠 ReAct Chain-of-Thought"** panel on the AI response to inspect the step-by-step Thought, Tool Action, and Observation traces.
2. **Real-Time Structured Profile Synchronization:**
   - Observe how the right pane updates immediately with Bavarian GPA 1.8 (*Gut*), Anabin `H+` status, and verified tags.
3. **Run Document OCR Audit:**
   - Click **"📄 OCR Inspection"** in the top bar.
   - Choose *"Degree / 10+2"* or *"Goethe / telc"*.
   - Watch AeroOCR-v2 extract the credentials, verify against the Anabin database, and upgrade the profile entity to **`[Verified]`**.
4. **Record Video Introduction Pitch:**
   - Click **"📹 Pitch Video"**.
   - Click *"Start Video Pitch"*, speak or record, and click *"Stop & Parse Transcript"*.
   - Inspect the speech transcription, positive sentiment score (e.g. 94%), and motivation tags.
5. **Explore Migration Roadmap & Educaro Services:**
   - Switch to the **"Roadmap & Educaro"** tab to view the step-by-step checklist, APS requirements, blocked account needs, and matched Educaro service packages.

---

## 🛡️ License
Built with ❤️ for the **Educaro Hackathon**. MIT License.
