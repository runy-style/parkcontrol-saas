export type UserRole = 'super_admin' | 'admin' | 'operator'

export type PlanType = 'trial' | 'monthly' | 'annual' | 'lifetime'
export type BillingStatus = 'active' | 'trialing' | 'past_due' | 'suspended' | 'lifetime'

export interface Organization {
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
}

export interface SubscriptionPayment {
  id: string
  organization_id: string
  amount: number
  period_months: number
  payment_method: string
  notes?: string | null
  registered_by?: string | null
  created_at: string
}

export interface BillingStatusInfo {
  status: 'active' | 'expiring_soon' | 'past_due' | 'suspended' | 'lifetime'
  planType: PlanType
  daysRemaining: number
  isBlocked: boolean
  dueDateFormatted: string | null
  graceDaysRemaining: number
  message: string
}

export interface Profile {
  id: string
  organization_id: string
  role: UserRole
  full_name: string
  email: string
  created_at: string
}

export interface Tariff {
  id: string
  organization_id: string
  base_fee: number
  base_minutes: number
  additional_fee: number
  additional_minutes: number
  updated_at: string
  frequent_threshold?: number
  frequent_benefit_type?: 'free_stay' | 'percent' | 'fixed'
  frequent_benefit_value?: number
  frequent_benefit_enabled?: boolean
  max_fee?: number | null
}

export interface Vehicle {
  id: string
  organization_id: string
  plate: string
  entry_at: string
  operator_id: string
}

export interface Transaction {
  id: string
  organization_id: string
  plate: string
  entry_at: string
  exit_at: string
  fee: number
  operator_id: string
  created_at: string
  payment_method?: string
  closure_id?: string | null
}

export interface AuditEvent {
  id: string
  organization_id: string
  event_type: 'vehicle_deleted' | 'fee_modified'
  plate: string
  original_value: number
  new_value: number
  reason: string
  operator_id: string | null
  created_at: string
  closure_id?: string | null
}

export interface ShiftClosure {
  id: string
  organization_id: string
  closed_by: string
  closed_at: string
  total_vehicles: number
  total_revenue: number
  avg_fee: number
  max_fee: number
  receipt_text: string
}

