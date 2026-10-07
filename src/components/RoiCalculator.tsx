'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, Sparkles, Clock, DollarSign, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function RoiCalculator() {
  const [spaces, setSpaces] = useState(30)
  const [rotation, setRotation] = useState(4)
  const [ratePerMin, setRatePerMin] = useState(35)
  const [avgStayMins, setAvgStayMins] = useState(70)

  // Calculations
  const dailyVehicles = Math.round(spaces * rotation)
  const ticketAvgPrice = ratePerMin * avgStayMins
  const dailyRevenue = dailyVehicles * ticketAvgPrice
  const monthlyRevenue = dailyRevenue * 30

  // Estimated leakage recovery (conservative 9% usually lost in manual roundings and untracked entries)
  const estimatedLeakageRecovery = Math.round(monthlyRevenue * 0.09)

  // Hours saved per month (approx 50 mins daily spent on manual tickets + cashier balance)
  const hoursSavedPerMonth = 25

  // Pro plan price in CLP
  const proPlanMonthly = 19900
  const roiMultiplier = Math.max(1, Math.round(estimatedLeakageRecovery / proPlanMonthly))

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <section id="roi-calculator" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-4 py-1.5 rounded-full mb-3">
          <Calculator className="w-3.5 h-3.5" />
          <span>Calculadora de Rentabilidad</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Calcula cuánto dinero extra puedes recuperar al mes
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Ajusta los parámetros según tu estacionamiento y descubre cómo el cobro al segundo y el cierre automático protegen tu margen de ganancia.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Sliders Side */}
          <div className="lg:col-span-7 space-y-7">
            {/* Slider 1: Capacidad de Plazas */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-zinc-300">Capacidad de espacios / plazas:</span>
                <span className="text-amber-400 font-black text-base px-2.5 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20">
                  {spaces} vehículos
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={150}
                step={5}
                value={spaces}
                onChange={(e) => setSpaces(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
                <span>10 plazas</span>
                <span>75 plazas</span>
                <span>150 plazas</span>
              </div>
            </div>

            {/* Slider 2: Rotación Diaria */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-zinc-300">Rotación diaria promedio por plaza:</span>
                <span className="text-sky-400 font-black text-base px-2.5 py-0.5 rounded-md bg-sky-400/10 border border-sky-400/20">
                  {rotation}x al día ({dailyVehicles} autos/día)
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                step={0.5}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
                <span>1 auto/plaza</span>
                <span>4 autos/plaza</span>
                <span>8 autos/plaza</span>
              </div>
            </div>

            {/* Slider 3: Tarifa por Minuto */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-zinc-300">Tarifa por minuto cobrada:</span>
                <span className="text-emerald-400 font-black text-base px-2.5 py-0.5 rounded-md bg-emerald-400/10 border border-emerald-400/20">
                  ${ratePerMin} CLP/min (${ratePerMin * 60}/hr)
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={60}
                step={5}
                value={ratePerMin}
                onChange={(e) => setRatePerMin(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
                <span>$20/min ($1.200/hr)</span>
                <span>$35/min ($2.100/hr)</span>
                <span>$60/min ($3.600/hr)</span>
              </div>
            </div>

            {/* Slider 4: Estadía Promedio */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-zinc-300">Tiempo de estadía promedio:</span>
                <span className="text-purple-400 font-black text-base px-2.5 py-0.5 rounded-md bg-purple-400/10 border border-purple-400/20">
                  {avgStayMins} minutos ({Math.floor(avgStayMins / 60)}h {avgStayMins % 60}m)
                </span>
              </div>
              <input
                type="range"
                min={30}
                max={150}
                step={10}
                value={avgStayMins}
                onChange={(e) => setAvgStayMins(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
                <span>30 min</span>
                <span>90 min</span>
                <span>150 min</span>
              </div>
            </div>
          </div>

          {/* Results Card Side */}
          <div className="lg:col-span-5 bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-xl flex flex-col justify-between space-y-6 relative">
            <div className="absolute top-0 right-0 bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-md">
              ANÁLISIS DE IMPACTO
            </div>

            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Recaudación Mensual Estimada
              </span>
              <p className="text-3xl sm:text-4xl font-black text-white">
                {formatCurrency(monthlyRevenue)}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Aproximadamente {formatCurrency(dailyRevenue)} al día (~{dailyVehicles} autos)
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">
                    Fugas y desvíos evitados (+9%)
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-emerald-400">
                  +{formatCurrency(estimatedLeakageRecovery)} <span className="text-xs font-normal text-emerald-200">/ mes extra</span>
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Dinero que antes se perdía en redondeos erróneos y boletas no registradas.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" /> Tiempo ahorrado en caja
                  </span>
                  <p className="text-xs text-zinc-400 mt-0.5">Menos tiempo en arqueo manual</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-white">~{hoursSavedPerMonth} hrs</span>
                  <span className="text-[10px] text-sky-300 block">al mes</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-center">
                <p className="text-xs font-bold text-amber-300">
                  🚀 Retorno de Inversión (ROI): <span className="text-amber-400 font-black">{roiMultiplier}x veces</span> el valor del Plan Pro
                </p>
              </div>
            </div>

            <Link
              href="/register"
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-sm rounded-xl text-center shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Comenzar a Rentabilizar Hoy</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
