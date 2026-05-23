'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tariff, Vehicle, Transaction, AuditEvent } from '@/lib/types'
import { calcFee, formatCLP, formatElapsed, formatTime, formatDate, formatPlate } from '@/lib/utils'
import {
  CarFront, BarChart3, DollarSign, Settings, LogOut, Plus,
  Clock, TrendingUp, Users, ChevronRight, AlertCircle, X, Download, MessageCircle,
  Search, Trash2
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


// ─── Vehicle Card ────────────────────────────────────────────────────────────
function VehicleCard({ vehicle, tariff, onCheckout, onDelete }: {
  vehicle: Vehicle; tariff: Tariff; onCheckout: (v: Vehicle, elapsed: number, fee: number) => void; onDelete: (v: Vehicle) => void
}) {
  const [elapsed, setElapsed] = useState(Date.now() - new Date(vehicle.entry_at).getTime())
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - new Date(vehicle.entry_at).getTime()), 1000)
    return () => clearInterval(id)
  }, [vehicle.entry_at])

  const fee = calcFee(elapsed, tariff)
  const mins = elapsed / 60000
  const isOver = mins > tariff.base_minutes

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-lg text-white tracking-wider bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">
            {vehicle.plate}
          </span>
          <button
            onClick={() => onDelete(vehicle)}
            className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all"
            title="Eliminar ingreso erróneo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${isOver
          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 animate-subtle-pulse'
          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {isOver ? 'Tiempo Extra' : 'En Curso'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-black/20 rounded-xl p-3 border border-white/5">
        <div>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Tiempo</p>
          <p className="text-sm font-bold text-white">{formatElapsed(elapsed)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Ingreso</p>
          <p className="text-sm font-bold text-zinc-300 font-mono">{formatTime(vehicle.entry_at)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Cobro</p>
          <p className="text-sm font-bold text-amber-400">{formatCLP(fee)}</p>
        </div>
      </div>

      <button onClick={() => onCheckout(vehicle, elapsed, fee)}
        className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white hover:text-black border border-white/10 text-white font-bold text-sm py-3 rounded-xl transition-all duration-200">
        Finalizar y Cobrar <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Checkout Modal ───────────────────────────────────────────────────────────
function CheckoutModal({ vehicle, elapsed, fee, role, orgId, onConfirm, onClose }: {
  vehicle: Vehicle
  elapsed: number
  fee: number
  role: string
  orgId: string
  onConfirm: (paymentMethod: string, finalFee: number, reason?: string) => Promise<void>
  onClose: () => void
}) {
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo')
  const [modifiedFee, setModifiedFee] = useState<number>(fee)
  const [isEditingFee, setIsEditingFee] = useState(false)
  const [reason, setReason] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-sm animate-scale-up overflow-hidden my-auto">
        <div className="bg-gradient-to-r from-amber-500/10 to-transparent p-6 border-b border-white/5 flex items-center gap-3">
          <span className="text-2xl">🏁</span>
          <div>
            <h2 className="font-black text-white">Finalizar Estadía</h2>
            <p className="text-xs text-zinc-500">Confirma el cobro</p>
          </div>
          <button onClick={onClose} disabled={loading} className="ml-auto text-zinc-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="bg-black/30 border border-dashed border-white/10 rounded-xl p-4 flex flex-col gap-2.5">
            {[
              { l: 'Patente', v: vehicle.plate, mono: true },
              { l: 'Fecha', v: formatDate(vehicle.entry_at) },
              { l: 'Hora Ingreso', v: formatTime(vehicle.entry_at) },
              { l: 'Hora Salida', v: formatTime(Date.now()) },
              { l: 'Tiempo Total', v: formatElapsed(elapsed) },
            ].map(({ l, v, mono }) => (
              <div key={l} className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">{l}</span>
                <span className={`text-sm font-bold text-white ${mono ? 'font-mono' : ''}`}>{v}</span>
              </div>
            ))}
            
            <div className="border-t border-dashed border-white/10 pt-2.5 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Total a Pagar</span>
                <div className="flex items-center gap-2">
                  {isEditingFee ? (
                    <div className="relative flex items-center">
                      <span className="absolute left-2 text-zinc-500 text-xs font-bold">$</span>
                      <input
                        type="number"
                        min={0}
                        value={modifiedFee}
                        onChange={e => {
                          setModifiedFee(Number(e.target.value))
                          setError('')
                        }}
                        className="w-24 bg-black/40 border border-amber-400/50 rounded-lg pl-5 pr-1.5 py-1 text-right text-xs font-black text-amber-400 focus:outline-none transition-all animate-fade-in"
                      />
                    </div>
                  ) : (
                    <span className="text-2xl font-black text-amber-400">{formatCLP(modifiedFee)}</span>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingFee(!isEditingFee)
                      setError('')
                    }}
                    className="text-zinc-500 hover:text-white transition-colors p-1 rounded hover:bg-white/5 text-[10px] font-bold flex items-center gap-0.5 border border-white/5"
                  >
                    {isEditingFee ? '✓ Ok' : '✍️ Editar'}
                  </button>
                </div>
              </div>

              {/* If fee is modified, show reason input and admin password if operator */}
              {modifiedFee !== fee && (
                <div className="flex flex-col gap-2 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 mt-1 animate-fade-in">
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    ⚠️ Autorización por cambio de tarifa
                  </p>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Motivo del Ajuste (mín. 4 caracteres)</label>
                    <textarea
                      required
                      rows={2}
                      value={reason}
                      onChange={e => { setReason(e.target.value); setError('') }}
                      placeholder="Ej: Cobro manual acordado..."
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-400/50 transition-all placeholder:text-zinc-600 resize-none text-zinc-100"
                    />
                  </div>
                  
                  {role === 'operator' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Contraseña del Administrador</label>
                      <input
                        type="password"
                        required
                        value={adminPassword}
                        onChange={e => { setAdminPassword(e.target.value); setError('') }}
                        placeholder="Contraseña admin"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-400/50 transition-all placeholder:text-zinc-600 text-zinc-100"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Método de Pago</span>
            <div className="grid grid-cols-3 gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
              {[
                { id: 'efectivo', label: '💵 Efectivo' },
                { id: 'tarjeta', label: '💳 Tarjeta' },
                { id: 'transferencia', label: '📱 Transfer' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`py-2.5 px-1 rounded-lg text-xs font-black transition-all duration-200 ${paymentMethod === m.id
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/10'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 mt-1 text-xs text-red-400 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6">
          <button onClick={onClose} disabled={loading} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 font-bold py-3 rounded-xl text-sm transition-all order-2 sm:order-1">Cancelar</button>
          <button onClick={handleConfirm} disabled={loading} className="flex-[1.5] flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 order-1 sm:order-2">
            {loading ? (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : '✓ Confirmar Pago'}
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

// ─── Main Dashboard Client ────────────────────────────────────────────────────
export default function DashboardClient({ profile, tariff: initialTariff }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const orgId = profile.organization_id
  const [tab, setTab] = useState('parking')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [tariff, setTariff] = useState<Tariff>(initialTariff)
  const [plateInput, setPlateInput] = useState('')
  const [error, setError] = useState('')
  const [checkout, setCheckout] = useState<{ vehicle: Vehicle; elapsed: number; fee: number } | null>(null)
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null)
  const [closureOpen, setClosureOpen] = useState(false)
  const [txFilter, setTxFilter] = useState('shift')
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [savingTariff, setSavingTariff] = useState(false)
  const [tariffSaved, setTariffSaved] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])

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
    if (profile.role === 'admin' && results[3]) {
      setUsers(results[3].data || [])
    }
  }, [orgId, supabase, profile.role])

  useEffect(() => { loadData() }, [loadData])

  // Realtime subscription
  useEffect(() => {
    const ch = supabase.channel(`org-${orgId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles', filter: `organization_id=eq.${orgId}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `organization_id=eq.${orgId}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_events', filter: `organization_id=eq.${orgId}` }, loadData)
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
    await supabase.from('tariffs').update({
      base_fee: t.base_fee, base_minutes: t.base_minutes,
      additional_fee: t.additional_fee, additional_minutes: t.additional_minutes,
    }).eq('id', t.id)
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

  const tabs = [
    { id: 'parking', label: 'Estacionamiento', icon: CarFront },
    ...(profile.role === 'admin' ? [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'finance', label: 'Finanzas', icon: DollarSign },
      { id: 'users', label: 'Usuarios', icon: Users },
      { id: 'settings', label: 'Tarifas', icon: Settings },
    ] : []),
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-500/3 rounded-full blur-3xl" />
      </div>

      {/* Sticky Header & Nav Container */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center font-black text-black text-base shadow-lg shadow-amber-500/20">P</div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">{profile.org_name || 'ParkControl'}</p>
              <p className="text-[10px] text-zinc-500 capitalize">{profile.role === 'admin' ? 'Administrador' : 'Operador'} · {profile.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-white/3 border border-white/5 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
              EN VIVO · {vehicles.length} auto{vehicles.length !== 1 ? 's' : ''}
            </div>
            <button onClick={handleLogout} className="text-zinc-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Nav - Centered, Larger, Premium */}
        <nav className="flex justify-center gap-2 px-6 py-3.5 overflow-x-auto bg-black/20">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-base font-extrabold whitespace-nowrap transition-all duration-200 ${tab === id
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/25 scale-105'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
              <Icon className="w-5 h-5" />{label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-10 z-10 relative">

        {/* ── PARKING TAB ── */}
        {tab === 'parking' && (() => {
          const filteredVehicles = vehicles.filter(v =>
            v.plate.toUpperCase().includes(searchQuery.toUpperCase())
          )
          return (
            <div className="flex flex-col gap-8 animate-fade-in">
              {/* Input Card */}
              <div className="glass-card rounded-2xl p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📥</span>
                    <h3 className="text-sm font-black text-white tracking-wide uppercase">Registrar Ingreso</h3>
                  </div>
                  <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-3.5 py-1 rounded-full font-bold">
                    Tarifa: {formatCLP(tariff.base_fee)} / primera hora
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative flex items-center">
                    <CarFront className="absolute left-4 w-5 h-5 text-zinc-500" />
                    <input
                      value={plateInput}
                      onChange={e => { setPlateInput(formatPlate(e.target.value)); setError('') }}
                      onKeyDown={e => e.key === 'Enter' && addVehicle()}
                      placeholder="Ej: ABCD12"
                      maxLength={7}
                      autoFocus
                      style={{ paddingLeft: '3.25rem' }}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pr-4 py-4 text-white text-lg font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 transition-all uppercase"
                    />
                  </div>
                  <button onClick={addVehicle} disabled={loadingAdd}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-black font-black px-8 py-4 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm whitespace-nowrap">
                    {loadingAdd ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Plus className="w-5 h-5" />}
                    Registrar Vehículo
                  </button>
                </div>
                {error && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-red-400 animate-shake">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}
              </div>

              {/* Title & Search bar */}
              {vehicles.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    🚗 Vehículos Estacionados
                    <span className="bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-xs font-bold text-zinc-400">
                      {vehicles.length}
                    </span>
                  </h3>
                  
                  {/* Search Bar */}
                  <div className="relative flex items-center w-full sm:max-w-xs">
                    <Search className="absolute left-3 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(formatPlate(e.target.value))}
                      placeholder="Buscar patente..."
                      className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-sm text-white focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 transition-all uppercase placeholder:normal-case placeholder:text-zinc-600 font-semibold tracking-wider placeholder:font-normal placeholder:tracking-normal"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 text-zinc-500 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Vehicles grid */}
              {vehicles.length === 0 ? (
                <div className="glass-card rounded-2xl p-16 text-center border-dashed">
                  <p className="text-4xl mb-3">🅿️</p>
                  <p className="font-bold text-white mb-1">Sin vehículos activos</p>
                  <p className="text-sm text-zinc-500">Ingresa la patente arriba para iniciar la estadía</p>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center border-dashed">
                  <p className="text-3xl mb-3">🔍</p>
                  <p className="font-bold text-white mb-1">Sin resultados</p>
                  <p className="text-sm text-zinc-500">No encontramos ningún vehículo con la patente "{searchQuery}"</p>
                  <button onClick={() => setSearchQuery('')} className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all">
                    Limpiar Búsqueda
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVehicles.map(v => <VehicleCard key={v.id} vehicle={v} tariff={tariff} onCheckout={openCheckout} onDelete={setDeletingVehicle} />)}
                </div>
              )}
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

        {/* ── FINANCE TAB ── */}
        {tab === 'finance' && profile.role === 'admin' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            {/* Finance KPIs + actions */}
            <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { l: 'Ingresos Totales', v: formatCLP(total), c: 'text-amber-400' },
                  { l: 'Registros', v: String(filteredTx.length), c: 'text-white' },
                  { l: 'Ticket Promedio', v: formatCLP(avg), c: 'text-sky-400' },
                  { l: 'Ticket Máximo', v: formatCLP(maxFee), c: 'text-orange-400' },
                ].map(({ l, v, c }) => (
                  <div key={l} className="bg-black/20 border border-white/5 rounded-xl p-3">
                    <p className={`text-xl font-black ${c}`}>{v}</p>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between flex-wrap gap-3 border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                  {profile.role === 'admin' && (
                    <button onClick={() => setClosureOpen(true)}
                      className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold px-4 py-2 rounded-xl text-xs transition-all">
                      🔒 Cierre de Caja
                    </button>
                  )}
                </div>
                <div className="flex gap-1 bg-black/30 border border-white/10 rounded-xl p-1">
                  {[
                    { id: 'shift', l: 'Turno Activo' },
                    { id: 'today', l: 'Hoy' },
                    { id: 'week', l: 'Semana' },
                    { id: 'all', l: 'Historial Completo' }
                  ].map(f => (
                    <button key={f.id} onClick={() => setTxFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${txFilter === f.id ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                      {f.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Transactions table */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black/20 border-b border-white/5">
                      {['Patente', 'Fecha', 'Ingreso', 'Salida', 'Duración', 'Pago', 'Cobrado'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTx.map(t => (
                      <tr key={t.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-white text-sm">{t.plate}</td>
                        <td className="px-5 py-3.5 text-sm text-zinc-400">{formatDate(t.entry_at)}</td>
                        <td className="px-5 py-3.5 text-sm text-zinc-400">{formatTime(t.entry_at)}</td>
                        <td className="px-5 py-3.5 text-sm text-zinc-400">{formatTime(t.exit_at)}</td>
                        <td className="px-5 py-3.5 text-sm text-zinc-400">{formatElapsed(new Date(t.exit_at).getTime() - new Date(t.entry_at).getTime())}</td>
                        <td className="px-5 py-3.5 text-sm">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.payment_method === 'tarjeta'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : t.payment_method === 'transferencia'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                            {t.payment_method === 'transferencia' ? 'Transfer' : t.payment_method === 'tarjeta' ? 'Tarjeta' : 'Efectivo'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm font-bold text-amber-400">{formatCLP(t.fee)}</td>
                      </tr>
                    ))}
                    {filteredTx.length === 0 && (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-zinc-600 text-sm">Sin registros en este período.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

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
      </main>

      {/* Modals */}
      {checkout && (
        <CheckoutModal
          {...checkout}
          role={profile.role}
          orgId={orgId}
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

      <footer className="z-10 py-5 border-t border-white/5 text-center text-xs text-zinc-700">
        ParkControl SaaS · {profile.org_name} · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
