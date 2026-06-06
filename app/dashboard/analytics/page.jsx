"use client"

import { useState, useEffect } from "react"
import {
    Flame, Target, Zap, Trophy, TrendingUp, BarChart3,
    CalendarDays, Star,
    Award, Loader2, AlertCircle, Sparkles, Crown,
    ArrowUp, ArrowDown, Shield
} from "lucide-react"

// ── Badge config ──────────────────────────────────────────────────────────────
const BADGE_META = {
    BRONZE: { label: "Bronze", color: "text-amber-600", bg: "bg-amber-900/30", border: "border-amber-700/30", ring: "#92400e", glow: "shadow-[0_0_12px_rgba(146,64,14,0.4)]" },
    SILVER: { label: "Silver", color: "text-slate-300", bg: "bg-slate-700/30", border: "border-slate-500/30", ring: "#64748b", glow: "shadow-[0_0_12px_rgba(100,116,139,0.4)]" },
    GOLD: { label: "Gold", color: "text-yellow-400", bg: "bg-yellow-900/25", border: "border-yellow-600/30", ring: "#ca8a04", glow: "shadow-[0_0_16px_rgba(202,138,4,0.5)]" },
    DIAMOND: { label: "Diamond", color: "text-cyan-300", bg: "bg-cyan-900/25", border: "border-cyan-500/30", ring: "#06b6d4", glow: "shadow-[0_0_20px_rgba(6,182,212,0.5)]" },
    MILESTONE_7: { label: "7 Days", color: "text-violet-300", bg: "bg-violet-900/25", border: "border-violet-500/30", ring: "#7c3aed", glow: "shadow-[0_0_14px_rgba(124,58,237,0.4)]" },
    MILESTONE_30: { label: "30 Days", color: "text-indigo-300", bg: "bg-indigo-900/25", border: "border-indigo-500/30", ring: "#4338ca", glow: "shadow-[0_0_14px_rgba(67,56,202,0.4)]" },
    MILESTONE_60: { label: "60 Days", color: "text-blue-300", bg: "bg-blue-900/25", border: "border-blue-500/30", ring: "#1d4ed8", glow: "shadow-[0_0_14px_rgba(29,78,216,0.4)]" },
    MILESTONE_90: { label: "90 Days", color: "text-sky-300", bg: "bg-sky-900/25", border: "border-sky-500/30", ring: "#0284c7", glow: "shadow-[0_0_16px_rgba(2,132,199,0.4)]" },
    MILESTONE_180: { label: "180 Days", color: "text-emerald-300", bg: "bg-emerald-900/25", border: "border-emerald-500/30", ring: "#059669", glow: "shadow-[0_0_20px_rgba(5,150,105,0.5)]" },
}

const BADGE_TYPE_META = {
    ACCURACY: { icon: <Trophy size={14} />, label: "Accuracy" },
    STREAK: { icon: <Flame size={14} />, label: "Streak" },
    PERFECT_WEEK: { icon: <Star size={14} />, label: "Perfect Week" },
    PERFECT_MONTH: { icon: <Crown size={14} />, label: "Perfect Month" },
    EARLY_RISER: { icon: <Zap size={14} />, label: "Early Riser" },
    CONSISTENT_SLEEP: { icon: <Shield size={14} />, label: "Sleep" },
}

// ── Micro bar chart ───────────────────────────────────────────────────────────
function BarChart({ data = [], color = "#818cf8", label = "Accuracy" }) {
    if (!data.length) return (
        <div className="flex items-center justify-center h-24 text-[12px] text-white/20">No data yet</div>
    )
    const max = Math.max(...data.map(d => d.accuracy ?? d.value ?? 0), 1)
    return (
        <div className="flex items-end gap-1 h-20">
            {data.slice(-14).map((d, i) => {
                const val = d.accuracy ?? d.value ?? 0
                const h = Math.max(2, (val / max) * 100)
                const isLast = i === data.slice(-14).length - 1
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                            className="w-full rounded-sm transition-all duration-500"
                            style={{
                                height: `${h}%`,
                                background: isLast ? color : `${color}55`,
                                minHeight: "2px",
                            }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-[#1a1a2e] border border-white/[0.1] rounded-lg px-2 py-1 text-[10px] font-mono text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                            {d.week !== undefined ? `Wk ${d.week}` : d.month ? `${d.month}` : ""} {val.toFixed(0)}%
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ── Accuracy arc ──────────────────────────────────────────────────────────────
function AccuracyArc({ pct = 0, color = "#818cf8", size = 120, label }) {
    const stroke = 8, r = (size - stroke * 2) / 2
    const circ = 2 * Math.PI * r
    const half = circ / 2
    const off = half - (Math.min(100, pct) / 100) * half

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative">
                <svg width={size} height={size / 2 + stroke} viewBox={`0 0 ${size} ${size / 2 + stroke}`}>
                    {/* Track */}
                    <path
                        d={`M ${stroke} ${size / 2} A ${r} ${r} 0 0 1 ${size - stroke} ${size / 2}`}
                        fill="none" stroke="#ffffff08" strokeWidth={stroke} strokeLinecap="round"
                    />
                    {/* Fill */}
                    <path
                        d={`M ${stroke} ${size / 2} A ${r} ${r} 0 0 1 ${size - stroke} ${size / 2}`}
                        fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
                        strokeDasharray={`${half} ${half}`}
                        strokeDashoffset={off}
                        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
                    />
                </svg>
                <div className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                    <span className="text-[26px] font-black text-white leading-none">{pct.toFixed(0)}%</span>
                </div>
            </div>
            {label && <span className="text-[10px] font-mono uppercase tracking-widest text-white/25">{label}</span>}
        </div>
    )
}

// ── Streak flame ──────────────────────────────────────────────────────────────
function StreakBlock({ current = 0, longest = 0 }) {
    const level = current >= 90 ? "ELITE" : current >= 30 ? "HIGH" : current >= 7 ? "MEDIUM" : "LOW"
    const LEVEL_COLOR = { LOW: "text-white/40", MEDIUM: "text-amber-400", HIGH: "text-orange-400", ELITE: "text-red-400" }
    const LEVEL_GLOW = { LOW: "", MEDIUM: "drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]", HIGH: "drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]", ELITE: "drop-shadow-[0_0_16px_rgba(239,68,68,1)]" }

    return (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-1 w-full sm:w-auto">
                <Flame size={44} className={`${LEVEL_COLOR[level]} ${LEVEL_GLOW[level]} transition-all duration-500`} />
                <span className={`text-[32px] font-black leading-none ${LEVEL_COLOR[level]}`}>{current}</span>
                <span className="text-[10px] font-mono text-white/25 uppercase tracking-wider">day streak</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border mt-1 ${level === "ELITE" ? "text-red-300    border-red-500/30    bg-red-500/10" :
                        level === "HIGH" ? "text-orange-300 border-orange-500/30 bg-orange-500/10" :
                            level === "MEDIUM" ? "text-amber-300  border-amber-500/30  bg-amber-500/10" :
                                "text-white/30   border-white/10      bg-white/5"
                    }`}>{level}</span>
            </div>
            <div className="flex-1 space-y-3">
                <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3.5 py-2.5">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white/25 mb-0.5">Longest Streak</p>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-[24px] font-extrabold text-white">{longest}</span>
                        <span className="text-[11px] text-white/30">days</span>
                    </div>
                </div>
                <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${level === "ELITE" ? "bg-gradient-to-r from-red-500 to-orange-400" :
                                level === "HIGH" ? "bg-gradient-to-r from-orange-500 to-amber-400" :
                                    level === "MEDIUM" ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
                                        "bg-white/20"
                            }`}
                        style={{ width: `${longest > 0 ? (current / longest) * 100 : 0}%` }}
                    />
                </div>
                <p className="text-[10px] text-white/20">{current} of {longest} day best</p>
            </div>
        </div>
    )
}

// ── Badge card ────────────────────────────────────────────────────────────────
function BadgeCard({ badge }) {
    const lm = BADGE_META[badge.badgeLevel] || BADGE_META.BRONZE
    const tm = BADGE_TYPE_META[badge.badgeType] || { icon: <Trophy size={14} />, label: badge.badgeType }
    const date = new Date(badge.unlockedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

    return (
        <div className={`flex items-center gap-3 p-3 rounded-2xl border ${lm.bg} ${lm.border} ${lm.glow} transition-all duration-300`}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${lm.bg} border ${lm.border} ${lm.color} flex-shrink-0`}>
                {tm.icon}
            </div>
            <div className="min-w-0">
                <p className={`text-[12px] font-bold ${lm.color}`}>{tm.label}</p>
                <p className="text-[10px] text-white/30">{lm.label}</p>
                <p className="text-[9px] text-white/20 mt-0.5">{date}</p>
            </div>
        </div>
    )
}

// ── Calendar heatmap (last 10 weeks) ─────────────────────────────────────────
function Heatmap({ dailyHistory = [] }) {
    // Build last 70 days
    const today = new Date()
    const days = Array.from({ length: 70 }, (_, i) => {
        const d = new Date(today)
        d.setDate(d.getDate() - (69 - i))
        const key = d.toISOString().slice(0, 10)
        const found = dailyHistory.find(h => h.date === key)
        return { key, count: found?.streakCount ?? null, isToday: i === 69 }
    })

    const weeks = []
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
    const DOW = ["S", "M", "T", "W", "T", "F", "S"]

    return (
        <div className="space-y-2">
            <div className="flex gap-1.5">
                <div className="flex flex-col gap-1 pt-5">
                    {DOW.map(d => (
                        <div key={d} className="h-[14px] flex items-center text-[8px] font-mono text-white/15 w-3">{d}</div>
                    ))}
                </div>
                <div className="flex gap-1.5 overflow-x-auto">
                    {weeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-1">
                            {wi === 0 && <div className="h-4 text-[8px] font-mono text-white/15" />}
                            {wi > 0 && wi % 2 === 0 && (
                                <div className="h-4 flex items-end text-[8px] font-mono text-white/15 whitespace-nowrap">
                                    {new Date(week[0].key).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </div>
                            )}
                            {wi > 0 && wi % 2 !== 0 && <div className="h-4" />}
                            {week.map(day => {
                                const filled = day.count !== null
                                return (
                                    <div key={day.key}
                                        title={`${day.key}${filled ? ` · streak ${day.count}` : ""}`}
                                        className={`w-[14px] h-[14px] rounded-sm transition-all duration-300 cursor-default ${day.isToday ? "ring-1 ring-white/30" : ""
                                            } ${!filled ? "bg-white/[0.04]" :
                                                day.count >= 30 ? "bg-emerald-400" :
                                                    day.count >= 7 ? "bg-violet-500" :
                                                        day.count >= 3 ? "bg-violet-500/60" :
                                                            "bg-violet-500/30"
                                            }`} />
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-2 pl-5">
                <span className="text-[9px] text-white/20">Less</span>
                {["bg-white/[0.04]", "bg-violet-500/30", "bg-violet-500/60", "bg-violet-500", "bg-emerald-400"].map((c, i) => (
                    <div key={i} className={`w-[10px] h-[10px] rounded-sm ${c}`} />
                ))}
                <span className="text-[9px] text-white/20">More</span>
            </div>
        </div>
    )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, subtitle, icon, children }) {
    return (
        <div className="bg-white/[0.025] border border-white/[0.07] rounded-3xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/40">
                    {icon}
                </div>
                <div>
                    <p className="text-[13px] font-bold text-white/80">{title}</p>
                    {subtitle && <p className="text-[10px] text-white/25 mt-0.5">{subtitle}</p>}
                </div>
            </div>
            <div className="px-5 py-4">{children}</div>
        </div>
    )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const [stats, setStats] = useState(null)
    const [badges, setBadges] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [tab, setTab] = useState("weekly")

    useEffect(() => {
        ; (async () => {
            try {
                const [sRes, bRes] = await Promise.all([
                    fetch("/api/stats"),
                    fetch("/api/badges"),
                ])
                if (!sRes.ok) throw new Error("Failed to load stats")
                const sData = await sRes.json()
                const bData = bRes.ok ? await bRes.json() : { badges: [] }
                setStats(sData.stats ?? null)
                setBadges(bData.badges ?? [])
            } catch (e) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    if (loading) return (
        <div className="min-h-screen bg-[#08080f] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 size={28} className="animate-spin text-violet-500" />
                <p className="text-[13px] text-white/25">Loading your stats…</p>
            </div>
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-[#08080f] flex items-center justify-center p-6">
            <div className="flex items-center gap-3 bg-red-500/[0.08] border border-red-500/25 rounded-2xl px-5 py-4 max-w-sm w-full">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-[13px] text-red-400">{error}</p>
            </div>
        </div>
    )

    const weeklyData = stats?.weeklyAccuracy ?? []
    const monthlyData = stats?.monthlyAccuracy ?? []
    const dailyHist = stats?.dailyStreakHistory ?? []
    const chartData = tab === "weekly" ? weeklyData : monthlyData

    // Per-habit breakdown from most recent monthly report (if available)
    const latestReport = stats?.monthlyReports?.[0]
    const breakdown = latestReport?.habitsBreakdown
        ? Object.entries(latestReport.habitsBreakdown).map(([id, count]) => ({ id, count }))
        : []

    const trend = weeklyData.length >= 2
        ? weeklyData[weeklyData.length - 1].accuracy - weeklyData[weeklyData.length - 2].accuracy
        : 0

    return (
        <div className="min-h-full overflow-x-hidden bg-[#08080f] text-white">
            <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-700/[0.07] blur-[140px] z-0" />
            <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-700/[0.06] blur-[110px] z-0" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:px-6 md:px-8 lg:px-10 md:py-10 space-y-5">

                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <Sparkles size={11} className="text-violet-400" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20">Analytics</span>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <h1 className="text-2xl font-extrabold tracking-tight text-white">Your Progress</h1>
                        {trend !== 0 && (
                            <div className={`flex items-center gap-1 text-[12px] font-bold ${trend > 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {trend > 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
                                {Math.abs(trend).toFixed(0)}% vs last week
                            </div>
                        )}
                    </div>
                </div>

                {/* Top stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                        { label: "Overall", val: `${(stats?.overallAccuracy ?? 0).toFixed(0)}%`, sub: "accuracy", icon: <BarChart3 size={13} className="text-violet-400" />, color: "text-violet-300" },
                        { label: "Perfect Days", val: stats?.totalPerfectDays ?? 0, sub: "all habits", icon: <Star size={13} className="text-yellow-400" />, color: "text-yellow-300" },
                        { label: "Active Days", val: stats?.totalCompletedDays ?? 0, sub: "total", icon: <CalendarDays size={13} className="text-sky-400" />, color: "text-sky-300" },
                        { label: "Badges", val: badges.length, sub: "unlocked", icon: <Award size={13} className="text-amber-400" />, color: "text-amber-300" },
                    ].map(s => (
                        <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-3.5">
                            <div className="flex items-center gap-1.5 mb-2">{s.icon}
                                <span className="text-[9px] font-mono uppercase tracking-wider text-white/25">{s.label}</span>
                            </div>
                            <p className={`text-[24px] font-extrabold leading-none ${s.color}`}>{s.val}</p>
                            <p className="text-[9px] text-white/20 mt-1">{s.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Streak */}
                <Section title="Streak" subtitle="Current & longest" icon={<Flame size={14} />}>
                    <StreakBlock current={stats?.currentStreak ?? 0} longest={stats?.longestStreak ?? 0} />
                </Section>

                {/* Accuracy chart */}
                <Section title="Accuracy Over Time" subtitle="Weekly or monthly view" icon={<TrendingUp size={14} />}>
                    {/* Tab */}
                    <div className="flex items-center gap-1.5 mb-4 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1 w-fit">
                        {["weekly", "monthly"].map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${tab === t ? "bg-violet-600/30 text-violet-300 border border-violet-500/40" : "text-white/30 hover:text-white/60"
                                    }`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                        ))}
                    </div>

                    {chartData.length === 0 ? (
                        <div className="flex items-center justify-center h-20 text-[12px] text-white/20">No data yet</div>
                    ) : (
                        <div className="space-y-2">
                            <BarChart data={chartData} color="#818cf8" />
                            <div className="flex items-center justify-between text-[10px] font-mono text-white/20">
                                <span>{tab === "weekly" ? `${chartData.length} weeks` : `${chartData.length} months`}</span>
                                <span>Latest: {(chartData[chartData.length - 1]?.accuracy ?? 0).toFixed(0)}%</span>
                            </div>
                        </div>
                    )}

                    {/* Arc summary */}
                    <div className="flex flex-col gap-5 mt-5 pt-4 border-t border-white/[0.06] sm:flex-row sm:items-start sm:justify-around">
                        <AccuracyArc pct={stats?.overallAccuracy ?? 0} color="#818cf8" size={110} label="Overall" />
                        <AccuracyArc pct={weeklyData[weeklyData.length - 1]?.accuracy ?? 0} color="#38bdf8" size={110} label="This Week" />
                        <AccuracyArc pct={monthlyData[monthlyData.length - 1]?.accuracy ?? 0} color="#34d399" size={110} label="This Month" />
                    </div>
                </Section>

                {/* Activity heatmap */}
                <Section title="Activity Map" subtitle="Last 10 weeks" icon={<CalendarDays size={14} />}>
                    <Heatmap dailyHistory={dailyHist} />
                </Section>

                {/* Badges */}
                {badges.length > 0 && (
                    <Section title="Badges" subtitle={`${badges.length} unlocked`} icon={<Award size={14} />}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {badges.map(b => <BadgeCard key={b.id} badge={b} />)}
                        </div>
                    </Section>
                )}

                {/* No badges yet */}
                {badges.length === 0 && (
                    <Section title="Badges" subtitle="Keep going to unlock" icon={<Award size={14} />}>
                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
                                <Trophy size={22} className="text-white/15" />
                            </div>
                            <p className="text-[13px] text-white/30 font-semibold">No badges yet</p>
                            <p className="text-[11px] text-white/20 text-center max-w-[200px]">
                                Complete habits consistently to unlock accuracy and streak badges.
                            </p>
                            <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-3 w-full max-w-xs mx-auto sm:mx-0">
                                {[
                                    { label: "60% accuracy", sub: "→ Bronze", color: "text-amber-600/50" },
                                    { label: "75% accuracy", sub: "→ Silver", color: "text-slate-400/50" },
                                    { label: "7-day streak", sub: "→ Streak", color: "text-violet-400/50" },
                                ].map(h => (
                                    <div key={h.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-2.5 py-2 text-center">
                                        <p className={`text-[10px] font-bold ${h.color}`}>{h.sub}</p>
                                        <p className="text-[9px] text-white/20 mt-0.5">{h.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Section>
                )}

                {/* Per-habit breakdown */}
                {breakdown.length > 0 && (
                    <Section title="Habit Breakdown" subtitle={`${latestReport?.month}/${latestReport?.year}`} icon={<Target size={14} />}>
                        <div className="space-y-2.5">
                            {breakdown.sort((a, b) => b.count - a.count).map(h => {
                                const pct = latestReport?.totalDays ? Math.round((h.count / latestReport.totalDays) * 100) : 0
                                return (
                                    <div key={h.id} className="flex items-center gap-3">
                                        <span className="text-[11px] font-mono text-white/30 w-6 flex-shrink-0">{h.id}</span>
                                        <div className="flex-1">
                                            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                                <div className="h-full bg-violet-500 rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-mono text-white/40 w-12 text-right">{h.count}d ({pct}%)</span>
                                    </div>
                                )
                            })}
                        </div>
                    </Section>
                )}

            </div>
        </div>
    )
}