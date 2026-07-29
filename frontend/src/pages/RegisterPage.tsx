import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(name, email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
        CreditPilot
      </p>
      <h1 className="mb-2 text-4xl text-[var(--ink)]">Create account</h1>
      <p className="mb-8 text-[var(--muted)]">Start tracking utilization and payment timing.</p>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Password (min 8 chars)</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </label>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 font-semibold text-white hover:bg-[var(--accent-dark)] disabled:opacity-60"
        >
          {loading ? 'Creating…' : 'Sign up'}
        </button>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-[var(--accent-dark)]">
          Log in
        </Link>
      </p>
    </main>
  )
}
