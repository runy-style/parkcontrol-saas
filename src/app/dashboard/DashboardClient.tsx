'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tariff, Vehicle, Transaction, AuditEvent, ShiftClosure } from '@/lib/types'
import { calcFee, formatCLP, formatElapsed, formatTime, formatDate, formatPlate, toISODateString, formatFullDate } from '@/lib/utils'
import {
  CarFront, BarChart3, DollarSign, Settings, LogOut, Plus,
  Clock, TrendingUp, Users, ChevronRight, ChevronLeft, AlertCircle, X, Download, MessageCircle,
  Search, Trash2, Menu, Lock, CreditCard, Banknote, Smartphone, Check, Sparkles,
  ArrowRight, ShieldAlert, Timer, Calendar as CalendarIcon, Hourglass, Eye, FileText,
  AlertTriangle, CalendarDays, Gift, Crown, Award, Flame, Zap
} from 'lucide-react'
import { createOperatorAction, verifyAdminCredentialsAction, logAuditEventAction } from './actions'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, AreaChart, Area
} from 'recharts'

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface Props {
  profile: {
    id: string
    organization_id: string
    role: string
    full_name: string
    email: string
    org_name: string
  }
  tariff: Tariff
}


// ─── Vehicle Card (50% Plate | 25% Entry & Elapsed Time | 25% Accumulated Fee) ───
function VehicleCard({ vehicle, tariff, monthlyVisits, onCheckout, onDelete }: {
  vehicle: Vehicle
  tariff: Tariff
  monthlyVisits: number
  onCheckout: (v: Vehicle, elapsed: number, fee: number) => void
  onDelete: (v: Vehicle) => void
}) {
  const [elapsed, setElapsed] = useState(Date.now() - new Date(vehicle.entry_at).getTime())
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - new Date(vehicle.entry_at).getTime()), 1000)
    return () => clearInterval(id)
  }, [vehicle.entry_at])

  const fee = calcFee(elapsed, tariff)
  const mins = elapsed / 60000
  const isOver = mins > tariff.base_minutes
  const threshold = tariff.frequent_threshold || 10
  const isLoyal = (tariff.frequent_benefit_enabled !== false) && monthlyVisits >= threshold

  return (
    <div className={`glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3.5 hover:-translate-y-1 transition-all duration-300 border ${
      isLoyal
        ? 'border-amber-400/50 shadow-amber-500/15 ring-1 ring-amber-400/30'
        : 'border-white/10 hover:border-amber-400/40'
    } group shadow-lg bg-zinc-900/90`}>
      
      {/* Upper Data Grid (50% - 25% - 25%) */}
      <div className="flex items-stretch justify-between gap-2">
        
        {/* 50% Left Section: Plate, Monthly Visits Globo/Badge, Delete button & Status badge */}
        <div className="w-1/2 flex flex-col justify-between gap-2 pr-2.5 border-r border-white/10">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
              <span className="font-mono font-black text-2xl sm:text-3xl text-white tracking-widest uppercase truncate leading-none">
                {vehicle.plate}
              </span>
            </div>
            
            <button
              onClick={() => onDelete(vehicle)}
              className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all flex-shrink-0 cursor-pointer"
              title="Eliminar ingreso erróneo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Globo de Conteo Mensual de Visitas */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black shadow-sm ${
                isLoyal
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-amber-500/25 animate-subtle-pulse'
                  : monthlyVisits >= 3
                    ? 'bg-purple-500/20 border border-purple-400/30 text-purple-300'
                    : 'bg-white/10 border border-white/15 text-zinc-300'
              }`}
              title={`${monthlyVisits} ingresos registrados en los últimos 30 días`}
            >
              {isLoyal ? '👑' : monthlyVisits >= 3 ? '⭐' : '🚗'} {monthlyVisits} {monthlyVisits === 1 ? 'visita' : 'visitas'}/mes
            </span>

            {/* Status badge */}
            <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isOver
              ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 animate-subtle-pulse'
              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {isOver ? 'T. Extra' : 'En Curso'}
            </span>
          </div>
        </div>

        {/* 25% Center Section: Entry time and Elapsed time */}
        <div className="w-1/4 flex flex-col justify-between gap-1 px-2 border-r border-white/10 text-left">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Timer className="w-2.5 h-2.5 text-zinc-400" /> Ingreso
            </span>
            <span className="text-xs sm:text-sm font-bold text-zinc-200 font-mono truncate leading-tight">
              {formatTime(vehicle.entry_at)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-zinc-400" /> Tiempo
            </span>
            <span className="text-xs sm:text-sm font-black text-white font-mono truncate leading-tight">
              {formatElapsed(elapsed)}
            </span>
          </div>
        </div>

        {/* 25% Right Section: Large accumulated fee */}
        <div className="w-1/4 flex flex-col items-end justify-center pl-2 text-right">
          <span className="text-[9px] font-black text-amber-400/80 uppercase tracking-wider mb-0.5">
            Valor
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight drop-shadow-md leading-none">
            {formatCLP(fee)}
          </span>
        </div>

      </div>

      {/* Full-width Action Button */}
      <button
        onClick={() => onCheckout(vehicle, elapsed, fee)}
        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-400/20 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-sm sm:text-base py-3 sm:py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/10 active:scale-[0.98] cursor-pointer"
      >
        <span>Finalizar y Cobrar</span>
        <ChevronRight className="w-4 h-4 stroke-[3]" />
      </button>
    </div>
  )
}

// ─── Checkout Modal (Fullscreen on Mobile, Extra Legible) ─────────────────────
function CheckoutModal({ vehicle, elapsed, fee, role, orgId, monthlyVisits, tariff, onConfirm, onClose }: {
  vehicle: Vehicle
  elapsed: number
  fee: number
  role: string
  orgId: string
  monthlyVisits: number
  tariff: Tariff
  onConfirm: (paymentMethod: string, finalFee: number, reason?: string) => Promise<void>
  onClose: () => void
}) {
  const threshold = tariff.frequent_threshold || 10
  const isBenefitActive = (tariff.frequent_benefit_enabled !== false) && monthlyVisits >= threshold
  const benefitType = tariff.frequent_benefit_type || 'percent'
  const benefitValue = tariff.frequent_benefit_value !== undefined ? tariff.frequent_benefit_value : 50

  // Calculate default discounted fee if eligible
  const calculateBenefitFee = () => {
    if (!isBenefitActive) return fee
    if (benefitType === 'free_stay') return 0
    if (benefitType === 'percent') return Math.round(fee * (1 - benefitValue / 100))
    if (benefitType === 'fixed') return Math.max(0, fee - benefitValue)
    return fee
  }

  const defaultBenefitFee = calculateBenefitFee()
  const [applyBenefit, setApplyBenefit] = useState(isBenefitActive)
  const [modifiedFee, setModifiedFee] = useState<number>(isBenefitActive ? defaultBenefitFee : fee)
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo')
  const [isEditingFee, setIsEditingFee] = useState(false)
  const [reason, setReason] = useState(isBenefitActive ? `Beneficio cliente frecuente (${monthlyVisits} visitas/mes)` : '')
  const [adminPassword, setAdminPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleBenefit = () => {
    if (applyBenefit) {
      setApplyBenefit(false)
      setModifiedFee(fee)
      setReason('')
    } else {
      setApplyBenefit(true)
      const bFee = calculateBenefitFee()
      setModifiedFee(bFee)
      setReason(`Beneficio cliente frecuente (${monthlyVisits} visitas en el mes)`)
    }
  }

  const handleConfirm = async () => {
    setError('')
    const isFeeChanged = modifiedFee !== fee

    if (isFeeChanged) {
      if (!reason.trim() || reason.trim().length < 4) {
        setError('Por favor, ingresa un motivo válido (mín. 4 caracteres).')
        return
      }
      if (role === 'operator') {
        if (!adminPassword) {
          setError('Ingresa la contraseña de administrador.')
          return
        }
        setLoading(true)
        try {
          const res = await verifyAdminCredentialsAction({ passwordStr: adminPassword, orgId })
          if (!res.success) {
            setError(res.error || 'Contraseña de administrador incorrecta.')
            setLoading(false)
            return
          }
        } catch (err: any) {
          setError('Error al verificar contraseña de administrador.')
          setLoading(false)
          return
        }
      }
    }

    setLoading(true)
    try {
      await onConfirm(paymentMethod, modifiedFee, isFeeChanged ? reason.trim() : undefined)
    } catch (err: any) {
      setError('Error al procesar el cobro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 sm:bg-black/80 sm:backdrop-blur-md flex flex-col justify-between sm:items-center sm:justify-center p-0 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="w-full h-full sm:h-auto sm:max-w-xl bg-zinc-950 sm:glass-card sm:rounded-3xl sm:border sm:border-white/10 flex flex-col justify-between overflow-y-auto shadow-2xl animate-scale-up my-auto">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/15 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-black text-xl shadow-lg">
              🏁
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">Cobro de Estadía</h2>
              <p className="text-xs text-zinc-400">Comprobante y confirmación de pago</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="text-zinc-400 hover:text-white p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-5 sm:p-8 flex flex-col gap-6 flex-1 justify-center">
          
          {/* Plate & Hero Amount Banner */}
          <div className="flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Plate Badge + Monthly Visits Globo */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <div className="plate-badge px-6 py-2.5 rounded-2xl border-2 border-amber-400/40 shadow-xl flex items-center gap-3">
                <CarFront className="w-6 h-6 text-amber-400" />
                <span className="font-mono font-black text-2xl sm:text-3xl text-white tracking-widest uppercase">
                  {vehicle.plate}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black shadow-md ${
                  isBenefitActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black animate-subtle-pulse'
                    : monthlyVisits >= 3
                      ? 'bg-purple-500/20 border border-purple-400/40 text-purple-300'
                      : 'bg-white/10 border border-white/15 text-zinc-300'
                }`}
              >
                {isBenefitActive ? '👑' : monthlyVisits >= 3 ? '⭐' : '🚗'} {monthlyVisits} {monthlyVisits === 1 ? 'visita' : 'visitas'}/mes
              </span>
            </div>

            {/* VIP Loyalty Benefit Banner (if eligible) */}
            {monthlyVisits >= threshold && (
              <div className={`w-full p-3 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 text-left transition-all ${
                applyBenefit 
                  ? 'bg-amber-400/15 border-amber-400/50 shadow-lg shadow-amber-500/10'
                  : 'bg-black/40 border-white/10 opacity-70'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl flex-shrink-0">🎁</span>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider block truncate">
                      ¡Beneficio Cliente Frecuente ({monthlyVisits} visitas)!
                    </span>
                    <span className="text-[11px] text-zinc-300 font-semibold block truncate">
                      {benefitType === 'free_stay' && '1 Día / Estadía Gratis (100% DCTO)'}
                      {benefitType === 'percent' && `${benefitValue}% de Descuento aplicado`}
                      {benefitType === 'fixed' && `Descuento fijo de ${formatCLP(benefitValue)}`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleBenefit}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex-shrink-0 transition-all cursor-pointer ${
                    applyBenefit
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {applyBenefit ? '✓ Aplicado' : 'Aplicar'}
                </button>
              </div>
            )}

            {/* Hero Amount */}
            <div className="flex flex-col items-center mt-2">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-amber-400/80">
                Total a Cobrar
              </span>
              
              {isEditingFee ? (
                <div className="relative flex items-center mt-2 mb-1">
                  <span className="absolute left-3 text-amber-400 text-2xl font-black">$</span>
                  <input
                    type="number"
                    min={0}
                    value={modifiedFee}
                    onChange={e => {
                      setModifiedFee(Number(e.target.value))
                      setError('')
                    }}
                    autoFocus
                    className="w-48 bg-black/60 border-2 border-amber-400 rounded-2xl pl-8 pr-3 py-2 text-right text-3xl font-black text-amber-400 font-mono focus:outline-none shadow-lg shadow-amber-500/20"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center my-1">
                  {modifiedFee !== fee && (
                    <span className="text-base sm:text-lg font-mono line-through text-zinc-500 font-bold">
                      {formatCLP(fee)}
                    </span>
                  )}
                  <span className="text-5xl sm:text-6xl font-black text-amber-400 font-mono tracking-tight drop-shadow-md">
                    {formatCLP(modifiedFee)}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsEditingFee(!isEditingFee)
                  setError('')
                }}
                className="mt-1 text-zinc-400 hover:text-amber-300 transition-colors px-3 py-1 rounded-full hover:bg-amber-400/10 text-xs font-bold flex items-center gap-1.5 border border-white/10 cursor-pointer"
              >
                {isEditingFee ? '✓ Confirmar Tarifa' : '✍️ Ajustar Monto Manual'}
              </button>
            </div>

            {/* Fee Edit Reason Drawer */}
            {modifiedFee !== fee && (
              <div className="w-full flex flex-col gap-2.5 bg-black/50 border border-amber-500/30 rounded-2xl p-4 mt-2 text-left animate-fade-in">
                <p className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Autorización por Tarifa Modificada
                </p>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Motivo del Ajuste (mín. 4 caracteres)</label>
                  <textarea
                    required
                    rows={2}
                    value={reason}
                    onChange={e => { setReason(e.target.value); setError('') }}
                    placeholder="Ej: Descuento autorizado por administración..."
                    className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 transition-all placeholder:text-zinc-600 resize-none"
                  />
                </div>
                
                {role === 'operator' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase">Contraseña de Administrador</label>
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={e => { setAdminPassword(e.target.value); setError('') }}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 transition-all placeholder:text-zinc-600"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stay Details Grid */}
          <div className="grid grid-cols-3 gap-3 bg-black/40 border border-white/10 rounded-2xl p-4 shadow-inner">
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-400" /> Entrada
              </span>
              <span className="text-base sm:text-lg font-black text-white font-mono">
                {formatTime(vehicle.entry_at)}
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Timer className="w-3 h-3 text-zinc-400" /> Salida
              </span>
              <span className="text-base sm:text-lg font-black text-zinc-200 font-mono">
                {formatTime(Date.now())}
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-amber-400/10 border border-amber-400/20">
              <span className="text-[10px] font-black text-amber-400/90 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Hourglass className="w-3 h-3 text-amber-400" /> Tiempo
              </span>
              <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
                {formatElapsed(elapsed)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector (Large Touch Targets) */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
              Selecciona Método de Pago
            </span>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'efectivo', label: 'Efectivo', icon: Banknote },
                { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
                { id: 'transferencia', label: 'Transfer', icon: Smartphone }
              ].map(m => {
                const Icon = m.icon
                const isSelected = paymentMethod === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-3.5 sm:py-4 px-2 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-2 text-sm font-black transition-all duration-200 border ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-300 shadow-xl shadow-amber-500/20 scale-[1.03]'
                        : 'bg-black/40 text-zinc-300 border-white/10 hover:border-white/25 hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-black' : 'text-amber-400'}`} />
                    <span>{m.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Bottom Actions (Prominent Confirm Button) */}
        <div className="p-5 sm:p-6 border-t border-white/10 bg-black/30 flex flex-col gap-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] text-black font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-amber-500/30 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-6 h-6 stroke-[3]" />
                <span>Confirmar Pago y Liberar</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-3 text-zinc-400 hover:text-white font-bold text-sm transition-all rounded-xl hover:bg-white/5 border border-white/5"
          >
            Cancelar y Volver
          </button>
        </div>

      </div>
    </div>
  )
}

// ─── Action Auth Modal ──────────────────────────────────────────────────────────
function ActionAuthModal({ title, description, role, orgId, onConfirm, onClose }: {
  title: string
  description: string
  role: string
  orgId: string
  onConfirm: (reason: string) => Promise<void>
  onClose: () => void
}) {
  const [reason, setReason] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!reason.trim() || reason.trim().length < 4) {
      setError('Por favor, ingresa un motivo válido (mín. 4 caracteres).')
      return
    }

    setLoading(true)
    try {
      if (role === 'operator') {
        if (!adminPassword) {
          setError('Ingresa la contraseña de administrador.')
          setLoading(false)
          return
        }
        const res = await verifyAdminCredentialsAction({ passwordStr: adminPassword, orgId })
        if (!res.success) {
          setError(res.error || 'Contraseña de administrador incorrecta.')
          setLoading(false)
          return
        }
      }
      
      await onConfirm(reason.trim())
      onClose()
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto animate-fade-in" style={{ zIndex: 100 }}>
      <div className="glass-card rounded-2xl w-full max-w-sm animate-scale-up overflow-hidden my-auto">
        <div className="bg-gradient-to-r from-red-500/10 to-transparent p-6 border-b border-white/5 flex items-center gap-3">
          <span className="text-2xl">🔑</span>
          <div>
            <h2 className="font-black text-white">{title}</h2>
            <p className="text-xs text-zinc-500">Se requiere autorización</p>
          </div>
          <button type="button" onClick={onClose} disabled={loading} className="ml-auto text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="text-xs text-zinc-400 bg-white/5 border border-white/5 rounded-xl p-3 leading-relaxed">
            {description}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Motivo de la Acción (Obligatorio)</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={e => { setReason(e.target.value); setError('') }}
              placeholder="Describa el motivo detalladamente..."
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-amber-400/60 transition-all placeholder:text-zinc-600 resize-none text-zinc-100"
            />
          </div>

          {role === 'operator' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Contraseña de Administrador</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={e => { setAdminPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-amber-400/60 transition-all placeholder:text-zinc-600 text-zinc-100"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 mt-1 text-sm text-red-400 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 border-t border-white/5 pt-4 mt-2">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 font-bold py-3 rounded-xl text-sm transition-all order-2 sm:order-1">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-[1.5] flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-white font-black py-3 rounded-xl text-sm transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 order-1 sm:order-2">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : '✓ Autorizar Acción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
// ─── Shift Closure Modal ──────────────────────────────────────────────────────
function ShiftClosureModal({ transactions, auditEvents, onConfirm, onClose }: {
  transactions: Transaction[]
  auditEvents: AuditEvent[]
  onConfirm: () => void
  onClose: () => void
}) {
  const total = transactions.reduce((s, t) => s + t.fee, 0)
  
  // Payment methods breakdown
  const cashTotal = transactions.filter(t => t.payment_method === 'efectivo').reduce((s, t) => s + t.fee, 0)
  const cardTotal = transactions.filter(t => t.payment_method === 'tarjeta').reduce((s, t) => s + t.fee, 0)
  const transferTotal = transactions.filter(t => t.payment_method === 'transferencia').reduce((s, t) => s + t.fee, 0)

  const avg = transactions.length ? Math.round(total / transactions.length) : 0
  const max = transactions.length ? Math.max(...transactions.map(t => t.fee)) : 0
  const now = new Date()
  const dateStr = formatDate(now.getTime())
  const timeStr = formatTime(now.getTime())

  // Filter audit events of current active shift
  const shiftAudits = auditEvents.filter(a => !a.closure_id)
  const deletedVehicles = shiftAudits.filter(a => a.event_type === 'vehicle_deleted')
  const modifiedFees = shiftAudits.filter(a => a.event_type === 'fee_modified')

  let receiptText = `=====================================\n          CIERRE DE CAJA\n            ParkControl\n=====================================\nFecha: ${dateStr} | Hora: ${timeStr}\n-------------------------------------\nAutos Procesados: ${transactions.length}\nTotal Recaudado:  ${formatCLP(total)}\n\nDESGLOSE DE PAGOS:\n- Efectivo:       ${formatCLP(cashTotal)}\n- Tarjeta:        ${formatCLP(cardTotal)}\n- Transferencia:  ${formatCLP(transferTotal)}\n\nESTADÍSTICAS:\nMonto Promedio:   ${formatCLP(avg)}\nMayor Cobro:      ${formatCLP(max)}\n`

  if (shiftAudits.length > 0) {
    receiptText += `\n=====================================\n        REGISTROS DE AUDITORÍA\n=====================================\n`
    if (deletedVehicles.length > 0) {
      receiptText += `ELIMINACIONES DEL TURNO:\n`
      deletedVehicles.forEach(v => {
        receiptText += `- Patente: ${v.plate}\n  Motivo: ${v.reason}\n`
      })
    }
    if (modifiedFees.length > 0) {
      if (deletedVehicles.length > 0) receiptText += `\n`
      receiptText += `TARIFAS AJUSTADAS:\n`
      modifiedFees.forEach(f => {
        const diff = f.new_value - f.original_value
        receiptText += `- Patente: ${f.plate}\n  Original: ${formatCLP(f.original_value)} -> Cobrado: ${formatCLP(f.new_value)} (${diff > 0 ? '+' : ''}${formatCLP(diff)})\n  Motivo: ${f.reason}\n`
      })
    }
  }

  receiptText += `=====================================\nGenerado por ParkControl SaaS\n=====================================`

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([receiptText], { type: 'text/plain;charset=utf-8' }))
    a.download = `cierre_caja_${dateStr.replace(/\//g, '-')}.txt`
    a.click()
  }

  const handleWhatsApp = () => {
    let msg = `*📢 CIERRE DE CAJA - PARKCONTROL*\n──────────────────────────\n📅 *Fecha:* ${dateStr}\n⏰ *Hora:* ${timeStr}\n🚗 *Vehículos:* ${transactions.length}\n💰 *Total Recaudado:* ${formatCLP(total)}\n\n*💵 Desglose de Pagos:*\n💵 *Efectivo:* ${formatCLP(cashTotal)}\n💳 *Tarjeta:* ${formatCLP(cardTotal)}\n📱 *Transferencia:* ${formatCLP(transferTotal)}`
    
    if (shiftAudits.length > 0) {
      msg += `\n\n*⚠️ Auditoría e Incidencias del Turno:*\n`
      if (deletedVehicles.length > 0) {
        msg += `❌ *Vehículos Eliminados:* ${deletedVehicles.length}\n`
      }
      if (modifiedFees.length > 0) {
        msg += `✍️ *Tarifas Modificadas:* ${modifiedFees.length}\n`
      }
    }
    
    msg += `\n*📈 Estadísticas:*\n📈 *Promedio:* ${formatCLP(avg)}\n🏆 *Mayor Cobro:* ${formatCLP(max)}\n──────────────────────────\n_Generado por ParkControl_`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-sm flex flex-col max-h-[85vh] sm:max-h-[80vh] animate-scale-up overflow-hidden my-auto">
        <div className="flex-shrink-0 bg-gradient-to-r from-emerald-500/10 to-transparent p-5 border-b border-white/5 flex items-center gap-3">
          <span className="text-xl flex-shrink-0">🔒</span>
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-white text-base leading-tight truncate">Cierre de Caja</h2>
            <p className="text-[10px] text-zinc-500 truncate">Resumen del turno</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleDownload}
              title="Descargar TXT"
              className="text-zinc-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleWhatsApp}
              title="Enviar a WhatsApp"
              className="text-[#25D366] hover:text-white p-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              title="Cerrar"
              className="text-zinc-500 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        <pre className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-emerald-400 font-mono text-[10px] leading-relaxed overflow-auto scrollbar-thin select-text m-4">
          {receiptText}
        </pre>
        
        <div className="flex-shrink-0 flex gap-2.5 px-4 pb-4 border-t border-white/5 bg-black/20 pt-3">
          <button onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 font-extrabold py-3 rounded-xl text-xs transition-all">Cancelar</button>
          <button onClick={onConfirm} className="flex-[1.8] flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-extrabold py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/15">
            🔑 Guardar Cierre y Reiniciar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Viewing Closure Receipt Modal (Historical Viewer) ────────────────────────
function ViewingClosureReceiptModal({ closure, onClose }: { closure: ShiftClosure; onClose: () => void }) {
  const dateStr = formatDate(closure.closed_at)
  const timeStr = formatTime(closure.closed_at)

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([closure.receipt_text], { type: 'text/plain;charset=utf-8' }))
    a.download = `cierre_caja_${dateStr.replace(/\//g, '-')}.txt`
    a.click()
  }

  const handleWhatsApp = () => {
    const msg = `*📢 COMPROBANTE CIERRE DE CAJA - PARKCONTROL*\n📅 *Fecha:* ${dateStr}\n⏰ *Hora:* ${timeStr}\n🚗 *Vehículos:* ${closure.total_vehicles}\n💰 *Total Recaudado:* ${formatCLP(closure.total_revenue)}\n\n_Detalles del Cierre:_\n${closure.receipt_text}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-md flex flex-col max-h-[85vh] animate-scale-up overflow-hidden my-auto border border-white/10 shadow-2xl bg-zinc-950">
        <div className="flex-shrink-0 bg-gradient-to-r from-emerald-500/15 to-transparent p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-lg">
              🔒
            </div>
            <div>
              <h2 className="font-black text-white text-base leading-tight">Cierre de Caja Registrado</h2>
              <p className="text-xs text-zinc-400">{dateStr} • {timeStr}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-2 rounded-xl bg-white/5 border border-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <pre className="flex-1 bg-black/60 border border-white/10 rounded-2xl p-4 text-emerald-400 font-mono text-xs leading-relaxed overflow-auto custom-scrollbar select-text m-4">
          {closure.receipt_text}
        </pre>

        <div className="flex-shrink-0 flex gap-2.5 p-4 border-t border-white/10 bg-black/40">
          <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl text-xs transition-all">
            <Download className="w-4 h-4" /> Descargar TXT
          </button>
          <button onClick={handleWhatsApp} className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-black font-black py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Benefits Tab Component (Loyalty Program & Frequency Rules) ──────────────
function BenefitsTab({
  tariff,
  saveTariff,
  savingTariff,
  tariffSaved,
  frequentClientsList,
}: {
  tariff: Tariff
  saveTariff: (t: Tariff) => Promise<void>
  savingTariff: boolean
  tariffSaved: boolean
  frequentClientsList: Array<{ plate: string; visits: number; totalSpent: number; lastVisit: string }>
}) {
  const threshold = tariff.frequent_threshold || 10
  const benefitType = tariff.frequent_benefit_type || 'percent'
  const benefitValue = tariff.frequent_benefit_value !== undefined ? tariff.frequent_benefit_value : 50
  const isEnabled = tariff.frequent_benefit_enabled !== false

  const [editThreshold, setEditThreshold] = useState<number>(threshold)
  const [editType, setEditType] = useState<'percent' | 'free_stay' | 'fixed'>(benefitType)
  const [editValue, setEditValue] = useState<number>(benefitValue)
  const [editEnabled, setEditEnabled] = useState<boolean>(isEnabled)

  useEffect(() => {
    setEditThreshold(tariff.frequent_threshold || 10)
    setEditType(tariff.frequent_benefit_type || 'percent')
    setEditValue(tariff.frequent_benefit_value !== undefined ? tariff.frequent_benefit_value : 50)
    setEditEnabled(tariff.frequent_benefit_enabled !== false)
  }, [tariff])

  const handleSaveBenefits = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveTariff({
      ...tariff,
      frequent_threshold: editThreshold,
      frequent_benefit_type: editType,
      frequent_benefit_value: editValue,
      frequent_benefit_enabled: editEnabled,
    })
  }

  // Compute loyalty stats
  const vipClientsCount = frequentClientsList.filter(c => c.visits >= threshold).length
  const progressingClientsCount = frequentClientsList.filter(c => c.visits >= 3 && c.visits < threshold).length
  const totalMonthlyEntries = frequentClientsList.reduce((acc, c) => acc + c.visits, 0)

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      {/* Header Hero Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900/80 to-zinc-900/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-2xl shadow-xl shadow-amber-500/25">
            🎁
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Programa de Fidelización y Beneficios
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Premia automáticamente a los clientes que registren más de {threshold} visitas en el mes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <span className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 border ${
            editEnabled 
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-zinc-800 text-zinc-400 border-white/10'
          }`}>
            <span className={`w-2 h-2 rounded-full ${editEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
            {editEnabled ? 'Programa Activo' : 'Programa Pausado'}
          </span>
        </div>
      </div>

      {/* 3 Loyalty Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-black/40 shadow-inner flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" /> Clientes VIP Desbloqueados
            </span>
            <span className="text-3xl font-black text-amber-400 font-mono">
              {vipClientsCount}
            </span>
            <span className="text-[11px] text-zinc-400 mt-1">Con {threshold}+ visitas este mes</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-2xl">
            👑
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 bg-black/40 shadow-inner flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Award className="w-3.5 h-3.5 text-purple-400" /> Clientes en Progreso
            </span>
            <span className="text-3xl font-black text-white font-mono">
              {progressingClientsCount}
            </span>
            <span className="text-[11px] text-zinc-400 mt-1">Entre 3 y {threshold - 1} visitas</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl">
            ⭐
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 bg-black/40 shadow-inner flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Flame className="w-3.5 h-3.5 text-sky-400" /> Total Ingresos del Mes
            </span>
            <span className="text-3xl font-black text-sky-400 font-mono">
              {totalMonthlyEntries}
            </span>
            <span className="text-[11px] text-zinc-400 mt-1">En {frequentClientsList.length} patentes únicas</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-2xl">
            🚗
          </div>
        </div>
      </div>

      {/* Main Grid: Configuration Form & Frequent Clients Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Configuration Card (5 cols on lg) */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 border border-white/10 shadow-2xl bg-zinc-900/90">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-black">
              ⚙️
            </div>
            <div>
              <h3 className="font-black text-white text-base leading-tight">
                Configurar Reglas de Beneficio
              </h3>
              <p className="text-xs text-zinc-400">Define requisitos y tipo de premio</p>
            </div>
          </div>

          <form onSubmit={handleSaveBenefits} className="flex flex-col gap-5">
            {/* Toggle Enabled */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/10">
              <div>
                <span className="text-xs font-black text-white block">Estado del Programa</span>
                <span className="text-[11px] text-zinc-400">Permite aplicar beneficios en caja</span>
              </div>
              <button
                type="button"
                onClick={() => setEditEnabled(!editEnabled)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  editEnabled
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'bg-zinc-800 text-zinc-400 border border-white/10'
                }`}
              >
                {editEnabled ? '✓ Activado' : 'Desactivado'}
              </button>
            </div>

            {/* Visitas Requeridas (Threshold) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Meta de Ingresos en el Mes</span>
                <span className="text-amber-400 font-mono font-black">{editThreshold} visitas</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={editThreshold}
                  onChange={e => setEditThreshold(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-black/50 border border-white/10 focus:border-amber-400 rounded-xl px-4 py-3 text-white font-mono font-bold text-base focus:outline-none"
                />
                <span className="absolute right-4 text-xs text-zinc-500 font-bold">visitas / mes</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                La patente obtendrá el beneficio a partir de su ingreso número {editThreshold}.
              </p>
            </div>

            {/* Tipo de Beneficio */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Tipo de Premio / Beneficio
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'percent', label: 'Descuento Porcentual (%)', desc: 'Ej: 50% de descuento en el cobro de la estadía', icon: '🏷️' },
                  { id: 'free_stay', label: '1 Día / Estadía Gratis (100%)', desc: 'Estadía totalmente gratuita ($0 a cobrar)', icon: '🎁' },
                  { id: 'fixed', label: 'Descuento en Monto Fijo ($)', desc: 'Descuenta un valor en pesos específico', icon: '💵' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEditType(opt.id as any)}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      editType === opt.id
                        ? 'bg-amber-400/15 border-amber-400 text-white shadow-md'
                        : 'bg-black/30 border-white/5 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{opt.icon}</span>
                    <div>
                      <span className="text-xs font-black text-white block">{opt.label}</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">{opt.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Valor del Beneficio (if percent or fixed) */}
            {editType === 'percent' && (
              <div className="flex flex-col gap-2 animate-fade-in">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Porcentaje de Descuento</span>
                  <span className="text-amber-400 font-mono font-black">{editValue}%</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={editValue}
                    onChange={e => setEditValue(Math.min(100, Math.max(1, Number(e.target.value))))}
                    className="w-full bg-black/50 border border-white/10 focus:border-amber-400 rounded-xl px-4 py-3 text-white font-mono font-bold text-base focus:outline-none"
                  />
                  <span className="absolute right-4 text-xs text-amber-400 font-black">% DCTO</span>
                </div>
              </div>
            )}

            {editType === 'fixed' && (
              <div className="flex flex-col gap-2 animate-fade-in">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Monto de Descuento en Pesos</span>
                  <span className="text-amber-400 font-mono font-black">{formatCLP(editValue)}</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min={100}
                    step={100}
                    required
                    value={editValue}
                    onChange={e => setEditValue(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-black/50 border border-white/10 focus:border-amber-400 rounded-xl px-4 py-3 text-white font-mono font-bold text-base focus:outline-none"
                  />
                  <span className="absolute right-4 text-xs text-amber-400 font-black">CLP</span>
                </div>
              </div>
            )}

            {tariffSaved && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 animate-fade-in font-bold">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>¡Configuración de beneficios guardada correctamente!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={savingTariff}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-black font-black py-3.5 rounded-xl text-sm transition-all shadow-xl shadow-amber-500/25 active:scale-[0.98] cursor-pointer mt-2"
            >
              {savingTariff ? (
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Guardar Beneficios</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Top 15 Frequent Clients Ranking Table (7 cols on lg) */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-white/10 shadow-2xl bg-zinc-900/90 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-black">
                🏆
              </div>
              <div>
                <h3 className="font-black text-white text-base leading-tight">
                  Top 15 Clientes del Mes
                </h3>
                <p className="text-xs text-zinc-400">Patentes con mayor frecuencia de visitas en los últimos 30 días</p>
              </div>
            </div>

            <span className="text-xs text-amber-400 font-mono font-bold bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20">
              Mostrando Top {Math.min(15, frequentClientsList.length)} de {frequentClientsList.length}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/50 border-b border-white/10">
                  {['#', 'Patente', 'Ingresos / Mes', 'Estado', 'Aporte Total'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {frequentClientsList.length > 0 ? (
                  frequentClientsList.slice(0, 15).map((client, idx) => {
                    const isVip = client.visits >= threshold
                    return (
                      <tr key={client.plate} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-xs font-black font-mono text-zinc-400">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </td>
                        <td className="px-4 py-3 font-mono font-black text-white text-sm">
                          <span className="plate-badge px-2.5 py-1 rounded-lg border border-white/15">
                            {client.plate}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-black font-mono text-white">
                              {client.visits} {client.visits === 1 ? 'visita' : 'visitas'}
                            </span>
                            <div className="w-24 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isVip ? 'bg-amber-400' : 'bg-purple-400'}`}
                                style={{ width: `${Math.min(100, (client.visits / threshold) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {isVip ? (
                            <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-sm">
                              👑 VIP Desbloqueado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-white/5 text-zinc-400 border border-white/10 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                              ⏳ Falta{threshold - client.visits === 1 ? '' : 'n'} {threshold - client.visits}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-amber-400 text-xs">
                          {formatCLP(client.totalSpent)}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-zinc-500 text-xs font-semibold">
                      Sin registros de patentes en los últimos 30 días.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard Client ────────────────────────────────────────────────────
export default function DashboardClient({ profile, tariff: initialTariff }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const orgId = profile.organization_id
  const [tab, setTab] = useState('parking')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [closures, setClosures] = useState<ShiftClosure[]>([])
  const [tariff, setTariff] = useState<Tariff>(initialTariff)
  const [plateInput, setPlateInput] = useState('')
  const [error, setError] = useState('')
  const [checkout, setCheckout] = useState<{ vehicle: Vehicle; elapsed: number; fee: number } | null>(null)
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null)
  const [closureOpen, setClosureOpen] = useState(false)
  const [viewingClosureReceipt, setViewingClosureReceipt] = useState<ShiftClosure | null>(null)
  const [txFilter, setTxFilter] = useState('shift')
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [savingTariff, setSavingTariff] = useState(false)
  const [tariffSaved, setTariffSaved] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])

  // Calendar State for Finance
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())
  const [selectedDayStr, setSelectedDayStr] = useState<string>(toISODateString(new Date()))

  // User Management State
  const [users, setUsers] = useState<any[]>([])
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserFullName, setNewUserFullName] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState<'operator' | 'admin'>('operator')
  const [loadingCreateUser, setLoadingCreateUser] = useState(false)
  const [createUserError, setCreateUserError] = useState('')

  // Load data
  const loadData = useCallback(async () => {
    const queries: any[] = [
      supabase.from('vehicles').select('*').eq('organization_id', orgId).order('entry_at', { ascending: true }),
      supabase.from('transactions').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }),
      supabase.from('audit_events').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }),
      supabase.from('shift_closures').select('*').eq('organization_id', orgId).order('closed_at', { ascending: false }),
    ]
    if (profile.role === 'admin') {
      queries.push(
        supabase.from('profiles').select('*').eq('organization_id', orgId).order('created_at', { ascending: true })
      )
    }
    const results = await Promise.all(queries)
    setVehicles(results[0].data || [])
    setTransactions(results[1].data || [])
    setAuditEvents(results[2].data || [])
    setClosures(results[3].data || [])
    if (profile.role === 'admin' && results[4]) {
      setUsers(results[4].data || [])
    }
  }, [orgId, supabase, profile.role])

  useEffect(() => { loadData() }, [loadData])

  // Realtime subscription
  useEffect(() => {
    const ch = supabase.channel(`org-${orgId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles', filter: `organization_id=eq.${orgId}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `organization_id=eq.${orgId}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_events', filter: `organization_id=eq.${orgId}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shift_closures', filter: `organization_id=eq.${orgId}` }, loadData)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [orgId, supabase, loadData])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const addVehicle = async () => {
    const plate = formatPlate(plateInput)
    if (!plate) { setError('Ingresa una patente.'); return }
    if (plate.length < 5 || plate.length > 7) { setError('Patente inválida (5-7 caracteres).'); return }
    if (vehicles.find(v => v.plate === plate)) { setError('Este vehículo ya está estacionado.'); return }
    setLoadingAdd(true)
    const { error: e } = await supabase.from('vehicles').insert({
      organization_id: orgId, plate, entry_at: new Date().toISOString(), operator_id: profile.id
    })
    if (e) {
      setError('Error al registrar vehículo.')
    } else {
      setPlateInput('')
      setError('')
      await loadData() // Actualizar inmediatamente el estado local
    }
    setLoadingAdd(false)
  }

  const openCheckout = (vehicle: Vehicle, elapsed: number, fee: number) => setCheckout({ vehicle, elapsed, fee })

  const confirmCheckout = async (paymentMethod: string, finalFee: number, reason?: string) => {
    if (!checkout) return
    const { vehicle, fee: calculatedFee } = checkout
    const { error: insError } = await supabase.from('transactions').insert({
      organization_id: orgId, plate: vehicle.plate, entry_at: vehicle.entry_at,
      exit_at: new Date().toISOString(), fee: finalFee, operator_id: profile.id,
      payment_method: paymentMethod,
    })
    if (insError) {
      console.error('Error saving transaction:', insError)
      throw insError
    }
    const { error: delError } = await supabase.from('vehicles').delete().eq('id', vehicle.id)
    if (delError) {
      console.error('Error deleting vehicle:', delError)
      throw delError
    }

    if (reason) {
      await logAuditEventAction({
        orgId,
        eventType: 'fee_modified',
        plate: vehicle.plate,
        originalValue: calculatedFee,
        newValue: finalFee,
        reason,
        operatorId: profile.id
      })
    }

    setCheckout(null)
    await loadData() // Actualizar inmediatamente el estado local
  }

  const executeDeleteVehicle = async (reason: string) => {
    if (!deletingVehicle) return
    const { error: delError } = await supabase.from('vehicles').delete().eq('id', deletingVehicle.id)
    if (delError) {
      console.error('Error deleting vehicle:', delError)
      throw delError
    }

    await logAuditEventAction({
      orgId,
      eventType: 'vehicle_deleted',
      plate: deletingVehicle.plate,
      originalValue: 0,
      newValue: 0,
      reason,
      operatorId: profile.id
    })

    setDeletingVehicle(null)
    await loadData()
  }

  const saveTariff = async (t: Tariff) => {
    setSavingTariff(true)
    const updatePayload: any = {
      base_fee: t.base_fee,
      base_minutes: t.base_minutes,
      additional_fee: t.additional_fee,
      additional_minutes: t.additional_minutes,
    }
    if (t.frequent_threshold !== undefined) updatePayload.frequent_threshold = t.frequent_threshold
    if (t.frequent_benefit_type !== undefined) updatePayload.frequent_benefit_type = t.frequent_benefit_type
    if (t.frequent_benefit_value !== undefined) updatePayload.frequent_benefit_value = t.frequent_benefit_value
    if (t.frequent_benefit_enabled !== undefined) updatePayload.frequent_benefit_enabled = t.frequent_benefit_enabled

    try {
      const { error: updErr } = await supabase.from('tariffs').update(updatePayload).eq('id', t.id)
      if (updErr) {
        // Fallback to standard fields if custom migration columns are pending
        await supabase.from('tariffs').update({
          base_fee: t.base_fee,
          base_minutes: t.base_minutes,
          additional_fee: t.additional_fee,
          additional_minutes: t.additional_minutes,
        }).eq('id', t.id)
      }
    } catch (err) {
      console.error('Error saving tariff:', err)
    }

    setTariff(t)
    setSavingTariff(false)
    setTariffSaved(true)
    setTimeout(() => setTariffSaved(false), 3000)
  }

  const closeClosure = async () => {
    const activeTx = transactions.filter(t => !t.closure_id)
    if (activeTx.length === 0) {
      alert('No hay transacciones activas en el turno actual para cerrar.')
      setClosureOpen(false)
      return
    }

    const totalActive = activeTx.reduce((s, t) => s + t.fee, 0)
    const avgActive = Math.round(totalActive / activeTx.length)
    const maxActive = Math.max(...activeTx.map(t => t.fee))

    const now = new Date()
    const dateStr = formatDate(now.getTime())
    const timeStr = formatTime(now.getTime())

    const cashTotal = activeTx.filter(t => t.payment_method === 'efectivo').reduce((s, t) => s + t.fee, 0)
    const cardTotal = activeTx.filter(t => t.payment_method === 'tarjeta').reduce((s, t) => s + t.fee, 0)
    const transferTotal = activeTx.filter(t => t.payment_method === 'transferencia').reduce((s, t) => s + t.fee, 0)

    const activeAudit = auditEvents.filter(a => !a.closure_id)
    const deletedVehicles = activeAudit.filter(a => a.event_type === 'vehicle_deleted')
    const modifiedFees = activeAudit.filter(a => a.event_type === 'fee_modified')

    let receiptText = `=====================================\n          CIERRE DE CAJA\n            ParkControl\n=====================================\nFecha: ${dateStr} | Hora: ${timeStr}\n-------------------------------------\nAutos Procesados: ${activeTx.length}\nTotal Recaudado:  ${formatCLP(totalActive)}\n\nDESGLOSE DE PAGOS:\n- Efectivo:       ${formatCLP(cashTotal)}\n- Tarjeta:        ${formatCLP(cardTotal)}\n- Transferencia:  ${formatCLP(transferTotal)}\n\nESTADÍSTICAS:\nMonto Promedio:   ${formatCLP(avgActive)}\nMayor Cobro:      ${formatCLP(maxActive)}\n`

    if (activeAudit.length > 0) {
      receiptText += `\n=====================================\n        REGISTROS DE AUDITORÍA\n=====================================\n`
      if (deletedVehicles.length > 0) {
        receiptText += `ELIMINACIONES DEL TURNO:\n`
        deletedVehicles.forEach(v => {
          receiptText += `- Patente: ${v.plate}\n  Motivo: ${v.reason}\n`
        })
      }
      if (modifiedFees.length > 0) {
        if (deletedVehicles.length > 0) receiptText += `\n`
        receiptText += `TARIFAS AJUSTADAS:\n`
        modifiedFees.forEach(f => {
          const diff = f.new_value - f.original_value
          receiptText += `- Patente: ${f.plate}\n  Original: ${formatCLP(f.original_value)} -> Cobrado: ${formatCLP(f.new_value)} (${diff > 0 ? '+' : ''}${formatCLP(diff)})\n  Motivo: ${f.reason}\n`
        })
      }
    }

    receiptText += `=====================================\nGenerado por ParkControl SaaS\n=====================================`

    // 1. Guardar en la tabla shift_closures
    const { data: closure, error: closureErr } = await supabase.from('shift_closures').insert({
      organization_id: orgId,
      closed_by: profile.id,
      total_vehicles: activeTx.length,
      total_revenue: totalActive,
      avg_fee: avgActive,
      max_fee: maxActive,
      receipt_text: receiptText
    }).select().single()

    if (closureErr) {
      alert(`Error al guardar el cierre de caja: ${closureErr.message}`)
      return
    }

    // 2. Vincular transacciones al cierre
    const activeTxIds = activeTx.map(t => t.id)
    const { error: updateErr } = await supabase.from('transactions')
      .update({ closure_id: closure.id })
      .in('id', activeTxIds)

    if (updateErr) {
      alert(`Error al vincular las transacciones al cierre: ${updateErr.message}`)
      return
    }

    // 3. Vincular eventos de auditoría al cierre
    const activeAuditIds = activeAudit.map(a => a.id)
    if (activeAuditIds.length > 0) {
      const { error: updateAuditErr } = await supabase.from('audit_events')
        .update({ closure_id: closure.id })
        .in('id', activeAuditIds)
      if (updateAuditErr) {
        console.error('Error linking audit events to closure:', updateAuditErr)
      }
    }

    setClosureOpen(false)
    await loadData()
  }

  // User Management Actions
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateUserError('')
    
    if (!newUserFullName.trim()) { setCreateUserError('Por favor, ingresa el nombre completo.'); return }
    if (!newUserEmail.trim()) { setCreateUserError('Por favor, ingresa un correo electrónico.'); return }
    if (newUserPassword.length < 6) { setCreateUserError('La contraseña debe tener al menos 6 caracteres.'); return }
    
    setLoadingCreateUser(true)
    try {
      const res = await createOperatorAction({
        email: newUserEmail.trim(),
        fullName: newUserFullName.trim(),
        role: newUserRole,
        orgId,
        passwordStr: newUserPassword
      })
      
      if (res.error) {
        setCreateUserError(res.error)
      } else {
        setNewUserEmail('')
        setNewUserFullName('')
        setNewUserPassword('')
        setNewUserRole('operator')
        setAddUserOpen(false)
        await loadData()
      }
    } catch (err: any) {
      setCreateUserError(`Ocurrió un error inesperado: ${err.message || 'desconocido'}`)
    } finally {
      setLoadingCreateUser(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (userId === profile.id) {
      alert('No puedes eliminar tu propia cuenta de administrador.')
      return
    }
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Perderá el acceso al sistema inmediatamente.')) {
      return
    }
    const { error: err } = await supabase.from('profiles').delete().eq('id', userId)
    if (err) {
      alert(`Error al eliminar usuario: ${err.message}`)
    } else {
      await loadData()
    }
  }

  // Finance filters
  const now = Date.now()
  const filteredTx = transactions.filter(t => {
    if (txFilter === 'shift') return !t.closure_id
    
    const exitMs = new Date(t.exit_at).getTime()
    if (txFilter === 'today') return now - exitMs < 86400000
    if (txFilter === 'week') return now - exitMs < 604800000
    return true
  })
  const total = filteredTx.reduce((s, t) => s + t.fee, 0)
  const avg = filteredTx.length ? Math.round(total / filteredTx.length) : 0
  const maxFee = filteredTx.length ? Math.max(...filteredTx.map(t => t.fee)) : 0

  // Chart data
  const hourData = Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, '0')}:00`, count: 0 }))
  const dayData = dayNames.map(d => ({ day: d, count: 0, revenue: 0 }))
  transactions.forEach(({ entry_at, fee }) => {
    const d = new Date(entry_at)
    hourData[d.getHours()].count++
    dayData[d.getDay()].count++
    dayData[d.getDay()].revenue += fee
  })
  const peakHour = hourData.reduce((a, b) => a.count > b.count ? a : b)
  const peakDay = dayData.reduce((a, b) => a.count > b.count ? a : b)

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-zinc-900/95 border border-white/10 p-3 rounded-xl text-xs shadow-xl">
        <p className="font-bold text-amber-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-zinc-300">
            {p.name === 'revenue' ? `Ingresos: ${formatCLP(p.value)}` : `Vehículos: ${p.value}`}
          </p>
        ))}
      </div>
    )
  }

  // ── Monthly visits calculation (last 30 days) per plate ──
  const thirtyDaysAgoMs = now - 30 * 24 * 60 * 60 * 1000

  const monthlyVisitsByPlate = useMemo(() => {
    const counts: Record<string, number> = {}
    
    // Count transactions in last 30 days
    transactions.forEach(t => {
      const txTime = new Date(t.exit_at || t.created_at || t.entry_at).getTime()
      if (txTime >= thirtyDaysAgoMs) {
        const p = t.plate.toUpperCase()
        counts[p] = (counts[p] || 0) + 1
      }
    })

    // Count currently parked active vehicles
    vehicles.forEach(v => {
      const vTime = new Date(v.entry_at).getTime()
      if (vTime >= thirtyDaysAgoMs) {
        const p = v.plate.toUpperCase()
        counts[p] = (counts[p] || 0) + 1
      }
    })

    return counts
  }, [transactions, vehicles, thirtyDaysAgoMs])

  const frequentClientsList = useMemo(() => {
    const clientsMap: Record<string, { plate: string; visits: number; totalSpent: number; lastVisit: string }> = {}
    
    transactions.forEach(t => {
      const txTime = new Date(t.exit_at || t.created_at || t.entry_at).getTime()
      if (txTime >= thirtyDaysAgoMs) {
        const p = t.plate.toUpperCase()
        if (!clientsMap[p]) {
          clientsMap[p] = { plate: p, visits: 0, totalSpent: 0, lastVisit: t.exit_at || t.entry_at }
        }
        clientsMap[p].visits += 1
        clientsMap[p].totalSpent += t.fee
        if (new Date(t.exit_at || t.entry_at).getTime() > new Date(clientsMap[p].lastVisit).getTime()) {
          clientsMap[p].lastVisit = t.exit_at || t.entry_at
        }
      }
    })

    // Also include active vehicles if not yet in transactions
    vehicles.forEach(v => {
      const p = v.plate.toUpperCase()
      if (!clientsMap[p]) {
        clientsMap[p] = { plate: p, visits: 1, totalSpent: 0, lastVisit: v.entry_at }
      }
    })

    return Object.values(clientsMap).sort((a, b) => b.visits - a.visits)
  }, [transactions, vehicles, thirtyDaysAgoMs])

  const tabs = [
    { id: 'parking', label: 'Estacionamiento', icon: CarFront },
    ...(profile.role === 'admin' ? [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'finance', label: 'Finanzas', icon: DollarSign },
      { id: 'benefits', label: 'Beneficios', icon: Gift },
      { id: 'users', label: 'Usuarios', icon: Users },
      { id: 'settings', label: 'Tarifas', icon: Settings },
    ] : []),
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row relative overflow-x-hidden">
      {/* Ambient background lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      {/* Mobile Top Header (< 768px) */}
      <header className="md:hidden sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-white/5 text-zinc-300 hover:text-white border border-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center font-black text-black text-sm shadow-md">
              P
            </div>
            <span className="font-bold text-white text-sm truncate max-w-[160px]">
              {profile.org_name || 'ParkControl'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {vehicles.length}
          </div>
          <button
            onClick={handleLogout}
            className="text-zinc-500 hover:text-red-400 p-2 rounded-lg"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Independent Left Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-zinc-950/95 md:bg-zinc-950/85 border-r border-white/10 backdrop-blur-2xl p-5 flex flex-col justify-between transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Branding & Status */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center font-black text-black text-lg shadow-lg shadow-amber-500/25">
                P
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm leading-tight truncate">
                  {profile.org_name || 'ParkControl'}
                </p>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                  SaaS Estacionamiento
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live Counter Badge */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
              <span>EN VIVO</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
              {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Vertical Navigation Items */}
          <nav className="flex flex-col gap-1.5 my-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 px-3 mb-1">
              Menú Principal
            </span>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setTab(id)
                  setIsMobileMenuOpen(false)
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 text-left ${
                  tab === id
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/25 font-black scale-[1.02]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${tab === id ? 'text-black' : 'text-zinc-400'}`} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer (User Info + Shift Closure + Logout) */}
        <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
          <button
            onClick={() => {
              setClosureOpen(true)
              setIsMobileMenuOpen(false)
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold py-2.5 px-3 rounded-xl text-xs transition-all shadow-md"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Cierre de Caja del Turno</span>
          </button>

          <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-2xl p-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center font-bold text-amber-400 text-xs flex-shrink-0">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{profile.full_name}</p>
                <p className="text-[10px] text-zinc-500 capitalize">
                  {profile.role === 'admin' ? 'Administrador' : 'Operador'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="text-zinc-500 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content View Container */}
      <main className="flex-1 min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 z-10 relative overflow-y-auto w-full flex flex-col items-center">
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
          {/* Top View Subheader */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-black text-white capitalize">
              {tabs.find((t) => t.id === tab)?.label || 'Estacionamiento'}
            </h1>
            <p className="text-xs text-zinc-400">
              {tab === 'parking' && 'Gestión de entrada, salida y cobro al segundo'}
              {tab === 'dashboard' && 'Estadísticas de flujo vehicular y horas pico'}
              {tab === 'finance' && 'Resumen financiero, arqueo de caja e historial'}
              {tab === 'users' && 'Gestión de cajeros y roles de operador'}
              {tab === 'settings' && 'Configuración de tarifa base y minutos adicionales'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setClosureOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold text-xs px-4 py-2 rounded-xl transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              Cierre de Turno
            </button>
          </div>
        </div>

        {/* ── PARKING TAB (SPLIT LAYOUT: FIXED ENTRY FORM + SCROLLABLE ACTIVE LIST) ── */}
        {tab === 'parking' && (() => {
          const filteredVehicles = vehicles.filter(v =>
            v.plate.toUpperCase().includes(searchQuery.toUpperCase())
          )
          return (
            <div className="flex flex-col gap-5 animate-fade-in w-full">
              {/* SECTION 1: FIXED / STICKY REGISTRATION SECTION */}
              <section className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-2xl -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 py-2 border-b border-white/10 shadow-2xl shadow-black/80 transition-all">
                <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 border-amber-400/25 shadow-2xl bg-zinc-900/90">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 text-sm font-black shadow-inner">
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider block">
                          Ingreso de Vehículo
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] bg-amber-400/15 text-amber-400 border border-amber-400/30 px-3 py-1 rounded-full font-black flex items-center gap-1.5 shadow-sm">
                        <DollarSign className="w-3 h-3 text-amber-400" />
                        Tarifa: {formatCLP(tariff.base_fee)} / 1ra hora
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative flex items-center group">
                      <CarFront className="absolute left-4 w-5 h-5 text-zinc-500 group-focus-within:text-amber-400 transition-colors pointer-events-none" />
                      <input
                        value={plateInput}
                        onChange={e => { setPlateInput(formatPlate(e.target.value)); setError('') }}
                        onKeyDown={e => e.key === 'Enter' && addVehicle()}
                        placeholder="INGRESAR PATENTE (EJ: ABCD12)"
                        maxLength={7}
                        autoFocus
                        style={{ paddingLeft: '3.25rem' }}
                        className="w-full bg-black/60 border-2 border-white/15 focus:border-amber-400 rounded-2xl pr-10 py-3.5 text-white text-lg sm:text-xl font-mono font-black tracking-widest placeholder:font-sans placeholder:font-bold placeholder:tracking-normal placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all uppercase shadow-inner"
                      />
                      {plateInput && (
                        <button
                          type="button"
                          onClick={() => setPlateInput('')}
                          className="absolute right-3 text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={addVehicle}
                      disabled={loadingAdd || !plateInput.trim()}
                      className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/25 active:scale-[0.98] text-sm sm:text-base whitespace-nowrap cursor-pointer"
                    >
                      {loadingAdd ? (
                        <span className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-5 h-5 stroke-[3]" />
                          <span>Registrar Ingreso</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Monthly Visits Live Balloon when typing a Plate */}
                  {plateInput.length >= 4 && (() => {
                    const typedVisits = monthlyVisitsByPlate[plateInput.toUpperCase()] || 0
                    const threshold = tariff.frequent_threshold || 10
                    const isTypedLoyal = (tariff.frequent_benefit_enabled !== false) && typedVisits >= threshold
                    if (typedVisits === 0) return null

                    return (
                      <div className="flex items-center gap-2 animate-fade-in">
                        <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md ${
                          isTypedLoyal
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-amber-500/20 animate-subtle-pulse'
                            : typedVisits >= 3
                              ? 'bg-purple-500/20 border border-purple-400/40 text-purple-300'
                              : 'bg-white/10 border border-white/15 text-zinc-300'
                        }`}>
                          {isTypedLoyal ? '👑' : typedVisits >= 3 ? '⭐' : '🚗'}
                          <span>Patente con {typedVisits} {typedVisits === 1 ? 'ingreso registrado' : 'ingresos registrados'} en los últimos 30 días</span>
                          {isTypedLoyal && (
                            <span className="underline ml-1 font-extrabold">¡Aplica Beneficio de Cliente Frecuente!</span>
                          )}
                        </span>
                      </div>
                    )
                  })()}

                  {error && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 animate-shake">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION 2: SCROLLABLE ACTIVE VEHICLES SECTION */}
              <section className="flex flex-col gap-3.5">
                {/* Search Bar - Prominent & Big for Mobile and Desktop */}
                <div className="flex flex-col gap-2.5">
                  <div className="relative flex items-center w-full group">
                    <Search className="absolute left-4 w-5 h-5 text-amber-400 pointer-events-none group-focus-within:scale-110 transition-transform" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(formatPlate(e.target.value))}
                      placeholder="BUSCAR O FILTRAR PATENTE..."
                      className="w-full bg-black/70 border-2 border-white/20 focus:border-amber-400 rounded-2xl pl-12 pr-12 py-3.5 sm:py-4 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all uppercase placeholder:normal-case placeholder:text-zinc-500 font-mono font-black tracking-widest placeholder:font-sans placeholder:font-bold placeholder:tracking-normal shadow-lg"
                    />
                    {searchQuery ? (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 text-zinc-400 hover:text-white p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                        title="Limpiar búsqueda"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="absolute right-4 text-xs font-black text-zinc-500 uppercase tracking-wider hidden sm:block">
                        {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Subheader info line */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">Vehículos Estacionados</span>
                      <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {vehicles.length} activo{vehicles.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {searchQuery && (
                      <span className="text-xs text-amber-400 font-bold">
                        Mostrando {filteredVehicles.length} de {vehicles.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Vehicles Scrollable List Container */}
                <div className="overflow-y-auto custom-scrollbar max-h-[calc(100vh-360px)] sm:max-h-[calc(100vh-340px)] pr-1 pb-16">
                  {vehicles.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 sm:p-16 text-center border-dashed border-white/10 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-3xl mb-4 shadow-lg shadow-amber-500/10">
                        🅿️
                      </div>
                      <p className="text-lg font-black text-white mb-1">Sin vehículos en el estacionamiento</p>
                      <p className="text-xs sm:text-sm text-zinc-400 max-w-sm">
                        Ingresa una patente en la sección superior para registrar la entrada e iniciar el cronómetro de estadía.
                      </p>
                    </div>
                  ) : filteredVehicles.length === 0 ? (
                    <div className="glass-card rounded-3xl p-10 text-center border-dashed border-white/10 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-3">
                        🔍
                      </div>
                      <p className="font-black text-white mb-1 text-base">Sin coincidencias para "{searchQuery}"</p>
                      <p className="text-xs text-zinc-400 mb-4">No se encontró ningún vehículo activo con esa patente.</p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                      >
                        Limpiar Búsqueda
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredVehicles.map(v => (
                        <VehicleCard
                          key={v.id}
                          vehicle={v}
                          tariff={tariff}
                          monthlyVisits={monthlyVisitsByPlate[v.plate.toUpperCase()] || 1}
                          onCheckout={openCheckout}
                          onDelete={setDeletingVehicle}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )
        })()}

        {/* ── DASHBOARD TAB ── */}
        {tab === 'dashboard' && profile.role === 'admin' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { l: 'Vehículos Históricos', v: transactions.length, icon: CarFront, color: 'amber' },
                { l: 'Hora Pico', v: peakHour.count > 0 ? peakHour.hour : 'N/A', icon: Clock, color: 'sky' },
                { l: 'Día Más Activo', v: peakDay.count > 0 ? peakDay.day : 'N/A', icon: TrendingUp, color: 'orange' },
                { l: 'Ingresos Totales', v: formatCLP(transactions.reduce((s, t) => s + t.fee, 0)), icon: DollarSign, color: 'emerald' },
              ].map(({ l, v, icon: Icon, color }) => (
                <div key={l} className="glass-card rounded-2xl p-5 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 text-${color}-400`} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-white">{v}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{l}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="glass-card rounded-2xl p-5">
                <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">📈 Flujo por Hora</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={hourData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="hour" tick={{ fill: '#52525b', fontSize: 9 }} tickLine={false} interval={3} />
                    <YAxis tick={{ fill: '#52525b', fontSize: 9 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Bar dataKey="count" name="vehículos" radius={[3, 3, 0, 0]}>
                      {hourData.map((e, i) => <Cell key={i} fill={e.hour === peakHour.hour && peakHour.count > 0 ? '#fbbf24' : 'rgba(251,191,36,0.25)'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">💵 Ingresos por Día</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={dayData} margin={{ top: 5, right: 5, left: -5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="day" tick={{ fill: '#52525b', fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fill: '#52525b', fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="revenue" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── FINANCE TAB (INTERACTIVE CALENDAR & DAILY DRILL-DOWN) ── */}
        {tab === 'finance' && profile.role === 'admin' && (() => {
          // Precompute calendar and activity map for finance
          const activityMap: Record<string, {
            txCount: number
            revenue: number
            closures: ShiftClosure[]
            feeModifiedCount: number
            deletedCount: number
            auditEvents: AuditEvent[]
            transactions: Transaction[]
          }> = {}

          // Process transactions
          transactions.forEach(t => {
            const d = toISODateString(t.exit_at || t.created_at)
            if (!activityMap[d]) {
              activityMap[d] = { txCount: 0, revenue: 0, closures: [], feeModifiedCount: 0, deletedCount: 0, auditEvents: [], transactions: [] }
            }
            activityMap[d].txCount++
            activityMap[d].revenue += t.fee
            activityMap[d].transactions.push(t)
          })

          // Process closures
          closures.forEach(c => {
            const d = toISODateString(c.closed_at)
            if (!activityMap[d]) {
              activityMap[d] = { txCount: 0, revenue: 0, closures: [], feeModifiedCount: 0, deletedCount: 0, auditEvents: [], transactions: [] }
            }
            activityMap[d].closures.push(c)
          })

          // Process audit events
          auditEvents.forEach(a => {
            const d = toISODateString(a.created_at)
            if (!activityMap[d]) {
              activityMap[d] = { txCount: 0, revenue: 0, closures: [], feeModifiedCount: 0, deletedCount: 0, auditEvents: [], transactions: [] }
            }
            activityMap[d].auditEvents.push(a)
            if (a.event_type === 'fee_modified') activityMap[d].feeModifiedCount++
            if (a.event_type === 'vehicle_deleted') activityMap[d].deletedCount++
          })

          // Calendar calculation for current displayed month
          const calYear = calendarMonth.getFullYear()
          const calMonth = calendarMonth.getMonth()
          const monthTitle = calendarMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
          const capitalizedMonthTitle = monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1)

          const firstDayOfMonth = new Date(calYear, calMonth, 1)
          const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7 // Monday = 0
          const daysInCurrentMonth = new Date(calYear, calMonth + 1, 0).getDate()

          const prevMonthDays = new Date(calYear, calMonth, 0).getDate()

          // Navigation handlers
          const prevMonth = () => setCalendarMonth(new Date(calYear, calMonth - 1, 1))
          const nextMonth = () => setCalendarMonth(new Date(calYear, calMonth + 1, 1))
          const gotoToday = () => {
            const now = new Date()
            setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1))
            setSelectedDayStr(toISODateString(now))
          }

          // Data for selected day
          const selectedDayData = selectedDayStr ? activityMap[selectedDayStr] || {
            txCount: 0,
            revenue: 0,
            closures: [],
            feeModifiedCount: 0,
            deletedCount: 0,
            auditEvents: [],
            transactions: []
          } : null

          const todayStr = toISODateString(new Date())

          return (
            <div className="flex flex-col gap-6 animate-fade-in w-full">
              {/* Top Overview & Shift Closure CTA */}
              <div className="glass-card rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4 border border-white/10 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 font-black text-xl shadow-md">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Arqueo y Finanzas</h3>
                    <p className="text-xs text-zinc-400">Auditoría diaria, calendario de actividad y registros históricos</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setClosureOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/15 hover:from-emerald-500/30 hover:to-emerald-600/25 border border-emerald-500/40 text-emerald-400 font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Realizar Cierre de Turno</span>
                  </button>
                </div>
              </div>

              {/* ── INTERACTIVE CALENDAR CARD ── */}
              <div className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col gap-5 border border-white/10 shadow-2xl bg-zinc-900/80">
                {/* Calendar Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base sm:text-lg">
                        {capitalizedMonthTitle}
                      </h4>
                      <p className="text-xs text-zinc-400">Selecciona un día para ver su desglose completo</p>
                    </div>
                  </div>

                  {/* Month Navigation & Legend */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={prevMonth}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                      title="Mes anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={gotoToday}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer"
                    >
                      Hoy
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                      title="Mes siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Calendar Indicators Legend */}
                <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 flex-wrap bg-black/30 px-4 py-2 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                    <span>Días con ingresos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span>Cierre de caja</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                    <span>Incidencias / Auditoría</span>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="w-full">
                  {/* Weekday headers (Lun - Dom) */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                      <div key={d} className="text-[11px] font-black text-zinc-500 uppercase tracking-wider py-1">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Day cells */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {/* Previous month trailing days */}
                    {Array.from({ length: startDayOffset }).map((_, i) => {
                      const dayNum = prevMonthDays - startDayOffset + i + 1
                      return (
                        <div
                          key={`prev-${i}`}
                          className="min-h-[64px] sm:min-h-[76px] p-2 rounded-2xl bg-black/10 border border-white/3 opacity-30 flex flex-col justify-between"
                        >
                          <span className="text-xs font-bold text-zinc-600 font-mono">{dayNum}</span>
                        </div>
                      )
                    })}

                    {/* Current month days */}
                    {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                      const dayNum = i + 1
                      const dayStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                      const dayData = activityMap[dayStr]
                      const hasRecords = dayData && (dayData.txCount > 0 || dayData.closures.length > 0 || dayData.auditEvents.length > 0)
                      const isSelected = selectedDayStr === dayStr
                      const isToday = dayStr === todayStr

                      return (
                        <button
                          key={dayStr}
                          type="button"
                          onClick={() => setSelectedDayStr(dayStr)}
                          className={`min-h-[64px] sm:min-h-[76px] p-2 sm:p-2.5 rounded-2xl flex flex-col justify-between text-left transition-all duration-200 cursor-pointer relative group ${
                            isSelected
                              ? 'bg-amber-400 text-black border-2 border-amber-300 ring-2 ring-amber-400/40 shadow-xl shadow-amber-500/25 scale-[1.03] z-10'
                              : hasRecords
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 border-2 border-amber-400/40 text-amber-300 shadow-md hover:border-amber-400'
                                : 'bg-black/30 hover:bg-white/5 border border-white/5 text-zinc-400 hover:text-white'
                          } ${isToday && !isSelected ? 'ring-1.5 ring-sky-400/70' : ''}`}
                        >
                          {/* Top Row: Day Number + Status Dots */}
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-xs sm:text-sm font-black font-mono ${
                              isSelected ? 'text-black' : hasRecords ? 'text-white' : 'text-zinc-400'
                            }`}>
                              {dayNum}
                            </span>

                            {/* Activity Badges */}
                            <div className="flex items-center gap-1">
                              {dayData?.closures.length ? (
                                <span className={`text-[9px] ${isSelected ? 'text-black' : 'text-emerald-400'}`} title="Cierre de caja registrado">
                                  🔒
                                </span>
                              ) : null}
                              {(dayData?.feeModifiedCount || 0) + (dayData?.deletedCount || 0) > 0 ? (
                                <span className={`text-[9px] ${isSelected ? 'text-black' : 'text-orange-400'}`} title="Modificaciones o eliminaciones">
                                  ⚠️
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* Bottom Row: Revenue or Tx count */}
                          {hasRecords && (
                            <div className="mt-1">
                              <span className={`text-[10px] sm:text-xs font-black font-mono block leading-tight truncate ${
                                isSelected ? 'text-black font-extrabold' : 'text-amber-400'
                              }`}>
                                {formatCLP(dayData.revenue)}
                              </span>
                              <span className={`text-[9px] font-bold block truncate leading-none mt-0.5 ${
                                isSelected ? 'text-black/80' : 'text-zinc-500'
                              }`}>
                                {dayData.txCount} auto{dayData.txCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* ── SELECTED DAY DRILL-DOWN (DESGLOSE DEL DÍA) ── */}
              {selectedDayStr && (
                <div className="glass-card rounded-3xl p-5 sm:p-7 flex flex-col gap-6 border border-white/10 shadow-2xl bg-zinc-900/90 animate-scale-up">
                  {/* Selected Day Title & Date Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-black text-xl shadow-md">
                        📅
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                          Detalle y Movimientos del Día
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-white capitalize">
                          {formatFullDate(new Date(selectedDayStr + 'T12:00:00'))}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-zinc-300 font-bold">
                        {selectedDayStr}
                      </span>
                    </div>
                  </div>

                  {/* 4 KPI Summary Cards for Selected Day */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between gap-1 shadow-inner">
                      <span className="text-[10px] font-extrabold text-amber-400/90 uppercase tracking-wider flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Total Recaudado
                      </span>
                      <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                        {formatCLP(selectedDayData?.revenue || 0)}
                      </span>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-1 shadow-inner">
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                        <CarFront className="w-3.5 h-3.5 text-sky-400" /> Autos Procesados
                      </span>
                      <span className="text-2xl font-black text-white font-mono">
                        {selectedDayData?.txCount || 0}
                      </span>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-1 shadow-inner">
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Tarifas Modificadas
                      </span>
                      <span className="text-2xl font-black text-amber-400 font-mono">
                        {selectedDayData?.feeModifiedCount || 0}
                      </span>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-1 shadow-inner">
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" /> Autos Eliminados
                      </span>
                      <span className="text-2xl font-black text-red-400 font-mono">
                        {selectedDayData?.deletedCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* ── CIERRES DE CAJA DEL DÍA ── */}
                  {selectedDayData && selectedDayData.closures.length > 0 && (
                    <div className="flex flex-col gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🔒</span>
                          <h4 className="font-black text-white text-sm uppercase tracking-wide">
                            Cierres de Caja Registrados ({selectedDayData.closures.length})
                          </h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                        {selectedDayData.closures.map(closure => (
                          <div key={closure.id} className="bg-black/50 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between gap-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-zinc-400">
                                Hora: {formatTime(closure.closed_at)}
                              </span>
                              <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                                Recaudado: {formatCLP(closure.total_revenue)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
                              <div>Vehículos: <strong className="text-white font-mono">{closure.total_vehicles}</strong></div>
                              <div>Promedio: <strong className="text-amber-400 font-mono">{formatCLP(closure.avg_fee)}</strong></div>
                            </div>

                            <button
                              onClick={() => setViewingClosureReceipt(closure)}
                              className="w-full flex items-center justify-center gap-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-black py-2 rounded-lg text-xs transition-all cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Ver Comprobante / Recibo Completo</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── DESGLOSE DE MOVIMIENTOS Y TRANSACCIONES ── */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-white text-sm uppercase tracking-wide flex items-center gap-2">
                        <span>🚗</span> Registro de Cobros y Vehículos ({selectedDayData?.transactions.length || 0})
                      </h4>
                    </div>

                    <div className="glass-card rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-black/40 border-b border-white/10">
                              {['Patente', 'Ingreso', 'Salida', 'Duración', 'Pago', 'Total Cobrado'].map(h => (
                                <th key={h} className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {selectedDayData && selectedDayData.transactions.length > 0 ? (
                              selectedDayData.transactions.map(t => (
                                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="px-4 py-3 font-mono font-black text-white text-sm">
                                    <span className="plate-badge px-2.5 py-1 rounded-lg border border-white/15">
                                      {t.plate}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-xs text-zinc-300 font-mono">{formatTime(t.entry_at)}</td>
                                  <td className="px-4 py-3 text-xs text-zinc-300 font-mono">{formatTime(t.exit_at)}</td>
                                  <td className="px-4 py-3 text-xs text-zinc-300 font-mono">{formatElapsed(new Date(t.exit_at).getTime() - new Date(t.entry_at).getTime())}</td>
                                  <td className="px-4 py-3 text-xs">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.payment_method === 'tarjeta'
                                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                      : t.payment_method === 'transferencia'
                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                      {t.payment_method === 'transferencia' ? 'Transfer' : t.payment_method === 'tarjeta' ? 'Tarjeta' : 'Efectivo'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm font-black text-amber-400 font-mono">{formatCLP(t.fee)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-zinc-500 text-xs font-semibold">
                                  Sin cobros de vehículos registrados en esta fecha.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* ── DESGLOSE DE AUDITORÍA E INCIDENCIAS DEL DÍA ── */}
                  <div className="flex flex-col gap-3">
                    <h4 className="font-black text-white text-sm uppercase tracking-wide flex items-center gap-2">
                      <span>⚠️</span> Auditoría e Incidencias del Día ({selectedDayData?.auditEvents.length || 0})
                    </h4>

                    {selectedDayData && selectedDayData.auditEvents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedDayData.auditEvents.map(audit => (
                          <div
                            key={audit.id}
                            className={`rounded-xl p-3.5 border ${
                              audit.event_type === 'fee_modified'
                                ? 'bg-amber-500/5 border-amber-500/25'
                                : 'bg-red-500/5 border-red-500/25'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                audit.event_type === 'fee_modified'
                                  ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
                                  : 'bg-red-500/15 text-red-400 border border-red-500/30'
                              }`}>
                                {audit.event_type === 'fee_modified' ? 'Tarifa Modificada' : 'Vehículo Eliminado'}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {formatTime(audit.created_at)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-black text-white text-sm">
                                Patente: {audit.plate}
                              </span>
                              {audit.event_type === 'fee_modified' && (
                                <span className="text-xs text-amber-400 font-bold font-mono">
                                  {formatCLP(audit.original_value)} ➔ {formatCLP(audit.new_value)}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-zinc-300 bg-black/40 p-2 rounded-lg border border-white/5 mt-1">
                              <strong className="text-zinc-500">Motivo:</strong> {audit.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 text-center text-zinc-500 text-xs">
                        ✓ Sin incidencias ni modificaciones registradas en este día.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* ── SETTINGS TAB (admin only) ── */}
        {tab === 'settings' && profile.role === 'admin' && (
          <div className="max-w-lg mx-auto animate-fade-in">
            <div className="glass-card rounded-2xl p-7 flex flex-col gap-6">
              <h3 className="font-black text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" /> Configuración de Tarifas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Tarifa Tramo Inicial', key: 'base_fee', suffix: 'CLP', prefix: '$' },
                  { label: 'Tiempo Tramo Inicial', key: 'base_minutes', suffix: 'min' },
                  { label: 'Tarifa Adicional', key: 'additional_fee', suffix: 'CLP', prefix: '$' },
                  { label: 'Bloque Adicional', key: 'additional_minutes', suffix: 'min' },
                ].map(({ label, key, suffix, prefix }) => (
                  <div key={key} className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</label>
                    <div className="relative flex items-center">
                      {prefix && <span className="absolute left-3 text-zinc-500 text-sm font-bold">{prefix}</span>}
                      <input
                        type="number" min={0}
                        value={tariff[key as keyof Tariff] as number}
                        onChange={e => setTariff({ ...tariff, [key]: Number(e.target.value) })}
                        className={`w-full bg-black/30 border border-white/10 rounded-xl py-2.5 text-white text-sm font-bold focus:outline-none focus:border-amber-400/60 transition-all ${prefix ? 'pl-7 pr-12' : 'px-3 pr-12'}`}
                      />
                      <span className="absolute right-3 text-zinc-600 text-xs">{suffix}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                {tariffSaved && (
                  <span className="text-sm text-emerald-400 font-semibold flex items-center gap-1.5 animate-fade-in">
                    ✓ Tarifas guardadas
                  </span>
                )}
                <button onClick={() => saveTariff(tariff)} disabled={savingTariff}
                  className="ml-auto flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-black font-black px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20">
                  {savingTariff ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : null}
                  💾 Guardar Tarifas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── BENEFITS TAB (LOYALTY PROGRAM & CONFIGURATION) ── */}
        {tab === 'benefits' && profile.role === 'admin' && (
          <BenefitsTab
            tariff={tariff}
            saveTariff={saveTariff}
            savingTariff={savingTariff}
            tariffSaved={tariffSaved}
            frequentClientsList={frequentClientsList}
          />
        )}

        {/* ── USERS TAB (admin only) ── */}
        {tab === 'users' && profile.role === 'admin' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Header / Actions card */}
            <div className="glass-card rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" /> Control de Usuarios
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Crea y gestiona las cuentas de los operadores de tu estacionamiento</p>
              </div>
              <button onClick={() => setAddUserOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black px-5 py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20">
                <Plus className="w-4 h-4" /> Agregar Usuario
              </button>
            </div>

            {/* Grid of Users */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map(u => (
                <div key={u.id} className="glass-card rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden group">
                  {/* Decorative background aura for admin role */}
                  {u.role === 'admin' && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                  )}
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm select-none ${u.role === 'admin'
                        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {u.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm leading-tight">{u.full_name}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${u.role === 'admin'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-sky-500/10 text-sky-400 border-sky-500/20'}`}>
                        {u.role === 'admin' ? 'Administrador' : 'Operador'}
                      </span>
                      {u.id === profile.id && (
                        <span className="text-[10px] font-bold bg-white/5 text-zinc-400 border border-white/10 px-2.5 py-1 rounded-full">
                          Tú
                        </span>
                      )}
                    </div>
                    
                    {u.id !== profile.id && (
                      <button onClick={() => handleDeleteUser(u.id)}
                        className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                        title="Eliminar usuario">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer inside Main Content */}
        <footer className="w-full mt-12 pt-6 border-t border-white/5 text-center text-xs text-zinc-500">
          ParkControl SaaS · {profile.org_name} · {new Date().getFullYear()}
        </footer>
      </div>
    </main>

      {/* Modals */}
      {checkout && (
        <CheckoutModal
          {...checkout}
          role={profile.role}
          orgId={orgId}
          monthlyVisits={monthlyVisitsByPlate[checkout.vehicle.plate.toUpperCase()] || 1}
          tariff={tariff}
          onConfirm={confirmCheckout}
          onClose={() => setCheckout(null)}
        />
      )}
      {closureOpen && (
        <ShiftClosureModal
          transactions={transactions.filter(t => !t.closure_id)}
          auditEvents={auditEvents}
          onConfirm={closeClosure}
          onClose={() => setClosureOpen(false)}
        />
      )}
      {deletingVehicle && (
        <ActionAuthModal
          title="Eliminar Vehículo Erróneo"
          description={`¿Estás seguro de que deseas eliminar el ingreso de la patente ${deletingVehicle.plate}? Esta acción es irreversible y se registrará en la auditoría del turno.`}
          role={profile.role}
          orgId={orgId}
          onConfirm={executeDeleteVehicle}
          onClose={() => setDeletingVehicle(null)}
        />
      )}

      {addUserOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="glass-card rounded-2xl w-full max-w-md animate-scale-up overflow-hidden my-auto">
            <div className="bg-gradient-to-r from-amber-500/10 to-transparent p-6 border-b border-white/5 flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <div>
                <h2 className="font-black text-white">Agregar Nuevo Usuario</h2>
                <p className="text-xs text-zinc-500">Crea un operador o administrador para tu estacionamiento</p>
              </div>
              <button onClick={() => setAddUserOpen(false)} className="ml-auto text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Nombre Completo</label>
                <input
                  type="text" required
                  placeholder="Ej: Juan Pérez"
                  value={newUserFullName}
                  onChange={e => setNewUserFullName(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-amber-400/60 transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Correo Electrónico</label>
                <input
                  type="email" required
                  placeholder="Ej: juan@estacionamiento.com"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-amber-400/60 transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Contraseña (Mín. 6 caracteres)</label>
                <input
                  type="password" required minLength={6}
                  placeholder="••••••••"
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-amber-400/60 transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Rol en el Estacionamiento</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as 'operator' | 'admin')}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-amber-400/60 transition-all cursor-pointer"
                >
                  <option value="operator">Operador (Solo registra ingresos y cobros)</option>
                  <option value="admin">Administrador (Acceso total, finanzas, tarifas, usuarios)</option>
                </select>
              </div>

              {createUserError && (
                <div className="flex items-center gap-2 mt-1 text-sm text-red-400 animate-shake">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {createUserError}
                </div>
              )}

              <div className="flex gap-3 border-t border-white/5 pt-4 mt-2">
                <button type="button" onClick={() => setAddUserOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 font-bold py-3 rounded-xl text-sm transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={loadingCreateUser}
                  className="flex-[1.5] flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50">
                  {loadingCreateUser ? (
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : '✓ Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingClosureReceipt && (
        <ViewingClosureReceiptModal
          closure={viewingClosureReceipt}
          onClose={() => setViewingClosureReceipt(null)}
        />
      )}
    </div>
  )
}
