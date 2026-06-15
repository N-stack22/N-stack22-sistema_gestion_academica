-- ============================================================
-- PASO 6: EJECUTAR EN SUPABASE SQL EDITOR (OBLIGATORIO)
-- Desactiva RLS en todas las tablas operativas y siembra datos
-- ============================================================

-- A) Desactivar RLS en tablas del sistema
ALTER TABLE IF EXISTS public.perfiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.usuarios_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.estudiantes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.docentes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.apoderados DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.apoderado_estudiante DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.niveles_educativos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.grados DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.anios_academicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.periodos_academicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.secciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.estados_matricula DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.matriculas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.asignaturas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cursos_asignados DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.estados_asistencia DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.asistencia DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tipos_evaluacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.calificaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.horarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.estados_tarea DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tareas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.estados_entrega_tarea DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.entregas_tareas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tipos_recurso DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recursos_academicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.archivos_recursos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conceptos_pago DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.metodos_pago DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.estados_pago DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pensiones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pagos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.productos_venta DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.detalle_ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.estados_seguimiento DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seguimiento_academico DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.noticias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comunicados DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.eventos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lecturas_comunicados DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.configuraciones_usuario DISABLE ROW LEVEL SECURITY;

-- B) Catálogos base (roles mayúsculas)
INSERT INTO public.roles (codigo, nombre, descripcion) VALUES
  ('ADMIN', 'Administrador', 'Gestion general del sistema'),
  ('DIRECTOR', 'Director', 'Direccion institucional'),
  ('DOCENTE', 'Docente', 'Gestion academica de cursos'),
  ('ESTUDIANTE', 'Estudiante', 'Consulta academica propia'),
  ('APODERADO', 'Apoderado', 'Seguimiento de hijos')
ON CONFLICT (codigo) DO NOTHING;

-- C) Año académico activo
INSERT INTO public.anios_academicos (anio, fecha_inicio, fecha_fin, activo)
SELECT 2026, '2026-03-01', '2026-12-20', true
WHERE NOT EXISTS (SELECT 1 FROM public.anios_academicos WHERE anio = 2026);

-- D) Grados (usa niveles existentes sin importar mayúsculas)
INSERT INTO public.grados (nivel_id, nombre, orden)
SELECT n.id, g.nombre, g.orden
FROM public.niveles_educativos n
JOIN (VALUES
  ('SECUNDARIA', '1ro', 1),
  ('SECUNDARIA', '2do', 2),
  ('SECUNDARIA', '3ro', 3),
  ('SECUNDARIA', '4ro', 4),
  ('SECUNDARIA', '5to', 5),
  ('PRIMARIA', '4to', 4),
  ('PRIMARIA', '5to', 5),
  ('PRIMARIA', '6to', 6),
  ('INICIAL', '3 años', 1), ('INICIAL', '4 años', 2), ('INICIAL', '5 años', 3)
) AS g(codigo_nivel, nombre, orden) ON upper(n.codigo) = upper(g.codigo_nivel)
WHERE NOT EXISTS (
  SELECT 1 FROM public.grados gr
  WHERE gr.nivel_id = n.id AND gr.nombre = g.nombre
);

-- E) Catálogos académicos y económicos
INSERT INTO public.estados_matricula (codigo, nombre) VALUES
  ('ACTIVA', 'Activa'), ('PENDIENTE', 'Pendiente'), ('RETIRADA', 'Retirada')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.estados_asistencia (codigo, nombre) VALUES
  ('PRESENTE', 'Presente'), ('TARDE', 'Tarde'), ('FALTA', 'Falta'), ('JUSTIFICADO', 'Justificado')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.estados_tarea (codigo, nombre) VALUES
  ('BORRADOR', 'Borrador'), ('PUBLICADA', 'Publicada'), ('CERRADA', 'Cerrada')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.estados_entrega_tarea (codigo, nombre) VALUES
  ('PENDIENTE', 'Pendiente'), ('ENTREGADA', 'Entregada'), ('CALIFICADA', 'Calificada')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.tipos_evaluacion (codigo, nombre, descripcion) VALUES
  ('EXAMEN', 'Examen', 'Evaluacion escrita'),
  ('PRACTICA', 'Practica', 'Evaluacion practica'),
  ('TAREA', 'Tarea', 'Trabajo evaluado'),
  ('PROYECTO', 'Proyecto', 'Proyecto integrador'),
  ('PARTICIPACION', 'Participacion', 'Participacion en clase')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.tipos_recurso (codigo, nombre) VALUES
  ('PDF', 'PDF'), ('ENLACE', 'Enlace'), ('VIDEO', 'Video'), ('DOCUMENTO', 'Documento')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.estados_pago (codigo, nombre) VALUES
  ('PENDIENTE', 'Pendiente'), ('PAGADO', 'Pagado'), ('VENCIDA', 'Vencida'), ('ANULADO', 'Anulado')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.conceptos_pago (codigo, nombre, descripcion) VALUES
  ('PENSION', 'Pension', 'Pension mensual'),
  ('MATRICULA', 'Matricula', 'Pago de matricula'),
  ('MATERIAL', 'Material', 'Material educativo')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.metodos_pago (codigo, nombre) VALUES
  ('EFECTIVO', 'Efectivo'), ('YAPE', 'Yape'), ('PLIN', 'Plin'),
  ('TRANSFERENCIA', 'Transferencia'), ('TARJETA', 'Tarjeta')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.estados_seguimiento (codigo, nombre) VALUES
  ('BIEN', 'Bien'), ('REGULAR', 'Regular'), ('OBSERVACION', 'En observacion')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.asignaturas (nombre, codigo, area, activo) VALUES
  ('Matematica', 'MAT', 'Ciencias', true),
  ('Comunicacion', 'COM', 'Humanidades', true),
  ('Ciencia y Tecnologia', 'CYT', 'Ciencias', true),
  ('Personal Social', 'PSO', 'Humanidades', true),
  ('Ingles', 'ING', 'Idiomas', true)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.periodos_academicos (anio_academico_id, nombre, orden, fecha_inicio, fecha_fin)
SELECT aa.id, p.nombre, p.orden, p.inicio::date, p.fin::date
FROM public.anios_academicos aa
JOIN (VALUES
  ('I Bimestre', 1, '2026-03-01', '2026-04-30'),
  ('II Bimestre', 2, '2026-05-01', '2026-06-30'),
  ('III Bimestre', 3, '2026-07-01', '2026-08-31'),
  ('IV Bimestre', 4, '2026-09-01', '2026-12-20')
) AS p(nombre, orden, inicio, fin) ON aa.anio = 2026
WHERE NOT EXISTS (
  SELECT 1 FROM public.periodos_academicos pa
  WHERE pa.anio_academico_id = aa.id AND pa.nombre = p.nombre
);

-- F) Productos de venta
INSERT INTO public.productos_venta (nombre, codigo, precio, activo)
SELECT p.nombre, p.codigo, p.precio, true
FROM (VALUES
  ('Uniforme completo', 'UNI-001', 280.00),
  ('Pack de libros', 'LIB-001', 320.00),
  ('Materiales de arte', 'MAT-001', 45.00),
  ('Taller de robotica', 'TAL-001', 120.00),
  ('Agenda escolar', 'AGE-001', 25.00)
) AS p(nombre, codigo, precio)
WHERE NOT EXISTS (SELECT 1 FROM public.productos_venta pv WHERE pv.codigo = p.codigo);

-- G) Sección de ejemplo (3ro Secundaria A)
INSERT INTO public.secciones (anio_academico_id, grado_id, nombre, aula, capacidad)
SELECT aa.id, g.id, 'A', 'A-201', 30
FROM public.anios_academicos aa
JOIN public.grados g ON g.nombre = '3ro'
JOIN public.niveles_educativos n ON n.id = g.nivel_id AND upper(n.codigo) = 'SECUNDARIA'
WHERE aa.anio = 2026
AND NOT EXISTS (
  SELECT 1 FROM public.secciones s
  WHERE s.anio_academico_id = aa.id AND s.grado_id = g.id AND s.nombre = 'A'
);

-- H) Matrícula del estudiante de prueba
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

-- I) Curso asignado (Matematica - 3ro A - Docente)
INSERT INTO public.cursos_asignados (anio_academico_id, seccion_id, asignatura_id, docente_id)
SELECT aa.id, s.id, a.id, d.id
FROM public.anios_academicos aa
JOIN public.secciones s ON s.anio_academico_id = aa.id AND s.nombre = 'A'
JOIN public.asignaturas a ON a.codigo = 'MAT'
JOIN public.docentes d ON d.codigo_docente = 'DOC-001'
WHERE aa.anio = 2026
AND NOT EXISTS (
  SELECT 1 FROM public.cursos_asignados ca
  WHERE ca.anio_academico_id = aa.id AND ca.seccion_id = s.id AND ca.asignatura_id = a.id
);

-- J) Horario de ejemplo
INSERT INTO public.horarios (curso_asignado_id, dia_semana, hora_inicio, hora_fin, aula)
SELECT ca.id, 1, '08:00', '09:30', 'A-201'
FROM public.cursos_asignados ca
JOIN public.asignaturas a ON a.id = ca.asignatura_id AND a.codigo = 'MAT'
WHERE NOT EXISTS (
  SELECT 1 FROM public.horarios h WHERE h.curso_asignado_id = ca.id AND h.dia_semana = 1
);

-- K) Pensiones de ejemplo
INSERT INTO public.pensiones (estudiante_id, concepto_pago_id, estado_pago_id, anio, mes, monto, fecha_vencimiento)
SELECT e.id, cp.id, ep.id, 2026, 3, 450.00, '2026-03-10'
FROM public.estudiantes e
JOIN public.perfiles p ON p.id = e.perfil_id
JOIN auth.users u ON u.id = p.id AND lower(u.email) = 'estudiante@horizonte.edu.pe'
JOIN public.conceptos_pago cp ON cp.codigo = 'PENSION'
JOIN public.estados_pago ep ON ep.codigo = 'PAGADO'
WHERE NOT EXISTS (SELECT 1 FROM public.pensiones pe WHERE pe.estudiante_id = e.id AND pe.anio = 2026 AND pe.mes = 3);

INSERT INTO public.pensiones (estudiante_id, concepto_pago_id, estado_pago_id, anio, mes, monto, fecha_vencimiento)
SELECT e.id, cp.id, ep.id, 2026, 4, 450.00, '2026-04-10'
FROM public.estudiantes e
JOIN public.perfiles p ON p.id = e.perfil_id
JOIN auth.users u ON u.id = p.id AND lower(u.email) = 'estudiante@horizonte.edu.pe'
JOIN public.conceptos_pago cp ON cp.codigo = 'PENSION'
JOIN public.estados_pago ep ON ep.codigo = 'PENDIENTE'
WHERE NOT EXISTS (SELECT 1 FROM public.pensiones pe WHERE pe.estudiante_id = e.id AND pe.anio = 2026 AND pe.mes = 4);

-- L) Seguimiento de ejemplo
INSERT INTO public.seguimiento_academico (estudiante_id, apoderado_id, estado_id, observacion, ultima_comunicacion)
SELECT e.id, a.id, es.id, 'Buen rendimiento general en el bimestre.', '2026-03-15'
FROM public.estudiantes e
JOIN public.perfiles pe ON pe.id = e.perfil_id
JOIN auth.users ue ON ue.id = pe.id AND lower(ue.email) = 'estudiante@horizonte.edu.pe'
JOIN public.apoderados a ON true
JOIN public.perfiles pa ON pa.id = a.perfil_id
JOIN auth.users ua ON ua.id = pa.id AND lower(ua.email) = 'padre@horizonte.edu.pe'
JOIN public.estados_seguimiento es ON es.codigo = 'BIEN'
WHERE NOT EXISTS (SELECT 1 FROM public.seguimiento_academico sa WHERE sa.estudiante_id = e.id);

-- M) Verificación
SELECT 'anios' AS tabla, count(*) FROM public.anios_academicos
UNION ALL SELECT 'grados', count(*) FROM public.grados
UNION ALL SELECT 'secciones', count(*) FROM public.secciones
UNION ALL SELECT 'matriculas', count(*) FROM public.matriculas
UNION ALL SELECT 'cursos', count(*) FROM public.cursos_asignados
UNION ALL SELECT 'asignaturas', count(*) FROM public.asignaturas;
