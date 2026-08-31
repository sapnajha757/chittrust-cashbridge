# ChitTrust + CashBridge 🪙🤝

> **Financial Inclusion Platform for Mixed Digital + Cash-Based Community Committees (Chit Funds / SHGs) in India**

---

## 📌 Project Overview

**ChitTrust + CashBridge** is a hackathon-ready financial inclusion platform built specifically for informal and semi-formal community savings groups (Chit Funds, ROSCAs, Self-Help Groups) across urban and rural India.

It bridges the gap between **digital-first members** (who prefer UPI/online payments) and **cash-based micro-savers** (who lack digital literacy or banking access), creating a **unified Trust Score** that treats digital and verified cash contributions with equal credit weight.

---

## 🏆 Monthly Auction & Payout Engine (Phase 9 Completed)

For complete auction semantics, discount formulas, and cash payout handover specs, see [docs/auctions_payouts.md](file:///c:/Users/sapna%20jha/ChitTrust%20—%20CashBridge/docs/auctions_payouts.md).

- **Bid Auctions & Lucky Draws**: Highest valid discount wins (`Net Payout = Total Pot - Winning Discount`). Supports server-side lucky draw selection.
- **Fixed-Point Monetary Precision**: Uses Python `Decimal` arithmetic for exact financial calculations.
- **CashBridge Doorstep Payout Handover**: Organizers assign CashBridge Agents to deliver cash payouts for cash winners, confirmed with mandatory photo proof.
- **Dedicated Monthly Auction Portal (`/groups/[id]/auction`)**: Visual timeline (`AuctionTimeline`), pot statistics (`AuctionCard`), member bidding form (`BidForm`), and agent handover modal (`PayoutConfirmModal`).
- **Voice IVR Integration**: Voice Assistant queries auction winners and payout statuses in natural Hindi (*"Is mahine ka auction complete ho gaya hai. Payout amount ₹8,500 hai."*).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **State & Auth**: Supabase Auth + React Auth Context (`useAuth`)
- **Payments**: Razorpay Checkout SDK (Test Mode) + Mobile Camera Capture + Voice IVR Simulator
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend & Database
- **Framework**: FastAPI (Python 3.11+)
- **Payments SDK**: Razorpay Python SDK (`razorpay`)
- **Telephony**: Provider Abstraction (Mock, Twilio, Exotel)
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

## 📈 Development Roadmap & Completed Phases

- [x] **Phase 1: Project Foundation** (Tech Stack, Modular Layout, Routing, Health Check, Types, Documentation)
- [x] **Phase 2: Database Schemas, RLS Security, Triggers & Storage** (10 Tables, 9 Enums, Triggers, RLS, Storage Bucket)
- [x] **Phase 3: Authentication, Onboarding & Role-Based Access** (Phone OTP, Profile Setup, Middleware, Dashboards)
- [x] **Phase 4: Group Creation & Membership Management** (Group Setup, Digital/Cash Invites, Agent Assignment, Exited State)
- [x] **Phase 5: Digital Contributions & Razorpay Test Payments** (Razorpay Test Mode, HMAC-SHA256 Verification, Webhook Idempotency, Receipts)
- [x] **Phase 6: CashBridge Doorstep Cash Verification Workflows** (Mobile-first Agent App, Photo Proof Capture, Private Storage, Notifications)
- [x] **Phase 7: Explainable TrustScore Calculation Engine** (Equal Credit Weight, Deterministic Points, Audit Ledger, Timeline UI)
- [x] **Phase 8: Multilingual Voice IVR & Hindi Trust Score Subsystem** (Feature Phone Telephony, Hindi Voice Prompts, Provider Abstraction, Voice Simulator)
- [x] **Phase 9: Monthly Auction & Payout Engine** (Bid Auctions, Lucky Draws, Net Payout Calculation, Doorstep Cash Payouts, Audit Trail)

---

## ⚖️ Legal & Compliance Disclaimer

> [!IMPORTANT]
> **Hackathon MVP Notice**: Real-world deployment requires formal compliance under India's **Chit Funds Act, 1982** and applicable state amendments.
