import logging
from typing import Dict, Any, Optional
from app.services.trust_score_service import trust_score_service
from app.services.contribution_service import DEMO_CONTRIBUTIONS
from app.services.payout_service import payout_service

logger = logging.getLogger("chittrust.voice.response")

class VoiceResponseService:
    @classmethod
    def build_trust_score_response(cls, user_id: str, language: str = "hi") -> Dict[str, Any]:
        snapshot = trust_score_service.get_user_trust_score(user_id)
        score = snapshot["score"]
        on_time = snapshot["total_on_time"]
        streak = snapshot["current_streak"]

        if language == "hi":
            prompt = (
                f"Aapka current Trust Score {score} hai. "
                f"Aapne {on_time} payments samay par kiye hain aur aapki {streak} mahine ki consistency streak hai. "
                f"Cash aur UPI dono payment ko barabar credit milta hai."
            )
        else:
            prompt = (
                f"Your current Trust Score is {score}. "
                f"You have made {on_time} on-time payment(s) with a {streak}-month consistency streak. "
                f"Cash and UPI payments receive equal credit weight."
            )

        return {
            "intent": "TRUST_SCORE",
            "score": score,
            "prompt_text": prompt,
            "language": language,
        }

    @classmethod
    def build_auction_result_response(cls, language: str = "hi") -> Dict[str, Any]:
        if language == "hi":
            prompt = "Is mahine ka auction complete ho gaya hai. Payout amount ₹8,500 hai aur winner Anil Verma hain."
        else:
            prompt = "This month's auction is complete. Payout amount is ₹8,500 and the winner is Anil Verma."

        return {
            "intent": "AUCTION_RESULT",
            "prompt_text": prompt,
            "language": language,
        }

    @classmethod
    def build_payout_status_response(cls, membership_id: str, language: str = "hi") -> Dict[str, Any]:
        payout = payout_service.get_payout("p1111111-1111-1111-1111-111111111111")
        amount = int(payout["amount"])
        status_text = payout["status"]

        if language == "hi":
            prompt = f"Aapka ₹{amount} ka payout status {status_text} hai. Payment mode {payout['mode']} hai."
        else:
            prompt = f"Your payout of ₹{amount} is currently {status_text} via {payout['mode']}."

        return {
            "intent": "PAYOUT_STATUS",
            "prompt_text": prompt,
            "language": language,
        }

    @classmethod
    def build_payment_status_response(cls, membership_id: str, language: str = "hi") -> Dict[str, Any]:
        contrib = next((c for c in DEMO_CONTRIBUTIONS if c["membership_id"] == membership_id and c["payment_status"] == "successful"), None)

        if contrib:
            amount = int(contrib["amount"])
            mode = "cash" if contrib.get("mode") == "cash" else "UPI"
            month = contrib.get("month_number", 1)

            if language == "hi":
                prompt = f"Aapka is mahine (Month {month}) ka ₹{amount} ka payment successfully record ho gaya hai. Payment ka madhyam {mode} hai."
            else:
                prompt = f"Your payment of ₹{amount} for Month {month} has been successfully recorded via {mode}."
        else:
            if language == "hi":
                prompt = "Aapka is mahine ka payment abhi baki hai. Kripya samay par payment karein."
            else:
                prompt = "Your payment for this month is currently pending. Please pay on time."

        return {
            "intent": "PAYMENT_STATUS",
            "prompt_text": prompt,
            "language": language,
        }

    @classmethod
    def build_recent_payment_response(cls, membership_id: str, language: str = "hi") -> Dict[str, Any]:
        contribs = [c for c in DEMO_CONTRIBUTIONS if c["membership_id"] == membership_id and c["payment_status"] == "successful"]
        if contribs:
            recent = contribs[-1]
            amount = int(recent["amount"])
            mode = "cash" if recent.get("mode") == "cash" else "UPI"

            if language == "hi":
                prompt = f"Aapka sabse haal ka payment ₹{amount} tha. Yeh payment {mode} ke madhyam se record hua tha."
            else:
                prompt = f"Your most recent payment was ₹{amount} recorded via {mode}."
        else:
            if language == "hi":
                prompt = "Abhi koi payment record nahi mila."
            else:
                prompt = "No payment records found."

        return {
            "intent": "RECENT_PAYMENT",
            "prompt_text": prompt,
            "language": language,
        }

voice_response_service = VoiceResponseService()
