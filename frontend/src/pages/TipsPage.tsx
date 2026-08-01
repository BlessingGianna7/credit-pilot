import { Link } from 'react-router-dom'
import { useCardsWithMetrics } from '../hooks/useCardsWithMetrics'
import { money } from '../lib/format'

type Tip = {
  title: string
  body: string
  tone: 'good' | 'warn' | 'info'
  href?: string
}

function buildTips(
  cards: ReturnType<typeof useCardsWithMetrics>['cards'],
): Tip[] {
  const tips: Tip[] = []

  if (cards.length === 0) {
    return [
      {
        title: 'Add your first card',
        body: 'CreditPilot needs a balance and limit to calculate utilization and payment timing tips.',
        tone: 'info',
        href: '/cards/new',
      },
    ]
  }

  for (const card of cards) {
    const pct = card.metrics?.utilization_percent ?? 0
    const pay = Number(card.metrics?.amount_to_pay_for_10_percent ?? 0)

    if (pct >= 30) {
      tips.push({
        title: `${card.card_name}: utilization is high (${pct.toFixed(1)}%)`,
        body: `Balances above ~30% of your limit are often viewed less favorably. Consider paying ${money(pay)} before statement day ${card.statement_day} to get under 10%.`,
        tone: 'warn',
        href: `/simulator?cardId=${card.id}`,
      })
    } else if (pct >= 10) {
      tips.push({
        title: `${card.card_name}: good, but not optimized yet`,
        body: `You're under 30%, which is a solid range. Paying ${money(pay)} before statement day ${card.statement_day} could push you under the common 10% target.`,
        tone: 'info',
        href: `/simulator?cardId=${card.id}`,
      })
    } else {
      tips.push({
        title: `${card.card_name}: excellent utilization`,
        body: 'You’re already under 10%. Keep reporting low balances and avoid closing your oldest account if you can — age of credit still matters.',
        tone: 'good',
        href: `/cards/${card.id}`,
      })
    }
  }

  tips.push({
    title: 'Statement date vs due date',
    body: 'The balance on your statement date is often what gets reported. Paying before the statement closes can lower reported utilization — even if the due date is weeks later.',
    tone: 'info',
  })

  tips.push({
    title: 'These tips are educational',
    body: 'CreditPilot uses simple utilization rules. It does not pull official FICO/Vantage scores and is not personalized credit advice from a bureau.',
    tone: 'info',
  })

  return tips
}

const toneStyles = {
  good: 'border-emerald-200 bg-emerald-50',
  warn: 'border-amber-200 bg-amber-50',
  info: 'border-[var(--line)] bg-white',
}

export function TipsPage() {
  const { cards, error, loading } = useCardsWithMetrics()
  const tips = buildTips(cards)

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl">Coach tips</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Rule-based recommendations from your card data — the foundation for a later AI coach that
          explains these rules instead of inventing advice.
        </p>
      </header>

      {error && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-[var(--muted)]">Loading tips…</p>
      ) : (
        <div className="space-y-4">
          {tips.map((tip) => (
            <article
              key={tip.title}
              className={`rounded-2xl border p-5 shadow-sm ${toneStyles[tip.tone]}`}
            >
              <h2 className="text-xl">{tip.title}</h2>
              <p className="mt-2 text-[var(--ink)]/90">{tip.body}</p>
              {tip.href && (
                <Link
                  to={tip.href}
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
