import { useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { createCard, getCardMetrics, listCards } from '../api/cards'
import { useAuth } from '../auth/AuthContext'
import type { CreditCard, CreditCardMetrics } from '../types'

type CardWithMetrics = CreditCard & { metrics?: CreditCardMetrics }

function money(value: string | number) {
  const n = typeof value === 'string' ? Number(value) : value
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

export function DashboardPage() {
  const { token, logout } = useAuth()
  const [cards, setCards] = useState<CardWithMetrics[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [cardName, setCardName] = useState('Chase Freedom Rise')
  const [creditLimit, setCreditLimit] = useState('500')
  const [balance, setBalance] = useState('120')
  const [statementDay, setStatementDay] = useState('25')
  const [dueDay, setDueDay] = useState('22')

  async function loadCards() {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const list = await listCards(token)
      const withMetrics = await Promise.all(
        list.map(async (card) => {
          try {
            const metrics = await getCardMetrics(token, card.id)
            return { ...card, metrics }
          } catch {
            return card
          }
        }),
      )
      setCards(withMetrics)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load cards')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCards()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function onAddCard(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    setSaving(true)
    setError(null)
    try {
      await createCard(token, {
        card_name: cardName,
        credit_limit: Number(creditLimit),
        balance: Number(balance),
        statement_day: Number(statementDay),
        due_day: Number(dueDay),
      })
      await loadCards()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add card')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
            CreditPilot
          </p>
          <h1 className="text-4xl text-[var(--ink)] md:text-5xl">Your cards</h1>
          <p className="mt-2 max-w-xl text-[var(--muted)]">
            Track balances, limits, and utilization — the lever that often moves your score fastest.
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold hover:bg-[var(--paper)]"
        >
          Log out
        </button>
      </header>

      {error && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      <section className="mb-10">
        {loading ? (
          <p className="text-[var(--muted)]">Loading cards…</p>
        ) : cards.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--line)] bg-white/70 px-5 py-8 text-[var(--muted)]">
            No cards yet. Add your first card below.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((card) => {
              const pct = card.metrics?.utilization_percent ?? 0
              const status = card.metrics?.status ?? '—'
              return (
                <article
                  key={card.id}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h2 className="text-2xl">{card.card_name}</h2>
                    <span className="rounded-full bg-[var(--paper)] px-3 py-1 text-xs font-semibold text-[var(--accent-dark)]">
                      {status}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-[var(--muted)]">Balance</dt>
                      <dd className="text-lg font-semibold">{money(card.balance)}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted)]">Credit limit</dt>
                      <dd className="text-lg font-semibold">{money(card.credit_limit)}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted)]">Utilization</dt>
                      <dd className="text-lg font-semibold">{pct.toFixed(1)}%</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted)]">Due day</dt>
                      <dd className="text-lg font-semibold">{card.due_day}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--paper)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  {card.metrics && Number(card.metrics.amount_to_pay_for_10_percent) > 0 && (
                    <p className="mt-3 text-sm text-[var(--muted)]">
                      Pay {money(card.metrics.amount_to_pay_for_10_percent)} before statement day{' '}
                      {card.statement_day} to get under 10% utilization.
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
        <h2 className="mb-1 text-2xl">Add a card</h2>
        <p className="mb-5 text-sm text-[var(--muted)]">
          Manual entry for the MVP — same flow you tested in the API docs.
        </p>

        <form onSubmit={onAddCard} className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium">Card name</span>
            <input
              required
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)]"
            />
          </label>

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

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[var(--accent)] px-5 py-2.5 font-semibold text-white hover:bg-[var(--accent-dark)] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Add card'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
