import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'
import { Tariff } from '@/lib/types'

const DEFAULT_TARIFF: Tariff = {
  id: '',
  organization_id: '',
  base_fee: 1000,
  base_minutes: 60,
  additional_fee: 300,
  additional_minutes: 15,
  updated_at: new Date().toISOString(),
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/login')

  // Load profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('Profile error:', profileError)
    redirect('/login')
  }

  // Load organization name separately
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, is_active')
    .eq('id', profile.organization_id)
    .single()

  // Load tariff
  const { data: tariffData } = await supabase
    .from('tariffs')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .single()

  const tariff: Tariff = tariffData || { ...DEFAULT_TARIFF, organization_id: profile.organization_id }

  const profileWithOrg = {
    ...profile,
    org_name: org?.name || 'Mi Estacionamiento',
  }

  return <DashboardClient profile={profileWithOrg} tariff={tariff} />
}
