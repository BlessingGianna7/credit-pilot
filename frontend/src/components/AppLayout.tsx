import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/utilization', label: 'Utilization' },
  { to: '/simulator', label: 'Simulator' },
  { to: '/tips', label: 'Tips' },
  { to: '/reminders', label: 'Reminders' },
  { to: '/cards/new', label: 'Add card' },
]

/**
 * AppLayout = chrome around logged-in pages (nav + content).
 * <Outlet /> is where the child route (Dashboard, etc.) renders.
 */
export function AppLayout() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-8">
            <NavLink
              to="/"
              className="text-xl text-[var(--ink)] no-underline"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              CreditPilot
            </NavLink>
            <nav className="flex flex-wrap gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    [
                      'rounded-lg px-3 py-1.5 text-sm font-semibold no-underline transition-colors',
                      isActive
                        ? 'bg-[var(--paper)] text-[var(--accent-dark)]'
                        : 'text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-1.5 text-sm font-semibold hover:bg-[var(--paper)]"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </div>
    </div>
  )
}
