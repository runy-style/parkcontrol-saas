-- ============================================================================
-- PATENTE ÚNICA ACTIVA POR ESTACIONAMIENTO
-- Impide que una misma patente esté ingresada dos veces al mismo tiempo
-- dentro de una organización (la tabla vehicles solo guarda vehículos activos).
-- Ejecutar en Supabase > SQL Editor.
-- ============================================================================

-- 1. (Opcional) Revisar si ya existen patentes duplicadas activas.
--    Si esta consulta devuelve filas, el índice del paso 2 fallará hasta resolverlas
--    (cobrando o eliminando los ingresos duplicados desde el panel).
SELECT organization_id, upper(plate) AS plate, count(*) AS total
FROM public.vehicles
GROUP BY organization_id, upper(plate)
HAVING count(*) > 1;

-- 2. Índice único (sin distinción de mayúsculas/minúsculas).
CREATE UNIQUE INDEX IF NOT EXISTS vehicles_org_plate_unique
  ON public.vehicles (organization_id, upper(plate));
