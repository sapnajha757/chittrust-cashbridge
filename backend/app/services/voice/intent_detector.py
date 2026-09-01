import re
from typing import Optional, Dict, Any

class IntentDetector:
    @staticmethod
    def classify_intent(text: str) -> str:
        """
        Deterministic keyword & rule-based intent classification.
        Ensures AI language models never guess or fabricate financial numbers.
        """
        if not text:
            return "UNKNOWN"

        clean = text.lower().strip()

        # 1. Auction Result Intent
        auction_keywords = ["auction", "winner", "bidding", "kon jeeta", "kaun jeeta", "payout amount", "jeeta kaun"]
        if any(k in clean for k in auction_keywords):
            return "AUCTION_RESULT"

        # 2. Payout Status Intent
        payout_keywords = ["payout", "payout status", "paisa mila", "cash handover", "payout hua kya"]
        if any(k in clean for k in payout_keywords):
            return "PAYOUT_STATUS"

        # 3. Trust Score Intent
        score_keywords = ["score", "trust score", "mera score", "kitna score", "points", "rating", "cibil"]
        if any(k in clean for k in score_keywords):
            return "TRUST_SCORE"

        # 4. Payment Status Intent
        status_keywords = ["payment", "status", "batao payment", "hua kya", "jama", "paid", "dena baki"]
        if any(k in clean for k in status_keywords):
            return "PAYMENT_STATUS"

        # 5. Recent Payment Intent
        recent_keywords = ["recent", "haal ka", "last payment", "pichla payment", "aakhri payment"]
        if any(k in clean for k in recent_keywords):
            return "RECENT_PAYMENT"

        # 6. Control Intents
        if any(k in clean for k in ["repeat", "dobara", "fir se", "phir se"]):
            return "REPEAT"
        if any(k in clean for k in ["help", "madad", "samajh nahi aaya"]):
            return "HELP"
        if any(k in clean for k in ["end", "exit", "band", "bye", "khatam"]):
            return "END_CALL"

        return "UNKNOWN"

intent_detector = IntentDetector()
