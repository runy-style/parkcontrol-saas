'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Sparkles, Shield, Zap, ArrowRight, MessageCircle } from 'lucide-react'

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: 'Plan Gratuito',
      badge: 'Para Comenzar',
      desc: 'Ideal para estacionamientos pequeños o validar el sistema en marcha blanca.',
      priceMonthly: 0,
      priceAnnual: 0,
      period: 'para siempre',
      popular: false,
      ctaLabel: 'Comenzar Gratis',
      ctaHref: '/register',
      ctaStyle: 'bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white',
      features: [
        'Hasta 50 vehículos por día',
        'Cálculo de cobro al segundo',
        'Cronómetro de estadía en vivo',
        '1 usuario / operador activo',
        'Acceso web & móvil PWA',
        'Cierres de caja diarios básicos',
      ],
      notIncluded: [
        'Comprobantes directos por WhatsApp',
        'Impresión térmica con código QR',
        'Exportación avanzada Excel / PDF',
        'Auditoría antifraude de anulaciones',
      ],
    },
    {
      name: 'Plan Pro Ilimitado',
      badge: 'MÁS POPULAR',
      desc: 'Para playas de estacionamiento activas que exigen control total y cero fugas.',
      priceMonthly: 19900,
      priceAnnual: 15900,
      period: 'CLP / mes',
      popular: true,
      ctaLabel: 'Probar Gratis 14 Días',
      ctaHref: '/register',
      ctaStyle: 'bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-lg shadow-amber-500/25',
      features: [
        'Vehículos y operaciones 100% ILIMITADOS',
        'Múltiples cajeros y roles (Admin / Operadores)',
        'Envío de comprobantes por WhatsApp en 1 clic',
        'Compatible con impresoras térmicas (58/80mm)',
        'Arqueo ciego y cierre de turno automático',
        'Exportación completa a Excel y reportes PDF',
        'Club de clientes frecuentes y convenios mensuales',
        'Auditoría blindada antifraude con historial',
        'Soporte prioritario directo por WhatsApp',
      ],
      notIncluded: [],
    },
    {
      name: 'Plan Red & Cadenas',
      badge: 'Multi-Sucursal',
      desc: 'Para administradores con 2 o más playas de estacionamiento o edificios comerciales.',
      priceMonthly: 39900,
      priceAnnual: 31900,
      period: 'CLP / mes',
      popular: false,
      ctaLabel: 'Hablar con un Asesor',
      ctaHref: 'https://wa.me/56900000000?text=Hola,%20me%20interesa%20el%20Plan%20Red%20Multi-Sucursal%20de%20ParkControl',
      ctaStyle: 'bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white',
      features: [
        'Todo lo incluido en el Plan Pro',
        'Múltiples sucursales bajo un solo panel matriz',
        'Métricas comparativas entre estacionamientos',
        'Roles jerárquicos y supervisores de zona',
        'Capacitación inicial remota para tu personal',
        'Integración con barreras vehiculares (API)',
        'Facturación con factura electrónica para empresa',
        'Soporte telefónico de emergencia 24/7',
      ],
      notIncluded: [],
    },
  ]

  const formatPrice = (amount: number) => {
    if (amount === 0) return '$0'
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <section id="pricing" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-4 py-1.5 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Precios Claros y Transparentes</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Comienza gratis y escala a medida que tu negocio crece
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8">
          Sin costos de instalación, sin amarras de permanencia y sin necesidad de comprar equipos especiales.
        </p>

        {/* Annual / Monthly Toggle */}
        <div className="inline-flex items-center gap-3 bg-zinc-900/90 border border-white/10 p-1.5 rounded-2xl shadow-inner">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              !isAnnual
                ? 'bg-amber-400 text-black shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Facturación Mensual
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              isAnnual
                ? 'bg-amber-400 text-black shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Facturación Anual</span>
            <span className="text-[10px] font-extrabold uppercase bg-emerald-400 text-black px-2 py-0.5 rounded-full">
              Ahorra 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        {plans.map((plan, idx) => {
          const currentPrice = isAnnual ? plan.priceAnnual : plan.priceMonthly

          return (
            <div
              key={idx}
              className={`glass-card rounded-3xl p-7 sm:p-8 flex flex-col justify-between relative transition-all duration-300 ${
                plan.popular
                  ? 'border-2 border-amber-400/60 bg-gradient-to-b from-amber-950/25 via-zinc-900/95 to-zinc-950 shadow-2xl shadow-amber-500/15 md:-translate-y-2'
                  : 'border border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="mb-4">
                  {!plan.popular && (
                    <span className="text-xs font-bold text-zinc-400 bg-zinc-900/80 px-3 py-1 rounded-full border border-white/10 inline-block mb-2">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1 min-h-[36px]">{plan.desc}</p>
                </div>

                <div className="my-6 pb-6 border-b border-white/10">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-4xl sm:text-5xl font-black ${
                        plan.popular ? 'text-amber-400' : 'text-white'
                      }`}
                    >
                      {formatPrice(currentPrice)}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">/ {plan.period}</span>
                  </div>
                  {isAnnual && plan.priceMonthly > 0 && (
                    <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                      Facturado anualmente ({formatPrice(plan.priceAnnual * 12)} / año)
                    </p>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Qué incluye:
                  </p>
                  <ul className="space-y-2.5 text-xs text-zinc-300">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            plan.popular ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        />
                        <span className={plan.popular && fIdx < 3 ? 'font-semibold text-white' : ''}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {plan.notIncluded && plan.notIncluded.length > 0 && (
                    <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                      {plan.notIncluded.map((nInc, nIdx) => (
                        <p key={nIdx} className="text-xs text-zinc-500 line-through">
                          {nInc}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {plan.ctaHref.startsWith('http') ? (
                  <a
                    href={plan.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3.5 rounded-xl text-center text-xs font-black transition-all flex items-center justify-center gap-2 ${plan.ctaStyle}`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{plan.ctaLabel}</span>
                  </a>
                ) : (
                  <Link
                    href={plan.ctaHref}
                    className={`w-full py-3.5 rounded-xl text-center text-xs font-black transition-all flex items-center justify-center gap-2 ${plan.ctaStyle}`}
                  >
                    <span>{plan.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                {plan.popular && (
                  <p className="text-[11px] text-zinc-400 text-center mt-2.5 font-medium">
                    14 días de prueba gratis · Sin tarjeta de crédito
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Reversal Guarantee Box */}
      <div className="mt-14 max-w-3xl mx-auto p-5 rounded-2xl bg-zinc-900/60 border border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
        <Shield className="w-7 h-7 text-amber-400 flex-shrink-0" />
        <p className="text-xs text-zinc-300">
          <strong>Garantía de Satisfacción 100%:</strong> Puedes cancelar o cambiar de plan en cualquier momento desde tu panel sin penalizaciones ni contratos forzosos. Emitimos boleta o factura con RUT para empresas en Chile.
        </p>
      </div>
    </section>
  )
}
