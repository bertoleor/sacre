# PRD — sacre-shop — e-shop chocolatería SACRÉ

> **Búsqueda:** keywords: `sacre, prd, ecommerce, chocolatería, mercado-pago, supabase, funnel-checkout, fases-f1-f5` · clasificación: `prd` · estado: draft · actualizado: 2026-10-18
> Parte de: [[projects/sacre-shop/docs/README]] · Relacionados: [[PRD-TEMPLATE]], [[stack-framework]]

> Proyecto: sacre-shop · Autor: 19-writer (Technical Writer, flota Hermes) · Fecha: 2026-10-18
> Estado: DRAFT
> Links: kanban t_47877a77 (rework P17-1, audit `E:/Hermes/docs/audits/2026-10-16-revision-p17-1-prds.md`) · ADR: N/A · Spec canónico: `E:/Hermes/docs/plans/sacre-spec.md`

## 1. Problema

La chocolatería artesanal SACRÉ necesita vender online, pero su tienda nació corriendo con catálogo mock y sin base de datos: sin stock real, pedidos que no se persistían y cobros jamás verificados punta a punta (`sacre-spec.md` §Problema). Para la marca era una vidriera que no opera como canal de venta; para el cliente, un checkout que no garantizaba que su pedido existiera al día siguiente.

**Usuarios objetivo** (derivados del catálogo y el checkout del repo, verificados 2026-10-06 en la DB viva — 8 productos, 3 categorías):

| Segmento | Necesidad | Evidencia en el repo |
|---|---|---|
| Comprador es-AR de chocolate artesanal (consumo propio) | Tabletas premium: Origen 70%/85%, de leche ($5.900–$7.500) | Catálogo: 3 tabletas en `products` |
| Comprador de regalos y fechas | Cajas premium y ediciones especiales ($9.200–$24.500); featured en home: Selección de Autor y Edición Festiva | Categoría especiales + `is_featured` |
| Cliente local de Palermo (CABA) | Retiro sin envío en "SACRÉ Atelier — Jorge Luis Borges 2100, Palermo" | Checkout, paso Entrega |
| La operación SACRÉ (usuario interno) | Gestionar pedidos, estados y catálogo reales | `app/admin`: login, pedidos, productos |

Idioma: **100% es-AR con voseo** en todo el microcopy (`docs/reporte-producto-marketing-estilo-2026-09-14.md` §2).

## 2. Contexto

- Producto existente y funcionando: frontend completo (24 páginas, `next build` EXIT=0, Next 16.3.6) — home, catálogo, checkout wizard de 3 pasos, admin y webhook MP con validación `x-Signature`, re-verificación de pago e idempotencia (`docs/reporte-producto-marketing-estilo-2026-09-14.md` §1).
- **F1 cerrado y verificado contra la DB viva** (`docs/STATUS.md`, 2026-10-06): proyecto Supabase SACRE t5 `qirzicgqqmcqlvyqskkv`, migraciones `0001_init` + `0002_rls_harden` aplicadas (5 tablas: products, product_categories, orders, order_items, notifications), RLS audit GREEN 6/6 (`scripts/rls_audit.py`), catálogo del storefront ya sale de la DB (`lib/catalog.ts`).
- **En curso**: P0-1 auth admin (`odd/tasks/sacre-p0-1-admin-auth.md`) — migración `0003_admin_auth` aplicada a t5 (policies `is_admin()`, usuario admin real, suite vitest 37/37); pendiente el wiring de app (sesión server-side + rewrite del login, T7–T12).
- Deuda conocida: admin sigue leyendo el mock `lib/data.ts` hasta F4; pago MP punta a punta sin verificar; `back_urls` de MP apuntan a rutas inexistentes (`/checkout/success|failure|pending`, gap P1); proyecto Supabase duplicado (t1 `xaxioylgwhbxtjgglwrx`) espera decisión del owner.
- Antecedente de este doc: reemplaza el placeholder P17 (auditoría `2026-10-16-revision-p17-1-prds.md`: FAIL — plantilla de portada sin contenido de producto). Tickets Linear: `[SACRE] F1..F5` (team Ornella).

## 3. Scope explícito

Funnel mínimo del cliente (verificado en `app/`):

```
home → categorías → /productos → detalle → carrito (CartContext + CartDrawer)
→ checkout (1 datos personales → 2 entrega: domicilio 3–5 días o retiro en Atelier → 3 pago)
→ POST /api/orders/create (service_role, persiste orders + order_items con order_number único)
→ Mercado Pago Checkout Pro (o transferencia con −10%)
→ webhook /api/webhooks/mercadopago (x-Signature HMAC-SHA256 + re-verificación GET /v1/payments/{id} + idempotencia)
→ mail Resend (confirmación / pago aprobado o rechazado) + página de confirmación
→ admin procesa el pedido (app/admin)
```

Lista cerrada de lo que SÍ entra en el producto mínimo:

- Tienda pública es-AR: home, `/productos` + detalle (SSG), contenido (`/el-chocolate`, `/faq`, `/quienes-somos`, `/contacto`, `/terminos`), carrito con drawer.
- Catálogo real desde Supabase: productos con precio ARS (`Intl.NumberFormat` es-AR), stock, categorías y destacados.
- Checkout con métodos: Mercado Pago (Visa/Master/MP), transferencia (−10%), débito y crédito hasta 12 cuotas; entrega a domicilio 3–5 días o retiro en Atelier.
- Creación de orden server-side (`/api/orders/create` con service_role, nunca anon directo) y webhook MP seguro que actualiza estado de pago (`approved → processing`, `rejected/cancelled → cancelled`, `refunded → refunded`).
- Mails transaccionales Resend en cada hito del pedido.
- Admin: login con Supabase Auth (P0-1), gestión de pedidos con estados, ABM de productos sobre la DB (F4).
- Slice MVP que cierra el loop de venta: F1 + F2 + F3, en ese orden (`sacre-spec.md` §Slice MVP).

## 4. NO-scope

- i18n / `next-intl` y mercados fuera de Argentina: no — español es-AR únicamente.
- Otros medios de pago (Stripe, PayPal, efectivo): no — Mercado Pago + transferencia.
- App nativa móvil / PWA: no — web responsiva.
- Integración con courier o logística externa: no — envío propio 3–5 días o retiro en local.
- Rediseño de marca: no — la superficie visual ya existe (noir-lujo); F5 solo pule con fotos y packaging reales.
- Cuentas de cliente completas (historial, wishlist, perfil): no — guest checkout con email; F4 agrega solo inicio de cliente mínimo.

## 5. Restricciones

- Stack baseline fijo: Next.js 16 + React 19 + Tailwind 4, Supabase (auth+DB), Mercado Pago, Resend (`docs/stack-framework.md`).
- Voseo es-AR en todo el microcopy; tono aspiracional/poético de marca (revisión de consistencia pendiente, P1 — hoy conviven infinitivos en CTAs y voseo interior).
- Seguridad DB: escrituras solo server-side con service_role; RLS ON en las 5 tablas; anon sin grants de escritura; perímetro admin por `is_admin()` tras `0003_admin_auth`. Invariantes de `scripts/rls_audit.py` deben quedar GREEN tras cada migración.
- Webhook MP: validar `x-Signature` (HMAC-SHA256, `timingSafeEqual`), re-verificar el pago con GET a `/v1/payments/{id}` (no confiar en el body), idempotencia por `payment_id`+`payment_status`, ACK 200 siempre.
- Marca noir-lujo: paleta `#050505` / burgundy `#722F37` / cream `#f5f0e6`, tipografías Cronde + Montserrat, glassmorphism (`docs/branding-identidad-visual.md`).
- Proyecto Supabase canónico: SACRE t5 `qirzicgqqmcqlvyqskkv` (`E:/Hermes/docs/plans/project-map.md`); el duplicado t1 no recibe schema hasta decisión del owner.

## 6. Criterios de éxito medibles

- [ ] Un pago MP de prueba punta a punta con webhook `approved` que actualice la orden en la DB viva (`paid_at` + estado `processing`) — el criterio del spec: "sin eso no hay venta".
- [ ] Storefront 100% sobre DB: 0 lecturas del mock `lib/data.ts` en rutas públicas (hoy el catálogo ya sale de `lib/catalog.ts`; falta el admin).
- [ ] Pedido extremo a extremo persistido: `orders` + `order_items` con `external_reference = order_number` y mail de confirmación Resend entregado.
- [ ] `scripts/rls_audit.py` GREEN 6/6 en t5 tras cada migración (estado al 2026-10-06: GREEN).
- [ ] Login admin real (Supabase Auth, cookie httpOnly, sin credencial hardcodeada) y admin operando pedidos y productos sobre la DB (F4 / P0-1 T7–T12).
- [ ] 0 rutas rotas en el flujo de pago: `back_urls` de MP resueltas (hoy `/checkout/success|failure|pending` no existen).
- [ ] `next build` EXIT=0 y suite vitest verde (37/37 al 2026-10-07) en cada work-unit.

## 7. Fases SDD sugeridas

1. **F1 — DB + RLS** (HECHA, verificada 2026-10-06): proyecto Supabase t5, `0001_init` + `0002_rls_harden`, tipos, catálogo desde DB. Ver `docs/STATUS.md`.
2. **F2 — Catálogo real**: stock, imágenes y categorías desde la DB; completar al retirar el mock restante (el admin usa `lib/data.ts` hasta F4).
3. **F3 — Checkout + MP punta a punta**: credenciales MP reales, pago de prueba con webhook `approved`, `back_urls` funcionales, mails Resend.
4. **F4 — Admin real**: auth admin Supabase Auth (P0-1, en curso), pedidos con estados/timeline, productos sobre DB, cuenta de cliente mínima.
5. **F5 — Pulido con el dueño** (primer cliente): fotos reales, copies con voseo consistente, performance, auditoría a11y (foco invisible en inputs, P2).

El orquestador ajusta el orden; el slice que cierra la venta es F1+F2+F3.

## 8. Presupuesto líneas/tokens

- Líneas nuevas: N/A a nivel PRD — doc de producto; cada fase F1–F5 fija el suyo en su ODD (`odd/tasks/`).
- Archivos tocados: 1 (este documento) + fila de índice en `docs/README.md`.
- Tokens aprox: N/A.
