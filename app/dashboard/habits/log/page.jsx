"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  CheckSquare, Square, Timer, BookOpen, Clock,
  ChevronLeft, ChevronRight, Flame, Target,
  Loader2, AlertCircle, FileText, X, Check,
  Minus, Plus, CalendarDays, Sparkles, TrendingUp,
  Play, Pause, RotateCcw, Circle, Bell, BellOff,
  Lock, CheckCircle2, Info, AlertTriangle
} from "lucide-react"

// ── helpers ───────────────────────────────────────────────────────────────────
function toDateString(d = new Date()) { return d.toISOString().slice(0, 10) }
function offsetDate(s, delta) {
  const d = new Date(s + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() + delta)
  return toDateString(d)
}
function formatDisplayDate(s) {
  const today = toDateString(), yesterday = offsetDate(today, -1)
  if (s === today)     return "Today"
  if (s === yesterday) return "Yesterday"
  return new Date(s + "T00:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}
function fmtTime(secs) {
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`
}
function isPastDay(dateStr) {
  return dateStr < toDateString()
}

const UNIT = {
  boolean: { icon: CheckSquare, label:"Task",    bg:"bg-violet-500/10",  border:"border-violet-500/20",  text:"text-violet-300",  ring:"#8b5cf6", track:"#8b5cf615", accent:"violet" },
  minutes: { icon: Timer,       label:"Minutes", bg:"bg-sky-500/10",     border:"border-sky-500/20",     text:"text-sky-300",     ring:"#38bdf8", track:"#38bdf815", accent:"sky"    },
  pages:   { icon: BookOpen,    label:"Pages",   bg:"bg-emerald-500/10", border:"border-emerald-500/20", text:"text-emerald-300", ring:"#34d399", track:"#34d39915", accent:"emerald"},
}

// ── Toast System ──────────────────────────────────────────────────────────────
const TOAST_TYPES = {
  success: { icon: CheckCircle2, bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-300", iconColor: "text-emerald-400" },
  error:   { icon: AlertTriangle, bg: "bg-red-500/15",     border: "border-red-500/30",     text: "text-red-300",     iconColor: "text-red-400"     },
  info:    { icon: Info,          bg: "bg-sky-500/15",     border: "border-sky-500/30",     text: "text-sky-300",     iconColor: "text-sky-400"     },
  warning: { icon: AlertTriangle, bg: "bg-amber-500/15",   border: "border-amber-500/30",   text: "text-amber-300",   iconColor: "text-amber-400"   },
  lock:    { icon: Lock,          bg: "bg-white/[0.07]",   border: "border-white/[0.15]",   text: "text-white/60",    iconColor: "text-white/40"    },
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const style = TOAST_TYPES[t.type] || TOAST_TYPES.info
        const Icon = style.icon
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[260px] max-w-[340px]
              ${style.bg} ${style.border}
              animate-[slideInRight_0.3s_cubic-bezier(0.34,1.56,0.64,1)_forwards]`}
            style={{ animation: t.exiting ? "slideOutRight 0.25s ease-in forwards" : "slideInRight 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
          >
            <Icon size={14} className={`${style.iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              {t.title && <p className={`text-[12px] font-bold ${style.text}`}>{t.title}</p>}
              {t.message && <p className={`text-[11px] ${style.text} opacity-70 mt-0.5`}>{t.message}</p>}
            </div>
            <button
              onClick={() => onRemove(t.id)}
              className={`${style.text} opacity-40 hover:opacity-80 transition-opacity flex-shrink-0`}
            >
              <X size={12} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

function useToast() {
  const [toasts, setToasts] = useState([])
  const timeoutsRef = useRef({})

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    clearTimeout(timeoutsRef.current[id])
    delete timeoutsRef.current[id]
  }, [])

  const add = useCallback((type, title, message, duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev.slice(-4), { id, type, title, message }])
    timeoutsRef.current[id] = setTimeout(() => remove(id), duration)
    return id
  }, [remove])

  const toast = {
    success: (title, msg, dur) => add("success", title, msg, dur),
    error:   (title, msg, dur) => add("error",   title, msg, dur),
    info:    (title, msg, dur) => add("info",     title, msg, dur),
    warning: (title, msg, dur) => add("warning",  title, msg, dur),
    lock:    (title, msg, dur) => add("lock",     title, msg, dur),
  }

  return { toasts, toast, removeToast: remove }
}

// ── Push Notification Hook ────────────────────────────────────────────────────
function usePushNotifications(toast) {
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  )
  const scheduledRef = useRef(new Set())

  const requestPermission = async () => {
    if (typeof Notification === "undefined") {
      toast.error("Not supported", "Push notifications aren't supported in this browser.")
      return
    }
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === "granted") {
      toast.success("Notifications enabled", "You'll get reminders for your habits.")
      scheduleDefaultReminders()
    } else if (result === "denied") {
      toast.warning("Notifications blocked", "Enable them in browser settings.")
    }
  }

  const sendNotification = useCallback((title, body, options = {}) => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico", badge: "/favicon.ico", ...options })
    }
  }, [])

  const scheduleDefaultReminders = useCallback(() => {
    // Schedule a reminder for 9 AM and 8 PM each day
    const now = new Date()
    const reminders = [
      { hour: 9,  minute: 0, label: "Morning Check-in",  body: "Start your day strong — check in on your habits! 🌅" },
      { hour: 20, minute: 0, label: "Evening Wrap-up",   body: "Don't forget to log today's habit progress! 🌙" },
    ]
    reminders.forEach(({ hour, minute, label, body }) => {
      const target = new Date(now)
      target.setHours(hour, minute, 0, 0)
      if (target <= now) target.setDate(target.getDate() + 1)
      const delay = target - now
      const key = `${label}-${target.toDateString()}`
      if (!scheduledRef.current.has(key)) {
        scheduledRef.current.add(key)
        setTimeout(() => {
          sendNotification(label, body)
          scheduledRef.current.delete(key)
        }, delay)
      }
    })
  }, [sendNotification])

  // Re-schedule on mount if already granted
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      scheduleDefaultReminders()
    }
  }, [scheduleDefaultReminders])

  return { permission, requestPermission, sendNotification }
}

// ── SVG Ring ──────────────────────────────────────────────────────────────────
function Ring({ pct=0, unit="boolean", size=52, stroke=4 }) {
  const m = UNIT[unit] || UNIT.boolean
  const r = (size - stroke*2)/2, circ = 2*Math.PI*r
  const off = circ - (Math.min(100,pct)/100)*circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={m.track} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={m.ring} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
        style={{transition:"stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1)"}}/>
    </svg>
  )
}

// ── Stopwatch ─────────────────────────────────────────────────────────────────
function Stopwatch({ entry, onUpdateValue, loading }) {
  const [secs, setSecs]       = useState(Math.round((entry.value ?? 0) * 60))
  const [running, setRunning] = useState(false)
  const [laps, setLaps]       = useState([])
  const intervalRef           = useRef(null)
  const target                = entry.targetValue ? Math.round(entry.targetValue * 60) : null
  const pct                   = target ? Math.min(100, Math.round((secs / target) * 100)) : 0
  const done                  = target ? secs >= target : false

  useEffect(() => {
    if (!running) setSecs(Math.round((entry.value ?? 0) * 60))
  }, [entry.value]) // eslint-disable-line

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecs(s => {
          const next = s + 1
          if (target && next >= target) {
            setRunning(false)
            clearInterval(intervalRef.current)
            onUpdateValue(parseFloat((next / 60).toFixed(2)))
          }
          return next
        })
      }, 1000)
    } else clearInterval(intervalRef.current)
    return () => clearInterval(intervalRef.current)
  }, [running]) // eslint-disable-line

  // ── NEW: instantly complete to target ──────────────────────────────────────
  const handleComplete = () => {
    if (!target || done) return
    setRunning(false)
    clearInterval(intervalRef.current)
    setSecs(target)
    onUpdateValue(parseFloat((target / 60).toFixed(2)))
  }

  const bigR = 56, bigStroke = 5
  const bigCirc = 2 * Math.PI * bigR
  const bigOff  = bigCirc - (pct / 100) * bigCirc

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <svg width={128} height={128} viewBox="0 0 128 128" className="-rotate-90">
            <circle cx={64} cy={64} r={bigR} fill="none" stroke="#38bdf815" strokeWidth={bigStroke}/>
            <circle cx={64} cy={64} r={bigR} fill="none" stroke={done ? "#34d399" : "#38bdf8"} strokeWidth={bigStroke}
              strokeDasharray={bigCirc} strokeDashoffset={bigOff} strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1), stroke 0.4s" }}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-mono text-[22px] font-black leading-none ${done ? "text-emerald-300" : "text-white"}`}>
              {fmtTime(secs)}
            </span>
            {target && <span className="text-[9px] font-mono text-white/25 mt-0.5">/ {fmtTime(target)}</span>}
            {done && <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400 mt-1">Done!</span>}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2.5">
          {/* Row 1: reset / play-pause / lap */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setRunning(false); setSecs(0); setLaps([]); onUpdateValue(0) }}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-all">
              <RotateCcw size={13}/>
            </button>
            {!running ? (
              <button
                onClick={() => setRunning(true)}
                disabled={done}
                className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-[0_4px_18px_rgba(56,189,248,0.35)] hover:shadow-[0_6px_24px_rgba(56,189,248,0.5)] hover:-translate-y-px transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                <Play size={16} fill="white"/>
              </button>
            ) : (
              <button
                onClick={() => { setRunning(false); onUpdateValue(parseFloat((secs / 60).toFixed(2))) }}
                className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-[0_4px_18px_rgba(251,146,60,0.35)] hover:shadow-[0_6px_24px_rgba(251,146,60,0.5)] hover:-translate-y-px transition-all">
                <Pause size={16} fill="white"/>
              </button>
            )}
            <button
              onClick={() => setLaps(l => [...l, secs])}
              disabled={!running}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <Circle size={13}/>
            </button>

            {/* ── Complete button ── */}
            {target && !done && (
              <button
                onClick={handleComplete}
                className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all">
                <Check size={12}/> Complete
              </button>
            )}
            {loading && <Loader2 size={10} className="animate-spin text-white/20 ml-1"/>}
          </div>

          {/* Progress bar */}
          {target && (
            <div>
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${done ? "bg-emerald-400" : "bg-sky-400"}`}
                  style={{ width: `${pct}%` }}/>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] font-mono text-white/20">0m</span>
                <span className={`text-[9px] font-mono ${done ? "text-emerald-400" : "text-white/25"}`}>{pct}%</span>
                <span className="text-[9px] font-mono text-white/20">{entry.targetValue}m</span>
              </div>
            </div>
          )}

          {/* Manual adjust */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/20 font-mono">Manual:</span>
            <button
              onClick={() => onUpdateValue(Math.max(0, (entry.value ?? 0) - 1))}
              className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/30 hover:text-white/60 transition-all">
              <Minus size={9}/>
            </button>
            <span className="text-[12px] font-mono font-bold text-sky-300 w-9 text-center">
              {parseFloat((entry.value ?? 0).toFixed(1))}
            </span>
            <button
              onClick={() => onUpdateValue((entry.value ?? 0) + 1)}
              className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/30 hover:text-white/60 transition-all">
              <Plus size={9}/>
            </button>
            <span className="text-[10px] text-white/20">min</span>
          </div>
        </div>
      </div>

      {/* Laps list */}
      {laps.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2 space-y-1">
          <p className="text-[9px] font-mono uppercase tracking-widest text-white/20 mb-1">Laps</p>
          {laps.map((l, i) => (
            <div key={i} className="flex justify-between text-[10px] font-mono">
              <span className="text-white/25">Lap {i + 1}</span>
              <span className="text-white/40">{fmtTime(l)}</span>
              {i > 0 && <span className="text-sky-400/50">+{fmtTime(l - laps[i - 1])}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Notes Modal ───────────────────────────────────────────────────────────────
function NotesModal({ entry, onSave, onClose, saving }) {
  const [text, setText] = useState(entry.notes || "")
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative w-full max-w-md bg-[#0d0d1a] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <FileText size={14} className="text-amber-400"/>
            <div>
              <p className="text-[13px] font-bold text-white">Journal Note</p>
              <p className="text-[10px] text-white/30 truncate max-w-[200px]">{entry.habitName}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white transition-all">
            <X size={12}/>
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <textarea rows={4} autoFocus placeholder="How did this go? Any reflections…"
            value={text} onChange={e=>setText(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-amber-500/40 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.08)] transition-all resize-none"/>
          <div className="flex gap-2.5">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-[12px] font-semibold text-white/35 hover:text-white/60 transition-all">Cancel</button>
            <button onClick={()=>onSave(text.trim())} disabled={saving||!text.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/35 text-[12px] font-bold text-amber-300 hover:bg-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {saving?<Loader2 size={12} className="animate-spin"/>:<Check size={12}/>} Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Past Day Banner ───────────────────────────────────────────────────────────
function PastDayBanner() {
  return (
    <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5">
      <Lock size={12} className="text-white/30 flex-shrink-0"/>
      <p className="text-[11px] text-white/35 font-medium">Past date — this log is read-only.</p>
    </div>
  )
}

// ── Habit Card — MOBILE (stacked) ─────────────────────────────────────────────
function HabitCardMobile({ entry, onCheck, onUncheck, onUpdateValue, onAddNote, busy, isReadOnly, onLockedAction }) {
  const [expanded, setExpanded] = useState(false)
  const m = UNIT[entry.unit] || UNIT.boolean
  const Icon = m.icon
  const isBoolean = entry.unit === "boolean"
  const isMinutes = entry.unit === "minutes"
  const pct = isBoolean
    ? (entry.completed ? 100 : 0)
    : entry.targetValue ? Math.min(100, Math.round(((entry.value??0)/entry.targetValue)*100))
    : (entry.value ? 100 : 0)
  const loading = busy === entry.habitId

  const handleAction = (fn) => {
    if (isReadOnly) { onLockedAction(); return }
    fn()
  }

  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
      isReadOnly ? "opacity-75" : ""
    } ${entry.completed ? `${m.bg} ${m.border}` : "bg-white/[0.03] border-white/[0.07]"}`}>
      <div className="flex items-center gap-3 px-3.5 py-3">
        <div className="relative flex-shrink-0" onClick={()=>!isBoolean&&handleAction(()=>setExpanded(e=>!e))}>
          <Ring pct={pct} unit={entry.unit} size={44} stroke={3}/>
          <div className="absolute inset-0 flex items-center justify-center">
            {isReadOnly
              ? <Lock size={11} className="text-white/20"/>
              : <Icon size={13} className={entry.completed ? m.text : "text-white/20"}/>
            }
          </div>
        </div>
        <div className="flex-1 min-w-0" onClick={()=>!isBoolean&&handleAction(()=>setExpanded(e=>!e))}>
          <p className={`text-[13px] font-semibold truncate ${entry.completed?"text-white/40 line-through decoration-white/20":"text-white/85"}`}>
            {entry.habitName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className={`text-[9px] font-semibold uppercase tracking-wider ${m.text}`}>{m.label}</span>
            {!isBoolean && entry.targetValue && (
              <span className="text-[9px] font-mono text-white/25">
                {parseFloat((entry.value??0).toFixed(1))}/{entry.targetValue}
              </span>
            )}
            {entry.timeWindowStart && (
              <span className="text-[9px] font-mono text-white/20 flex items-center gap-0.5">
                <Clock size={8}/>{entry.timeWindowStart}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={()=>handleAction(()=>onAddNote(entry))}
            className={`flex items-center justify-center w-7 h-7 rounded-xl border transition-all ${
              entry.notes?"bg-amber-500/15 border-amber-500/30 text-amber-400":"bg-white/[0.04] border-white/[0.06] text-white/20 hover:text-amber-400/70"
            } ${isReadOnly?"cursor-not-allowed":""}`}>
            <FileText size={11}/>
          </button>
          {isBoolean ? (
            <button
              onClick={()=>handleAction(()=>entry.completed?onUncheck(entry.habitId):onCheck(entry.habitId))}
              disabled={loading}
              className={`flex items-center justify-center w-9 h-9 rounded-xl border font-bold transition-all ${
                entry.completed?`${m.bg} ${m.border} ${m.text}`:"bg-white/[0.05] border-white/[0.1] text-white/30"
              } ${isReadOnly?"cursor-not-allowed opacity-60":""} disabled:opacity-40`}>
              {loading?<Loader2 size={13} className="animate-spin"/>:entry.completed?<Check size={13}/>:<Square size={13}/>}
            </button>
          ) : (
            <button onClick={()=>handleAction(()=>setExpanded(e=>!e))}
              className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${
                entry.completed?`${m.bg} ${m.border} ${m.text}`:"bg-white/[0.04] border-white/[0.07] text-white/30"
              } ${isReadOnly?"cursor-not-allowed opacity-60":""} disabled:opacity-40`}>
              {loading?<Loader2 size={11} className="animate-spin"/>:<span className="text-[10px] font-mono font-bold">{pct}%</span>}
            </button>
          )}
        </div>
      </div>
      {expanded && !isReadOnly && !isBoolean && (
        <div className="border-t border-white/[0.06] px-3.5 py-3">
          {isMinutes ? (
            <Stopwatch entry={entry} onUpdateValue={v=>onUpdateValue(entry.habitId,v)} loading={loading}/>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/25 font-mono">Pages</span>
                {loading&&<Loader2 size={10} className="animate-spin text-white/20"/>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>onUpdateValue(entry.habitId,Math.max(0,(entry.value??0)-5))} className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/30 hover:text-white/70 transition-all text-[10px] font-mono">-5</button>
                <button onClick={()=>onUpdateValue(entry.habitId,Math.max(0,(entry.value??0)-1))} className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/30 hover:text-white/70 transition-all"><Minus size={11}/></button>
                <div className="flex-1 text-center">
                  <span className="text-[26px] font-black font-mono text-emerald-300">{Math.round(entry.value??0)}</span>
                  {entry.targetValue&&<span className="text-[11px] text-white/20 ml-1 font-mono">/{entry.targetValue}</span>}
                </div>
                <button onClick={()=>onUpdateValue(entry.habitId,(entry.value??0)+1)} className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/30 hover:text-white/70 transition-all"><Plus size={11}/></button>
                <button onClick={()=>onUpdateValue(entry.habitId,(entry.value??0)+5)} className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/30 hover:text-white/70 transition-all text-[10px] font-mono">+5</button>
              </div>
              {entry.targetValue&&(
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{width:`${Math.min(100,((entry.value??0)/entry.targetValue)*100)}%`}}/>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={()=>onUpdateValue(entry.habitId,0)} className="flex-1 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-[11px] font-semibold text-white/30 hover:text-white/60 transition-all">Reset</button>
                <button onClick={()=>{onUpdateValue(entry.habitId,entry.targetValue||entry.value||0);setExpanded(false)}} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all"><Check size={11}/>Done</button>
              </div>
            </div>
          )}
        </div>
      )}
      {!isBoolean&&!expanded&&(
        <div className="h-0.5 bg-white/[0.04]">
          <div className={`h-full ${entry.unit==="minutes"?"bg-sky-500":"bg-emerald-500"} transition-all duration-500`} style={{width:`${pct}%`}}/>
        </div>
      )}
    </div>
  )
}

// ── Habit Card — DESKTOP (two-column row) ────────────────────────────────────
function HabitCardDesktop({ entry, onCheck, onUncheck, onUpdateValue, onAddNote, busy, isReadOnly, onLockedAction }) {
  const [expanded, setExpanded] = useState(false)
  const m = UNIT[entry.unit] || UNIT.boolean
  const Icon = m.icon
  const isBoolean = entry.unit === "boolean"
  const isMinutes = entry.unit === "minutes"
  const pct = isBoolean
    ? (entry.completed ? 100 : 0)
    : entry.targetValue ? Math.min(100, Math.round(((entry.value??0)/entry.targetValue)*100))
    : (entry.value ? 100 : 0)
  const loading = busy === entry.habitId

  const handleAction = (fn) => {
    if (isReadOnly) { onLockedAction(); return }
    fn()
  }

  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
      isReadOnly ? "opacity-75" : ""
    } ${entry.completed ? `${m.bg} ${m.border}` : "bg-white/[0.03] border-white/[0.07] hover:border-white/[0.12]"}`}>
      <div className="flex items-stretch">
        <div className="flex items-center gap-4 px-5 py-4 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <Ring pct={pct} unit={entry.unit} size={54} stroke={4}/>
            <div className="absolute inset-0 flex items-center justify-center">
              {isReadOnly
                ? <Lock size={14} className="text-white/20"/>
                : <Icon size={16} className={entry.completed ? m.text : "text-white/20"}/>
              }
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <p className={`text-[15px] font-semibold truncate transition-all ${
                entry.completed?"text-white/40 line-through decoration-white/20":"text-white/90"
              }`}>{entry.habitName}</p>
              {entry.notes && <span className="text-amber-400/60 flex-shrink-0 text-[12px]">📝</span>}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                m.bg.replace("/10","/20")} ${m.border} ${m.text}`}>{m.label}</span>
              {!isBoolean && entry.targetValue && (
                <span className="text-[11px] font-mono text-white/30">
                  {parseFloat((entry.value??0).toFixed(1))} / {entry.targetValue} {m.label.toLowerCase()}
                </span>
              )}
              {entry.timeWindowStart && entry.timeWindowEnd && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-white/20">
                  <Clock size={9}/>{entry.timeWindowStart}–{entry.timeWindowEnd}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="w-px bg-white/[0.06] my-3"/>
        <div className="flex items-center gap-3 px-4 py-4 flex-shrink-0">
          <button onClick={()=>handleAction(()=>onAddNote(entry))}
            className={`flex items-center justify-center w-8 h-8 rounded-xl border transition-all ${
              entry.notes?"bg-amber-500/15 border-amber-500/30 text-amber-400":"bg-white/[0.04] border-white/[0.07] text-white/20 hover:text-amber-400/70 hover:border-amber-500/20"
            } ${isReadOnly?"cursor-not-allowed":""}`}>
            <FileText size={13}/>
          </button>
          {isBoolean ? (
            <button
              onClick={()=>handleAction(()=>entry.completed?onUncheck(entry.habitId):onCheck(entry.habitId))}
              disabled={loading}
              className={`flex items-center justify-center w-10 h-10 rounded-xl border font-bold transition-all ${
                entry.completed?`${m.bg} ${m.border} ${m.text} hover:opacity-80`:"bg-white/[0.05] border-white/[0.1] text-white/30 hover:text-white/70"
              } ${isReadOnly?"cursor-not-allowed":""} disabled:opacity-40`}>
              {loading?<Loader2 size={15} className="animate-spin"/>:entry.completed?<Check size={15}/>:<Square size={15}/>}
            </button>
          ) : (
            <button onClick={()=>handleAction(()=>setExpanded(e=>!e))}
              className={`flex items-center gap-1.5 px-3 h-10 rounded-xl border transition-all ${
                entry.completed?`${m.bg} ${m.border} ${m.text}`:"bg-white/[0.04] border-white/[0.08] text-white/30 hover:text-white/60"
              } ${isReadOnly?"cursor-not-allowed":""} disabled:opacity-40`}>
              {loading?<Loader2 size={13} className="animate-spin"/>:(
                <>
                  <span className="text-[11px] font-mono font-bold">{pct}%</span>
                  {!isReadOnly && <span className="text-[9px] text-white/20">{expanded?"▲":"▼"}</span>}
                </>
              )}
            </button>
          )}
        </div>
      </div>
      {expanded && !isReadOnly && !isBoolean && (
        <div className="border-t border-white/[0.06] px-5 py-4">
          {isMinutes ? (
            <Stopwatch entry={entry} onUpdateValue={v=>onUpdateValue(entry.habitId,v)} loading={loading}/>
          ) : (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <button onClick={()=>onUpdateValue(entry.habitId,Math.max(0,(entry.value??0)-5))} className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/30 hover:text-white/70 transition-all text-[10px] font-mono">-5</button>
                <button onClick={()=>onUpdateValue(entry.habitId,Math.max(0,(entry.value??0)-1))} className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/30 hover:text-white/70 transition-all"><Minus size={12}/></button>
                <div className="text-center px-2">
                  <span className="text-[28px] font-black font-mono text-emerald-300">{Math.round(entry.value??0)}</span>
                  {entry.targetValue&&<span className="text-[12px] text-white/25 ml-1 font-mono">/{entry.targetValue}</span>}
                </div>
                <button onClick={()=>onUpdateValue(entry.habitId,(entry.value??0)+1)} className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/30 hover:text-white/70 transition-all"><Plus size={12}/></button>
                <button onClick={()=>onUpdateValue(entry.habitId,(entry.value??0)+5)} className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/30 hover:text-white/70 transition-all text-[10px] font-mono">+5</button>
              </div>
              {entry.targetValue&&(
                <div className="flex-1">
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{width:`${Math.min(100,((entry.value??0)/entry.targetValue)*100)}%`}}/>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] font-mono text-white/20">0 pages</span>
                    <span className="text-[9px] font-mono text-emerald-400/60">{Math.round(((entry.value??0)/entry.targetValue)*100)}%</span>
                    <span className="text-[9px] font-mono text-white/20">{entry.targetValue} pages</span>
                  </div>
                </div>
              )}
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={()=>onUpdateValue(entry.habitId,0)} className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-[12px] font-semibold text-white/30 hover:text-white/60 transition-all">Reset</button>
                <button onClick={()=>{onUpdateValue(entry.habitId,entry.targetValue||entry.value||0);setExpanded(false)}} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-[12px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all"><Check size={12}/>Done</button>
              </div>
            </div>
          )}
        </div>
      )}
      {!isBoolean&&!expanded&&(
        <div className="h-px bg-white/[0.04]">
          <div className={`h-full ${entry.unit==="minutes"?"bg-sky-500":"bg-emerald-500"} transition-all duration-500`} style={{width:`${pct}%`}}/>
        </div>
      )}
    </div>
  )
}

// ── Accuracy Summary Card ─────────────────────────────────────────────────────
function AccuracySummary({ log }) {
  const accuracy  = log?.dailyAccuracy ?? 0
  const completed = log?.totalCompleted ?? 0
  const total     = log?.habits?.length ?? 0
  const circ = 2*Math.PI*32
  const off  = circ - (accuracy/100)*circ
  const color = accuracy===100?"#34d399":accuracy>=70?"#818cf8":"#38bdf8"

  return (
    <div className="flex items-center gap-4 bg-white/[0.025] border border-white/[0.07] rounded-2xl px-4 py-3.5">
      <div className="relative flex-shrink-0">
        <svg width={72} height={72} viewBox="0 0 72 72" className="-rotate-90">
          <circle cx={36} cy={36} r={32} fill="none" stroke="#ffffff07" strokeWidth={4.5}/>
          <circle cx={36} cy={36} r={32} fill="none" stroke={color} strokeWidth={4.5}
            strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
            style={{transition:"stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)"}}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[16px] font-black text-white leading-none">{accuracy}%</span>
          <span className="text-[8px] font-mono text-white/20 uppercase tracking-wider">done</span>
        </div>
      </div>
      <div className="flex flex-1 gap-3">
        {[
          { icon:<Target    size={11} className="text-violet-400"/>, label:"Total",     val:total,           sub:"habits" },
          { icon:<Check     size={11} className="text-emerald-400"/>,label:"Complete",  val:completed,       sub:"done" },
          { icon:<TrendingUp size={11} className="text-sky-400"/>,   label:"Remaining", val:total-completed, sub:"left" },
        ].map(s=>(
          <div key={s.label} className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-2.5 py-2">
            <div className="flex items-center gap-1 mb-0.5">{s.icon}
              <span className="text-[8px] font-mono uppercase tracking-wider text-white/20">{s.label}</span>
            </div>
            <p className="text-[18px] font-extrabold text-white leading-none">{s.val}</p>
            <p className="text-[8px] text-white/15 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Notification Button ───────────────────────────────────────────────────────
function NotificationButton({ permission, onRequest }) {
  const isGranted = permission === "granted"
  const isDenied  = permission === "denied"
  return (
    <button
      onClick={!isGranted && !isDenied ? onRequest : undefined}
      title={isGranted ? "Reminders on" : isDenied ? "Blocked in browser" : "Enable reminders"}
      className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${
        isGranted
          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
          : isDenied
          ? "bg-red-500/10 border-red-500/20 text-red-400/50 cursor-not-allowed"
          : "bg-white/[0.04] border-white/[0.08] text-white/30 hover:text-white/60 hover:bg-white/[0.07]"
      }`}
    >
      {isGranted ? <Bell size={14}/> : <BellOff size={14}/>}
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HabitLogPage() {
  const [date, setDate]             = useState(toDateString())
  const [log, setLog]               = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState("")
  const [busy, setBusy]             = useState(null)
  const [noteEntry, setNoteEntry]   = useState(null)
  const [savingNote, setSavingNote] = useState(false)
  const prevLogRef                  = useRef(null)

  // Toast & Push
  const { toasts, toast, removeToast } = useToast()
  const { permission, requestPermission, sendNotification } = usePushNotifications(toast)

  const isToday   = date === toDateString()
  const isFuture  = date > toDateString()
  const isPast    = isPastDay(date)          // strictly before today
  const isReadOnly = isPast || isFuture      // lock both past AND future

  // ── Fetch log ─────────────────────────────────────────────────────────────
  const fetchLog = useCallback(async (d) => {
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/habits/log?date=${d}`)
      if (!res.ok) throw new Error("Failed to load")
      const data = await res.json()
      setLog(data.log ?? null)
      prevLogRef.current = data.log ?? null
    } catch(e) {
      setError(e.message)
      toast.error("Failed to load", e.message)
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line

  useEffect(() => { fetchLog(date) }, [date, fetchLog])

  // ── Actions ───────────────────────────────────────────────────────────────
  const doAction = async (payload) => {
    if (isReadOnly) {
      toast.lock("Read-only", isPast ? "Past logs can't be edited." : "Future logs can't be edited.")
      return
    }
    setBusy(payload.habitId)
    try {
      const res = await fetch("/api/habits/log", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({...payload, date}),
      })
      if (!res.ok) throw new Error("Failed to save")
      const data = await res.json()
      const newLog = data.log
      const prevLog = prevLogRef.current

      // Detect completion changes for toast + push
      if (prevLog && newLog) {
        const prevHabit = prevLog.habits?.find(h => h.habitId === payload.habitId)
        const newHabit  = newLog.habits?.find(h => h.habitId === payload.habitId)

        if (newHabit && !prevHabit?.completed && newHabit.completed) {
          toast.success("Habit complete! ✓", newHabit.habitName)
          sendNotification("Habit complete! ✓", `${newHabit.habitName} — keep it up!`)
        }

        // Perfect day detection
        const wasPerfect  = (prevLog.dailyAccuracy ?? 0) === 100
        const nowPerfect  = (newLog.dailyAccuracy  ?? 0) === 100
        if (!wasPerfect && nowPerfect) {
          toast.success("Perfect day! 🔥", `All ${newLog.habits?.length} habits done!`, 5000)
          sendNotification("Perfect day! 🔥", `All ${newLog.habits?.length} habits completed today!`)
        }
      }

      setLog(newLog)
      prevLogRef.current = newLog
    } catch(e) {
      console.error(e)
      toast.error("Save failed", "Check your connection and try again.")
    } finally {
      setBusy(null)
    }
  }

  const handleCheck       = id => doAction({action:"check", habitId:id})
  const handleUncheck     = id => doAction({action:"uncheck", habitId:id})
  const handleUpdateValue = (id, value) => doAction({action:"update_value", habitId:id, value})
  const handleLockedAction = () => {
    if (isPast)   toast.lock("Read-only", "Past logs can't be edited.")
    if (isFuture) toast.lock("Read-only", "Future logs can't be edited.")
  }

  const handleSaveNote = async (notes) => {
    if (!noteEntry || !notes) return
    if (isReadOnly) {
      toast.lock("Read-only", "Notes can't be added to past or future logs.")
      return
    }
    setSavingNote(true)
    try {
      const res = await fetch("/api/habits/log", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({action:"add_note", habitId:noteEntry.habitId, notes, date}),
      })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      setLog(data.log)
      prevLogRef.current = data.log
      setNoteEntry(null)
      toast.success("Note saved", noteEntry.habitName)
    } catch(e) {
      console.error(e)
      toast.error("Failed to save note")
    } finally {
      setSavingNote(false)
    }
  }

  const habits   = log?.habits ?? []
  const accuracy = log?.dailyAccuracy ?? 0
  const total    = habits.length

  const sharedCardProps = {
    onCheck:handleCheck, onUncheck:handleUncheck,
    onUpdateValue:handleUpdateValue,
    onAddNote: isReadOnly ? handleLockedAction : setNoteEntry,
    busy, isReadOnly, onLockedAction: handleLockedAction
  }

  return (
    <div className="min-h-screen bg-[#08080f] text-white">
      {/* Toast animations */}
      <style>{`
        @keyframes slideInRight {
          from { opacity:0; transform:translateX(100%) scale(0.95); }
          to   { opacity:1; transform:translateX(0)   scale(1);    }
        }
        @keyframes slideOutRight {
          from { opacity:1; transform:translateX(0)    scale(1);    }
          to   { opacity:0; transform:translateX(100%) scale(0.95); }
        }
      `}</style>

      <ToastContainer toasts={toasts} onRemove={removeToast}/>

      <div className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-700/[0.07] blur-[140px] -z-0"/>
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-700/[0.06] blur-[100px] -z-0"/>

      {/* ── MOBILE layout (< md) ── */}
      <div className="md:hidden relative z-10 px-4 pt-6 pb-10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Sparkles size={10} className="text-indigo-400"/>
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/20">Daily Log</span>
            </div>
            <h1 className="text-[22px] font-extrabold tracking-tight">Check-in</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationButton permission={permission} onRequest={requestPermission}/>
            <div className="flex items-center gap-0.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1">
              <button onClick={()=>setDate(d=>offsetDate(d,-1))}
                className="flex items-center justify-center w-8 h-8 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.07] transition-all">
                <ChevronLeft size={14}/>
              </button>
              <div className="flex items-center gap-1 px-2 min-w-[72px] justify-center">
                <CalendarDays size={10} className="text-white/25"/>
                <span className="text-[11px] font-semibold text-white/55">{formatDisplayDate(date)}</span>
              </div>
              <button onClick={()=>!isToday&&setDate(d=>offsetDate(d,1))} disabled={isToday}
                className="flex items-center justify-center w-8 h-8 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.07] transition-all disabled:opacity-25 disabled:cursor-not-allowed">
                <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        </div>

        {!loading && log && <AccuracySummary log={log}/>}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={24} className="animate-spin text-indigo-500"/>
            <p className="text-[12px] text-white/20">Loading log…</p>
          </div>
        )}
        {!loading && error && (
          <div className="flex items-center gap-2.5 bg-red-500/[0.08] border border-red-500/25 rounded-xl px-3.5 py-3">
            <AlertCircle size={13} className="text-red-400 flex-shrink-0"/>
            <p className="text-[12px] font-semibold text-red-400 flex-1">{error}</p>
            <button onClick={()=>fetchLog(date)} className="text-[11px] font-bold text-red-400/70 hover:text-red-400">Retry</button>
          </div>
        )}
        {!loading && !error && !log && (
          <div className="flex flex-col items-center py-20 gap-3 text-center">
            <Target size={30} className="text-white/10"/>
            <p className="text-[14px] font-bold text-white/30">No habits configured</p>
            <p className="text-[11px] text-white/15">Add habits from the Habits page first</p>
          </div>
        )}

        {/* Past / Future notice */}
        {!loading && log && isPast   && <PastDayBanner/>}
        {!loading && log && isFuture && (
          <div className="flex items-center gap-2 bg-amber-500/[0.07] border border-amber-500/20 rounded-xl px-3.5 py-2.5">
            <AlertCircle size={12} className="text-amber-400/60"/>
            <p className="text-[11px] text-amber-400/55">Future date — read-only.</p>
          </div>
        )}

        {!loading && !error && log && habits.length > 0 && (
          <div className="space-y-2">
            {habits.map(entry => (
              <HabitCardMobile key={entry.habitId} entry={entry} {...sharedCardProps}/>
            ))}
          </div>
        )}

        {!loading && log && accuracy===100 && total>0 && (
          <div className="flex items-center gap-3 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-2xl px-4 py-3.5">
            <Flame size={16} className="text-emerald-400 flex-shrink-0"/>
            <div>
              <p className="text-[12px] font-bold text-emerald-300">Perfect day! 🎉</p>
              <p className="text-[10px] text-emerald-400/45 mt-0.5">All {total} habits done. Keep the streak!</p>
            </div>
          </div>
        )}
      </div>

      {/* ── TABLET layout (md – lg) ── */}
      <div className="hidden md:block lg:hidden relative z-10 px-6 pt-8 pb-12 max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={11} className="text-indigo-400"/>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20">Daily Log</span>
            </div>
            <h1 className="text-[26px] font-extrabold tracking-tight">Habit Check-in</h1>
            <p className="text-[12px] text-white/30 mt-0.5">{formatDisplayDate(date)}</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationButton permission={permission} onRequest={requestPermission}/>
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1">
              <button onClick={()=>setDate(d=>offsetDate(d,-1))} className="flex items-center justify-center w-9 h-9 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.08] transition-all"><ChevronLeft size={15}/></button>
              <div className="flex items-center gap-1.5 px-2 min-w-[90px] justify-center">
                <CalendarDays size={11} className="text-white/25"/>
                <span className="text-[12px] font-semibold text-white/60">{formatDisplayDate(date)}</span>
              </div>
              <button onClick={()=>!isToday&&setDate(d=>offsetDate(d,1))} disabled={isToday} className="flex items-center justify-center w-9 h-9 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.08] transition-all disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={15}/></button>
            </div>
          </div>
        </div>

        {!loading && log && <AccuracySummary log={log}/>}
        {loading && <div className="flex flex-col items-center justify-center py-24 gap-4"><Loader2 size={26} className="animate-spin text-indigo-500"/><p className="text-[13px] text-white/25">Loading your log…</p></div>}
        {!loading && error && <div className="flex items-center gap-3 bg-red-500/[0.08] border border-red-500/25 rounded-2xl px-4 py-3.5"><AlertCircle size={14} className="text-red-400 flex-shrink-0"/><p className="text-[13px] font-semibold text-red-400 flex-1">{error}</p><button onClick={()=>fetchLog(date)} className="text-[11px] font-bold text-red-400/70 hover:text-red-400">Retry</button></div>}
        {!loading && !error && !log && <div className="flex flex-col items-center py-24 gap-3 text-center"><Target size={32} className="text-white/10"/><p className="text-[15px] font-bold text-white/35">No habits configured</p><p className="text-[12px] text-white/20">Add habits from the Habits page</p></div>}
        {!loading && log && isPast   && <PastDayBanner/>}
        {!loading && log && isFuture && <div className="flex items-center gap-2.5 bg-amber-500/[0.07] border border-amber-500/20 rounded-xl px-4 py-2.5"><AlertCircle size={13} className="text-amber-400/70 flex-shrink-0"/><p className="text-[12px] text-amber-400/60">Future date — check-ins are read-only.</p></div>}

        {!loading && !error && log && habits.length > 0 && (
          <div className="space-y-2.5">
            {habits.map(entry => (
              <HabitCardDesktop key={entry.habitId} entry={entry} {...sharedCardProps}/>
            ))}
          </div>
        )}
        {!loading && log && accuracy===100 && total>0 && (
          <div className="flex items-center gap-3 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-2xl px-5 py-4"><Flame size={18} className="text-emerald-400 flex-shrink-0"/><div><p className="text-[13px] font-bold text-emerald-300">Perfect day! 🎉</p><p className="text-[11px] text-emerald-400/50 mt-0.5">All {total} habits completed. Keep the streak alive.</p></div></div>
        )}
      </div>

      {/* ── DESKTOP layout (≥ lg) ── */}
      <div className="hidden lg:block relative z-10">
        <div className="max-w-6xl mx-auto px-8 pt-10 pb-14">
          <div className="flex items-start justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles size={12} className="text-indigo-400"/>
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/20">Daily Log</span>
              </div>
              <h1 className="text-[32px] font-extrabold tracking-tight leading-none">Habit Check-in</h1>
              <p className="text-[13px] text-white/30 mt-2">{formatDisplayDate(date)}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <NotificationButton permission={permission} onRequest={requestPermission}/>
              <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1.5">
                <button onClick={()=>setDate(d=>offsetDate(d,-1))} className="flex items-center justify-center w-9 h-9 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.08] transition-all"><ChevronLeft size={15}/></button>
                <div className="flex items-center gap-2 px-3 min-w-[110px] justify-center">
                  <CalendarDays size={12} className="text-white/25"/>
                  <span className="text-[13px] font-semibold text-white/60">{formatDisplayDate(date)}</span>
                </div>
                <button onClick={()=>!isToday&&setDate(d=>offsetDate(d,1))} disabled={isToday} className="flex items-center justify-center w-9 h-9 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.08] transition-all disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={15}/></button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_320px] gap-6">
            <div className="space-y-3">
              {loading && <div className="flex flex-col items-center justify-center py-32 gap-4"><Loader2 size={28} className="animate-spin text-indigo-500"/><p className="text-[13px] text-white/25">Loading your log…</p></div>}
              {!loading && error && <div className="flex items-center gap-3 bg-red-500/[0.08] border border-red-500/25 rounded-2xl px-5 py-4"><AlertCircle size={15} className="text-red-400 flex-shrink-0"/><p className="text-[13px] font-semibold text-red-400 flex-1">{error}</p><button onClick={()=>fetchLog(date)} className="text-[11px] font-bold text-red-400/70 hover:text-red-400">Retry</button></div>}
              {!loading && !error && !log && <div className="flex flex-col items-center py-32 gap-3 text-center"><Target size={36} className="text-white/10"/><p className="text-[16px] font-bold text-white/35">No habits configured</p><p className="text-[13px] text-white/20">Add habits from the Habits page first</p></div>}
              {!loading && log && isPast   && <PastDayBanner/>}
              {!loading && log && isFuture && <div className="flex items-center gap-2.5 bg-amber-500/[0.07] border border-amber-500/20 rounded-xl px-4 py-2.5"><AlertCircle size={13} className="text-amber-400/70 flex-shrink-0"/><p className="text-[12px] text-amber-400/60">Future date — check-ins are read-only.</p></div>}

              {!loading && !error && log && habits.length > 0 && habits.map(entry => (
                <HabitCardDesktop key={entry.habitId} entry={entry} {...sharedCardProps}/>
              ))}

              {!loading && log && accuracy===100 && total>0 && (
                <div className="flex items-center gap-4 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-2xl px-5 py-4">
                  <Flame size={20} className="text-emerald-400 flex-shrink-0"/>
                  <div>
                    <p className="text-[14px] font-bold text-emerald-300">Perfect day! 🎉</p>
                    <p className="text-[12px] text-emerald-400/50 mt-0.5">All {total} habits completed. Keep the streak alive.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {!loading && log && (
                <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5 flex flex-col items-center gap-4">
                  <div className="relative">
                    {(() => {
                      const acc   = log.dailyAccuracy ?? 0
                      const color = acc===100?"#34d399":acc>=70?"#818cf8":"#38bdf8"
                      const circ  = 2*Math.PI*48
                      const off   = circ - (acc/100)*circ
                      return (
                        <>
                          <svg width={110} height={110} viewBox="0 0 110 110" className="-rotate-90">
                            <circle cx={55} cy={55} r={48} fill="none" stroke="#ffffff07" strokeWidth={6}/>
                            <circle cx={55} cy={55} r={48} fill="none" stroke={color} strokeWidth={6}
                              strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
                              style={{transition:"stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)"}}/>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                            <span className="text-[26px] font-black text-white leading-none">{acc}%</span>
                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-wider">accuracy</span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                  <div className="grid grid-cols-3 gap-2 w-full">
                    {[
                      { label:"Total", val:habits.length,             color:"text-violet-300" },
                      { label:"Done",  val:log.totalCompleted??0,     color:"text-emerald-300" },
                      { label:"Left",  val:habits.length-(log.totalCompleted??0), color:"text-sky-300" },
                    ].map(s=>(
                      <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl py-2.5 px-2 text-center">
                        <p className={`text-[20px] font-extrabold ${s.color} leading-none`}>{s.val}</p>
                        <p className="text-[9px] font-mono text-white/20 mt-1 uppercase tracking-wider">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && log && habits.length > 0 && (
                <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-4 space-y-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-3">By Type</p>
                  {Object.entries(UNIT).map(([key, m]) => {
                    const group = habits.filter(h=>h.unit===key)
                    if (!group.length) return null
                    const done  = group.filter(h=>h.completed).length
                    const Icon  = m.icon
                    return (
                      <div key={key} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${m.bg} border ${m.border}`}>
                        <Icon size={14} className={m.text}/>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-semibold ${m.text}`}>{m.label}</p>
                          <div className="h-1 bg-white/[0.08] rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{width:`${group.length?Math.round((done/group.length)*100):0}%`, background: m.ring}}/>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-white/40">{done}/{group.length}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-3">Jump to</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label:"Today",     d:toDateString() },
                    { label:"Yesterday", d:offsetDate(toDateString(),-1) },
                    { label:"2 days ago",d:offsetDate(toDateString(),-2) },
                    { label:"3 days ago",d:offsetDate(toDateString(),-3) },
                  ].map(opt=>(
                    <button key={opt.label} onClick={()=>setDate(opt.d)}
                      className={`px-3 py-2 rounded-xl text-[11px] font-semibold transition-all border ${
                        date===opt.d
                          ?"bg-violet-600/20 border-violet-500/40 text-violet-300"
                          :"bg-white/[0.03] border-white/[0.07] text-white/30 hover:text-white/60 hover:bg-white/[0.06]"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Push notification card */}
              <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-3">Reminders</p>
                <div className="space-y-2">
                  {[
                    { time:"9:00 AM", label:"Morning check-in" },
                    { time:"8:00 PM", label:"Evening wrap-up" },
                  ].map(r=>(
                    <div key={r.time} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${
                      permission==="granted"
                        ?"bg-emerald-500/[0.06] border-emerald-500/20"
                        :"bg-white/[0.02] border-white/[0.06]"
                    }`}>
                      <Bell size={10} className={permission==="granted"?"text-emerald-400":"text-white/20"}/>
                      <div className="flex-1">
                        <p className="text-[10px] font-semibold text-white/50">{r.label}</p>
                        <p className="text-[9px] font-mono text-white/20">{r.time}</p>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md border ${
                        permission==="granted"
                          ?"bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                          :"bg-white/[0.04] border-white/[0.08] text-white/20"
                      }`}>{permission==="granted"?"on":"off"}</span>
                    </div>
                  ))}
                  {permission !== "granted" && (
                    <button onClick={requestPermission}
                      className="w-full mt-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-[11px] font-bold text-indigo-300 hover:bg-indigo-500/25 transition-all">
                      <Bell size={11}/> Enable reminders
                    </button>
                  )}
                  {permission === "denied" && (
                    <p className="text-[9px] text-white/20 text-center mt-1">Enable in browser settings to activate.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {noteEntry && !isReadOnly && (
        <NotesModal entry={noteEntry} onSave={handleSaveNote} onClose={()=>setNoteEntry(null)} saving={savingNote}/>
      )}
    </div>
  )
}