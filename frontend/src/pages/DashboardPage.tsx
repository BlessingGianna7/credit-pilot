import { Link } from 'react-router-dom'
import { StatusBadge } from '../components/StatusBadge'
import { UtilizationBar } from '../components/UtilizationBar'
import { useCardsWithMetrics } from '../hooks/useCardsWithMetrics'
import { money } from '../lib/format'

export function DashboardPage() {
  const { cards, error, loading } = useCardsWithMetrics()

  const totalBalance = cards.reduce((sum, c) => sum + Number(c.balance), 0)
  const totalLimit = cards.reduce((sum, c) => sum + Number(c.credit_limit), 0)
  const overallUtil = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          A snapshot of your cards, overall utilization, and what to do next.
        </p>
      </header>

      {error && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Cards tracked</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl">{cards.length}</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Total balance</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl">{money(totalBalance)}</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Overall utilization</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl">{overallUtil.toFixed(1)}%</p>
          <div className="mt-3">
            <UtilizationBar percent={overallUtil} />
          </div>
        </div>
      </section>

      <section className="mb-8 flex flex-wrap gap-3">
        <Link
          to="/utilization"
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[var(--accent-dark)]"
        >
          Open utilization tracker
        </Link>
        <Link
          to="/simulator"
          className="rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] no-underline hover:bg-[var(--paper)]"
        >
          Try payment simulator
        </Link>
        <Link
          to="/tips"
          className="rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] no-underline hover:bg-[var(--paper)]"
        >
          See tips
        </Link>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-2xl">Your cards</h2>
          <Link to="/cards/new" className="text-sm font-semibold text-[var(--accent-dark)]">
            + Add card
          </Link>
        </div>

        {loading ? (
          <p className="text-[var(--muted)]">Loading cards…</p>
        ) : cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/70 px-5 py-10 text-center">
            <p className="text-[var(--muted)]">No cards yet.</p>
            <Link
              to="/cards/new"
              className="mt-4 inline-block rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white no-underline"
            >
              Add your first card
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((card) => {
              const pct = card.metrics?.utilization_percent ?? 0
              const status = card.metrics?.status ?? '—'
              return (
                <Link
                  key={card.id}
                  to={`/cards/${card.id}`}
                  className="block rounded-2xl border border-[var(--line)] bg-white p-5 text-[var(--ink)] no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h3 className="text-2xl">{card.card_name}</h3>
                    <StatusBadge status={status} />
                  </div>
                  <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-[var(--muted)]">Balance</dt>
                      <dd className="text-lg font-semibold">{money(card.balance)}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted)]">Limit</dt>
                      <dd className="text-lg font-semibold">{money(card.credit_limit)}</dd>
                    </div>
                  </dl>
                  <UtilizationBar percent={pct} label="Utilization" />
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    Statement day {card.statement_day} · Due day {card.due_day}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
