'use server'

import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/superadmin'

export async function loginAction(formData: { email: string; password: string }): Promise<{
  success?: boolean
  error?: string
  redirectUrl?: string
}> {
  try {
    const email = formData.email.trim().toLowerCase()
    const password = formData.password

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Email o contraseña incorrectos. Verifica tus credenciales.' }
      }
      return { error: `Error de acceso: ${error.message}` }
    }

    if (!data.user) {
      return { error: 'No se pudo iniciar sesión. Por favor intenta de nuevo.' }
    }

    // Determine redirect based on role
    const redirectUrl = isSuperAdmin(data.user.email) ? '/superadmin' : '/dashboard'
    return { success: true, redirectUrl }
  } catch (err: any) {
    console.error('loginAction server error:', err)
    return { error: err.message || 'Error de comunicación con el servidor. Por favor intenta de nuevo.' }
  }
}
