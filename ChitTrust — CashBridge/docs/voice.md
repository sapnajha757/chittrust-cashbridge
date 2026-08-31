# Voice Access & Multilingual Hindi IVR System Specification 📞🎙️

## Overview

**ChitTrust + CashBridge** features an accessible **Voice IVR (Interactive Voice Response) Subsystem** designed for low-literacy users and feature phone owners across urban and rural India.

Users can dial a toll-free number, enter a secret 4-digit Voice PIN, and query their **Credit Trust Score** or **Contribution Status** using natural Hindi speech or keypad digits.

---

## 🎯 Core Product Principle: Single Source of Truth

```text
Database (PostgreSQL / Supabase)
          │
          ├──► TrustScoreService ──► Web App (/profile/trust-score)
          │
          └──► VoiceResponseService ──► Voice IVR (Hindi Speech)
```

The Voice System consumes the **identical** Trust Score and Contribution database records as the Web App. No separate or hardcoded `voice_trust_score` exists.

---

## 📞 Telephony Provider Abstraction

The application abstracts telephony vendors behind `BaseTelephonyProvider`:

```text
services/voice/
  ├── base_provider.py         # Abstract telephony provider interface
  ├── mock_provider.py         # Developer voice simulator engine (VOICE_PROVIDER=mock)
  ├── twilio_provider.py       # Twilio TwiML XML integration boundary (VOICE_PROVIDER=twilio)
  ├── exotel_provider.py       # Exotel IVR JSON integration boundary (VOICE_PROVIDER=exotel)
  ├── intent_detector.py       # Deterministic keyword classification
  ├── response_service.py      # Single source of truth response builder
  ├── speech_to_text.py       # Speech-to-Text transcription helper (Whisper)
  └── text_to_speech.py       # Hindi & English TTS audio generator
```

---

## 🔒 Security & Voice PIN Authentication

1. **No Unrestricted Phone Lookup**: Public `GET /voice/trust-score?phone=...` endpoints are forbidden.
2. **Voice PIN Authentication**: Accessing financial data over voice requires entering a 4-digit Voice PIN (`voice_pins` table).
3. **Lockout Protection**: Failed PIN attempts trigger incremental delays and temporary account locks.

---

## 🗣️ Natural Hindi Voice Prompts

| Menu / Intent | Spoken Hindi Response | Spoken English Response |
| :--- | :--- | :--- |
| **Welcome** | `ChitTrust mein aapka swagat hai. 1 dabayein payment status ke liye. 2 dabayein Trust Score ke liye.` | `Welcome to ChitTrust. Press 1 for payment status. Press 2 for Trust Score.` |
| **Trust Score Query** | `Aapka current Trust Score 125 hai. Aapne 3 payments samay par kiye hain. Cash aur UPI dono ko barabar credit milta hai.` | `Your current Trust Score is 125. You have made 3 on-time payments. Cash and UPI receive equal credit.` |
| **Payment Status** | `Aapka is mahine ka ₹2,500 ka payment successfully record ho gaya hai. Payment ka madhyam cash hai.` | `Your payment of ₹2,500 for this month has been successfully recorded via cash.` |

---

## 🧪 Voice Test Cases

| Scenario | Input | Expected Output | Status |
| :--- | :--- | :--- | :--- |
| **Test 1: Trust Score DTMF** | Press `2` | `Aapka current Trust Score 125 hai...` | PASSED |
| **Test 2: Hindi Speech Intent** | Spoke: `"Mera score kya hai"` | Classifies `TRUST_SCORE` -> Returns score 125 | PASSED |
| **Test 3: Payment Status DTMF** | Press `1` | `Aapka is mahine ka ₹2,500 ka payment...` | PASSED |
| **Test 4: Invalid PIN** | Enter `9999` | `Aapka Voice PIN galat hai...` | PASSED |
| **Test 5: Exit Call** | Press `0` | `Dhanyavaad...` (Call ended) | PASSED |
