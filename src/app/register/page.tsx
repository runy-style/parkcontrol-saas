'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { registerAction } from './actions'
import { Building2, User, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [orgName, setOrgName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setLoading(true)
    setError('')

    // 1. Crear cuenta vía Server Action (usa service role, sin depender de sesión)
    const result = await registerAction({ orgName, fullName, email, password })
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // 2. Iniciar sesión con las credenciales recién creadas
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) {
      setError('Cuenta creada. Ve a Iniciar Sesión para entrar.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const fields = [
    { label: 'Nombre del Estacionamiento', icon: Building2, value: orgName, set: setOrgName, placeholder: 'Ej: Parking Central San Martín', type: 'text' },
    { label: 'Tu Nombre Completo', icon: User, value: fullName, set: setFullName, placeholder: 'Juan Pérez', type: 'text' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center font-black text-black text-2xl mx-auto mb-4 shadow-xl shadow-amber-500/20">P</div>
          <h1 className="text-2xl font-black text-white">Crea tu cuenta gratis</h1>
          <p className="text-zinc-500 text-sm mt-1">Sin tarjeta de crédito · Lista en segundos</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-8 bg-amber-400' : s < step ? 'w-4 bg-amber-400/60' : 'w-4 bg-zinc-700'}`} />
          ))}
        </div>

        <div className="glass-card rounded-2xl p-7">
          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); if (!orgName || !fullName) return; setStep(2) } : handleRegister}
            className="flex flex-col gap-5">

            {/* Step 1: org + name */}
            {step === 1 && (
              <>
                {fields.map(({ label, icon: Icon, value, set, placeholder, type }) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Icon className="w-3 h-3" /> {label}
                    </label>
                    <input
                      type={type} value={value} onChange={e => set(e.target.value)}
                      placeholder={placeholder} required
                      className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 transition-all"
                    />
                  </div>
                ))}
                <button type="submit"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-amber-500/20">
                  Continuar →
                </button>
              </>
            )}

            {/* Step 2: email + password */}
            {step === 2 && (
              <>
                {/* Summary */}
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-4 py-3 flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-400">{orgName}</p>
                    <p className="text-xs text-zinc-500">{fullName}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> Email de acceso
                  </label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com" required
                    className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres" required minLength={8}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 transition-all pr-11"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength */}
                  <div className="flex gap-1 mt-1">
                    {[8, 12, 16].map(len => (
                      <div key={len} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${password.length >= len ? 'bg-emerald-400' : 'bg-zinc-800'}`} />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm animate-shake">
                    ⚠️ {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => { setStep(1); setError('') }}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 font-bold py-3 rounded-xl transition-all text-sm">
                    ← Atrás
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 text-black font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-amber-500/20">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Creando...</>
                      : '🚀 Crear Cuenta'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-zinc-600 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
