-- Unifica métodos de pago duplicados (efectivo/EFECTIVO, yape/YAPE, etc.)
-- Ejecutar en Supabase SQL Editor.

BEGIN;

WITH ranked AS (
  SELECT
    id,
    UPPER(TRIM(codigo)) AS codigo_norm,
    ROW_NUMBER() OVER (
      PARTITION BY UPPER(TRIM(codigo))
      ORDER BY (UPPER(TRIM(codigo)) = TRIM(codigo)) DESC, activo DESC, id
    ) AS rn
  FROM public.metodos_pago
),
keepers AS (
  SELECT id AS keeper_id, codigo_norm
  FROM ranked
  WHERE rn = 1
),
dupes AS (
  SELECT r.id AS dupe_id, k.keeper_id
  FROM ranked r
  JOIN keepers k ON k.codigo_norm = r.codigo_norm
  WHERE r.rn > 1
)
UPDATE public.pagos p
SET metodo_pago_id = d.keeper_id
FROM dupes d
WHERE p.metodo_pago_id = d.dupe_id;

WITH ranked AS (
  SELECT
    id,
    UPPER(TRIM(codigo)) AS codigo_norm,
    ROW_NUMBER() OVER (
      PARTITION BY UPPER(TRIM(codigo))
      ORDER BY (UPPER(TRIM(codigo)) = TRIM(codigo)) DESC, activo DESC, id
    ) AS rn
  FROM public.metodos_pago
),
keepers AS (
  SELECT id AS keeper_id, codigo_norm
  FROM ranked
  WHERE rn = 1
),
dupes AS (
  SELECT r.id AS dupe_id, k.keeper_id
  FROM ranked r
  JOIN keepers k ON k.codigo_norm = r.codigo_norm
  WHERE r.rn > 1
)
UPDATE public.ventas v
SET metodo_pago_id = d.keeper_id
FROM dupes d
WHERE v.metodo_pago_id = d.dupe_id;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY UPPER(TRIM(codigo))
      ORDER BY (UPPER(TRIM(codigo)) = TRIM(codigo)) DESC, activo DESC, id
    ) AS rn
  FROM public.metodos_pago
)
DELETE FROM public.metodos_pago
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

UPDATE public.metodos_pago
SET codigo = UPPER(TRIM(codigo)),
    activo = COALESCE(activo, TRUE);

COMMIT;

SELECT codigo, nombre, activo FROM public.metodos_pago ORDER BY nombre;
