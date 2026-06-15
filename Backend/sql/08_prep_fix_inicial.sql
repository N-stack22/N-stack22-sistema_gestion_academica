-- ============================================================
-- PASO 8-PREP (opcional): Reparar duplicados Inicial 3/4/5 anos
-- Ejecutar SOLO si el paso 8 falla con error grados_nivel_id_nombre_key
-- Luego ejecutar 08_fix_grados_secciones.sql completo
-- ============================================================

-- Fusionar duplicados exactos (mismo nivel + mismo nombre)
UPDATE public.secciones s SET grado_id = g_keep.id
FROM public.grados g_dup
JOIN public.grados g_keep ON g_keep.nivel_id = g_dup.nivel_id AND g_keep.nombre = g_dup.nombre AND g_keep.id < g_dup.id
WHERE s.grado_id = g_dup.id;

UPDATE public.comunicados c SET grado_id = g_keep.id
FROM public.grados g_dup
JOIN public.grados g_keep ON g_keep.nivel_id = g_dup.nivel_id AND g_keep.nombre = g_dup.nombre AND g_keep.id < g_dup.id
WHERE c.grado_id = g_dup.id;

UPDATE public.eventos e SET grado_id = g_keep.id
FROM public.grados g_dup
JOIN public.grados g_keep ON g_keep.nivel_id = g_dup.nivel_id AND g_keep.nombre = g_dup.nombre AND g_keep.id < g_dup.id
WHERE e.grado_id = g_dup.id;

DELETE FROM public.grados g_dup
USING public.grados g_keep
WHERE g_dup.nivel_id = g_keep.nivel_id AND g_dup.nombre = g_keep.nombre AND g_dup.id > g_keep.id;

-- Fusionar variantes anos/años en Inicial (normalizado)
UPDATE public.secciones s SET grado_id = g_keep.id
FROM public.grados g_dup
JOIN public.grados g_keep ON g_keep.nivel_id = g_dup.nivel_id AND g_keep.id < g_dup.id
JOIN public.niveles_educativos n ON n.id = g_dup.nivel_id AND n.codigo = 'INICIAL'
WHERE s.grado_id = g_dup.id
  AND lower(replace(replace(trim(g_keep.nombre), 'á', 'a'), 'ñ', 'n'))
    = lower(replace(replace(trim(g_dup.nombre), 'á', 'a'), 'ñ', 'n'))
  AND lower(replace(replace(trim(g_keep.nombre), 'á', 'a'), 'ñ', 'n')) IN ('3 anos', '4 anos', '5 anos');

UPDATE public.comunicados c SET grado_id = g_keep.id
FROM public.grados g_dup
JOIN public.grados g_keep ON g_keep.nivel_id = g_dup.nivel_id AND g_keep.id < g_dup.id
JOIN public.niveles_educativos n ON n.id = g_dup.nivel_id AND n.codigo = 'INICIAL'
WHERE c.grado_id = g_dup.id
  AND lower(replace(replace(trim(g_keep.nombre), 'á', 'a'), 'ñ', 'n'))
    = lower(replace(replace(trim(g_dup.nombre), 'á', 'a'), 'ñ', 'n'))
  AND lower(replace(replace(trim(g_keep.nombre), 'á', 'a'), 'ñ', 'n')) IN ('3 anos', '4 anos', '5 anos');

UPDATE public.eventos e SET grado_id = g_keep.id
FROM public.grados g_dup
JOIN public.grados g_keep ON g_keep.nivel_id = g_dup.nivel_id AND g_keep.id < g_dup.id
JOIN public.niveles_educativos n ON n.id = g_dup.nivel_id AND n.codigo = 'INICIAL'
WHERE e.grado_id = g_dup.id
  AND lower(replace(replace(trim(g_keep.nombre), 'á', 'a'), 'ñ', 'n'))
    = lower(replace(replace(trim(g_dup.nombre), 'á', 'a'), 'ñ', 'n'))
  AND lower(replace(replace(trim(g_keep.nombre), 'á', 'a'), 'ñ', 'n')) IN ('3 anos', '4 anos', '5 anos');

DELETE FROM public.grados g_dup
USING public.grados g_keep, public.niveles_educativos n
WHERE g_dup.nivel_id = g_keep.nivel_id AND g_dup.nivel_id = n.id AND n.codigo = 'INICIAL'
  AND g_dup.id > g_keep.id
  AND lower(replace(replace(trim(g_keep.nombre), 'á', 'a'), 'ñ', 'n'))
    = lower(replace(replace(trim(g_dup.nombre), 'á', 'a'), 'ñ', 'n'))
  AND lower(replace(replace(trim(g_keep.nombre), 'á', 'a'), 'ñ', 'n')) IN ('3 anos', '4 anos', '5 anos');

SELECT n.codigo, g.nombre, g.id, count(*) OVER (PARTITION BY g.nivel_id, g.nombre) AS duplicados
FROM public.grados g
JOIN public.niveles_educativos n ON n.id = g.nivel_id
WHERE n.codigo = 'INICIAL'
ORDER BY g.nombre;

-- ¿Hay niveles INICIAL duplicados? (debe ser 1 fila)
SELECT codigo, count(*) AS cantidad, array_agg(id::text) AS ids
FROM public.niveles_educativos
WHERE codigo = 'INICIAL'
GROUP BY codigo;
