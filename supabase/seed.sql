-- =============================================================================
-- SACRÉ e-shop — Seed (catálogo inicial, 8 productos migrados de lib/data.ts)
-- Origen: lib/data.ts (antes de su remoción en F2).
-- Precios en ARS. Catálogo real para que el sitio opere sin mock.
-- =============================================================================

insert into public.product_categories (slug, name, icon) values
    ('bombones',   'Bombones',             '🍫'),
    ('tabletas',   'Tabletas',             '⬜'),
    ('especiales', 'Ediciones Especiales', '🎁')
on conflict (slug) do nothing;

-- upsert por slug: idempotente, corriendo de nuevo no duplica.
insert into public.products (slug, name, description, price, category, stock, sku, images, is_active, is_featured, tags) values
    ('caja-seleccion',
     'Caja Selección de Autor',
     'Doce piezas únicas pintadas a mano con cacao puro de origen.',
     18000, 'bombones', 15, 'SACRE-CAJA-001',
     array['/images/bombones.png'], true, true,
     array['destacado', 'bombones', 'regalo']),
    ('tableta-origen-70',
     'Tableta Origen 70%',
     'Cacao puro con notas frutales y aroma intenso.',
     6900, 'tabletas', 30, 'SACRE-TAB-070',
     array['/images/tableta.png'], true, false,
     array['tableta', '70%', 'origen']),
    ('edicion-festiva',
     'Edición Festiva',
     'Sabores de temporada y especias cálidas.',
     7200, 'especiales', 20, 'SACRE-EDF-001',
     array['/images/bombones_navidad3.png'], true, true,
     array['destacado', 'temporada', 'regalo']),
    ('bombones-navidad-1',
     'Caja Navideña Premium',
     '24 bombones artesanales con temas festivos.',
     24500, 'especiales', 10, 'SACRE-NAV-001',
     array['/images/bombones_navidad1.png'], true, false,
     array['navidad', '24 piezas', 'regalo']),
    ('bombones-navidad-2',
     'Caja Medallones Dorados',
     'Medallones de chocolate con relleno de avellanas.',
     15800, 'bombones', 25, 'SACRE-NAV-002',
     array['/images/bombones_navidad2.png'], true, false,
     array['navidad', 'avellanas']),
    ('tableta-85',
     'Tableta Origen 85%',
     'Intensidad máxima para verdaderos amantes del cacao.',
     7500, 'tabletas', 30, 'SACRE-TAB-085',
     array['/images/tableta.png'], true, false,
     array['tableta', '85%', 'origen']),
    ('tableta-leche',
     'Tableta de Leche',
     'Equilibrio perfecto entre cacao y cremosidad.',
     5900, 'tabletas', 35, 'SACRE-TAB-LEC',
     array['/images/tableta.png'], true, false,
     array['tableta', 'leche']),
    ('trufa-negra',
     'Truffles Noire',
     'Trufas de chocolate negro con núcleo líquido.',
     9200, 'bombones', 18, 'SACRE-TRF-001',
     array['/images/bombones.png'], true, false,
     array['trufas', 'chocolate negro'])
on conflict (slug) do update set
    name            = excluded.name,
    description     = excluded.description,
    price           = excluded.price,
    category        = excluded.category,
    stock           = excluded.stock,
    sku             = excluded.sku,
    images          = excluded.images,
    is_active       = excluded.is_active,
    is_featured     = excluded.is_featured,
    tags            = excluded.tags;