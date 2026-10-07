-- ============================================================
-- ParkControl SaaS — Migración: Tabla de Auditoría de Ajustes
-- Ejecuta ESTE script en Supabase → SQL Editor → New Query → Run
-- ============================================================

-- 1. Crear tabla de eventos de auditoría (audit_events)
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('vehicle_deleted', 'fee_modified')),
  plate TEXT NOT NULL,
  original_value INTEGER NOT NULL DEFAULT 0,
  new_value INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Habilitar RLS en audit_events
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS
DROP POLICY IF EXISTS "audit_select_own" ON public.audit_events;
DROP POLICY IF EXISTS "audit_insert_own" ON public.audit_events;

CREATE POLICY "audit_select_own"
  ON public.audit_events FOR SELECT
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "audit_insert_own"
  ON public.audit_events FOR INSERT
  WITH CHECK (organization_id = public.get_my_org_id());

-- ============================================================
-- ¡Listo! Tabla de auditoría lista.
-- ============================================================
