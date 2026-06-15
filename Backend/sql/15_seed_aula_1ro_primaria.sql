-- ============================================================
-- Aula de prueba: 1ro Primaria A (2026)
-- ============================================================
-- RECOMENDADO: ejecutar el script Python (crea usuarios Auth automáticamente):
--   cd Backend
--   .venv\Scripts\python.exe scripts\seed_1ro_primaria.py
--
-- Credenciales generadas:
--   Docente:    docente1ro@horizonte.edu.pe    / Docente123
--   Estudiante: estudiante1ro@horizonte.edu.pe / Estudiante123
--   Apoderado:  padre1ro@horizonte.edu.pe      / Padre123
--
-- Incluye: 5 estudiantes, 5 cursos (MAT,COM,CYT,PSO,ING), horarios,
-- tareas, asistencias, calificaciones, entrega de tarea y pensiones.
-- ============================================================

-- Verificación rápida
SELECT 'docente' AS tipo, d.codigo_docente, p.correo_institucional, p.nombres, p.apellidos
FROM public.docentes d
JOIN public.perfiles p ON p.id = d.perfil_id
WHERE lower(p.correo_institucional) = 'docente1ro@horizonte.edu.pe';

SELECT 'estudiantes 1ro A' AS tipo, e.codigo_estudiante, p.nombres, p.apellidos, s.nombre AS seccion
FROM public.matriculas m
JOIN public.estudiantes e ON e.id = m.estudiante_id
JOIN public.perfiles p ON p.id = e.perfil_id
JOIN public.secciones s ON s.id = m.seccion_id
JOIN public.grados g ON g.id = s.grado_id AND g.nombre = '1ro'
JOIN public.anios_academicos aa ON aa.id = m.anio_academico_id AND aa.anio = 2026;

SELECT 'cursos' AS tipo, a.codigo, a.nombre, d.codigo_docente
FROM public.cursos_asignados ca
JOIN public.asignaturas a ON a.id = ca.asignatura_id
JOIN public.docentes d ON d.id = ca.docente_id
JOIN public.secciones s ON s.id = ca.seccion_id
JOIN public.grados g ON g.id = s.grado_id AND g.nombre = '1ro'
JOIN public.anios_academicos aa ON aa.id = ca.anio_academico_id AND aa.anio = 2026;

SELECT 'tareas' AS tipo, count(*) FROM public.tareas t
JOIN public.cursos_asignados ca ON ca.id = t.curso_asignado_id
JOIN public.secciones s ON s.id = ca.seccion_id
JOIN public.grados g ON g.id = s.grado_id AND g.nombre = '1ro';

SELECT 'asistencias' AS tipo, count(*) FROM public.asistencia a
JOIN public.cursos_asignados ca ON ca.id = a.curso_asignado_id
JOIN public.secciones s ON s.id = ca.seccion_id
JOIN public.grados g ON g.id = s.grado_id AND g.nombre = '1ro';

SELECT 'calificaciones' AS tipo, count(*) FROM public.calificaciones c
JOIN public.cursos_asignados ca ON ca.id = c.curso_asignado_id
JOIN public.secciones s ON s.id = ca.seccion_id
JOIN public.grados g ON g.id = s.grado_id AND g.nombre = '1ro';
