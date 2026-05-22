import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Tariff } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcFee(ms: number, tariff: Tariff): number {
  const minutes = ms / 60000
  if (minutes <= 0) return 0
  if (minutes <= tariff.base_minutes) return tariff.base_fee
  const extra = Math.ceil((minutes - tariff.base_minutes) / tariff.additional_minutes)
  return tariff.base_fee + extra * tariff.additional_fee
}

export function formatCLP(n: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
  return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
}

export function formatTime(date: string | number): string {
  return new Date(date).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(date: string | number): string {
  return new Date(date).toLocaleDateString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export function formatPlate(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '')
}
