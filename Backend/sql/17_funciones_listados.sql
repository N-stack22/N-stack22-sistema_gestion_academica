-- Funciones de listado optimizadas (una sola consulta por tabla).
-- Ejecutar en Supabase SQL Editor y configurar DATABASE_URL en Backend/.env

CREATE OR REPLACE FUNCTION fn_listar_apoderados(
  p_busqueda TEXT DEFAULT NULL,
  p_parentesco TEXT DEFAULT NULL,
  p_estado TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    jsonb_agg(row_data ORDER BY row_data->>'fullName'),
    '[]'::jsonb
  )
  FROM (
    SELECT jsonb_build_object(
      'id', a.id,
      'fullName', trim(p.nombres || ' ' || p.apellidos),
      'studentName', trim(coalesce(ep.nombres, '') || ' ' || coalesce(ep.apellidos, '')),
      'studentId', e.id,
      'relationship', coalesce(ae.parentesco, '—'),
      'isPrimary', CASE WHEN ae.es_principal THEN 'Sí' ELSE 'No' END,
      'phone', coalesce(p.telefono, ''),
      'email', coalesce(p.correo_institucional, ''),
      'status', CASE WHEN p.estado THEN 'Activo' ELSE 'Inactivo' END
    ) AS row_data
    FROM apoderados a
    JOIN perfiles p ON p.id = a.perfil_id
    LEFT JOIN apoderado_estudiante ae ON ae.apoderado_id = a.id
    LEFT JOIN estudiantes e ON e.id = ae.estudiante_id
    LEFT JOIN perfiles ep ON ep.id = e.perfil_id
    WHERE (
      p_busqueda IS NULL OR p_busqueda = '' OR
      lower(
        p.nombres || ' ' || p.apellidos || ' ' ||
        coalesce(p.correo_institucional, '') || ' ' ||
        coalesce(p.telefono, '') || ' ' ||
        coalesce(ep.nombres, '') || ' ' || coalesce(ep.apellidos, '')
      ) LIKE '%' || lower(p_busqueda) || '%'
    )
    AND (p_parentesco IS NULL OR p_parentesco = '' OR ae.parentesco = p_parentesco)
    AND (
      p_estado IS NULL OR p_estado = '' OR
      (p_estado = 'activo' AND p.estado = true) OR
      (p_estado = 'inactivo' AND p.estado = false)
    )
  ) sub;
$$;


CREATE OR REPLACE FUNCTION fn_listar_pagos(
  p_estudiante_id UUID DEFAULT NULL,
  p_estado_codigo TEXT DEFAULT NULL,
  p_busqueda TEXT DEFAULT NULL,
  p_fecha_desde DATE DEFAULT NULL,
  p_fecha_hasta DATE DEFAULT NULL,
  p_metodo TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    jsonb_agg(row_data ORDER BY row_data->>'date' DESC),
    '[]'::jsonb
  )
  FROM (
    SELECT jsonb_build_object(
      'id', pg.id,
      'pensionId', pg.pension_id,
      'studentName', trim(coalesce(ep.nombres, '') || ' ' || coalesce(ep.apellidos, '')),
      'parentName', trim(coalesce(ap.nombres, '') || ' ' || coalesce(ap.apellidos, '')),
      'amount', pg.monto::text,
      'date', coalesce(pg.fecha_pago::text, ''),
      'method', coalesce(mp.nombre, ''),
      'status', coalesce(est.nombre, ''),
      'statusCode', coalesce(est.codigo, ''),
      'operationCode', coalesce(pg.codigo_operacion, ''),
      'voidReason', coalesce(pg.motivo_anulacion, ''),
      'voidedAt', coalesce(pg.anulado_en::text, ''),
      'canVoid', (est.codigo = 'PAGADO')
    ) AS row_data
    FROM pagos pg
    LEFT JOIN estudiantes e ON e.id = pg.estudiante_id
    LEFT JOIN perfiles ep ON ep.id = e.perfil_id
    LEFT JOIN apoderados a ON a.id = pg.apoderado_id
    LEFT JOIN perfiles ap ON ap.id = a.perfil_id
    LEFT JOIN metodos_pago mp ON mp.id = pg.metodo_pago_id
    LEFT JOIN estados_pago est ON est.id = pg.estado_pago_id
    WHERE (p_estudiante_id IS NULL OR pg.estudiante_id = p_estudiante_id)
    AND (p_estado_codigo IS NULL OR p_estado_codigo = '' OR est.codigo = upper(p_estado_codigo))
    AND (p_fecha_desde IS NULL OR pg.fecha_pago::date >= p_fecha_desde)
    AND (p_fecha_hasta IS NULL OR pg.fecha_pago::date <= p_fecha_hasta)
    AND (
      p_metodo IS NULL OR p_metodo = '' OR
      lower(mp.nombre) LIKE '%' || lower(p_metodo) || '%' OR
      lower(mp.codigo) LIKE '%' || lower(p_metodo) || '%'
    )
    AND (
      p_busqueda IS NULL OR p_busqueda = '' OR
      lower(
        coalesce(pg.codigo_operacion, '') || ' ' ||
        coalesce(ep.nombres, '') || ' ' || coalesce(ep.apellidos, '') || ' ' ||
        coalesce(ap.nombres, '') || ' ' || coalesce(ap.apellidos, '')
      ) LIKE '%' || lower(p_busqueda) || '%'
    )
  ) sub;
$$;


CREATE OR REPLACE FUNCTION fn_listar_ventas(
  p_estado_codigo TEXT DEFAULT NULL,
  p_busqueda TEXT DEFAULT NULL,
  p_fecha_desde DATE DEFAULT NULL,
  p_fecha_hasta DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    jsonb_agg(row_data ORDER BY row_data->>'date' DESC),
    '[]'::jsonb
  )
  FROM (
    SELECT jsonb_build_object(
      'id', v.id,
      'code', coalesce(v.codigo_venta, ''),
      'concept', coalesce(string_agg(pv.nombre, ', '), 'Venta'),
      'clientName', coalesce(
        nullif(trim(coalesce(ep.nombres, '') || ' ' || coalesce(ep.apellidos, '')), ''),
        nullif(trim(coalesce(ap.nombres, '') || ' ' || coalesce(ap.apellidos, '')), ''),
        '—'
      ),
      'amount', to_char(v.total, 'FM999999990.00'),
      'status', coalesce(est.nombre, 'Completada'),
      'statusCode', coalesce(est.codigo, 'PAGADO'),
      'canVoid', (coalesce(est.codigo, 'PAGADO') = 'PAGADO'),
      'date', left(coalesce(v.fecha_venta::text, ''), 10),
      'method', coalesce(mp.nombre, ''),
      'items', coalesce(
        jsonb_agg(
          jsonb_build_object(
            'productName', pv.nombre,
            'quantity', dv.cantidad,
            'unitPrice', dv.precio_unitario
          )
        ) FILTER (WHERE pv.id IS NOT NULL),
        '[]'::jsonb
      )
    ) AS row_data
    FROM ventas v
    LEFT JOIN estudiantes e ON e.id = v.estudiante_id
    LEFT JOIN perfiles ep ON ep.id = e.perfil_id
    LEFT JOIN apoderados a ON a.id = v.apoderado_id
    LEFT JOIN perfiles ap ON ap.id = a.perfil_id
    LEFT JOIN metodos_pago mp ON mp.id = v.metodo_pago_id
    LEFT JOIN estados_pago est ON est.id = v.estado_pago_id
    LEFT JOIN detalle_ventas dv ON dv.venta_id = v.id
    LEFT JOIN productos_venta pv ON pv.id = dv.producto_venta_id
    WHERE (p_estado_codigo IS NULL OR p_estado_codigo = '' OR est.codigo = upper(p_estado_codigo))
    AND (p_fecha_desde IS NULL OR v.fecha_venta::date >= p_fecha_desde)
    AND (p_fecha_hasta IS NULL OR v.fecha_venta::date <= p_fecha_hasta)
    AND (
      p_busqueda IS NULL OR p_busqueda = '' OR
      lower(
        coalesce(v.codigo_venta, '') || ' ' ||
        coalesce(ep.nombres, '') || ' ' || coalesce(ep.apellidos, '') || ' ' ||
        coalesce(ap.nombres, '') || ' ' || coalesce(ap.apellidos, '') || ' ' ||
        coalesce(pv.nombre, '')
      ) LIKE '%' || lower(p_busqueda) || '%'
    )
    GROUP BY v.id, ep.nombres, ep.apellidos, ap.nombres, ap.apellidos, est.nombre, est.codigo, mp.nombre
  ) sub;
$$;


CREATE OR REPLACE FUNCTION fn_listar_horarios(
  p_anio_id UUID DEFAULT NULL,
  p_seccion_id UUID DEFAULT NULL,
  p_curso_id UUID DEFAULT NULL,
  p_docente_id UUID DEFAULT NULL,
  p_busqueda TEXT DEFAULT NULL,
  p_dia_semana INT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    jsonb_agg(row_data ORDER BY (row_data->>'dayOrder')::int, row_data->>'startTime'),
    '[]'::jsonb
  )
  FROM (
    SELECT jsonb_build_object(
      'id', h.id,
      'courseId', h.curso_asignado_id,
      'course', coalesce(asig.nombre, ''),
      'teacher', trim(coalesce(dp.nombres, '') || ' ' || coalesce(dp.apellidos, '')),
      'section', trim(coalesce(g.nombre, '') || ' ' || coalesce(s.nombre, '')),
      'sectionId', ca.seccion_id,
      'gradeId', g.id,
      'levelId', ne.id,
      'level', coalesce(ne.nombre, ''),
      'academicYearId', s.anio_academico_id,
      'day', CASE h.dia_semana
        WHEN 1 THEN 'Lunes' WHEN 2 THEN 'Martes' WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves' WHEN 5 THEN 'Viernes' WHEN 6 THEN 'Sábado'
        WHEN 7 THEN 'Domingo' ELSE ''
      END,
      'dayOrder', h.dia_semana,
      'startTime', left(coalesce(h.hora_inicio::text, ''), 5),
      'endTime', left(coalesce(h.hora_fin::text, ''), 5),
      'classroom', coalesce(h.aula, '')
    ) AS row_data
    FROM horarios h
    JOIN cursos_asignados ca ON ca.id = h.curso_asignado_id
    JOIN asignaturas asig ON asig.id = ca.asignatura_id
    JOIN docentes d ON d.id = ca.docente_id
    JOIN perfiles dp ON dp.id = d.perfil_id
    JOIN secciones s ON s.id = ca.seccion_id
    JOIN grados g ON g.id = s.grado_id
    JOIN niveles_educativos ne ON ne.id = g.nivel_id
    WHERE (p_anio_id IS NULL OR s.anio_academico_id = p_anio_id)
    AND (p_seccion_id IS NULL OR ca.seccion_id = p_seccion_id)
    AND (p_curso_id IS NULL OR h.curso_asignado_id = p_curso_id)
    AND (p_docente_id IS NULL OR ca.docente_id = p_docente_id)
    AND (p_dia_semana IS NULL OR h.dia_semana = p_dia_semana)
    AND (
      p_busqueda IS NULL OR p_busqueda = '' OR
      lower(
        coalesce(asig.nombre, '') || ' ' ||
        coalesce(dp.nombres, '') || ' ' || coalesce(dp.apellidos, '') || ' ' ||
        coalesce(s.nombre, '') || ' ' || coalesce(g.nombre, '') || ' ' ||
        coalesce(h.aula, '')
      ) LIKE '%' || lower(p_busqueda) || '%'
    )
  ) sub;
$$;
