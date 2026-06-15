-- ============================================================
-- PASO 7: Unificar roles duplicados (administrador/ADMIN, etc.)
-- Ejecutar en Supabase SQL Editor (puede correrse por partes)
-- Sin tablas temporales — cada paso es independiente
-- ============================================================

-- A) Asegurar roles canónicos
INSERT INTO public.roles (codigo, nombre, descripcion) VALUES
  ('ADMIN', 'Administrador', 'Gestión general del sistema'),
  ('DIRECTOR', 'Director', 'Dirección institucional'),
  ('DOCENTE', 'Docente', 'Gestión académica de cursos'),
  ('ESTUDIANTE', 'Estudiante', 'Consulta académica propia'),
  ('APODERADO', 'Apoderado', 'Seguimiento de hijos')
ON CONFLICT (codigo) DO NOTHING;

-- B) Si solo existe el rol viejo (sin canónico), renombrarlo
UPDATE public.roles r
SET codigo = m.canon
FROM (VALUES
  ('administrador', 'ADMIN'),
  ('director', 'DIRECTOR'),
  ('docente', 'DOCENTE'),
  ('estudiante', 'ESTUDIANTE'),
  ('apoderado', 'APODERADO')
) AS m(viejo, canon)
WHERE lower(r.codigo) = m.viejo
  AND r.codigo <> m.canon
  AND NOT EXISTS (
    SELECT 1 FROM public.roles rc WHERE rc.codigo = m.canon
  );

-- C) Eliminar asignaciones duplicadas (perfil con rol viejo Y canónico a la vez)
DELETE FROM public.usuarios_roles ur_old
USING public.roles r_old,
      (VALUES
        ('administrador', 'ADMIN'),
        ('director', 'DIRECTOR'),
        ('docente', 'DOCENTE'),
        ('estudiante', 'ESTUDIANTE'),
        ('apoderado', 'APODERADO')
      ) AS m(viejo, canon),
      public.roles r_canon
WHERE lower(r_old.codigo) = m.viejo
  AND r_old.codigo <> m.canon
  AND r_canon.codigo = m.canon
  AND ur_old.rol_id = r_old.id
  AND EXISTS (
    SELECT 1
    FROM public.usuarios_roles ur_canon
    WHERE ur_canon.perfil_id = ur_old.perfil_id
      AND ur_canon.rol_id = r_canon.id
  );

-- D) Migrar usuarios_roles del rol viejo al canónico
UPDATE public.usuarios_roles ur
SET rol_id = r_canon.id
FROM public.roles r_old,
     (VALUES
       ('administrador', 'ADMIN'),
       ('director', 'DIRECTOR'),
       ('docente', 'DOCENTE'),
       ('estudiante', 'ESTUDIANTE'),
       ('apoderado', 'APODERADO')
     ) AS m(viejo, canon),
     public.roles r_canon
WHERE lower(r_old.codigo) = m.viejo
  AND r_old.codigo <> m.canon
  AND r_canon.codigo = m.canon
  AND ur.rol_id = r_old.id;

-- E) Migrar comunicados
UPDATE public.comunicados c
SET rol_destinatario_id = r_canon.id
FROM public.roles r_old,
     (VALUES
       ('administrador', 'ADMIN'),
       ('director', 'DIRECTOR'),
       ('docente', 'DOCENTE'),
       ('estudiante', 'ESTUDIANTE'),
       ('apoderado', 'APODERADO')
     ) AS m(viejo, canon),
     public.roles r_canon
WHERE lower(r_old.codigo) = m.viejo
  AND r_old.codigo <> m.canon
  AND r_canon.codigo = m.canon
  AND c.rol_destinatario_id = r_old.id;

-- F) Migrar eventos
UPDATE public.eventos e
SET rol_destinatario_id = r_canon.id
FROM public.roles r_old,
     (VALUES
       ('administrador', 'ADMIN'),
       ('director', 'DIRECTOR'),
       ('docente', 'DOCENTE'),
       ('estudiante', 'ESTUDIANTE'),
       ('apoderado', 'APODERADO')
     ) AS m(viejo, canon),
     public.roles r_canon
WHERE lower(r_old.codigo) = m.viejo
  AND r_old.codigo <> m.canon
  AND r_canon.codigo = m.canon
  AND e.rol_destinatario_id = r_old.id;

-- G) Borrar roles viejos que ya no tienen referencias
DELETE FROM public.roles r
WHERE lower(r.codigo) IN ('administrador','director','docente','estudiante','apoderado')
  AND r.codigo NOT IN ('ADMIN','DIRECTOR','DOCENTE','ESTUDIANTE','APODERADO')
  AND NOT EXISTS (SELECT 1 FROM public.usuarios_roles ur WHERE ur.rol_id = r.id)
  AND NOT EXISTS (SELECT 1 FROM public.comunicados c WHERE c.rol_destinatario_id = r.id)
  AND NOT EXISTS (SELECT 1 FROM public.eventos ev WHERE ev.rol_destinatario_id = r.id);

-- H) Verificación
SELECT 'roles' AS tabla, codigo, nombre, creado_en
FROM public.roles
ORDER BY codigo;

SELECT 'usuarios_roles' AS tabla, COUNT(*) AS total
FROM public.usuarios_roles;

SELECT r.codigo, r.id,
  (SELECT COUNT(*) FROM public.usuarios_roles ur WHERE ur.rol_id = r.id) AS refs_usuarios,
  (SELECT COUNT(*) FROM public.comunicados c WHERE c.rol_destinatario_id = r.id) AS refs_comunicados,
  (SELECT COUNT(*) FROM public.eventos e WHERE e.rol_destinatario_id = r.id) AS refs_eventos
FROM public.roles r
WHERE lower(r.codigo) IN ('administrador','director','docente','estudiante','apoderado')
  AND r.codigo NOT IN ('ADMIN','DIRECTOR','DOCENTE','ESTUDIANTE','APODERADO');
