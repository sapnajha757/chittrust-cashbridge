# AI Trust Intelligence Layer Architecture 🤖🧠

## Overview

The **AI Trust Intelligence Layer** augments ChitTrust's verified ledger with explainable operational risk signals, conversational voice assistance, and Group Health analytics.

---

## 🏛️ AI Subsystem Architecture

```mermaid
flowchart TD
    subgraph DataLayer["Verified Source of Truth"]
        PG["PostgreSQL Ledger"]
        Events["Trust Score Events"]
    end

    subgraph FeatureEngine["Feature Engineering Service"]
        FE["PII-Free Feature Extractor"]
    end

    subgraph RiskEngine["Hybrid AI Risk Engine"]
        Rules["7 Deterministic Rules"]
        Devs["Baseline Deviation Calculator"]
        Scorer["0-100 Risk Scorer & Confidence Index"]
    end

    subgraph AIProvider["Provider Abstraction & Fallback"]
        MockProvider["MockAIProvider (Deterministic)"]
        GroqProvider["GroqProvider (LLM API)"]
    end

    subgraph Governance["Human-in-the-Loop Governance"]
        ReviewPortal["/risk-review Portal"]
        Resolution["Human Review & Audit Trail"]
    end

    PG --> FE
    FE --> Rules
    Rules --> Devs
    Devs --> Scorer
    Scorer --> MockProvider
    Scorer --> GroqProvider
    MockProvider --> ReviewPortal
    GroqProvider --> ReviewPortal
    ReviewPortal --> Resolution
```

---

## 🔒 Three-Concept Separation

```text
Trust Score   : Member behavioral reliability index (Base 100+). Updated ONLY by verified contributions.
Risk Score    : Operational anomaly review signal (0-100: Low, Medium, High, Critical).
AI Confidence : Statistical model confidence (0.00 to 1.00, e.g., 0.86).
```

- **Strict Isolation Principle**: Creating, reviewing, or resolving an AI Risk Assessment **NEVER automatically modifies or degrades a member's Trust Score**.
