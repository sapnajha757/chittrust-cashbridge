# ChitTrust + CashBridge 🪙🤝

> **Financial Inclusion Platform for Mixed Digital + Cash-Based Community Committees (Chit Funds / SHGs) in India**

---

## 📌 Problem

In informal and semi-formal community savings groups (Chit Funds, ROSCAs, Self-Help Groups) across India:
- **Cash Exclusion**: Cash-paying members are often excluded from formal credit scoring or digitized records.
- **Lack of Transparency**: Paper ledgers, missing transaction receipts, and unverified cash collections lead to disputes.
- **Credit Bias**: Digital payment users receive credit advantages, while cash micro-savers remain financially invisible.
- **Literacy & Access Barriers**: Low-literacy members cannot navigate complex banking apps or English-only user interfaces.

---

## 💡 Solution

**ChitTrust + CashBridge** bridges digital and cash participants into a single transparent community ledger:
- **Mixed Digital + Cash Groups**: Supports digital members (Razorpay UPI Test Mode) alongside cash-based micro-savers in the same group.
- **Verified CashBridge Agents**: Doorstep cash collection with mandatory photo proof uploaded to private, expiring signed URL storage.
- **Equal-Weight Trust Score**: Math-based credit score engine (+5 points for on-time payments) treating cash and UPI with identical credit status.
- **Feature Phone Multilingual Voice IVR**: Feature phone interface and simulator for checking Trust Scores and payment status in natural Hindi.
- **AI Risk Intelligence & Explainable AI**: Hybrid 7-rule operational risk engine with 0–100 risk scores and human-in-the-loop review portal.

---

## ✨ Key Features

- **Digital Payments**: Integrated Razorpay Test Mode with HMAC-SHA256 signature verification and webhook idempotency.
- **CashBridge Agent App**: Mobile-first doorstep cash collection with photo capture and member verification.
- **Explainable Trust Score**: Base score (100+), streak bonuses, and detailed breakdown of scoring factors (Cash = UPI).
- **Monthly Auctions & Payouts**: Support for both Bid Auctions (highest valid discount wins) and Lucky Draws with `Decimal` fixed-point math.
- **Ask ChitTrust AI**: Conversational assistant answering user queries in Hindi/English using database context and prompt injection protection.
- **Voice IVR Telephony**: Voice portal supporting phone lookup, authentication, and Hindi responses.
- **Risk Review Portal**: 7-rule risk detection engine with 0–100 risk scoring and organizer resolution capabilities.
- **Audit Logging & Notifications**: Full audit logging of all financial transactions and real-time in-app notifications.

---

## 🏗️ Architecture

```
                               ┌───────────────────────────────────┐
                               │       Next.js 14 Frontend         │
                               │  (App Router, React Auth Context) │
                               └─────────────────┬─────────────────┘
                                                 │ /api/v1/* (Proxy Rewrite)
                                                 ▼
                               ┌───────────────────────────────────┐
                               │       FastAPI Backend             │
                               │   (Auth, Risk Engine, AI, IVR)    │
                               └────────┬─────────────────┬────────┘
                                        │                 │
            ┌───────────────────────────┴─┐             ┌─┴────────────────────────────┐
            ▼                             ▼             ▼                              ▼
┌───────────────────────┐   ┌──────────────────────┐  ┌───────────────────┐  ┌───────────────────────┐
│ Supabase Cloud DB     │   │ Razorpay Test Mode   │  │ Groq LLM API      │  │ Twilio / Mock Voice   │
│ (21 Tables, RLS)      │   │ (UPI & Webhooks)     │  │ (AI Assistant)    │  │ (Telephony IVR)       │
└───────────────────────┘   └──────────────────────┘  └───────────────────┘  └───────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React, Supabase Auth Helper SDK.
- **Backend**: FastAPI (Python 3.14 / 3.11+), Pydantic v2, Pytest, Supabase-py.
- **Database**: Supabase Cloud PostgreSQL (21 tables, 27 migrations, Row Level Security policies).
- **Payments**: Razorpay Test Mode (HMAC Signature Verification & Webhook Idempotency).
- **AI & Voice**: Groq API (`gsk_...`), Twilio / Voice Simulator.

---

## 📁 Project Structure

```
ChitTrust — CashBridge/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # REST endpoints (auth, groups, contributions, auctions, risk, ai, voice)
│   │   ├── auth/               # Bearer JWT verification & RBAC authorization
│   │   ├── core/               # App configuration & security settings
│   │   ├── db/                 # Supabase client initialization
│   │   ├── models/             # Pydantic schemas
│   │   └── services/           # Business logic (Trust Score, Risk Engine, AI, Auctions, Payouts)
│   ├── tests/                  # Pytest backend test suite (57/57 passing)
│   ├── .env.example
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── app/                    # Next.js App Router pages (27 pages compiling)
│   ├── components/             # React UI components (Agent, Member, Organizer, Risk, Voice, AI)
│   ├── hooks/                  # Custom React hooks (useAuth, useToast)
│   ├── lib/                    # Supabase client & utility functions
│   ├── middleware.ts           # Route protection & role enforcement
│   ├── .env.example
│   └── package.json
├── supabase/
│   └── migrations/             # 27 SQL migration files
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- Supabase account (or local Supabase instance)

### Environment Variables

Copy `.env.example` templates to `.env.local` (frontend) and `backend/.env`:

```bash
# Root template reference
cp .env.example frontend/.env.local
cp backend/.env.example backend/.env
```

Ensure placeholders are replaced with your Supabase keys and provider credentials. **Never commit real secret keys.**

---

## 🗄️ Database Setup

The project uses Supabase PostgreSQL with 21 synchronized tables and 21 RLS policies:
- Run migrations from `supabase/migrations/` using Supabase CLI or direct SQL Editor in Supabase Cloud.
- Verified tables include: `profiles`, `groups`, `memberships`, `agents`, `contributions`, `auctions`, `bids`, `payouts`, `trust_scores`, `risk_flags`, `notifications`, `audit_logs`, etc.

---

## 🚀 Running Backend

```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python run.py
```

Backend will run at `http://localhost:8000`. Swagger API docs available at `http://localhost:8000/api/v1/docs`.

---

## 💻 Running Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at `http://localhost:3000`.

---

## 🧪 Running Tests

### Backend Unit & Integration Tests (Pytest)

```bash
cd backend
python -m pytest
```
*Expected Result*: **57/57 tests passing**.

### Frontend Build Test (Next.js)

```bash
cd frontend
npm run build
```
*Expected Result*: **27/27 static & dynamic pages compiled with 0 TypeScript/build errors**.

---

## 🎬 Demo Flow

1. **Landing Page** (`/`): Overview of ChitTrust + CashBridge inclusion message.
2. **Login & Role Selection** (`/login`): Log in as Organizer, Digital Member, Cash Member, or CashBridge Agent.
3. **Organizer Dashboard** (`/dashboard/organizer`): Create group, invite digital & cash members, assign verified agent.
4. **Digital Member Payment** (`/groups/[id]/contributions`): Pay monthly contribution using Razorpay TEST MODE.
5. **Agent Doorstep Cash Entry** (`/agent/cash-entry`): Select group/member, enter amount, capture mandatory photo proof, submit.
6. **Trust Score Inspection** (`/profile/trust-score`): View explainable score timeline (+5 points for both Cash & UPI).
7. **Monthly Auction & Payout** (`/groups/[id]/auction`): Submit discount bid, view winner, inspect calculated net payout.
8. **Ask ChitTrust AI** (Widget): Ask *"Mera trust score kya hai?"* in natural Hindi.
9. **Voice IVR Simulator** (`/dev/voice-demo`): Test toll-free phone lookup and voice status retrieval.
10. **Risk Review Portal** (`/risk-review`): Inspect AI Risk Scores and resolve/dismiss risk flags.

---

## 🔐 Security

- **JWT Authentication**: Supabase Bearer JWT token verification on all protected FastAPI endpoints.
- **Role-Based Access Control (RBAC)**: Strict permission enforcement for `organizer`, `member`, and `agent`.
- **Row Level Security (RLS)**: 21 Supabase RLS policies ensuring tenant data isolation.
- **Payment Verification**: Mandatory HMAC-SHA256 signature verification for Razorpay payments and webhooks.
- **Webhook Idempotency**: Duplicate event prevention using payload signature hashing.
- **Prompt Injection Defense**: Input sanitization and context scoping on AI endpoints.
- **Zero Committed Secrets**: Secrets managed strictly via ignored `.env` configuration files.

---

## 💳 Razorpay Test Mode

> [!NOTE]
> **Razorpay is configured strictly in TEST MODE (`rzp_test_...`) for hackathon presentation and judge demonstrations.**
> Real money is never charged during testing or demonstration.

---

## 🎙️ Voice & AI Provider Configuration

- **AI Assistant**: Powered by Groq LLM API (`GROQ_API_KEY`) with deterministic fallbacks when API is unreachable.
- **Voice IVR**: Configured with Twilio integration (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`) with an interactive in-browser voice simulator (`/dev/voice-demo`) for hackathon demonstration.

---

## 🌐 Deployment

- **Frontend**: Standard Next.js deployment on Vercel or Node.js server.
- **Backend**: FastAPI containerized deployment on Railway / Render / AWS App Runner.
- **Database**: Managed Supabase Cloud PostgreSQL.

---

## ⚠️ Limitations

- **Telephony Provider**: Live Twilio phone numbers require active carrier webhooks and regulatory verification in India.
- **Test Mode Payments**: Payments use Razorpay Test Mode keys for evaluation purposes.
- **Browser Camera Access**: Doorstep photo proof capture requires browser camera permission or file upload fallback.

---

## 🔮 Future Roadmap

- **WhatsApp Bot Integration**: Direct contribution receipts and auction notifications via WhatsApp Business API.
- **Offline Agent Sync**: Offline PWA storage for CashBridge agents operating in remote areas with low connectivity.
- **Official Credit Bureau Export**: API connectors for exporting ChitTrust scores to formal credit bureaus (CIBIL/Experian).

---

## ⚖️ Legal & Compliance Disclaimer

> [!IMPORTANT]
> **Hackathon MVP Notice**: ChitTrust + CashBridge is a technology platform prototype for transparent community savings group management. Actual chit fund or committee operations must comply with applicable Indian laws under the **Chit Funds Act, 1982**.
