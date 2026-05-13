import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { applyRouteSeo } from '../lib/seo'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    applyRouteSeo(pathname)
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 font-sans text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/25">
              RS
            </span>
            <span className="hidden sm:inline">Resume Studio</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
            <NavLink to="/" end className={navClass}>Home</NavLink>
            <NavLink to="/templates" className={navClass}>Templates</NavLink>
            <NavLink to="/builder" className={navClass}>Builder</NavLink>
            <NavLink to="/ats" className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-600 text-white' : 'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`
            }>ATS score</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        <p>Resume Studio — templates, live preview, ATS score check, and a personal resume page.</p>
        <p className="mt-1 text-xs text-slate-400">All data stays in this browser (local storage).</p>
      </footer>
    </div>
  )
}
