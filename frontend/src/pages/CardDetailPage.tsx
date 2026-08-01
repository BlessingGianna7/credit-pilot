import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { deleteCard, getCard, getCardMetrics, updateCard } from '../api/cards'
import { StatusBadge } from '../components/StatusBadge'
import { UtilizationBar } from '../components/UtilizationBar'
import { useAuth } from '../auth/AuthContext'
import { money } from '../lib/format'
import type { CreditCardMetrics } from '../types'

export function CardDetailPage() {
  const { cardId } = useParams()
  const id = Number(cardId)
  const { token } = useAuth()
  const navigate = useNavigate()

  const [cardName, setCardName] = useState('')
  const [creditLimit, setCreditLimit] = useState('')
  const [balance, setBalance] = useState('')
  const [statementDay, setStatementDay] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [metrics, setMetrics] = useState<CreditCardMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      if (!token || Number.isNaN(id)) return
      setLoading(true)
      setError(null)
      try {
        const card = await getCard(token, id)
        setCardName(card.card_name)
        setCreditLimit(card.credit_limit)
        setBalance(card.balance)
        setStatementDay(String(card.statement_day))
        setDueDay(String(card.due_day))
        setMetrics(await getCardMetrics(token, id))
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not load card')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [token, id])

  async function onSave(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    setSaving(true)
    setError(null)
    try {
      await updateCard(token, id, {
        card_name: cardName,
        credit_limit: Number(creditLimit),
        balance: Number(balance),
        statement_day: Number(statementDay),
        due_day: Number(dueDay),
      })
      setMetrics(await getCardMetrics(token, id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save card')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!token) return
    if (!window.confirm('Delete this card? This cannot be undone.')) return
    try {
      await deleteCard(token, id)
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete card')
    }
  }

  if (loading) {
    return <p className="text-[var(--muted)]">Loading card…</p>
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/" className="text-sm font-semibold text-[var(--accent-dark)]">
        ← Back to dashboard
      </Link>
      <div className="mt-4 mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-4xl">{cardName || 'Card'}</h1>
          <p className="mt-2 text-[var(--muted)]">Edit details, review utilization, or delete.</p>
        </div>
        {metrics && <StatusBadge status={metrics.status} />}
      </div>

      {metrics && (
        <section className="mb-6 rounded-2xl border border-[var(--line)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Current utilization</p>
          <p className="font-[family-name:var(--font-display)] text-4xl">
            {metrics.utilization_percent.toFixed(1)}%
          </p>
          <div className="mt-3">
            <UtilizationBar percent={metrics.utilization_percent} />
          </div>
          {Number(metrics.amount_to_pay_for_10_percent) > 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">
              Pay {money(metrics.amount_to_pay_for_10_percent)} to get under 10% utilization.
            </p>
          ) : (
            <p className="mt-3 text-sm text-[var(--good)]">Already at or under the 10% target.</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to={`/simulator?cardId=${id}`}
              className="text-sm font-semibold text-[var(--accent-dark)]"
            >
              Simulate a payment →
            </Link>
          </div>
        </section>
      )}

      <form
        onSubmit={onSave}
        className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm"
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Card name</span>
          <input
            required
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Credit limit</span>
            <input
              required
              type="number"
              min="1"
              step="0.01"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Balance</span>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Statement day</span>
            <input
              required
              type="number"
              min="1"
              max="31"
              value={statementDay}
              onChange={(e) => setStatementDay(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Due day</span>
            <input
              required
              type="number"
              min="1"
              max="31"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)]"
            />
          </label>
        </div>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[var(--accent)] px-5 py-2.5 font-semibold text-white hover:bg-[var(--accent-dark)] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl border border-red-200 px-5 py-2.5 font-semibold text-[var(--danger)] hover:bg-red-50"
          >
            Delete card
          </button>
        </div>
      </form>
    </div>
  )
}
