import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { getReminders } from '../api/insights'
import { useAuth } from '../auth/AuthContext'
import { money } from '../lib/format'
import type { Insight } from '../types'

const severityStyles: Record<string, string> = {
  high: 'border-red-200 bg-red-50',
  medium: 'border-amber-200 bg-amber-50',
  low: 'border-emerald-200 bg-emerald-50',
  info: 'border-[var(--line)] bg-white',
}

const severityLabel: Record<string, string> = {
  high: 'Urgent',
  medium: 'Soon',
  low: 'On track',
  info: 'Info',
}

export function RemindersPage() {
  const { token } = useAuth()
  const [items, setItems] = useState<Insight[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!token) return
      setLoading(true)
      setError(null)
      try {
        const data = await getReminders(token)
        setItems(data.items)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not load reminders')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [token])

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl">Payment reminders</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          In-app alerts based on statement and due dates. Example: “Statement closes in 5 days —
          pay $70 to stay under 10%.”
        </p>
      </header>

      {error && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-[var(--muted)]">Loading reminders…</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={`${item.code}-${item.card_id ?? 'general'}-${item.title}`}
              className={`rounded-2xl border p-5 shadow-sm ${severityStyles[item.severity] ?? severityStyles.info}`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--ink)]">
                  {severityLabel[item.severity] ?? item.severity}
                </span>
                {item.days_until_statement != null && (
                  <span className="text-xs text-[var(--muted)]">
                    Statement in {item.days_until_statement}d
                  </span>
                )}
                {item.amount_to_pay != null && Number(item.amount_to_pay) > 0 && (
                  <span className="text-xs font-semibold text-[var(--accent-dark)]">
                    Pay {money(item.amount_to_pay)}
                  </span>
                )}
              </div>
              <h2 className="text-xl">{item.title}</h2>
              <p className="mt-2 text-[var(--ink)]/90">{item.message}</p>
              {item.action_path && (
                <Link
                  to={item.action_path}
                  className="mt-3 inline-block text-sm font-semibold text-[var(--accent-dark)]"
                >
                  Take action →
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
