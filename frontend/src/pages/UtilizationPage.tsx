import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts'
import { StatusBadge } from '../components/StatusBadge'
import { UtilizationBar } from '../components/UtilizationBar'
import { useCardsWithMetrics } from '../hooks/useCardsWithMetrics'
import { money } from '../lib/format'

const TARGET = 10

export function UtilizationPage() {
  const { cards, error, loading } = useCardsWithMetrics()

  const totalBalance = cards.reduce((sum, c) => sum + Number(c.balance), 0)
  const totalLimit = cards.reduce((sum, c) => sum + Number(c.credit_limit), 0)
  const overall = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0

  const chartData = cards.map((card) => ({
    name: card.card_name.length > 14 ? `${card.card_name.slice(0, 14)}…` : card.card_name,
    utilization: Number((card.metrics?.utilization_percent ?? 0).toFixed(1)),
  }))

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl">Utilization tracker</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Utilization = balance ÷ credit limit. Many people aim for under {TARGET}% on reported
          balances.
        </p>
      </header>

      {error && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-[var(--muted)]">Loading…</p>
      ) : cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/70 px-5 py-10 text-center">
          <p className="text-[var(--muted)]">Add a card to track utilization.</p>
          <Link
            to="/cards/new"
            className="mt-4 inline-block rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white no-underline"
          >
            Add card
          </Link>
        </div>
      ) : (
        <>
          <section className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <div className="rounded-2xl border border-[var(--line)] bg-white p-6">
              <p className="text-sm text-[var(--muted)]">Overall utilization</p>
              <div className="mt-2 flex flex-wrap items-end gap-4">
                <p className="font-[family-name:var(--font-display)] text-5xl">
                  {overall.toFixed(1)}%
                </p>
                <p className="pb-1 text-sm text-[var(--muted)]">Recommended: under {TARGET}%</p>
              </div>
              <div className="mt-4">
                <UtilizationBar percent={overall} />
              </div>
              <p className="mt-4 text-sm text-[var(--muted)]">
                {money(totalBalance)} balance across {money(totalLimit)} total limit
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-white p-6">
              <p className="mb-4 text-sm font-semibold text-[var(--muted)]">Per-card comparison</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d7e0da" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis unit="%" tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                    <ReferenceLine
                      y={TARGET}
                      stroke="#155a43"
                      strokeDasharray="4 4"
                      label={{ value: '10% target', position: 'insideTopRight', fontSize: 11 }}
                    />
                    <Bar dataKey="utilization" fill="#1f7a5c" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            {cards.map((card) => {
              const pct = card.metrics?.utilization_percent ?? 0
              const pay = card.metrics?.amount_to_pay_for_10_percent ?? '0'
              return (
                <article
                  key={card.id}
                  className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl">{card.card_name}</h2>
                    <StatusBadge status={card.metrics?.status ?? '—'} />
                  </div>
                  <UtilizationBar percent={pct} label="Current vs 100% of limit" />
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <p>
                      <span className="text-[var(--muted)]">Balance </span>
                      <span className="font-semibold">{money(card.balance)}</span>
                    </p>
                    <p>
                      <span className="text-[var(--muted)]">Limit </span>
                      <span className="font-semibold">{money(card.credit_limit)}</span>
                    </p>
                    <p>
                      <span className="text-[var(--muted)]">To hit 10% </span>
                      <span className="font-semibold">
                        {Number(pay) > 0 ? `Pay ${money(pay)}` : 'Already there'}
                      </span>
                    </p>
                  </div>
                  <Link
                    to={`/cards/${card.id}`}
                    className="mt-4 inline-block text-sm font-semibold text-[var(--accent-dark)]"
                  >
                    Manage card →
                  </Link>
                </article>
              )
            })}
          </section>
        </>
      )}
    </div>
  )
}
