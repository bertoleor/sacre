# Branding e identidad visual — SACRÉ

> Baseline verificado contra `app/globals.css`, `app/layout.tsx`, `app/page.tsx` (2026-09-15).
> Parte de: [[projects/sacre-shop/docs/README]] · Relacionados: [[funciones-ecommerce]], [[reporte-producto-marketing-estilo-2026-09-14]]

## Marca

- **Nombre:** SACRÉ (con acento). Títulos: "SACRÉ | El sabor de lo sagrado".
- **Posicionamiento:** chocolatería artesanal de alta gama, tono aspiracional/poético, origen del cacao ("En la profundidad de la selva, el tiempo se detiene…").
- **Idioma:** español es-AR únicamente, `lang="es"`. Sin i18n.

## Paleta (Tailwind v4 `@theme` en `globals.css`)

| Token | Valor | Uso |
|---|---|---|
| `black` | `#050505` | Fondo base (body + home) |
| `burgundy` | `#722F37` | Acción/acento primario, CTA checkout |
| `cream-accent` | `#f5f0e6` | Acento claro |
| `chocolate-noir` | `#1a1a1a` | Superficies oscuras |
| `stone-950/900/800` | `#0c0a09` / `#1c1917` / `#292524` | Gama oscura secundaria |

Texto base blanco sobre negro casi puro.

## Tipografía

- **Cronde** (display serif, fuente local `CRONDERegular.ttf`, clase `font-cronde`): títulos, cards de categoría, números de pedido.
- **Montserrat** (`--font-sans`): cuerpo y microcopy.
- Patrón consistente: etiquetas y botones en `uppercase tracking-widest text-xs`.

## Componentes y estética

- **Glassmorphism noir-lujo:** `backdrop-blur`, `border-white/20`, radios grandes (`rounded-[2rem]` / `rounded-[2.5rem]`), overlays `bg-black/20`.
- **Home:** Hero → bento grid 3 categorías (`fill object-cover`, hover `scale-110`) → sección "El Origen" con parallax/vignette + glass card → carrusel "Selección".
- **Botones:** `rounded-full`; primario `bg-burgundy` con hover a blanco; secundario `border-white/20 hover:bg-white hover:text-black`.
- **Checkout:** tarjetas `bg-white/5 border-white/10 rounded-[2rem]`, stepper circular, CTA burgundy.
- **Componentes propios:** `Hero`, `GlassCard`, `FadeIn`, `ProductCarousel`, `ProductGrid`, `AddToCartButton`, `CartDrawer`, `Navbar`, `Footer`, `SectionDivider`, `ImageWithBlur`, `Skeleton`.

## Fotografía

Assets en `public/images/`: bombones, tabletas, ediciones navideñas, cacao/historia, hero. Estilo oscuro, origen y artesanía.

## Riesgos conocidos

- Inputs usan `focus:border-burgundy outline-none` sin reemplazo de foco visible → riesgo a11y (ver reporte 2026-09-14).
