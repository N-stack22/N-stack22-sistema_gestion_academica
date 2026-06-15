-- ============================================================
-- HORIZONTE - DATOS DE PRUEBA
-- Ejecutar en Supabase SQL Editor DESPUÉS de seed_roles.sql
-- y DESPUÉS de crear usuarios en Authentication
-- ============================================================

-- 1) Reemplaza estos UUID por los reales de Supabase Auth
-- (Authentication -> Users -> copiar User UID)

-- SET @admin_id    = 'UUID_ADMIN';
-- SET @director_id = 'UUID_DIRECTOR';
-- SET @docente_id  = 'UUID_DOCENTE';
-- SET @estudiante_id = 'UUID_ESTUDIANTE';
-- SET @apoderado_id  = 'UUID_APODERADO';

-- ------------------------------------------------------------
-- 2) PERFILES (mismo id que Auth)
-- ------------------------------------------------------------
/*
INSERT INTO public.perfiles (id, nombres, apellidos, correo_institucional, estado) VALUES
  ('UUID_ADMIN',      'Administrador', 'Horizonte', 'admin@horizonte.edu.pe', true),
  ('UUID_DIRECTOR',   'María Elena',   'Vargas',    'director@horizonte.edu.pe', true),
  ('UUID_DOCENTE',    'Carlos',        'Mendoza',   'docente@horizonte.edu.pe', true),
  ('UUID_ESTUDIANTE', 'Lucía',         'Torres',    'estudiante@horizonte.edu.pe', true),
  ('UUID_APODERADO',  'Rosa',          'Quispe',    'padre@horizonte.edu.pe', true);
*/

-- ------------------------------------------------------------
-- 3) ROLES DE USUARIO
-- ------------------------------------------------------------
/*
INSERT INTO public.usuarios_roles (perfil_id, rol_id, activo)
SELECT 'UUID_ADMIN', id, true FROM public.roles WHERE codigo = 'ADMIN';

INSERT INTO public.usuarios_roles (perfil_id, rol_id, activo)
SELECT 'UUID_DIRECTOR', id, true FROM public.roles WHERE codigo = 'DIRECTOR';

INSERT INTO public.usuarios_roles (perfil_id, rol_id, activo)
SELECT 'UUID_DOCENTE', id, true FROM public.roles WHERE codigo = 'DOCENTE';

INSERT INTO public.usuarios_roles (perfil_id, rol_id, activo)
SELECT 'UUID_ESTUDIANTE', id, true FROM public.roles WHERE codigo = 'ESTUDIANTE';

INSERT INTO public.usuarios_roles (perfil_id, rol_id, activo)
SELECT 'UUID_APODERADO', id, true FROM public.roles WHERE codigo = 'APODERADO';
*/

-- ------------------------------------------------------------
-- 4) NIVELES (incluye CEBA)
-- ------------------------------------------------------------
INSERT INTO public.niveles_educativos (codigo, nombre, descripcion) VALUES
  ('INICIAL', 'Inicial', 'Educación inicial'),
  ('PRIMARIA', 'Primaria', 'Educación primaria'),
  ('SECUNDARIA', 'Secundaria', 'Educación secundaria'),
  ('CEBA', 'CEBA', 'Centro de Educación Básica Alternativa')
ON CONFLICT (codigo) DO NOTHING;

-- ------------------------------------------------------------
-- 5) AÑO ACADÉMICO Y PERIODO
-- ------------------------------------------------------------
INSERT INTO public.anios_academicos (anio, fecha_inicio, fecha_fin, activo)
SELECT 2026, '2026-03-01', '2026-12-15', true
WHERE NOT EXISTS (SELECT 1 FROM public.anios_academicos WHERE anio = 2026);

-- ------------------------------------------------------------
-- 6) NOTICIAS Y COMUNICADOS DE PRUEBA
-- (requiere que UUID_ADMIN exista en perfiles)
-- ------------------------------------------------------------
/*
INSERT INTO public.noticias (autor_id, titulo, contenido, publicado)
VALUES (
  'UUID_ADMIN',
  'Inicio del año escolar 2026',
  'Damos la bienvenida a la comunidad horizontina con una ceremonia de apertura.',
  true
);

INSERT INTO public.comunicados (autor_id, titulo, contenido, publicado)
VALUES (
  'UUID_ADMIN',
  'Reunión general de padres',
  'Invitamos a apoderados al auditorio principal el viernes 20 de marzo, 18:30 h.',
  true
);
*/

-- ------------------------------------------------------------
-- 7) DOCENTE, ESTUDIANTE Y APODERADO (tablas extendidas)
-- ------------------------------------------------------------
/*
INSERT INTO public.docentes (perfil_id, codigo_docente, especialidad)
VALUES ('UUID_DOCENTE', 'DOC-001', 'Matemática');

INSERT INTO public.estudiantes (perfil_id, codigo_estudiante)
VALUES ('UUID_ESTUDIANTE', 'EST-001');

INSERT INTO public.apoderados (perfil_id, ocupacion, direccion)
VALUES ('UUID_APODERADO', 'Comerciante', 'Huancayo');

INSERT INTO public.apoderado_estudiante (apoderado_id, estudiante_id, parentesco, es_principal)
SELECT a.id, e.id, 'Madre', true
FROM public.apoderados a, public.estudiantes e
WHERE a.perfil_id = 'UUID_APODERADO' AND e.perfil_id = 'UUID_ESTUDIANTE';
*/
