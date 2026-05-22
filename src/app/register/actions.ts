'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cliente con service role key — bypasea RLS para operaciones de admin
function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

export async function registerAction(formData: {
  orgName: string
  fullName: string
  email: string
  password: string
}): Promise<{ error?: string }> {
  const { orgName, fullName, email, password } = formData

  // Usamos el cliente de SERVICE ROLE para crear todo sin depender de sesión activa
  const admin = createServiceClient()

  // 1. Crear usuario en Auth
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // confirmado automáticamente, sin email
    user_metadata: { full_name: fullName },
  })

  if (authError || !authData?.user) {
    console.error('Auth error:', authError)
    if (authError?.message?.includes('already registered')) {
      return { error: 'Este email ya tiene una cuenta registrada.' }
    }
    return { error: `Error al crear usuario: ${authError?.message || 'desconocido'}` }
  }

  const userId = authData.user.id

  // 2. Crear organización
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({ name: orgName, is_active: true })
    .select()
    .single()

  if (orgError || !org) {
    console.error('Org error:', orgError)
    // Limpiar usuario si falló la org
    await admin.auth.admin.deleteUser(userId)
    return { error: `Error al crear organización: ${orgError?.message}` }
  }

  // 3. Crear perfil con rol admin
  const { error: profileError } = await admin
    .from('profiles')
    .insert({
      id: userId,
      organization_id: org.id,
      role: 'admin',
      full_name: fullName,
      email,
    })

  if (profileError) {
    console.error('Profile error:', profileError)
    await admin.auth.admin.deleteUser(userId)
    return { error: `Error al crear perfil: ${profileError?.message}` }
  }

  // 4. Tarifa por defecto
  await admin.from('tariffs').insert({
    organization_id: org.id,
    base_fee: 1000,
    base_minutes: 60,
    additional_fee: 300,
    additional_minutes: 15,
  })

  return {}
}
