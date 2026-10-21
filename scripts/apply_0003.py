"""SACRE P0-1 — Aplica 0003_admin_auth.sql a la DB viva (management API).

Mismo canal que usó P0-3 F1 para 0002. Splitter $$-aware por statement,
luego ejecuta cada statement por separado (el endpoint database/query no
acepta multi-statement). Imprime solo los primeros 120 chars de cada
statement (nunca secrets). Exit 0 si todos OK.
"""
import json
import os
import pathlib
import sys
import urllib.request
import urllib.error

REF = sys.argv[1] if len(sys.argv) > 1 else "qirzicgqqmcqlvyqskkv"
SQL_FILE = sys.argv[2] if len(sys.argv) > 2 else "supabase/migrations/0003_admin_auth.sql"

TOKEN = os.environ.get("SUPABASE_AUDIT_PAT", "") or os.environ.get("SUPABASE_PAT_5", "")
if not TOKEN:
    hermes_env = pathlib.Path("E:/Hermes/.env")
    if hermes_env.exists():
        for line in hermes_env.read_text(encoding="utf-8").splitlines():
            if line.startswith("SUPABASE_PAT_5="):
                TOKEN = line.split("=", 1)[1].strip()
if not TOKEN:
    sys.exit("No hay SUPABASE_PAT_5 en el entorno ni en E:/Hermes/.env")


def run_sql(sql):
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{REF}/database/query",
        data=json.dumps({"query": sql}).encode(),
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        body = r.read().decode()
        return json.loads(body) if body.strip() else []


def split_statements(sql_text):
    """Split on ';' outside dollar-quoted blocks and line comments."""
    stmts = []
    buf = []
    in_dollar = False
    i = 0
    n = len(sql_text)
    while i < n:
        ch = sql_text[i]
        if not in_dollar and sql_text.startswith("--", i):
            j = sql_text.find("\n", i)
            j = n if j == -1 else j
            buf.append(sql_text[i:j])
            i = j
            continue
        if not in_dollar and sql_text.startswith("$$", i):
            in_dollar = True
            buf.append("$$")
            i += 2
            continue
        if in_dollar and sql_text.startswith("$$", i):
            in_dollar = False
            buf.append("$$")
            i += 2
            continue
        if not in_dollar and ch == ";":
            stmt = "".join(buf).strip()
            if stmt:
                # strip leading comments for readability
                stmts.append(stmt)
            buf = []
            i += 1
            continue
        buf.append(ch)
        i += 1
    tail = "".join(buf).strip()
    if tail:
        stmts.append(tail)
    return stmts


def statement_label(stmt):
    one = " ".join(stmt.split())
    return one[:110]


def main():
    sql_text = pathlib.Path(SQL_FILE).read_text(encoding="utf-8")
    stmts = split_statements(sql_text)
    print(f"Aplicando {SQL_FILE} a ref {REF} — {len(stmts)} statements")
    failed = 0
    for idx, stmt in enumerate(stmts, 1):
        label = statement_label(stmt)
        try:
            run_sql(stmt)
            print(f"  [{idx:02d}/{len(stmts)}] OK   {label}")
        except urllib.error.HTTPError as e:
            err = e.read().decode()[:300]
            print(f"  [{idx:02d}/{len(stmts)}] FAIL {label}")
            print(f"         HTTP {e.code}: {err}")
            failed += 1
        except Exception as e:  # noqa: BLE001
            print(f"  [{idx:02d}/{len(stmts)}] FAIL {label}")
            print(f"         {e}")
            failed += 1
    print()
    if failed:
        print(f"RED: {failed} statements fallaron")
        return 1
    print("GREEN: migración aplicada completa")
    return 0


if __name__ == "__main__":
    sys.exit(main())
