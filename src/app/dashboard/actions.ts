'use server'

import { createServerClient } from '@supabase/ssr'
import { createClient as createAnonClient } from '@supabase/supabase-js'

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

export async function createOperatorAction(formData: {
  email: string
  fullName: string
  role: 'operator' | 'admin'
  orgId: string
  passwordStr: string
}): Promise<{ error?: string }> {
  const { email, fullName, role, orgId, passwordStr } = formData

  const admin = createServiceClient()

  // 1. Crear usuario en la sección de autenticación de Supabase
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: passwordStr,
    email_confirm: true, // Confirmado automáticamente sin requerir email
    user_metadata: { full_name: fullName },
  })

  if (authError || !authData?.user) {
    console.error('Create operator error (Auth):', authError)
    if (authError?.message?.includes('already registered') || authError?.message?.includes('already exists')) {
      return { error: 'Este correo electrónico ya está registrado.' }
    }
    return { error: `Error al crear usuario: ${authError?.message || 'desconocido'}` }
  }

  const newUserId = authData.user.id

  // 2. Insertar el registro correspondiente en la tabla profiles
  const { error: profileError } = await admin
    .from('profiles')
    .insert({
      id: newUserId,
      organization_id: orgId,
      role,
      full_name: fullName,
      email,
    })

  if (profileError) {
    console.error('Create operator error (Profile):', profileError)
    // Si falla el perfil, eliminamos el usuario de Auth para mantener la integridad
    await admin.auth.admin.deleteUser(newUserId)
    return { error: `Error al crear perfil de usuario: ${profileError.message}` }
  }

  return {}
}

// ─── Verificación de Credenciales de Administrador (solo contraseña) ──────────
// Busca todos los administradores de la organización e intenta autenticar con
// la contraseña proporcionada. Funciona sin exponer el email del admin.
export async function verifyAdminCredentialsAction(formData: {
  passwordStr: string
  orgId: string
}): Promise<{ success: boolean; error?: string }> {
  const { passwordStr, orgId } = formData

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'

  // 1. Obtener todos los emails de administradores de la organización
  const adminClient = createAnonClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: admins, error: adminsError } = await adminClient
    .from('profiles')
    .select('email')
    .eq('organization_id', orgId)
    .in('role', ['admin', 'super_admin'])

  if (adminsError || !admins?.length) {
    return { success: false, error: 'No se encontraron administradores en este estacionamiento.' }
  }

  // 2. Intentar autenticar con la contraseña contra cada admin (instancia temporal)
  const anonClient = createAnonClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  for (const admin of admins) {
    const { data, error } = await anonClient.auth.signInWithPassword({
      email: admin.email,
      password: passwordStr,
    })
    if (!error && data?.user) {
      return { success: true }
    }
  }

  return { success: false, error: 'Contraseña de administrador incorrecta.' }
}

// ─── Registro de Evento de Auditoría ─────────────────────────────────────────
// Guarda en la base de datos cada eliminación o ajuste de tarifa con su motivo.
export async function logAuditEventAction(data: {
  orgId: string
  eventType: 'vehicle_deleted' | 'fee_modified'
  plate: string
  originalValue: number
  newValue: number
  reason: string
  operatorId: string
}): Promise<{ error?: string }> {
  const { orgId, eventType, plate, originalValue, newValue, reason, operatorId } = data

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'

  const adminClient = createAnonClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error } = await adminClient.from('audit_events').insert({
    organization_id: orgId,
    event_type: eventType,
    plate,
    original_value: originalValue,
    new_value: newValue,
    reason,
    operator_id: operatorId,
  })

  if (error) {
    console.error('logAuditEventAction error:', error)
    return { error: error.message }
  }

  return {}
}
