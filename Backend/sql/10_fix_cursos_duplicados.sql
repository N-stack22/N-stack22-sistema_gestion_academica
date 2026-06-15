-- Fusiona cursos_asignados duplicados (misma asignatura + sección + año)
-- y reasigna horarios al registro canónico antes de eliminar duplicados.

-- 1) Identificar canónico por grupo (el que tiene más horarios, o menor id)
WITH grupos AS (
  SELECT
    ca.anio_academico_id,
    ca.seccion_id,
    ca.asignatura_id,
    ca.id,
    (SELECT count(*) FROM public.horarios h WHERE h.curso_asignado_id = ca.id) AS num_horarios
  FROM public.cursos_asignados ca
),
ranked AS (
  SELECT
    *,
    row_number() OVER (
      PARTITION BY anio_academico_id, seccion_id, asignatura_id
      ORDER BY num_horarios DESC, id::text
    ) AS rn
  FROM grupos
),
canonicos AS (
  SELECT anio_academico_id, seccion_id, asignatura_id, id AS canonico_id
  FROM ranked WHERE rn = 1
),
duplicados AS (
  SELECT r.id AS duplicado_id, c.canonico_id
  FROM ranked r
  JOIN canonicos c
    ON c.anio_academico_id = r.anio_academico_id
   AND c.seccion_id = r.seccion_id
   AND c.asignatura_id = r.asignatura_id
  WHERE r.rn > 1
)
UPDATE public.horarios h
SET curso_asignado_id = d.canonico_id
FROM duplicados d
WHERE h.curso_asignado_id = d.duplicado_id;

-- 2) Eliminar cursos duplicados (sin horarios ya migrados)
WITH grupos AS (
  SELECT
    ca.anio_academico_id,
    ca.seccion_id,
    ca.asignatura_id,
    ca.id,
    (SELECT count(*) FROM public.horarios h WHERE h.curso_asignado_id = ca.id) AS num_horarios
  FROM public.cursos_asignados ca
),
ranked AS (
  SELECT
    *,
    row_number() OVER (
      PARTITION BY anio_academico_id, seccion_id, asignatura_id
      ORDER BY num_horarios DESC, id::text
    ) AS rn
  FROM grupos
)
DELETE FROM public.cursos_asignados ca
USING ranked r
WHERE ca.id = r.id AND r.rn > 1;

-- Verificación
SELECT
  s.nombre AS seccion,
  a.nombre AS asignatura,
  count(*) AS registros
FROM public.cursos_asignados ca
JOIN public.secciones s ON s.id = ca.seccion_id
JOIN public.asignaturas a ON a.id = ca.asignatura_id
GROUP BY s.nombre, a.nombre
HAVING count(*) > 1;
