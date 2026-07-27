'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CarFront,
  Bike,
  Truck,
  Play,
  CheckCircle2,
  Receipt,
  RotateCcw,
  Clock,
  DollarSign,
  Sparkles,
} from 'lucide-react'

type VehicleType = 'auto' | 'moto' | 'camion'

interface SimulatedVehicle {
  plate: string
  type: VehicleType
  ratePerMin: number
  startTime: Date
}

export default function InteractiveSimulator() {
  const [plateInput, setPlateInput] = useState('BC-45-89')
  const [selectedType, setSelectedType] = useState<VehicleType>('auto')
  const [activeVehicle, setActiveVehicle] = useState<SimulatedVehicle | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [ticketModal, setTicketModal] = useState<{
    plate: string
    durationMin: number
    totalCost: number
    date: string
  } | null>(null)

  // Timer loop for active simulated vehicle
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeVehicle) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeVehicle])

  const rates: Record<VehicleType, { label: string; rate: number; icon: any }> = {
    auto: { label: 'Automóvil', rate: 35, icon: CarFront },
    moto: { label: 'Motocicleta', rate: 20, icon: Bike },
    camion: { label: 'Camioneta / Camión', rate: 50, icon: Truck },
  }

  const handleRegisterEntry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!plateInput.trim()) return

    setActiveVehicle({
      plate: plateInput.toUpperCase(),
      type: selectedType,
      ratePerMin: rates[selectedType].rate,
      startTime: new Date(),
    })
    setElapsedSeconds(180) // start with 3 simulated minutes already elapsed
  }

  const handleCalculateCheckout = () => {
    if (!activeVehicle) return

    const minutes = Math.max(1, Math.ceil(elapsedSeconds / 60))
    const total = minutes * activeVehicle.ratePerMin

    setTicketModal({
      plate: activeVehicle.plate,
      durationMin: minutes,
      totalCost: total,
      date: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    })

    setActiveVehicle(null)
    setElapsedSeconds(0)
  }

  const handleReset = () => {
    setActiveVehicle(null)
    setElapsedSeconds(0)
    setTicketModal(null)
  }

  const currentMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60))
  const currentCost = activeVehicle ? currentMinutes * activeVehicle.ratePerMin : 0

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-6 py-16">
      {/* Section Title Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-4 py-1.5 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Prueba Interactiva en Vivo
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
          Simulador de Cobro de Estacionamiento
        </h2>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto">
          Prueba el flujo real de caja en tiempo real. Ingresa una patente de demostración y observa cómo ParkControl calcula el cobro al segundo.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        {!activeVehicle && !ticketModal && (
          <form onSubmit={handleRegisterEntry} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* License Plate Input */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Patente del Vehículo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={plateInput}
                    onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                    placeholder="EJ: AB-12-CD"
                    maxLength={10}
                    className="w-full bg-zinc-900 border border-amber-500/30 focus:border-amber-400 text-white font-mono font-black text-xl px-4 py-3.5 rounded-xl outline-none tracking-widest placeholder:text-zinc-600 transition-all uppercase shadow-inner"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-400 text-black text-[10px] font-bold px-2 py-1 rounded">
                    CHILE
                  </div>
                </div>
              </div>

              {/* Vehicle Type Picker */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Tipo de Vehículo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['auto', 'moto', 'camion'] as VehicleType[]).map((type) => {
                    const { label, rate, icon: Icon } = rates[type]
                    const isSelected = selectedType === type
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-amber-400/15 border-amber-400 text-amber-400 shadow-md shadow-amber-500/10'
                            : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/20'
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1" />
                        <span className="text-[11px] font-bold">{label}</span>
                        <span className="text-[10px] opacity-75">${rate}/min</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-base rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-black" />
              Simular Ingreso de Vehículo
            </button>
          </form>
        )}

        {/* Active Simulation View */}
        {activeVehicle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Vehículo Registrado en Caja
            </div>

            <div className="bg-zinc-900/90 border border-white/10 p-6 rounded-2xl max-w-lg mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-xs font-medium">Patente</span>
                <span className="font-mono font-black text-2xl text-black bg-amber-400 px-3 py-1 rounded-lg border border-amber-300">
                  {activeVehicle.plate}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3">
                <span className="text-zinc-400">Tipo de Vehículo:</span>
                <span className="font-bold text-white">{rates[activeVehicle.type].label}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Tiempo Transcurrido:</span>
                <span className="font-mono font-bold text-sky-400 text-base">
                  {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3">
                <span className="text-zinc-400">Monto Actual a Cobrar:</span>
                <span className="text-2xl font-black text-emerald-400">${currentCost} CLP</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
              <button
                onClick={handleCalculateCheckout}
                className="flex-1 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Receipt className="w-4 h-4" />
                Procesar Salida y Cobrar
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white font-bold text-sm rounded-xl cursor-pointer transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}

        {/* Animated Ticket Receipt Modal View */}
        <AnimatePresence>
          {ticketModal && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="text-center space-y-6 max-w-md mx-auto py-2"
            >
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-white">¡Cobro Exitoso & Ticket Generado!</h3>

              <div className="bg-white text-black font-mono p-6 rounded-2xl text-left shadow-2xl space-y-3 relative overflow-hidden border border-zinc-200">
                <div className="text-center border-b border-dashed border-zinc-400 pb-3">
                  <p className="font-black text-lg">PARKCONTROL SAAS</p>
                  <p className="text-[10px] text-zinc-600">Ticket de Salida N° #84920</p>
                  <p className="text-[10px] text-zinc-500">{ticketModal.date}</p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">PATENTE:</span>
                    <span className="font-bold">{ticketModal.plate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">TIEMPO COBRADO:</span>
                    <span className="font-bold">{ticketModal.durationMin} Minutos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">MEDIO DE PAGO:</span>
                    <span className="font-bold">Efectivo / Débito</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-zinc-400 pt-3 flex justify-between items-baseline">
                  <span className="font-black text-sm">TOTAL PAGADO:</span>
                  <span className="font-black text-xl text-black">${ticketModal.totalCost} CLP</span>
                </div>

                <div className="text-center pt-2 text-[9px] text-zinc-500">
                  *** Gracias por su preferencia ***
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-amber-500/20"
              >
                <RotateCcw className="w-4 h-4" />
                Probar Otra Simulación
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
