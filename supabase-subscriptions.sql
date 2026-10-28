-- ============================================================
-- ParkControl SaaS — Migración: Sistema de Suscripciones y Cobros
-- Ejecuta ESTE script en Supabase → SQL Editor → New Query → Run
-- ============================================================

-- 1. Ampliar la tabla de organizaciones (organizations) con datos de facturación
ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'monthly' CHECK (plan_type IN ('trial', 'monthly', 'annual', 'lifetime')),
  ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'active' CHECK (billing_status IN ('active', 'trialing', 'past_due', 'suspended', 'lifetime')),
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS grace_period_days INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS subscription_price INTEGER DEFAULT 25000,
  ADD COLUMN IF NOT EXISTS billing_notes TEXT;

-- 2. Crear tabla de historial de pagos de suscripción (subscription_payments)
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  period_months INTEGER NOT NULL DEFAULT 1,
  payment_method TEXT NOT NULL DEFAULT 'transferencia',
  notes TEXT,
  registered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS en subscription_payments
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS para subscription_payments
DROP POLICY IF EXISTS "payments_select_own" ON public.subscription_payments;
DROP POLICY IF EXISTS "payments_insert_admin" ON public.subscription_payments;
DROP POLICY IF EXISTS "payments_superadmin_all" ON public.subscription_payments;

-- Los usuarios ven los pagos de su propia organización
CREATE POLICY "payments_select_own"
  ON public.subscription_payments FOR SELECT
  USING (organization_id = public.get_my_org_id());

-- Permitir inserción a administradores y superadmin
CREATE POLICY "payments_insert_admin"
  ON public.subscription_payments FOR INSERT
  WITH CHECK (
    organization_id = public.get_my_org_id() 
    AND public.get_my_role() IN ('admin', 'super_admin')
  );

-- 4. Inicializar organizaciones existentes
-- A) Casa Matriz como licencia perpetua (nunca vence)
UPDATE public.organizations
SET 
  plan_type = 'lifetime',
  billing_status = 'lifetime',
  current_period_end = NULL,
  grace_period_days = 0,
  subscription_price = 0
WHERE name = 'ParkControl Matriz (SaaS)';

-- B) Clientes existentes: asignar 30 días de periodo activo desde hoy si no tienen fecha
UPDATE public.organizations
SET 
  plan_type = COALESCE(plan_type, 'monthly'),
  billing_status = COALESCE(billing_status, 'active'),
  current_period_end = COALESCE(current_period_end, now() + INTERVAL '30 days'),
  grace_period_days = COALESCE(grace_period_days, 3),
  subscription_price = COALESCE(subscription_price, 25000)
WHERE name != 'ParkControl Matriz (SaaS)';

-- ============================================================
-- ¡Listo! Sistema de suscripciones configurado en Supabase.
-- ============================================================
