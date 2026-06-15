-- Roles base para probar la intranet
INSERT INTO public.roles (codigo, nombre, descripcion) VALUES
  ('ADMIN', 'Administrador', 'Gestión general del sistema'),
  ('DIRECTOR', 'Director', 'Dirección institucional'),
  ('DOCENTE', 'Docente', 'Gestión académica de cursos'),
  ('ESTUDIANTE', 'Estudiante', 'Consulta académica propia'),
  ('APODERADO', 'Apoderado', 'Seguimiento de hijos')
ON CONFLICT (codigo) DO NOTHING;

-- Después de crear cada usuario en Supabase Auth, copia su UUID y ejecuta:
--
-- INSERT INTO public.perfiles (id, nombres, apellidos, correo_institucional, estado)
-- VALUES ('UUID_DEL_USUARIO', 'Nombre', 'Apellido', 'correo@horizonte.edu.pe', true);
--
-- INSERT INTO public.usuarios_roles (perfil_id, rol_id, activo)
-- SELECT 'UUID_DEL_USUARIO', r.id, true
-- FROM public.roles r
-- WHERE r.codigo = 'ADMIN';
