"use client"

import { useState, useEffect } from "react"
import {
  Plus, Trash2, Clock, BookOpen, CheckSquare,
  Timer, FileText, X, Sparkles, Target, Flame,
  AlertCircle, Loader2, Lock
} from "lucide-react"

// ── Unit config ───────────────────────────────────────────────────────────────
const UNIT_OPTIONS = [
  { value: "boolean", label: "Checkbox", icon: <CheckSquare size={14} />, color: "text-violet-400" },
  { value: "minutes", label: "Minutes", icon: <Timer size={14} />, color: "text-sky-400" },
  { value: "pages", label: "Pages", icon: <BookOpen size={14} />, color: "text-emerald-400" },
]

const UNIT_COLORS = {
  boolean: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  minutes: "bg-sky-500/15 text-sky-300 border-sky-500/25",
  pages: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
}

const UNIT_BAR_COLORS = {
  boolean: "bg-violet-500",
  minutes: "bg-sky-500",
  pages: "bg-emerald-500",
}

const EMPTY_FORM = {
  habitName: "",
  unit: "boolean",
  targetValue: "",
  timeWindowStart: "",
  timeWindowEnd: "",
  notes: "",
}

const MAX_HABITS = 10

// ── Slot indicator ─────────────────────────────────────────────────────────────
function SlotDots({ used, max }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i < used ? "bg-violet-500" : "bg-white/[0.1]"
            }`}
        />
      ))}
    </div>
  )
}

// ── Habit row ─────────────────────────────────────────────────────────────────
function HabitRow({ habit, onRemove, removing, index }) {
  const unitCfg = UNIT_OPTIONS.find((u) => u.value === habit.unit) || UNIT_OPTIONS[0]

  return (
    <div
      className="group flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.05] transition-all duration-200"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Slot badge */}
      <span className="hidden sm:flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[11px] font-bold font-mono text-white/30">
        {habit.habitId}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-white/85 truncate">{habit.habitName}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${UNIT_COLORS[habit.unit]}`}>
            {unitCfg.icon}
            {unitCfg.label}
          </span>
          {habit.targetValue && habit.unit !== "boolean" && (
            <span className="text-[11px] font-mono text-white/30">
              Target: {habit.targetValue} {habit.unit}
            </span>
          )}
          {habit.timeWindowStart && habit.timeWindowEnd && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-white/30">
              <Clock size={10} />
              {habit.timeWindowStart} – {habit.timeWindowEnd}
            </span>
          )}
        </div>
      </div>

      {/* Notes preview */}
      {habit.notes && (
        <p className="hidden md:block text-[12px] text-white/25 italic truncate max-w-[160px]">
          "{habit.notes}"
        </p>
      )}

      {/* Delete */}
      <button
        onClick={() => onRemove(habit.habitId)}
        disabled={removing === habit.habitId}
        className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-transparent border border-transparent text-white/20 hover:text-red-400 hover:bg-red-500/[0.1] hover:border-red-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {removing === habit.habitId
          ? <Loader2 size={14} className="animate-spin text-red-400" />
          : <Trash2 size={14} />
        }
      </button>
    </div>
  )
}

// ── Add Habit Modal ───────────────────────────────────────────────────────────
function AddHabitModal({ onClose, onAdd, adding, error, slotsLeft }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#0f0f1e] border border-white/[0.1] rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Glow */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-60 h-60 rounded-full bg-violet-600/15 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-[0_0_16px_rgba(124,58,237,0.4)]">
              <Plus size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-extrabold text-white tracking-tight">New Habit</h2>
              <p className="text-[11px] text-white/30 mt-0.5">{slotsLeft} slot{slotsLeft !== 1 ? "s" : ""} remaining</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.1] transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => { e.preventDefault(); onAdd(form) }}
          className="px-6 py-5 space-y-4"
        >
          {/* Name */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">
              Habit Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text" required
              placeholder="e.g. Morning meditation"
              value={form.habitName}
              onChange={(e) => set("habitName", e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-2.5 text-[13.5px] text-white placeholder-white/20 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] transition-all"
            />
          </div>

          {/* Tracking type */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">
              Tracking Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {UNIT_OPTIONS.map((u) => (
                <button
                  type="button" key={u.value}
                  onClick={() => set("unit", u.value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-[12px] font-semibold transition-all duration-200 ${form.unit === u.value
                      ? "bg-violet-600/20 border-violet-500/50 text-violet-300 shadow-[0_0_0_1px_rgba(124,58,237,0.3)]"
                      : "bg-white/[0.03] border-white/[0.07] text-white/35 hover:bg-white/[0.07] hover:text-white/60"
                    }`}
                >
                  <span className={form.unit === u.value ? "text-violet-400" : "text-white/30"}>
                    {u.icon}
                  </span>
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target value — only for non-boolean */}
          {form.unit !== "boolean" && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">
                Target ({form.unit}) <span className="text-red-400">*</span>
              </label>
              <input
                type="number" min="1" required
                placeholder={form.unit === "minutes" ? "e.g. 30" : "e.g. 20"}
                value={form.targetValue}
                onChange={(e) => set("targetValue", e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-2.5 text-[13.5px] text-white placeholder-white/20 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] transition-all"
              />
            </div>
          )}

          {/* Time window */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">
              Time Window{" "}
              <span className="text-white/20 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["timeWindowStart", "timeWindowEnd"].map((field, fi) => (
                <div key={field} className="relative">
                  <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  <input
                    type="time"
                    placeholder={fi === 0 ? "Start" : "End"}
                    value={form[field]}
                    onChange={(e) => set(field, e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl pl-8 pr-3 py-2.5 text-[13px] text-white/70 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.07] transition-all [color-scheme:dark]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">
              Notes{" "}
              <span className="text-white/20 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <div className="relative">
              <FileText size={13} className="absolute left-3 top-3 text-white/25 pointer-events-none" />
              <textarea
                rows={2}
                placeholder="Why does this habit matter to you?"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
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
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] font-semibold text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={adding}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-[13px] font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.55)] hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {adding ? "Adding…" : "Add Habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HabitsPage() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [addError, setAddError] = useState("")
  const [filter, setFilter] = useState("all")

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const loadHabits = async () => {
    setLoading(true)
    setFetchError("")
    try {
      const res = await fetch("/api/habits/new")
      if (!res.ok) throw new Error("Failed to load habits")
      const data = await res.json()
      setHabits(data.habits ?? [])
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadHabits() }, [])

  // ── Add ────────────────────────────────────────────────────────────────────
  const handleAdd = async (form) => {
    if (!form.habitName.trim()) return
    setAdding(true)
    setAddError("")
    try {
      const res = await fetch("/api/habits/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          habitName: form.habitName.trim(),
          unit: form.unit,
          targetValue: form.targetValue ? parseFloat(form.targetValue) : null,
          timeWindowStart: form.timeWindowStart || null,
          timeWindowEnd: form.timeWindowEnd || null,
          notes: form.notes.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to add habit")
      setHabits((prev) => [...prev, data.habit])
      setShowModal(false)
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAdding(false)
    }
  }

  // ── Remove ─────────────────────────────────────────────────────────────────
  const handleRemove = async (id) => {
    setRemoving(id)
    try {
      const res = await fetch("/api/habits/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send 'id' explicitly to match your API
        body: JSON.stringify({ action: "remove", id }),
      })
      if (!res.ok) throw new Error("Failed to remove habit")

      // Update state using 'id'
      setHabits((prev) => prev.filter((h) => h.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setRemoving(null)
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const slotsUsed = habits.length
  const slotsLeft = MAX_HABITS - slotsUsed
  const isFull = slotsLeft === 0

  const filtered = habits.filter((h) => filter === "all" || h.unit === filter)

  const unitCounts = {
    boolean: habits.filter((h) => h.unit === "boolean").length,
    minutes: habits.filter((h) => h.unit === "minutes").length,
    pages: habits.filter((h) => h.unit === "pages").length,
  }

  return (
    <div className="min-h-screen bg-[#08080f] text-white">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-700/10 blur-[120px] -z-0" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-700/8 blur-[100px] -z-0" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 md:px-6 md:py-10 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={13} className="text-violet-400" />
              <span className="text-[10px] font-mono font-semibold tracking-[0.22em] uppercase text-white/25">
                Habit Manager
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">My Habits</h1>
            <p className="text-[13px] text-white/35 mt-1">
              {loading
                ? "Loading your habits…"
                : habits.length === 0
                  ? "No habits yet — add your first one."
                  : `${slotsUsed} of ${MAX_HABITS} slots used`}
            </p>
          </div>

          <button
            onClick={() => { setAddError(""); setShowModal(true) }}
            disabled={isFull}
            title={isFull ? "Maximum 7 habits reached" : "Add a new habit"}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-[13px] font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.55)] hover:-translate-y-px active:translate-y-0 transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_20px_rgba(124,58,237,0.4)]"
          >
            {isFull ? <Lock size={15} /> : <Plus size={15} />}
            <span className="hidden sm:block">{isFull ? "Slots Full" : "New Habit"}</span>
          </button>
        </div>

        {/* ── Slot bar ── */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-3.5 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/25">Habit Slots</span>
              <span className="text-[11px] font-bold font-mono text-white/40">
                {slotsUsed} / {MAX_HABITS}
              </span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-purple-400 rounded-full transition-all duration-500"
                style={{ width: `${(slotsUsed / MAX_HABITS) * 100}%` }}
              />
            </div>
          </div>
          <SlotDots used={slotsUsed} max={MAX_HABITS} />
        </div>

        {/* ── Stats cards ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Checkboxes", value: unitCounts.boolean, color: "text-violet-300", bar: "bg-violet-500", icon: <CheckSquare size={14} className="text-violet-400" /> },
            { label: "Timed", value: unitCounts.minutes, color: "text-sky-300", bar: "bg-sky-500", icon: <Timer size={14} className="text-sky-400" /> },
            { label: "Reading", value: unitCounts.pages, color: "text-emerald-300", bar: "bg-emerald-500", icon: <BookOpen size={14} className="text-emerald-400" /> },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-3.5">
              <div className="flex items-center gap-2 mb-2">
                {s.icon}
                <span className="text-[9px] font-mono uppercase tracking-wider text-white/25">{s.label}</span>
              </div>
              <p className={`text-[22px] font-extrabold leading-none ${s.color}`}>{s.value}</p>
              <div className="h-1 bg-white/[0.05] rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full ${s.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${(s.value / MAX_HABITS) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={28} className="animate-spin text-violet-500" />
            <p className="text-[13px] text-white/25">Loading habits…</p>
          </div>
        )}

        {/* ── Fetch error ── */}
        {!loading && fetchError && (
          <div className="flex items-center gap-3 bg-red-500/[0.08] border border-red-500/25 rounded-2xl px-4 py-3.5">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-red-400">Failed to load habits</p>
              <p className="text-[12px] text-red-400/60 mt-0.5">{fetchError}</p>
            </div>
            <button
              onClick={loadHabits}
              className="ml-auto text-[12px] font-semibold text-red-400/70 hover:text-red-400 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Filter tabs ── */}
        {!loading && habits.length > 0 && (
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-1 w-fit">
            {[
              { key: "all", label: "All" },
              { key: "boolean", label: "Checkbox" },
              { key: "minutes", label: "Minutes" },
              { key: "pages", label: "Pages" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all duration-200 ${filter === f.key
                    ? "bg-violet-600/30 text-violet-300 border border-violet-500/40"
                    : "text-white/30 hover:text-white/60"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Habit list / empty ── */}
        {!loading && !fetchError && (
          habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/[0.08]">
                <Target size={28} className="text-white/15" />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold text-white/40">No habits yet</p>
                <p className="text-[13px] text-white/20 mt-1">Click "New Habit" to start building your routine</p>
              </div>
              <button
                onClick={() => { setAddError(""); setShowModal(true) }}
                className="flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.09] text-[13px] font-semibold text-white/50 hover:text-white/80 hover:bg-white/[0.08] transition-all"
              >
                <Plus size={14} /> Add your first habit
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <p className="text-center py-10 text-[13px] text-white/25">No habits of this type.</p>
              ) : (
                filtered.map((habit, i) => (
                  <HabitRow
                    index={i}
                    key={habit._id}
                    habit={habit}
                    onRemove={() => handleRemove(habit.id)}
                    removing={removing}
                  />
                ))
              )}
            </div>
          )
        )}

        {/* ── Full slots notice ── */}
        {!loading && isFull && habits.length > 0 && (
          <div className="flex items-center gap-3 bg-amber-500/[0.07] border border-amber-500/20 rounded-2xl px-4 py-3">
            <Flame size={15} className="text-amber-400/70 flex-shrink-0" />
            <p className="text-[12px] text-amber-400/60">
              All 7 habit slots are used. Remove a habit to add a new one.
            </p>
          </div>
        )}

      </div>

      {/* ── Modal ── */}
      {showModal && (
        <AddHabitModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
          adding={adding}
          error={addError}
          slotsLeft={slotsLeft}
        />
      )}
    </div>
  )
}