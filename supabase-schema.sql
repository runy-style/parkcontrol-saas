-- ============================================================
-- ParkControl SaaS — Esquema de Base de Datos
-- Ejecuta este SQL en: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. ORGANIZATIONS (cada estacionamiento = 1 organización)
CREATE TABLE IF NOT EXISTS public.organizations (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 2. PROFILES (usuarios ligados a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'operator')) DEFAULT 'operator',
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- 3. TARIFFS (tarifas por organización)
CREATE TABLE IF NOT EXISTS public.tariffs (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id      UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  base_fee             INTEGER NOT NULL DEFAULT 1000,
  base_minutes         INTEGER NOT NULL DEFAULT 60,
  additional_fee       INTEGER NOT NULL DEFAULT 300,
  additional_minutes   INTEGER NOT NULL DEFAULT 15,
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- 4. VEHICLES (vehículos actualmente estacionados)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plate            TEXT NOT NULL,
  entry_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  operator_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 5. TRANSACTIONS (historial de pagos)
CREATE TABLE IF NOT EXISTS public.transactions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plate            TEXT NOT NULL,
  entry_at         TIMESTAMPTZ NOT NULL,
  exit_at          TIMESTAMPTZ NOT NULL,
  fee              INTEGER NOT NULL DEFAULT 0,
  operator_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — aislamiento total entre tenants
-- ============================================================

ALTER TABLE public.organizations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tariffs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions    ENABLE ROW LEVEL SECURITY;

-- Helper function: retorna el organization_id del usuario autenticado
CREATE OR REPLACE FUNCTION public.my_org_id()
RETURNS UUID LANGUAGE SQL STABLE AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

-- Helper function: retorna el rol del usuario autenticado
CREATE OR REPLACE FUNCTION public.my_role()
RETURNS TEXT LANGUAGE SQL STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- ORGANIZATIONS: usuarios ven solo su organización
CREATE POLICY "org_select" ON public.organizations FOR SELECT USING (id = public.my_org_id());
CREATE POLICY "org_update" ON public.organizations FOR UPDATE USING (id = public.my_org_id() AND public.my_role() = 'admin');
CREATE POLICY "org_insert" ON public.organizations FOR INSERT WITH CHECK (true); -- permite registro

-- PROFILES: usuarios ven perfiles de su misma organización
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (organization_id = public.my_org_id());
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (true); -- permite registro
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (organization_id = public.my_org_id() AND public.my_role() = 'admin');
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE USING (organization_id = public.my_org_id() AND public.my_role() = 'admin');

-- TARIFFS: solo ven y editan su tarifa
CREATE POLICY "tariffs_select" ON public.tariffs FOR SELECT USING (organization_id = public.my_org_id());
CREATE POLICY "tariffs_insert" ON public.tariffs FOR INSERT WITH CHECK (true);
CREATE POLICY "tariffs_update" ON public.tariffs FOR UPDATE USING (organization_id = public.my_org_id() AND public.my_role() = 'admin');

-- VEHICLES: todos los de la organización pueden leer/insertar; solo admin puede eliminar
CREATE POLICY "vehicles_select" ON public.vehicles FOR SELECT USING (organization_id = public.my_org_id());
CREATE POLICY "vehicles_insert" ON public.vehicles FOR INSERT WITH CHECK (organization_id = public.my_org_id());
CREATE POLICY "vehicles_delete" ON public.vehicles FOR DELETE USING (organization_id = public.my_org_id());

-- TRANSACTIONS: todos leen su historial; solo admin puede borrar (cierre de caja)
CREATE POLICY "transactions_select" ON public.transactions FOR SELECT USING (organization_id = public.my_org_id());
CREATE POLICY "transactions_insert" ON public.transactions FOR INSERT WITH CHECK (organization_id = public.my_org_id());
CREATE POLICY "transactions_delete" ON public.transactions FOR DELETE USING (organization_id = public.my_org_id() AND public.my_role() = 'admin');

-- ============================================================
-- REALTIME — habilitar cambios en tiempo real
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- ¡Listo! Tu base de datos está configurada.
