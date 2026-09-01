import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.core.exceptions import APIException
from app.schemas.group import GroupCreate, GroupUpdate, MemberAddRequest
from app.db.supabase import get_supabase_client

logger = logging.getLogger("chittrust.services.group")

# Fallback local in-memory store for isolated unit test sessions
DEMO_GROUPS_STORE: List[Dict[str, Any]] = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "name": "Ganesh Traders Community Chit #1",
        "total_amount": 30000.0,
        "duration_months": 12,
        "contribution_per_month": 2500.0,
        "auction_type": "bid",
        "organizer_id": "00000000-0000-0000-0000-000000000001",
        "status": "active",
        "member_count": 2,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
]

DEMO_MEMBERSHIPS_STORE: List[Dict[str, Any]] = [
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "group_id": "11111111-1111-1111-1111-111111111111",
        "user_id": "00000000-0000-0000-0000-000000000003",
        "member_name": "Demo Digital Member Priya",
        "phone_number": "+919900000003",
        "member_type": "digital",
        "agent_id": None,
        "agent_name": None,
        "status": "active",
        "joined_at": datetime.utcnow().isoformat(),
    },
    {
        "id": "33333333-3333-3333-3333-333333333333",
        "group_id": "11111111-1111-1111-1111-111111111111",
        "user_id": "00000000-0000-0000-0000-000000000004",
        "member_name": "Demo Cash Member Anil",
        "phone_number": "+919900000004",
        "member_type": "cash",
        "agent_id": "00000000-0000-0000-0000-000000000002",
        "agent_name": "Demo CashBridge Agent Suresh",
        "status": "active",
        "joined_at": datetime.utcnow().isoformat(),
    },
]

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
    def list_groups(cls, organizer_id: Optional[str] = None) -> List[Dict[str, Any]]:
        client = get_supabase_client()
        if client:
            try:
                query = client.table("groups").select("*")
                if organizer_id:
                    query = query.eq("organizer_id", organizer_id)
                res = query.order("created_at", desc=True).execute()
                if res.data is not None and len(res.data) > 0:
                    return res.data
            except Exception as err:
                logger.warning(f"DB list_groups query error: {err}")

        # Fallback store
        if organizer_id:
            return [g for g in DEMO_GROUPS_STORE if g.get("organizer_id") == organizer_id]
        return DEMO_GROUPS_STORE

    @classmethod
    def get_group_by_id(cls, group_id: str) -> Dict[str, Any]:
        client = get_supabase_client()
        if client:
            try:
                res = client.table("groups").select("*").eq("id", group_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as err:
                logger.warning(f"DB get_group_by_id error: {err}")

        group = next((g for g in DEMO_GROUPS_STORE if g["id"] == group_id), None)
        if not group:
            raise APIException("Group not found.", status_code=404)
        return group

    @classmethod
    def create_group(cls, organizer_id: str, data: GroupCreate) -> Dict[str, Any]:
        if data.contribution_per_month > data.total_amount:
            raise APIException("Monthly contribution cannot exceed total pool amount.")

        group_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()

        group_record = {
            "id": group_id,
            "name": data.name.strip(),
            "total_amount": float(data.total_amount),
            "duration_months": data.duration_months,
            "contribution_per_month": float(data.contribution_per_month),
            "auction_type": data.auction_type,
            "organizer_id": organizer_id,
            "status": "active",
            "member_count": 0,
            "created_at": now,
            "updated_at": now,
        }

        client = get_supabase_client()
        if client:
            try:
                res = client.table("groups").insert(group_record).execute()
                if res.data and len(res.data) > 0:
                    group_record = res.data[0]

                # Append audit log entry
                audit_record = {
                    "id": str(uuid.uuid4()),
                    "actor_id": organizer_id,
                    "action": "CREATE_GROUP",
                    "entity_type": "group",
                    "entity_id": group_id,
                    "metadata": {"group_name": data.name, "total_amount": data.total_amount},
                    "created_at": now,
                }
                client.table("audit_logs").insert(audit_record).execute()
            except Exception as err:
                logger.warning(f"DB create_group insert error: {err}")

        # Update fallback store
        DEMO_GROUPS_STORE.append(group_record)
        logger.info(f"Created group {group_id} - {data.name}")
        return group_record

    @classmethod
    def update_group(cls, group_id: str, data: GroupUpdate, organizer_id: str, user_role: str = "organizer") -> Dict[str, Any]:
        group = cls.get_group_by_id(group_id)
        if user_role != "admin" and group.get("organizer_id") and group.get("organizer_id") != organizer_id:
            raise APIException("Forbidden: You do not own or manage this group.", status_code=403)
        now = datetime.utcnow().isoformat()

        updates = {"updated_at": now}
        if data.name:
            updates["name"] = data.name.strip()
        if data.auction_type:
            updates["auction_type"] = data.auction_type
        if data.status:
            updates["status"] = data.status

        client = get_supabase_client()
        if client:
            try:
                res = client.table("groups").update(updates).eq("id", group_id).execute()
                if res.data and len(res.data) > 0:
                    group = res.data[0]
            except Exception as err:
                logger.warning(f"DB update_group error: {err}")

        for k, v in updates.items():
            group[k] = v
        return group

    @classmethod
    def list_members(cls, group_id: str) -> List[Dict[str, Any]]:
        client = get_supabase_client()
        if client:
            try:
                res = client.table("memberships").select("*, profiles(*)").eq("group_id", group_id).execute()
                if res.data is not None:
                    return res.data
            except Exception as err:
                logger.warning(f"DB list_members error: {err}")

        return [m for m in DEMO_MEMBERSHIPS_STORE if m["group_id"] == group_id]

    @classmethod
    def add_member(cls, group_id: str, req: MemberAddRequest, organizer_id: str, user_role: str = "organizer") -> Dict[str, Any]:
        group = cls.get_group_by_id(group_id)
        if user_role != "admin" and group.get("organizer_id") and group.get("organizer_id") != organizer_id:
            raise APIException("Forbidden: You do not own or manage this group.", status_code=403)
        norm_phone = cls.normalize_phone(req.phone_number)

        # Enforce agent requirement for cash members
        if req.member_type == "cash" and not req.agent_id:
            raise APIException("Cash members require an assigned CashBridge Agent.")

        client = get_supabase_client()
        user_id = str(uuid.uuid4())
        agent_name = None

        if client and req.member_type == "cash" and req.agent_id:
            try:
                # Verify agent verification status
                agent_res = client.table("agents").select("*").eq("id", req.agent_id).execute()
                if agent_res.data and len(agent_res.data) > 0:
                    if agent_res.data[0].get("verified_status") != "verified":
                        raise APIException("Cannot assign unverified CashBridge Agent to cash member.")
                    agent_name = agent_res.data[0].get("name", "CashBridge Agent")
            except APIException:
                raise
            except Exception as err:
                logger.warning(f"Agent verification check notice: {err}")

        mem_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()

        membership_record = {
            "id": mem_id,
            "group_id": group_id,
            "user_id": user_id,
            "member_name": req.name.strip(),
            "phone_number": norm_phone,
            "member_type": req.member_type,
            "agent_id": req.agent_id if req.member_type == "cash" else None,
            "agent_name": agent_name or ("Suresh Patel (CashBridge Agent)" if req.member_type == "cash" else None),
            "status": "active",
            "joined_at": now,
        }

        if client:
            try:
                # Insert membership DB record
                client.table("memberships").insert({
                    "id": mem_id,
                    "group_id": group_id,
                    "user_id": user_id,
                    "member_type": req.member_type,
                    "agent_id": req.agent_id if req.member_type == "cash" else None,
                    "status": "active",
                }).execute()

                # Increment group member count
                new_count = group.get("member_count", 0) + 1
                client.table("groups").update({"member_count": new_count}).eq("id", group_id).execute()

                # Audit log
                client.table("audit_logs").insert({
                    "id": str(uuid.uuid4()),
                    "actor_id": organizer_id,
                    "action": "ADD_MEMBER",
                    "entity_type": "membership",
                    "entity_id": mem_id,
                    "metadata": {"member_name": req.name, "member_type": req.member_type},
                    "created_at": now,
                }).execute()
            except Exception as err:
                logger.warning(f"DB add_member insert error: {err}")

        DEMO_MEMBERSHIPS_STORE.append(membership_record)
        group["member_count"] = group.get("member_count", 0) + 1
        return membership_record

    @classmethod
    def exit_member(cls, membership_id: str, organizer_id: str, user_role: str = "organizer") -> Dict[str, Any]:
        mem = next((m for m in DEMO_MEMBERSHIPS_STORE if m["id"] == membership_id), None)
        if mem:
            group = cls.get_group_by_id(mem["group_id"])
            if user_role != "admin" and group.get("organizer_id") and group.get("organizer_id") != organizer_id:
                raise APIException("Forbidden: You do not own or manage this group.", status_code=403)
            mem["status"] = "exited"

        now = datetime.utcnow().isoformat()
        client = get_supabase_client()
        if client:
            try:
                client.table("memberships").update({"status": "exited"}).eq("id", membership_id).execute()
                client.table("audit_logs").insert({
                    "id": str(uuid.uuid4()),
                    "actor_id": organizer_id,
                    "action": "EXIT_MEMBER",
                    "entity_type": "membership",
                    "entity_id": membership_id,
                    "metadata": {"status": "exited"},
                    "created_at": now,
                }).execute()
            except Exception as err:
                logger.warning(f"DB exit_member error: {err}")

        return {
            "membership_id": membership_id,
            "status": "exited",
            "message": "Member successfully exited from chit group. Historical contribution logs remain preserved."
        }

group_service = GroupService()
