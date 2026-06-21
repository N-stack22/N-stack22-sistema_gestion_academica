-- Dashboard optimizado: una consulta por rol.
-- Ejecutar en Supabase SQL Editor (después de 17_funciones_listados.sql).

CREATE OR REPLACE FUNCTION fn_dashboard_admin()
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'summary', jsonb_build_object(
      'totalStudents', (SELECT COUNT(*)::int FROM estudiantes),
      'totalTeachers', (SELECT COUNT(*)::int FROM docentes),
      'totalCourses', (SELECT COUNT(*)::int FROM cursos_asignados),
      'totalEnrollments', (SELECT COUNT(*)::int FROM matriculas),
      'activeAnnouncements', (
        SELECT COUNT(*)::int FROM comunicados WHERE publicado = true
      ),
      'pendingPensions', (
        SELECT COUNT(*)::int
        FROM pensiones p
        JOIN estados_pago ep ON ep.id = p.estado_pago_id
        WHERE ep.codigo IN ('PENDIENTE', 'VENCIDA')
      ),
      'activeYear', COALESCE(
        (SELECT anio FROM anios_academicos WHERE activo = true ORDER BY anio DESC LIMIT 1),
        (SELECT anio FROM anios_academicos ORDER BY anio DESC LIMIT 1)
      )
    ),
    'activities', COALESCE((
      SELECT jsonb_agg(row_data ORDER BY row_data->>'date' DESC)
      FROM (
        SELECT jsonb_build_object(
          'title', n.titulo,
          'description', 'Noticia publicada en el portal institucional.',
          'date', left(coalesce(n.publicado_en::text, ''), 10),
          'type', 'communication'
        ) AS row_data
        FROM noticias n
        WHERE n.publicado = true
        ORDER BY n.publicado_en DESC NULLS LAST
        LIMIT 3
      ) noticias_rows
    ), '[]'::jsonb) || COALESCE((
      SELECT jsonb_agg(row_data ORDER BY row_data->>'date' DESC)
      FROM (
        SELECT jsonb_build_object(
          'title', 'Nueva matrícula registrada',
          'description', 'Estudiante ' || trim(coalesce(p.nombres, '') || ' ' || coalesce(p.apellidos, '')) || ' matriculado.',
          'date', left(coalesce(m.fecha_matricula::text, ''), 10),
          'type', 'administrative'
        ) AS row_data
        FROM matriculas m
        JOIN estudiantes e ON e.id = m.estudiante_id
        JOIN perfiles p ON p.id = e.perfil_id
        ORDER BY m.creado_en DESC NULLS LAST
        LIMIT 3
      ) matricula_rows
    ), '[]'::jsonb),
    'events', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'title', e.titulo,
          'description', coalesce(e.descripcion, e.lugar, ''),
          'date', left(coalesce(e.fecha_inicio::text, ''), 10),
          'type', 'academic'
        )
        ORDER BY e.fecha_inicio
      )
      FROM (
        SELECT titulo, descripcion, fecha_inicio, lugar
        FROM eventos
        ORDER BY fecha_inicio
        LIMIT 5
      ) e
    ), '[]'::jsonb)
  );
$$;


CREATE OR REPLACE FUNCTION fn_dashboard_student(p_estudiante_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  WITH est AS (
    SELECT e.id, e.codigo_estudiante, p.nombres, p.apellidos,
           p.correo_institucional, p.telefono, p.dni
    FROM estudiantes e
    JOIN perfiles p ON p.id = e.perfil_id
    WHERE e.id = p_estudiante_id
    LIMIT 1
  ),
  matricula AS (
    SELECT m.id, m.estudiante_id, m.seccion_id, m.anio_academico_id,
           m.fecha_matricula, em.nombre AS estado_nombre,
           s.nombre AS seccion_nombre, g.id AS grado_id, g.nombre AS grado_nombre,
           ne.id AS nivel_id, ne.nombre AS nivel_nombre, aa.anio
    FROM matriculas m
    JOIN estados_matricula em ON em.id = m.estado_id
    JOIN secciones s ON s.id = m.seccion_id
    JOIN grados g ON g.id = s.grado_id
    JOIN niveles_educativos ne ON ne.id = g.nivel_id
    JOIN anios_academicos aa ON aa.id = m.anio_academico_id
    WHERE m.estudiante_id = p_estudiante_id
      AND em.codigo IN ('ACTIVA', 'PENDIENTE')
    ORDER BY aa.activo DESC, aa.anio DESC, m.fecha_matricula DESC
    LIMIT 1
  ),
  curso_ids AS (
    SELECT ca.id
    FROM cursos_asignados ca
    JOIN matricula m ON m.seccion_id = ca.seccion_id
      AND m.anio_academico_id = ca.anio_academico_id
  ),
  notas AS (
    SELECT
      COUNT(*)::int AS total,
      COALESCE(
        ROUND(
          SUM((c.nota::numeric) * COALESCE(NULLIF(c.peso, 0), 1)) /
          NULLIF(SUM(COALESCE(NULLIF(c.peso, 0), 1)), 0),
          2
        ),
        0
      ) AS promedio
    FROM calificaciones c
    WHERE c.estudiante_id = p_estudiante_id
      AND c.curso_asignado_id IN (SELECT id FROM curso_ids)
  ),
  asistencia_resumen AS (
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE ea.codigo IN ('PRESENTE', 'TARDE', 'JUSTIFICADO'))::int AS presentes
    FROM asistencia a
    JOIN estados_asistencia ea ON ea.id = a.estado_id
    WHERE a.estudiante_id = p_estudiante_id
      AND a.curso_asignado_id IN (SELECT id FROM curso_ids)
  ),
  tareas_resumen AS (
    SELECT COUNT(*)::int AS pendientes
    FROM tareas t
    WHERE t.curso_asignado_id IN (SELECT id FROM curso_ids)
      AND NOT EXISTS (
        SELECT 1
        FROM entregas_tareas et
        WHERE et.tarea_id = t.id
          AND et.estudiante_id = p_estudiante_id
      )
  ),
  pensiones_resumen AS (
    SELECT COUNT(*)::int AS pendientes
    FROM pensiones p
    JOIN estados_pago ep ON ep.id = p.estado_pago_id
    WHERE p.estudiante_id = p_estudiante_id
      AND ep.codigo IN ('PENDIENTE', 'VENCIDA')
  ),
  cursos_json AS (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', ca.id,
        'name', coalesce(a.nombre, ''),
        'teacher', trim(coalesce(dp.nombres, '') || ' ' || coalesce(dp.apellidos, ''))
      )
      ORDER BY a.nombre
    ), '[]'::jsonb) AS data
    FROM cursos_asignados ca
    JOIN asignaturas a ON a.id = ca.asignatura_id
    LEFT JOIN docentes d ON d.id = ca.docente_id
    LEFT JOIN perfiles dp ON dp.id = d.perfil_id
    WHERE ca.id IN (SELECT id FROM curso_ids)
  ),
  proxima_clase AS (
    SELECT jsonb_build_object(
      'time', left(h.hora_inicio::text, 5),
      'course', coalesce(a.nombre, ''),
      'classroom', coalesce(h.aula, '')
    ) AS data
    FROM horarios h
    JOIN cursos_asignados ca ON ca.id = h.curso_asignado_id
    JOIN asignaturas a ON a.id = ca.asignatura_id
    WHERE h.curso_asignado_id IN (SELECT id FROM curso_ids)
      AND h.dia_semana = EXTRACT(ISODOW FROM CURRENT_DATE)::int
      AND h.hora_inicio::time >= CURRENT_TIME::time
    ORDER BY h.hora_inicio
    LIMIT 1
  ),
  ultimo_seguimiento AS (
    SELECT observacion
    FROM seguimiento_academico
    WHERE estudiante_id = p_estudiante_id
    ORDER BY ultima_comunicacion DESC NULLS LAST
    LIMIT 1
  )
  SELECT jsonb_build_object(
    'student', (
      SELECT jsonb_build_object(
        'id', est.id,
        'code', coalesce(est.codigo_estudiante, ''),
        'fullName', trim(coalesce(est.nombres, '') || ' ' || coalesce(est.apellidos, '')),
        'email', coalesce(est.correo_institucional, ''),
        'phone', coalesce(est.telefono, ''),
        'dni', coalesce(est.dni, '')
      )
      FROM est
    ),
    'enrollment', (
      SELECT jsonb_build_object(
        'matricula_id', matricula.id,
        'seccion_id', matricula.seccion_id,
        'anio_academico_id', matricula.anio_academico_id,
        'grado_id', matricula.grado_id,
        'nivel_id', matricula.nivel_id,
        'section', coalesce(matricula.seccion_nombre, ''),
        'grade', coalesce(matricula.grado_nombre, ''),
        'level', coalesce(matricula.nivel_nombre, ''),
        'year', matricula.anio,
        'enrollmentStatus', coalesce(matricula.estado_nombre, ''),
        'enrollmentDate', left(coalesce(matricula.fecha_matricula::text, ''), 10)
      )
      FROM matricula
    ),
    'summary', jsonb_build_object(
      'totalCourses', (SELECT COUNT(*)::int FROM curso_ids),
      'generalAverage', (SELECT promedio FROM notas),
      'gradesCount', (SELECT total FROM notas),
      'pendingTasks', (SELECT pendientes FROM tareas_resumen),
      'pendingPensions', (SELECT pendientes FROM pensiones_resumen),
      'attendancePresent', (SELECT presentes FROM asistencia_resumen),
      'attendanceTotal', (SELECT total FROM asistencia_resumen),
      'attendancePercent', (
        SELECT CASE WHEN total = 0 THEN 0 ELSE ROUND((presentes::numeric / total::numeric) * 100)::int END
        FROM asistencia_resumen
      )
    ),
    'courses', (SELECT data FROM cursos_json),
    'nextClass', (SELECT data FROM proxima_clase),
    'lastFollowUpNote', COALESCE((SELECT observacion FROM ultimo_seguimiento), ''),
    'hasActiveEnrollment', EXISTS(SELECT 1 FROM matricula)
  )
  FROM est
  WHERE EXISTS (SELECT 1 FROM est);
$$;


CREATE OR REPLACE FUNCTION fn_dashboard_docente(p_docente_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  WITH doc AS (
    SELECT d.id, d.codigo_docente, d.especialidad, d.cargo, d.grado_academico,
           p.nombres, p.apellidos, p.correo_institucional, p.telefono
    FROM docentes d
    JOIN perfiles p ON p.id = d.perfil_id
    WHERE d.id = p_docente_id
    LIMIT 1
  ),
  curso_ids AS (
    SELECT id, seccion_id, anio_academico_id
    FROM cursos_asignados
    WHERE docente_id = p_docente_id
  ),
  estudiantes_docente AS (
    SELECT COUNT(DISTINCT m.estudiante_id)::int AS total
    FROM matriculas m
    JOIN estados_matricula em ON em.id = m.estado_id
    JOIN curso_ids c ON c.seccion_id = m.seccion_id AND c.anio_academico_id = m.anio_academico_id
    WHERE em.codigo IN ('ACTIVA', 'PENDIENTE')
  ),
  cursos_json AS (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', ca.id,
        'name', coalesce(asig.nombre, ''),
        'code', coalesce(asig.codigo, ''),
        'level', coalesce(ne.nombre, ''),
        'grade', coalesce(g.nombre, ''),
        'section', coalesce(s.nombre, ''),
        'year', aa.anio,
        'classroom', coalesce(s.aula, ''),
        'studentCount', (
          SELECT COUNT(DISTINCT m.estudiante_id)::int
          FROM matriculas m
          JOIN estados_matricula em ON em.id = m.estado_id
          WHERE m.seccion_id = ca.seccion_id
            AND m.anio_academico_id = ca.anio_academico_id
            AND em.codigo IN ('ACTIVA', 'PENDIENTE')
        )
      )
      ORDER BY asig.nombre
    ), '[]'::jsonb) AS data
    FROM cursos_asignados ca
    JOIN asignaturas asig ON asig.id = ca.asignatura_id
    JOIN secciones s ON s.id = ca.seccion_id
    JOIN grados g ON g.id = s.grado_id
    JOIN niveles_educativos ne ON ne.id = g.nivel_id
    JOIN anios_academicos aa ON aa.id = ca.anio_academico_id
    WHERE ca.docente_id = p_docente_id
  )
  SELECT jsonb_build_object(
    'teacher', (
      SELECT jsonb_build_object(
        'id', doc.id,
        'code', coalesce(doc.codigo_docente, ''),
        'fullName', trim(coalesce(doc.nombres, '') || ' ' || coalesce(doc.apellidos, '')),
        'email', coalesce(doc.correo_institucional, ''),
        'phone', coalesce(doc.telefono, ''),
        'specialty', coalesce(doc.especialidad, ''),
        'position', coalesce(doc.cargo, ''),
        'degree', coalesce(doc.grado_academico, '')
      )
      FROM doc
    ),
    'summary', jsonb_build_object(
      'totalCourses', (SELECT COUNT(*)::int FROM curso_ids),
      'totalStudents', (SELECT total FROM estudiantes_docente),
      'activeTasks', (
        SELECT COUNT(*)::int
        FROM tareas t
        JOIN estados_tarea et ON et.id = t.estado_id
        WHERE t.docente_id = p_docente_id AND et.codigo = 'PUBLICADA'
      ),
      'pendingSubmissions', (
        SELECT COUNT(*)::int
        FROM entregas_tareas en
        JOIN estados_entrega_tarea ee ON ee.id = en.estado_id
        JOIN tareas t ON t.id = en.tarea_id
        WHERE t.docente_id = p_docente_id AND ee.codigo = 'PENDIENTE'
      ),
      'attendanceToday', (
        SELECT COUNT(*)::int
        FROM asistencia a
        WHERE a.curso_asignado_id IN (SELECT id FROM curso_ids)
          AND a.fecha = CURRENT_DATE
      ),
      'gradesRegistered', (
        SELECT COUNT(*)::int
        FROM calificaciones c
        WHERE c.curso_asignado_id IN (SELECT id FROM curso_ids)
      )
    ),
    'courses', (SELECT data FROM cursos_json)
  )
  FROM doc
  WHERE EXISTS (SELECT 1 FROM doc);
$$;
