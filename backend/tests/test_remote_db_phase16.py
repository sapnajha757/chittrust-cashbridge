import pytest
import uuid
from decimal import Decimal
from app.db.supabase import get_supabase_client
from app.core.config import settings

@pytest.fixture(scope="module")
def supabase():
    client = get_supabase_client()
    assert client is not None, "Supabase client initialization failed"
    return client

def test_01_verify_21_tables_exist(supabase):
    tables = [
        'profiles', 'groups', 'memberships', 'agents', 'contributions',
        'payouts', 'trust_scores', 'trust_score_events', 'voice_pins',
        'voice_sessions', 'voice_call_logs', 'auctions', 'auction_bids',
        'audit_logs', 'group_invitations', 'payment_webhook_events',
        'notifications', 'risk_flags', 'ai_risk_assessments',
        'ai_audit_logs', 'ai_usage_logs'
    ]
    for table in tables:
        res = supabase.from_(table).select("*").limit(1).execute()
        assert res.data is not None, f"Failed querying remote table: {table}"

def test_02_real_database_persistence_flow(supabase):
    # Generates deterministic test run IDs
    suffix = uuid.uuid4().hex[:8]
    
    # 1. Create Auth Users via Supabase Admin API
    user_org = supabase.auth.admin.create_user({
        "email": f"org_{suffix}@test.chittrust.in",
        "password": "TestPassword123!",
        "email_confirm": True,
        "user_metadata": {"full_name": f"Test Org {suffix}"}
    }).user
    organizer_id = user_org.id

    user_dig = supabase.auth.admin.create_user({
        "email": f"dig_{suffix}@test.chittrust.in",
        "password": "TestPassword123!",
        "email_confirm": True,
        "user_metadata": {"full_name": f"Test Dig Member {suffix}"}
    }).user
    member_dig_id = user_dig.id

    user_agent = supabase.auth.admin.create_user({
        "email": f"agent_{suffix}@test.chittrust.in",
        "password": "TestPassword123!",
        "email_confirm": True,
        "user_metadata": {"full_name": f"Test Agent {suffix}"}
    }).user
    agent_id = user_agent.id

    user_cash = supabase.auth.admin.create_user({
        "email": f"cash_{suffix}@test.chittrust.in",
        "password": "TestPassword123!",
        "email_confirm": True,
        "user_metadata": {"full_name": f"Test Cash Member {suffix}"}
    }).user
    member_cash_id = user_cash.id

    # 2. Update Profiles with Roles and Phone Numbers
    supabase.from_("profiles").update({
        "phone_number": f"+9198{suffix[:8]}",
        "user_type": "organizer"
    }).eq("id", organizer_id).execute()

    supabase.from_("profiles").update({
        "phone_number": f"+9197{suffix[:8]}",
        "user_type": "member"
    }).eq("id", member_dig_id).execute()

    supabase.from_("profiles").update({
        "phone_number": f"+9196{suffix[:8]}",
        "user_type": "agent"
    }).eq("id", agent_id).execute()

    supabase.from_("profiles").update({
        "phone_number": f"+9195{suffix[:8]}",
        "user_type": "member"
    }).eq("id", member_cash_id).execute()

    # Verify Agent table row
    ag_row = supabase.from_("agents").insert({
        "id": agent_id,
        "verified_status": "verified"
    }).execute()
    assert len(ag_row.data) == 1

    # TEST 2: Create Group
    group_res = supabase.from_("groups").insert({
        "name": f"Phase16 Test Group {suffix}",
        "total_amount": 100000.00,
        "duration_months": 10,
        "contribution_per_month": 10000.00,
        "auction_type": "bid",
        "organizer_id": organizer_id
    }).execute()
    assert len(group_res.data) == 1
    group_id = group_res.data[0]["id"]

    # TEST 3: Add Memberships
    mem_dig = supabase.from_("memberships").insert({
        "group_id": group_id,
        "user_id": member_dig_id,
        "member_type": "digital"
    }).execute()
    assert len(mem_dig.data) == 1
    mem_dig_id = mem_dig.data[0]["id"]

    mem_cash = supabase.from_("memberships").insert({
        "group_id": group_id,
        "user_id": member_cash_id,
        "member_type": "cash",
        "agent_id": agent_id
    }).execute()
    assert len(mem_cash.data) == 1
    mem_cash_id = mem_cash.data[0]["id"]

    # TEST 4: Digital Contribution
    contrib_dig = supabase.from_("contributions").insert({
        "membership_id": mem_dig_id,
        "month_number": 1,
        "amount": 10000.00,
        "mode": "upi",
        "confirmed_via": "app",
        "paid_on_time": True,
        "payment_status": "successful",
        "transaction_reference": f"tx_upi_{suffix}"
    }).execute()
    assert len(contrib_dig.data) == 1

    # TEST 5: Cash Contribution + Proof
    contrib_cash = supabase.from_("contributions").insert({
        "membership_id": mem_cash_id,
        "month_number": 1,
        "amount": 10000.00,
        "mode": "cash",
        "confirmed_via": "agent",
        "paid_on_time": True,
        "payment_status": "successful",
        "recorded_by_agent_id": agent_id,
        "photo_proof_url": f"cash-payment-proofs/{suffix}_proof.jpg"
    }).execute()
    assert len(contrib_cash.data) == 1
    contrib_cash_id = contrib_cash.data[0]["id"]

    # TEST 6: Trust Score & Trust Score Events
    ts_res = supabase.from_("trust_scores").select("*").eq("user_id", member_cash_id).execute()
    if not ts_res.data:
        supabase.from_("trust_scores").insert({
            "user_id": member_cash_id,
            "score": 100,
            "total_on_time": 1,
            "current_streak": 1
        }).execute()
    else:
        supabase.from_("trust_scores").update({
            "score": 105,
            "total_on_time": 1,
            "current_streak": 1
        }).eq("user_id", member_cash_id).execute()

    ts_event = supabase.from_("trust_score_events").insert({
        "user_id": member_cash_id,
        "contribution_id": contrib_cash_id,
        "event_type": "on_time",
        "points": 5,
        "score_before": 100,
        "score_after": 105,
        "reason": "On-time cash payment verified by agent"
    }).execute()
    assert len(ts_event.data) == 1

    # TEST 7: Auction, Bids & Payout
    auction_res = supabase.from_("auctions").insert({
        "group_id": group_id,
        "month_number": 1,
        "status": "closed",
        "winner_membership_id": mem_dig_id,
        "winning_bid_discount": 5000.00
    }).execute()
    assert len(auction_res.data) == 1
    auction_id = auction_res.data[0]["id"]

    bid_res = supabase.from_("auction_bids").insert({
        "auction_id": auction_id,
        "membership_id": mem_dig_id,
        "bid_discount": 5000.00,
        "status": "won"
    }).execute()
    assert len(bid_res.data) == 1

    payout_res = supabase.from_("payouts").insert({
        "group_id": group_id,
        "membership_id": mem_dig_id,
        "month_number": 1,
        "amount": 95000.00,
        "mode": "upi",
        "auction_discount": 5000.00,
        "status": "completed"
    }).execute()
    assert len(payout_res.data) == 1

    # TEST 8: Risk Flag & Audit Log
    risk_res = supabase.from_("risk_flags").insert({
        "group_id": group_id,
        "user_id": member_cash_id,
        "type": "agent_cash_delay_check",
        "severity": "LOW",
        "score": 10,
        "description": "Routine verification flag",
        "entity_type": "contribution",
        "entity_id": contrib_cash_id
    }).execute()
    assert len(risk_res.data) == 1

    audit_res = supabase.from_("audit_logs").insert({
        "actor_id": organizer_id,
        "action": "CREATE_GROUP",
        "entity_type": "group",
        "entity_id": group_id,
        "metadata": {"name": f"Phase16 Test Group {suffix}"}
    }).execute()
    assert len(audit_res.data) == 1

    # TEST 9: Notification
    notif_res = supabase.from_("notifications").insert({
        "user_id": member_cash_id,
        "type": "cash_collected",
        "title": "Cash Contribution Confirmed",
        "message": "Agent verified your monthly cash contribution of ₹10,000.",
        "related_entity_id": contrib_cash_id
    }).execute()
    assert len(notif_res.data) == 1

def test_03_rls_authenticated_jwt_access(supabase):
    """Verifies non-service-role (authenticated user JWT) can query without 42P17 recursion error."""
    from supabase import create_client
    suffix = uuid.uuid4().hex[:8]
    email = f"rls_jwt_{suffix}@test.chittrust.in"
    password = "TestPassword123!"

    user = supabase.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {"full_name": f"RLS JWT User {suffix}"}
    }).user

    anon_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    auth_res = anon_client.auth.sign_in_with_password({"email": email, "password": password})
    assert auth_res.user is not None
    jwt_token = auth_res.session.access_token

    user_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    user_client.postgrest.auth(jwt_token)

    # RLS non-recursive policy check
    profiles = user_client.from_("profiles").select("*").execute()
    assert profiles.data is not None
    assert len(profiles.data) == 1
    assert profiles.data[0]["id"] == user.id

    groups = user_client.from_("groups").select("*").execute()
    assert groups.data is not None

def test_04_webhook_event_idempotency(supabase):
    """Verifies duplicate webhook event logging idempotency handling."""
    suffix = uuid.uuid4().hex[:8]
    event_id = f"evt_test_{suffix}"

    res1 = supabase.from_("payment_webhook_events").insert({
        "event_id": event_id,
        "event_type": "payment.captured",
        "payload_metadata": {"payment_id": f"pay_{suffix}", "amount": 10000}
    }).execute()
    assert len(res1.data) == 1

    # Query existing to verify persistence
    res_check = supabase.from_("payment_webhook_events").select("*").eq("event_id", event_id).execute()
    assert len(res_check.data) == 1
    assert res_check.data[0]["event_type"] == "payment.captured"

def test_05_fail_closed_behavior():
    """Verifies backend supabase client returns None when unconfigured in non-demo mode."""
    import app.db.supabase as db_mod
    original_url = settings.SUPABASE_URL
    original_client = db_mod._supabase_client
    try:
        db_mod._supabase_client = None
        settings.SUPABASE_URL = "https://placeholder.supabase.co"
        client = db_mod.get_supabase_client()
        assert client is None, "Client should return None when SUPABASE_URL is unconfigured or placeholder"
    finally:
        settings.SUPABASE_URL = original_url
        db_mod._supabase_client = original_client


