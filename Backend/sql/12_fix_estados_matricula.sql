-- Estados de matrícula simplificados: Activa, Pendiente, Retirada
-- Ejecutar en Supabase SQL Editor si aún existen Egresado/Trasladado u otros duplicados.

INSERT INTO public.estados_matricula (codigo, nombre) VALUES
  ('ACTIVA', 'Activa'),
  ('PENDIENTE', 'Pendiente'),
  ('RETIRADA', 'Retirada')
ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre;

-- Reasignar matrículas con estados obsoletos a Retirada
UPDATE public.matriculas m
SET estado_id = retirada.id
FROM public.estados_matricula legacy, public.estados_matricula retirada
WHERE m.estado_id = legacy.id
  AND retirada.codigo = 'RETIRADA'
  AND legacy.codigo NOT IN ('ACTIVA', 'PENDIENTE', 'RETIRADA');

-- Migrar alias legacy
UPDATE public.matriculas m
SET estado_id = canon.id
FROM public.estados_matricula legacy, public.estados_matricula canon
WHERE m.estado_id = legacy.id
  AND lower(legacy.codigo) IN ('activo', 'retirado', 'egresado', 'trasladado')
  AND canon.codigo = CASE lower(legacy.codigo)
    WHEN 'activo' THEN 'ACTIVA'
    ELSE 'RETIRADA'
  END;

-- Eliminar estados que ya no se usan
DELETE FROM public.estados_matricula
WHERE codigo NOT IN ('ACTIVA', 'PENDIENTE', 'RETIRADA')
   OR lower(codigo) IN ('activo', 'retirado', 'egresado', 'trasladado');
