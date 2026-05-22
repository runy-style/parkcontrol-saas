import Link from 'next/link'
import { CarFront, BarChart3, Shield, Smartphone, Globe, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center font-black text-black text-lg shadow-lg shadow-amber-500/20">P</div>
          <div>
            <p className="font-bold text-white leading-tight">ParkControl</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Sistema de Gestión</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors px-4 py-2">
            Iniciar Sesión
          </Link>
          <Link href="/register" className="text-sm font-bold bg-amber-400 hover:bg-amber-300 text-black px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20">
            Comenzar Gratis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Plataforma Profesional de Estacionamientos
        </div>
        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
          Controla tu estacionamiento<br />desde cualquier lugar
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Gestión de vehículos en tiempo real, reportes financieros, cierre de caja y control de usuarios. 
          Accede desde tu celular, tablet o computador. Sin instalaciones.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/25 text-base">
            🚀 Crear Cuenta Gratuita
          </Link>
          <Link href="/login" className="font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl transition-all text-base">
            Iniciar Sesión
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: CarFront, color: 'amber', title: 'Control en Tiempo Real', desc: 'Registra entradas y salidas al instante. Cronómetro automático y cobro calculado al segundo.' },
            { icon: BarChart3, color: 'sky', title: 'Reportes Financieros', desc: 'Cierre de caja descargable, historial completo, gráficos de flujo y estadísticas de ingresos.' },
            { icon: Shield, color: 'emerald', title: 'Roles y Seguridad', desc: 'Admin y cajeros con permisos separados. Cada estacionamiento tiene sus datos 100% aislados.' },
            { icon: Smartphone, color: 'purple', title: 'App en tu Celular', desc: 'Instálala en tu iPhone o Android desde el navegador. Sin ir a la App Store. Sin descargas.' },
            { icon: Globe, color: 'rose', title: 'Acceso desde Cualquier Lugar', desc: 'Datos guardados en la nube. Accede desde cualquier dispositivo con tu email y contraseña.' },
            { icon: Users, color: 'orange', title: 'Multi-Usuario', desc: 'Crea cajeros para tu equipo. El admin controla quién accede y qué puede hacer en el sistema.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="glass-card rounded-2xl p-6 hover:translate-y-[-2px] transition-all duration-300">
              <div className={`w-11 h-11 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 text-${color}-400`} />
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="text-sm text-zinc-600">ParkControl © {new Date().getFullYear()} · Plataforma SaaS de Gestión de Estacionamientos</p>
      </footer>
    </div>
  )
}
