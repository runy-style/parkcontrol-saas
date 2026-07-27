import Link from 'next/link'
import {
  CarFront,
  BarChart3,
  Shield,
  Smartphone,
  Globe,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  TrendingUp,
  Clock,
  Lock,
} from 'lucide-react'
import DashboardPreview3D from '@/components/DashboardPreview3D'
import InteractiveSimulator from '@/components/InteractiveSimulator'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden relative w-full flex flex-col items-center">
      {/* Animated Floating Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="ambient-orb absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px]" />
        <div
          className="ambient-orb absolute top-1/3 -right-24 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[140px]"
          style={{ animationDelay: '-8s' }}
        />
        <div
          className="ambient-orb absolute bottom-1/4 -left-24 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px]"
          style={{ animationDelay: '-12s' }}
        />
      </div>

      {/* Header / Navigation Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-zinc-950/85 border-b border-white/5 transition-all">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center font-black text-black text-lg shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              P
            </div>
            <div className="text-left">
              <p className="font-bold text-white leading-tight flex items-center gap-1.5">
                ParkControl
                <span className="text-[9px] font-extrabold uppercase bg-amber-400/10 text-amber-400 border border-amber-400/20 px-1.5 py-0.5 rounded">
                  PRO
                </span>
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                Gestión de Estacionamientos
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-400">
            <a href="#dashboard-preview" className="hover:text-amber-400 transition-colors">
              Plataforma
            </a>
            <a href="#simulator" className="hover:text-amber-400 transition-colors">
              Simulador
            </a>
            <a href="#features" className="hover:text-amber-400 transition-colors">
              Funcionalidades
            </a>
            <a href="#pricing" className="hover:text-amber-400 transition-colors">
              Planes
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors px-4 py-2 hidden sm:block"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="text-sm font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-16 sm:pt-24 pb-16 flex flex-col items-center justify-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/25 px-4 py-2 rounded-full mb-8 backdrop-blur-md shadow-lg shadow-amber-500/10 mx-auto">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Plataforma SaaS 2026 de Gestión Vehicular</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.15] mb-6 text-center w-full max-w-5xl mx-auto">
          Controla tu estacionamiento <br />
          <span className="text-gradient-amber inline-block">desde cualquier lugar</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal text-center">
          Gestión de vehículos en tiempo real, cobro calculado al segundo, reportes financieros, cierre de caja automático y control multi-usuario. Todo accesible desde tu celular, tablet o computador.
        </p>

        {/* CTA Group */}
        <div className="w-full flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
          <Link
            href="/register"
            className="w-full sm:w-auto font-black bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/25 text-base flex items-center justify-center gap-2 group cursor-pointer"
          >
            🚀 Crear Cuenta Gratuita
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#simulator"
            className="w-full sm:w-auto font-bold bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-white px-8 py-4 rounded-2xl transition-all text-base flex items-center justify-center gap-2"
          >
            Probador en Vivo
          </a>
        </div>

        {/* Highlights Bar */}
        <div className="w-full max-w-4xl mx-auto mt-14 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center justify-items-center">
          <div className="flex items-center gap-2 text-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-xs text-zinc-300 font-medium">Sin instalación requerida</span>
          </div>
          <div className="flex items-center gap-2 text-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-zinc-300 font-medium">Cobro al segundo</span>
          </div>
          <div className="flex items-center gap-2 text-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span className="text-xs text-zinc-300 font-medium">Instalable Móvil PWA</span>
          </div>
          <div className="flex items-center gap-2 text-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span className="text-xs text-zinc-300 font-medium">Datos 100% aislados</span>
          </div>
        </div>
      </section>

      {/* 2. DASHBOARD 3D PREVIEW SECTION */}
      <section id="dashboard-preview" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 flex flex-col items-center text-center">
        <div className="text-center mb-6 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-1 text-center">
            Vista Previa del Panel de Control
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center">
            Una interfaz diseñada para la velocidad operativa
          </h2>
        </div>
        <DashboardPreview3D />
      </section>

      {/* 3. INTERACTIVE SIMULATOR SECTION */}
      <section id="simulator" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 flex flex-col items-center text-center">
        <InteractiveSimulator />
      </section>

      {/* 4. BENTO GRID FEATURES SECTION */}
      <section id="features" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20 flex flex-col items-center text-center">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-400 bg-sky-400/10 border border-sky-400/20 px-4 py-1.5 rounded-full mb-3 mx-auto">
            Potencia Operativa
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white text-center">
            Diseñado para resolver cada desafío de tu estacionamiento
          </h2>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto text-left">
          {/* Bento Item 1 - Big Highlight */}
          <div className="md:col-span-2 glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/20 hover:border-amber-500/40 transition-all group relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-400 group-hover:scale-110 transition-transform">
              <CarFront className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-3">
              Control e Ingreso Vehicular en Tiempo Real
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Registra entradas y salidas con un solo clic o atajo de teclado. La plataforma calcula automáticamente la estadía transcurrida y el monto a cobrar al segundo según la tarifa configurada.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-amber-400">
              <span className="flex items-center gap-1.5 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20">
                <Zap className="w-4 h-4" /> Búsqueda por patente instantánea
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-400/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                <Clock className="w-4 h-4" /> Cronómetro en vivo
              </span>
            </div>
          </div>

          {/* Bento Item 2 */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-sky-500/20 hover:border-sky-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-6 text-sky-400 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Reportes & Cierre de Caja</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Exporta cierres de caja en Excel/PDF, examina el desglose de ingresos por turno, fecha y métodos de pago.
            </p>
          </div>

          {/* Bento Item 3 */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Seguridad Multi-Tenant</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Aislamiento total de datos con Supabase RLS. Los datos de tu estacionamiento permanecen 100% privados.
            </p>
          </div>

          {/* Bento Item 4 */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Experiencia PWA Móvil</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Instálala directamente en tu celular o tablet sin pasar por la App Store. Funciona perfecto en móviles.
            </p>
          </div>

          {/* Bento Item 5 */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-orange-500/20 hover:border-orange-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mb-6 text-orange-400 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Permisos Multi-Cajero</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Crea perfiles separados para tus cajeros. El administrador mantiene control absoluto sobre auditorías y accesos.
            </p>
          </div>
        </div>
      </section>

      {/* 5. PRICING TIERS SECTION */}
      <section id="pricing" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20 flex flex-col items-center text-center">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-4 py-1.5 rounded-full mb-3 mx-auto">
            Planes Transparentes
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white text-center">
            Comienza gratis, escala a tu ritmo
          </h2>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          {/* Plan Gratis */}
          <div className="glass-card rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Plan Gratuito</h3>
                <span className="text-xs font-bold text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-white/10">
                  Ideal Inicial
                </span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-zinc-400 text-sm"> / para siempre</span>
              </div>
              <ul className="space-y-3 text-sm text-zinc-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Registro de hasta 50 vehículos/día
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cobro al segundo y cronómetro
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Reportes básicos de caja
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Acceso móvil PWA
                </li>
              </ul>
            </div>
            <Link
              href="/register"
              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-bold text-sm rounded-xl text-center transition-colors block"
            >
              Comenzar Gratis
            </Link>
          </div>

          {/* Plan Pro */}
          <div className="glass-card rounded-3xl p-8 border-2 border-amber-400/60 bg-zinc-900/90 shadow-2xl shadow-amber-500/10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-bl-xl shadow-md">
              RECOMENDADO
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Plan Pro Ilimitado</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-black text-amber-400">$19.900</span>
                <span className="text-zinc-400 text-sm"> CLP / mes</span>
              </div>
              <ul className="space-y-3 text-sm text-zinc-300 mb-8">
                <li className="flex items-center gap-2 font-semibold text-white">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Vehículos e ingresos ilimitados
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Múltiples cajeros y roles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Exportación de cierres Excel/PDF
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Auditoría completa de caja
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Soporte prioritario 24/7
                </li>
              </ul>
            </div>
            <Link
              href="/register"
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-sm rounded-xl text-center shadow-lg shadow-amber-500/25 transition-all block cursor-pointer"
            >
              Probar Gratis 14 Días
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FOOTER SECTION */}
      <footer className="relative z-10 w-full border-t border-white/5 py-12 text-center bg-zinc-950/90">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center font-black text-black text-sm shadow-md">
              P
            </div>
            <p className="text-sm font-bold text-white">ParkControl SaaS</p>
          </div>

          <p className="text-xs text-zinc-500">
            ParkControl © {new Date().getFullYear()} · Plataforma Profesional de Estacionamientos
          </p>

          <div className="flex gap-4 text-xs text-zinc-400">
            <Link href="/login" className="hover:text-amber-400 transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="hover:text-amber-400 transition-colors">
              Crear Cuenta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
