# System Architecture Specification 🏗️

## Overview

**ChitTrust + CashBridge** is a hybrid digital + cash financial inclusion platform built for community savings committees (Chit Funds / SHGs) in India.

---

## 🏛️ High-Level System Architecture

```mermaid
flowchart TD
    subgraph Frontend["Next.js 14+ App Router (TypeScript)"]
        UI["Web App (Desktop / PWA)"]
        Nav["Role-Based Navigation"]
        NotifUI["Notification Center"]
        RiskUI["Risk & Review Portal"]
    end

    subgraph Backend["FastAPI Backend (Python 3.11+)"]
        API["REST API v1 Router"]
        TrustEngine["Trust Score Engine"]
        AuctionEngine["Auction & Payout Engine"]
        RiskEngine["7-Rule Risk Engine"]
        VoiceService["Voice IVR & Telephony Service"]
        NotifService["Multi-Channel Notification Dispatcher"]
    end

    subgraph Database["Supabase PostgreSQL & Cloud Services"]
        PG["PostgreSQL Database (18 Tables)"]
        RLS["Row Level Security (18 Policies)"]
        Auth["Supabase Auth (Phone OTP)"]
        Storage["Supabase Private Storage Bucket"]
    end

    subgraph External["External Integrations"]
        Razorpay["Razorpay Test Checkout"]
        Telephony["Twilio / Exotel / Mock Telephony"]
    end

    UI --> API
    API --> PG
    API --> Auth
    API --> Storage
    API --> Razorpay
    API --> Telephony
```

---

## 📁 Repository Sitemap

```text
ChitTrust — CashBridge/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/  # REST Endpoints (health, users, groups, contributions, auctions, payouts, analytics, risk, notifications, voice)
│   │   ├── core/               # App configuration, security, CORS, & exceptions
│   │   ├── schemas/            # Pydantic schemas (auction, payout, analytics, risk, notification)
│   │   └── services/           # Business logic (TrustScore, Auction, Payout, RiskEngine, Notification, Voice)
│   └── run.py                  # Uvicorn ASGI server entrypoint
├── frontend/
│   ├── app/                    # Next.js App Router (dashboard, groups, risk, notifications, profile, dev/voice-demo, privacy, terms)
│   ├── components/             # React UI Components (auction, analytics, risk, voice, common, ui)
│   └── hooks/                  # Custom React hooks (useAuth)
├── supabase/
│   └── migrations/             # 26 PostgreSQL migration files (000_full_schema.sql - 025_analytics_notifications_risk.sql)
└── docs/                       # Comprehensive documentation (security-audit, architecture, database-audit, security-scorecard, demo-script)
```
