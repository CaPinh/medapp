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
            <svg width="56" height="56" viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Center petal - tall upright */}
              <path d="M60 8 C60 8 44 28 44 50 C44 62 51 70 60 72 C69 70 76 62 76 50 C76 28 60 8 60 8Z"
                fill="none" stroke="#C9A96E" strokeWidth="3.5" strokeLinejoin="round"/>
              {/* Left petal */}
              <path d="M44 68 C44 68 22 58 16 40 C12 28 16 18 24 14 C32 10 42 18 46 34 C50 46 50 58 44 68Z"
                fill="none" stroke="#C9A96E" strokeWidth="3.5" strokeLinejoin="round"/>
              {/* Right petal */}
              <path d="M76 68 C76 68 98 58 104 40 C108 28 104 18 96 14 C88 10 78 18 74 34 C70 46 70 58 76 68Z"
                fill="none" stroke="#C9A96E" strokeWidth="3.5" strokeLinejoin="round"/>
              {/* Inner left line detail */}
              <path d="M44 68 C48 58 54 50 60 72"
                fill="none" stroke="#C9A96E" strokeWidth="2.5" strokeLinejoin="round" opacity="0.8"/>
              {/* Inner right line detail */}
              <path d="M76 68 C72 58 66 50 60 72"
                fill="none" stroke="#C9A96E" strokeWidth="2.5" strokeLinejoin="round" opacity="0.8"/>
              {/* Left leaf */}
              <path d="M30 85 C30 85 10 80 8 66 C16 63 30 70 36 80Z"
                fill="none" stroke="#C9A96E" strokeWidth="3" strokeLinejoin="round"/>
              {/* Right leaf */}
              <path d="M90 85 C90 85 110 80 112 66 C104 63 90 70 84 80Z"
                fill="none" stroke="#C9A96E" strokeWidth="3" strokeLinejoin="round"/>
              {/* Base connector */}
              <path d="M36 82 C44 86 52 88 60 88 C68 88 76 86 84 82"
                fill="none" stroke="#C9A96E" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-white text-3xl font-bold">FisioRoland</h1>
          <p className="text-white/70 text-sm mt-1">Fisioterapia</p>
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
