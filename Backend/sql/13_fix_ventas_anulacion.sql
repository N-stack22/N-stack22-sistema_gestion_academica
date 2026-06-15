-- Anulación de ventas erróneas (mismo catálogo ANULADO que pagos)
INSERT INTO public.estados_pago (codigo, nombre) VALUES
  ('ANULADO', 'Anulado')
ON CONFLICT (codigo) DO NOTHING;

ALTER TABLE IF EXISTS public.ventas
  ADD COLUMN IF NOT EXISTS motivo_anulacion text;
