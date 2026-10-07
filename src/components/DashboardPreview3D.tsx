'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  CarFront,
  DollarSign,
  Clock,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react'

export default function DashboardPreview3D() {
  const [seconds, setSeconds] = useState(1482)
  const [rotateX, setRotateX] = useState(10)
  const [rotateY, setRotateY] = useState(-5)

  // Timer ticker to simulate real-time live clocking
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0')
    const m = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0')
    const s = (totalSeconds % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setRotateX(-y * 0.03)
    setRotateY(x * 0.03)
  }

  const handleMouseLeave = () => {
    setRotateX(8)
    setRotateY(-4)
  }

  return (
    <div
      className="relative w-full max-w-5xl mx-auto my-12 perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background ambient neon glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-amber-500/10 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

      <motion.div
        className="relative z-10 rounded-3xl border border-amber-500/20 bg-zinc-950/85 p-6 md:p-8 backdrop-blur-2xl shadow-2xl shadow-black/80"
        style={{
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateX,
          rotateY,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Mockup Header / Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center font-black text-black text-base shadow-md shadow-amber-500/30">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Estacionamiento Centro La Ligua</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  EN VIVO
                </span>
              </div>
              <span className="text-xs text-zinc-400">Caja N° 1 · Operador: Pablina O.</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right mr-3 hidden sm:block">
              <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">Tarifa Base</p>
              <p className="text-sm font-bold text-amber-400">$35 / min ($2.100/hr)</p>
            </div>
            <span className="px-3.5 py-1.5 text-xs font-bold text-black bg-amber-400 rounded-xl shadow-lg shadow-amber-500/20">
              + Nuevo Vehículo
            </span>
          </div>
        </div>

        {/* Top Metric Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
          <div className="bg-zinc-900/80 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400">Vehículos Dentro</span>
              <CarFront className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">42 / 60</span>
              <span className="text-xs text-emerald-400 font-semibold">70% Ocupado</span>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400">Recaudación Hoy</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">$148.500</span>
              <span className="text-xs text-emerald-400 flex items-center font-semibold">
                +18% <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400">Tiempo Promedio</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">1h 24m</span>
              <span className="text-xs text-zinc-400 font-medium">Rotación rápida</span>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400">Tiempo del Sistema</span>
              <Activity className="w-4 h-4 text-amber-400 animate-spin" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-amber-400 font-mono">{formatTimer(seconds)}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Sincronizado</span>
            </div>
          </div>
        </div>

        {/* Live Active Vehicles Table Preview */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between bg-zinc-900/90">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <CarFront className="w-4 h-4 text-amber-400" />
              Vehículos Estacionados Actualmente
            </h4>
            <span className="text-xs text-zinc-400">Mostrando 4 más recientes</span>
          </div>

          <div className="divide-y divide-white/5 text-sm">
            {[
              { plate: 'AB-12-CD', type: 'Automóvil', entry: '10:14 AM', elapsed: '01h 12m', total: '$2.520', status: 'Activo' },
              { plate: 'KX-89-01', type: 'SUV / Camioneta', entry: '10:45 AM', elapsed: '00h 41m', total: '$1.435', status: 'Activo' },
              { plate: 'MH-33-44', type: 'Motocicleta', entry: '11:02 AM', elapsed: '00h 24m', total: '$500', status: 'Activo' },
              { plate: 'PZ-77-21', type: 'Automóvil', entry: '11:20 AM', elapsed: '00h 06m', total: '$350', status: 'Recién Ingresado' },
            ].map((row, idx) => (
              <div key={idx} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-black bg-amber-400 px-2.5 py-1 rounded-md text-xs border border-amber-300 shadow-sm">
                    {row.plate}
                  </span>
                  <div>
                    <p className="font-semibold text-white text-xs">{row.type}</p>
                    <p className="text-[11px] text-zinc-500">Ingreso: {row.entry}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-mono text-zinc-300">{row.elapsed}</p>
                    <p className="text-[10px] text-zinc-500">Transcurrido</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-400">{row.total}</p>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Cobro al Seg.
                    </span>
                  </div>
                  <button className="px-3 py-1.5 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors">
                    Cobrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Highlight Badges */}
        <motion.div
          className="absolute -top-5 -right-5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs px-4 py-2 rounded-2xl shadow-xl shadow-amber-500/30 flex items-center gap-2"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        >
          <Zap className="w-4 h-4 fill-black" />
          <span>Calcula cobro al segundo</span>
        </motion.div>

        <motion.div
          className="absolute -bottom-5 -left-5 bg-zinc-900 border border-emerald-500/30 text-emerald-400 font-bold text-xs px-4 py-2.5 rounded-2xl shadow-xl shadow-black/90 flex items-center gap-2"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Respaldo Supabase Cloud en Tiempo Real</span>
        </motion.div>
      </motion.div>
    </div>
  )
}
