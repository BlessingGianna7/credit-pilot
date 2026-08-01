/** Small helpers used across pages. */

export function money(value: string | number) {
  const n = typeof value === 'string' ? Number(value) : value
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

export function statusTone(status: string): string {
  switch (status) {
    case 'Excellent':
      return 'bg-emerald-50 text-emerald-800'
    case 'Good':
      return 'bg-teal-50 text-teal-800'
    case 'Fair':
      return 'bg-amber-50 text-amber-800'
    case 'High risk':
      return 'bg-red-50 text-red-800'
    default:
      return 'bg-[var(--paper)] text-[var(--muted)]'
  }
}

export function barColor(percent: number): string {
  if (percent < 10) return 'bg-emerald-600'
  if (percent < 30) return 'bg-[var(--accent)]'
  if (percent < 50) return 'bg-amber-500'
  return 'bg-red-600'
}
