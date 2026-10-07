'use client'

import { useState } from 'react'
import { HelpCircle, ChevronDown, MessageCircle } from 'lucide-react'

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const faqs = [
    {
      q: '¿Necesito comprar computadores caros o instalar programas pesados?',
      a: 'No. ParkControl es una aplicación web moderna (PWA) basada en la nube. Puedes utilizarla directamente desde cualquier teléfono celular (Android o iPhone), tablet económica o notebook que ya tengas en tu garita de cobro. No requiere instalaciones ni soporte técnico presencial.',
    },
    {
      q: '¿Cómo funciona el comprobante digital por WhatsApp?',
      a: 'Al registrar el ingreso o salida del vehículo, puedes presionar el botón de WhatsApp e ingresar el número del conductor. El sistema genera automáticamente un ticket digital formal con la patente, hora exacta de entrada, minutos transcurridos y el monto cobrado. Es rápido, ecológico y a los clientes les encanta.',
    },
    {
      q: '¿Es compatible con impresoras térmicas de tickets tradicionales?',
      a: 'Sí, totalmente. Si prefieres entregar un ticket físico de papel, ParkControl se comunica de forma estándar con cualquier impresora térmica de 58mm u 80mm vía Bluetooth o USB. El ticket sale formateado con el nombre de tu estacionamiento, RUT, patente y monto.',
    },
    {
      q: '¿Puedo tener múltiples cajeros y turnos rotativos?',
      a: 'Por supuesto. Como administrador puedes crear credenciales separadas para tus operarios o cajeros. Al terminar cada turno, el cajero realiza un "arqueo ciego" (ingresa el dinero contado) y el sistema calcula si hay faltantes o sobrantes. Cada movimiento queda registrado en la auditoría.',
    },
    {
      q: '¿Puedo supervisar el estacionamiento si no estoy en el local?',
      a: 'Sí, 24 horas al día, 7 días a la semana. Solo ingresas a tu cuenta desde tu propio teléfono móvil o computador personal y podrás ver en vivo cuántos autos hay adentro, la recaudación acumulada del día y el historial de cierres de caja.',
    },
    {
      q: '¿Cómo funciona la prueba gratuita de 14 días?',
      a: 'Crear tu cuenta toma menos de 1 minuto y no te pedimos tarjeta de crédito ni datos bancarios. Tienes 14 días completos para probar ParkControl en tu estacionamiento real. Si te gusta, puedes suscribirte a cualquiera de nuestros planes; si no, tu cuenta pasa automáticamente al plan básico sin costo.',
    },
  ]

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx)
  }

  return (
    <section id="faq" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-400 bg-sky-400/10 border border-sky-400/20 px-4 py-1.5 rounded-full mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Resolvemos tus Dudas</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Preguntas frecuentes de operadores y dueños
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Todo lo que necesitas saber antes de dar el salto hacia un estacionamiento digital y rentable.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx

          return (
            <div
              key={idx}
              className={`glass-card rounded-2xl border transition-all overflow-hidden ${
                isOpen ? 'border-amber-400/40 bg-zinc-900/90' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
              >
                <span className="text-sm sm:text-base font-bold text-white leading-snug">
                  {faq.q}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform ${
                    isOpen ? 'rotate-180 bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/5 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Still have questions banner */}
      <div className="mt-12 text-center">
        <p className="text-xs text-zinc-400 mb-3">
          ¿Tienes una pregunta específica sobre las tarifas o tu tipo de estacionamiento?
        </p>
        <a
          href="https://wa.me/56900000000?text=Hola,%20tengo%20una%20consulta%20sobre%20ParkControl"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-5 py-2.5 rounded-xl transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Conversar con soporte técnico por WhatsApp</span>
        </a>
      </div>
    </section>
  )
}
