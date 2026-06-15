-- Normaliza nombres de grado Inicial: "3 anos" -> "3 años"
UPDATE public.grados
SET nombre = regexp_replace(nombre, '(\d+)\s*anos\b', '\1 años', 'gi')
WHERE nombre ~* '\d+\s*anos\b';

-- Verificación
SELECT ne.codigo AS nivel, g.nombre, g.orden
FROM public.grados g
JOIN public.niveles_educativos ne ON ne.id = g.nivel_id
WHERE ne.codigo = 'INICIAL'
ORDER BY g.orden;
