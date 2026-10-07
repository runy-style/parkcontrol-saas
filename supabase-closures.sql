-- ============================================================
-- ParkControl SaaS — Migración: Cierres de Caja & Métodos de Pago
-- Ejecuta ESTE script en Supabase → SQL Editor → New Query → Run
-- ============================================================

-- 1. Crear la tabla de cierres de caja (shift_closures)
CREATE TABLE IF NOT EXISTS public.shift_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  closed_by UUID NOT NULL REFERENCES public.profiles(id),
  closed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_vehicles INTEGER NOT NULL,
  total_revenue INTEGER NOT NULL,
  avg_fee INTEGER NOT NULL,
  max_fee INTEGER NOT NULL,
  receipt_text TEXT NOT NULL
);

-- Habilitar RLS en shift_closures
ALTER TABLE public.shift_closures ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas antiguas si existen para evitar conflictos
DROP POLICY IF EXISTS "shift_closures_select_own"  ON public.shift_closures;
DROP POLICY IF EXISTS "shift_closures_insert_own"  ON public.shift_closures;
DROP POLICY IF EXISTS "shift_closures_delete_admin" ON public.shift_closures;

-- 3. Crear políticas RLS seguras sin recursión
CREATE POLICY "shift_closures_select_own"
  ON public.shift_closures FOR SELECT
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "shift_closures_insert_own"
  ON public.shift_closures FOR INSERT
  WITH CHECK (organization_id = public.get_my_org_id());

CREATE POLICY "shift_closures_delete_admin"
  ON public.shift_closures FOR DELETE
  USING (
    organization_id = public.get_my_org_id() 
    AND public.get_my_role() IN ('admin', 'super_admin')
  );

-- 4. Modificar la tabla de transacciones existente para auditoría
-- Agrega el método de pago ('efectivo', 'tarjeta', 'transferencia')
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'efectivo',
  ADD COLUMN IF NOT EXISTS closure_id UUID REFERENCES public.shift_closures(id) ON DELETE SET NULL;

-- 5. Crear política RLS para permitir la actualización de transacciones (necesario para asociar al cierre)
DROP POLICY IF EXISTS "transactions_update_own" ON public.transactions;

CREATE POLICY "transactions_update_own"
  ON public.transactions FOR UPDATE
  USING (organization_id = public.get_my_org_id())
  WITH CHECK (organization_id = public.get_my_org_id());

