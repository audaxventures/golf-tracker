'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      // If email confirmation is disabled, a session is returned immediately
      if (data.session) {
        router.push('/dashboard')
        router.refresh()
        return
      }
      // Otherwise prompt to confirm email
      setMessage('Check your email for a confirmation link, then sign in.')
      setMode('login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[--cream] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-['DM_Serif_Display'] text-4xl text-[--navy] mb-1">
            Audax Golf
          </h1>
          <div className="w-2 h-2 rounded-full bg-[--gold] mx-auto mt-2" />
          <p className="text-[--text-muted] text-sm mt-3">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[--border] shadow-sm p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">
              {message}
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
              minLength={6}
              className="w-full h-11 px-3 rounded-lg border border-[--border] bg-white text-[--text-primary] text-sm focus:outline-none focus:ring-2 focus:ring-[--navy] focus:border-transparent"
              placeholder="Min. 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#1B2A4A', color: '#ffffff' }}
            className="w-full h-12 rounded-lg font-medium text-sm transition-colors duration-150 disabled:opacity-60"
          >
            {loading
              ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
              : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <p className="text-center text-sm text-[--text-muted] mt-4">
          {mode === 'login' ? (
            <>No account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); setMessage(null) }}
                className="text-[--navy] font-medium underline underline-offset-2"
              >
                Create one
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setMessage(null) }}
                className="text-[--navy] font-medium underline underline-offset-2"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
