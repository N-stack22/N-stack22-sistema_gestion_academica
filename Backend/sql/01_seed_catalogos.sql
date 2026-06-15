-- ============================================================
-- PASO 1: Ejecutar PRIMERO en Supabase SQL Editor
-- ============================================================

INSERT INTO public.roles (codigo, nombre, descripcion) VALUES
  ('ADMIN', 'Administrador', 'Gestion general del sistema'),
  ('DIRECTOR', 'Director', 'Direccion institucional'),
  ('DOCENTE', 'Docente', 'Gestion academica de cursos'),
  ('ESTUDIANTE', 'Estudiante', 'Consulta academica propia'),
  ('APODERADO', 'Apoderado', 'Seguimiento de hijos')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.niveles_educativos (codigo, nombre, descripcion) VALUES
  ('INICIAL', 'Inicial', 'Educacion inicial'),
  ('PRIMARIA', 'Primaria', 'Educacion primaria'),
  ('SECUNDARIA', 'Secundaria', 'Educacion secundaria'),
  ('CEBA', 'CEBA', 'Centro de Educacion Basica Alternativa')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.anios_academicos (anio, fecha_inicio, fecha_fin, activo)
SELECT 2026, '2026-03-01', '2026-12-15', true
WHERE NOT EXISTS (SELECT 1 FROM public.anios_academicos WHERE anio = 2026);

INSERT INTO public.grados (nivel_id, nombre, orden)
SELECT n.id, g.nombre, g.orden
FROM public.niveles_educativos n
JOIN (VALUES
  ('SECUNDARIA', '1ro', 1),
  ('SECUNDARIA', '2do', 2),
  ('SECUNDARIA', '3ro', 3),
  ('PRIMARIA', '5to', 5),
  ('INICIAL', '3 años', 1),
  ('INICIAL', '4 años', 2),
  ('INICIAL', '5 años', 3),
  ('CEBA', '1ro CEBA', 1)
) AS g(codigo_nivel, nombre, orden) ON n.codigo = g.codigo_nivel
WHERE NOT EXISTS (
  SELECT 1 FROM public.grados gr
  JOIN public.niveles_educativos ne ON gr.nivel_id = ne.id
  WHERE ne.codigo = g.codigo_nivel AND gr.nombre = g.nombre
);
