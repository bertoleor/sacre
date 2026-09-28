# Webhook Mercado Pago — estado real y contrato (ORN-140/ORN-203)

> **Fecha:** 2026-09-27 · **Autor:** 24-orquestador (turno noche G0) · **Verificado contra:** commit `3699896` (rama `feat/orn-140-webhook-e2e`), suite 37/37 GREEN, tsc EXIT 0.
> **Parte de:** [[README]] · Relacionados: [[funciones-ecommerce]], [[stack-framework]], [[../odd/tasks/orn-140-webhook-e2e]]

## Qué hace el handler

`app/api/webhooks/mercadopago/route.ts` procesa las notificaciones IPN/Webhook de
Mercado Pago sobre pagos. Es la única superficie del repo que mueve dinero →
todo lo que no pasa validación de firma se rechaza, y todo lo que pasa devuelve
ACK `200 {success:true}` para que MP no reintente en bucle.

## Contrato HTTP (verificado por tests, no por lectura)

| Caso | Respuesta | Motivo |
|---|---|---|
| Sin `x-signature` / firma inválida / manifest de otro payment | **401** `{error:"Invalid signature"}` | Nunca confiar en el body sin firmar |
| Body JSON inválido | **400** `{error:"Invalid JSON body"}` | `request.json()` en try/catch, se lee UNA sola vez |
| `type != "payment"` o sin `data.id` (ej `merchant_order`) | **200** `{success:true}` | Tópicos no relevantes se ACKean sin procesar |
| Payment válido sin `external_reference` en la respuesta de MP | **200** `{success:true}` | No hay orden que actualizar; se loguea el error |
| Cualquier fallo de DB durante el update | **200** `{success:true}` | El ACK a MP no debe romperse por la DB (log del error) |
| Payment válido | **200** `{success:true}` | `GET /v1/payments/{id}` a MP → update de `orders` + insert en `notifications` + email vía Resend |

## Flujo interno (payment válido)

1. **Firma HMAC** — `verifyXSignature` (`lib/webhooks/mercadopago.ts`) valida
   `x-signature` contra el manifest `id:{dataId};request-id:{requestId};ts:{ts};`
   con comparación timing-safe. El `x-request-id` cae back al
   `data.data.request_id` del body si el header no viene.
2. **Fetch a MP** — con `MERCADOPAGO_ACCESS_TOKEN`; el body del webhook NUNCA
   se usa como fuente de estado del pago (se pide a la API).
3. **Idempotencia doble** — (a) si `orders.payment_id` + `payment_status` ya
   coinciden, no se repite el update ni el email; (b) si ya existe una
   notificación con mismo `order_id`+`type`+`message`, no se re-inserta.
   Los reintentos de MP son benignos por diseño.
4. **Notificación + email** — insert en `notifications` + Resend al
   `customer_email`/`guest_email` de la orden (si `RESEND_API_KEY` existe).

## Seguridad

- **Firma obligatoria**: sin `MERCADOPAGO_WEBHOOK_SECRET` el handler 401-ea todo
  y MP fanea reintentos ~24h → está en `.env.example` con advertencia.
- **DB viva**: migración `supabase/migrations/0001_init.sql` aplicada y
  verificada en vivo (5 tablas, RLS ON, seed 8 productos) — el sub-item
  "DB vacía" de ORN-140 está cerrado.
- **GATE-SEC 2026-09-27**: gitleaks full-history 0 leaks; trivy fs 0 HIGH/CRITICAL
  post-upgrade next 16.3.6 (ORN-200).

## Cobertura de tests (37 total)

- `lib/webhooks/mercadopago.test.ts` — 21 tests: HMAC válido/inválido,
  timing-safe, secret ausente/distinto, inyección de manifest, mapeo de estados.
- `app/api/webhooks/mercadopago/route.test.ts` — 9 tests e2e del POST handler:
  401 sin firma, 400 JSON, ACK non-payment, firma cruzada, payment válido
  completo (fetch MP + update + insert), idempotencia de reintentos, fallback
  request_id del body, ACK sin external_reference, ACK con DB caída.
- `lib/allergens.test.ts` — 7 tests (fuera del scope webhook).

### Seam de tests (`__testDeps`)

El handler exporta `__testDeps: WebhookDeps` para inyectar
`fetchImpl`/`createClientImpl`/`sendEmailImpl` desde los tests. La inyección NO
va por segundo parámetro de POST porque el typegen de Next 16 exige que ese
parámetro sea el contexto de ruta `{ params }`. El seam queda vacío en
producción — contrato HTTP intacto.

## Pendientes conocidos (fuera de scope)

- E2E con pago real de prueba MP (credenciales de producción) — requiere humano.
- `next build` en CI: el build local dura ~36 min en esta máquina (Turbopack,
  contención con otros loops); no hay CI que lo ejecute en cada PR.
