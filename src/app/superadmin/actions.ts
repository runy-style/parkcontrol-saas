'use server'

import { createServerClient } from '@supabase/ssr'
import { createClient as createServerUserClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/superadmin'
import { Tariff, PlanType, BillingStatus, SubscriptionPayment } from '@/lib/types'

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
  plan_type?: PlanType
  billing_status?: BillingStatus
  current_period_end?: string | null
  grace_period_days?: number
  subscription_price?: number
  billing_notes?: string | null
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
        plan_type: org.plan_type || 'monthly',
        billing_status: org.billing_status || (org.is_active === false ? 'suspended' : 'active'),
        current_period_end: org.current_period_end || null,
        grace_period_days: org.grace_period_days ?? 3,
        subscription_price: org.subscription_price || 25000,
        billing_notes: org.billing_notes || null,
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

// Permanently delete a parking organization and purge all related data and users from Supabase
export async function deleteParkingOrganizationAction(orgId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const caller = await verifySuperAdminCaller()
    const admin = createServiceClient()

    // 1. Fetch organization details
    const { data: org, error: orgErr } = await admin
      .from('organizations')
      .select('id, name')
      .eq('id', orgId)
      .single()

    if (orgErr || !org) {
      throw new Error('El estacionamiento no existe o ya fue eliminado.')
    }

    // 2. Protect Casa Matriz
    if (org.name === 'ParkControl Matriz (SaaS)') {
      throw new Error('Operación denegada: Casa Matriz es la organización principal del sistema y no puede eliminarse.')
    }

    // 3. Safety net: If caller's profile currently points to this org (e.g. from support mode),
    // revert their profile back to Casa Matriz first
    const { data: callerProfile } = await admin
      .from('profiles')
      .select('organization_id')
      .eq('id', caller.id)
      .single()

    if (callerProfile?.organization_id === orgId) {
      const { data: matrixOrg } = await admin
        .from('organizations')
        .select('id')
        .eq('name', 'ParkControl Matriz (SaaS)')
        .single()

      if (matrixOrg) {
        await admin
          .from('profiles')
          .update({ organization_id: matrixOrg.id })
          .eq('id', caller.id)
      }
    }

    // 4. Retrieve all profiles belonging to this organization
    const { data: profiles, error: profErr } = await admin
      .from('profiles')
      .select('id, email, role')
      .eq('organization_id', orgId)

    if (profErr) {
      throw new Error(`Error al leer los usuarios del estacionamiento: ${profErr.message}`)
    }

    // Filter out any super admin users so they are never touched in Auth
    const regularUserIdsToDelete = (profiles || [])
      .filter(p => !isSuperAdmin(p.email))
      .map(p => p.id)

    // 5. Delete dependent records in sequence to prevent FK violations & cascade cleanly
    // a. audit_events
    const { error: auditErr } = await admin
      .from('audit_events')
      .delete()
      .eq('organization_id', orgId)
    if (auditErr) console.warn('Note deleting audit_events:', auditErr.message)

    // b. transactions
    const { error: txErr } = await admin
      .from('transactions')
      .delete()
      .eq('organization_id', orgId)
    if (txErr) console.warn('Note deleting transactions:', txErr.message)

    // c. shift_closures
    const { error: closuresErr } = await admin
      .from('shift_closures')
      .delete()
      .eq('organization_id', orgId)
    if (closuresErr) console.warn('Note deleting shift_closures:', closuresErr.message)

    // d. vehicles
    const { error: vehErr } = await admin
      .from('vehicles')
      .delete()
      .eq('organization_id', orgId)
    if (vehErr) console.warn('Note deleting vehicles:', vehErr.message)

    // e. tariffs
    const { error: tariffErr } = await admin
      .from('tariffs')
      .delete()
      .eq('organization_id', orgId)
    if (tariffErr) console.warn('Note deleting tariffs:', tariffErr.message)

    // f. profiles
    const { error: profilesDelErr } = await admin
      .from('profiles')
      .delete()
      .eq('organization_id', orgId)
    if (profilesDelErr) console.warn('Note deleting profiles:', profilesDelErr.message)

    // g. organizations
    const { error: deleteOrgErr } = await admin
      .from('organizations')
      .delete()
      .eq('id', orgId)

    if (deleteOrgErr) {
      throw new Error(`Error al eliminar la organización: ${deleteOrgErr.message}`)
    }

    // 6. Delete users from Supabase Auth to free storage & user quota
    for (const uid of regularUserIdsToDelete) {
      try {
        await admin.auth.admin.deleteUser(uid)
      } catch (authDelErr: any) {
        console.warn(`No se pudo eliminar auth user ${uid}:`, authDelErr.message)
      }
    }

    return { success: true }
  } catch (err: any) {
    console.error('deleteParkingOrganizationAction error:', err)
    return { error: err.message || 'Error desconocido al eliminar estacionamiento' }
  }
}

// ─── ACCIONES DE SUSCRIPCIONES Y COBROS (SUPER ADMIN) ───

// 1. Registrar pago manual (1 mes, 12 meses o personalizado)
export async function recordManualPaymentAction(payload: {
  orgId: string
  periodMonths: number
  amount: number
  paymentMethod: string
  notes?: string
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const caller = await verifySuperAdminCaller()
    const admin = createServiceClient()

    const { data: org, error: orgErr } = await admin
      .from('organizations')
      .select('id, name, current_period_end, grace_period_days')
      .eq('id', payload.orgId)
      .single()

    if (orgErr || !org) throw new Error('Estacionamiento no encontrado.')

    // Calcular nueva fecha de vencimiento
    const now = new Date()
    let baseDate = now
    if (org.current_period_end) {
      const currentEnd = new Date(org.current_period_end)
      if (currentEnd.getTime() > now.getTime()) {
        baseDate = currentEnd
      }
    }

    const daysToAdd = payload.periodMonths === 12 ? 365 : Math.max(1, payload.periodMonths * 30)
    const newDueDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000)

    // Actualizar organización
    const { error: updErr } = await admin
      .from('organizations')
      .update({
        current_period_end: newDueDate.toISOString(),
        billing_status: 'active',
        is_active: true,
      })
      .eq('id', payload.orgId)

    if (updErr) throw new Error(updErr.message)

    // Registrar en tabla de pagos (auditoría resiliente si la tabla aún no existe)
    try {
      await admin.from('subscription_payments').insert({
        organization_id: payload.orgId,
        amount: payload.amount,
        period_months: payload.periodMonths,
        payment_method: payload.paymentMethod || 'transferencia',
        notes: payload.notes || `Pago manual registrado por ${caller.email}`,
        registered_by: caller.id,
      })
    } catch (payErr: any) {
      console.warn('subscription_payments insert notice:', payErr.message)
    }

    return { success: true }
  } catch (err: any) {
    console.error('recordManualPaymentAction error:', err)
    return { error: err.message || 'Error al registrar pago' }
  }
}

// 2. Asignar licencia perpetua (compra definitiva del sistema)
export async function setLifetimeLicenseAction(orgId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const caller = await verifySuperAdminCaller()
    const admin = createServiceClient()

    const { error } = await admin
      .from('organizations')
      .update({
        plan_type: 'lifetime',
        billing_status: 'lifetime',
        is_active: true,
      })
      .eq('id', orgId)

    if (error) throw new Error(error.message)

    try {
      await admin.from('subscription_payments').insert({
        organization_id: orgId,
        amount: 0,
        period_months: 0,
        payment_method: 'licencia_perpetua',
        notes: `Licencia perpetua (compra definitiva) otorgada por ${caller.email}`,
        registered_by: caller.id,
      })
    } catch (e: any) {
      console.warn('payment log note:', e.message)
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// 3. Extender días de gracia o cortesía adicional
export async function extendGracePeriodAction(payload: {
  orgId: string
  extraDays: number
}): Promise<{ success?: boolean; error?: string }> {
  try {
    await verifySuperAdminCaller()
    const admin = createServiceClient()

    const { data: org, error: orgErr } = await admin
      .from('organizations')
      .select('id, current_period_end')
      .eq('id', payload.orgId)
      .single()

    if (orgErr || !org) throw new Error('Estacionamiento no encontrado.')

    const now = new Date()
    let baseDate = now
    if (org.current_period_end) {
      const currentEnd = new Date(org.current_period_end)
      if (currentEnd.getTime() > now.getTime()) {
        baseDate = currentEnd
      }
    }

    const newDueDate = new Date(baseDate.getTime() + payload.extraDays * 24 * 60 * 60 * 1000)

    const { error } = await admin
      .from('organizations')
      .update({
        current_period_end: newDueDate.toISOString(),
        billing_status: 'active',
        is_active: true,
      })
      .eq('id', payload.orgId)

    if (error) throw new Error(error.message)
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// 4. Actualizar configuración de suscripción
export async function updateSubscriptionSettingsAction(payload: {
  orgId: string
  planType: PlanType
  subscriptionPrice: number
  gracePeriodDays: number
  dueDate?: string | null
  billingNotes?: string
}): Promise<{ success?: boolean; error?: string }> {
  try {
    await verifySuperAdminCaller()
    const admin = createServiceClient()

    const updateData: any = {
      plan_type: payload.planType,
      subscription_price: payload.subscriptionPrice,
      grace_period_days: payload.gracePeriodDays,
      billing_notes: payload.billingNotes || null,
    }

    if (payload.dueDate !== undefined) {
      updateData.current_period_end = payload.dueDate
    }

    const { error } = await admin
      .from('organizations')
      .update(updateData)
      .eq('id', payload.orgId)

    if (error) throw new Error(error.message)
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// 5. Consultar historial de pagos registrados
export async function getSubscriptionPaymentsAction(orgId: string): Promise<{ data?: SubscriptionPayment[]; error?: string }> {
  try {
    await verifySuperAdminCaller()
    const admin = createServiceClient()

    const { data, error } = await admin
      .from('subscription_payments')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return { data: data || [] }
  } catch (err: any) {
    return { error: err.message, data: [] }
  }
}
