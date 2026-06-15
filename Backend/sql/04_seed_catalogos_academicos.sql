-- Catálogos académicos y económicos para módulos operativos
INSERT INTO public.estados_matricula (codigo, nombre) VALUES
  ('ACTIVA', 'Activa'),
  ('PENDIENTE', 'Pendiente'),
  ('RETIRADA', 'Retirada')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.estados_asistencia (codigo, nombre) VALUES
  ('PRESENTE', 'Presente'),
  ('TARDE', 'Tarde'),
  ('FALTA', 'Falta'),
  ('JUSTIFICADO', 'Justificado')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.estados_tarea (codigo, nombre) VALUES
  ('BORRADOR', 'Borrador'),
  ('PUBLICADA', 'Publicada'),
  ('CERRADA', 'Cerrada')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.estados_entrega_tarea (codigo, nombre) VALUES
  ('PENDIENTE', 'Pendiente'),
  ('ENTREGADA', 'Entregada'),
  ('CALIFICADA', 'Calificada')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.tipos_evaluacion (codigo, nombre, descripcion) VALUES
  ('EXAMEN', 'Examen', 'Evaluación escrita'),
  ('PRACTICA', 'Práctica', 'Evaluación práctica'),
  ('TAREA', 'Tarea', 'Trabajo evaluado'),
  ('PROYECTO', 'Proyecto', 'Proyecto integrador'),
  ('PARTICIPACION', 'Participación', 'Participación en clase')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.tipos_recurso (codigo, nombre) VALUES
  ('PDF', 'PDF'),
  ('ENLACE', 'Enlace'),
  ('VIDEO', 'Video'),
  ('DOCUMENTO', 'Documento')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.estados_pago (codigo, nombre) VALUES
  ('PENDIENTE', 'Pendiente'),
  ('PAGADO', 'Pagado'),
  ('VENCIDA', 'Vencida'),
  ('ANULADO', 'Anulado')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.conceptos_pago (codigo, nombre, descripcion) VALUES
  ('PENSION', 'Pensión', 'Pensión mensual'),
  ('MATRICULA', 'Matrícula', 'Pago de matrícula'),
  ('MATERIAL', 'Material', 'Material educativo')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.metodos_pago (codigo, nombre) VALUES
  ('EFECTIVO', 'Efectivo'),
  ('YAPE', 'Yape'),
  ('PLIN', 'Plin'),
  ('TRANSFERENCIA', 'Transferencia'),
  ('TARJETA', 'Tarjeta')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.estados_seguimiento (codigo, nombre) VALUES
  ('BIEN', 'Bien'),
  ('REGULAR', 'Regular'),
  ('OBSERVACION', 'En observación')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.asignaturas (nombre, codigo, area) VALUES
  ('Matemática', 'MAT', 'Ciencias'),
  ('Comunicación', 'COM', 'Humanidades'),
  ('Ciencia y Tecnología', 'CYT', 'Ciencias'),
  ('Personal Social', 'PSO', 'Humanidades'),
  ('Inglés', 'ING', 'Idiomas')
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
