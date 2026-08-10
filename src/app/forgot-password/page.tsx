'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getURL } from '@/lib/utils'
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const redirectUrl = getURL('/auth/callback?next=/reset-password')
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        setError(error.message || 'Ocurrió un error al solicitar el enlace. Intenta de nuevo.')
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('Error de conexión. Revisa tu red e intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-fade-in relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-black mx-auto mb-4 shadow-xl shadow-amber-500/20">
            <KeyRound className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-white">¿Olvidaste tu contraseña?</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Ingresa tu email y te enviaremos las instrucciones para restablecerla.
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-7">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Enlace Enviado</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Hemos enviado un correo a <span className="text-amber-400 font-medium">{email}</span> con las instrucciones para restablecer tu contraseña.
              </p>
              <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 text-xs text-zinc-500">
                💡 Revisa también tu carpeta de spam o correo no deseado.
              </div>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-semibold underline mt-2"
              >
                ¿No recibiste el correo? Reintentar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Email Registrado
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 transition-all pl-11"
                  />
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm animate-shake">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                {loading ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}
              </button>
            </form>
          )}
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
