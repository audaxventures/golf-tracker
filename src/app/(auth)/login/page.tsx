'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[--cream] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-['DM_Serif_Display'] text-4xl text-[--navy] mb-1">
            Audax Golf
          </h1>
          <div className="w-2 h-2 rounded-full bg-[--gold] mx-auto mt-2" />
          <p className="text-[--text-muted] text-sm mt-3">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-xl border border-[--border] shadow-sm p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-[--text-muted] uppercase tracking-wide font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full h-11 px-3 rounded-lg border border-[--border] bg-white text-[--text-primary] text-sm focus:outline-none focus:ring-2 focus:ring-[--navy] focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[--text-muted] uppercase tracking-wide font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full h-11 px-3 rounded-lg border border-[--border] bg-white text-[--text-primary] text-sm focus:outline-none focus:ring-2 focus:ring-[--navy] focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[--navy] text-white hover:bg-[--navy-light] rounded-lg font-medium text-sm transition-colors duration-150 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
