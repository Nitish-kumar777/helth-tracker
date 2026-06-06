"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard, BadgeCheck, BarChart,
  Settings, CalendarDays, X, Plus, Zap, Flame, Loader2,
} from "lucide-react"

function toDateString(d = new Date()) { return d.toISOString().slice(0, 10) }

export function Sidebar({ isOpen, toggleSidebar }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const displayName = session?.user?.name || "User"
  const streak = session?.user?.currentStreak ?? 0
  const imageUrl = session?.user?.image || null

  // ── Today's log ────────────────────────────────────────────────────────────
  const [log, setLog]         = useState(null)
  const [logLoading, setLogLoading] = useState(true)

  const fetchTodayLog = useCallback(async () => {
    setLogLoading(true)
    try {
      const res  = await fetch(`/api/habits/log?date=${toDateString()}`)
      const data = await res.json()
      if (res.ok) setLog(data.log ?? null)
    } catch (e) {
      console.error("Sidebar log fetch:", e)
    } finally {
      setLogLoading(false)
    }
  }, [])

  useEffect(() => { fetchTodayLog() }, [fetchTodayLog])

  // ── Derived progress values ────────────────────────────────────────────────
  const total     = log?.habits?.length     ?? 0
  const completed = log?.totalCompleted     ?? 0
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0

  const navItems = [
    { label: "Dashboard",   href: "/dashboard",              icon: <LayoutDashboard size={17} /> },
    { label: "Add Habit",   href: "/dashboard/habits",       icon: <BadgeCheck      size={17} /> },
    { label: "Daily Log",   href: "/dashboard/habits/log",   icon: <BadgeCheck      size={17} /> },
    { label: "Analytics",   href: "/dashboard/analytics",    icon: <BarChart        size={17} />, badge: "3" },
    { label: "Calendar",    href: "/dashboard/calendar",     icon: <CalendarDays    size={17} /> },
    { label: "Settings",    href: "/dashboard/settings",     icon: <Settings        size={17} /> },
  ]

  const isActive = (href) => pathname === href

  return (
    <>
      {/* ── Mobile overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed md:relative top-0 left-0 h-screen w-[260px] z-40 md:z-auto
          flex flex-col
          bg-[#0b0b18] border-r border-white/[0.06]
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          shadow-[4px_0_40px_rgba(0,0,0,0.5)]
        `}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl" />

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-[0_0_18px_rgba(124,58,237,0.5)]">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <div>
              <p className="text-[15px] font-extrabold tracking-tight text-white leading-none">Habit Tracker</p>
              <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-white/30 mt-0.5">dashboard</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── User card ── */}
        <div className="mx-4 mt-4 flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-2xl px-3.5 py-3">
          <div className="relative flex-shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="User"
                className="w-9 h-9 rounded-xl object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[14px] font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0b0b18]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-white truncate">{displayName}</p>
            <p className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 mt-0.5">
              <Flame size={11} className="fill-amber-400 text-amber-400" />
              {streak > 0 ? `${streak}-day streak` : "Start your streak"}
            </p>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="px-4 mt-4">
          <Link
            href="/dashboard/habits"
            onClick={toggleSidebar}
            className="
              flex items-center gap-3 w-full px-4 py-2.5 rounded-xl
              bg-gradient-to-r from-violet-600 to-purple-500
              text-white text-[13.5px] font-bold
              shadow-[0_4px_20px_rgba(124,58,237,0.4)]
              hover:shadow-[0_6px_28px_rgba(124,58,237,0.55)]
              hover:-translate-y-px active:translate-y-0
              transition-all duration-200 relative overflow-hidden group
            "
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/15">
              <Plus size={14} />
            </span>
            <span>New Habit</span>
          </Link>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto px-3 mt-5 pb-4 scrollbar-none space-y-0.5">
          <p className="px-3 mb-2 text-[9.5px] font-semibold tracking-[0.2em] uppercase text-white/20">Menu</p>

          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={toggleSidebar}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-[13.5px] font-medium transition-all duration-200 group
                  ${active
                    ? "bg-violet-600/15 text-violet-300 font-semibold"
                    : "text-white/45 hover:text-white/80 hover:bg-white/[0.05]"
                  }
                `}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] rounded-r-full bg-violet-400" />
                )}
                <span className={`
                  flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                  ${active
                    ? "bg-violet-500/25 text-violet-300"
                    : "bg-white/[0.04] text-white/40 group-hover:bg-white/[0.08] group-hover:text-white/70"
                  }
                `}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold bg-violet-600 text-white px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}

          <div className="my-3 border-t border-white/[0.06]" />

          {/* ── Today's Progress card ── */}
          <div className="mx-1 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-3.5">

            {/* Header row */}
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[12px] font-semibold text-white/70">Today's Progress</p>
              {logLoading ? (
                <Loader2 size={11} className="animate-spin text-white/25" />
              ) : (
                <p className={`text-[11px] font-bold font-mono ${
                  pct === 100 ? "text-emerald-400" : pct >= 70 ? "text-violet-400" : "text-white/40"
                }`}>
                  {pct}%
                </p>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
              {logLoading ? (
                <div className="h-full w-1/3 rounded-full bg-white/10 animate-pulse" />
              ) : (
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    pct === 100
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                      : "bg-gradient-to-r from-violet-600 to-purple-400"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              )}
            </div>

            {/* Dot indicators — one per habit */}
            {!logLoading && total > 0 && (
              <div className="flex items-center gap-1 mt-2.5 flex-wrap">
                {log?.habits?.map((h) => (
                  <span
                    key={h.habitId}
                    title={h.habitName}
                    className={`w-2 h-2 rounded-full transition-all ${
                      h.completed ? "bg-emerald-400" : "bg-white/[0.1]"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Caption */}
            <p className="mt-2 text-[11px] text-white/30">
              {logLoading
                ? "Loading…"
                : total === 0
                  ? "No habits configured"
                  : pct === 100
                    ? `🎉 All ${total} habits done!`
                    : `${completed} of ${total} habits completed`
              }
            </p>
          </div>
        </nav>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-between">
          <p className="text-[11px] font-mono text-white/20">© 2026 Habit Tracker</p>
          <span className="text-[10px] font-mono text-white/20 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-full">
            v2.1
          </span>
        </div>
      </aside>
    </>
  )
}