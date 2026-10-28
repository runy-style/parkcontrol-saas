import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/superadmin'
import { getSuperAdminDataAction, exitSupportModeAction } from './actions'
import SuperAdminClient from './SuperAdminClient'

export const dynamic = 'force-dynamic'

export default async function SuperAdminPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  // Authorize only Super Admin / SaaS Owner
  if (!isSuperAdmin(user.email)) {
    redirect('/dashboard')
  }

  // Safety net: Always reset organization_id to Casa Matriz upon entering /superadmin
  await exitSupportModeAction()

  const { data, error } = await getSuperAdminDataAction()

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl mb-4">
          ⚠️
        </div>
        <h1 className="text-xl font-black mb-2">Error al cargar consola maestra</h1>
        <p className="text-zinc-400 text-sm max-w-md mb-6">{error || 'No se pudieron recuperar los datos de los estacionamientos.'}</p>
        <a href="/dashboard" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
          Volver al Dashboard
        </a>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <SuperAdminClient
      initialData={data}
      currentUserEmail={user.email || ''}
      currentUserName={profile?.full_name || user.email || 'Super Admin'}
    />
  )
}
