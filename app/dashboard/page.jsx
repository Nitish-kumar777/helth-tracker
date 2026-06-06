"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import {
  Flame, TrendingUp, CalendarCheck, Target,
  BarChart2, Lightbulb, ArrowRight, Sparkles,
  Activity, CheckCircle2, Circle
} from "lucide-react"

function toDateString(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

// Returns the Monday of the current ISO week, then the 7 days Mon–Sun
function getCurrentWeekDates() {
  const now   = new Date()
  const day   = now.getDay()                              // 0 Sun … 6 Sat
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))        // roll back to Monday
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return toDateString(d)
  })
}

export default function DashboardPage() {
  const { data: session } = useSession()

  const name    = session?.user?.name  || "User"
  const email   = session?.user?.email || "user@email.com"
  const role    = session?.user?.role  || "Member"
  const imageUrl = session?.user?.image || null
  const initial = name.charAt(0).toUpperCase()

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  // ── State ──────────────────────────────────────────────────────────────────
  const [stats,    setStats]    = useState(null)   // UserStats from /api/stats
  const [todayLog, setTodayLog] = useState(null)   // HabitLog from /api/habits/log
  const [weekLogs, setWeekLogs] = useState([])     // 7-element array of accuracy|null
  const [loading,  setLoading]  = useState(true)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    const today     = toDateString()
    const weekDates = getCurrentWeekDates()           // ["YYYY-MM-DD" × 7] Mon–Sun

    const safeFetch = async (url) => {
      try {
        const res = await fetch(url)
        if (!res.ok) return null
        return await res.json()
      } catch (e) {
        console.error("Fetch error", url, e)
        return null
      }
    }

    const load = async () => {
      // Parallel: stats + today's log + this week's 7 logs
      const [statsData, logData, ...weekData] = await Promise.all([
        safeFetch("/api/stats"),
        safeFetch(`/api/habits/log?date=${today}`),
        ...weekDates.map((d) => safeFetch(`/api/habits/log?date=${d}`)),
      ])

      if (!mounted) return

      setStats(statsData?.stats ?? null)
      setTodayLog(logData?.log  ?? null)

      // Map each week day to accuracy (null if no log / no habits that day)
      setWeekLogs(
        weekData.map((d) => {
          const log = d?.log
          if (!log || (log.habits?.length ?? 0) === 0) return null
          return log.dailyAccuracy ?? 0
        })
      )

      setLoading(false)
    }

    load()
    return () => { mounted = false }
  }, [])

  // ── Derived values ─────────────────────────────────────────────────────────
  const habits      = todayLog?.habits       ?? []
  const accuracy    = todayLog?.dailyAccuracy  ?? 0
  const completed   = todayLog?.totalCompleted ?? 0
  const totalHabits = habits.length

  const streak        = stats?.currentStreak     ?? 0
  // totalCompletedDays = days where at least 1 habit was done (from /api/stats)
  const totalCheckins = stats?.totalCompletedDays ?? 0

  // This week's accuracy = average of non-null days so far this week
  const weekNonNull   = weekLogs.filter((v) => v !== null)
  const weekAccuracy  = weekNonNull.length
    ? Math.round(weekNonNull.reduce((a, b) => a + b, 0) / weekNonNull.length)
    : 0

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const statCards = [
    {
      label:  "Current Streak",
      value:  streak,
      unit:   "days",
      icon:   <Flame size={18} className="text-amber-400 fill-amber-400" />,
      color:  "text-amber-400",
      bg:     "bg-amber-400/10",
      border: "border-amber-400/20",
    },
    {
      label:  "Total Check-ins",
      value:  totalCheckins,
      unit:   "days",
      icon:   <CalendarCheck size={18} className="text-emerald-400" />,
      color:  "text-emerald-400",
      bg:     "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
    {
      label:  "This Week",
      value:  weekAccuracy,
      unit:   "%",
      icon:   <TrendingUp size={18} className="text-violet-400" />,
      color:  "text-violet-400",
      bg:     "bg-violet-400/10",
      border: "border-violet-400/20",
    },
    {
      label:  "Active Habits",
      value:  totalHabits,
      unit:   "habits",
      icon:   <Activity size={18} className="text-sky-400" />,
      color:  "text-sky-400",
      bg:     "bg-sky-400/10",
      border: "border-sky-400/20",
    },
  ]

  const features = [
    {
      href:   "/dashboard/habits",
      icon:   <Target   size={22} />,
      iconBg: "bg-violet-500/20 text-violet-400",
      label:  "Habits",
      desc:   "Track and build healthy daily habits",
      cta:    "View Habits",
      accent: "group-hover:text-violet-400",
      glow:   "group-hover:shadow-[0_8px_32px_rgba(124,58,237,0.2)]",
    },
    {
      href:   "/dashboard/analytics",
      icon:   <BarChart2 size={22} />,
      iconBg: "bg-emerald-500/20 text-emerald-400",
      label:  "Progress",
      desc:   "Visualise your health journey over time",
      cta:    "View Progress",
      accent: "group-hover:text-emerald-400",
      glow:   "group-hover:shadow-[0_8px_32px_rgba(52,211,153,0.15)]",
    },
    {
      href:   "/dashboard/insights",
      icon:   <Lightbulb size={22} />,
      iconBg: "bg-amber-500/20 text-amber-400",
      label:  "Insights",
      desc:   "Personalised recommendations just for you",
      cta:    "View Insights",
      accent: "group-hover:text-amber-400",
      glow:   "group-hover:shadow-[0_8px_32px_rgba(251,191,36,0.15)]",
    },
  ]

  // ── Week day labels Mon–Sun ─────────────────────────────────────────────────
  const DOW = ["M", "T", "W", "T", "F", "S", "S"]

  return (
    <div className="min-h-screen bg-[#08080f] text-white px-4 py-8 md:px-8 lg:px-12">

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-700/10 blur-[120px] -z-0" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-700/8 blur-[100px] -z-0" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">

        {/* ── Welcome ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-violet-400" />
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/30 font-mono">
                {greeting}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
                {name}
              </span>
              !
            </h1>
            <p className="text-white/40 mt-1.5 text-[14px]">
              Here's your health tracking overview for today.
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-2.5 self-start">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[12px] font-semibold text-white/50 font-mono">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* ── Profile + Stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Profile card */}
          <div className="lg:col-span-2 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 flex items-center gap-4 hover:border-violet-500/30 transition-all duration-300">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl font-extrabold text-white shadow-[0_0_24px_rgba(124,58,237,0.45)]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="User"
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  {initial}
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#08080f] shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[17px] font-bold text-white truncate">{name}</h2>
              <p className="text-[12px] text-white/35 truncate mt-0.5">{email}</p>
              <span className="inline-block mt-2 text-[11px] font-semibold tracking-wider uppercase bg-violet-500/15 text-violet-300 border border-violet-500/25 px-2.5 py-0.5 rounded-full">
                {role}
              </span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-3">
            {statCards.map((s) => (
              <div
                key={s.label}
                className={`${s.bg} border ${s.border} rounded-2xl p-4 flex flex-col gap-1.5 hover:brightness-110 transition-all duration-200`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                    {s.label}
                  </span>
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/20">
                    {s.icon}
                  </span>
                </div>
                <div className="flex items-end gap-1">
                  {loading ? (
                    <span className="w-10 h-6 rounded-lg bg-white/[0.06] animate-pulse" />
                  ) : (
                    <span className={`text-2xl font-extrabold ${s.color} leading-none`}>
                      {s.value}
                    </span>
                  )}
                  <span className="text-[11px] text-white/30 mb-0.5 font-mono">{s.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Today's progress ── */}
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[14px] font-bold text-white">Today's Progress</h3>
              {loading ? (
                <div className="w-36 h-3 rounded-full bg-white/[0.06] animate-pulse mt-1.5" />
              ) : (
                <p className="text-[12px] text-white/30 mt-0.5">
                  {completed} of {totalHabits} habits completed
                </p>
              )}
            </div>
            {loading ? (
              <div className="w-10 h-4 rounded-full bg-white/[0.06] animate-pulse" />
            ) : (
              <span className="text-[13px] font-bold font-mono text-violet-400">{accuracy}%</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-400 transition-all duration-700"
              style={{ width: loading ? "0%" : `${accuracy}%` }}
            />
          </div>

          {/* Week day pills — Mon to Sun, sourced from live API data */}
          <div className="flex gap-1.5 mt-4">
            {DOW.map((d, i) => {
              const val        = weekLogs[i]          // null | 0–100
              const hasData    = val !== null
              const isDone     = hasData && val >= 100
              const isPartial  = hasData && val > 0 && val < 100
              const isEmpty    = !hasData || val === 0

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-mono text-white/25">{d}</span>
                  <div
                    title={hasData ? `${Math.round(val)}%` : "No data"}
                    className={`w-full aspect-square rounded-md border transition-all duration-300 ${
                      loading
                        ? "bg-white/[0.04] border-white/[0.06] animate-pulse"
                        : isDone
                          ? "bg-emerald-500/30 border-emerald-500/40"
                          : isPartial
                            ? "bg-violet-500/20 border-violet-500/30"
                            : "bg-white/[0.05] border-white/[0.07]"
                    }`}
                  >
                    {!loading && isDone && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                    )}
                    {!loading && isPartial && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400/70" />
                      </div>
                    )}
                  </div>
                  {/* Accuracy % label under each day */}
                  {!loading && hasData && (
                    <span className={`text-[8px] font-mono ${isDone ? "text-emerald-400/60" : isPartial ? "text-violet-400/50" : "text-white/15"}`}>
                      {Math.round(val)}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Today's habit list (mini) ── */}
        {!loading && habits.length > 0 && (
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-white">Today's Habits</h3>
              <a
                href="/dashboard/habits/log"
                className="text-[11px] font-semibold text-violet-400/70 hover:text-violet-400 transition-colors flex items-center gap-1"
              >
                Go to check-in <ArrowRight size={11} />
              </a>
            </div>
            <div className="space-y-2">
              {habits.map((h) => (
                <div
                  key={h.habitId}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all ${
                    h.completed
                      ? "bg-emerald-500/[0.07] border-emerald-500/20"
                      : "bg-white/[0.03] border-white/[0.07]"
                  }`}
                >
                  {h.completed
                    ? <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                    : <Circle size={15} className="text-white/15 flex-shrink-0" />
                  }
                  <span className={`text-[13px] font-medium flex-1 truncate ${
                    h.completed ? "text-white/40 line-through decoration-white/20" : "text-white/75"
                  }`}>
                    {h.habitName}
                  </span>
                  {/* Show value progress for non-boolean habits */}
                  {h.unit !== "boolean" && h.value !== null && h.value !== undefined && (
                    <span className="text-[10px] font-mono text-white/25 flex-shrink-0">
                      {parseFloat(h.value.toFixed(1))} / {h.targetValue} {h.unit}
                    </span>
                  )}
                  {!h.completed && h.unit === "boolean" && h.timeWindowStart && (
                    <span className="text-[10px] font-mono text-white/20 flex-shrink-0">
                      {h.timeWindowStart}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Feature cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f) => (
            <a
              key={f.href}
              href={f.href}
              className={`group relative bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-3 hover:border-white/[0.14] hover:-translate-y-0.5 transition-all duration-250 ${f.glow}`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${f.iconBg}`}>
                {f.icon}
              </div>
              <div>
                <h3 className={`text-[15px] font-bold text-white transition-colors ${f.accent}`}>
                  {f.label}
                </h3>
                <p className="text-[12.5px] text-white/35 mt-1 leading-relaxed">{f.desc}</p>
              </div>
              <div className={`flex items-center gap-1.5 text-[12px] font-semibold text-white/30 mt-auto transition-colors ${f.accent}`}>
                <span>{f.cta}</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </div>
            </a>
          ))}
        </div>

      </div>
    </div>
  )
}