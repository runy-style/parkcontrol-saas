'use server'

import { createServerClient } from '@supabase/ssr'

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
