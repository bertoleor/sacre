# Tickets — barrido SACRE 2026-09-16

> Auditoría: tsc EXIT=0 · vitest 23/23 (2 files) · build no re-verificado
> (timeout del runner; último PASS 2026-09-15 en `docs/STATUS.md`).
> Pagos/auth: SOLO lectura y reporte — sin modificar (regla LGTM).

## P0 (bloqueantes)

| # | Título | Dueño (rol) | Estado |
|---|--------|-------------|--------|
| P0-1 | Auth admin: credenciales hardcodeadas `sacre/chocolate` en cliente + sesión en `localStorage` (`app/admin/login/page.tsx`, `app/admin/layout.tsx`) — pasar a Supabase Auth + RLS, requiere LGTM | Backend + Seguridad | ABIERTO |
| P0-2 | Commit pendiente del cableado Resend (orders/create + webhook MP + `lib/email/` + `package.json`/`lock`) — revisar diff pagos y mergear con LGTM | Backend (pagos) | ABIERTO |
| P0-3 | Sin proyecto Supabase SACRE en la org: catálogo hardcodeado en `lib/data.ts`, dashboard admin con mocks — F1 DB+RLS pendiente | Backend/DBA | ABIERTO |

## P1 (importantes, no bloqueantes)

| # | Título | Dueño (rol) | Estado |
|---|--------|-------------|--------|
| P1-1 | Agregar script `test: vitest run` a `package.json` (hoy vitest se corre con `npx`) | Frontend | ABIERTO |
| P1-2 | `next lint` eliminado en Next 16 — migrar a `eslint .` directo o quitar script `lint` | Frontend | ABIERTO |
| P1-3 | `.env.example` sin `MERCADOPAGO_WEBHOOK_SECRET`, `EMAIL_FROM`, `NEXT_PUBLIC_SITE_URL` documentados vs uso real | Backend | ABIERTO |
| P1-4 | `orders/create`: validación mínima (sin validar items/total) + modo demo que retorna éxito sin DB — endurecer o señalizar | Backend | ABIERTO |
| P1-5 | Webhook MP (verificado solo lectura): HMAC primero ✓, timing-safe ✓, ACK 200 ✓, idempotencia ✓, sin datos de tarjeta ✓, sin log de secretos ✓ — OK, sin cambios | — | VERIFICADO |
| P1-6 | Archivos sueltos: `ARREGLO_VERCEL.md`, `subir-cambios.bat` y commits `aa`/`AA`/`red point` ensucian historial — squash/limpieza | DevOps | ABIERTO |

## Fijado en este barrido (2026-09-16)

- `lib/allergens.test.ts`: migrado de `node:test` a vitest → suite 23/23 verde.
- `.gitignore`: + `supabase/.temp/`, `sacre_build.log`.
- Eliminado directorio stray `-p/`.
