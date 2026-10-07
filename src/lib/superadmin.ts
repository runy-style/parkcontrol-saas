export const SUPER_ADMIN_EMAILS = [
  'rudy.verdejo.a@gmail.com',
]

export function isSuperAdmin(email?: string | null): boolean {
  if (!email) return false
  const cleanEmail = email.trim().toLowerCase()
  return SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === cleanEmail)
}
