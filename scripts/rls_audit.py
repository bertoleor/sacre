"""SACRE P0-3 F1 — Audit RLS contra la DB viva (management API, read-only).

Verifica las invariantes del ticket P0-3 (rollback por comportamiento P2-25):
  1. RLS enabled en TODAS las tablas public.*
  2. 0 policies con rol PUBLIC
  3. 0 policies de escritura para anon (ALL/INSERT/UPDATE/DELETE)
  4. anon sin SELECT en orders/order_items/notifications
  5. products: SELECT público solo con qual restrictivo (is_active)
  6. Grants: anon sin INSERT/UPDATE/DELETE/TRUNCATE en ninguna tabla

RED antes de 0002 (estado 0001): falla 6 (grants anon heredados abiertos).
GREEN después de 0002: pasa 6/6.

Uso: python scripts/rls_audit.py [project_ref]
Token: SUPABASE_AUDIT_PAT del entorno si está seteado (para auditar un
proyecto de otra org con su propio PAT); si no, SUPABASE_PAT_5 del entorno,
fallback E:/Hermes/.env (slot SUPABASE_PAT_5, solo cubre la org de SACRE t5).
Ejemplo dup (org t1): SUPABASE_AUDIT_PAT=<PAT_1> python scripts/rls_audit.py xaxioylgwhbxtjgglwrx
Nunca imprime el token. Exit 0 = GREEN, 1 = RED.
"""
import json
import os
import pathlib
import sys
import urllib.request

REF = sys.argv[1] if len(sys.argv) > 1 else "qirzicgqqmcqlvyqskkv"  # SACRE (t5)

TOKEN = os.environ.get("SUPABASE_AUDIT_PAT", "") or os.environ.get("SUPABASE_PAT_5", "")
if not TOKEN:
    hermes_env = pathlib.Path("E:/Hermes/.env")
    if hermes_env.exists():
        for line in hermes_env.read_text(encoding="utf-8").splitlines():
            if line.startswith("SUPABASE_PAT_5="):
                TOKEN = line.split("=", 1)[1].strip()
if not TOKEN:
    sys.exit("No hay SUPABASE_PAT_5 en el entorno ni en E:/Hermes/.env")

FAILURES = []


def query(sql, label=""):
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{REF}/database/query",
        data=json.dumps({"query": sql}).encode(),
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"query '{label}' HTTP {e.code}: {e.read().decode()[:300]}") from e


def check(name, rows, ok_fn):
    try:
        ok = ok_fn(rows)
    except Exception as e:  # noqa: BLE001
        FAILURES.append(f"{name}: {e}")
        print(f"  FAIL  {name}  ({e})")
        return
    if ok:
        print(f"  PASS  {name}")
    else:
        FAILURES.append(name)
        print(f"  FAIL  {name}")


def main():
    print(f"== SACRE F1 RLS audit (ref {REF}) ==")

    rls = query(
        "select c.relname as t, c.relrowsecurity as rls, c.relforcerowsecurity as force "
        "from pg_class c join pg_namespace n on n.oid=c.relnamespace "
        "where n.nspname='public' and c.relkind='r' order by 1",
        "rls-state",
    )
    tables = [row["t"] for row in rls]
    print(f"  tablas public: {tables}")
    check("RLS enabled en todas las tablas public", rls,
          lambda rows: bool(rows) and all(r["rls"] for r in rows))

    pol = query(
        "select tablename, policyname, cmd, roles::text as roles, qual, with_check "
        "from pg_policies where schemaname='public' order by tablename, policyname",
        "policies",
    )
    print(f"  policies: {len(pol)}")
    check("0 policies con rol PUBLIC", pol,
          lambda rows: not any("PUBLIC" in (r["roles"] or "").upper() for r in rows))
    check("0 policies de escritura para anon (ALL/INSERT/UPDATE/DELETE)", pol,
          lambda rows: not any(
              "ANON" in (r["roles"] or "").upper()
              and r["cmd"] in ("ALL", "INSERT", "UPDATE", "DELETE") for r in rows))
    check("anon sin SELECT en orders/order_items/notifications", pol,
          lambda rows: not any(
              "ANON" in (r["roles"] or "").upper()
              and r["tablename"] in ("orders", "order_items", "notifications") for r in rows))

    prod_select = [r for r in pol if r["tablename"] == "products" and r["cmd"] == "SELECT"]
    check("products: policy SELECT para anon con qual restrictivo (is_active)", prod_select,
          lambda rows: any(
              "ANON" in (r["roles"] or "").upper() and "is_active" in (r["qual"] or "")
              for r in rows))

    grants = query(
        "select grantee, table_name, privilege_type from information_schema.role_table_grants "
        "where table_schema='public' and grantee in ('anon','authenticated') order by 1,2,3",
        "grants",
    )
    check("grants: anon sin write-privileges en ninguna tabla", grants,
          lambda rows: not any(
              r["grantee"] == "anon"
              and r["privilege_type"] in ("DELETE", "INSERT", "UPDATE", "TRUNCATE")
              for r in rows))

    print()
    if FAILURES:
        print(f"RED: {len(FAILURES)} invariantes violadas: {', '.join(FAILURES)}")
        return 1
    print("GREEN: todas las invariantes RLS del ticket P0-3 se cumplen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
