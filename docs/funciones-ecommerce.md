# Funciones del ecommerce — SACRÉ

> Baseline verificado contra código real (2026-09-15). Estado: catálogo mock + modo demo sin DB/credenciales.
> Parte de: [[projects/sacre-shop/docs/README]] · Relacionados: [[stack-framework]], [[branding-identidad-visual]]

## Qué es

E-commerce de chocolatería artesanal (bombones, tabletas, ediciones especiales). Flujo: home → categorías → catálogo → detalle → carrito → checkout → pago → confirmación.

## Catálogo y producto

- Fuente actual: `lib/data.ts` (mock, 8 productos, 3 categorías: bombones / tabletas / especiales; precios ARS fijos, `formatPrice` es-AR).
- Listado `/productos` + detalle SSG `/productos/[id]`; destacados (`featured`) alimentan el carrusel de home.
- Tipos DB-ready en `lib/supabase/types.ts` (`sku`, `compare_at_price`, `origin`, `weight`, snapshots de orden).

## Carrito y checkout

- `CartContext` + `CartDrawer`: agregar/quitar/cantidades, subtotal, costo de envío, total.
- Checkout (`app/checkout`, client-side, 3 pasos + confirmación): datos personales → entrega (domicilio 3–5 días / retiro "SACRÉ Atelier — Jorge Luis Borges 2100, Palermo") → pago (MercadoPago, transferencia −10%, débito, crédito hasta 12 cuotas).
- POST a `/api/orders/create`: valida mínimos, inserta `orders` + `order_items` con service-role; **sin Supabase → modo demo** (`success:true`, sin persistir). Con token MP crea preferencia Checkout Pro (`back_urls`, `external_reference=order_number`, `notification_url`); con Resend envía confirmación.

## Pagos / webhook

- `app/api/webhooks/mercadopago`: verifica HMAC `x-signature` (`timingSafeEqual`), solo tópico `payment`, siempre ACK 200; re-verifica con GET `/v1/payments/{id}`; idempotencia por `payment_id`+estado; actualiza `orders` (`approved→processing`, `rejected/cancelled→cancelled`, `refunded→refunded`) y mails vía Resend.
- Gap: `back_urls` apuntan a `/checkout/success|failure|pending`, rutas que **no existen** (solo `/checkout`).

## Admin

- `app/admin`: layout propio, `/login` (provisorio, no verificado), dashboard, `/pedidos` + `/pedidos/[id]`, `/productos` + `/productos/[id]`.

## Contenido / marketing

- Rutas: `/el-chocolate`, `/quienes-somos`, `/faq`, `/contacto`, `/terminos`. Metadata base `https://sacre.com.ar`, título "SACRÉ | El sabor de lo sagrado".
- Tono aspiracional/poético; voseo declarado pero inconsistente en CTAs (`Intentalo` sin tilde/voseo). Sin sitemap/robots verificados.

## Pendiente (F1–F5, spec en `E:/Hermes/docs/plans/sacre-spec.md`)

F1 DB+RLS → F2 catálogo real → F3 checkout MP+webhook punta a punta → F4 admin pedidos → F5 pulido (tono, back_urls, SEO, a11y).
