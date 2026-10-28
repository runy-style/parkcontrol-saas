import Link from 'next/link'
import {
  CarFront,
  BarChart3,
  Shield,
  Smartphone,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Clock,
  Printer,
  BadgePercent,
  Receipt,
  FileSpreadsheet,
  Lock,
  MessageCircle,
  Building2,
  ChevronRight,
  ShieldCheck,
  Star,
} from 'lucide-react'
import DashboardPreview3D from '@/components/DashboardPreview3D'
import InteractiveSimulator from '@/components/InteractiveSimulator'
import CommercialNavbar from '@/components/CommercialNavbar'
import ProblemVsSolution from '@/components/ProblemVsSolution'
import RoiCalculator from '@/components/RoiCalculator'
import TestimonialsSection from '@/components/TestimonialsSection'
import PricingSection from '@/components/PricingSection'
import FaqSection from '@/components/FaqSection'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden relative w-full flex flex-col items-center">
      {/* Ambient Floating Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="ambient-orb absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-[160px]" />
        <div
          className="ambient-orb absolute top-1/3 -right-32 w-[550px] h-[550px] bg-sky-500/10 rounded-full blur-[150px]"
          style={{ animationDelay: '-8s' }}
        />
        <div
          className="ambient-orb absolute bottom-1/4 -left-32 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px]"
          style={{ animationDelay: '-12s' }}
        />
      </div>

      {/* Floating WhatsApp Widget */}
      <FloatingWhatsApp />

      {/* Sticky Commercial Navbar */}
      <CommercialNavbar />

      <main className="w-full flex flex-col items-center z-10">
        {/* 1. HERO SECTION */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-20 pb-16 flex flex-col items-center justify-center text-center">
          {/* Commercial Trust Pill */}
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/25 px-4 py-2 rounded-full mb-8 backdrop-blur-md shadow-lg shadow-amber-500/10 mx-auto">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>El Software N°1 para Playas y Estacionamientos en Chile</span>
            <span className="hidden sm:inline text-zinc-500">|</span>
            <span className="hidden sm:inline text-amber-200/80 font-medium">Versión SaaS 2026</span>
          </div>

          {/* Main Sales Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.12] mb-6 text-center w-full max-w-5xl mx-auto">
            Controla tu estacionamiento en tiempo real, <br />
            <span className="text-gradient-amber inline-block">elimina fugas de dinero y cobra al segundo</span>
          </h1>

          {/* Subtitle addressing core benefits */}
          <p className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal text-center">
            Reemplaza las boletas de papel y las planillas de Excel por una plataforma moderna en la nube. 
            Registra patentes en 3 segundos, envía tickets por WhatsApp, cierra turnos sin descuadres y supervisa todo desde tu celular.
          </p>

          {/* Commercial Call to Actions */}
          <div className="w-full flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto font-black bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/25 text-base flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <span>Comenzar Prueba Gratis (14 Días)</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="https://wa.me/56900000000?text=Hola,%20quisiera%20una%20demostraci%C3%B3n%20comercial%20de%20ParkControl"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto font-bold bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 hover:border-emerald-500/30 text-white px-7 py-4 rounded-2xl transition-all text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>Contactar por WhatsApp</span>
            </a>
          </div>

          <p className="text-xs text-zinc-400 mt-4 font-medium flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sin tarjeta de crédito requerida · Activación instantánea en 2 minutos</span>
          </p>

          {/* Operational Trust Signals Strip */}
          <div className="w-full max-w-5xl mx-auto mt-14 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center justify-items-center">
            <div className="flex items-center gap-2 text-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-xs text-zinc-300 font-semibold">Cobro calculado al segundo</span>
            </div>
            <div className="flex items-center gap-2 text-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-xs text-zinc-300 font-semibold">Tickets directos por WhatsApp</span>
            </div>
            <div className="flex items-center gap-2 text-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span className="text-xs text-zinc-300 font-semibold">Impresora térmica 58/80mm</span>
            </div>
            <div className="flex items-center gap-2 text-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="text-xs text-zinc-300 font-semibold">Arqueo y cierre en 10 seg</span>
            </div>
          </div>
        </section>

        {/* 2. LIVE DASHBOARD PREVIEW */}
        <section id="dashboard-preview" className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 flex flex-col items-center text-center">
          <div className="text-center mb-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 bg-zinc-900/80 border border-white/10 px-4 py-1.5 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Plataforma Diseñada para la Velocidad</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Todo lo que ocurre en tu estacionamiento, en una sola pantalla
            </h2>
            <p className="text-zinc-400 text-sm mt-2 max-w-2xl mx-auto">
              Visualiza vehículos activos, cronómetros de cobro en tiempo real, dinero recaudado y nivel de ocupación sin recargar la página.
            </p>
          </div>
          <DashboardPreview3D />
        </section>

        {/* 3. ANTES VS AHORA (PROBLEM VS SOLUTION) */}
        <ProblemVsSolution />

        {/* 4. INTERACTIVE LIVE SIMULATOR */}
        <div id="simulator" className="w-full flex justify-center">
          <InteractiveSimulator />
        </div>

        {/* 5. ROI / REVENUE CALCULATOR */}
        <RoiCalculator />

        {/* 6. ADVANCED COMMERCIAL FEATURES (BENTO GRID 2.0) */}
        <section id="features" className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20 flex flex-col items-center text-center">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-400 bg-sky-400/10 border border-sky-400/20 px-4 py-1.5 rounded-full mb-3 mx-auto">
              <Zap className="w-3.5 h-3.5" />
              <span>Funcionalidades Operativas Clave</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white text-center">
              Cada herramienta diseñada para blindar tu caja y agilizar la atención
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
              Diseñado mano a mano con administradores reales para resolver los dolores cotidianos del estacionamiento.
            </p>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto text-left">
            {/* Bento Item 1 - Featured Highlight */}
            <div className="md:col-span-2 glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 hover:border-amber-400/50 transition-all group relative overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-950">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-400 group-hover:scale-110 transition-transform">
                <CarFront className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-3">
                Cobro al Segundo con Cronómetro en Tiempo Real
              </h3>
              <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                Ingresa patentes con atajos rápidos. El sistema calcula al milisegundo el monto exacto según tu tarifa configurada (base fraccionada, por minuto o por hora). Cero margen para que el cajero redondee a la baja o cometa errores manuales.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 bg-amber-400/10 text-amber-400 px-3 py-1.5 rounded-lg border border-amber-400/20">
                  <Zap className="w-4 h-4" /> Búsqueda predictiva de patentes
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-400/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                  <Clock className="w-4 h-4" /> Cronómetro visible al cliente
                </span>
                <span className="flex items-center gap-1.5 bg-sky-400/10 text-sky-400 px-3 py-1.5 rounded-lg border border-sky-400/20">
                  <BadgePercent className="w-4 h-4" /> Tarifas diferenciadas auto/moto/camión
                </span>
              </div>
            </div>

            {/* Bento Item 2: WhatsApp & Thermal Ticket */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group bg-zinc-900/80">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Comprobantes WhatsApp & Térmicos</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                Envía el ticket digital directo al WhatsApp del conductor o imprime comprobantes físicos en impresoras térmicas de 58mm y 80mm vía Bluetooth o USB.
              </p>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Ahorra 100% en rollos de papel si lo deseas
              </span>
            </div>

            {/* Bento Item 3: Shift Closure & Blind Cash Count */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-sky-500/20 hover:border-sky-500/40 transition-all group bg-zinc-900/80">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-6 text-sky-400 group-hover:scale-110 transition-transform">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Arqueo Ciego y Cierre de Turno</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                El cajero declara el efectivo sin ver el total acumulado. El sistema compara, detecta descuadres al instante y genera el acta de cierre.
              </p>
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                <FileSpreadsheet className="w-4 h-4" /> Exporta a Excel y PDF para el contador
              </span>
            </div>

            {/* Bento Item 4: Loyalty & Monthly Passes */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all group bg-zinc-900/80">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Clientes Frecuentes y Convenios</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                Fideliza a conductores recurrentes (ej. cada 10 visitas una estadía gratis) y gestiona patentes con abono mensual o tarifa preferencial.
              </p>
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Detección de patentes VIP y convenios
              </span>
            </div>

            {/* Bento Item 5: Multi-operator & Anti-fraud */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/20 hover:border-amber-500/40 transition-all group bg-zinc-900/80">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Roles y Auditoría Antifraude</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                Distingue entre Administrador y Cajeros. Cada eliminación de ticket, anulación o modificación requiere confirmación y queda registrada en el log de auditoría.
              </p>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Lock className="w-4 h-4" /> Registro inmutable de cada transacción
              </span>
            </div>

            {/* Bento Item 6: Mobile PWA No installation */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-rose-500/20 hover:border-rose-500/40 transition-all group bg-zinc-900/80">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-6 text-rose-400 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">PWA Móvil en Cualquier Dispositivo</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                Instálala con 1 toque en celulares económicos Android o iPhone, tablets o notebooks sin descargar instaladores pesados ni pagar licencias por equipo.
              </p>
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Cero costos en hardware adicional
              </span>
            </div>
          </div>
        </section>

        {/* 7. REAL TESTIMONIALS SECTION */}
        <TestimonialsSection />

        {/* 8. COMMERCIAL PRICING */}
        <PricingSection />

        {/* 9. FAQ ACCORDION */}
        <FaqSection />

        {/* 10. FINAL HIGH-CONVERSION CTA BANNER */}
        <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16">
          <div className="relative rounded-3xl p-8 sm:p-14 overflow-hidden border-2 border-amber-400/40 bg-gradient-to-br from-amber-950/40 via-zinc-900/95 to-zinc-950 text-center shadow-2xl shadow-amber-500/20">
            {/* Background Glow Orbs */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-300 bg-amber-400/15 border border-amber-400/30 px-4 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Moderniza tu Estacionamiento Hoy</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Empieza a rentabilizar y ordenar tu estacionamiento en menos de 3 minutos
              </h2>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                Únete a los administradores que ya blindaron su caja contra fugas de dinero y eliminaron las quejas de clientes. Pruébalo gratis por 14 días sin ingresar tarjeta.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto font-black bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/25 text-base flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Crear Cuenta Gratuita</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="https://wa.me/56900000000?text=Hola,%20quisiera%20asesor%C3%ADa%20para%20contratar%20ParkControl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto font-bold bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 hover:border-emerald-500/30 text-white px-7 py-4 rounded-2xl transition-all text-base flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span>Hablar con un Asesor Comercial</span>
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 14 días sin costo
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sin tarjeta de crédito
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Facturación mensual o anual
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 11. COMPLETE COMMERCIAL FOOTER */}
      <footer className="relative z-10 w-full border-t border-white/10 py-16 bg-zinc-950/95">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand column */}
            <div className="md:col-span-1 space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center font-black text-black text-base shadow-md">
                  P
                </div>
                <span className="text-lg font-bold text-white">ParkControl PRO</span>
              </Link>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Plataforma SaaS en la nube para control, cobro automatizado y gestión integral de playas de estacionamiento y garajes comerciales.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Sistemas operando 100% normal</span>
              </div>
            </div>

            {/* Product navigation */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Plataforma
              </p>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li>
                  <a href="#dashboard-preview" className="hover:text-amber-400 transition-colors">
                    Panel de Control
                  </a>
                </li>
                <li>
                  <a href="#simulator" className="hover:text-amber-400 transition-colors">
                    Simulador en Vivo
                  </a>
                </li>
                <li>
                  <a href="#comparativa" className="hover:text-amber-400 transition-colors">
                    Antes vs. ParkControl
                  </a>
                </li>
                <li>
                  <a href="#roi-calculator" className="hover:text-amber-400 transition-colors">
                    Calculadora de Ganancias
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-amber-400 transition-colors">
                    Planes y Tarifas
                  </a>
                </li>
              </ul>
            </div>

            {/* Features column */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Funcionalidades
              </p>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li>Cobro al segundo</li>
                <li>Tickets por WhatsApp</li>
                <li>Impresión térmica Bluetooth/USB</li>
                <li>Cierre de turno y arqueo ciego</li>
                <li>Programa de clientes frecuentes</li>
                <li>Auditoría y multi-cajeros</li>
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Soporte y Ventas
              </p>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li>
                  <a
                    href="https://wa.me/56900000000?text=Hola,%20necesito%20asistencia%20con%20ParkControl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp: +56 9 Contacto</span>
                  </a>
                </li>
                <li>Santiago, Chile · Cobertura Nacional</li>
                <li>Emisión de boletas y facturas con RUT</li>
                <li>
                  <Link href="/login" className="hover:text-amber-400 transition-colors">
                    Acceso para clientes existentes
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>
              © {new Date().getFullYear()} ParkControl SaaS. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <span className="hover:text-zinc-400 cursor-pointer">Términos del Servicio</span>
              <span className="hover:text-zinc-400 cursor-pointer">Política de Privacidad</span>
              <span className="hover:text-zinc-400 cursor-pointer">Seguridad de Datos</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
