"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Plus, Trash2, Clock, BookOpen, CheckSquare,
  Timer, FileText, X, Sparkles, Target, Flame,
  AlertCircle, Loader2, Lock, GripVertical,
  CheckCircle2, Info, AlertTriangle, Search,
  LayoutGrid, List, Zap
} from "lucide-react"

// ── Unit config ───────────────────────────────────────────────────────────────
const UNIT_OPTIONS = [
  { value: "boolean", label: "Checkbox", icon: <CheckSquare size={14} />, color: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/25", text: "text-violet-300", bar: "bg-violet-500", ring: "#8b5cf6" },
  { value: "minutes", label: "Minutes",  icon: <Timer       size={14} />, color: "text-sky-400",    bg: "bg-sky-500/15",    border: "border-sky-500/25",    text: "text-sky-300",    bar: "bg-sky-500",    ring: "#38bdf8" },
  { value: "pages",   label: "Pages",    icon: <BookOpen    size={14} />, color: "text-emerald-400",bg: "bg-emerald-500/15",border: "border-emerald-500/25",text: "text-emerald-300",bar: "bg-emerald-500",ring: "#34d399" },
]

const MAX_HABITS = 10

const EMPTY_FORM = {
  habitName: "", unit: "boolean", targetValue: "",
  timeWindowStart: "", timeWindowEnd: "", notes: "",
}

// ── Toast ─────────────────────────────────────────────────────────────────────
const TOAST_TYPES = {
  success: { icon: CheckCircle2,  bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-300" },
  error:   { icon: AlertTriangle, bg: "bg-red-500/15",     border: "border-red-500/30",     text: "text-red-300"     },
  info:    { icon: Info,          bg: "bg-sky-500/15",     border: "border-sky-500/30",     text: "text-sky-300"     },
  warning: { icon: AlertTriangle, bg: "bg-amber-500/15",   border: "border-amber-500/30",   text: "text-amber-300"   },
}

function Toast({ toast, onRemove }) {
  const s = TOAST_TYPES[toast.type] || TOAST_TYPES.info
  const Icon = s.icon
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[260px] max-w-[340px] pointer-events-auto ${s.bg} ${s.border}`}
      style={{ animation: "slideInRight 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
      <Icon size={14} className={`${s.text} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        {toast.title   && <p className={`text-[12px] font-bold ${s.text}`}>{toast.title}</p>}
        {toast.message && <p className={`text-[11px] ${s.text} opacity-70 mt-0.5`}>{toast.message}</p>}
      </div>
      <button onClick={() => onRemove(toast.id)} className={`${s.text} opacity-40 hover:opacity-80 transition-opacity`}>
        <X size={12} />
      </button>
    </div>
  )
}

function useToast() {
  const [toasts, setToasts] = useState([])
  const remove = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), [])
  const add = useCallback((type, title, message, dur = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p.slice(-4), { id, type, title, message }])
    setTimeout(() => remove(id), dur)
  }, [remove])
  return {
    toasts, remove,
    toast: {
      success: (t, m, d) => add("success", t, m, d),
      error:   (t, m, d) => add("error",   t, m, d),
      info:    (t, m, d) => add("info",    t, m, d),
      warning: (t, m, d) => add("warning", t, m, d),
    }
  }
}

// ── Slot dots ─────────────────────────────────────────────────────────────────
function SlotDots({ used, max }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${
          i < used ? "bg-violet-500 shadow-[0_0_4px_rgba(139,92,246,0.6)]" : "bg-white/[0.08]"
        }`} />
      ))}
    </div>
  )
}

// ── Habit card ────────────────────────────────────────────────────────────────
function HabitCard({ habit, onRemove, removing, view }) {
  const u = UNIT_OPTIONS.find(x => x.value === habit.unit) || UNIT_OPTIONS[0]
  const isRemoving = removing === habit.habitId

  if (view === "grid") {
    return (
      <div className="group relative flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.05] transition-all duration-200">
        <div className="flex items-start justify-between gap-2">
          <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${u.bg} border ${u.border} flex-shrink-0`}>
            <span className={u.color}>{u.icon}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono font-bold text-white/20 bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded-lg">{habit.habitId}</span>
            <button onClick={() => onRemove(habit.habitId)} disabled={isRemoving}
              className="flex items-center justify-center w-7 h-7 rounded-xl opacity-0 group-hover:opacity-100 bg-red-500/[0.08] border border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-500/15 transition-all disabled:opacity-50">
              {isRemoving ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            </button>
          </div>
        </div>
        <div>
          <p className="text-[13.5px] font-semibold text-white/85 leading-snug">{habit.habitName}</p>
          {habit.notes && <p className="text-[11px] text-white/25 italic mt-1 line-clamp-2">"{habit.notes}"</p>}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-auto">
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${u.bg} ${u.border} ${u.text}`}>
            {u.icon} {u.label}
          </span>
          {habit.targetValue && habit.unit !== "boolean" && (
            <span className="text-[10px] font-mono text-white/30 bg-white/[0.04] border border-white/[0.07] px-2 py-0.5 rounded-full">
              {habit.targetValue} {habit.unit}
            </span>
          )}
          {habit.timeWindowStart && (
            <span className="flex items-center gap-0.5 text-[10px] font-mono text-white/25 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-full">
              <Clock size={9} /> {habit.timeWindowStart}
            </span>
          )}
        </div>
      </div>
    )
  }

  // List view
  return (
    <div className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-200">
      <GripVertical size={14} className="text-white/10 group-hover:text-white/25 transition-colors flex-shrink-0 cursor-grab" />
      <span className="hidden sm:flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[10px] font-bold font-mono text-white/25">
        {habit.habitId}
      </span>
      <div className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 ${u.bg} border ${u.border}`}>
        <span className={u.color}>{u.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-white/85 truncate">{habit.habitName}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${u.bg} ${u.border} ${u.text}`}>
            {u.label}
          </span>
          {habit.targetValue && habit.unit !== "boolean" && (
            <span className="text-[11px] font-mono text-white/25">Target: {habit.targetValue} {habit.unit}</span>
          )}
          {habit.timeWindowStart && habit.timeWindowEnd && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-white/25">
              <Clock size={9} /> {habit.timeWindowStart}–{habit.timeWindowEnd}
            </span>
          )}
        </div>
      </div>
      {habit.notes && (
        <p className="hidden lg:block text-[12px] text-white/20 italic truncate max-w-[150px]">"{habit.notes}"</p>
      )}
      <button onClick={() => onRemove(habit.habitId)} disabled={isRemoving}
        className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-500/[0.1] hover:border-red-500/25 border border-transparent transition-all disabled:opacity-50">
        {isRemoving ? <Loader2 size={14} className="animate-spin text-red-400" /> : <Trash2 size={14} />}
      </button>
    </div>
  )
}

// ── Add Habit Modal ───────────────────────────────────────────────────────────
function AddHabitModal({ onClose, onAdd, adding, error, slotsLeft }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const selectedUnit = UNIT_OPTIONS.find(u => u.value === form.unit)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0f0f1e] border border-white/[0.1] rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.75)] overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-indigo-600/10 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-[0_0_20px_rgba(124,58,237,0.45)]">
              <Plus size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-extrabold text-white tracking-tight">New Habit</h2>
              <p className="text-[11px] text-white/30 mt-0.5">{slotsLeft} slot{slotsLeft !== 1 ? "s" : ""} remaining</p>
            </div>
          </div>
          <button onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.1] transition-all">
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">
              Habit Name <span className="text-red-400">*</span>
            </label>
            <input type="text" required autoFocus
              placeholder="e.g. Morning meditation"
              value={form.habitName}
              onChange={e => set("habitName", e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-2.5 text-[13.5px] text-white placeholder-white/20 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] transition-all"
            />
          </div>

          {/* Tracking type */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Tracking Type</label>
            <div className="grid grid-cols-3 gap-2">
              {UNIT_OPTIONS.map(u => (
                <button type="button" key={u.value} onClick={() => set("unit", u.value)}
                  className={`flex flex-col items-center gap-2 py-3.5 rounded-xl border text-[12px] font-semibold transition-all duration-200 ${
                    form.unit === u.value
                      ? `${u.bg} ${u.border} ${u.text} shadow-[0_0_0_1px_rgba(124,58,237,0.2)]`
                      : "bg-white/[0.03] border-white/[0.07] text-white/35 hover:bg-white/[0.07] hover:text-white/60"
                  }`}>
                  <span className={form.unit === u.value ? u.color : "text-white/25"}>{u.icon}</span>
                  {u.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/20 mt-1.5 ml-1">
              {form.unit === "boolean" && "Simple done / not-done tracking."}
              {form.unit === "minutes" && "Track time spent — comes with a stopwatch."}
              {form.unit === "pages"   && "Track pages read toward a daily target."}
            </p>
          </div>

          {/* Target value */}
          {form.unit !== "boolean" && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">
                Daily Target ({form.unit}) <span className="text-red-400">*</span>
              </label>
              <input type="number" min="1" required
                placeholder={form.unit === "minutes" ? "e.g. 30" : "e.g. 20"}
                value={form.targetValue}
                onChange={e => set("targetValue", e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-2.5 text-[13.5px] text-white placeholder-white/20 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] transition-all"
              />
            </div>
          )}

          {/* Time window */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">
              Time Window <span className="text-white/20 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[["timeWindowStart", "Start time"], ["timeWindowEnd", "End time"]].map(([field, ph]) => (
                <div key={field} className="relative">
                  <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  <input type="time" placeholder={ph} value={form[field]}
                    onChange={e => set(field, e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl pl-8 pr-3 py-2.5 text-[13px] text-white/70 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.07] transition-all [color-scheme:dark]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">
              Notes <span className="text-white/20 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <div className="relative">
              <FileText size={12} className="absolute left-3 top-3 text-white/25 pointer-events-none" />
              <textarea rows={2} placeholder="Why does this habit matter to you?"
                value={form.notes} onChange={e => set("notes", e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl pl-8 pr-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] transition-all resize-none"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/[0.08] border border-red-500/25 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-[12px] text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] font-semibold text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all">
              Cancel
            </button>
            <button
              onClick={() => {
                if (!form.habitName.trim()) return
                if (form.unit !== "boolean" && !form.targetValue) return
                onAdd(form)
              }}
              disabled={adding || !form.habitName.trim() || (form.unit !== "boolean" && !form.targetValue)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-[13px] font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.55)] hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {adding ? "Adding…" : "Add Habit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Confirm Delete Modal ──────────────────────────────────────────────────────
function ConfirmModal({ habit, onConfirm, onCancel, removing }) {
  if (!habit) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-[#0f0f1e] border border-white/[0.1] rounded-3xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/25">
            <Trash2 size={16} className="text-red-400" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-white">Remove habit?</p>
            <p className="text-[11px] text-white/35 mt-0.5">This cannot be undone.</p>
          </div>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5">
          <p className="text-[13px] font-semibold text-white/70 truncate">{habit.habitName}</p>
          <p className="text-[10px] text-white/25 mt-0.5 font-mono uppercase">{habit.unit} · {habit.habitId}</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] font-semibold text-white/40 hover:text-white/70 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={removing}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/20 border border-red-500/35 text-[13px] font-bold text-red-300 hover:bg-red-500/30 transition-all disabled:opacity-50">
            {removing ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HabitsPage() {
  const [habits, setHabits]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [fetchError, setFetchError] = useState("")
  const [showModal, setShowModal]   = useState(false)
  const [adding, setAdding]         = useState(false)
  const [removing, setRemoving]     = useState(null)
  const [addError, setAddError]     = useState("")
  const [filter, setFilter]         = useState("all")
  const [view, setView]             = useState("list")
  const [search, setSearch]         = useState("")
  const [confirmHabit, setConfirmHabit] = useState(null)

  const { toasts, remove: removeToast, toast } = useToast()

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const loadHabits = useCallback(async () => {
    setLoading(true); setFetchError("")
    try {
      const res = await fetch("/api/habits/new")
      if (!res.ok) throw new Error("Failed to load habits")
      const data = await res.json()
      setHabits(data.habits ?? [])
    } catch (err) {
      setFetchError(err.message)
      toast.error("Load failed", err.message)
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line

  useEffect(() => { loadHabits() }, [loadHabits])

  // ── Add ────────────────────────────────────────────────────────────────────
  const handleAdd = async (form) => {
    setAdding(true); setAddError("")
    try {
      const res = await fetch("/api/habits/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          habitName:       form.habitName.trim(),
          unit:            form.unit,
          targetValue:     form.targetValue ? parseFloat(form.targetValue) : null,
          timeWindowStart: form.timeWindowStart || null,
          timeWindowEnd:   form.timeWindowEnd   || null,
          notes:           form.notes.trim()    || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to add habit")
      setHabits(prev => [...prev, data.habit])
      setShowModal(false)
      toast.success("Habit added!", form.habitName.trim())
    } catch (err) {
      setAddError(err.message)
      toast.error("Failed to add", err.message)
    } finally {
      setAdding(false)
    }
  }

  // ── Remove ─────────────────────────────────────────────────────────────────
  const handleRemove = async (habitId) => {
    const habit = habits.find(h => h.habitId === habitId)
    setConfirmHabit(null)
    setRemoving(habitId)
    try {
      const res = await fetch("/api/habits/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", id: habit?.id }),
      })
      if (!res.ok) throw new Error("Failed to remove habit")
      setHabits(prev => prev.filter(h => h.habitId !== habitId))
      toast.success("Habit removed", habit?.habitName)
    } catch (err) {
      console.error(err)
      toast.error("Failed to remove", err.message)
    } finally {
      setRemoving(null)
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const slotsUsed = habits.length
  const slotsLeft = MAX_HABITS - slotsUsed
  const isFull    = slotsLeft === 0
  const pct       = (slotsUsed / MAX_HABITS) * 100

  const unitCounts = {
    boolean: habits.filter(h => h.unit === "boolean").length,
    minutes: habits.filter(h => h.unit === "minutes").length,
    pages:   habits.filter(h => h.unit === "pages").length,
  }

  const filtered = habits
    .filter(h => filter === "all" || h.unit === filter)
    .filter(h => !search || h.habitName.toLowerCase().includes(search.toLowerCase()))

  const barColor = pct === 100 ? "from-red-500 to-rose-400"
    : pct >= 70 ? "from-amber-500 to-orange-400"
    : "from-violet-600 to-purple-400"

  return (
    <div className="min-h-screen bg-[#08080f] text-white">
      <style>{`
        @keyframes slideInRight {
          from { opacity:0; transform:translateX(100%) scale(0.95); }
          to   { opacity:1; transform:translateX(0) scale(1); }
        }
      `}</style>

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => <Toast key={t.id} toast={t} onRemove={removeToast} />)}
      </div>

      {/* Ambient */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-700/[0.08] blur-[120px] -z-0" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-700/[0.06] blur-[100px] -z-0" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 md:px-6 md:py-10 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={12} className="text-violet-400" />
              <span className="text-[10px] font-mono font-semibold tracking-[0.22em] uppercase text-white/25">Habit Manager</span>
            </div>
            <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight text-white leading-none">My Habits</h1>
            <p className="text-[13px] text-white/35 mt-1.5">
              {loading ? "Loading…" : habits.length === 0
                ? "No habits yet — add your first one below."
                : `${slotsUsed} of ${MAX_HABITS} slots used`}
            </p>
          </div>
          <button
            onClick={() => { setAddError(""); setShowModal(true) }}
            disabled={isFull}
            title={isFull ? "All 10 slots are full" : "Add a new habit"}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-[13px] font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.55)] hover:-translate-y-px transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
            {isFull ? <Lock size={14} /> : <Plus size={14} />}
            <span className="hidden sm:block">{isFull ? "Slots Full" : "New Habit"}</span>
          </button>
        </div>

        {/* ── Slot bar ── */}
        <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl px-4 py-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/25">Habit Slots</span>
              {isFull && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-red-500/15 border border-red-500/25 text-red-400">Full</span>
              )}
            </div>
            <span className={`text-[12px] font-bold font-mono ${isFull ? "text-red-400" : pct >= 70 ? "text-amber-400" : "text-white/40"}`}>
              {slotsUsed} / {MAX_HABITS}
            </span>
          </div>
          <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden mb-3">
            <div className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-700`}
              style={{ width: `${pct}%` }} />
          </div>
          <SlotDots used={slotsUsed} max={MAX_HABITS} />
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          {UNIT_OPTIONS.map(u => (
            <div key={u.value} className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filter === u.value ? `${u.bg} ${u.border}` : "bg-white/[0.025] border-white/[0.07] hover:border-white/[0.12]"
            }`} onClick={() => setFilter(f => f === u.value ? "all" : u.value)}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className={filter === u.value ? u.color : "text-white/25"}>{u.icon}</span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-white/25">{u.label}</span>
              </div>
              <p className={`text-[24px] font-extrabold leading-none ${filter === u.value ? u.text : "text-white/70"}`}>
                {unitCounts[u.value]}
              </p>
              <div className="h-1 bg-white/[0.05] rounded-full mt-2.5 overflow-hidden">
                <div className={`h-full ${u.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${(unitCounts[u.value] / MAX_HABITS) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        {!loading && habits.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[160px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              <input type="text" placeholder="Search habits…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-[12.5px] text-white placeholder-white/20 focus:outline-none focus:border-violet-500/40 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60">
                  <X size={12} />
                </button>
              )}
            </div>
            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
              {[{ key:"all",label:"All" }, ...UNIT_OPTIONS.map(u=>({key:u.value,label:u.label}))].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    filter === f.key ? "bg-violet-600/30 text-violet-300 border border-violet-500/40" : "text-white/30 hover:text-white/60"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
              {[{ key:"list", Icon:List }, { key:"grid", Icon:LayoutGrid }].map(({ key, Icon }) => (
                <button key={key} onClick={() => setView(key)}
                  className={`flex items-center justify-center w-8 h-7 rounded-lg transition-all ${
                    view === key ? "bg-white/[0.1] text-white/70" : "text-white/25 hover:text-white/50"
                  }`}>
                  <Icon size={13} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── States ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={28} className="animate-spin text-violet-500" />
            <p className="text-[13px] text-white/25">Loading habits…</p>
          </div>
        )}
        {!loading && fetchError && (
          <div className="flex items-center gap-3 bg-red-500/[0.08] border border-red-500/25 rounded-2xl px-4 py-3.5">
            <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-red-400">Failed to load habits</p>
              <p className="text-[11px] text-red-400/60 mt-0.5">{fetchError}</p>
            </div>
            <button onClick={loadHabits} className="text-[12px] font-semibold text-red-400/70 hover:text-red-400">Retry</button>
          </div>
        )}
        {!loading && !fetchError && habits.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/[0.08]">
              <Zap size={26} className="text-white/15" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-white/40">No habits yet</p>
              <p className="text-[13px] text-white/20 mt-1">Click "New Habit" to start building your routine.</p>
            </div>
            <button onClick={() => { setAddError(""); setShowModal(true) }}
              className="flex items-center gap-2 mt-1 px-5 py-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-[13px] font-semibold text-violet-300 hover:bg-violet-600/30 transition-all">
              <Plus size={14} /> Add your first habit
            </button>
          </div>
        )}

        {/* ── Habit list / grid ── */}
        {!loading && !fetchError && habits.length > 0 && (
          <>
            {filtered.length === 0 ? (
              <p className="text-center py-12 text-[13px] text-white/25">
                {search ? `No habits matching "${search}"` : "No habits of this type."}
              </p>
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filtered.map(habit => (
                  <HabitCard key={habit.id} habit={habit} onRemove={id => setConfirmHabit(habits.find(h => h.habitId === id))} removing={removing} view="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(habit => (
                  <HabitCard key={habit.id} habit={habit} onRemove={id => setConfirmHabit(habits.find(h => h.habitId === id))} removing={removing} view="list" />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Full notice ── */}
        {!loading && isFull && (
          <div className="flex items-center gap-3 bg-amber-500/[0.07] border border-amber-500/20 rounded-2xl px-4 py-3">
            <Flame size={14} className="text-amber-400/70 flex-shrink-0" />
            <p className="text-[12px] text-amber-400/60">All 10 slots are used. Remove a habit to add a new one.</p>
          </div>
        )}
      </div>

      {showModal && (
        <AddHabitModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
          adding={adding}
          error={addError}
          slotsLeft={slotsLeft}
        />
      )}

      <ConfirmModal
        habit={confirmHabit}
        onCancel={() => setConfirmHabit(null)}
        onConfirm={() => handleRemove(confirmHabit?.habitId)}
        removing={removing === confirmHabit?.habitId}
      />
    </div>
  )
}