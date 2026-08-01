import { statusTone } from '../lib/format'

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(status)}`}>
      {status}
    </span>
  )
}
