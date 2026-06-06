import Link from "next/link"
import {
  Zap, Target, BarChart2, CalendarDays, Flame,
  ArrowRight, CheckCircle2, Shield, TrendingUp, Sparkles
} from "lucide-react"

const FEATURES = [
  {
    icon: <Target    size={22} className="text-violet-400" />,
    bg:   "bg-violet-500/10 border-violet-500/20",
    title: "Habit Tracking",
    desc:  "Build up to 10 custom habits — boolean, timed, or page-count. Track your progress daily with precision.",
  },
  {
    icon: <BarChart2 size={22} className="text-emerald-400" />,
    bg:   "bg-emerald-500/10 border-emerald-500/20",
    title: "Analytics",
    desc:  "Visual breakdowns of your accuracy, streaks, and monthly trends so you always know where you stand.",
  },
  {
    icon: <CalendarDays size={22} className="text-sky-400" />,
    bg:   "bg-sky-500/10 border-sky-500/20",
    title: "Calendar View",
    desc:  "A colour-coded heatmap of every day. Tap any date to see the full breakdown of that day's habits.",
  },
  {
    icon: <Flame     size={22} className="text-amber-400" />,
    bg:   "bg-amber-500/10 border-amber-500/20",
    title: "Streaks & Badges",
    desc:  "Stay motivated with streak counters, perfect-day tracking, and milestone badges you actually earn.",
  },
  {
    icon: <TrendingUp size={22} className="text-pink-400" />,
    bg:   "bg-pink-500/10 border-pink-500/20",
    title: "Weekly Reports",
    desc:  "See how this week compares to last week. Spot patterns, fix gaps, and keep building momentum.",
  },
  {
    icon: <Shield    size={22} className="text-indigo-400" />,
    bg:   "bg-indigo-500/10 border-indigo-500/20",
    title: "Secure & Private",
    desc:  "Your data stays yours. Password-protected accounts, email verification, and secure authentication.",
  },
]

const STATS = [
  { value: "10",    label: "Habits per day"   },
  { value: "100%", label: "Accuracy possible"},
  { value: "∞",    label: "Day streaks"      },
]

const STEPS = [
  { n:"01", title:"Create your habits",   desc:"Add up to 10 daily habits — choose boolean check-offs, timed sessions, or page counts." },
  { n:"02", title:"Check in every day",   desc:"Log each habit with our intuitive check-in page. Use the stopwatch for timed habits." },
  { n:"03", title:"Track your progress",  desc:"Watch your accuracy climb, streaks grow, and insights sharpen over time." },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#08080f] text-white">

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] rounded-full bg-violet-700/10 blur-[140px] -z-0" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-indigo-700/[0.07] blur-[120px] -z-0" />
      <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-700/[0.05] blur-[100px] -z-0" />

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-[0_0_18px_rgba(124,58,237,0.5)]">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <span className="text-[17px] font-extrabold tracking-tight text-white">HealthTrack</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/login"
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all">
            Sign In
          </Link>
          <Link href="/register"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(124,58,237,0.35)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.5)] hover:-translate-y-px transition-all relative overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"/>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/25 rounded-full px-4 py-1.5 mb-8">
          <Sparkles size={12} className="text-violet-400" />
          <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-violet-300">Build better habits</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
          <span className="text-white">Track habits.</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
            Build streaks.
          </span>
          <br />
          <span className="text-white">Change your life.</span>
        </h1>

        <p className="text-[16px] sm:text-[18px] text-white/40 leading-relaxed max-w-2xl mx-auto mb-10">
          HealthTrack is a personal habit dashboard built for consistency.
          Log daily habits, visualise your progress, and earn streaks that keep you coming back.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 text-[14px] font-bold text-white shadow-[0_6px_28px_rgba(124,58,237,0.45)] hover:shadow-[0_8px_36px_rgba(124,58,237,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all relative overflow-hidden group">
            <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"/>
            Start for free
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform"/>
          </Link>
          <Link href="/login"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-[14px] font-semibold text-white/60 hover:text-white/85 hover:bg-white/[0.08] hover:border-white/[0.16] transition-all">
            Sign in
          </Link>
        </div>

        {/* Stats strip */}
        <div className="flex items-center justify-center gap-8 mt-14 pt-10 border-t border-white/[0.07]">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[28px] sm:text-[32px] font-extrabold bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent leading-none">
                {s.value}
              </p>
              <p className="text-[11px] font-mono text-white/25 mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <p className="text-[10px] font-mono font-semibold tracking-[0.25em] uppercase text-white/25 mb-3">Everything you need</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Built for real habits</h2>
          <p className="text-[14px] text-white/35 mt-3 max-w-xl mx-auto">
            Every feature is designed around one goal — helping you show up every single day.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.13] hover:-translate-y-0.5 transition-all duration-250 group">
              <div className={`flex items-center justify-center w-11 h-11 rounded-xl border ${f.bg} mb-4`}>
                {f.icon}
              </div>
              <h3 className="text-[15px] font-bold text-white/90 mb-2">{f.title}</h3>
              <p className="text-[13px] text-white/35 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <p className="text-[10px] font-mono font-semibold tracking-[0.25em] uppercase text-white/25 mb-3">Simple by design</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">How it works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((s) => (
            <div key={s.n} className="relative bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
              <span className="text-[42px] font-black font-mono text-white/[0.04] absolute top-4 right-5 leading-none select-none">
                {s.n}
              </span>
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 mb-4">
                <CheckCircle2 size={15} className="text-violet-400"/>
              </div>
              <h3 className="text-[14px] font-bold text-white mb-2">{s.title}</h3>
              <p className="text-[12.5px] text-white/35 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="relative bg-gradient-to-br from-violet-600/20 to-purple-600/10 border border-violet-500/25 rounded-3xl p-10 sm:p-14 text-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-700/10 to-transparent"/>
          <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-violet-600/15 blur-3xl"/>
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              Ready to build better habits?
            </h2>
            <p className="text-[14px] text-white/45 max-w-lg mx-auto mb-8">
              Join HealthTrack and start tracking your habits today. Free forever.
            </p>
            <Link href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 text-[14px] font-bold text-white shadow-[0_6px_28px_rgba(124,58,237,0.5)] hover:shadow-[0_8px_36px_rgba(124,58,237,0.65)] hover:-translate-y-0.5 transition-all relative overflow-hidden group">
              <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"/>
              Create free account
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform"/>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-500">
            <Zap size={12} className="text-white fill-white" />
          </div>
          <span className="text-[13px] font-bold text-white/50">HealthTrack</span>
        </div>
        <p className="text-[11px] font-mono text-white/20">© {new Date().getFullYear()} HealthTrack. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/login"    className="text-[12px] text-white/25 hover:text-white/50 transition-colors">Sign In</Link>
          <Link href="/register" className="text-[12px] text-white/25 hover:text-white/50 transition-colors">Register</Link>
        </div>
      </footer>
    </div>
  )
}