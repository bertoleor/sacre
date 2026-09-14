# Reporte de producto, marketing y estilo — SACRÉ — 2026-09-14

> Basado en lectura del código real (`app/`, `components/`, `lib/`) + `sacre_build.log` + `package.json`, build verificado OK (Next 16.1.6, EXIT=0, 24 páginas). Provider nvidia. Nada borrado. Sin proyecto Supabase vivo linkeado al 2026-09-14 (project-map marca SACRE `qirzicgqqmcqlvyqskkv`, t5 — UNVERIFIED); el catálogo es mock y el checkout entra en "modo demo" sin DB/credenciales. Todo lo no verificado va marcado UNVERIFIED.

---

## 1. Producto

**Qué es.** E-commerce de chocolatería artesanal SACRÉ — bombones, tabletas y ediciones especiales. Next.js 16.1.6 (Turbopack) + React 19 + Tailwind v4, con Supabase (auth+DB), Mercado Pago (cobros) y Resend (mails). Monorepo plano en `E:/sitios web E/SACRÉ/sacre-shop` (ruta canónica, ver `docs/plans/project-map.md`).

**Flujo de cliente:** home → categorías → catálogo (`/productos`) → detalle → carrito (CartContext + CartDrawer) → checkout → pago MP o transferencia → confirmación.

**Catálogo (`lib/data.ts`) — MOCK en memoria, pendiente link a DB:**

| Producto | Categoría | Precio (ARS) | Stock | Featured |
|---|---|---|---|---|
| Caja Selección de Autor | bombones 🍫 | $18.000 | 15 | ✅ |
| Tableta Origen 70% | tabletas ⬜ | $6.900 | 30 | — |
| Edición Festiva | especiales 🎁 | $7.200 | 20 | ✅ |
| Caja Navideña Premium | especiales 🎁 | $24.500 | 10 | — |
| Caja Medallones Dorados | bombones 🍫 | $15.800 | 25 | — |
| Tableta Origen 85% | tabletas ⬜ | $7.500 | 30 | — |
| Tableta de Leche | tabletas ⬜ | $5.900 | 35 | — |
| Truffles Noire | bombones 🍫 | $9.200 | 18 | — |

Precios fijos ARS declarados como `int`; `formatPrice()` usa `Intl.NumberFormat('es-AR', currency:'ARS')`. `lib/supabase/types.ts` ya modela `Product/Order/OrderItem/CustomerInfo` con campos DB-ready (`sku`, `compare_at_price`, `origin`, `weight`, snapshot `product_name`, estados de orden/pago completos) — el DDL propuesto vive en el spec, las migrations están vacías (`.gitkeep`) hasta F1.

**Checkout (`app/checkout`).** Wizard client-side de 3 pasos + confirmación: Datos personales → Entrega (domicilio 3–5 días / retiro "SACRÉ Atelier — Jorge Luis Borges 2100, Palermo") → Pago. Métodos: MercadoPago (Visa/Master/MP), Transferencia (−10%), Débito, Crédito (hasta 12 cuotas). POST a `/api/orders/create`.

**Creación de orden (`app/api/orders/create`).** Valida campos mínimos, inserta `orders` + `order_items` con service_role (nunca anon directo). **Modo demo:** si no hay Supabase configurado, devuelve `{success:true, message:"Pedido creado (modo demo - sin base de datos)"}` sin persistir. Si hay token MP, crea preferencia de Checkout Pro (items, `back_urls`, `external_reference=order_number`, `notification_url`). Envía mail de confirmación por Resend si hay API key. Sin credenciales → flujo "pedido creado" sin cobro real.

**Webhook MP (`app/api/webhooks/mercadopago`, código sólido, SIN verificar contra proveedor real):**
- Valida `x-signature` (HMAC-SHA256 sobre manifest `id;request-id;ts;`, comparación `timingSafeEqual`) — nunca confía en el body sin firmar.
- Solo procesa tópico `payment`; siempre ACK 200 a MP para evitar reintentos en bucle; `merchant_order` se descarta.
- **Re-verifica el pago con GET a `/v1/payments/{id}`** (no usa el body). Idempotencia por `payment_id`+`payment_status` y de notificaciones (dedup por tipo+mensaje). Actualiza `orders` (`paid_at`/estado) e inserta en `notifications`. Estado `approved → processing`, `rejected/cancelled → cancelled`, `refunded → refunded`, resto `payment_pending`.
- Email de aprobación/rechazo al cliente por Resend.

**Admin (`app/admin`).** Layout propio; `/login`, dashboard, `/pedidos` + `/pedidos/[id]`, `/productos` + `/productos/[id]`.

**Rutas reales (build, 24 páginas):** `/`, `/productos[/id]` (SSG), `/el-chocolate`, `/faq`, `/quienes-somos`, `/contacto`, `/terminos`, `/checkout`, `/admin*`, `/api/orders/create`, `/api/webhooks/mercadopago`.

---

## 2. Marketing

**Idioma.** Español es-AR únicamente; sin `next-intl` ni locales. Tono aspiracional/poético en la tienda.

**Tono y copys clave.**
- Home: "En la profundidad de la selva, el tiempo se detiene. Cada grano es un tesoro sagrado, preservando la pureza de un sabor milenario." — copy de origen/marca.
- Categorías: "Bombones / Tabletas / Ediciones Especiales".
- Checkout: "Tu carrito está vacío", "Tu número de pedido es:", "Compra Segura", "Retiro en Local / Envío a Domicilio".
- Admin/confirmation: "¡Pedido Confirmado!", "¡Pago acreditado! 🎉", "Nos pusimos a preparar tu pedido."

**Desvíos de tono detectados (acción 3 del plan, P2):**
- **Voseo inconsistente.** Home y ciertos botones usan infinitivo poético ("Descubrir Historia", "Seguir Comprando", "Volver a la Tienda"), mientras el spec declara "voseo en todo el microcopy" y el checkout tiene un imperativo sin voseo/acento: `alert("Error al procesar. Intentalo de nuevo.")` — "Intentalo" mezcla tuteo sin tilde (debiera "Intentálo" o "Intentá de nuevo"). El ecommerce arranca mayormente en infinitivo en CTA; el copy interior es voseo ("tenés dudas", "escribinos"). Requiere revisión de tono dedicada (21-content), UNVERIFIED.
- No hay revisión formal de tono es-AR ni Glosario de marca.

**Gaps de marketing/contenido.**
- `back_urls` de MP apuntan a `/checkout/success`, `/checkout/failure`, `/checkout/pending` — **esas rutas no existen** en el árbol `app/` (solo hay `/checkout`). Al pagar por MP el cliente caería a 404 en el retorno. P2, UNVERIFIED.
- `${siteUrl}` default a `http://localhost:3000` si no hay `NEXT_PUBLIC_SITE_URL` (afecta back_urls y notification_url en deploy).
- Sin sitemap/robots/metadata SEO verificada en `app/layout.tsx` (no inspeccionado en este pase) — UNVERIFIED.

---

## 3. Estilo

**Paleta (Tailwind v4, `@theme` en `globals.css`).** Marca "noir-lujo chocolate": fondo `#050505` casi negro, `burgundy #722F37` (acción/acento), `cream-accent #f5f0e6`, `chocolate-noir #1a1a1a` + gama `stone` oscura. Body `color:#FFF` sobre `#050505`.

**Tipografía.** Dos fuentes: `Cronde` (display serif, títulos y números de pedido — `font-cronde`) y `Montserrat` (`--font-sans`) para cuerpo. Etiquetas en `uppercase tracking-widest text-xs` (patrón consistente en botones y labels).

**Layout/componentes.**
- Home: Hero → bento grid de 3 categorías con imágenes `fill object-cover`, hover `scale-110`; section "El Origen" con parallax/vignette y glass card; carrusel "Selección".
- Estética glass: `backdrop-blur`, `border-white/20`, `rounded-[2rem]`/`rounded-[2.5rem]`, overlays `bg-black/20`.
- Botones: `rounded-full`, `uppercase tracking-widest text-xs`, primario `bg-burgundy text-black` con hover a blanco; secundario `border-white/20 hover:bg-white hover:text-black`.
- Checkout: tarjetas `bg-white/5 border-white/10 rounded-[2rem]`, stepper circular con estados, CTA `bg-burgundy`.
- Componentes: `Hero`, `GlassCard`, `FadeIn`, `ProductCarousel`, `ProductGrid`, `AddToCartButton`, `CartDrawer`, `Navbar`, `Footer`, `SectionDivider`, `ImageWithBlur`, `Skeleton`.

**Accesibilidad (parcial, sin auditoría dedicada).** Labels asociados con `htmlFor`/`id` en checkout, `alt` en imágenes, focus visible en inputs (`focus:border-burgundy outline-none`) pero `outline-none` sin reemplazo de estilo de foco visible → **riesgo de foco invisible**. Auditoría a11y completa pendiente (gate a11y). UNVERIFIED.

---

## 4. Conclusiones y estado

**Gates BLOQUEANTES (P0, todos UNVERIFIED hasta provisioning):**
- **DB viva:** sin proyecto Supabase SACRE linkeado; catálogo mock + órdenes en "modo demo". Es el blocker real (ver spec, Naysayer).
- **Cobros online:** código MP listo (preferencia + webhook con x-Signature + re-verificación), pero sin `MERCADOPAGO_ACCESS_TOKEN`/`WEBHOOK_SECRET` → sin pago real verificado.
- **Auth admin:** no verificada (login provisorio).

**P1:** desvíos de tono/voseo (`Intentalo`), rutas `back_urls` inexistentes, revisión formal tono es-AR.
**P2:** SEO/sitemap, auditoría a11y (foco invisible en inputs), deps seguras.

**Próximos pasos sugeridos (slice MVP F1+F2+F3):** linkear proyecto Supabase (desbloquea la DB y convierte mocks en queries reales) → catálogo real con stock → pago MP de prueba punta a punta con webhook `approved`. Tickets a crear en Linear team `Ornella` como `[SACRE] F1..F5`.