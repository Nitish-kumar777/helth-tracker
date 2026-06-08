// "use client"

// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { useEffect, useState, useCallback } from "react"
// import { useSession } from "next-auth/react"
// import {
//   LayoutDashboard, BadgeCheck, BarChart,
//   Settings, CalendarDays, X, Plus, Zap, Flame, Loader2,
// } from "lucide-react"

// function toDateString(d = new Date()) { return d.toISOString().slice(0, 10) }

// export function Sidebar({ isOpen, toggleSidebar }) {
//   const pathname = usePathname()
//   const { data: session } = useSession()

//   const displayName = session?.user?.name || "User"
//   const streak = session?.user?.currentStreak ?? 0
//   const imageUrl = session?.user?.image || null

//   // ── Today's log ────────────────────────────────────────────────────────────
//   const [log, setLog]         = useState(null)
//   const [logLoading, setLogLoading] = useState(true)

//   const fetchTodayLog = useCallback(async () => {
//     setLogLoading(true)
//     try {
//       const res  = await fetch(`/api/habits/log?date=${toDateString()}`)
//       const data = await res.json()
//       if (res.ok) setLog(data.log ?? null)
//     } catch (e) {
//       console.error("Sidebar log fetch:", e)
//     } finally {
//       setLogLoading(false)
//     }
//   }, [])

//   useEffect(() => { fetchTodayLog() }, [fetchTodayLog])

//   // ── Derived progress values ────────────────────────────────────────────────
//   const total     = log?.habits?.length     ?? 0
//   const completed = log?.totalCompleted     ?? 0
//   const pct       = total > 0 ? Math.round((completed / total) * 100) : 0

//   const navItems = [
//     { label: "Dashboard",   href: "/dashboard",              icon: <LayoutDashboard size={17} /> },
//     { label: "Add Habit",   href: "/dashboard/habits",       icon: <BadgeCheck      size={17} /> },
//     { label: "Daily Log",   href: "/dashboard/habits/log",   icon: <BadgeCheck      size={17} /> },
//     { label: "Analytics",   href: "/dashboard/analytics",    icon: <BarChart        size={17} />, badge: "3" },
//     { label: "Calendar",    href: "/dashboard/calendar",     icon: <CalendarDays    size={17} /> },
//     { label: "Settings",    href: "/dashboard/settings",     icon: <Settings        size={17} /> },
//   ]

//   const isActive = (href) => pathname === href

//   return (
//     <>
//       {/* ── Mobile overlay ── */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
//           onClick={toggleSidebar}
//         />
//       )}

//       {/* ── Sidebar ── */}
//       <aside
//         className={`
//           fixed md:relative top-0 left-0 h-screen w-[260px] z-40 md:z-auto
//           flex flex-col
//           bg-[#0b0b18] border-r border-white/[0.06]
//           transition-transform duration-300 ease-in-out
//           ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
//           shadow-[4px_0_40px_rgba(0,0,0,0.5)]
//         `}
//       >
//         {/* Ambient glow */}
//         <div className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl" />

//         {/* ── Header ── */}
//         <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06]">
//           <div className="flex items-center gap-3">
//             <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-[0_0_18px_rgba(124,58,237,0.5)]">
//               <Zap size={16} className="text-white fill-white" />
//             </div>
//             <div>
//               <p className="text-[15px] font-extrabold tracking-tight text-white leading-none">Habit Tracker</p>
//               <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-white/30 mt-0.5">dashboard</p>
//             </div>
//           </div>
//           <button
//             onClick={toggleSidebar}
//             className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
//           >
//             <X size={15} />
//           </button>
//         </div>

//         {/* ── User card ── */}
//         <div className="mx-4 mt-4 flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-2xl px-3.5 py-3">
//           <div className="relative flex-shrink-0">
//             {imageUrl ? (
//               <img
//                 src={imageUrl}
//                 alt="User"
//                 className="w-9 h-9 rounded-xl object-cover"
//               />
//             ) : (
//               <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[14px] font-bold text-white">
//                 {displayName.charAt(0).toUpperCase()}
//               </div>
//             )}
//             <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0b0b18]" />
//           </div>
//           <div className="min-w-0 flex-1">
//             <p className="text-[13px] font-bold text-white truncate">{displayName}</p>
//             <p className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 mt-0.5">
//               <Flame size={11} className="fill-amber-400 text-amber-400" />
//               {streak > 0 ? `${streak}-day streak` : "Start your streak"}
//             </p>
//           </div>
//         </div>

//         {/* ── CTA ── */}
//         <div className="px-4 mt-4">
//           <Link
//             href="/dashboard/habits"
//             onClick={toggleSidebar}
//             className="
//               flex items-center gap-3 w-full px-4 py-2.5 rounded-xl
//               bg-gradient-to-r from-violet-600 to-purple-500
//               text-white text-[13.5px] font-bold
//               shadow-[0_4px_20px_rgba(124,58,237,0.4)]
//               hover:shadow-[0_6px_28px_rgba(124,58,237,0.55)]
//               hover:-translate-y-px active:translate-y-0
//               transition-all duration-200 relative overflow-hidden group
//             "
//           >
//             <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
//             <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/15">
//               <Plus size={14} />
//             </span>
//             <span>New Habit</span>
//           </Link>
//         </div>

//         {/* ── Nav ── */}
//         <nav className="flex-1 overflow-y-auto px-3 mt-5 pb-4 scrollbar-none space-y-0.5">
//           <p className="px-3 mb-2 text-[9.5px] font-semibold tracking-[0.2em] uppercase text-white/20">Menu</p>

//           {navItems.map((item) => {
//             const active = isActive(item.href)
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 onClick={toggleSidebar}
//                 className={`
//                   relative flex items-center gap-3 px-3 py-2.5 rounded-xl
//                   text-[13.5px] font-medium transition-all duration-200 group
//                   ${active
//                     ? "bg-violet-600/15 text-violet-300 font-semibold"
//                     : "text-white/45 hover:text-white/80 hover:bg-white/[0.05]"
//                   }
//                 `}
//               >
//                 {active && (
//                   <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] rounded-r-full bg-violet-400" />
//                 )}
//                 <span className={`
//                   flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
//                   ${active
//                     ? "bg-violet-500/25 text-violet-300"
//                     : "bg-white/[0.04] text-white/40 group-hover:bg-white/[0.08] group-hover:text-white/70"
//                   }
//                 `}>
//                   {item.icon}
//                 </span>
//                 <span className="flex-1">{item.label}</span>
//                 {item.badge && (
//                   <span className="text-[10px] font-bold bg-violet-600 text-white px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
//                     {item.badge}
//                   </span>
//                 )}
//               </Link>
//             )
//           })}

//           <div className="my-3 border-t border-white/[0.06]" />

//           {/* ── Today's Progress card ── */}
//           <div className="mx-1 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-3.5">

//             {/* Header row */}
//             <div className="flex items-center justify-between mb-2.5">
//               <p className="text-[12px] font-semibold text-white/70">Today's Progress</p>
//               {logLoading ? (
//                 <Loader2 size={11} className="animate-spin text-white/25" />
//               ) : (
//                 <p className={`text-[11px] font-bold font-mono ${
//                   pct === 100 ? "text-emerald-400" : pct >= 70 ? "text-violet-400" : "text-white/40"
//                 }`}>
//                   {pct}%
//                 </p>
//               )}
//             </div>

//             {/* Progress bar */}
//             <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
//               {logLoading ? (
//                 <div className="h-full w-1/3 rounded-full bg-white/10 animate-pulse" />
//               ) : (
//                 <div
//                   className={`h-full rounded-full transition-all duration-700 ${
//                     pct === 100
//                       ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
//                       : "bg-gradient-to-r from-violet-600 to-purple-400"
//                   }`}
//                   style={{ width: `${pct}%` }}
//                 />
//               )}
//             </div>

//             {/* Dot indicators — one per habit */}
//             {!logLoading && total > 0 && (
//               <div className="flex items-center gap-1 mt-2.5 flex-wrap">
//                 {log?.habits?.map((h) => (
//                   <span
//                     key={h.habitId}
//                     title={h.habitName}
//                     className={`w-2 h-2 rounded-full transition-all ${
//                       h.completed ? "bg-emerald-400" : "bg-white/[0.1]"
//                     }`}
//                   />
//                 ))}
//               </div>
//             )}

//             {/* Caption */}
//             <p className="mt-2 text-[11px] text-white/30">
//               {logLoading
//                 ? "Loading…"
//                 : total === 0
//                   ? "No habits configured"
//                   : pct === 100
//                     ? `🎉 All ${total} habits done!`
//                     : `${completed} of ${total} habits completed`
//               }
//             </p>
//           </div>
//         </nav>

//         {/* ── Footer ── */}
//         <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-between">
//           <p className="text-[11px] font-mono text-white/20">© 2026 Habit Tracker</p>
//           <span className="text-[10px] font-mono text-white/20 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-full">
//             v2.1
//           </span>
//         </div>
//       </aside>
//     </>
//   )
// }

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"

// ── Utilities ─────────────────────────────────────────────────────────────────
function toDateString(d = new Date()) { return d.toISOString().slice(0, 10) }

// ── Inline SVG icons (no external dep) ───────────────────────────────────────
const Icon = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Badge: () => (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  ),
  BarChart: () => (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Flame: () => (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" aria-hidden>
      <path d="M12 2c0 0-4 4-4 8a4 4 0 0 0 8 0c0-1.5-.5-3-1-4 0 0-1 2-2 2-.5 0-1-.5-1-1 0-1 1-2 1-3z"/>
      <path d="M12 22c-3.3 0-6-2.7-6-6 0-2 1-4 2.5-5.5 0 1.5.5 2.5 1.5 3 0-2 1-4 2-5 .5 2 2 3.5 2 5 .8-.8 1-2 1-3 1 1.5 1.5 3.5 1.5 5.5 0 3.3-2.7 6-6 6z"/>
    </svg>
  ),
  Loader: () => (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="sb-spin" aria-hidden>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  ),
  Log: () => (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
}

// ── Nav items config ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",  href: "/dashboard",            icon: <Icon.Dashboard /> },
  { label: "Add Habit",  href: "/dashboard/habits",     icon: <Icon.Badge />     },
  { label: "Daily Log",  href: "/dashboard/habits/log", icon: <Icon.Log />       },
  { label: "Analytics",  href: "/dashboard/analytics",  icon: <Icon.BarChart />, badge: "3" },
  { label: "Calendar",   href: "/dashboard/calendar",   icon: <Icon.Calendar />  },
  { label: "Settings",   href: "/dashboard/settings",   icon: <Icon.Settings />  },
]

// ── Progress bar component ────────────────────────────────────────────────────
function TodayProgress({ log, loading }) {
  const total     = log?.habits?.length ?? 0
  const completed = log?.totalCompleted ?? 0
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0
  const allDone   = pct === 100 && total > 0

  return (
    <div className="sb-progress-card">
      <div className="sb-progress-head">
        <p className="sb-progress-title">Today's Progress</p>
        {loading
          ? <Icon.Loader />
          : <span className={`sb-pct ${allDone ? "pct-done" : pct >= 70 ? "pct-good" : "pct-low"}`}>{pct}%</span>
        }
      </div>

      {/* track */}
      <div className="sb-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Today's habit completion">
        {loading
          ? <div className="sb-track-pulse" />
          : <div className={`sb-track-fill ${allDone ? "fill-done" : "fill-active"}`} style={{ width: `${pct}%` }} />
        }
      </div>

      {/* dot indicators */}
      {!loading && total > 0 && (
        <div className="sb-dots" aria-hidden>
          {log?.habits?.map((h) => (
            <span
              key={h.habitId}
              title={h.habitName}
              className={`sb-dot ${h.completed ? "dot-on" : "dot-off"}`}
            />
          ))}
        </div>
      )}

      {/* caption */}
      <p className="sb-caption">
        {loading         ? "Loading…"
        : total === 0    ? "No habits configured"
        : allDone        ? `All ${total} habits done!`
        : `${completed} of ${total} completed`}
      </p>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar({ isOpen, toggleSidebar }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const displayName = session?.user?.name || "User"
  const streak      = session?.user?.currentStreak ?? 0
  const imageUrl    = session?.user?.image || null
  const initials    = displayName.charAt(0).toUpperCase()

  const [log, setLog]           = useState(null)
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

  // close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === "Escape") toggleSidebar() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen, toggleSidebar])

  const isActive = (href) => pathname === href

  return (
    <>
      <style>{`
        /* ── Animations ── */
        @keyframes sb-spin { to { transform: rotate(360deg); } }
        @keyframes sb-slide-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes sb-fade-dot { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .sb-spin { animation: sb-spin 0.9s linear infinite; color: #ffffff30; }

        /* ── Shell ── */
        .sb-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 30;
        }

        .sb-root {
          position: fixed; top: 0; left: 0;
          height: 100dvh; width: 260px; z-index: 40;
          display: flex; flex-direction: column;
          background: #0b0b18;
          border-right: 1px solid rgba(255,255,255,0.06);
          box-shadow: 4px 0 48px rgba(0,0,0,0.55);
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.22,1,0.36,1);
          overflow: hidden;
        }
        .sb-root.open { transform: translateX(0); }
        @media (min-width: 768px) {
          .sb-root {
            position: relative; transform: none !important;
            box-shadow: none; height: 100vh; z-index: auto;
          }
          .sb-overlay { display: none !important; }
          .sb-close-btn { display: none !important; }
        }

        /* ambient glow */
        .sb-glow {
          position: absolute; top: -64px; left: -64px;
          width: 280px; height: 280px; border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Header ── */
        .sb-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
          position: relative; z-index: 1; flex-shrink: 0;
        }
        .sb-brand { display: flex; align-items: center; gap: 12px; }
        .sb-logo {
          width: 36px; height: 36px; border-radius: 12px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(124,58,237,0.5);
          flex-shrink: 0;
        }
        .sb-app-name {
          font-size: 15px; font-weight: 800; letter-spacing: -0.3px;
          color: #fff; line-height: 1;
        }
        .sb-app-sub {
          font-size: 9.5px; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; color: rgba(255,255,255,0.25);
          margin-top: 3px;
        }
        .sb-close-btn {
          width: 32px; height: 32px; border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.45);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .sb-close-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

        /* ── User card ── */
        .sb-user {
          margin: 16px 16px 0;
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 12px 14px;
          flex-shrink: 0;
        }
        .sb-avatar-wrap { position: relative; flex-shrink: 0; }
        .sb-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          object-fit: cover;
        }
        .sb-avatar-fallback {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700; color: #fff;
        }
        .sb-online {
          position: absolute; bottom: -2px; right: -2px;
          width: 10px; height: 10px; border-radius: 50%;
          background: #34d399;
          border: 2px solid #0b0b18;
        }
        .sb-username {
          font-size: 13px; font-weight: 700; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          line-height: 1;
        }
        .sb-streak {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 600; color: #fbbf24;
          margin-top: 4px;
        }

        /* ── CTA ── */
        .sb-cta-wrap { padding: 12px 16px 0; flex-shrink: 0; }
        .sb-cta {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 16px;
          border-radius: 12px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff; font-size: 13.5px; font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(124,58,237,0.4);
          transition: box-shadow 0.2s, transform 0.15s;
          position: relative; overflow: hidden;
        }
        .sb-cta::before {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(255,255,255,0.1), transparent);
          pointer-events: none;
        }
        .sb-cta:hover {
          box-shadow: 0 6px 28px rgba(124,58,237,0.55);
          transform: translateY(-1px);
        }
        .sb-cta:active { transform: translateY(0); }
        .sb-cta-icon {
          width: 24px; height: 24px; border-radius: 7px;
          background: rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* ── Nav ── */
        .sb-nav {
          flex: 1; overflow-y: auto; padding: 16px 12px 12px;
          display: flex; flex-direction: column; gap: 2px;
          scrollbar-width: none;
        }
        .sb-nav::-webkit-scrollbar { display: none; }

        .sb-section-label {
          padding: 0 12px; margin-bottom: 6px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.22em;
          text-transform: uppercase; color: rgba(255,255,255,0.2);
        }

        .sb-nav-link {
          position: relative; display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 12px;
          font-size: 13.5px; font-weight: 500;
          text-decoration: none; color: rgba(255,255,255,0.4);
          transition: background 0.15s, color 0.15s;
        }
        .sb-nav-link:hover:not(.sb-nav-active) {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.75);
        }
        .sb-nav-link:hover .sb-nav-icon:not(.icon-active) {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.65);
        }
        .sb-nav-active {
          background: rgba(124,58,237,0.14);
          color: #c4b5fd;
          font-weight: 600;
        }
        .sb-active-bar {
          position: absolute; left: 0; top: 50%;
          transform: translateY(-50%);
          width: 3px; height: 56%;
          border-radius: 0 3px 3px 0;
          background: #a78bfa;
        }
        .sb-nav-icon {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.35);
          transition: background 0.15s, color 0.15s;
        }
        .icon-active {
          background: rgba(124,58,237,0.25);
          color: #c4b5fd;
        }
        .sb-badge {
          margin-left: auto;
          font-size: 10px; font-weight: 700;
          background: #7c3aed; color: #fff;
          padding: 2px 7px; border-radius: 20px;
          min-width: 20px; text-align: center;
        }

        .sb-divider { margin: 10px 0; border: none; border-top: 1px solid rgba(255,255,255,0.06); }

        /* ── Progress card ── */
        .sb-progress-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 14px;
        }
        .sb-progress-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 10px;
        }
        .sb-progress-title { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.65); }
        .sb-pct { font-size: 11px; font-weight: 700; font-family: monospace; }
        .pct-done { color: #34d399; }
        .pct-good { color: #a78bfa; }
        .pct-low  { color: rgba(255,255,255,0.35); }

        .sb-track {
          height: 5px; border-radius: 99px;
          background: rgba(255,255,255,0.07); overflow: hidden;
        }
        .sb-track-fill {
          height: 100%; border-radius: 99px;
          transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1);
        }
        .fill-done   { background: linear-gradient(to right, #10b981, #34d399); }
        .fill-active { background: linear-gradient(to right, #7c3aed, #a855f7); }
        .sb-track-pulse {
          height: 100%; width: 35%; border-radius: 99px;
          background: rgba(255,255,255,0.1);
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} }

        .sb-dots {
          display: flex; flex-wrap: wrap; gap: 4px; margin-top: 10px;
        }
        .sb-dot {
          width: 7px; height: 7px; border-radius: 50%;
          transition: background 0.3s, transform 0.2s;
        }
        .dot-on  { background: #34d399; }
        .dot-off { background: rgba(255,255,255,0.1); }

        .sb-caption {
          margin-top: 8px;
          font-size: 11px; color: rgba(255,255,255,0.28);
        }

        /* ── Footer ── */
        .sb-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .sb-footer-copy { font-size: 11px; font-family: monospace; color: rgba(255,255,255,0.2); }
        .sb-footer-ver {
          font-size: 10px; font-family: monospace; color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 2px 8px; border-radius: 20px;
        }
      `}</style>

      {/* overlay */}
      {isOpen && (
        <div
          className="sb-overlay"
          onClick={toggleSidebar}
          aria-hidden
        />
      )}

      {/* sidebar */}
      <aside
        className={`sb-root${isOpen ? " open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="sb-glow" aria-hidden />

        {/* header */}
        <div className="sb-header">
          <div className="sb-brand">
            <div className="sb-logo"><Icon.Zap /></div>
            <div>
              <p className="sb-app-name">Habit Tracker</p>
              <p className="sb-app-sub">Dashboard</p>
            </div>
          </div>
          <button
            className="sb-close-btn"
            onClick={toggleSidebar}
            aria-label="Close navigation"
          >
            <Icon.X />
          </button>
        </div>

        {/* user card */}
        <div className="sb-user">
          <div className="sb-avatar-wrap">
            {imageUrl
              ? <img src={imageUrl} alt="" className="sb-avatar" />
              : <div className="sb-avatar-fallback" aria-hidden>{initials}</div>
            }
            <span className="sb-online" aria-label="Online" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className="sb-username" title={displayName}>{displayName}</p>
            <p className="sb-streak">
              <Icon.Flame />
              {streak > 0 ? `${streak}-day streak` : "Start your streak"}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="sb-cta-wrap">
          <Link href="/dashboard/habits" className="sb-cta" onClick={toggleSidebar}>
            <span className="sb-cta-icon"><Icon.Plus /></span>
            New Habit
          </Link>
        </div>

        {/* nav */}
        <nav className="sb-nav" aria-label="Site navigation">
          <p className="sb-section-label">Menu</p>

          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-nav-link${active ? " sb-nav-active" : ""}`}
                onClick={toggleSidebar}
                aria-current={active ? "page" : undefined}
              >
                {active && <span className="sb-active-bar" aria-hidden />}
                <span className={`sb-nav-icon${active ? " icon-active" : ""}`}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span className="sb-badge" aria-label={`${item.badge} notifications`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}

          <hr className="sb-divider" />

          <TodayProgress log={log} loading={logLoading} />
        </nav>

        {/* footer */}
        <div className="sb-footer">
          <span className="sb-footer-copy">© 2026 Habit Tracker</span>
          <span className="sb-footer-ver">v2.1</span>
        </div>
      </aside>
    </>
  )
}