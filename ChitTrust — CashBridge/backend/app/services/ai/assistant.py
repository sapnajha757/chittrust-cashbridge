import logging
from typing import Dict, Any, List
from app.services.trust_score_service import trust_score_service
from app.services.contribution_service import DEMO_CONTRIBUTIONS
from app.services.payout_service import payout_service

logger = logging.getLogger("chittrust.ai.assistant")

class AIAssistantService:
    @classmethod
    def explain_trust_score(cls, user_id: str, language: str = "hi") -> Dict[str, Any]:
        snapshot = trust_score_service.get_user_trust_score(user_id)
        score = snapshot["score"]
        on_time = snapshot["total_on_time"]
        streak = snapshot["current_streak"]

        if language == "hi":
            explanation = (
                f"Aapka current Trust Score {score} hai. Aapne {on_time} mahine lagataar samay par payment kiye hain "
                f"aur aapki {streak} mahine ki consistency streak hai. Cash aur UPI dono ko barabar credit milta hai."
            )
            reasons = [
                f"{on_time} mahine ke samay par payment",
                f"{streak} mahine ki nirantar (streak) bonus credit",
                "Cash & UPI dono ka barabar trust weight",
            ]
        else:
            explanation = (
                f"Your current Trust Score is {score}. You have completed {on_time} on-time payment(s) "
                f"with a {streak}-month consistency streak. Cash and UPI contributions receive equal credit status."
            )
            reasons = [
                f"{on_time} on-time contribution(s) recorded",
                f"{streak}-month consistency bonus credit",
                "Equal trust credit for Cash & UPI",
            ]

        return {
            "score": score,
            "language": language,
            "explanation": explanation,
            "key_reasons": reasons,
        }

    @classmethod
    def chat_assistant(cls, user_id: str, message: str, language: str = "hi") -> Dict[str, Any]:
        clean = message.lower().strip()

        # Controlled intent classification & tool execution
        if any(k in clean for k in ["score", "trust score", "mera score", "score kyun"]):
            exp = cls.explain_trust_score(user_id, language)
            return {
                "reply_text": exp["explanation"],
                "intent_detected": "GET_TRUST_SCORE",
                "structured_data": exp,
                "confidence": 0.96,
            }
        elif any(k in clean for k in ["payment", "jama", "paid", "baki"]):
            contrib = next((c for c in DEMO_CONTRIBUTIONS if c["payment_status"] == "successful"), None)
            amount = int(contrib["amount"]) if contrib else 2500
            mode = "cash" if contrib and contrib.get("mode") == "cash" else "UPI"

            reply = (
                f"Aapka is mahine ka ₹{amount} payment {mode} ke madhyam se successfully record ho gaya hai."
                if language == "hi"
                else f"Your payment of ₹{amount} for this month has been successfully recorded via {mode}."
            )
            return {
                "reply_text": reply,
                "intent_detected": "GET_PAYMENT_STATUS",
                "structured_data": {"amount": amount, "mode": mode, "status": "successful"},
                "confidence": 0.94,
            }
        elif any(k in clean for k in ["auction", "winner", "bidding"]):
            reply = (
                "Is mahine ka auction complete ho gaya hai. Payout amount ₹8,500 hai aur winner Anil Verma hain."
                if language == "hi"
                else "This month's auction is complete. Payout amount is ₹8,500 and winner is Anil Verma."
            )
            return {
                "reply_text": reply,
                "intent_detected": "GET_AUCTION_STATUS",
                "structured_data": {"winning_discount": 1500, "payout": 8500, "winner": "Anil Verma"},
                "confidence": 0.95,
            }
        elif any(k in clean for k in ["payout", "paisa mila"]):
            payout = payout_service.get_payout("p1111111-1111-1111-1111-111111111111")
            reply = (
                f"Aapka ₹{int(payout['amount'])} ka payout status {payout['status']} hai (Mode: {payout['mode']})."
                if language == "hi"
                else f"Your payout of ₹{int(payout['amount'])} is currently {payout['status']} via {payout['mode']}."
            )
            return {
                "reply_text": reply,
                "intent_detected": "GET_PAYOUT_STATUS",
                "structured_data": payout,
                "confidence": 0.93,
            }

        # Fallback for unknown intent
        reply = (
            "Maaf kijiye, main is sawal ko samajh nahi paaya. Aap Trust Score, payment status, ya auction result ke bare mein pooch sakte hain."
            if language == "hi"
            else "Sorry, I couldn't understand that request. You can ask about your Trust Score, payment status, or auction results."
        )
        return {
            "reply_text": reply,
            "intent_detected": "UNKNOWN",
            "structured_data": None,
            "confidence": 0.50,
        }

ai_assistant_service = AIAssistantService()
