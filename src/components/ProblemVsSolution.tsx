'use client'

import { XCircle, CheckCircle2, ArrowRight, AlertTriangle, ShieldCheck, Zap, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function ProblemVsSolution() {
  const problems = [
    {
      title: 'Fugas de dinero silenciosas',
      desc: 'Boletas no anotadas, tarifas redondeadas "al ojo" o cobros omitidos sin que el dueño se entere jamás.',
    },
    {
      title: 'Discusiones amargas con clientes',
      desc: 'Conductor asegura que entró más tarde porque la hora escrita en el papel es ilegible o ambigua.',
    },
    {
      title: 'Arqueo de caja agotador cada noche',
      desc: '30 a 60 minutos sumando tickets arrugados con calculadora para intentar cuadrar el dinero del turno.',
    },
    {
      title: 'Ceguera total fuera del local',
      desc: 'Si no estás presente físicamente, no tienes idea de cuántos autos han entrado ni cuánto dinero hay en caja.',
    },
    {
      title: 'Papel térmico perdido y boletas rotas',
      desc: 'Talonarios costosos, tintas borrosas y clientes que extravían el ticket físico reclamando indemnizaciones.',
    },
  ]

  const solutions = [
    {
      title: 'Cero margen de error: cobro al segundo',
      desc: 'El cronómetro inteligente calcula el monto exacto según tu tarifa configurada sin redondeos arbitrarios.',
    },
    {
      title: 'Tickets directos al WhatsApp del cliente o térmico',
      desc: 'Envía el comprobante digital instantáneo con hora de ingreso verificada, o imprime en tu impresora de 58/80mm.',
    },
    {
      title: 'Cierre de turno y arqueo ciego en 10 segundos',
      desc: 'Reporte inmediato discriminado por efectivo, tarjetas de débito/crédito y transferencias. Exporta a Excel o PDF.',
    },
    {
      title: 'Monitoreo en vivo desde tu celular 24/7',
      desc: 'Supervisa vehículos dentro, rotación y dinero recaudado en tiempo real desde tu casa o de vacaciones.',
    },
    {
      title: 'Auditoría antifraude con registro multi-cajero',
      desc: 'Cada cobro, anulación y apertura de caja queda registrada con usuario, fecha y hora exacta.',
    },
  ]

  return (
    <section id="comparativa" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-4 py-1.5 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transformación Comercial</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          ¿Cuánto dinero y tiempo estás perdiendo hoy en tu estacionamiento?
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Los métodos antiguos basados en talonarios manuales, libretas o planillas de Excel generan descontrol operativo y fugas económicas. Compara la realidad de ambos mundos:
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">
        {/* Pain Column */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-rose-500/20 bg-rose-950/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-rose-500/15 border-b border-l border-rose-500/20 px-4 py-1 rounded-bl-xl text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Método Tradicional
          </div>

          <div>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block mb-1">
                La vieja escuela (Papel / Excel)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Riesgo, fugas y descontrol diario
              </h3>
            </div>

            <div className="space-y-4 my-6">
              {problems.map((prob, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3 rounded-2xl bg-zinc-950/50 border border-rose-500/10">
                  <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-200">{prob.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{prob.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-rose-500/15 flex items-center justify-between text-xs text-rose-300 font-semibold">
            <span>Resultado: Descuadres frecuentes</span>
            <span className="bg-rose-500/20 px-3 py-1 rounded-lg border border-rose-500/30">
              Hasta -15% de ingresos perdidos
            </span>
          </div>
        </div>

        {/* Solution Column */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-amber-400/50 bg-gradient-to-b from-amber-950/20 via-zinc-900/90 to-zinc-950/90 shadow-2xl shadow-amber-500/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-amber-500 text-black px-4 py-1 rounded-bl-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <Zap className="w-3.5 h-3.5 fill-black" />
            ParkControl PRO SaaS
          </div>

          <div>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                La solución inteligente 2026
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Control blindado, velocidad y rentabilidad
              </h3>
            </div>

            <div className="space-y-4 my-6">
              {solutions.map((sol, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3 rounded-2xl bg-zinc-900/80 border border-amber-500/20 hover:border-amber-400/40 transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{sol.title}</h4>
                    <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{sol.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantía de control y 100% de datos en la nube</span>
            </div>
            <Link
              href="/register"
              className="w-full sm:w-auto font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 group cursor-pointer"
            >
              <span>Empezar con ParkControl</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Proof Strip */}
      <div className="mt-12 max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Impacto financiero comprobado</p>
            <p className="text-xs text-zinc-400">
              Negocios que migran a ParkControl recuperan en promedio entre <strong>+$180.000 y +$450.000 CLP al mes</strong> en fugas evitadas.
            </p>
          </div>
        </div>
        <Link
          href="#roi-calculator"
          className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4 flex-shrink-0"
        >
          Calcular tu retorno exacto ↓
        </Link>
      </div>
    </section>
  )
}
