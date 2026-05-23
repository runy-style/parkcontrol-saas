export type UserRole = 'super_admin' | 'admin' | 'operator'

export interface Organization {
  id: string
  name: string
  is_active: boolean
  created_at: string
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
