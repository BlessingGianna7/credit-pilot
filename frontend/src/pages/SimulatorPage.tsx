import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { simulatePayment } from '../api/cards'
import { StatusBadge } from '../components/StatusBadge'
import { UtilizationBar } from '../components/UtilizationBar'
import { useCardsWithMetrics } from '../hooks/useCardsWithMetrics'
import { money } from '../lib/format'
import type { SimulatePaymentResult } from '../types'

export function SimulatorPage() {
  const { cards, error: loadError, loading, token } = useCardsWithMetrics()
  const [searchParams] = useSearchParams()
  const presetId = searchParams.get('cardId')

  const [cardId, setCardId] = useState('')
  const [payment, setPayment] = useState('100')
  const [result, setResult] = useState<SimulatePaymentResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (presetId) {
      setCardId(presetId)
      return
    }
    if (!cardId && cards.length > 0) {
      setCardId(String(cards[0].id))
    }
  }, [presetId, cards, cardId])

  const selected = useMemo(
    () => cards.find((c) => String(c.id) === cardId),
    [cards, cardId],
  )

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token || !cardId) return
    setRunning(true)
    setError(null)
    try {
      const sim = await simulatePayment(token, Number(cardId), Number(payment))
      setResult(sim)
    } catch (err) {
      setResult(null)
      setError(err instanceof ApiError ? err.message : 'Simulation failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl">Payment simulator</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Ask “what if I pay $X?” — this estimates utilization before and after. It does not change
          your saved balance until you edit the card.
        </p>
      </header>

      {(loadError || error) && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
          {error ?? loadError}
        </p>
      )}

      {loading ? (
        <p className="text-[var(--muted)]">Loading cards…</p>
      ) : cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/70 px-5 py-10 text-center">
          <p className="text-[var(--muted)]">Add a card before running simulations.</p>
          <Link
            to="/cards/new"
            className="mt-4 inline-block rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white no-underline"
          >
            Add card
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm"
          >
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Card</span>
              <select
                value={cardId}
                onChange={(e) => {
                  setCardId(e.target.value)
                  setResult(null)
                }}
                className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)]"
              >
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.card_name} — {money(card.balance)} / {money(card.credit_limit)}
                  </option>
                ))}
              </select>
            </label>

            {selected?.metrics && (
              <div className="rounded-xl bg-[var(--paper)] p-4 text-sm">
                <p className="mb-2 font-semibold">Current</p>
                <p>
                  Utilization {selected.metrics.utilization_percent.toFixed(1)}% ·{' '}
                  {selected.metrics.status}
                </p>
                <div className="mt-2">
                  <UtilizationBar percent={selected.metrics.utilization_percent} />
                </div>
              </div>
            )}

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Payment amount ($)</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)]"
              />
            </label>

            <button
              type="submit"
              disabled={running}
              className="rounded-xl bg-[var(--accent)] px-5 py-2.5 font-semibold text-white hover:bg-[var(--accent-dark)] disabled:opacity-60"
            >
              {running ? 'Simulating…' : 'Simulate payment'}
            </button>
          </form>

          <section className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl">Result</h2>
            {!result ? (
              <p className="text-[var(--muted)]">
                Enter a payment and run the simulator to see before/after utilization.
              </p>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-[var(--paper)] p-4">
                    <p className="text-sm text-[var(--muted)]">Before</p>
                    <p className="mt-1 text-2xl font-semibold">{money(result.before_balance)}</p>
                    <p className="mt-1 text-sm">
                      {result.before_utilization_percent.toFixed(1)}% utilization
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={result.before_status} />
                    </div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-sm text-[var(--muted)]">
                      After paying {money(result.payment)}
                    </p>
                    <p className="mt-1 text-2xl font-semibold">{money(result.after_balance)}</p>
                    <p className="mt-1 text-sm">
                      {result.after_utilization_percent.toFixed(1)}% utilization
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={result.after_status} />
                    </div>
                  </div>
                </div>
                <p className="text-[var(--ink)]">{result.explanation}</p>
                <UtilizationBar
                  percent={result.after_utilization_percent}
                  label="After-payment utilization"
                />
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
