import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/superadmin'
import { calculateBillingStatus } from '@/lib/billing'
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

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supportOrgId = typeof params?.support_org_id === 'string' ? params.support_org_id : undefined

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

  // Determine active organization (Support mode for Super Admin / SaaS Owner)
  let activeOrgId = profile.organization_id
  let isSupportMode = false

  if (isSuperAdmin(user.email)) {
    if (supportOrgId) {
      activeOrgId = supportOrgId
      isSupportMode = true
    } else {
      redirect('/superadmin')
    }
  }

  // Load organization details including subscription & billing attributes
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, is_active, plan_type, billing_status, current_period_end, grace_period_days, subscription_price')
    .eq('id', activeOrgId)
    .single()

  // Calculate dynamic billing & lock status
  const billingInfo = calculateBillingStatus(org, isSuperAdmin(user.email))

  // Load tariff for active organization
  const { data: tariffData } = await supabase
    .from('tariffs')
    .select('*')
    .eq('organization_id', activeOrgId)
    .single()

  const tariff: Tariff = tariffData || { ...DEFAULT_TARIFF, organization_id: activeOrgId }

  const profileWithOrg = {
    ...profile,
    organization_id: activeOrgId,
    org_name: org?.name || 'Mi Estacionamiento',
    role: isSupportMode ? 'admin' : profile.role,
    is_super_admin: isSuperAdmin(user.email),
    is_support_mode: isSupportMode,
  }

  return <DashboardClient profile={profileWithOrg} tariff={tariff} billingInfo={billingInfo} />
}
