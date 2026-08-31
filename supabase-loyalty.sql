-- ============================================================
-- ParkControl SaaS — Migración: Fidelización y Beneficios de Clientes Frecuentes
-- Ejecuta este SQL en: Supabase → SQL Editor → New Query → Run
-- ============================================================

ALTER TABLE public.tariffs 
  ADD COLUMN IF NOT EXISTS frequent_threshold INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS frequent_benefit_type TEXT DEFAULT 'percent',
  ADD COLUMN IF NOT EXISTS frequent_benefit_value INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS frequent_benefit_enabled BOOLEAN DEFAULT true;
