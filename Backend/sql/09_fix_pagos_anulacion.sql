-- Estado ANULADO para pagos erróneos (no se eliminan de BD, quedan fuera de totales válidos)
INSERT INTO public.estados_pago (codigo, nombre) VALUES
  ('ANULADO', 'Anulado')
ON CONFLICT (codigo) DO NOTHING;

-- Campos opcionales de auditoría al anular
ALTER TABLE IF EXISTS public.pagos
  ADD COLUMN IF NOT EXISTS motivo_anulacion text,
  ADD COLUMN IF NOT EXISTS anulado_en timestamptz;
