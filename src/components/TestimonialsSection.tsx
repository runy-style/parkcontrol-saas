'use client'

import { Star, ShieldCheck, Quote, CheckCircle2, Building2 } from 'lucide-react'

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Don Marcelo Valenzuela',
      role: 'Dueño & Operador',
      business: 'Parking Los Leones · Providencia, Santiago',
      spaces: '45 plazas',
      highlight: 'Recuperó +$320.000 CLP en fugas el primer mes',
      quote:
        'Antes los turnos terminaban con descuadres inexplicables y pasaba horas sumando boletas de papel con la calculadora. Con ParkControl la caja cuadra al peso en 10 segundos y puedo vigilar la recaudación desde mi casa en el celular.',
      stars: 5,
      avatarInitials: 'MV',
      avatarColor: 'from-amber-400 to-amber-600',
    },
    {
      name: 'Carolina Rivas',
      role: 'Administradora General',
      business: 'Estacionamiento Centro · Viña del Mar',
      spaces: '70 plazas',
      highlight: '0 discusiones por minutos de estadía',
      quote:
        'El cálculo al segundo eliminó por completo los reclamos de clientes por redondeos de tarifa. Además, poder enviar el comprobante directamente al WhatsApp del conductor nos diferenció de todos los estacionamientos vecinos.',
      stars: 5,
      avatarInitials: 'CR',
      avatarColor: 'from-sky-400 to-sky-600',
    },
    {
      name: 'Roberto Morales',
      role: 'Socio Director',
      business: 'Red Parking Norte · La Serena / Coquimbo',
      spaces: '110 plazas en 2 sucursales',
      highlight: 'Implementado en celulares sin comprar PCs caros',
      quote:
        'Comenzamos a usarlo en 5 minutos en dos teléfonos que ya teníamos en la garita. La velocidad para registrar patentes es asombrosa y las exportaciones a Excel para el contador nos ahorran días enteros de trabajo.',
      stars: 5,
      avatarInitials: 'RM',
      avatarColor: 'from-emerald-400 to-emerald-600',
    },
  ]

  return (
    <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-4 py-1.5 rounded-full mb-3">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>Casos de Éxito Reales</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          La confianza de quienes administran estacionamientos todos los días
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Dueños y administradores que pasaron del desorden del papel a la tranquilidad de un sistema automatizado en la nube.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((item, idx) => (
          <div
            key={idx}
            className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 hover:border-amber-400/30 transition-all flex flex-col justify-between relative group"
          >
            {/* Top quote icon */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                {[...Array(item.stars)].map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verificado
              </span>
            </div>

            {/* Quote content */}
            <div className="space-y-4 mb-6">
              <p className="text-zinc-300 text-sm leading-relaxed italic">
                &ldquo;{item.quote}&rdquo;
              </p>

              <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20">
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {item.highlight}
                </p>
              </div>
            </div>

            {/* Author info */}
            <div className="pt-4 border-t border-white/10 flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.avatarColor} text-black font-black text-sm flex items-center justify-center flex-shrink-0 shadow-md`}
              >
                {item.avatarInitials}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{item.name}</p>
                <p className="text-xs text-zinc-400">{item.role}</p>
                <p className="text-[11px] text-zinc-500 font-medium truncate max-w-[200px]">
                  {item.business} ({item.spaces})
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust summary metrics banner */}
      <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-3xl bg-zinc-900/60 border border-white/10 text-center">
        <div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">4.9 / 5</p>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">Satisfacción media</p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">+150K</p>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">Vehículos procesados</p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-black text-sky-400">&lt; 3 seg</p>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">Registro por patente</p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-black text-purple-400">99.9%</p>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">Uptime en la nube</p>
        </div>
      </div>
    </section>
  )
}
