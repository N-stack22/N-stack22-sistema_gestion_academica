-- ============================================================
-- PASO 8: Unificar niveles, grados y secciones duplicados
-- Ejecutar DESPUÉS del paso 07
-- Sin tablas temporales — compatible con Supabase SQL Editor
-- ============================================================

-- A) Niveles canónicos
INSERT INTO public.niveles_educativos (codigo, nombre, descripcion) VALUES
  ('INICIAL', 'Inicial', 'Educación inicial'),
  ('PRIMARIA', 'Primaria', 'Educación primaria'),
  ('SECUNDARIA', 'Secundaria', 'Educación secundaria'),
  ('CEBA', 'CEBA', 'Centro de Educación Básica Alternativa')
ON CONFLICT (codigo) DO NOTHING;

-- A2) Un nivel canónico por código (menor id)
-- Si el grado ya existe en el canónico → fusionar referencias y borrar duplicado
UPDATE public.secciones s
SET grado_id = g_keep.id
FROM public.grados g_move
JOIN public.niveles_educativos n ON n.id = g_move.nivel_id
JOIN public.grados g_keep
  ON g_keep.nivel_id = (
    SELECT MIN(n2.id::text)::uuid FROM public.niveles_educativos n2 WHERE n2.codigo = upper(n.codigo)
  )
 AND g_keep.nombre = g_move.nombre
WHERE g_move.nivel_id <> g_keep.nivel_id
  AND s.grado_id = g_move.id
  AND g_move.id <> g_keep.id;

UPDATE public.comunicados c
SET grado_id = g_keep.id
FROM public.grados g_move
JOIN public.niveles_educativos n ON n.id = g_move.nivel_id
JOIN public.grados g_keep
  ON g_keep.nivel_id = (
    SELECT MIN(n2.id::text)::uuid FROM public.niveles_educativos n2 WHERE n2.codigo = upper(n.codigo)
  )
 AND g_keep.nombre = g_move.nombre
WHERE g_move.nivel_id <> g_keep.nivel_id
  AND c.grado_id = g_move.id
  AND g_move.id <> g_keep.id;

UPDATE public.eventos e
SET grado_id = g_keep.id
FROM public.grados g_move
JOIN public.niveles_educativos n ON n.id = g_move.nivel_id
JOIN public.grados g_keep
  ON g_keep.nivel_id = (
    SELECT MIN(n2.id::text)::uuid FROM public.niveles_educativos n2 WHERE n2.codigo = upper(n.codigo)
  )
 AND g_keep.nombre = g_move.nombre
WHERE g_move.nivel_id <> g_keep.nivel_id
  AND e.grado_id = g_move.id
  AND g_move.id <> g_keep.id;

DELETE FROM public.grados g_move
USING public.niveles_educativos n, public.grados g_keep
WHERE g_move.nivel_id = n.id
  AND g_keep.nivel_id = (
    SELECT MIN(n2.id::text)::uuid FROM public.niveles_educativos n2 WHERE n2.codigo = upper(n.codigo)
  )
  AND g_keep.nombre = g_move.nombre
  AND g_move.nivel_id <> g_keep.nivel_id
  AND g_move.id <> g_keep.id;

-- A3) Mover grados restantes al nivel canónico (ya no hay choque de nombre)
UPDATE public.grados g
SET nivel_id = n_canon.id
FROM public.niveles_educativos n
JOIN public.niveles_educativos n_canon
  ON n_canon.codigo = upper(n.codigo)
 AND n_canon.id = (
   SELECT MIN(n2.id::text)::uuid FROM public.niveles_educativos n2 WHERE n2.codigo = upper(n.codigo)
 )
WHERE g.nivel_id = n.id
  AND g.nivel_id <> n_canon.id;

-- A4) Eliminar niveles duplicados (conservar el de menor id)
DELETE FROM public.niveles_educativos n
WHERE upper(n.codigo) IN ('INICIAL','PRIMARIA','SECUNDARIA','CEBA')
  AND n.id <> (
    SELECT MIN(n2.id::text)::uuid FROM public.niveles_educativos n2 WHERE n2.codigo = upper(n.codigo)
  );

DELETE FROM public.niveles_educativos n
WHERE upper(n.codigo) IN ('INICIAL','PRIMARIA','SECUNDARIA','CEBA')
  AND n.codigo <> upper(n.codigo);

-- B1) Fusionar grados duplicados (mismo nivel_id + mismo nombre tras unificar niveles)
UPDATE public.secciones s
SET grado_id = g_keep.id
FROM public.grados g_dup
JOIN public.grados g_keep
  ON g_keep.nivel_id = g_dup.nivel_id
 AND g_keep.nombre = g_dup.nombre
 AND g_keep.id < g_dup.id
WHERE s.grado_id = g_dup.id;

UPDATE public.comunicados com
SET grado_id = g_keep.id
FROM public.grados g_dup
JOIN public.grados g_keep
  ON g_keep.nivel_id = g_dup.nivel_id
 AND g_keep.nombre = g_dup.nombre
 AND g_keep.id < g_dup.id
WHERE com.grado_id = g_dup.id;

UPDATE public.eventos ev
SET grado_id = g_keep.id
FROM public.grados g_dup
JOIN public.grados g_keep
  ON g_keep.nivel_id = g_dup.nivel_id
 AND g_keep.nombre = g_dup.nombre
 AND g_keep.id < g_dup.id
WHERE ev.grado_id = g_dup.id;

DELETE FROM public.grados g_dup
USING public.grados g_keep
WHERE g_dup.nivel_id = g_keep.nivel_id
  AND g_dup.nombre = g_keep.nombre
  AND g_dup.id > g_keep.id;

-- B1b) Fusionar variantes Inicial (cualquier escritura de anos/años)
UPDATE public.secciones s
SET grado_id = g_keep.id
FROM public.grados g_dup
JOIN public.grados g_keep ON g_keep.nivel_id = g_dup.nivel_id AND g_keep.id < g_dup.id
JOIN public.niveles_educativos n ON n.id = g_dup.nivel_id AND n.codigo = 'INICIAL'
WHERE s.grado_id = g_dup.id
  AND lower(replace(replace(trim(g_keep.nombre), 'á', 'a'), 'ñ', 'n'))
    = lower(replace(replace(trim(g_dup.nombre), 'á', 'a'), 'ñ', 'n'))
  AND lower(replace(replace(trim(g_keep.nombre), 'á', 'a'), 'ñ', 'n')) IN ('3 anos', '4 anos', '5 anos');

UPDATE public.comunicados com
SET grado_id = g_keep.id
FROM public.grados g_dup
JOIN public.grados g_keep ON g_keep.nivel_id = g_dup.nivel_id AND g_keep.id < g_dup.id
JOIN public.niveles_educativos n ON n.id = g_dup.nivel_id AND n.codigo = 'INICIAL'
WHERE com.grado_id = g_dup.id
  AND lower(replace(replace(trim(g_keep.nombre), 'á', 'a'), 'ñ', 'n'))
    = lower(replace(replace(trim(g_dup.nombre), 'á', 'a'), 'ñ', 'n'))
  AND lower(replace(replace(trim(g_keep.nombre), 'á', 'a'), 'ñ', 'n')) IN ('3 anos', '4 anos', '5 anos');

UPDATE public.eventos ev
SET grado_id = g_keep.id
FROM public.grados g_dup
JOIN public.grados g_keep ON g_keep.nivel_id = g_dup.nivel_id AND g_keep.id < g_dup.id
JOIN public.niveles_educativos n ON n.id = g_dup.nivel_id AND n.codigo = 'INICIAL'
WHERE ev.grado_id = g_dup.id
  AND lower(replace(replace(trim(g_keep.nombre), 'á', 'a'), 'ñ', 'n'))
    = lower(replace(replace(trim(g_dup.nombre), 'á', 'a'), 'ñ', 'n'))
  AND lower(replace(replace(trim(g_keep.nombre), 'á', 'a'), 'ñ', 'n')) IN ('3 anos', '4 anos', '5 anos');

DELETE FROM public.grados g_dup
USING public.grados g_keep, public.niveles_educativos n
WHERE g_dup.nivel_id = g_keep.nivel_id
  AND g_dup.nivel_id = n.id
  AND n.codigo = 'INICIAL'
  AND g_dup.id > g_keep.id
  AND lower(replace(replace(trim(g_keep.nombre), 'á', 'a'), 'ñ', 'n'))
    = lower(replace(replace(trim(g_dup.nombre), 'á', 'a'), 'ñ', 'n'))
  AND lower(replace(replace(trim(g_keep.nombre), 'á', 'a'), 'ñ', 'n')) IN ('3 anos', '4 anos', '5 anos');

-- B2) Si existen alias Y canónico en el mismo nivel → migrar referencias y borrar alias
UPDATE public.secciones s
SET grado_id = g_canon.id
FROM public.grados g_alias
JOIN public.niveles_educativos n ON n.id = g_alias.nivel_id
JOIN (VALUES
  ('INICIAL','3 anos','3 anos'), ('INICIAL','3 años','3 anos'),
  ('INICIAL','4 anos','4 anos'), ('INICIAL','4 años','4 anos'),
  ('INICIAL','5 anos','5 anos'), ('INICIAL','5 años','5 anos'),
  ('PRIMARIA','1° de primaria','1ro'), ('PRIMARIA','2° de primaria','2do'),
  ('PRIMARIA','3° de primaria','3ro'), ('PRIMARIA','4° de primaria','4to'),
  ('PRIMARIA','5° de primaria','5to'), ('PRIMARIA','6° de primaria','6to'), ('PRIMARIA','4ro','4to'),
  ('SECUNDARIA','1° de secundaria','1ro'), ('SECUNDARIA','2° de secundaria','2do'),
  ('SECUNDARIA','3° de secundaria','3ro'), ('SECUNDARIA','4° de secundaria','4to'),
  ('SECUNDARIA','5° de secundaria','5to'), ('SECUNDARIA','4ro','4to'),
  ('CEBA','1ro CEBA','1ro'), ('CEBA','2do CEBA','2do'), ('CEBA','3ro CEBA','3ro'),
  ('CEBA','4to CEBA','4to'), ('CEBA','5to CEBA','5to'), ('CEBA','6to CEBA','6to'),
  ('CEBA','7mo CEBA','7mo'), ('CEBA','8vo CEBA','8vo'), ('CEBA','9no CEBA','9no'),
  ('CEBA','1° CEBA','1ro'), ('CEBA','2° CEBA','2do'), ('CEBA','3° CEBA','3ro'),
  ('CEBA','4° CEBA','4to'), ('CEBA','5° CEBA','5to'), ('CEBA','6° CEBA','6to'),
  ('CEBA','7° CEBA','7mo'), ('CEBA','8° CEBA','8vo'), ('CEBA','9° CEBA','9no')
) AS a(nivel_codigo, alias, canon) ON a.nivel_codigo = n.codigo
  AND lower(replace(replace(trim(g_alias.nombre), 'á', 'a'), 'ñ', 'n')) = lower(replace(replace(trim(a.alias), 'á', 'a'), 'ñ', 'n'))
JOIN public.grados g_canon ON g_canon.nivel_id = g_alias.nivel_id AND g_canon.nombre = a.canon
WHERE s.grado_id = g_alias.id AND g_alias.id <> g_canon.id;

UPDATE public.comunicados com
SET grado_id = g_canon.id
FROM public.grados g_alias
JOIN public.niveles_educativos n ON n.id = g_alias.nivel_id
JOIN (VALUES
  ('INICIAL','3 anos','3 anos'), ('INICIAL','3 años','3 anos'),
  ('INICIAL','4 anos','4 anos'), ('INICIAL','4 años','4 anos'),
  ('INICIAL','5 anos','5 anos'), ('INICIAL','5 años','5 anos'),
  ('PRIMARIA','1° de primaria','1ro'), ('PRIMARIA','2° de primaria','2do'),
  ('PRIMARIA','3° de primaria','3ro'), ('PRIMARIA','4° de primaria','4to'),
  ('PRIMARIA','5° de primaria','5to'), ('PRIMARIA','6° de primaria','6to'), ('PRIMARIA','4ro','4to'),
  ('SECUNDARIA','1° de secundaria','1ro'), ('SECUNDARIA','2° de secundaria','2do'),
  ('SECUNDARIA','3° de secundaria','3ro'), ('SECUNDARIA','4° de secundaria','4to'),
  ('SECUNDARIA','5° de secundaria','5to'), ('SECUNDARIA','4ro','4to'),
  ('CEBA','1ro CEBA','1ro'), ('CEBA','2do CEBA','2do'), ('CEBA','3ro CEBA','3ro'),
  ('CEBA','4to CEBA','4to'), ('CEBA','5to CEBA','5to'), ('CEBA','6to CEBA','6to'),
  ('CEBA','7mo CEBA','7mo'), ('CEBA','8vo CEBA','8vo'), ('CEBA','9no CEBA','9no'),
  ('CEBA','1° CEBA','1ro'), ('CEBA','2° CEBA','2do'), ('CEBA','3° CEBA','3ro'),
  ('CEBA','4° CEBA','4to'), ('CEBA','5° CEBA','5to'), ('CEBA','6° CEBA','6to'),
  ('CEBA','7° CEBA','7mo'), ('CEBA','8° CEBA','8vo'), ('CEBA','9° CEBA','9no')
) AS a(nivel_codigo, alias, canon) ON a.nivel_codigo = n.codigo
  AND lower(replace(replace(trim(g_alias.nombre), 'á', 'a'), 'ñ', 'n')) = lower(replace(replace(trim(a.alias), 'á', 'a'), 'ñ', 'n'))
JOIN public.grados g_canon ON g_canon.nivel_id = g_alias.nivel_id AND g_canon.nombre = a.canon
WHERE com.grado_id = g_alias.id AND g_alias.id <> g_canon.id;

UPDATE public.eventos ev
SET grado_id = g_canon.id
FROM public.grados g_alias
JOIN public.niveles_educativos n ON n.id = g_alias.nivel_id
JOIN (VALUES
  ('INICIAL','3 anos','3 anos'), ('INICIAL','3 años','3 anos'),
  ('INICIAL','4 anos','4 anos'), ('INICIAL','4 años','4 anos'),
  ('INICIAL','5 anos','5 anos'), ('INICIAL','5 años','5 anos'),
  ('PRIMARIA','1° de primaria','1ro'), ('PRIMARIA','2° de primaria','2do'),
  ('PRIMARIA','3° de primaria','3ro'), ('PRIMARIA','4° de primaria','4to'),
  ('PRIMARIA','5° de primaria','5to'), ('PRIMARIA','6° de primaria','6to'), ('PRIMARIA','4ro','4to'),
  ('SECUNDARIA','1° de secundaria','1ro'), ('SECUNDARIA','2° de secundaria','2do'),
  ('SECUNDARIA','3° de secundaria','3ro'), ('SECUNDARIA','4° de secundaria','4to'),
  ('SECUNDARIA','5° de secundaria','5to'), ('SECUNDARIA','4ro','4to'),
  ('CEBA','1ro CEBA','1ro'), ('CEBA','2do CEBA','2do'), ('CEBA','3ro CEBA','3ro'),
  ('CEBA','4to CEBA','4to'), ('CEBA','5to CEBA','5to'), ('CEBA','6to CEBA','6to'),
  ('CEBA','7mo CEBA','7mo'), ('CEBA','8vo CEBA','8vo'), ('CEBA','9no CEBA','9no'),
  ('CEBA','1° CEBA','1ro'), ('CEBA','2° CEBA','2do'), ('CEBA','3° CEBA','3ro'),
  ('CEBA','4° CEBA','4to'), ('CEBA','5° CEBA','5to'), ('CEBA','6° CEBA','6to'),
  ('CEBA','7° CEBA','7mo'), ('CEBA','8° CEBA','8vo'), ('CEBA','9° CEBA','9no')
) AS a(nivel_codigo, alias, canon) ON a.nivel_codigo = n.codigo
  AND lower(replace(replace(trim(g_alias.nombre), 'á', 'a'), 'ñ', 'n')) = lower(replace(replace(trim(a.alias), 'á', 'a'), 'ñ', 'n'))
JOIN public.grados g_canon ON g_canon.nivel_id = g_alias.nivel_id AND g_canon.nombre = a.canon
WHERE ev.grado_id = g_alias.id AND g_alias.id <> g_canon.id;

DELETE FROM public.grados g_alias
USING public.niveles_educativos n,
(VALUES
  ('INICIAL','3 anos','3 anos'), ('INICIAL','3 años','3 anos'),
  ('INICIAL','4 anos','4 anos'), ('INICIAL','4 años','4 anos'),
  ('INICIAL','5 anos','5 anos'), ('INICIAL','5 años','5 anos'),
  ('PRIMARIA','1° de primaria','1ro'), ('PRIMARIA','2° de primaria','2do'),
  ('PRIMARIA','3° de primaria','3ro'), ('PRIMARIA','4° de primaria','4to'),
  ('PRIMARIA','5° de primaria','5to'), ('PRIMARIA','6° de primaria','6to'), ('PRIMARIA','4ro','4to'),
  ('SECUNDARIA','1° de secundaria','1ro'), ('SECUNDARIA','2° de secundaria','2do'),
  ('SECUNDARIA','3° de secundaria','3ro'), ('SECUNDARIA','4° de secundaria','4to'),
  ('SECUNDARIA','5° de secundaria','5to'), ('SECUNDARIA','4ro','4to'),
  ('CEBA','1ro CEBA','1ro'), ('CEBA','2do CEBA','2do'), ('CEBA','3ro CEBA','3ro'),
  ('CEBA','4to CEBA','4to'), ('CEBA','5to CEBA','5to'), ('CEBA','6to CEBA','6to'),
  ('CEBA','7mo CEBA','7mo'), ('CEBA','8vo CEBA','8vo'), ('CEBA','9no CEBA','9no'),
  ('CEBA','1° CEBA','1ro'), ('CEBA','2° CEBA','2do'), ('CEBA','3° CEBA','3ro'),
  ('CEBA','4° CEBA','4to'), ('CEBA','5° CEBA','5to'), ('CEBA','6° CEBA','6to'),
  ('CEBA','7° CEBA','7mo'), ('CEBA','8° CEBA','8vo'), ('CEBA','9° CEBA','9no')
) AS a(nivel_codigo, alias, canon),
public.grados g_canon
WHERE g_alias.nivel_id = n.id
  AND n.codigo = a.nivel_codigo
  AND lower(replace(replace(trim(g_alias.nombre), 'á', 'a'), 'ñ', 'n')) = lower(replace(replace(trim(a.alias), 'á', 'a'), 'ñ', 'n'))
  AND g_canon.nivel_id = g_alias.nivel_id
  AND g_canon.nombre = a.canon
  AND g_alias.id <> g_canon.id;

-- B3) Repetir fusión exacta (por si quedaron duplicados tras pasos anteriores)
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

-- B3b) Repetir fusión alias → canónico (4ro→4to, 4° de primaria→4to, etc.)
UPDATE public.secciones s SET grado_id = g_canon.id
FROM public.grados g_alias
JOIN public.niveles_educativos n ON n.id = g_alias.nivel_id
JOIN (VALUES
  ('INICIAL','3 anos','3 anos'), ('INICIAL','3 años','3 anos'),
  ('INICIAL','4 anos','4 anos'), ('INICIAL','4 años','4 anos'),
  ('INICIAL','5 anos','5 anos'), ('INICIAL','5 años','5 anos'),
  ('PRIMARIA','1° de primaria','1ro'), ('PRIMARIA','2° de primaria','2do'),
  ('PRIMARIA','3° de primaria','3ro'), ('PRIMARIA','4° de primaria','4to'),
  ('PRIMARIA','5° de primaria','5to'), ('PRIMARIA','6° de primaria','6to'), ('PRIMARIA','4ro','4to'),
  ('SECUNDARIA','1° de secundaria','1ro'), ('SECUNDARIA','2° de secundaria','2do'),
  ('SECUNDARIA','3° de secundaria','3ro'), ('SECUNDARIA','4° de secundaria','4to'),
  ('SECUNDARIA','5° de secundaria','5to'), ('SECUNDARIA','4ro','4to'),
  ('CEBA','1ro CEBA','1ro'), ('CEBA','2do CEBA','2do'), ('CEBA','3ro CEBA','3ro'),
  ('CEBA','4to CEBA','4to'), ('CEBA','5to CEBA','5to'), ('CEBA','6to CEBA','6to'),
  ('CEBA','7mo CEBA','7mo'), ('CEBA','8vo CEBA','8vo'), ('CEBA','9no CEBA','9no'),
  ('CEBA','1° CEBA','1ro'), ('CEBA','2° CEBA','2do'), ('CEBA','3° CEBA','3ro'),
  ('CEBA','4° CEBA','4to'), ('CEBA','5° CEBA','5to'), ('CEBA','6° CEBA','6to'),
  ('CEBA','7° CEBA','7mo'), ('CEBA','8° CEBA','8vo'), ('CEBA','9° CEBA','9no')
) AS a(nivel_codigo, alias, canon) ON a.nivel_codigo = n.codigo
  AND lower(replace(replace(trim(g_alias.nombre), 'á', 'a'), 'ñ', 'n')) = lower(replace(replace(trim(a.alias), 'á', 'a'), 'ñ', 'n'))
  AND lower(trim(a.alias)) <> lower(trim(a.canon))
JOIN public.grados g_canon ON g_canon.nivel_id = g_alias.nivel_id AND g_canon.nombre = a.canon
WHERE s.grado_id = g_alias.id AND g_alias.id <> g_canon.id;

UPDATE public.comunicados c SET grado_id = g_canon.id
FROM public.grados g_alias
JOIN public.niveles_educativos n ON n.id = g_alias.nivel_id
JOIN (VALUES
  ('INICIAL','3 anos','3 anos'), ('INICIAL','3 años','3 anos'),
  ('INICIAL','4 anos','4 anos'), ('INICIAL','4 años','4 anos'),
  ('INICIAL','5 anos','5 anos'), ('INICIAL','5 años','5 anos'),
  ('PRIMARIA','1° de primaria','1ro'), ('PRIMARIA','2° de primaria','2do'),
  ('PRIMARIA','3° de primaria','3ro'), ('PRIMARIA','4° de primaria','4to'),
  ('PRIMARIA','5° de primaria','5to'), ('PRIMARIA','6° de primaria','6to'), ('PRIMARIA','4ro','4to'),
  ('SECUNDARIA','1° de secundaria','1ro'), ('SECUNDARIA','2° de secundaria','2do'),
  ('SECUNDARIA','3° de secundaria','3ro'), ('SECUNDARIA','4° de secundaria','4to'),
  ('SECUNDARIA','5° de secundaria','5to'), ('SECUNDARIA','4ro','4to'),
  ('CEBA','1ro CEBA','1ro'), ('CEBA','2do CEBA','2do'), ('CEBA','3ro CEBA','3ro'),
  ('CEBA','4to CEBA','4to'), ('CEBA','5to CEBA','5to'), ('CEBA','6to CEBA','6to'),
  ('CEBA','7mo CEBA','7mo'), ('CEBA','8vo CEBA','8vo'), ('CEBA','9no CEBA','9no'),
  ('CEBA','1° CEBA','1ro'), ('CEBA','2° CEBA','2do'), ('CEBA','3° CEBA','3ro'),
  ('CEBA','4° CEBA','4to'), ('CEBA','5° CEBA','5to'), ('CEBA','6° CEBA','6to'),
  ('CEBA','7° CEBA','7mo'), ('CEBA','8° CEBA','8vo'), ('CEBA','9° CEBA','9no')
) AS a(nivel_codigo, alias, canon) ON a.nivel_codigo = n.codigo
  AND lower(replace(replace(trim(g_alias.nombre), 'á', 'a'), 'ñ', 'n')) = lower(replace(replace(trim(a.alias), 'á', 'a'), 'ñ', 'n'))
  AND lower(trim(a.alias)) <> lower(trim(a.canon))
JOIN public.grados g_canon ON g_canon.nivel_id = g_alias.nivel_id AND g_canon.nombre = a.canon
WHERE c.grado_id = g_alias.id AND g_alias.id <> g_canon.id;

UPDATE public.eventos e SET grado_id = g_canon.id
FROM public.grados g_alias
JOIN public.niveles_educativos n ON n.id = g_alias.nivel_id
JOIN (VALUES
  ('INICIAL','3 anos','3 anos'), ('INICIAL','3 años','3 anos'),
  ('INICIAL','4 anos','4 anos'), ('INICIAL','4 años','4 anos'),
  ('INICIAL','5 anos','5 anos'), ('INICIAL','5 años','5 anos'),
  ('PRIMARIA','1° de primaria','1ro'), ('PRIMARIA','2° de primaria','2do'),
  ('PRIMARIA','3° de primaria','3ro'), ('PRIMARIA','4° de primaria','4to'),
  ('PRIMARIA','5° de primaria','5to'), ('PRIMARIA','6° de primaria','6to'), ('PRIMARIA','4ro','4to'),
  ('SECUNDARIA','1° de secundaria','1ro'), ('SECUNDARIA','2° de secundaria','2do'),
  ('SECUNDARIA','3° de secundaria','3ro'), ('SECUNDARIA','4° de secundaria','4to'),
  ('SECUNDARIA','5° de secundaria','5to'), ('SECUNDARIA','4ro','4to'),
  ('CEBA','1ro CEBA','1ro'), ('CEBA','2do CEBA','2do'), ('CEBA','3ro CEBA','3ro'),
  ('CEBA','4to CEBA','4to'), ('CEBA','5to CEBA','5to'), ('CEBA','6to CEBA','6to'),
  ('CEBA','7mo CEBA','7mo'), ('CEBA','8vo CEBA','8vo'), ('CEBA','9no CEBA','9no'),
  ('CEBA','1° CEBA','1ro'), ('CEBA','2° CEBA','2do'), ('CEBA','3° CEBA','3ro'),
  ('CEBA','4° CEBA','4to'), ('CEBA','5° CEBA','5to'), ('CEBA','6° CEBA','6to'),
  ('CEBA','7° CEBA','7mo'), ('CEBA','8° CEBA','8vo'), ('CEBA','9° CEBA','9no')
) AS a(nivel_codigo, alias, canon) ON a.nivel_codigo = n.codigo
  AND lower(replace(replace(trim(g_alias.nombre), 'á', 'a'), 'ñ', 'n')) = lower(replace(replace(trim(a.alias), 'á', 'a'), 'ñ', 'n'))
  AND lower(trim(a.alias)) <> lower(trim(a.canon))
JOIN public.grados g_canon ON g_canon.nivel_id = g_alias.nivel_id AND g_canon.nombre = a.canon
WHERE e.grado_id = g_alias.id AND g_alias.id <> g_canon.id;

DELETE FROM public.grados g_alias
USING public.niveles_educativos n,
(VALUES
  ('INICIAL','3 anos','3 anos'), ('INICIAL','3 años','3 anos'),
  ('INICIAL','4 anos','4 anos'), ('INICIAL','4 años','4 anos'),
  ('INICIAL','5 anos','5 anos'), ('INICIAL','5 años','5 anos'),
  ('PRIMARIA','1° de primaria','1ro'), ('PRIMARIA','2° de primaria','2do'),
  ('PRIMARIA','3° de primaria','3ro'), ('PRIMARIA','4° de primaria','4to'),
  ('PRIMARIA','5° de primaria','5to'), ('PRIMARIA','6° de primaria','6to'), ('PRIMARIA','4ro','4to'),
  ('SECUNDARIA','1° de secundaria','1ro'), ('SECUNDARIA','2° de secundaria','2do'),
  ('SECUNDARIA','3° de secundaria','3ro'), ('SECUNDARIA','4° de secundaria','4to'),
  ('SECUNDARIA','5° de secundaria','5to'), ('SECUNDARIA','4ro','4to'),
  ('CEBA','1ro CEBA','1ro'), ('CEBA','2do CEBA','2do'), ('CEBA','3ro CEBA','3ro'),
  ('CEBA','4to CEBA','4to'), ('CEBA','5to CEBA','5to'), ('CEBA','6to CEBA','6to'),
  ('CEBA','7mo CEBA','7mo'), ('CEBA','8vo CEBA','8vo'), ('CEBA','9no CEBA','9no'),
  ('CEBA','1° CEBA','1ro'), ('CEBA','2° CEBA','2do'), ('CEBA','3° CEBA','3ro'),
  ('CEBA','4° CEBA','4to'), ('CEBA','5° CEBA','5to'), ('CEBA','6° CEBA','6to'),
  ('CEBA','7° CEBA','7mo'), ('CEBA','8° CEBA','8vo'), ('CEBA','9° CEBA','9no')
) AS a(nivel_codigo, alias, canon),
public.grados g_canon
WHERE g_alias.nivel_id = n.id AND n.codigo = a.nivel_codigo
  AND lower(replace(replace(trim(g_alias.nombre), 'á', 'a'), 'ñ', 'n')) = lower(replace(replace(trim(a.alias), 'á', 'a'), 'ñ', 'n'))
  AND lower(trim(a.alias)) <> lower(trim(a.canon))
  AND g_canon.nivel_id = g_alias.nivel_id AND g_canon.nombre = a.canon
  AND g_alias.id <> g_canon.id;

-- B3c) Renombrar alias solo si NO existe el canónico (un registro por nivel+canon)
UPDATE public.grados g
SET nombre = picks.canon
FROM (
  SELECT DISTINCT ON (g.nivel_id, a.canon)
    g.id AS grado_id,
    a.canon
  FROM public.grados g
  JOIN public.niveles_educativos n ON n.id = g.nivel_id
  JOIN (VALUES
    ('INICIAL','3 anos','3 anos'), ('INICIAL','3 años','3 anos'),
    ('INICIAL','4 anos','4 anos'), ('INICIAL','4 años','4 anos'),
    ('INICIAL','5 anos','5 anos'), ('INICIAL','5 años','5 anos'),
    ('PRIMARIA','1° de primaria','1ro'), ('PRIMARIA','2° de primaria','2do'),
    ('PRIMARIA','3° de primaria','3ro'), ('PRIMARIA','4° de primaria','4to'),
    ('PRIMARIA','5° de primaria','5to'), ('PRIMARIA','6° de primaria','6to'), ('PRIMARIA','4ro','4to'),
    ('SECUNDARIA','1° de secundaria','1ro'), ('SECUNDARIA','2° de secundaria','2do'),
    ('SECUNDARIA','3° de secundaria','3ro'), ('SECUNDARIA','4° de secundaria','4to'),
    ('SECUNDARIA','5° de secundaria','5to'), ('SECUNDARIA','4ro','4to'),
    ('CEBA','1ro CEBA','1ro'), ('CEBA','2do CEBA','2do'), ('CEBA','3ro CEBA','3ro'),
    ('CEBA','4to CEBA','4to'), ('CEBA','5to CEBA','5to'), ('CEBA','6to CEBA','6to'),
    ('CEBA','7mo CEBA','7mo'), ('CEBA','8vo CEBA','8vo'), ('CEBA','9no CEBA','9no'),
    ('CEBA','1° CEBA','1ro'), ('CEBA','2° CEBA','2do'), ('CEBA','3° CEBA','3ro'),
    ('CEBA','4° CEBA','4to'), ('CEBA','5° CEBA','5to'), ('CEBA','6° CEBA','6to'),
    ('CEBA','7° CEBA','7mo'), ('CEBA','8° CEBA','8vo'), ('CEBA','9° CEBA','9no')
  ) AS a(nivel_codigo, alias, canon) ON n.codigo = a.nivel_codigo
    AND lower(replace(replace(trim(g.nombre), 'á', 'a'), 'ñ', 'n')) = lower(replace(replace(trim(a.alias), 'á', 'a'), 'ñ', 'n'))
  WHERE lower(trim(a.alias)) <> lower(trim(a.canon))
    AND NOT EXISTS (
      SELECT 1 FROM public.grados g2
      WHERE g2.nivel_id = g.nivel_id AND g2.nombre = a.canon
    )
  ORDER BY g.nivel_id, a.canon, g.id::text
) picks
WHERE g.id = picks.grado_id;

-- B4) Insertar grados canónicos que aún no existan (ni con nombre ni con alias)
INSERT INTO public.grados (nivel_id, nombre, orden)
SELECT DISTINCT ON (n.id, c.nombre) n.id, c.nombre, c.orden
FROM public.niveles_educativos n
JOIN (VALUES
  ('INICIAL', '3 anos', 1), ('INICIAL', '4 anos', 2), ('INICIAL', '5 anos', 3),
  ('PRIMARIA', '1ro', 1), ('PRIMARIA', '2do', 2), ('PRIMARIA', '3ro', 3),
  ('PRIMARIA', '4to', 4), ('PRIMARIA', '5to', 5), ('PRIMARIA', '6to', 6),
  ('SECUNDARIA', '1ro', 1), ('SECUNDARIA', '2do', 2), ('SECUNDARIA', '3ro', 3),
  ('SECUNDARIA', '4to', 4), ('SECUNDARIA', '5to', 5),
  ('CEBA', '1ro', 1), ('CEBA', '2do', 2), ('CEBA', '3ro', 3), ('CEBA', '4to', 4),
  ('CEBA', '5to', 5), ('CEBA', '6to', 6), ('CEBA', '7mo', 7), ('CEBA', '8vo', 8), ('CEBA', '9no', 9)
) AS c(nivel_codigo, nombre, orden) ON n.codigo = c.nivel_codigo
  AND n.id = (
    SELECT MIN(n2.id::text)::uuid FROM public.niveles_educativos n2 WHERE n2.codigo = c.nivel_codigo
  )
WHERE NOT EXISTS (
  SELECT 1 FROM public.grados g
  WHERE g.nivel_id = n.id
    AND (
      g.nombre = c.nombre
      OR lower(replace(replace(trim(g.nombre), 'á', 'a'), 'ñ', 'n'))
         = lower(replace(replace(trim(c.nombre), 'á', 'a'), 'ñ', 'n'))
      OR lower(trim(g.nombre)) IN (
        SELECT lower(trim(a.alias))
        FROM (VALUES
          ('INICIAL','3 anos','3 anos'), ('INICIAL','3 años','3 anos'),
  ('INICIAL','4 anos','4 anos'), ('INICIAL','4 años','4 anos'),
  ('INICIAL','5 anos','5 anos'), ('INICIAL','5 años','5 anos'),
          ('PRIMARIA','1° de primaria','1ro'), ('PRIMARIA','2° de primaria','2do'),
          ('PRIMARIA','3° de primaria','3ro'), ('PRIMARIA','4° de primaria','4to'),
          ('PRIMARIA','5° de primaria','5to'), ('PRIMARIA','6° de primaria','6to'), ('PRIMARIA','4ro','4to'),
          ('SECUNDARIA','1° de secundaria','1ro'), ('SECUNDARIA','2° de secundaria','2do'),
          ('SECUNDARIA','3° de secundaria','3ro'), ('SECUNDARIA','4° de secundaria','4to'),
          ('SECUNDARIA','5° de secundaria','5to'), ('SECUNDARIA','4ro','4to'),
          ('CEBA','1ro CEBA','1ro'), ('CEBA','2do CEBA','2do'), ('CEBA','3ro CEBA','3ro'),
          ('CEBA','4to CEBA','4to'), ('CEBA','5to CEBA','5to'), ('CEBA','6to CEBA','6to'),
          ('CEBA','7mo CEBA','7mo'), ('CEBA','8vo CEBA','8vo'), ('CEBA','9no CEBA','9no'),
          ('CEBA','1° CEBA','1ro'), ('CEBA','2° CEBA','2do'), ('CEBA','3° CEBA','3ro'),
          ('CEBA','4° CEBA','4to'), ('CEBA','5° CEBA','5to'), ('CEBA','6° CEBA','6to'),
          ('CEBA','7° CEBA','7mo'), ('CEBA','8° CEBA','8vo'), ('CEBA','9° CEBA','9no')
        ) AS a(nivel_codigo, alias, canon)
        WHERE a.nivel_codigo = c.nivel_codigo AND a.canon = c.nombre
      )
    )
)
ON CONFLICT (nivel_id, nombre) DO NOTHING;

-- C) Migrar secciones de grados duplicados → grado canónico
UPDATE public.secciones s
SET grado_id = g_new.id
FROM public.grados g_old
JOIN public.niveles_educativos n ON n.id = g_old.nivel_id
LEFT JOIN (VALUES
  ('INICIAL','3 anos','3 anos'), ('INICIAL','3 años','3 anos'),
  ('INICIAL','4 anos','4 anos'), ('INICIAL','4 años','4 anos'),
  ('INICIAL','5 anos','5 anos'), ('INICIAL','5 años','5 anos'),
  ('PRIMARIA','1° de primaria','1ro'), ('PRIMARIA','2° de primaria','2do'),
  ('PRIMARIA','3° de primaria','3ro'), ('PRIMARIA','4° de primaria','4to'),
  ('PRIMARIA','5° de primaria','5to'), ('PRIMARIA','6° de primaria','6to'), ('PRIMARIA','4ro','4to'),
  ('SECUNDARIA','1° de secundaria','1ro'), ('SECUNDARIA','2° de secundaria','2do'),
  ('SECUNDARIA','3° de secundaria','3ro'), ('SECUNDARIA','4° de secundaria','4to'),
  ('SECUNDARIA','5° de secundaria','5to'), ('SECUNDARIA','4ro','4to'),
  ('CEBA','1ro CEBA','1ro'), ('CEBA','2do CEBA','2do'), ('CEBA','3ro CEBA','3ro'),
  ('CEBA','4to CEBA','4to'), ('CEBA','5to CEBA','5to'), ('CEBA','6to CEBA','6to'),
  ('CEBA','7mo CEBA','7mo'), ('CEBA','8vo CEBA','8vo'), ('CEBA','9no CEBA','9no'),
  ('CEBA','1° CEBA','1ro'), ('CEBA','2° CEBA','2do'), ('CEBA','3° CEBA','3ro'),
  ('CEBA','4° CEBA','4to'), ('CEBA','5° CEBA','5to'), ('CEBA','6° CEBA','6to'),
  ('CEBA','7° CEBA','7mo'), ('CEBA','8° CEBA','8vo'), ('CEBA','9° CEBA','9no')
) AS a(nivel_codigo, alias, canon)
  ON a.nivel_codigo = n.codigo AND lower(trim(g_old.nombre)) = lower(trim(a.alias))
JOIN (VALUES
  ('INICIAL', '3 anos'), ('INICIAL', '4 anos'), ('INICIAL', '5 anos'),
  ('PRIMARIA', '1ro'), ('PRIMARIA', '2do'), ('PRIMARIA', '3ro'),
  ('PRIMARIA', '4to'), ('PRIMARIA', '5to'), ('PRIMARIA', '6to'),
  ('SECUNDARIA', '1ro'), ('SECUNDARIA', '2do'), ('SECUNDARIA', '3ro'),
  ('SECUNDARIA', '4to'), ('SECUNDARIA', '5to'),
  ('CEBA', '1ro'), ('CEBA', '2do'), ('CEBA', '3ro'), ('CEBA', '4to'),
  ('CEBA', '5to'), ('CEBA', '6to'), ('CEBA', '7mo'), ('CEBA', '8vo'), ('CEBA', '9no')
) AS c(nivel_codigo, nombre)
  ON c.nivel_codigo = n.codigo AND c.nombre = coalesce(a.canon, g_old.nombre)
JOIN public.grados g_new ON g_new.nivel_id = n.id AND g_new.nombre = c.nombre
WHERE s.grado_id = g_old.id AND g_old.id <> g_new.id;

-- D) Migrar comunicados y eventos
UPDATE public.comunicados com
SET grado_id = g_new.id
FROM public.grados g_old
JOIN public.niveles_educativos n ON n.id = g_old.nivel_id
LEFT JOIN (VALUES
  ('INICIAL','3 anos','3 anos'), ('INICIAL','3 años','3 anos'),
  ('INICIAL','4 anos','4 anos'), ('INICIAL','4 años','4 anos'),
  ('INICIAL','5 anos','5 anos'), ('INICIAL','5 años','5 anos'),
  ('PRIMARIA','1° de primaria','1ro'), ('PRIMARIA','2° de primaria','2do'),
  ('PRIMARIA','3° de primaria','3ro'), ('PRIMARIA','4° de primaria','4to'),
  ('PRIMARIA','5° de primaria','5to'), ('PRIMARIA','6° de primaria','6to'), ('PRIMARIA','4ro','4to'),
  ('SECUNDARIA','1° de secundaria','1ro'), ('SECUNDARIA','2° de secundaria','2do'),
  ('SECUNDARIA','3° de secundaria','3ro'), ('SECUNDARIA','4° de secundaria','4to'),
  ('SECUNDARIA','5° de secundaria','5to'), ('SECUNDARIA','4ro','4to'),
  ('CEBA','1ro CEBA','1ro'), ('CEBA','2do CEBA','2do'), ('CEBA','3ro CEBA','3ro'),
  ('CEBA','4to CEBA','4to'), ('CEBA','5to CEBA','5to'), ('CEBA','6to CEBA','6to'),
  ('CEBA','7mo CEBA','7mo'), ('CEBA','8vo CEBA','8vo'), ('CEBA','9no CEBA','9no'),
  ('CEBA','1° CEBA','1ro'), ('CEBA','2° CEBA','2do'), ('CEBA','3° CEBA','3ro'),
  ('CEBA','4° CEBA','4to'), ('CEBA','5° CEBA','5to'), ('CEBA','6° CEBA','6to'),
  ('CEBA','7° CEBA','7mo'), ('CEBA','8° CEBA','8vo'), ('CEBA','9° CEBA','9no')
) AS a(nivel_codigo, alias, canon)
  ON a.nivel_codigo = n.codigo AND lower(trim(g_old.nombre)) = lower(trim(a.alias))
JOIN (VALUES
  ('INICIAL', '3 anos'), ('INICIAL', '4 anos'), ('INICIAL', '5 anos'),
  ('PRIMARIA', '1ro'), ('PRIMARIA', '2do'), ('PRIMARIA', '3ro'),
  ('PRIMARIA', '4to'), ('PRIMARIA', '5to'), ('PRIMARIA', '6to'),
  ('SECUNDARIA', '1ro'), ('SECUNDARIA', '2do'), ('SECUNDARIA', '3ro'),
  ('SECUNDARIA', '4to'), ('SECUNDARIA', '5to'),
  ('CEBA', '1ro'), ('CEBA', '2do'), ('CEBA', '3ro'), ('CEBA', '4to'),
  ('CEBA', '5to'), ('CEBA', '6to'), ('CEBA', '7mo'), ('CEBA', '8vo'), ('CEBA', '9no')
) AS c(nivel_codigo, nombre)
  ON c.nivel_codigo = n.codigo AND c.nombre = coalesce(a.canon, g_old.nombre)
JOIN public.grados g_new ON g_new.nivel_id = n.id AND g_new.nombre = c.nombre
WHERE com.grado_id = g_old.id AND g_old.id <> g_new.id;

UPDATE public.eventos ev
SET grado_id = g_new.id
FROM public.grados g_old
JOIN public.niveles_educativos n ON n.id = g_old.nivel_id
LEFT JOIN (VALUES
  ('INICIAL','3 anos','3 anos'), ('INICIAL','3 años','3 anos'),
  ('INICIAL','4 anos','4 anos'), ('INICIAL','4 años','4 anos'),
  ('INICIAL','5 anos','5 anos'), ('INICIAL','5 años','5 anos'),
  ('PRIMARIA','1° de primaria','1ro'), ('PRIMARIA','2° de primaria','2do'),
  ('PRIMARIA','3° de primaria','3ro'), ('PRIMARIA','4° de primaria','4to'),
  ('PRIMARIA','5° de primaria','5to'), ('PRIMARIA','6° de primaria','6to'), ('PRIMARIA','4ro','4to'),
  ('SECUNDARIA','1° de secundaria','1ro'), ('SECUNDARIA','2° de secundaria','2do'),
  ('SECUNDARIA','3° de secundaria','3ro'), ('SECUNDARIA','4° de secundaria','4to'),
  ('SECUNDARIA','5° de secundaria','5to'), ('SECUNDARIA','4ro','4to'),
  ('CEBA','1ro CEBA','1ro'), ('CEBA','2do CEBA','2do'), ('CEBA','3ro CEBA','3ro'),
  ('CEBA','4to CEBA','4to'), ('CEBA','5to CEBA','5to'), ('CEBA','6to CEBA','6to'),
  ('CEBA','7mo CEBA','7mo'), ('CEBA','8vo CEBA','8vo'), ('CEBA','9no CEBA','9no'),
  ('CEBA','1° CEBA','1ro'), ('CEBA','2° CEBA','2do'), ('CEBA','3° CEBA','3ro'),
  ('CEBA','4° CEBA','4to'), ('CEBA','5° CEBA','5to'), ('CEBA','6° CEBA','6to'),
  ('CEBA','7° CEBA','7mo'), ('CEBA','8° CEBA','8vo'), ('CEBA','9° CEBA','9no')
) AS a(nivel_codigo, alias, canon)
  ON a.nivel_codigo = n.codigo AND lower(trim(g_old.nombre)) = lower(trim(a.alias))
JOIN (VALUES
  ('INICIAL', '3 anos'), ('INICIAL', '4 anos'), ('INICIAL', '5 anos'),
  ('PRIMARIA', '1ro'), ('PRIMARIA', '2do'), ('PRIMARIA', '3ro'),
  ('PRIMARIA', '4to'), ('PRIMARIA', '5to'), ('PRIMARIA', '6to'),
  ('SECUNDARIA', '1ro'), ('SECUNDARIA', '2do'), ('SECUNDARIA', '3ro'),
  ('SECUNDARIA', '4to'), ('SECUNDARIA', '5to'),
  ('CEBA', '1ro'), ('CEBA', '2do'), ('CEBA', '3ro'), ('CEBA', '4to'),
  ('CEBA', '5to'), ('CEBA', '6to'), ('CEBA', '7mo'), ('CEBA', '8vo'), ('CEBA', '9no')
) AS c(nivel_codigo, nombre)
  ON c.nivel_codigo = n.codigo AND c.nombre = coalesce(a.canon, g_old.nombre)
JOIN public.grados g_new ON g_new.nivel_id = n.id AND g_new.nombre = c.nombre
WHERE ev.grado_id = g_old.id AND g_old.id <> g_new.id;

-- E) Eliminar grados que no son canónicos
DELETE FROM public.grados g
WHERE NOT EXISTS (
  SELECT 1
  FROM public.niveles_educativos n
  JOIN (VALUES
    ('INICIAL', '3 anos'), ('INICIAL', '4 anos'), ('INICIAL', '5 anos'),
    ('PRIMARIA', '1ro'), ('PRIMARIA', '2do'), ('PRIMARIA', '3ro'),
    ('PRIMARIA', '4to'), ('PRIMARIA', '5to'), ('PRIMARIA', '6to'),
    ('SECUNDARIA', '1ro'), ('SECUNDARIA', '2do'), ('SECUNDARIA', '3ro'),
    ('SECUNDARIA', '4to'), ('SECUNDARIA', '5to'),
    ('CEBA', '1ro'), ('CEBA', '2do'), ('CEBA', '3ro'), ('CEBA', '4to'),
    ('CEBA', '5to'), ('CEBA', '6to'), ('CEBA', '7mo'), ('CEBA', '8vo'), ('CEBA', '9no')
  ) AS c(nivel_codigo, nombre) ON n.codigo = c.nivel_codigo
  WHERE g.nivel_id = n.id AND g.nombre = c.nombre
);

-- F) Deduplicar secciones repetidas
UPDATE public.matriculas m
SET seccion_id = s_keep.id
FROM public.secciones s_old
JOIN public.secciones s_keep
  ON s_old.anio_academico_id = s_keep.anio_academico_id
 AND s_old.grado_id = s_keep.grado_id
 AND s_old.nombre = s_keep.nombre
 AND s_old.id > s_keep.id
WHERE m.seccion_id = s_old.id;

UPDATE public.cursos_asignados c
SET seccion_id = s_keep.id
FROM public.secciones s_old
JOIN public.secciones s_keep
  ON s_old.anio_academico_id = s_keep.anio_academico_id
 AND s_old.grado_id = s_keep.grado_id
 AND s_old.nombre = s_keep.nombre
 AND s_old.id > s_keep.id
WHERE c.seccion_id = s_old.id;

DELETE FROM public.secciones s_old
USING public.secciones s_keep
WHERE s_old.anio_academico_id = s_keep.anio_academico_id
  AND s_old.grado_id = s_keep.grado_id
  AND s_old.nombre = s_keep.nombre
  AND s_old.id > s_keep.id;

-- G) Crear secciones A y B (año 2026) si no existen
INSERT INTO public.secciones (anio_academico_id, grado_id, nombre, aula, capacidad)
SELECT aa.id, g.id, sec.nombre, sec.aula, sec.capacidad
FROM public.anios_academicos aa
JOIN public.grados g ON true
JOIN public.niveles_educativos n ON n.id = g.nivel_id
JOIN (VALUES
  ('INICIAL', '3 anos'), ('INICIAL', '4 anos'), ('INICIAL', '5 anos'),
  ('PRIMARIA', '1ro'), ('PRIMARIA', '2do'), ('PRIMARIA', '3ro'),
  ('PRIMARIA', '4to'), ('PRIMARIA', '5to'), ('PRIMARIA', '6to'),
  ('SECUNDARIA', '1ro'), ('SECUNDARIA', '2do'), ('SECUNDARIA', '3ro'),
  ('SECUNDARIA', '4to'), ('SECUNDARIA', '5to'),
  ('CEBA', '1ro'), ('CEBA', '2do'), ('CEBA', '3ro'), ('CEBA', '4to'),
  ('CEBA', '5to'), ('CEBA', '6to'), ('CEBA', '7mo'), ('CEBA', '8vo'), ('CEBA', '9no')
) AS c(nivel_codigo, nombre) ON c.nivel_codigo = n.codigo AND c.nombre = g.nombre
JOIN (VALUES ('A', 'Aula A', 30), ('B', 'Aula B', 30)) AS sec(nombre, aula, capacidad) ON true
WHERE aa.anio = 2026
AND NOT EXISTS (
  SELECT 1 FROM public.secciones s
  WHERE s.anio_academico_id = aa.id AND s.grado_id = g.id AND s.nombre = sec.nombre
);

-- H) Verificación
SELECT n.codigo AS nivel, g.nombre AS grado, g.orden, count(s.id) AS secciones
FROM public.grados g
JOIN public.niveles_educativos n ON n.id = g.nivel_id
LEFT JOIN public.secciones s ON s.grado_id = g.id
GROUP BY n.codigo, g.nombre, g.orden
ORDER BY n.codigo, g.orden;

SELECT 'grados_total' AS metrica, count(*)::text AS valor FROM public.grados
UNION ALL
SELECT 'secciones_total', count(*)::text FROM public.secciones
UNION ALL
SELECT 'niveles_total', count(*)::text FROM public.niveles_educativos;

SELECT codigo, count(*) AS cantidad
FROM public.niveles_educativos
WHERE codigo IN ('INICIAL','PRIMARIA','SECUNDARIA','CEBA')
GROUP BY codigo
ORDER BY codigo;

-- Limpiar tablas de trabajo de intentos anteriores (si existen)
DROP TABLE IF EXISTS public._tmp_role_migration;
DROP TABLE IF EXISTS public._tmp_grado_canon;
DROP TABLE IF EXISTS public._tmp_grado_alias;
DROP TABLE IF EXISTS public._tmp_grado_migration;
