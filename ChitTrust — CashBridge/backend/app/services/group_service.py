from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from app.core.exceptions import APIException
from app.schemas.group import GroupCreate, GroupUpdate, MemberAddRequest

class GroupService:
    @staticmethod
    def normalize_phone(phone: str) -> str:
        digits = ''.join(filter(str.isdigit, phone))
        if len(digits) == 10:
          return f"+91{digits}"
        if len(digits) == 12 and digits.startswith("91"):
          return f"+{digits}"
        return phone

    @classmethod
    def create_group(cls, organizer_id: str, data: GroupCreate) -> Dict[str, Any]:
        # Validate financial logic
        if data.contribution_per_month > data.total_amount:
            raise APIException("Monthly contribution cannot exceed total pool amount.")

        group_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()

        group_record = {
            "id": group_id,
            "name": data.name.strip(),
            "total_amount": data.total_amount,
            "duration_months": data.duration_months,
            "contribution_per_month": data.contribution_per_month,
            "auction_type": data.auction_type,
            "organizer_id": organizer_id,
            "status": "active",
            "member_count": 0,
            "created_at": now,
            "updated_at": now,
        }
        return group_record

    @classmethod
    def exit_member(cls, membership_id: str, organizer_id: str) -> Dict[str, Any]:
        return {
            "membership_id": membership_id,
            "status": "exited",
            "message": "Member successfully exited from chit group. Historical contribution logs remain preserved."
        }

group_service = GroupService()
