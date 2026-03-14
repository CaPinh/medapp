'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou senha incorretos. Tente novamente.')
      setLoading(false)
      return
    }

    // Hard redirect to force middleware to pick up the session
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-fuchsia-600 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                    <svg width="72" height="65" viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="goldGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%" stopColor="#8B7320"/>
                  <stop offset="50%" stopColor="#D4AF37"/>
                  <stop offset="100%" stopColor="#F0D060"/>
                </linearGradient>
              </defs>
              {/* Center petal */}
              <path d="M150 20 C128 50 128 100 150 125 C172 100 172 50 150 20Z"
                fill="none" stroke="url(#goldGrad)" strokeWidth="7" strokeLinejoin="round"/>
              {/* Left petal */}
              <path d="M146 118 C120 100 80 100 66 74 C78 48 108 54 128 76 C140 92 146 118 146 118Z"
                fill="none" stroke="url(#goldGrad)" strokeWidth="7" strokeLinejoin="round"/>
              {/* Right petal */}
              <path d="M154 118 C180 100 220 100 234 74 C222 48 192 54 172 76 C160 92 154 118 154 118Z"
                fill="none" stroke="url(#goldGrad)" strokeWidth="7" strokeLinejoin="round"/>
              {/* Base arc */}
              <path d="M64 76 Q150 148 236 76"
                fill="none" stroke="url(#goldGrad)" strokeWidth="7" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-white text-3xl font-bold">FisioRoland</h1>
          <p className="text-white/70 text-sm mt-1">Carolina Roland</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-gray-800 text-xl font-bold text-center mb-1">Bem-vindo</h2>
          <p className="text-gray-500 text-sm text-center mb-6">Entre com suas credenciais</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input" style={{ paddingLeft: '2.25rem' }}
                  placeholder="seu@email.com" required autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Senha</label>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10" style={{ paddingLeft: '2.25rem' }}
                  placeholder="••••••••" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Entrando...</>
                : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            Acesso restrito ao médico responsável
          </p>
        </div>
      </div>
    </div>
  )
}
