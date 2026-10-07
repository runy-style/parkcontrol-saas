'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

export default function FloatingWhatsApp() {
  const [tooltipVisible, setTooltipVisible] = useState(true)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3 group">
      {tooltipVisible && (
        <div className="hidden sm:flex items-center gap-2 bg-zinc-900/95 text-white border border-emerald-500/30 px-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-md animate-fade-in text-xs max-w-[220px]">
          <span className="text-zinc-200">
            ¿Dudas sobre tu estacionamiento? <strong className="text-emerald-400">¡Hablemos!</strong>
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setTooltipVisible(false)
            }}
            className="text-zinc-400 hover:text-white p-0.5 rounded"
            title="Cerrar mensaje"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <a
        href="https://wa.me/56900000000?text=Hola,%20estoy%20viendo%20ParkControl%20y%20me%20gustar%C3%ADa%20hacer%20una%20consulta%20comercial"
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all cursor-pointer"
        aria-label="Contactar por WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-zinc-950 animate-pulse" />
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  )
}
