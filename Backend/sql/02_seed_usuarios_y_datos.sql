-- ============================================================
-- PASO 2: Crear usuarios en Supabase ANTES de ejecutar esto
-- ============================================================
-- Ve a: Authentication -> Users -> Add user
-- Marca "Auto Confirm User"
--
-- Crea estos 5 usuarios:
--   admin@horizonte.edu.pe       / Admin123
--   director@horizonte.edu.pe    / Director123
--   docente@horizonte.edu.pe     / Docente123
--   estudiante@horizonte.edu.pe  / Estudiante123
--   padre@horizonte.edu.pe       / Padre123
--
-- Este script NO necesita que copies UUID manualmente.
-- Los saca automaticamente de auth.users por correo.
-- ============================================================

-- PERFILES
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

-- ROLES DE USUARIO
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

-- DOCENTE
INSERT INTO public.docentes (perfil_id, codigo_docente, especialidad)
SELECT p.id, 'DOC-001', 'Matematica'
FROM public.perfiles p
JOIN auth.users u ON u.id = p.id
WHERE lower(u.email) = 'docente@horizonte.edu.pe'
AND NOT EXISTS (SELECT 1 FROM public.docentes d WHERE d.perfil_id = p.id);

-- ESTUDIANTE
INSERT INTO public.estudiantes (perfil_id, codigo_estudiante)
SELECT p.id, 'EST-001'
FROM public.perfiles p
JOIN auth.users u ON u.id = p.id
WHERE lower(u.email) = 'estudiante@horizonte.edu.pe'
AND NOT EXISTS (SELECT 1 FROM public.estudiantes e WHERE e.perfil_id = p.id);

-- APODERADO
INSERT INTO public.apoderados (perfil_id, ocupacion, direccion)
SELECT p.id, 'Comerciante', 'Huancayo'
FROM public.perfiles p
JOIN auth.users u ON u.id = p.id
WHERE lower(u.email) = 'padre@horizonte.edu.pe'
AND NOT EXISTS (SELECT 1 FROM public.apoderados a WHERE a.perfil_id = p.id);

-- VINCULO APODERADO - ESTUDIANTE
INSERT INTO public.apoderado_estudiante (apoderado_id, estudiante_id, parentesco, es_principal)
SELECT a.id, e.id, 'Madre', true
FROM public.apoderados a
JOIN public.estudiantes e ON true
JOIN public.perfiles pa ON pa.id = a.perfil_id
JOIN public.perfiles pe ON pe.id = e.perfil_id
JOIN auth.users ua ON ua.id = pa.id AND lower(ua.email) = 'padre@horizonte.edu.pe'
JOIN auth.users ue ON ue.id = pe.id AND lower(ue.email) = 'estudiante@horizonte.edu.pe'
WHERE NOT EXISTS (
  SELECT 1 FROM public.apoderado_estudiante ae
  WHERE ae.apoderado_id = a.id AND ae.estudiante_id = e.id
);

-- SECCION
INSERT INTO public.secciones (anio_academico_id, grado_id, nombre, aula, capacidad)
SELECT aa.id, g.id, 'A', 'A-201', 30
FROM public.anios_academicos aa
JOIN public.grados g ON g.nombre = '3ro'
JOIN public.niveles_educativos n ON n.id = g.nivel_id AND n.codigo = 'SECUNDARIA'
WHERE aa.anio = 2026
AND NOT EXISTS (
  SELECT 1 FROM public.secciones s
  WHERE s.anio_academico_id = aa.id AND s.grado_id = g.id AND s.nombre = 'A'
);

-- MATRICULA DEL ESTUDIANTE
INSERT INTO public.estados_matricula (codigo, nombre)
SELECT 'ACTIVA', 'Activa'
WHERE NOT EXISTS (SELECT 1 FROM public.estados_matricula WHERE codigo = 'ACTIVA');

INSERT INTO public.matriculas (estudiante_id, seccion_id, anio_academico_id, estado_id)
SELECT e.id, s.id, aa.id, em.id
FROM public.estudiantes e
JOIN public.perfiles pe ON pe.id = e.perfil_id
JOIN auth.users ue ON ue.id = pe.id AND lower(ue.email) = 'estudiante@horizonte.edu.pe'
JOIN public.anios_academicos aa ON aa.anio = 2026
JOIN public.secciones s ON s.anio_academico_id = aa.id AND s.nombre = 'A'
JOIN public.estados_matricula em ON em.codigo = 'ACTIVA'
WHERE NOT EXISTS (
  SELECT 1 FROM public.matriculas m WHERE m.estudiante_id = e.id AND m.anio_academico_id = aa.id
);

-- NOTICIAS
INSERT INTO public.noticias (autor_id, titulo, contenido, publicado)
SELECT p.id, n.titulo, n.contenido, true
FROM public.perfiles p
JOIN auth.users u ON u.id = p.id AND lower(u.email) = 'admin@horizonte.edu.pe'
JOIN (VALUES
  ('Inicio del ano escolar 2026', 'Damos la bienvenida a la comunidad horizontina con una ceremonia de apertura.'),
  ('Feria de ciencias Horizonte', 'Estudiantes de primaria y secundaria presentaron proyectos innovadores.'),
  ('Campana de lectura institucional', 'Invitamos a toda la comunidad a participar en la campana de lectura.')
) AS n(titulo, contenido) ON true
WHERE NOT EXISTS (SELECT 1 FROM public.noticias no WHERE no.titulo = n.titulo);

-- COMUNICADOS
INSERT INTO public.comunicados (autor_id, titulo, contenido, publicado)
SELECT p.id, c.titulo, c.contenido, true
FROM public.perfiles p
JOIN auth.users u ON u.id = p.id AND lower(u.email) = 'admin@horizonte.edu.pe'
JOIN (VALUES
  ('Reunion general de padres', 'Invitamos a apoderados al auditorio principal el viernes 20 de marzo, 18:30 h.'),
  ('Cronograma de evaluaciones', 'Se publica el calendario del primer bimestre con fechas de evaluaciones.'),
  ('Campana de salud escolar', 'Jornada de tamizaje visual y taller de habitos saludables.')
) AS c(titulo, contenido) ON true
WHERE NOT EXISTS (SELECT 1 FROM public.comunicados co WHERE co.titulo = c.titulo);

-- VERIFICACION (debe mostrar 5 filas)
SELECT u.email, p.nombres, p.apellidos, r.codigo AS rol
FROM auth.users u
LEFT JOIN public.perfiles p ON p.id = u.id
LEFT JOIN public.usuarios_roles ur ON ur.perfil_id = p.id AND ur.activo = true
LEFT JOIN public.roles r ON r.id = ur.rol_id
WHERE lower(u.email) LIKE '%@horizonte.edu.pe'
ORDER BY u.email;
