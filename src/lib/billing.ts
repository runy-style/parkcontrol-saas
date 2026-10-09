import { Organization, BillingStatusInfo, PlanType } from './types'

export const BANK_TRANSFER_DETAILS = {
  bankName: 'Banco Estado / Banco de Chile',
  accountType: 'Cuenta Vista / Corriente',
  accountNumber: '123456789',
  rut: '12.345.678-9',
  holderName: 'Rudy Verdejo (ParkControl SaaS)',
  email: 'rudy.verdejo.a@gmail.com',
  whatsappNumber: '+56912345678', // Reemplazar con el número real de WhatsApp
  whatsappMessage: 'Hola Rudy, te escribo desde ParkControl para enviar el comprobante de pago de mi estacionamiento.',
}

export function calculateBillingStatus(
  org: Partial<Organization> | null | undefined,
  isSuperAdminUser = false
): BillingStatusInfo {
  // Casa Matriz o Dueño del Sistema nunca se bloquean
  if (isSuperAdminUser || org?.name === 'ParkControl Matriz (SaaS)') {
    return {
      status: 'lifetime',
      planType: 'lifetime',
      daysRemaining: 999,
      isBlocked: false,
      dueDateFormatted: null,
      graceDaysRemaining: 0,
      message: 'Casa Matriz • Licencia Maestra Ilimitada',
    }
  }

  const planType: PlanType = org?.plan_type || 'monthly'

  // Licencia Perpetua (Compra definitiva) nunca se bloquea
  if (planType === 'lifetime' || org?.billing_status === 'lifetime') {
    return {
      status: 'lifetime',
      planType: 'lifetime',
      daysRemaining: 999,
      isBlocked: false,
      dueDateFormatted: null,
      graceDaysRemaining: 0,
      message: 'Licencia Perpetua Activa • Compra Definitiva',
    }
  }

  // Suspensión manual explícita
  if (org?.is_active === false || org?.billing_status === 'suspended') {
    return {
      status: 'suspended',
      planType,
      daysRemaining: 0,
      isBlocked: true,
      dueDateFormatted: org?.current_period_end ? formatDateString(org.current_period_end) : null,
      graceDaysRemaining: 0,
      message: 'Servicio suspendido por facturación.',
    }
  }

  // Si no hay fecha de corte configurada aún (fallback defensivo)
  if (!org?.current_period_end) {
    return {
      status: 'active',
      planType,
      daysRemaining: 30,
      isBlocked: false,
      dueDateFormatted: null,
      graceDaysRemaining: 0,
      message: 'Suscripción Activa',
    }
  }

  const now = new Date()
  const dueDate = new Date(org.current_period_end)
  const graceDays = org.grace_period_days ?? 3
  const graceEnd = new Date(dueDate.getTime() + graceDays * 24 * 60 * 60 * 1000)

  const diffMs = dueDate.getTime() - now.getTime()
  const daysRemaining = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
  const dueDateFormatted = formatDateString(org.current_period_end)

  // 1. Pasó el periodo de gracia -> Bloqueo total
  if (now.getTime() > graceEnd.getTime()) {
    return {
      status: 'suspended',
      planType,
      daysRemaining: 0,
      isBlocked: true,
      dueDateFormatted,
      graceDaysRemaining: 0,
      message: 'Tu suscripción y el periodo de gracia han expirado. Servicio suspendido temporalmente.',
    }
  }

  // 2. Venció la fecha pero está dentro del periodo de gracia -> Alerta de gracia (Past Due)
  if (now.getTime() > dueDate.getTime()) {
    const graceDiffMs = graceEnd.getTime() - now.getTime()
    const graceDaysRemaining = Math.max(1, Math.ceil(graceDiffMs / (24 * 60 * 60 * 1000)))

    return {
      status: 'past_due',
      planType,
      daysRemaining: 0,
      isBlocked: false,
      dueDateFormatted,
      graceDaysRemaining,
      message: `Pago pendiente. Tienes ${graceDaysRemaining} día${graceDaysRemaining !== 1 ? 's' : ''} de gracia de cortesía antes del bloqueo.`,
    }
  }

  // 3. Faltan 5 días o menos para el corte -> Alerta preventiva
  if (daysRemaining <= 5) {
    return {
      status: 'expiring_soon',
      planType,
      daysRemaining,
      isBlocked: false,
      dueDateFormatted,
      graceDaysRemaining: graceDays,
      message: `Tu suscripción vence en ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''} (${dueDateFormatted}).`,
    }
  }

  // 4. Todo en orden -> Activo
  return {
    status: 'active',
    planType,
    daysRemaining,
    isBlocked: false,
    dueDateFormatted,
    graceDaysRemaining: graceDays,
    message: 'Suscripción al día.',
  }
}

function formatDateString(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}
