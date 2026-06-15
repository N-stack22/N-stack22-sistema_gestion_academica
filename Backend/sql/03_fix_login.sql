-- ============================================================
-- ARREGLO RAPIDO DE LOGIN
-- Ejecutar TODO esto en Supabase -> SQL Editor
-- (Requiere que ya creaste los 5 usuarios en Authentication)
-- ============================================================

-- A) Ver usuarios en Auth (deben salir 5)
SELECT id, email FROM auth.users ORDER BY email;

-- B) Roles
INSERT INTO public.roles (codigo, nombre, descripcion) VALUES
  ('ADMIN', 'Administrador', 'Gestion general del sistema'),
  ('DIRECTOR', 'Director', 'Direccion institucional'),
  ('DOCENTE', 'Docente', 'Gestion academica de cursos'),
  ('ESTUDIANTE', 'Estudiante', 'Consulta academica propia'),
  ('APODERADO', 'Apoderado', 'Seguimiento de hijos')
ON CONFLICT (codigo) DO NOTHING;

-- C) Perfiles (UUID automatico desde auth.users)
INSERT INTO public.perfiles (id, nombres, apellidos, correo_institucional, estado)
SELECT u.id, d.nombres, d.apellidos, u.email, true
FROM auth.users u
JOIN (VALUES
  ('admin@horizonte.edu.pe',      'Administrador', 'Horizonte'),
  ('director@horizonte.edu.pe',   'Maria Elena',   'Vargas'),
  ('docente@horizonte.edu.pe',    'Carlos',        'Mendoza'),
  ('estudiante@horizonte.edu.pe', 'Lucia',         'Torres'),
  ('padre@horizonte.edu.pe',      'Rosa',          'Quispe')
) AS d(email, nombres, apellidos) ON lower(u.email) = d.email
ON CONFLICT (id) DO UPDATE SET
  nombres = EXCLUDED.nombres,
  apellidos = EXCLUDED.apellidos,
  correo_institucional = EXCLUDED.correo_institucional,
  estado = true;

-- D) Asignar rol a cada perfil
INSERT INTO public.usuarios_roles (perfil_id, rol_id, activo)
SELECT p.id, r.id, true
FROM public.perfiles p
JOIN auth.users u ON u.id = p.id
JOIN (VALUES
  ('admin@horizonte.edu.pe',      'ADMIN'),
  ('director@horizonte.edu.pe',   'DIRECTOR'),
  ('docente@horizonte.edu.pe',    'DOCENTE'),
  ('estudiante@horizonte.edu.pe', 'ESTUDIANTE'),
  ('padre@horizonte.edu.pe',      'APODERADO')
) AS m(email, codigo_rol) ON lower(u.email) = m.email
JOIN public.roles r ON r.codigo = m.codigo_rol
WHERE NOT EXISTS (
  SELECT 1 FROM public.usuarios_roles ur
  WHERE ur.perfil_id = p.id AND ur.rol_id = r.id
);

-- E) Desactivar RLS en tablas clave para pruebas locales
ALTER TABLE public.perfiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudiantes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.docentes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.apoderados DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicados DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.niveles_educativos DISABLE ROW LEVEL SECURITY;

-- F) Verificacion final (debe mostrar 5 usuarios con rol)
SELECT u.email, p.nombres, r.codigo AS rol
FROM auth.users u
LEFT JOIN public.perfiles p ON p.id = u.id
LEFT JOIN public.usuarios_roles ur ON ur.perfil_id = p.id AND ur.activo = true
LEFT JOIN public.roles r ON r.id = ur.rol_id
WHERE lower(u.email) LIKE '%@horizonte.edu.pe'
ORDER BY u.email;
