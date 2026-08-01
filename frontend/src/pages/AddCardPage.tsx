import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { createCard } from '../api/cards'
import { useAuth } from '../auth/AuthContext'

export function AddCardPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [cardName, setCardName] = useState('')
  const [creditLimit, setCreditLimit] = useState('')
  const [balance, setBalance] = useState('')
  const [statementDay, setStatementDay] = useState('25')
  const [dueDay, setDueDay] = useState('22')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    setSaving(true)
    setError(null)
    try {
      const card = await createCard(token, {
        card_name: cardName,
        credit_limit: Number(creditLimit),
        balance: Number(balance),
        statement_day: Number(statementDay),
        due_day: Number(dueDay),
      })
      navigate(`/cards/${card.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add card')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link to="/" className="text-sm font-semibold text-[var(--accent-dark)]">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-4xl">Add a card</h1>
      <p className="mt-2 text-[var(--muted)]">
        Manual entry for the MVP. Enter the numbers from your card account page.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm"
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Card name</span>
          <input
            required
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Chase Freedom Rise"
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
            <span className="mb-1 block text-sm font-medium">Current balance</span>
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
            <span className="mb-1 block text-sm font-medium">Statement day (1–31)</span>
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
            <span className="mb-1 block text-sm font-medium">Due day (1–31)</span>
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

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[var(--accent)] px-5 py-2.5 font-semibold text-white hover:bg-[var(--accent-dark)] disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save card'}
        </button>
      </form>
    </div>
  )
}
