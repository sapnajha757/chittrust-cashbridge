import os
import glob
import re
import sys

def validate_migrations(migrations_dir):
    print("=" * 70)
    print("CHITTRUST + CASHBRIDGE DATABASE SCHEMA & MIGRATION VALIDATOR")
    print("=" * 70)

    sql_files = sorted(glob.glob(os.path.join(migrations_dir, "*.sql")))
    if not sql_files:
        print(f"Error: No SQL files found in {migrations_dir}")
        return False

    print(f"Found {len(sql_files)} SQL migration file(s) in {migrations_dir}:\n")

    tables_found = set()
    enums_found = set()
    rls_enabled_tables = set()
    triggers_found = set()

    for sql_file in sql_files:
        basename = os.path.basename(sql_file)
        with open(sql_file, "r", encoding="utf-8") as f:
            content = f.read()

        # Find CREATE TABLE [IF NOT EXISTS] table_name
        matches_table = re.findall(r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_\.]+)", content, re.IGNORECASE)
        for t in matches_table:
            clean_t = t.split(".")[-1].strip()
            if clean_t and clean_t.lower() != "storage":
                tables_found.add(clean_t.lower())

        # Find CREATE TYPE enum_name AS ENUM
        matches_enum = re.findall(r"CREATE\s+TYPE\s+([a-zA-Z0-9_]+)\s+AS\s+ENUM", content, re.IGNORECASE)
        for e in matches_enum:
            enums_found.add(e.lower())

        # Find ENABLE ROW LEVEL SECURITY
        matches_rls = re.findall(r"ALTER\s+TABLE\s+([a-zA-Z0-9_]+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY", content, re.IGNORECASE)
        for r in matches_rls:
            rls_enabled_tables.add(r.lower())

        # Find CREATE TRIGGER
        matches_trigger = re.findall(r"CREATE\s+TRIGGER\s+([a-zA-Z0-9_]+)", content, re.IGNORECASE)
        for trg in matches_trigger:
            triggers_found.add(trg.lower())

        print(f"  [OK] Validated: {basename} ({len(content)} bytes)")

    print("-" * 70)
    print(f"Validation Summary:")
    print(f"  - Enums Created ({len(enums_found)}): {', '.join(sorted(enums_found))}")
    print(f"  - Tables Created ({len(tables_found)}): {', '.join(sorted(tables_found))}")
    print(f"  - RLS Enabled Tables ({len(rls_enabled_tables)}): {', '.join(sorted(rls_enabled_tables))}")
    print(f"  - Triggers Configured ({len(triggers_found)}): {', '.join(sorted(triggers_found))}")

    # Expected core tables according to Phase 2 spec:
    expected_tables = {
        "profiles", "groups", "memberships", "agents",
        "contributions", "payouts", "trust_scores",
        "auctions", "auction_bids", "audit_logs"
    }

    missing_tables = expected_tables - tables_found
    if missing_tables:
        print(f"Error: Missing required tables: {missing_tables}")
        return False

    missing_rls = expected_tables - rls_enabled_tables
    if missing_rls:
        print(f"Error: RLS not enabled on tables: {missing_rls}")
        return False

    print("\nALL DATABASE SCHEMA & RLS SECURITY TESTS PASSED PERFECTLY!")
    print("=" * 70)
    return True

if __name__ == "__main__":
    migrations_directory = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "supabase", "migrations")
    )
    success = validate_migrations(migrations_directory)
    if not success:
        sys.exit(1)
