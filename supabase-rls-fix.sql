-- ============================================================
-- ParkControl SaaS — FIX DEFINITIVO: Políticas RLS sin recursión
-- Ejecuta ESTE script en Supabase → SQL Editor → New Query → Run
-- ============================================================

-- 1. Eliminar políticas anteriores para evitar duplicados o conflictos
DROP POLICY IF EXISTS "profiles_self"        ON public.profiles;
DROP POLICY IF EXISTS "profiles_same_org"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;

DROP POLICY IF EXISTS "org_select_own"       ON public.organizations;
DROP POLICY IF EXISTS "org_insert_any"       ON public.organizations;
DROP POLICY IF EXISTS "org_update_own"       ON public.organizations;

DROP POLICY IF EXISTS "tariffs_select_own"   ON public.tariffs;
DROP POLICY IF EXISTS "tariffs_insert_any"   ON public.tariffs;
DROP POLICY IF EXISTS "tariffs_update_own"   ON public.tariffs;

DROP POLICY IF EXISTS "vehicles_select_own"  ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_insert_own"  ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_delete_own"  ON public.vehicles;

DROP POLICY IF EXISTS "transactions_select_own" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert_own" ON public.transactions;
DROP POLICY IF EXISTS "transactions_delete_own" ON public.transactions;

-- 2. Eliminar funciones anteriores (si existen)
DROP FUNCTION IF EXISTS public.my_org_id();
DROP FUNCTION IF EXISTS public.my_role();
DROP FUNCTION IF EXISTS public.get_my_org_id();
DROP FUNCTION IF EXISTS public.get_my_role();

-- ============================================================
-- 3. CREAR FUNCIONES DE SEGURIDAD (SECURITY DEFINER)
-- ============================================================
-- IMPORTANT: Al usar SECURITY DEFINER y SET search_path = public,
-- estas funciones se ejecutan con los privilegios del creador (bypass RLS).
-- Esto evita al 100% el error de "infinite recursion" o "stack depth limit exceeded".

CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Habilitar RLS en todas las tablas por si acaso
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. POLÍTICAS PARA PROFILES
-- ============================================================
-- Ver el propio perfil
CREATE POLICY "profiles_self"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Ver perfiles de compañeros de la misma organización (usa la función segura)
CREATE POLICY "profiles_same_org"
  ON public.profiles FOR SELECT
  USING (organization_id = public.get_my_org_id());

-- Permitir insertar el propio perfil durante el registro
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Editar el propio perfil
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Borrar perfiles (solo administradores de su propia organización)
CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE
  USING (
    organization_id = public.get_my_org_id() 
    AND public.get_my_role() IN ('admin', 'super_admin')
  );

-- ============================================================
-- 5. POLÍTICAS PARA ORGANIZATIONS
-- ============================================================
-- Un usuario solo puede ver su organización
CREATE POLICY "org_select_own"
  ON public.organizations FOR SELECT
  USING (id = public.get_my_org_id());

-- Permitir creación libre (necesario para el registro de nuevos tenants)
CREATE POLICY "org_insert_any"
  ON public.organizations FOR INSERT
  WITH CHECK (true);

-- Solo administradores pueden editar su organización
CREATE POLICY "org_update_own"
  ON public.organizations FOR UPDATE
  USING (
    id = public.get_my_org_id() 
    AND public.get_my_role() IN ('admin', 'super_admin')
  );

-- ============================================================
-- 6. POLÍTICAS PARA TARIFFS
-- ============================================================
CREATE POLICY "tariffs_select_own"
  ON public.tariffs FOR SELECT
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "tariffs_insert_any"
  ON public.tariffs FOR INSERT
  WITH CHECK (true); -- La creación se hace vía registro de admin

CREATE POLICY "tariffs_update_own"
  ON public.tariffs FOR UPDATE
  USING (
    organization_id = public.get_my_org_id() 
    AND public.get_my_role() IN ('admin', 'super_admin')
  );

-- ============================================================
-- 7. POLÍTICAS PARA VEHICLES
-- ============================================================
CREATE POLICY "vehicles_select_own"
  ON public.vehicles FOR SELECT
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "vehicles_insert_own"
  ON public.vehicles FOR INSERT
  WITH CHECK (organization_id = public.get_my_org_id());

CREATE POLICY "vehicles_delete_own"
  ON public.vehicles FOR DELETE
  USING (organization_id = public.get_my_org_id());

-- ============================================================
-- 8. POLÍTICAS PARA TRANSACTIONS
-- ============================================================
CREATE POLICY "transactions_select_own"
  ON public.transactions FOR SELECT
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "transactions_insert_own"
  ON public.transactions FOR INSERT
  WITH CHECK (organization_id = public.get_my_org_id());

CREATE POLICY "transactions_delete_own"
  ON public.transactions FOR DELETE
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "transactions_update_own"
  ON public.transactions FOR UPDATE
  USING (organization_id = public.get_my_org_id())
  WITH CHECK (organization_id = public.get_my_org_id());

-- ============================================================
-- ¡Listo! RLS corregido sin recursión al 100%.
-- ============================================================
