"""SACRE P0-1 — Pre-apply backup gate (patron DBA de P0-3 F1).

Snapshot read-only del estado del proyecto antes de aplicar 0003_admin_auth:
policies, grants, RLS, columns, indexes, triggers, auth config, admin tables.
Escribe E:/Hermes/supabase-backups/SACRE-<ref>/pre-0003-<ts>.json
Token: mismo convenio que rls_audit.py. Nunca imprime el token.
"""
import datetime
import json
import os
import pathlib
import sys
import urllib.request

REF = sys.argv[1] if len(sys.argv) > 1 else "qirzicgqqmcqlvyqskkv"

TOKEN = os.environ.get("SUPABASE_AUDIT_PAT", "") or os.environ.get("SUPABASE_PAT_5", "")
if not TOKEN:
    hermes_env = pathlib.Path("E:/Hermes/.env")
    if hermes_env.exists():
        for line in hermes_env.read_text(encoding="utf-8").splitlines():
            if line.startswith("SUPABASE_PAT_5="):
                TOKEN = line.split("=", 1)[1].strip()
if not TOKEN:
    sys.exit("No hay SUPABASE_PAT_5 en el entorno ni en E:/Hermes/.env")

QUERIES = {
    "tables_rls": (
        "select c.relname as t, c.relrowsecurity as rls from pg_class c "
        "join pg_namespace n on n.oid=c.relnamespace "
        "where n.nspname='public' and c.relkind='r' order by 1"),
    "policies": (
        "select schemaname, tablename, policyname, cmd, roles::text as roles, qual, with_check "
        "from pg_policies where schemaname='public' order by tablename, policyname"),
    "grants": (
        "select grantee, table_name, privilege_type from information_schema.role_table_grants "
        "where table_schema='public' order by 1,2,3"),
    "functions": (
        "select p.proname, p.prosecdef, pg_get_functiondef(p.oid) as def "
        "from pg_proc p join pg_namespace n on n.oid=p.pronamespace "
        "where n.nspname='public' order by 1"),
    "columns": (
        "select table_name, column_name, data_type, is_nullable "
        "from information_schema.columns where table_schema='public' "
        "order by table_name, ordinal_position"),
    "indexes": (
        "select tablename, indexname, indexdef from pg_indexes "
        "where schemaname='public' order by 1,2"),
    "triggers": (
        "select event_object_table, trigger_name, action_timing, event_manipulation, "
        "action_statement from information_schema.triggers "
        "where trigger_schema='public' order by 1,2"),
    "admin_users_rows": (
        "select * from public.admin_users"),
    "products_count": (
        "select count(*)::int as n from public.products"),
    "auth_users": (
        "select count(*)::int as n from auth.users"),
}


def call(method, path, payload=None):
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{REF}/{path}",
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
        method=method,
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode())


def main():
    snap = {
        "captured_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "project": REF,
        "purpose": "pre-0003_admin_auth backup gate (P0-1)",
    }
    for key, sql in QUERIES.items():
        try:
            snap[key] = call("POST", "database/query", {"query": sql})
        except Exception as e:  # noqa: BLE001
            snap[key] = [{"error": str(e)[:200]}]

    try:
        snap["auth_config"] = call("GET", "config/auth")
    except Exception as e:  # noqa: BLE001
        snap["auth_config"] = {"error": str(e)[:200]}

    out_dir = pathlib.Path(f"E:/Hermes/supabase-backups/SACRE-{REF}")
    out_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    out = out_dir / f"pre-0003-{ts}.json"
    out.write_text(json.dumps(snap, indent=2, default=str), encoding="utf-8")

    print(f"OK backup pre-0003 -> {out}")
    print(f"  policies={len(snap.get('policies', []))} grants={len(snap.get('grants', []))} "
          f"auth_users={snap.get('auth_users')} products={snap.get('products_count')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
