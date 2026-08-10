import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/reset-password'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const forwardUrl = `${origin}${next}`
      return NextResponse.redirect(forwardUrl)
    }
  }

  // Redirigir a login con mensaje de error si el token expiró o fue inválido
  return NextResponse.redirect(`${origin}/login?error=Invalid%20or%20expired%20recovery%20link`)
}
