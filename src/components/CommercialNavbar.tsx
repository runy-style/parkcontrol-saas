'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Menu, X, ArrowRight, MessageCircle } from 'lucide-react'

export default function CommercialNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Ventajas', href: '#features' },
    { label: 'Antes vs Ahora', href: '#comparativa' },
    { label: 'Simulador en Vivo', href: '#simulator' },
    { label: 'Calculadora ROI', href: '#roi-calculator' },
    { label: 'Planes', href: '#pricing' },
    { label: 'Preguntas', href: '#faq' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-zinc-950/85 border-b border-white/5 transition-all">
      {/* Top micro announcement bar */}
      <div className="w-full bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/15 border-b border-amber-400/15 py-1 px-4 text-center">
        <p className="text-[11px] sm:text-xs font-medium text-amber-200 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>¡Prueba ParkControl Pro gratis por 14 días! Sin tarjeta de crédito ni contratos forzosos.</span>
        </p>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-xl flex items-center justify-center font-black text-black text-lg shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
            P
          </div>
          <div className="text-left">
            <p className="font-bold text-white leading-tight flex items-center gap-1.5">
              ParkControl
              <span className="text-[9px] font-extrabold uppercase bg-amber-400/15 text-amber-400 border border-amber-400/30 px-1.5 py-0.5 rounded shadow-sm">
                PRO SaaS
              </span>
            </p>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
              Software para Estacionamientos
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-zinc-300">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-amber-400 transition-colors py-1 cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Header Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://wa.me/56900000000?text=Hola,%20me%20interesa%20conocer%20ParkControl%20para%20mi%20estacionamiento"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-zinc-300 hover:text-emerald-400 flex items-center gap-1.5 transition-colors px-3 py-2 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-emerald-500/20"
            title="Contacto comercial directo"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hablar con Ventas</span>
          </a>

          <Link
            href="/login"
            className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors px-3 py-2"
          >
            Iniciar Sesión
          </Link>

          <Link
            href="/register"
            className="text-xs font-black bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
          >
            <span>Probar Gratis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            href="/register"
            className="text-xs font-bold bg-amber-400 text-black px-3 py-1.5 rounded-lg sm:hidden"
          >
            Probar Gratis
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 bg-zinc-950/95 backdrop-blur-2xl px-6 py-6 space-y-4 animate-fade-in">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-zinc-200 hover:text-amber-400 py-1 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <a
              href="https://wa.me/56900000000?text=Hola,%20me%20interesa%20conocer%20ParkControl%20para%20mi%20estacionamiento"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chatear por WhatsApp con Ventas</span>
            </a>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold text-zinc-200 bg-zinc-900 border border-white/10 rounded-xl"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-black text-black bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl shadow-md shadow-amber-500/20"
              >
                Crear Cuenta
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
