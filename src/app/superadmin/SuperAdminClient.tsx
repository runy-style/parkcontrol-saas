'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Building2, ShieldCheck, CarFront, DollarSign, Users, Search, Plus,
  ExternalLink, Settings, Power, RefreshCw, KeyRound,
  CheckCircle, X, LogOut, Filter, ShieldAlert, Trash2, AlertTriangle, Loader2,
  CreditCard, Calendar, Check, Gift
} from 'lucide-react'
import { formatCLP, formatDate } from '@/lib/utils'
import { calculateBillingStatus } from '@/lib/billing'
import { PlanType, SubscriptionPayment } from '@/lib/types'
import {
  SuperAdminData, SuperAdminParking,
  toggleOrganizationStatusAction,
  updateParkingTariffAction,
  createParkingOrganizationAction,
  createParkingUserAction,
  resetParkingUserPasswordAction,
  getSuperAdminDataAction,
  setSupportModeOrgAction,
  deleteParkingOrganizationAction,
  recordManualPaymentAction,
  setLifetimeLicenseAction,
  extendGracePeriodAction,
  updateSubscriptionSettingsAction,
  getSubscriptionPaymentsAction
} from './actions'

interface Props {
  initialData: SuperAdminData
  currentUserEmail: string
  currentUserName: string
}

export default function SuperAdminClient({ initialData, currentUserEmail, currentUserName }: Props) {
  const router = useRouter()
  const [data, setData] = useState<SuperAdminData>(initialData)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const [isPending, startTransition] = useTransition()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modals state
  const [createOrgOpen, setCreateOrgOpen] = useState(false)
  const [editingTariffParking, setEditingTariffParking] = useState<SuperAdminParking | null>(null)
  const [managingUsersParking, setManagingUsersParking] = useState<SuperAdminParking | null>(null)
  const [deletingParking, setDeletingParking] = useState<SuperAdminParking | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState('')

  // Modals state: Facturación y Cobros
  const [managingBillingParking, setManagingBillingParking] = useState<SuperAdminParking | null>(null)
  const [billingTab, setBillingTab] = useState<'payment' | 'settings' | 'history'>('payment')
  const [billingPaymentMonths, setBillingPaymentMonths] = useState(1)
  const [billingPaymentAmount, setBillingPaymentAmount] = useState(25000)
  const [billingPaymentMethod, setBillingPaymentMethod] = useState('transferencia')
  const [billingPaymentNotes, setBillingPaymentNotes] = useState('')
  const [billingPlanType, setBillingPlanType] = useState<PlanType>('monthly')
  const [billingPriceSetting, setBillingPriceSetting] = useState(25000)
  const [billingGraceSetting, setBillingGraceSetting] = useState(3)
  const [billingPaymentsHistory, setBillingPaymentsHistory] = useState<SubscriptionPayment[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [billingActionError, setBillingActionError] = useState('')

  // Form states: Create Organization
  const [newOrgName, setNewOrgName] = useState('')
  const [newAdminName, setNewAdminName] = useState('')
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [newBaseFee, setNewBaseFee] = useState(1200)
  const [newBaseMinutes, setNewBaseMinutes] = useState(60)
  const [newAddFee, setNewAddFee] = useState(300)
  const [newAddMinutes, setNewAddMinutes] = useState(15)
  const [newMaxFee, setNewMaxFee] = useState<number | ''>('')
  const [createOrgError, setCreateOrgError] = useState('')

  // Form states: Edit Tariff
  const [editBaseFee, setEditBaseFee] = useState(1200)
  const [editBaseMinutes, setEditBaseMinutes] = useState(60)
  const [editAddFee, setEditAddFee] = useState(300)
  const [editAddMinutes, setEditAddMinutes] = useState(15)
  const [editMaxFee, setEditMaxFee] = useState<number | ''>('')
  const [editTariffError, setEditTariffError] = useState('')

  // Form states: Add User for parking
  const [addUserEmail, setAddUserEmail] = useState('')
  const [addUserPassword, setAddUserPassword] = useState('')
  const [addUserFullName, setAddUserFullName] = useState('')
  const [addUserRole, setAddUserRole] = useState<'admin' | 'operator'>('operator')
  const [addUserError, setAddUserError] = useState('')

  // Form states: Reset password for parking user
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [newPasswordVal, setNewPasswordVal] = useState('')
  const [resetError, setResetError] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const reloadData = async () => {
    const res = await getSuperAdminDataAction()
    if (res.data) setData(res.data)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Toggle Organization active/inactive
  const handleToggleStatus = (parking: SuperAdminParking) => {
    const newStatus = !parking.is_active
    const confirmMsg = newStatus
      ? `¿Reactivar el estacionamiento "${parking.name}"? Los usuarios podrán volver a ingresar.`
      : `¿Suspender el estacionamiento "${parking.name}"? El acceso quedará bloqueado temporalmente.`

    if (!confirm(confirmMsg)) return

    startTransition(async () => {
      const res = await toggleOrganizationStatusAction(parking.id, newStatus)
      if (res.error) {
        alert(`Error: ${res.error}`)
      } else {
        showToast(`Estacionamiento ${newStatus ? 'reactivado' : 'suspendido'} con éxito.`)
        await reloadData()
      }
    })
  }

  // Open Edit Tariff Modal
  const openEditTariff = (p: SuperAdminParking) => {
    setEditingTariffParking(p)
    setEditBaseFee(p.tariff?.base_fee || 1200)
    setEditBaseMinutes(p.tariff?.base_minutes || 60)
    setEditAddFee(p.tariff?.additional_fee || 300)
    setEditAddMinutes(p.tariff?.additional_minutes || 15)
    setEditMaxFee(p.tariff?.max_fee || '')
    setEditTariffError('')
  }

  const handleSaveTariff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTariffParking) return
    setEditTariffError('')

    startTransition(async () => {
      const res = await updateParkingTariffAction(editingTariffParking.id, {
        base_fee: Number(editBaseFee),
        base_minutes: Number(editBaseMinutes),
        additional_fee: Number(editAddFee),
        additional_minutes: Number(editAddMinutes),
        max_fee: editMaxFee !== '' && Number(editMaxFee) > 0 ? Number(editMaxFee) : null,
      })

      if (res.error) {
        setEditTariffError(res.error)
      } else {
        showToast(`Tarifas de "${editingTariffParking.name}" actualizadas correctamente.`)
        setEditingTariffParking(null)
        await reloadData()
      }
    })
  }

  // Create new parking organization
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateOrgError('')
    if (!newOrgName.trim() || !newAdminEmail.trim() || !newAdminPassword.trim() || !newAdminName.trim()) {
      setCreateOrgError('Por favor completa todos los campos obligatorios.')
      return
    }

    startTransition(async () => {
      const res = await createParkingOrganizationAction({
        name: newOrgName,
        adminName: newAdminName,
        adminEmail: newAdminEmail,
        adminPassword: newAdminPassword,
        baseFee: Number(newBaseFee),
        baseMinutes: Number(newBaseMinutes),
        additionalFee: Number(newAddFee),
        additionalMinutes: Number(newAddMinutes),
        maxFee: newMaxFee !== '' && Number(newMaxFee) > 0 ? Number(newMaxFee) : null,
      })

      if (res.error) {
        setCreateOrgError(res.error)
      } else {
        showToast(`¡Estacionamiento "${newOrgName}" creado con éxito!`)
        setCreateOrgOpen(false)
        setNewOrgName('')
        setNewAdminName('')
        setNewAdminEmail('')
        setNewAdminPassword('')
        setNewMaxFee('')
        await reloadData()
      }
    })
  }

  // Add user to parking
  const handleAddParkingUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!managingUsersParking) return
    setAddUserError('')

    if (!addUserEmail.trim() || !addUserPassword.trim() || !addUserFullName.trim()) {
      setAddUserError('Completa todos los campos del usuario.')
      return
    }

    startTransition(async () => {
      const res = await createParkingUserAction(managingUsersParking.id, {
        email: addUserEmail,
        password: addUserPassword,
        fullName: addUserFullName,
        role: addUserRole,
      })

      if (res.error) {
        setAddUserError(res.error)
      } else {
        showToast(`Usuario "${addUserFullName}" creado exitosamente.`)
        setAddUserEmail('')
        setAddUserPassword('')
        setAddUserFullName('')
        await reloadData()
        const updated = (await getSuperAdminDataAction()).data?.parkings.find(p => p.id === managingUsersParking.id)
        if (updated) setManagingUsersParking(updated)
      }
    })
  }

  // Reset user password
  const handleResetPassword = async (userId: string) => {
    if (!newPasswordVal.trim()) {
      setResetError('Ingresa una nueva contraseña.')
      return
    }

    startTransition(async () => {
      const res = await resetParkingUserPasswordAction(userId, newPasswordVal)
      if (res.error) {
        setResetError(res.error)
      } else {
        showToast('Contraseña actualizada correctamente para el usuario.')
        setResetUserId(null)
        setNewPasswordVal('')
        setResetError('')
      }
    })
  }

  // Enter Support Mode
  const enterSupportMode = (parking: SuperAdminParking) => {
    startTransition(async () => {
      const res = await setSupportModeOrgAction(parking.id)
      if (res.error) {
        showToast('Error al ingresar a Modo Soporte: ' + res.error)
      } else {
        router.push(`/dashboard?support_org_id=${parking.id}`)
      }
    })
  }

  // Delete / Purge Parking Organization
  const handleDeleteParking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deletingParking) return

    const trimmed = deleteConfirmText.trim()
    if (trimmed.toUpperCase() !== 'ELIMINAR' && trimmed.toLowerCase() !== deletingParking.name.toLowerCase().trim()) {
      setDeleteError(`Debes escribir "ELIMINAR" o "${deletingParking.name}" para confirmar.`)
      return
    }

    setDeleteError('')
    startTransition(async () => {
      const res = await deleteParkingOrganizationAction(deletingParking.id)
      if (res.error) {
        setDeleteError(res.error)
      } else {
        showToast(`Estacionamiento "${deletingParking.name}" y todos sus datos han sido eliminados de Supabase.`)
        setDeletingParking(null)
        setDeleteConfirmText('')
        await reloadData()
      }
    })
  }

  // Open Billing Modal
  const openBillingModal = async (parking: SuperAdminParking) => {
    setManagingBillingParking(parking)
    setBillingTab('payment')
    setBillingPaymentMonths(1)
    setBillingPaymentAmount(parking.subscription_price || 25000)
    setBillingPaymentMethod('transferencia')
    setBillingPaymentNotes('')
    setBillingPlanType(parking.plan_type || 'monthly')
    setBillingPriceSetting(parking.subscription_price || 25000)
    setBillingGraceSetting(parking.grace_period_days ?? 3)
    setBillingActionError('')
    setBillingPaymentsHistory([])

    setLoadingHistory(true)
    const res = await getSubscriptionPaymentsAction(parking.id)
    if (res.data) setBillingPaymentsHistory(res.data)
    setLoadingHistory(false)
  }

  // Record Manual Payment
  const handleRecordManualPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!managingBillingParking) return
    setBillingActionError('')

    startTransition(async () => {
      const res = await recordManualPaymentAction({
        orgId: managingBillingParking.id,
        periodMonths: Number(billingPaymentMonths),
        amount: Number(billingPaymentAmount),
        paymentMethod: billingPaymentMethod,
        notes: billingPaymentNotes,
      })

      if (res.error) {
        setBillingActionError(res.error)
      } else {
        showToast(`Pago de ${billingPaymentMonths} mes(es) registrado para "${managingBillingParking.name}".`)
        await reloadData()
        const updated = (await getSuperAdminDataAction()).data?.parkings.find(p => p.id === managingBillingParking.id)
        if (updated) setManagingBillingParking(updated)
        const hRes = await getSubscriptionPaymentsAction(managingBillingParking.id)
        if (hRes.data) setBillingPaymentsHistory(hRes.data)
      }
    })
  }

  // Set Lifetime License
  const handleSetLifetimeLicense = async () => {
    if (!managingBillingParking) return
    if (!confirm(`¿Asignar Licencia Perpetua (Compra Definitiva) a "${managingBillingParking.name}"? El estacionamiento no volverá a vencer jamás.`)) return

    startTransition(async () => {
      const res = await setLifetimeLicenseAction(managingBillingParking.id)
      if (res.error) {
        setBillingActionError(res.error)
      } else {
        showToast(`Licencia perpetua asignada con éxito a "${managingBillingParking.name}".`)
        await reloadData()
        const updated = (await getSuperAdminDataAction()).data?.parkings.find(p => p.id === managingBillingParking.id)
        if (updated) setManagingBillingParking(updated)
      }
    })
  }

  // Extend Grace Period
  const handleExtendGrace = async (days: number) => {
    if (!managingBillingParking) return
    startTransition(async () => {
      const res = await extendGracePeriodAction({
        orgId: managingBillingParking.id,
        extraDays: days,
      })
      if (res.error) {
        setBillingActionError(res.error)
      } else {
        showToast(`Se otorgaron +${days} días de cortesía a "${managingBillingParking.name}".`)
        await reloadData()
        const updated = (await getSuperAdminDataAction()).data?.parkings.find(p => p.id === managingBillingParking.id)
        if (updated) setManagingBillingParking(updated)
      }
    })
  }

  // Save Plan Settings
  const handleSaveBillingSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!managingBillingParking) return
    startTransition(async () => {
      const res = await updateSubscriptionSettingsAction({
        orgId: managingBillingParking.id,
        planType: billingPlanType,
        subscriptionPrice: Number(billingPriceSetting),
        gracePeriodDays: Number(billingGraceSetting),
      })
      if (res.error) {
        setBillingActionError(res.error)
      } else {
        showToast('Configuración de suscripción guardada correctamente.')
        await reloadData()
        const updated = (await getSuperAdminDataAction()).data?.parkings.find(p => p.id === managingBillingParking.id)
        if (updated) setManagingBillingParking(updated)
      }
    })
  }

  // Filtered Parkings
  const filteredParkings = data.parkings.filter(p => {
    if (statusFilter === 'active' && !p.is_active) return false
    if (statusFilter === 'inactive' && p.is_active) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchName = p.name.toLowerCase().includes(q)
      const matchId = p.id.toLowerCase().includes(q)
      const matchUser = p.users.some(u => u.email.toLowerCase().includes(q) || u.full_name.toLowerCase().includes(q))
      return matchName || matchId || matchUser
    }
    return true
  })

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-slide-up border border-emerald-400/40">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}

      {/* ── TOP NAVBAR: CASA MATRIZ / DUEÑO DEL SAAS ── */}
      <header className="border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  ParkControl SaaS
                </h1>
                <span className="bg-gradient-to-r from-amber-400/20 to-purple-500/20 border border-amber-400/40 text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Casa Matriz • Dueño
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Monitoreo consolidado de clientes, métricas globales y soporte técnico
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCreateOrgOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">+ Dar de Alta Cliente</span>
              <span className="sm:hidden">+ Cliente</span>
            </button>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-black text-white">{currentUserName || 'Rudy Verdejo'}</span>
                <span className="text-[10px] text-zinc-400 font-mono">{currentUserEmail}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 text-xs font-bold transition-all cursor-pointer"
                title="Cerrar sesión de Dueño"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex flex-col gap-8">
        {/* ── MÉTRICAS GLOBALES DEL SAAS (4 KPI CARDS) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="glass-card rounded-2xl p-5 border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Estacionamientos Clientes</span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                {data.globalMetrics.totalParkings}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-bold">{data.globalMetrics.activeParkings} activos</span>
                <span>•</span>
                <span>{data.globalMetrics.totalParkings - data.globalMetrics.activeParkings} suspendidos</span>
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Autos Activos Ahora</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CarFront className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {data.globalMetrics.totalActiveVehicles}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">
                Estacionados en tiempo real en toda la red
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tickets Procesados</span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                {data.globalMetrics.totalTransactions.toLocaleString('es-CL')}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">
                Operaciones vehiculares históricas
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-emerald-500/20 bg-gradient-to-b from-zinc-900/90 to-zinc-950 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Recaudación Global SaaS</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {formatCLP(data.globalMetrics.totalRevenue)}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">
                Total acumulado en toda la plataforma
              </p>
            </div>
          </div>
        </div>

        {/* ── BARRA DE BÚSQUEDA Y FILTROS ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar cliente por nombre o correo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black text-zinc-500 uppercase mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Estado:
            </span>
            {(['all', 'active', 'inactive'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-amber-400 text-black border-amber-300 font-black shadow-md shadow-amber-400/20'
                    : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                {st === 'all' ? `Todos (${data.parkings.length})` : st === 'active' ? `Activos (${data.globalMetrics.activeParkings})` : `Suspendidos (${data.globalMetrics.totalParkings - data.globalMetrics.activeParkings})`}
              </button>
            ))}
          </div>
        </div>

        {/* ── SECCIÓN DE ESTACIONAMIENTOS EN FORMATO TARJETAS EN BLOQUES ── */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>🏢</span>
                Estacionamientos Clientes ({filteredParkings.length})
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tarjetas de control y monitoreo en bloques de cada cliente con métricas y soporte directo
              </p>
            </div>
            <button
              onClick={reloadData}
              disabled={isPending}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin text-amber-400' : ''}`} />
              <span>Actualizar lista</span>
            </button>
          </div>

          {filteredParkings.length === 0 ? (
            <div className="glass-card rounded-3xl p-16 text-center border-dashed border-white/10 flex flex-col items-center justify-center">
              <Building2 className="w-14 h-14 text-zinc-600 mb-3" />
              <p className="text-base font-bold text-white mb-1">No se encontraron clientes</p>
              <p className="text-xs text-zinc-400 max-w-sm mb-4">
                No hay resultados que coincidan con la búsqueda o filtro seleccionado.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('all') }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            /* ── BLOQUES / GRID DE TARJETAS ── */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredParkings.map(parking => {
                const adminUser = parking.users.find(u => u.role === 'admin') || parking.users[0]
                const maxFeeBadge = parking.tariff?.max_fee ? formatCLP(parking.tariff.max_fee) : 'Sin tope'

                return (
                  <div
                    key={parking.id}
                    className={`glass-card rounded-3xl p-5 sm:p-6 border flex flex-col justify-between gap-5 transition-all duration-200 shadow-xl ${
                      parking.is_active
                        ? 'border-white/10 hover:border-amber-400/50 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 hover:shadow-amber-500/5'
                        : 'border-red-500/25 bg-zinc-950/90 opacity-75'
                    }`}
                  >
                    {/* Header de la tarjeta */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0 border shadow-md ${
                            parking.is_active
                              ? 'bg-amber-400/15 border-amber-400/30 text-amber-400'
                              : 'bg-red-500/15 border-red-500/30 text-red-400'
                          }`}>
                            🅿️
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-black text-white truncate leading-snug">
                              {parking.name}
                            </h3>
                            <span className="text-[10px] font-mono text-zinc-500 block truncate">
                              ID: {parking.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>

                        {/* Status badges: Operativo + Facturación */}
                        {(() => {
                          const billing = calculateBillingStatus(parking, false)
                          return (
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              {/* Operativo */}
                              {parking.is_active ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  ACTIVO
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/15 text-red-400 border border-red-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                  SUSPENDIDO
                                </span>
                              )}

                              {/* Facturación */}
                              {billing.status === 'lifetime' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                  💎 PERPETUA
                                </span>
                              )}
                              {billing.status === 'active' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                  ✓ AL DÍA ({billing.daysRemaining}d)
                                </span>
                              )}
                              {billing.status === 'expiring_soon' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 animate-pulse">
                                  ⚠️ VENCE ({billing.daysRemaining}d)
                                </span>
                              )}
                              {billing.status === 'past_due' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-orange-500/15 text-orange-300 border border-orange-500/30 animate-pulse">
                                  ⏳ GRACIA ({billing.graceDaysRemaining}d)
                                </span>
                              )}
                              {billing.status === 'suspended' && parking.is_active && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-red-500/15 text-red-300 border border-red-500/30">
                                  🛑 BLOQ. PAGO
                                </span>
                              )}
                            </div>
                          )
                        })()}
                      </div>

                      {/* Admin info bar */}
                      <div className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs flex items-center justify-between gap-2">
                        <div className="min-w-0 truncate">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Encargado</span>
                          <span className="text-zinc-200 font-bold truncate block">
                            {adminUser?.full_name || 'Sin admin asignado'}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Personal</span>
                          <span className="text-blue-400 font-black font-mono">
                            {parking.users.length} usuarios
                          </span>
                        </div>
                      </div>

                      {/* Facturación info bar */}
                      {(() => {
                        const billing = calculateBillingStatus(parking, false)
                        return (
                          <div className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs flex items-center justify-between gap-2">
                            <div className="min-w-0 truncate">
                              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Plan / Tarifa SaaS</span>
                              <span className="text-zinc-200 font-bold truncate block text-[11px]">
                                {parking.plan_type === 'lifetime'
                                  ? '💎 Compra Perpetua'
                                  : `${formatCLP(parking.subscription_price || 25000)}/mes (${parking.plan_type === 'annual' ? 'Anual' : 'Mensual'})`}
                              </span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Vencimiento</span>
                              <span className="font-mono font-bold text-[11px] truncate block text-amber-300">
                                {billing.status === 'lifetime' ? 'Ilimitado' : billing.dueDateFormatted || 'Por configurar'}
                              </span>
                            </div>
                          </div>
                        )
                      })()}

                      {/* ── MATRIZ DE MÉTRICAS EN BLOQUES (2x2) ── */}
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Tile 1: Autos activos */}
                        <div className="bg-black/50 border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                            🚗 Autos Ahora
                          </span>
                          <span className="text-lg font-black text-emerald-400 font-mono mt-1">
                            {parking.activeVehiclesCount}
                            <span className="text-[10px] text-zinc-500 font-sans ml-1 font-normal">adentro</span>
                          </span>
                        </div>

                        {/* Tile 2: Recaudación total */}
                        <div className="bg-black/50 border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                            💰 Recaudado Total
                          </span>
                          <span className="text-lg font-black text-amber-400 font-mono mt-1 truncate">
                            {formatCLP(parking.totalRevenue)}
                          </span>
                        </div>

                        {/* Tile 3: Total tickets */}
                        <div className="bg-black/50 border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                            📄 Tickets
                          </span>
                          <span className="text-base font-black text-white font-mono mt-1">
                            {parking.totalTransactionsCount.toLocaleString('es-CL')}
                            <span className="text-[10px] text-zinc-500 font-sans ml-1 font-normal">total</span>
                          </span>
                        </div>

                        {/* Tile 4: Tarifa y tope */}
                        <div className="bg-black/50 border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                            🏷️ Tarifa Base / Tope
                          </span>
                          <span className="text-xs font-black text-zinc-300 font-mono mt-1 leading-tight">
                            {parking.tariff ? `${formatCLP(parking.tariff.base_fee)} / ${parking.tariff.base_minutes}m` : 'N/A'}
                          </span>
                          <span className="text-[10px] font-bold text-purple-400 font-mono">
                            Tope: {maxFeeBadge}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ── BARRA INFERIOR DE ACCIONES Y SOPORTE DIRECTO ── */}
                    <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                      {/* Botón Principal: Entrar a Modo Soporte */}
                      <button
                        type="button"
                        onClick={() => enterSupportMode(parking)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 text-xs font-black transition-all shadow-md shadow-emerald-500/10 cursor-pointer active:scale-95"
                        title="Abrir este estacionamiento como soporte técnico"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ingresar en Modo Soporte</span>
                      </button>

                      {/* Botones secundarios: Cobros, Tarifas, Claves y Suspender (4 columnas) */}
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => openBillingModal(parking)}
                          className="flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 hover:text-white text-[11px] font-black transition-all cursor-pointer shadow-sm shadow-amber-500/10"
                          title="Gestionar suscripción, pagos y vencimientos"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Cobros</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditTariff(parking)}
                          className="flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer"
                          title="Modificar tarifas del estacionamiento"
                        >
                          <Settings className="w-3 h-3" />
                          <span>Tarifas</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setManagingUsersParking(parking)
                            setAddUserError('')
                            setResetError('')
                          }}
                          className="flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer"
                          title="Ver usuarios y restablecer accesos"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Accesos</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(parking)}
                          className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl border transition-all cursor-pointer text-[11px] font-bold ${
                            parking.is_active
                              ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                          }`}
                          title={parking.is_active ? 'Suspender estacionamiento' : 'Reactivar estacionamiento'}
                        >
                          <Power className="w-3 h-3" />
                          <span>{parking.is_active ? 'Pausar' : 'Activar'}</span>
                        </button>
                      </div>

                      {/* Botón Peligro: Eliminar / Purgar Local de Muestra */}
                      {parking.name !== 'ParkControl Matriz (SaaS)' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingParking(parking)
                            setDeleteConfirmText('')
                            setDeleteError('')
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-500/5 hover:bg-red-500/15 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 text-[11px] font-bold transition-all cursor-pointer active:scale-98"
                          title="Eliminar estacionamiento y liberar memoria en Supabase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar Local Definitivamente</span>
                        </button>
                      ) : (
                        <div className="w-full text-center py-1.5 text-[10px] text-amber-400/80 font-mono flex items-center justify-center gap-1.5 bg-amber-400/5 border border-amber-400/20 rounded-xl">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Organización Principal Protegida</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── MODAL: CREAR NUEVO CLIENTE / ESTACIONAMIENTO ── */}
      {createOrgOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="glass-card rounded-3xl w-full max-w-lg border border-amber-400/30 shadow-2xl bg-zinc-950 p-6 my-auto animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 text-lg font-bold">
                  🏢
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Dar de Alta Nuevo Cliente</h3>
                  <p className="text-xs text-zinc-400">Registra un nuevo estacionamiento con sus credenciales y tarifas iniciales</p>
                </div>
              </div>
              <button
                onClick={() => setCreateOrgOpen(false)}
                className="text-zinc-500 hover:text-white p-2 rounded-xl bg-white/5 border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="flex flex-col gap-4 text-xs">
              {createOrgError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
                  {createOrgError}
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Nombre del Estacionamiento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Estacionamiento San Martín"
                  value={newOrgName}
                  onChange={e => setNewOrgName(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Nombre del Administrador *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Juan Pérez"
                    value={newAdminName}
                    onChange={e => setNewAdminName(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Email del Administrador *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@estacionamiento.cl"
                    value={newAdminEmail}
                    onChange={e => setNewAdminEmail(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Contraseña Inicial *</label>
                <input
                  type="text"
                  required
                  placeholder="Clave inicial para el cliente"
                  value={newAdminPassword}
                  onChange={e => setNewAdminPassword(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono font-medium focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Tariff Configuration Fields */}
              <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 flex flex-col gap-3">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                  ⚙️ Tarifas Iniciales
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Cobro Base ($ CLP)</label>
                    <input
                      type="number"
                      required
                      value={newBaseFee}
                      onChange={e => setNewBaseFee(Number(e.target.value))}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Minutos Base</label>
                    <input
                      type="number"
                      required
                      value={newBaseMinutes}
                      onChange={e => setNewBaseMinutes(Number(e.target.value))}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Cobro Fracción Adic. ($)</label>
                    <input
                      type="number"
                      required
                      value={newAddFee}
                      onChange={e => setNewAddFee(Number(e.target.value))}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Minutos por Fracción</label>
                    <input
                      type="number"
                      required
                      value={newAddMinutes}
                      onChange={e => setNewAddMinutes(Number(e.target.value))}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Tope Máximo por Día ($ opcional)</label>
                  <input
                    type="number"
                    placeholder="Ej: 6000 (dejar vacío si no aplica)"
                    value={newMaxFee}
                    onChange={e => setNewMaxFee(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateOrgOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Crear Estacionamiento</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDITAR TARIFAS ── */}
      {editingTariffParking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card rounded-3xl w-full max-w-md border border-white/15 shadow-2xl bg-zinc-950 p-6 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-bold">
                  ⚙️
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Modificar Tarifas</h3>
                  <p className="text-xs text-zinc-400">{editingTariffParking.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTariffParking(null)}
                className="text-zinc-500 hover:text-white p-2 rounded-xl bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTariff} className="flex flex-col gap-3.5 text-xs">
              {editTariffError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
                  {editTariffError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Cobro Base ($ CLP)</label>
                  <input
                    type="number"
                    required
                    value={editBaseFee}
                    onChange={e => setEditBaseFee(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Minutos Base</label>
                  <input
                    type="number"
                    required
                    value={editBaseMinutes}
                    onChange={e => setEditBaseMinutes(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Cobro Fracción ($ CLP)</label>
                  <input
                    type="number"
                    required
                    value={editAddFee}
                    onChange={e => setEditAddFee(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Minutos Fracción</label>
                  <input
                    type="number"
                    required
                    value={editAddMinutes}
                    onChange={e => setEditAddMinutes(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Tope Máximo por Día ($ opcional)</label>
                <input
                  type="number"
                  placeholder="Ej: 6000 (dejar vacío si no aplica)"
                  value={editMaxFee}
                  onChange={e => setEditMaxFee(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingTariffParking(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black transition-all cursor-pointer"
                >
                  {isPending ? 'Guardando...' : 'Guardar Tarifas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: GESTIÓN DE ACCESOS Y USUARIOS ── */}
      {managingUsersParking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="glass-card rounded-3xl w-full max-w-xl border border-white/15 shadow-2xl bg-zinc-950 p-6 my-auto animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
                  👥
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Accesos y Contraseñas</h3>
                  <p className="text-xs text-zinc-400">{managingUsersParking.name}</p>
                </div>
              </div>
              <button
                onClick={() => setManagingUsersParking(null)}
                className="text-zinc-500 hover:text-white p-2 rounded-xl bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of existing users */}
            <div className="flex flex-col gap-2.5 mb-6 max-h-48 overflow-y-auto pr-1">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                Personal Registrado ({managingUsersParking.users.length})
              </span>
              {managingUsersParking.users.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-2">No hay usuarios registrados en este estacionamiento.</p>
              ) : (
                managingUsersParking.users.map(u => (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{u.full_name || 'Sin nombre'}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
                            : 'bg-blue-400/15 text-blue-400 border border-blue-400/30'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono block mt-0.5">{u.email}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setResetUserId(u.id)
                        setNewPasswordVal('')
                        setResetError('')
                      }}
                      className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Restablecer Clave</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Reset Password Form Section (if active) */}
            {resetUserId && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-6 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    Restablecer Contraseña para el Usuario
                  </span>
                  <button onClick={() => setResetUserId(null)} className="text-zinc-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {resetError && <p className="text-red-400 text-xs font-bold mb-2">{resetError}</p>}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nueva contraseña temporal"
                    value={newPasswordVal}
                    onChange={e => setNewPasswordVal(e.target.value)}
                    className="flex-1 bg-black/70 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleResetPassword(resetUserId)}
                    disabled={isPending}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black rounded-xl cursor-pointer"
                  >
                    Guardar Clave
                  </button>
                </div>
              </div>
            )}

            {/* Add User Form */}
            <form onSubmit={handleAddParkingUser} className="border-t border-white/10 pt-4 flex flex-col gap-3 text-xs">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                + Crear Nuevo Cajero / Operador
              </span>

              {addUserError && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
                  {addUserError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Marcelo Ríos"
                    value={addUserFullName}
                    onChange={e => setAddUserFullName(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Rol</label>
                  <select
                    value={addUserRole}
                    onChange={e => setAddUserRole(e.target.value as any)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-bold cursor-pointer"
                  >
                    <option value="operator">Cajero / Operador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    placeholder="cajero@estacionamiento.cl"
                    value={addUserEmail}
                    onChange={e => setAddUserEmail(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Contraseña</label>
                  <input
                    type="text"
                    required
                    placeholder="Contraseña inicial"
                    value={addUserPassword}
                    onChange={e => setAddUserPassword(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/15"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Usuario</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ELIMINAR / PURGAR ESTACIONAMIENTO DE SUPABASE ── */}
      {deletingParking && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="glass-card rounded-3xl w-full max-w-lg border border-red-500/30 shadow-2xl shadow-red-950/50 bg-zinc-950 p-6 my-auto animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 text-lg font-bold">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    Eliminar Estacionamiento
                    <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full font-mono uppercase">
                      Purgar Supabase
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">Elimina el local de muestra y libera memoria y cuota de usuarios</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isPending) {
                    setDeletingParking(null)
                    setDeleteConfirmText('')
                    setDeleteError('')
                  }
                }}
                disabled={isPending}
                className="text-zinc-500 hover:text-white p-2 rounded-xl bg-white/5 border border-white/10 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeleteParking} className="flex flex-col gap-4 text-xs">
              {/* Danger Warning Banner */}
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-zinc-300 leading-relaxed text-[11px]">
                  <p className="font-bold text-red-400 mb-1">
                    ¡Esta acción es definitiva e irreversible!
                  </p>
                  Al confirmar, se eliminarán permanentemente de Supabase todos los datos de este local para liberar memoria y evitar cuotas innecesarias.
                </div>
              </div>

              {/* Resumen de elementos a purgar */}
              <div className="bg-black/50 border border-white/10 rounded-2xl p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-zinc-400 font-medium">Estacionamiento a purgar:</span>
                  <span className="font-black text-white text-sm">{deletingParking.name}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                    <span className="text-[10px] text-zinc-500 block font-sans">Usuarios / Claves</span>
                    <span className="text-sm font-bold text-blue-400">{deletingParking.users.length}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                    <span className="text-[10px] text-zinc-500 block font-sans">Autos Registrados</span>
                    <span className="text-sm font-bold text-emerald-400">{deletingParking.activeVehiclesCount}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                    <span className="text-[10px] text-zinc-500 block font-sans">Tickets Históricos</span>
                    <span className="text-sm font-bold text-amber-400">{deletingParking.totalTransactionsCount}</span>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-500 pt-1">
                  * También se purgarán tarifas, auditorías y cierres de caja. Las cuentas de acceso serán dadas de baja de Supabase Auth.
                </p>
              </div>

              {deleteError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold">
                  {deleteError}
                </div>
              )}

              {/* Input de confirmación */}
              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1.5">
                  Para confirmar, escribe <span className="text-red-400 font-mono font-black">ELIMINAR</span> o el nombre exacto del local:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  disabled={isPending}
                  placeholder={`Escribe ELIMINAR o "${deletingParking.name}"`}
                  value={deleteConfirmText}
                  onChange={e => {
                    setDeleteConfirmText(e.target.value)
                    if (deleteError) setDeleteError('')
                  }}
                  className="w-full bg-black/70 border border-red-500/30 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setDeletingParking(null)
                    setDeleteConfirmText('')
                    setDeleteError('')
                  }}
                  className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    isPending ||
                    (deleteConfirmText.trim().toUpperCase() !== 'ELIMINAR' &&
                      deleteConfirmText.trim().toLowerCase() !== deletingParking.name.toLowerCase().trim())
                  }
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:from-red-950 disabled:to-zinc-900 disabled:border-red-900/30 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 border border-red-500/30"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Purgando de Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Purgar y Eliminar Definitivamente</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── MODAL: GESTIÓN DE COBROS Y SUSCRIPCIÓN (SUPER ADMIN) ── */}
      {managingBillingParking && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="glass-card rounded-3xl w-full max-w-lg border border-amber-400/30 shadow-2xl bg-zinc-950 p-6 my-auto animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 text-lg">
                  💳
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Cobros y Suscripción</h3>
                  <p className="text-xs text-zinc-400">{managingBillingParking.name}</p>
                </div>
              </div>
              <button
                onClick={() => setManagingBillingParking(null)}
                className="text-zinc-500 hover:text-white p-2 rounded-xl bg-white/5 border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status summary banner */}
            {(() => {
              const b = calculateBillingStatus(managingBillingParking, false)
              return (
                <div className="p-3 bg-black/60 rounded-2xl border border-white/5 flex items-center justify-between gap-3 text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Estado Actual</span>
                    <span className="font-black text-white">{b.message}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Vence</span>
                    <span className="font-mono font-bold text-amber-300">
                      {b.status === 'lifetime' ? '💎 Ilimitado' : b.dueDateFormatted || 'Por configurar'}
                    </span>
                  </div>
                </div>
              )
            })()}

            {/* Tabs selector */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-xl border border-white/5 mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setBillingTab('payment')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  billingTab === 'payment' ? 'bg-amber-400 text-black font-black shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                💵 Registrar Pago
              </button>
              <button
                type="button"
                onClick={() => setBillingTab('settings')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  billingTab === 'settings' ? 'bg-amber-400 text-black font-black shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                ⚙️ Plan y Cortesía
              </button>
              <button
                type="button"
                onClick={() => setBillingTab('history')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  billingTab === 'history' ? 'bg-amber-400 text-black font-black shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                📜 Historial ({billingPaymentsHistory.length})
              </button>
            </div>

            {billingActionError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold mb-4">
                {billingActionError}
              </div>
            )}

            {/* TAB 1: REGISTRAR PAGO MANUAL */}
            {billingTab === 'payment' && (
              <form onSubmit={handleRecordManualPayment} className="flex flex-col gap-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1.5">Periodo a Renovar *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBillingPaymentMonths(1)
                        setBillingPaymentAmount(managingBillingParking.subscription_price || 25000)
                      }}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                        billingPaymentMonths === 1
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                          : 'bg-black/50 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      +1 Mes (30 días)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBillingPaymentMonths(12)
                        setBillingPaymentAmount((managingBillingParking.subscription_price || 25000) * 10)
                      }}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                        billingPaymentMonths === 12
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                          : 'bg-black/50 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      +1 Año (365 días)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingPaymentMonths(3)}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                        billingPaymentMonths === 3
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                          : 'bg-black/50 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      +3 Meses
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Monto Pagado ($ CLP) *</label>
                    <input
                      type="number"
                      required
                      value={billingPaymentAmount}
                      onChange={e => setBillingPaymentAmount(Number(e.target.value))}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Medio de Pago</label>
                    <select
                      value={billingPaymentMethod}
                      onChange={e => setBillingPaymentMethod(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-bold cursor-pointer"
                    >
                      <option value="transferencia">Transferencia Bancaria</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="mercadopago">Mercado Pago</option>
                      <option value="flow">Flow.cl</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Notas / N° de Comprobante (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Transferencia Banco Estado N° 982182"
                    value={billingPaymentNotes}
                    onChange={e => setBillingPaymentNotes(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-white font-medium"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setManagingBillingParking(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Registrar Pago y Activar</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: PLAN Y CORTESÍA */}
            {billingTab === 'settings' && (
              <div className="flex flex-col gap-4 text-xs">
                {/* Licencia Perpetua (Compra Definitiva) */}
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-purple-300 text-sm flex items-center gap-1.5">
                      💎 Licencia Perpetua (Compra Definitiva)
                    </span>
                    {managingBillingParking.plan_type === 'lifetime' && (
                      <span className="bg-purple-500/20 text-purple-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-500/40">
                        ACTIVA
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Si el cliente compró el software de forma definitiva, puedes asignarle una licencia permanente para que nunca se bloquee ni tenga fecha de vencimiento.
                  </p>
                  {managingBillingParking.plan_type !== 'lifetime' && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleSetLifetimeLicense}
                      className="mt-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer transition-all active:scale-95"
                    >
                      <span>⭐ Asignar Licencia Perpetua (Sin Vencimiento)</span>
                    </button>
                  )}
                </div>

                {/* Días de Cortesía / Gracia adicional */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col gap-2">
                  <span className="font-black text-amber-300 text-sm flex items-center gap-1.5">
                    ⏳ Otorgar Días de Cortesía
                  </span>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Extiende la fecha de corte sin registrar cobro, ideal si el cliente solicita unos días extras para transferir.
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleExtendGrace(3)}
                      className="py-2 bg-black/60 hover:bg-amber-400 hover:text-black border border-white/10 text-amber-300 font-bold rounded-xl text-xs cursor-pointer transition-all"
                    >
                      +3 Días
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleExtendGrace(5)}
                      className="py-2 bg-black/60 hover:bg-amber-400 hover:text-black border border-white/10 text-amber-300 font-bold rounded-xl text-xs cursor-pointer transition-all"
                    >
                      +5 Días
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleExtendGrace(7)}
                      className="py-2 bg-black/60 hover:bg-amber-400 hover:text-black border border-white/10 text-amber-300 font-bold rounded-xl text-xs cursor-pointer transition-all"
                    >
                      +7 Días
                    </button>
                  </div>
                </div>

                {/* Formulario de parámetros de plan */}
                <form onSubmit={handleSaveBillingSettings} className="border-t border-white/10 pt-3 flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                    Ajustar Parámetros de Suscripción
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Precio Mensual ($ CLP)</label>
                      <input
                        type="number"
                        value={billingPriceSetting}
                        onChange={e => setBillingPriceSetting(Number(e.target.value))}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Días de Gracia Habituales</label>
                      <input
                        type="number"
                        value={billingGraceSetting}
                        onChange={e => setBillingGraceSetting(Number(e.target.value))}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl text-xs cursor-pointer transition-all"
                    >
                      Guardar Parámetros
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: HISTORIAL DE PAGOS */}
            {billingTab === 'history' && (
              <div className="flex flex-col gap-3 text-xs">
                {loadingHistory ? (
                  <div className="p-8 text-center text-zinc-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Cargando historial de pagos...
                  </div>
                ) : billingPaymentsHistory.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 border border-dashed border-white/10 rounded-2xl">
                    No hay pagos registrados para este cliente aún.
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto flex flex-col gap-2">
                    {billingPaymentsHistory.map(pay => (
                      <div key={pay.id} className="p-3 bg-black/50 border border-white/5 rounded-2xl flex items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-white text-xs block">
                            {formatCLP(pay.amount)} • {pay.period_months === 0 ? 'Licencia Perpetua' : `+${pay.period_months} mes(es)`}
                          </span>
                          <span className="text-[10px] text-zinc-500 block">
                            {formatDate(pay.created_at)} • Método: {pay.payment_method}
                          </span>
                          {pay.notes && (
                            <span className="text-[10px] text-amber-400/90 italic block mt-0.5">
                              "{pay.notes}"
                            </span>
                          )}
                        </div>
                        <span className="text-emerald-400 text-xs font-black">✓ REGISTRADO</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
