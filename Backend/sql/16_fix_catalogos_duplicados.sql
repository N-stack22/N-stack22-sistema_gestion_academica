-- ============================================================
-- PASO 16: Unificar 8 catálogos con datos duplicados (mayúsc/minúsc)
-- Ejecutar en Supabase SQL Editor.
--
-- Tablas: estados_asistencia, estados_tarea, estados_entrega_tarea,
--         tipos_evaluacion, tipos_recurso, estados_pago,
--         conceptos_pago, estados_seguimiento
-- ============================================================

BEGIN;

-- A) Normalizar alias legacy → código canónico en mayúsculas
UPDATE public.estados_asistencia SET codigo = 'PRESENTE' WHERE lower(codigo) = 'presente' AND codigo <> 'PRESENTE';
UPDATE public.estados_asistencia SET codigo = 'TARDE' WHERE lower(codigo) = 'tarde' AND codigo <> 'TARDE';
UPDATE public.estados_asistencia SET codigo = 'FALTA' WHERE lower(codigo) = 'falta' AND codigo <> 'FALTA';
UPDATE public.estados_asistencia SET codigo = 'JUSTIFICADO' WHERE lower(codigo) = 'justificado' AND codigo <> 'JUSTIFICADO';

UPDATE public.estados_tarea SET codigo = 'BORRADOR' WHERE lower(codigo) = 'borrador' AND codigo <> 'BORRADOR';
UPDATE public.estados_tarea SET codigo = 'PUBLICADA' WHERE lower(codigo) IN ('publicado', 'publicada') AND codigo NOT IN ('PUBLICADA', 'PUBLICADO');
UPDATE public.estados_tarea SET codigo = 'CERRADA' WHERE lower(codigo) IN ('cerrado', 'cerrada') AND codigo NOT IN ('CERRADA', 'CERRADO');

UPDATE public.estados_entrega_tarea SET codigo = 'PENDIENTE' WHERE lower(codigo) = 'pendiente' AND codigo <> 'PENDIENTE';
UPDATE public.estados_entrega_tarea SET codigo = 'ENTREGADA' WHERE lower(codigo) IN ('entregado', 'entregada') AND codigo NOT IN ('ENTREGADA', 'ENTREGADO');
UPDATE public.estados_entrega_tarea SET codigo = 'CALIFICADA' WHERE lower(codigo) IN ('calificado', 'calificada') AND codigo NOT IN ('CALIFICADA', 'CALIFICADO');

UPDATE public.tipos_evaluacion SET codigo = upper(codigo) WHERE codigo <> upper(codigo);
UPDATE public.tipos_recurso SET codigo = upper(codigo) WHERE codigo <> upper(codigo);

UPDATE public.estados_pago SET codigo = 'PENDIENTE' WHERE lower(codigo) = 'pendiente' AND codigo <> 'PENDIENTE';
UPDATE public.estados_pago SET codigo = 'PAGADO' WHERE lower(codigo) = 'pagado' AND codigo <> 'PAGADO';
UPDATE public.estados_pago SET codigo = 'VENCIDA' WHERE lower(codigo) IN ('vencido', 'vencida') AND codigo NOT IN ('VENCIDA', 'VENCIDO');
UPDATE public.estados_pago SET codigo = 'ANULADO' WHERE lower(codigo) IN ('anulado', 'observado') AND codigo NOT IN ('ANULADO', 'OBSERVADO');

UPDATE public.conceptos_pago SET codigo = 'PENSION' WHERE lower(codigo) = 'pension' AND codigo <> 'PENSION';
UPDATE public.conceptos_pago SET codigo = 'MATRICULA' WHERE lower(codigo) = 'matricula' AND codigo <> 'MATRICULA';
UPDATE public.conceptos_pago SET codigo = 'MATERIAL' WHERE lower(codigo) = 'material' AND codigo <> 'MATERIAL';

UPDATE public.estados_seguimiento SET codigo = 'BIEN' WHERE lower(codigo) = 'bueno' AND codigo <> 'BIEN';
UPDATE public.estados_seguimiento SET codigo = 'REGULAR' WHERE lower(codigo) = 'regular' AND codigo <> 'REGULAR';
UPDATE public.estados_seguimiento SET codigo = 'OBSERVACION' WHERE lower(codigo) IN ('en_observacion', 'observacion') AND codigo <> 'OBSERVACION';

-- B) Reasignar FK: estados_asistencia → asistencia
WITH ranked AS (
  SELECT id, upper(trim(codigo)) AS codigo_norm,
    ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.estados_asistencia
),
keepers AS (SELECT id AS keeper_id, codigo_norm FROM ranked WHERE rn = 1),
dupes AS (
  SELECT r.id AS dupe_id, k.keeper_id FROM ranked r
  JOIN keepers k ON k.codigo_norm = r.codigo_norm WHERE r.rn > 1
)
UPDATE public.asistencia a SET estado_id = d.keeper_id FROM dupes d WHERE a.estado_id = d.dupe_id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.estados_asistencia
)
DELETE FROM public.estados_asistencia WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- C) estados_tarea → tareas
WITH ranked AS (
  SELECT id, upper(trim(codigo)) AS codigo_norm,
    ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.estados_tarea
),
keepers AS (SELECT id AS keeper_id, codigo_norm FROM ranked WHERE rn = 1),
dupes AS (
  SELECT r.id AS dupe_id, k.keeper_id FROM ranked r
  JOIN keepers k ON k.codigo_norm = r.codigo_norm WHERE r.rn > 1
)
UPDATE public.tareas t SET estado_id = d.keeper_id FROM dupes d WHERE t.estado_id = d.dupe_id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.estados_tarea
)
DELETE FROM public.estados_tarea WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- D) estados_entrega_tarea → entregas_tareas
WITH ranked AS (
  SELECT id, upper(trim(codigo)) AS codigo_norm,
    ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.estados_entrega_tarea
),
keepers AS (SELECT id AS keeper_id, codigo_norm FROM ranked WHERE rn = 1),
dupes AS (
  SELECT r.id AS dupe_id, k.keeper_id FROM ranked r
  JOIN keepers k ON k.codigo_norm = r.codigo_norm WHERE r.rn > 1
)
UPDATE public.entregas_tareas e SET estado_id = d.keeper_id FROM dupes d WHERE e.estado_id = d.dupe_id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.estados_entrega_tarea
)
DELETE FROM public.estados_entrega_tarea WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- E) tipos_evaluacion → calificaciones
WITH ranked AS (
  SELECT id, upper(trim(codigo)) AS codigo_norm,
    ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.tipos_evaluacion
),
keepers AS (SELECT id AS keeper_id, codigo_norm FROM ranked WHERE rn = 1),
dupes AS (
  SELECT r.id AS dupe_id, k.keeper_id FROM ranked r
  JOIN keepers k ON k.codigo_norm = r.codigo_norm WHERE r.rn > 1
)
UPDATE public.calificaciones c SET tipo_evaluacion_id = d.keeper_id FROM dupes d WHERE c.tipo_evaluacion_id = d.dupe_id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.tipos_evaluacion
)
DELETE FROM public.tipos_evaluacion WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- F) tipos_recurso → recursos_academicos
WITH ranked AS (
  SELECT id, upper(trim(codigo)) AS codigo_norm,
    ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.tipos_recurso
),
keepers AS (SELECT id AS keeper_id, codigo_norm FROM ranked WHERE rn = 1),
dupes AS (
  SELECT r.id AS dupe_id, k.keeper_id FROM ranked r
  JOIN keepers k ON k.codigo_norm = r.codigo_norm WHERE r.rn > 1
)
UPDATE public.recursos_academicos r SET tipo_recurso_id = d.keeper_id FROM dupes d WHERE r.tipo_recurso_id = d.dupe_id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.tipos_recurso
)
DELETE FROM public.tipos_recurso WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- G) estados_pago → pagos y pensiones
WITH ranked AS (
  SELECT id, upper(trim(codigo)) AS codigo_norm,
    ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.estados_pago
),
keepers AS (SELECT id AS keeper_id, codigo_norm FROM ranked WHERE rn = 1),
dupes AS (
  SELECT r.id AS dupe_id, k.keeper_id FROM ranked r
  JOIN keepers k ON k.codigo_norm = r.codigo_norm WHERE r.rn > 1
)
UPDATE public.pagos p SET estado_pago_id = d.keeper_id FROM dupes d WHERE p.estado_pago_id = d.dupe_id;

WITH ranked AS (
  SELECT id, upper(trim(codigo)) AS codigo_norm,
    ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.estados_pago
),
keepers AS (SELECT id AS keeper_id, codigo_norm FROM ranked WHERE rn = 1),
dupes AS (
  SELECT r.id AS dupe_id, k.keeper_id FROM ranked r
  JOIN keepers k ON k.codigo_norm = r.codigo_norm WHERE r.rn > 1
)
UPDATE public.pensiones p SET estado_pago_id = d.keeper_id FROM dupes d WHERE p.estado_pago_id = d.dupe_id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.estados_pago
)
DELETE FROM public.estados_pago WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- H) conceptos_pago → pensiones y pagos
WITH ranked AS (
  SELECT id, upper(trim(codigo)) AS codigo_norm,
    ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.conceptos_pago
),
keepers AS (SELECT id AS keeper_id, codigo_norm FROM ranked WHERE rn = 1),
dupes AS (
  SELECT r.id AS dupe_id, k.keeper_id FROM ranked r
  JOIN keepers k ON k.codigo_norm = r.codigo_norm WHERE r.rn > 1
)
UPDATE public.pensiones p SET concepto_pago_id = d.keeper_id FROM dupes d WHERE p.concepto_pago_id = d.dupe_id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.conceptos_pago
)
DELETE FROM public.conceptos_pago WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- I) estados_seguimiento → seguimiento_academico
WITH ranked AS (
  SELECT id, upper(trim(codigo)) AS codigo_norm,
    ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.estados_seguimiento
),
keepers AS (SELECT id AS keeper_id, codigo_norm FROM ranked WHERE rn = 1),
dupes AS (
  SELECT r.id AS dupe_id, k.keeper_id FROM ranked r
  JOIN keepers k ON k.codigo_norm = r.codigo_norm WHERE r.rn > 1
)
UPDATE public.seguimiento_academico s SET estado_id = d.keeper_id FROM dupes d WHERE s.estado_id = d.dupe_id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY upper(trim(codigo)) ORDER BY (codigo = upper(trim(codigo))) DESC, id) AS rn
  FROM public.estados_seguimiento
)
DELETE FROM public.estados_seguimiento WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

COMMIT;

-- Verificación
SELECT 'estados_asistencia' AS tabla, codigo, count(*) FROM public.estados_asistencia GROUP BY codigo HAVING count(*) > 1
UNION ALL
SELECT 'estados_tarea', codigo, count(*) FROM public.estados_tarea GROUP BY codigo HAVING count(*) > 1
UNION ALL
SELECT 'estados_entrega_tarea', codigo, count(*) FROM public.estados_entrega_tarea GROUP BY codigo HAVING count(*) > 1
UNION ALL
SELECT 'tipos_evaluacion', codigo, count(*) FROM public.tipos_evaluacion GROUP BY codigo HAVING count(*) > 1
UNION ALL
SELECT 'tipos_recurso', codigo, count(*) FROM public.tipos_recurso GROUP BY codigo HAVING count(*) > 1
UNION ALL
SELECT 'estados_pago', codigo, count(*) FROM public.estados_pago GROUP BY codigo HAVING count(*) > 1
UNION ALL
SELECT 'conceptos_pago', codigo, count(*) FROM public.conceptos_pago GROUP BY codigo HAVING count(*) > 1
UNION ALL
SELECT 'estados_seguimiento', codigo, count(*) FROM public.estados_seguimiento GROUP BY codigo HAVING count(*) > 1;
