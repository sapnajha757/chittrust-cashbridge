# ChitTrust + CashBridge 🪙🤝

> **Financial Inclusion Platform for Mixed Digital + Cash-Based Community Committees (Chit Funds / SHGs) in India**

---

## 📌 Project Overview

**ChitTrust + CashBridge** is a hackathon-ready financial inclusion platform built specifically for informal and semi-formal community savings groups (Chit Funds, ROSCAs, Self-Help Groups) across urban and rural India.

It bridges the gap between **digital-first members** (who prefer UPI/online payments) and **cash-based micro-savers** (who lack digital literacy or banking access), creating a **unified Trust Score** that treats digital and verified cash contributions with equal credit weight.

---

## 🎯 Problem Statement

1. **Digital Exclusion in Community Chits**: Over 60% of rural and semi-urban community savings participants prefer or depend on cash. Traditional digital fintech platforms force users to adopt UPI, excluding cash members.
2. **Trust & Accounting Gaps**: Informal cash collections by local organizers lead to disputes, lost records, and lack of audit trails.
3. **Invisible Credit History**: Cash-based micro-savers contribute reliably for years but receive zero credit score benefit because their savings remain unrecorded in formal financial credit bureaus.

---

## 💡 Solution

- **Dual-Mode Contribution System**: Digital members pay via UPI/Razorpay; Cash members pay doorstep **CashBridge Agents**.
- **Photo-Verified Doorstep Receipts**: Agents collect cash, snap photo proof of the transaction + physical receipt, and instantly digitize the payment.
- **Equal-Weight TrustScore**: System rewards on-time cash payments identically to digital payments, producing a verifiable community trust rating.
- **Multi-Role Portal**: Dedicated dashboards for **Organizers**, **Digital Members**, **Cash Members**, and **CashBridge Agents**.

---

## 🔑 Auth & Onboarding Architecture (Phase 3 Completed)

For complete authentication flow diagrams and role security rules, see [docs/authentication.md](file:///c:/Users/sapna%20jha/ChitTrust%20—%20CashBridge/docs/authentication.md).

- **Phone OTP Verification**: Indian mobile number input with strict `+91XXXXXXXXXX` normalization.
- **Role-Based Onboarding**: Seamless profile creation supporting Organizers, Members, and CashBridge Agents.
- **Privilege Safeguards**: Self-creation of `admin` is blocked; CashBridge Agent selection creates a pending application (`verified_status = 'pending'`).
- **Route Protection**: Next.js middleware guards private routes (`/dashboard`, `/profile`, `/groups`, `/agent`).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **State & Auth**: Supabase Auth + React Auth Context (`useAuth`)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend & Database
- **Framework**: FastAPI (Python 3.11+)
- **Database**: Supabase PostgreSQL + Auth + Storage
- **Security**: Row Level Security (RLS) & Pgcrypto

---

## ⚡ Quick Start & App Setup Instructions

### 1. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```
Available at `http://localhost:3000`.

### 2. Backend Setup

```bash
cd backend

# Activate virtual environment (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Run FastAPI backend server
python run.py
```
Available at `http://localhost:8000`.

---

## 📈 Development Roadmap & Planned Phases

- [x] **Phase 1: Project Foundation** (Tech Stack, Modular Layout, Routing, Health Check, Types, Documentation)
- [x] **Phase 2: Database Schemas, RLS Security, Triggers & Storage** (10 Tables, 9 Enums, Triggers, RLS, Storage Bucket)
- [x] **Phase 3: Authentication, Onboarding & Role-Based Access** (Phone OTP, Profile Setup, Middleware, Dashboards)
- [ ] **Phase 4: Dual Contribution & CashBridge Agent Verification Workflows**
- [ ] **Phase 5: TrustScore Calculation Engine & Auction Bidding Engine**
- [ ] **Phase 6: Razorpay UPI & Twilio SMS Alerts Integration**
- [ ] **Phase 7: Groq Multilingual Voice AI Assistance for Low-Literacy Users**

---

## ⚖️ Legal & Compliance Disclaimer

> [!IMPORTANT]
> **Hackathon MVP Notice**: Real-world deployment requires formal compliance under India's **Chit Funds Act, 1982** and applicable state amendments.
