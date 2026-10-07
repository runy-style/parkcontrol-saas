'use server'

import { createServerClient } from '@supabase/ssr'
import { createClient as createServerUserClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/superadmin'
import { Tariff } from '@/lib/types'

function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'

  return createServerClient(
    supabaseUrl,
    serviceRoleKey,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Ensure the caller is an authenticated superadmin
async function verifySuperAdminCaller() {
  const userClient = await createServerUserClient()
  const { data: { user }, error } = await userClient.auth.getUser()
  if (error || !user) {
    throw new Error('No autorizado: sesión no encontrada.')
  }
  if (!isSuperAdmin(user.email)) {
    throw new Error('No autorizado: acceso exclusivo para Dueño del Sistema.')
  }
  return user
}

export interface SuperAdminParking {
  id: string
  name: string
  is_active: boolean
  created_at: string
  tariff: Tariff | null
  activeVehiclesCount: number
  totalTransactionsCount: number
  totalRevenue: number
  users: {
    id: string
    full_name: string
    email: string
    role: string
    created_at?: string
  }[]
}

export interface SuperAdminData {
  parkings: SuperAdminParking[]
  globalMetrics: {
    totalParkings: number
    activeParkings: number
    totalActiveVehicles: number
    totalTransactions: number
    totalRevenue: number
  }
}

export async function getSuperAdminDataAction(): Promise<{ data?: SuperAdminData; error?: string }> {
  try {
    await verifySuperAdminCaller()
    const admin = createServiceClient()

    // 1. Fetch all organizations
    const { data: orgs, error: orgsErr } = await admin
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })

    if (orgsErr) throw new Error(orgsErr.message)

    // 2. Fetch tariffs, profiles, and active vehicles count per org
    const [tariffsRes, profilesRes, vehiclesRes] = await Promise.all([
      admin.from('tariffs').select('*'),
      admin.from('profiles').select('id, organization_id, full_name, email, role, created_at').order('created_at', { ascending: true }),
      admin.from('vehicles').select('id, organization_id'),
    ])

    const tariffs = tariffsRes.data || []
    const profiles = profilesRes.data || []
    const vehicles = vehiclesRes.data || []

    // 3. Helper to fetch all transactions in batches to avoid 1000 row truncation
    let allTx: { organization_id: string; fee: number }[] = []
    let from = 0
    const step = 1000
    while (true) {
      const { data: txBatch, error: txErr } = await admin
        .from('transactions')
        .select('organization_id, fee')
        .range(from, from + step - 1)
      if (txErr || !txBatch || txBatch.length === 0) break
      allTx = allTx.concat(txBatch)
      if (txBatch.length < step) break
      from += step
    }

    // Map metrics per org
    const txCountByOrg: Record<string, number> = {}
    const txRevenueByOrg: Record<string, number> = {}
    allTx.forEach(t => {
      const oid = t.organization_id
      txCountByOrg[oid] = (txCountByOrg[oid] || 0) + 1
      txRevenueByOrg[oid] = (txRevenueByOrg[oid] || 0) + (t.fee || 0)
    })

    const activeVehiclesByOrg: Record<string, number> = {}
    vehicles.forEach(v => {
      const oid = v.organization_id
      activeVehiclesByOrg[oid] = (activeVehiclesByOrg[oid] || 0) + 1
    })

    const tariffsByOrg: Record<string, Tariff> = {}
    tariffs.forEach(tf => {
      tariffsByOrg[tf.organization_id] = tf
    })

    const profilesByOrg: Record<string, any[]> = {}
    profiles.forEach(p => {
      if (!profilesByOrg[p.organization_id]) profilesByOrg[p.organization_id] = []
      profilesByOrg[p.organization_id].push(p)
    })

    const parkings: SuperAdminParking[] = (orgs || []).map(org => {
      return {
        id: org.id,
        name: org.name,
        is_active: org.is_active ?? true,
        created_at: org.created_at,
        tariff: tariffsByOrg[org.id] || null,
        activeVehiclesCount: activeVehiclesByOrg[org.id] || 0,
        totalTransactionsCount: txCountByOrg[org.id] || 0,
        totalRevenue: txRevenueByOrg[org.id] || 0,
        users: profilesByOrg[org.id] || [],
      }
    })

    const globalMetrics = {
      totalParkings: parkings.length,
      activeParkings: parkings.filter(p => p.is_active).length,
      totalActiveVehicles: vehicles.length,
      totalTransactions: allTx.length,
      totalRevenue: allTx.reduce((s, t) => s + (t.fee || 0), 0),
    }

    return { data: { parkings, globalMetrics } }
  } catch (err: any) {
    console.error('getSuperAdminDataAction error:', err)
    return { error: err.message || 'Error al obtener datos de superadmin' }
  }
}

// Activate or suspend an organization
export async function toggleOrganizationStatusAction(orgId: string, isActive: boolean): Promise<{ success?: boolean; error?: string }> {
  try {
    await verifySuperAdminCaller()
    const admin = createServiceClient()

    const { error } = await admin
      .from('organizations')
      .update({ is_active: isActive })
      .eq('id', orgId)

    if (error) throw new Error(error.message)
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// Update parking tariffs directly from support console
export async function updateParkingTariffAction(
  orgId: string,
  tariff: {
    base_fee: number
    base_minutes: number
    additional_fee: number
    additional_minutes: number
    max_fee: number | null
  }
): Promise<{ success?: boolean; error?: string }> {
  try {
    await verifySuperAdminCaller()
    const admin = createServiceClient()

    const { error } = await admin
      .from('tariffs')
      .upsert({
        organization_id: orgId,
        base_fee: tariff.base_fee,
        base_minutes: tariff.base_minutes,
        additional_fee: tariff.additional_fee,
        additional_minutes: tariff.additional_minutes,
        max_fee: tariff.max_fee,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'organization_id' })

    if (error) throw new Error(error.message)
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// Create a new parking organization directly from Super Admin
export async function createParkingOrganizationAction(payload: {
  name: string
  adminName: string
  adminEmail: string
  adminPassword: string
  baseFee: number
  baseMinutes: number
  additionalFee: number
  additionalMinutes: number
  maxFee?: number | null
}): Promise<{ success?: boolean; orgId?: string; error?: string }> {
  try {
    await verifySuperAdminCaller()
    const admin = createServiceClient()

    // 1. Create Organization
    const { data: org, error: orgErr } = await admin
      .from('organizations')
      .insert({
        name: payload.name.trim(),
        is_active: true,
      })
      .select()
      .single()

    if (orgErr || !org) {
      throw new Error(`Error al crear organización: ${orgErr?.message || 'desconocido'}`)
    }

    // 2. Create Tariff
    const { error: tariffErr } = await admin
      .from('tariffs')
      .insert({
        organization_id: org.id,
        base_fee: payload.baseFee,
        base_minutes: payload.baseMinutes,
        additional_fee: payload.additionalFee,
        additional_minutes: payload.additionalMinutes,
        max_fee: payload.maxFee || null,
      })

    if (tariffErr) {
      console.error('Tariff create note:', tariffErr)
    }

    // 3. Create Admin User
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email: payload.adminEmail.trim().toLowerCase(),
      password: payload.adminPassword,
      email_confirm: true,
      user_metadata: { full_name: payload.adminName.trim() },
    })

    if (authErr || !authData?.user) {
      throw new Error(`Error al crear usuario administrador: ${authErr?.message || 'desconocido'}`)
    }

    // 4. Create Profile
    const { error: profErr } = await admin
      .from('profiles')
      .insert({
        id: authData.user.id,
        organization_id: org.id,
        role: 'admin',
        full_name: payload.adminName.trim(),
        email: payload.adminEmail.trim().toLowerCase(),
      })

    if (profErr) {
      throw new Error(`Error al crear perfil: ${profErr.message}`)
    }

    return { success: true, orgId: org.id }
  } catch (err: any) {
    return { error: err.message }
  }
}

// Create a user / operator for an existing parking
export async function createParkingUserAction(
  orgId: string,
  payload: {
    email: string
    password: string
    fullName: string
    role: 'admin' | 'operator'
  }
): Promise<{ success?: boolean; error?: string }> {
  try {
    await verifySuperAdminCaller()
    const admin = createServiceClient()

    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      email_confirm: true,
      user_metadata: { full_name: payload.fullName.trim() },
    })

    if (authErr || !authData?.user) {
      throw new Error(`Error al crear usuario: ${authErr?.message || 'desconocido'}`)
    }

    const { error: profErr } = await admin
      .from('profiles')
      .insert({
        id: authData.user.id,
        organization_id: orgId,
        role: payload.role,
        full_name: payload.fullName.trim(),
        email: payload.email.trim().toLowerCase(),
      })

    if (profErr) throw new Error(profErr.message)

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// Reset password for a parking user
export async function resetParkingUserPasswordAction(
  userId: string,
  newPassword: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    await verifySuperAdminCaller()
    const admin = createServiceClient()

    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (error) throw new Error(error.message)
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// Set organization_id dynamically to impersonate client
export async function setSupportModeOrgAction(targetOrgId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const user = await verifySuperAdminCaller()
    const admin = createServiceClient()

    const { error } = await admin
      .from('profiles')
      .update({ organization_id: targetOrgId })
      .eq('id', user.id)

    if (error) throw new Error(error.message)
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// Return to Casa Matriz
export async function exitSupportModeAction(): Promise<{ success?: boolean; error?: string }> {
  try {
    const user = await verifySuperAdminCaller()
    const admin = createServiceClient()

    const { data: matrixOrg, error: orgErr } = await admin
      .from('organizations')
      .select('id')
      .eq('name', 'ParkControl Matriz (SaaS)')
      .single()

    if (orgErr || !matrixOrg) throw new Error('No se encontró la organización Casa Matriz.')

    const { error } = await admin
      .from('profiles')
      .update({ organization_id: matrixOrg.id })
      .eq('id', user.id)

    if (error) throw new Error(error.message)
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
