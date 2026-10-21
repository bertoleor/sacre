"""SACRE P0-1 — Provision admin user + adversarial probes (T3).

Contra el proyecto t5 (qirzicgqqmcqlvyqskkv), via management API + GoTrue
admin API + PostgREST:

  1. PATCH config/auth: disable_signup = true (solo el owner crea admins).
  2. Crea usuario admin (email_confirm) + fila en public.admin_users.
  3. Crea usuario intruder (authenticated NO admin) para probe adversarial.
  4. Probes con password grant reales:
     - admin:    INSERT producto de test -> 201; DELETE -> 204  (RLS permite)
     - intruder: INSERT producto -> 403 (RLS bloquea); SELECT orders -> []
  5. Cleanup: borra producto de test y usuario intruder (admin queda).
  6. Escribe .env.e2e.local (gitignored) con creds para el E2E del app.
  7. Re-apunta .env.local del repo al ref canonico t5 (hoy apunta al dup).

NUNCA imprime passwords ni keys (solo emails y HTTP codes).
Idempotente: si el admin ya existe, lo reutiliza.
"""
import json
import os
import pathlib
import re
import secrets
import sys
import urllib.request
import urllib.error

REF = sys.argv[1] if len(sys.argv) > 1 else "qirzicgqqmcqlvyqskkv"
ADMIN_EMAIL = os.environ.get("SACRE_ADMIN_EMAIL", "admin@sacre.com.ar")
INTRUDER_EMAIL = "intruder-probe@sacre.com.ar"
REPO = pathlib.Path(__file__).resolve().parents[1]

TOKEN = os.environ.get("SUPABASE_AUDIT_PAT", "") or os.environ.get("SUPABASE_PAT_5", "")
if not TOKEN:
    for line in pathlib.Path("E:/Hermes/.env").read_text(encoding="utf-8").splitlines():
        if line.startswith("SUPABASE_PAT_5="):
            TOKEN = line.split("=", 1)[1].strip()
if not TOKEN:
    sys.exit("No hay SUPABASE_PAT_5")

PROJECT_URL = f"https://{REF}.supabase.co"
FAILS = []


def call(method, url, payload=None, headers=None, timeout=120):
    hdrs = {"Content-Type": "application/json"}
    hdrs.update(headers or {})
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = r.read().decode()
            return r.status, (json.loads(body) if body.strip() else None)
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:400]
        try:
            return e.code, json.loads(body)
        except Exception:  # noqa: BLE001
            return e.code, {"raw": body}


def mgmt(method, path, payload=None):
    return call(method, f"https://api.supabase.com/v1/projects/{REF}/{path}", payload,
                {"Authorization": f"Bearer {TOKEN}"})


def check(name, ok, detail=""):
    print(("  PASS  " if ok else "  FAIL  ") + name + (f"  ({detail})" if detail and not ok else ""))
    if not ok:
        FAILS.append(name)


# ---------------------------------------------------------------- keys
def get_keys():
    for path in ("api-keys", "apikeys"):
        code, body = mgmt("GET", path)
        if code == 200 and body:
            # newer endpoint returns list; legacy returns dict
            anon = svc = None
            if isinstance(body, list):
                anon = next((k["api_key"] for k in body if k.get("name") == "anon"), None)
                svc = next((k["api_key"] for k in body if k.get("name") == "service_role"), None)
            elif isinstance(body, dict):
                anon = body.get("anon_key") or body.get("ANON_KEY")
                svc = body.get("service_role_key") or body.get("SERVICE_ROLE_KEY")
            if anon and svc:
                return anon, svc
    sys.exit("No se pudieron obtener las API keys via management API")


def gotue_admin(method, path, payload, svc_key):
    return call(method, f"{PROJECT_URL}/auth/v1/admin/{path}", payload,
                {"apikey": svc_key, "Authorization": f"Bearer {svc_key}"})


def sign_in(email, password, anon_key):
    code, body = call("POST", f"{PROJECT_URL}/auth/v1/token?grant_type=password",
                      {"email": email, "password": password},
                      {"apikey": anon_key})
    return code, (body or {}).get("access_token"), body


def rest(method, path, payload, jwt, anon_key):
    hdrs = {"apikey": anon_key, "Authorization": f"Bearer {jwt}",
            "Content-Type": "application/json"}
    data = json.dumps(payload).encode() if payload is not None and method != "GET" else None
    req = urllib.request.Request(f"{PROJECT_URL}/rest/v1/{path}", data=data,
                                 headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            body = r.read().decode()
            return r.status, (json.loads(body) if body.strip() else None)
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:400]
        try:
            return e.code, json.loads(body)
        except Exception:  # noqa: BLE001
            return e.code, {"raw": body}


def upsert_env(path, entries):
    """Update or append key=value lines in a .env file preserving the rest."""
    lines = path.read_text(encoding="utf-8").splitlines() if path.exists() else []
    out = []
    seen = set()
    for ln in lines:
        m = re.match(r"^([A-Z0-9_]+)=", ln)
        if m and m.group(1) in entries:
            if m.group(1) not in seen:
                out.append(f"{m.group(1)}={entries[m.group(1)]}")
                seen.add(m.group(1))
        else:
            out.append(ln)
    for k, v in entries.items():
        if k not in seen:
            out.append(f"{k}={v}")
    path.write_text("\n".join(out) + "\n", encoding="utf-8")


def main():
    print(f"== SACRE P0-1 provision admin (ref {REF}) ==")
    anon_key, svc_key = get_keys()
    print("  keys: anon+service_role obtenidas (no impresas)")

    # 1. disable public signup
    code, body = mgmt("PATCH", "config/auth", {"disable_signup": True})
    check("D1 disable_signup=true aplicado", code in (200, 201, 204), f"HTTP {code} {str(body)[:120]}")

    # 2. admin user
    e2e_env = REPO / ".env.e2e.local"
    entries = {}
    if e2e_env.exists():
        for ln in e2e_env.read_text(encoding="utf-8").splitlines():
            m = re.match(r"^([A-Z0-9_]+)=(.*)$", ln)
            if m:
                entries[m.group(1)] = m.group(2)
    admin_password = entries.get("E2E_ADMIN_PASSWORD") or secrets.token_urlsafe(18)
    intruder_password = entries.get("E2E_INTRUDER_PASSWORD") or secrets.token_urlsafe(18)

    code, body = gotue_admin("POST", "users",
                             {"email": ADMIN_EMAIL, "password": admin_password,
                              "email_confirm": True, "app_metadata": {"role": "service"}},
                             svc_key)
    if code in (200, 201):
        admin_id = body["id"]
        print(f"  admin user creado: {ADMIN_EMAIL}")
    elif code == 422:
        code2, lst = gotue_admin("GET", f"users?page_size=1000", None, svc_key)
        admin_id = next((u["id"] for u in (lst or {}).get("users", []) if u.get("email") == ADMIN_EMAIL), None)
        check("admin user preexistente encontrado", admin_id is not None, str(lst)[:200])
        if not admin_id:
            return 1
        print(f"  admin user ya existia: {ADMIN_EMAIL}")
    else:
        check("admin user creado", False, f"HTTP {code} {str(body)[:200]}")
        return 1

    code, body = mgmt("POST", "database/query", {
        "query": f"insert into public.admin_users (id, role) values ('{admin_id}', 'admin') "
                 f"on conflict (id, role) do nothing returning id, role"})
    row_present = False
    if code in (200, 201):
        qc, qrows = mgmt("POST", "database/query", {
            "query": f"select count(*)::int as n from public.admin_users where id='{admin_id}'"})
        row_present = qc in (200, 201) and bool(qrows) and int(qrows[0]["n"]) >= 1
    check("admin_users row presente", row_present,
          f"HTTP {code} {str(body)[:200]}")

    # 3. intruder user (authenticated, NOT admin)
    code, body = gotue_admin("POST", "users",
                             {"email": INTRUDER_EMAIL, "password": intruder_password,
                              "email_confirm": True}, svc_key)
    if code in (200, 201):
        intruder_id = body["id"]
    elif code == 422:
        code2, lst = gotue_admin("GET", "users?page_size=1000", None, svc_key)
        intruder_id = next((u["id"] for u in (lst or {}).get("users", [])
                            if u.get("email") == INTRUDER_EMAIL), None)
        check("intruder preexistente encontrado", intruder_id is not None, str(lst)[:200])
        if not intruder_id:
            return 1
    else:
        check("intruder user creado", False, f"HTTP {code} {str(body)[:200]}")
        return 1

    # 4. probes con login REAL (password grant)
    code, admin_jwt, body = sign_in(ADMIN_EMAIL, admin_password, anon_key)
    check("login real admin (password grant)", code == 200 and admin_jwt, f"HTTP {code} {str(body)[:150]}")

    code, intruder_jwt, body = sign_in(INTRUDER_EMAIL, intruder_password, anon_key)
    check("login real intruder (password grant)", code == 200 and intruder_jwt, f"HTTP {code}")

    # probe RPC directo del gate: is_admin() con JWT real de cada rol
    code, body = rest("POST", "rpc/is_admin", {}, admin_jwt, anon_key)
    check("RPC is_admin()=true con JWT admin", code == 200 and body is True, f"HTTP {code} {str(body)[:120]}")
    code, body = rest("POST", "rpc/is_admin", {}, intruder_jwt, anon_key)
    check("RPC is_admin()=false con JWT intruder", code == 200 and body is False, f"HTTP {code} {str(body)[:120]}")

    test_slug = "rls-probe-temp-product"
    # cleanup previo por si quedo de un run anterior
    rest("DELETE", f"products?slug=eq.{test_slug}", None, admin_jwt, anon_key)

    ins = {"slug": test_slug, "name": "RLS PROBE TEMP", "description": "probe",
           "price": 1, "stock": 0, "images": ["{}"], "tags": ["probe"], "is_active": False}
    code, body = rest("POST", "products", ins, admin_jwt, anon_key)
    check("admin INSERT producto (RLS permite) -> 201", code == 201, f"HTTP {code} {str(body)[:200]}")

    code, body = rest("POST", "products", ins, intruder_jwt, anon_key)
    check("intruder INSERT producto (RLS bloquea) -> 403", code == 403, f"HTTP {code} {str(body)[:200]}")

    code, body = rest("GET", "orders?select=id", None, intruder_jwt, anon_key)
    check("intruder SELECT orders -> vacio (is_admin=false)", code == 200 and body == [],
          f"HTTP {code} {str(body)[:120]}")

    code, body = rest("GET", "admin_users?select=id", None, intruder_jwt, anon_key)
    check("intruder SELECT admin_users -> vacio/bloqueado", (code == 200 and body == []) or code in (401, 403),
          f"HTTP {code} {str(body)[:120]}")

    # 5. cleanup: producto de test + intruder
    code, _ = rest("DELETE", f"products?slug=eq.{test_slug}", None, admin_jwt, anon_key)
    check("cleanup producto test (DELETE admin)", code in (200, 204), f"HTTP {code}")

    code, _ = gotue_admin("DELETE", f"users/{intruder_id}", None, svc_key)
    check("cleanup intruder user", code in (200, 204), f"HTTP {code}")

    # 6. .env.e2e.local (gitignored por .env*.local)
    upsert_env(e2e_env, {
        "E2E_ADMIN_EMAIL": ADMIN_EMAIL,
        "E2E_ADMIN_PASSWORD": admin_password,
        "NEXT_PUBLIC_SUPABASE_URL": PROJECT_URL,
    })
    print(f"  .env.e2e.local escrito (email + password admin, gitignored): {e2e_env}")

    # 7. .env.local -> canonico t5
    env_local = REPO / ".env.local"
    upsert_env(env_local, {
        "NEXT_PUBLIC_SUPABASE_URL": PROJECT_URL,
        "NEXT_PUBLIC_SUPABASE_ANON_KEY": anon_key,
        "SUPABASE_SERVICE_ROLE_KEY": svc_key,
    })
    print(f"  .env.local re-apuntado al canonico t5 {REF}")

    print()
    if FAILS:
        print(f"RED: {len(FAILS)} checks fallaron: {', '.join(FAILS)}")
        return 1
    print("GREEN: aprovisionamiento + probes adversariales OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
