import { barColor } from '../lib/format'

export function UtilizationBar({ percent, label }: { percent: number; label?: string }) {
  const width = Math.min(Math.max(percent, 0), 100)
  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
          <span>{label}</span>
          <span>{percent.toFixed(1)}%</span>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--paper)]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor(percent)}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
