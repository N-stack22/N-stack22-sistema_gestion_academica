-- Indices de performance para Portal Academico Horizonte.
-- Ejecutar en Supabase SQL Editor despues de las tablas base.
-- No recrea datos: solo agrega indices si no existen.

CREATE INDEX IF NOT EXISTS idx_perfiles_correo_institucional
  ON perfiles (correo_institucional);
CREATE INDEX IF NOT EXISTS idx_perfiles_estado
  ON perfiles (estado);

CREATE INDEX IF NOT EXISTS idx_usuarios_roles_perfil_id
  ON usuarios_roles (perfil_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_rol_id
  ON usuarios_roles (rol_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_perfil_activo
  ON usuarios_roles (perfil_id, activo);

CREATE INDEX IF NOT EXISTS idx_roles_codigo
  ON roles (codigo);

CREATE INDEX IF NOT EXISTS idx_estudiantes_perfil_id
  ON estudiantes (perfil_id);
CREATE INDEX IF NOT EXISTS idx_estudiantes_codigo
  ON estudiantes (codigo_estudiante);

CREATE INDEX IF NOT EXISTS idx_docentes_perfil_id
  ON docentes (perfil_id);
CREATE INDEX IF NOT EXISTS idx_docentes_codigo
  ON docentes (codigo_docente);

CREATE INDEX IF NOT EXISTS idx_apoderados_perfil_id
  ON apoderados (perfil_id);

CREATE INDEX IF NOT EXISTS idx_apoderado_estudiante_apoderado
  ON apoderado_estudiante (apoderado_id);
CREATE INDEX IF NOT EXISTS idx_apoderado_estudiante_estudiante
  ON apoderado_estudiante (estudiante_id);
CREATE INDEX IF NOT EXISTS idx_apoderado_estudiante_pair
  ON apoderado_estudiante (apoderado_id, estudiante_id);
CREATE INDEX IF NOT EXISTS idx_apoderado_estudiante_principal
  ON apoderado_estudiante (apoderado_id, es_principal);

CREATE INDEX IF NOT EXISTS idx_anios_academicos_activo
  ON anios_academicos (activo);
CREATE INDEX IF NOT EXISTS idx_anios_academicos_anio
  ON anios_academicos (anio);

CREATE INDEX IF NOT EXISTS idx_matriculas_estudiante
  ON matriculas (estudiante_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_anio
  ON matriculas (anio_academico_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_seccion
  ON matriculas (seccion_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_estado
  ON matriculas (estado_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_estudiante_anio
  ON matriculas (estudiante_id, anio_academico_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_seccion_anio
  ON matriculas (seccion_id, anio_academico_id);

CREATE INDEX IF NOT EXISTS idx_cursos_asignados_docente
  ON cursos_asignados (docente_id);
CREATE INDEX IF NOT EXISTS idx_cursos_asignados_seccion
  ON cursos_asignados (seccion_id);
CREATE INDEX IF NOT EXISTS idx_cursos_asignados_anio
  ON cursos_asignados (anio_academico_id);
CREATE INDEX IF NOT EXISTS idx_cursos_asignados_asignatura
  ON cursos_asignados (asignatura_id);
CREATE INDEX IF NOT EXISTS idx_cursos_asignados_docente_anio
  ON cursos_asignados (docente_id, anio_academico_id);
CREATE INDEX IF NOT EXISTS idx_cursos_asignados_seccion_anio
  ON cursos_asignados (seccion_id, anio_academico_id);
CREATE INDEX IF NOT EXISTS idx_cursos_asignados_anio_seccion_asignatura
  ON cursos_asignados (anio_academico_id, seccion_id, asignatura_id);

CREATE INDEX IF NOT EXISTS idx_horarios_curso
  ON horarios (curso_asignado_id);
CREATE INDEX IF NOT EXISTS idx_horarios_curso_dia
  ON horarios (curso_asignado_id, dia_semana);

CREATE INDEX IF NOT EXISTS idx_tareas_curso
  ON tareas (curso_asignado_id);
CREATE INDEX IF NOT EXISTS idx_tareas_docente
  ON tareas (docente_id);
CREATE INDEX IF NOT EXISTS idx_tareas_estado
  ON tareas (estado_id);
CREATE INDEX IF NOT EXISTS idx_tareas_curso_fecha
  ON tareas (curso_asignado_id, fecha_entrega);

CREATE INDEX IF NOT EXISTS idx_entregas_tareas_tarea
  ON entregas_tareas (tarea_id);
CREATE INDEX IF NOT EXISTS idx_entregas_tareas_estudiante
  ON entregas_tareas (estudiante_id);
CREATE INDEX IF NOT EXISTS idx_entregas_tareas_tarea_estudiante
  ON entregas_tareas (tarea_id, estudiante_id);

CREATE INDEX IF NOT EXISTS idx_calificaciones_estudiante
  ON calificaciones (estudiante_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_curso
  ON calificaciones (curso_asignado_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_periodo
  ON calificaciones (periodo_academico_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_estudiante_periodo
  ON calificaciones (estudiante_id, periodo_academico_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_curso_periodo
  ON calificaciones (curso_asignado_id, periodo_academico_id);

CREATE INDEX IF NOT EXISTS idx_asistencia_estudiante
  ON asistencia (estudiante_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_curso
  ON asistencia (curso_asignado_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_fecha
  ON asistencia (fecha);
CREATE INDEX IF NOT EXISTS idx_asistencia_estudiante_curso_fecha
  ON asistencia (estudiante_id, curso_asignado_id, fecha);

CREATE INDEX IF NOT EXISTS idx_comunicados_publicado
  ON comunicados (publicado);
CREATE INDEX IF NOT EXISTS idx_comunicados_rol_destinatario
  ON comunicados (rol_destinatario_id);
CREATE INDEX IF NOT EXISTS idx_comunicados_nivel
  ON comunicados (nivel_id);
CREATE INDEX IF NOT EXISTS idx_comunicados_grado
  ON comunicados (grado_id);
CREATE INDEX IF NOT EXISTS idx_comunicados_seccion
  ON comunicados (seccion_id);
CREATE INDEX IF NOT EXISTS idx_comunicados_publicado_en
  ON comunicados (publicado_en);
CREATE INDEX IF NOT EXISTS idx_comunicados_creado_en
  ON comunicados (creado_en);

CREATE INDEX IF NOT EXISTS idx_pensiones_estudiante
  ON pensiones (estudiante_id);
CREATE INDEX IF NOT EXISTS idx_pensiones_estado_pago
  ON pensiones (estado_pago_id);
CREATE INDEX IF NOT EXISTS idx_pensiones_fecha_vencimiento
  ON pensiones (fecha_vencimiento);

CREATE INDEX IF NOT EXISTS idx_pagos_estudiante
  ON pagos (estudiante_id);
CREATE INDEX IF NOT EXISTS idx_pagos_apoderado
  ON pagos (apoderado_id);
CREATE INDEX IF NOT EXISTS idx_pagos_pension
  ON pagos (pension_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado_pago
  ON pagos (estado_pago_id);

CREATE INDEX IF NOT EXISTS idx_seguimiento_estudiante
  ON seguimiento_academico (estudiante_id);
CREATE INDEX IF NOT EXISTS idx_seguimiento_apoderado
  ON seguimiento_academico (apoderado_id);
CREATE INDEX IF NOT EXISTS idx_seguimiento_estado
  ON seguimiento_academico (estado_id);
CREATE INDEX IF NOT EXISTS idx_seguimiento_ultima_comunicacion
  ON seguimiento_academico (ultima_comunicacion);
