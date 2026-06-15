-- Datos operativos: curso asignado de ejemplo (requiere seeds 01, 02 y 04)
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

-- Pensión de ejemplo para estudiante de prueba
INSERT INTO public.pensiones (estudiante_id, concepto_pago_id, estado_pago_id, anio, mes, monto, fecha_vencimiento)
SELECT e.id, cp.id, ep.id, 2026, 3, 450.00, '2026-03-10'
FROM public.estudiantes e
JOIN public.perfiles p ON p.id = e.perfil_id
JOIN auth.users u ON u.id = p.id AND lower(u.email) = 'estudiante@horizonte.edu.pe'
JOIN public.conceptos_pago cp ON cp.codigo = 'PENSION'
JOIN public.estados_pago ep ON ep.codigo = 'PAGADO'
WHERE NOT EXISTS (
  SELECT 1 FROM public.pensiones pe
  WHERE pe.estudiante_id = e.id AND pe.anio = 2026 AND pe.mes = 3
);

INSERT INTO public.pensiones (estudiante_id, concepto_pago_id, estado_pago_id, anio, mes, monto, fecha_vencimiento)
SELECT e.id, cp.id, ep.id, 2026, 4, 450.00, '2026-04-10'
FROM public.estudiantes e
JOIN public.perfiles p ON p.id = e.perfil_id
JOIN auth.users u ON u.id = p.id AND lower(u.email) = 'estudiante@horizonte.edu.pe'
JOIN public.conceptos_pago cp ON cp.codigo = 'PENSION'
JOIN public.estados_pago ep ON ep.codigo = 'PENDIENTE'
WHERE NOT EXISTS (
  SELECT 1 FROM public.pensiones pe
  WHERE pe.estudiante_id = e.id AND pe.anio = 2026 AND pe.mes = 4
);

-- Seguimiento de ejemplo
INSERT INTO public.seguimiento_academico (estudiante_id, apoderado_id, estado_id, observacion, ultima_comunicacion)
SELECT e.id, a.id, es.id, 'Buen rendimiento general en el bimestre.', '2026-03-15'
FROM public.estudiantes e
JOIN public.perfiles pe ON pe.id = e.perfil_id
JOIN auth.users ue ON ue.id = pe.id AND lower(ue.email) = 'estudiante@horizonte.edu.pe'
JOIN public.apoderados a ON true
JOIN public.perfiles pa ON pa.id = a.perfil_id
JOIN auth.users ua ON ua.id = pa.id AND lower(ua.email) = 'padre@horizonte.edu.pe'
JOIN public.estados_seguimiento es ON es.codigo = 'BIEN'
WHERE NOT EXISTS (
  SELECT 1 FROM public.seguimiento_academico sa WHERE sa.estudiante_id = e.id
);
