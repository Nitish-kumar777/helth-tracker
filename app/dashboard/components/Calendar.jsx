"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronLeft, ChevronRight, Sparkles, TrendingUp,
  CalendarDays, Target, X, CheckCircle2, XCircle,
  Clock, BookOpen, Timer, CheckSquare, Loader2
} from "lucide-react";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAY_SHORT   = ["S","M","T","W","T","F","S"];

function accuracyMeta(acc) {
  if (acc === undefined || acc === null)
    return { bg: "bg-white/[0.06]", ring: "ring-white/10", text: "text-white/20", bar: "bg-white/20", label: "No data" };
  if (acc >= 90)
    return { bg: "bg-emerald-500",  ring: "ring-emerald-400/40", text: "text-emerald-300", bar: "bg-emerald-500", label: "Excellent" };
  if (acc >= 70)
    return { bg: "bg-violet-500",   ring: "ring-violet-400/40",  text: "text-violet-300",  bar: "bg-violet-500",  label: "Good" };
  if (acc >= 50)
    return { bg: "bg-amber-500",    ring: "ring-amber-400/40",   text: "text-amber-300",   bar: "bg-amber-500",   label: "Fair" };
  return         { bg: "bg-red-500",      ring: "ring-red-400/40",     text: "text-red-300",     bar: "bg-red-500",     label: "Poor" };
}

const UNIT_ICONS = {
  boolean: <CheckSquare size={12} />,
  minutes: <Timer       size={12} />,
  pages:   <BookOpen    size={12} />,
};

// ── Day detail panel ──────────────────────────────────────────────────────────
function DayPanel({ day, year, month, log, loading, onClose }) {
  const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  const meta    = accuracyMeta(log?.dailyAccuracy);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Panel — bottom sheet on mobile, right sidebar on lg */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-50
        lg:static lg:z-auto
        bg-[#0f0f1e] border border-white/[0.1]
        rounded-t-3xl lg:rounded-2xl
        shadow-[0_-16px_48px_rgba(0,0,0,0.6)] lg:shadow-none
        flex flex-col
        max-h-[85vh] lg:max-h-none lg:h-fit
        overflow-hidden
        transition-all duration-300
      `}>

        {/* Handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div>
            <p className="text-[11px] font-mono text-white/25 uppercase tracking-widest">
              {MONTH_NAMES[month]} {day}, {year}
            </p>
            <h3 className="text-[15px] font-extrabold text-white mt-0.5">Daily Summary</h3>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.1] transition-all"
          >
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 size={22} className="animate-spin text-violet-500" />
              <p className="text-[12px] text-white/25">Loading log…</p>
            </div>
          ) : !log ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <CalendarDays size={28} className="text-white/15" />
              <p className="text-[13px] font-semibold text-white/30">No log for this day</p>
              <p className="text-[12px] text-white/20 text-center">Habit data isn't available for {dateStr}.</p>
            </div>
          ) : (
            <>
              {/* Accuracy ring */}
              <div className="flex items-center gap-4 bg-white/[0.04] border border-white/[0.07] rounded-2xl px-4 py-4">
                <div className="relative flex-shrink-0">
                  <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
                    <circle cx="32" cy="32" r="26" strokeWidth="6" className="stroke-white/[0.08]" fill="none" />
                    <circle
                      cx="32" cy="32" r="26" strokeWidth="6" fill="none"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - (log.dailyAccuracy ?? 0) / 100)}`}
                      strokeLinecap="round"
                      className={`${meta.bar} transition-all duration-700`}
                      style={{ stroke: "currentColor" }}
                    />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-[13px] font-extrabold ${meta.text}`}>
                    {Math.round(log.dailyAccuracy ?? 0)}%
                  </span>
                </div>
                <div>
                  <p className={`text-[18px] font-extrabold ${meta.text}`}>{meta.label}</p>
                  <p className="text-[12px] text-white/30 mt-1">
                    {log.totalCompleted ?? 0} of {log.habits?.length ?? 0} habits completed
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {Array.from({ length: log.habits?.length ?? 0 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full ${log.habits[i]?.completed ? meta.bg : "bg-white/[0.1]"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Habit entries */}
              {log.habits?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/20">Habits</p>
                  {log.habits.map((h) => (
                    <div
                      key={h.habitId}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all ${
                        h.completed
                          ? "bg-emerald-500/[0.07] border-emerald-500/20"
                          : "bg-white/[0.03] border-white/[0.07]"
                      }`}
                    >
                      {h.completed
                        ? <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                        : <XCircle      size={16} className="text-white/20 flex-shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold truncate ${h.completed ? "text-white/85" : "text-white/35"}`}>
                          {h.habitName}
                        </p>
                        {h.value && h.unit !== "boolean" && (
                          <p className="text-[11px] font-mono text-white/25 mt-0.5 flex items-center gap-1">
                            {UNIT_ICONS[h.unit]}
                            {h.value}{h.unit === "minutes" ? " min" : " pages"}
                            {h.targetValue ? ` / ${h.targetValue}` : ""}
                          </p>
                        )}
                        {h.timeWindowStart && h.timeWindowEnd && (
                          <p className="text-[10px] font-mono text-white/20 flex items-center gap-1 mt-0.5">
                            <Clock size={10} /> {h.timeWindowStart}–{h.timeWindowEnd}
                          </p>
                        )}
                      </div>
                      <span className={`flex-shrink-0 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                        h.completed
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
                          : "bg-white/[0.04] text-white/20 border-white/[0.08]"
                      }`}>
                        {h.habitId}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              {log.habits?.some((h) => h.notes) && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/20">Notes</p>
                  {log.habits.filter((h) => h.notes).map((h) => (
                    <div key={h.habitId} className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-3.5 py-3">
                      <p className="text-[11px] font-semibold text-white/30 mb-1">{h.habitName}</p>
                      <p className="text-[12px] text-white/50 italic">"{h.notes}"</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Calendar ─────────────────────────────────────────────────────────────
export default function Calendar() {
  const [currentDate, setCurrentDate]         = useState(new Date());
  const [monthlyAccuracy, setMonthlyAccuracy] = useState([]);
  const [dailyLogs, setDailyLogs]             = useState({});
  const [loading, setLoading]                 = useState(true);
  const [selected, setSelected]               = useState(null);
  const [dayLog, setDayLog]                   = useState(null);
  const [dayLogLoading, setDayLogLoading]     = useState(false);

  const today = new Date();
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth     = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const rem = cells.length % 7;
  if (rem) cells.push(...Array(7 - rem).fill(null));

  // ── Fetch monthly stats ────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res  = await fetch("/api/stats");
        const data = await res.json();
        if (mounted && res.ok) {
          setMonthlyAccuracy(data.stats?.monthlyAccuracy ?? []);
          setDailyLogs(data.stats?.dailyLogs ?? {});
        }
      } catch (e) { console.error(e); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  // ── Fetch day log on selection ─────────────────────────────────────────────
  useEffect(() => {
    if (!selected) { setDayLog(null); return; }
    let mounted = true;
    (async () => {
      setDayLogLoading(true);
      const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(selected).padStart(2,"0")}`;
      try {
        const res  = await fetch(`/api/habits/log?date=${dateStr}`);
        const data = await res.json();
        if (mounted) setDayLog(res.ok ? (data.log ?? null) : null);
      } catch (e) { if (mounted) setDayLog(null); }
      finally { if (mounted) setDayLogLoading(false); }
    })();
    return () => { mounted = false; };
  }, [selected, year, month]);

  const getDayAcc = (day) => {
    if (!day) return undefined;
    const k = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return dailyLogs[k];
  };

  const isToday  = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isFuture = (d) => new Date(year, month, d) > today;

  const recentMonths = [...monthlyAccuracy]
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
    .slice(-5);

  const avgAcc = monthlyAccuracy.length
    ? Math.round(monthlyAccuracy.reduce((s, m) => s + m.accuracy, 0) / monthlyAccuracy.length)
    : 0;

  const currentMonthData = monthlyAccuracy.find(
    (m) => m.year === year && m.month === month + 1
  );

  return (
    <div className="min-h-screen bg-[#08080f] text-white">
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-700/10 blur-[120px] -z-0" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-700/8 blur-[100px] -z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:px-6 md:py-10">

        {/* ── Title ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={13} className="text-violet-400" />
            <span className="text-[10px] font-mono font-semibold tracking-[0.22em] uppercase text-white/25">Habit Calendar</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Calendar</h1>
          <p className="text-[13px] text-white/35 mt-1">Tap any day to see your accuracy breakdown.</p>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "This Month", value: currentMonthData ? `${Math.round(currentMonthData.accuracy)}%` : "—", icon: <CalendarDays size={14} className="text-violet-400" />, color: "text-violet-300" },
            { label: "All-time Avg", value: monthlyAccuracy.length ? `${avgAcc}%` : "—", icon: <TrendingUp size={14} className="text-emerald-400" />, color: "text-emerald-300" },
            { label: "Months", value: monthlyAccuracy.length || "—", icon: <Target size={14} className="text-amber-400" />, color: "text-amber-300" },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl px-3 py-3 sm:px-4 sm:py-3.5 flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/[0.05] flex-shrink-0">{s.icon}</div>
              <div className="min-w-0">
                <p className={`text-[16px] sm:text-[18px] font-extrabold leading-none ${s.color}`}>{s.value}</p>
                <p className="text-[9px] sm:text-[10px] font-mono text-white/25 mt-0.5 uppercase tracking-wider truncate">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main area: calendar + panel side by side on lg ── */}
        <div className="flex flex-col lg:flex-row gap-4">

          {/* Calendar */}
          <div className="flex-1 bg-white/[0.03] border border-white/[0.07] rounded-3xl overflow-hidden">

            {/* Nav */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-white/[0.07]">
              <h2 className="text-[15px] sm:text-[17px] font-extrabold tracking-tight">
                {MONTH_NAMES[month]} <span className="text-white/30 font-medium">{year}</span>
              </h2>
              <div className="flex gap-1.5">
                <button onClick={() => { setCurrentDate(new Date(year, month - 1, 1)); setSelected(null); }}
                  className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.09] transition-all">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => { setCurrentDate(new Date()); setSelected(null); }}
                  className="px-2.5 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[10px] sm:text-[11px] font-semibold text-white/40 hover:text-white/70 hover:bg-white/[0.09] transition-all">
                  Today
                </button>
                <button onClick={() => { setCurrentDate(new Date(year, month + 1, 1)); setSelected(null); }}
                  className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.09] transition-all">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="px-3 sm:px-4 py-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_NAMES.map((d, i) => (
                  <div key={d} className="text-center py-1">
                    <span className="hidden sm:block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-white/20">{d}</span>
                    <span className="sm:hidden text-[10px] font-semibold uppercase text-white/20">{DAY_SHORT[i]}</span>
                  </div>
                ))}
              </div>

              {/* Cells */}
              {loading ? (
                <div className="flex items-center justify-center h-44">
                  <Loader2 size={22} className="animate-spin text-violet-500" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                  {cells.map((day, idx) => {
                    if (!day) return <div key={idx} className="aspect-square" />;
                    const acc    = getDayAcc(day);
                    const meta   = accuracyMeta(acc);
                    const tod    = isToday(day);
                    const fut    = isFuture(day);
                    const sel    = selected === day;

                    return (
                      <button
                        key={idx}
                        onClick={() => !fut && setSelected(sel ? null : day)}
                        disabled={fut}
                        title={acc !== undefined ? `${Math.round(acc)}% accuracy` : undefined}
                        className={`
                          relative aspect-square flex flex-col items-center justify-center rounded-lg sm:rounded-xl
                          text-[11px] sm:text-[13px] font-semibold transition-all duration-200
                          ${fut ? "opacity-20 cursor-default" : "cursor-pointer"}
                          ${tod
                            ? "bg-gradient-to-br from-violet-600 to-purple-500 text-white shadow-[0_0_14px_rgba(124,58,237,0.4)] ring-2 ring-violet-400/30"
                            : sel
                              ? `${acc !== undefined ? `${meta.bg}/25` : "bg-white/[0.08]"} ring-2 ${meta.ring || "ring-white/20"}`
                              : acc !== undefined
                                ? `${meta.bg}/[0.12] hover:${meta.bg}/[0.22] border border-${meta.bg}/20`
                                : "hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08]"
                          }
                        `}
                      >
                        <span className={tod ? "text-white" : acc !== undefined ? meta.text : "text-white/40"}>
                          {day}
                        </span>
                        {acc !== undefined && !tod && (
                          <span className={`absolute bottom-0.5 sm:bottom-1 w-1 h-1 rounded-full ${meta.bg}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-3 sm:gap-4 mt-4 pt-3 border-t border-white/[0.06] flex-wrap">
                {[
                  { color: "bg-emerald-500", label: "≥90%" },
                  { color: "bg-violet-500",  label: "70–89%" },
                  { color: "bg-amber-500",   label: "50–69%" },
                  { color: "bg-red-500",     label: "<50%" },
                  { color: "bg-white/20",    label: "None" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${l.color}`} />
                    <span className="text-[10px] sm:text-[11px] text-white/30 font-mono">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop side panel */}
          {selected && (
            <div className="hidden lg:block w-80 flex-shrink-0">
              <DayPanel
                day={selected} year={year} month={month}
                log={dayLog} loading={dayLogLoading}
                onClose={() => setSelected(null)}
              />
            </div>
          )}
        </div>

        {/* ── Bar chart ── */}
        {recentMonths.length > 0 && (
          <div className="mt-6 bg-white/[0.03] border border-white/[0.07] rounded-3xl px-4 sm:px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-4">
              Last {recentMonths.length} Months
            </p>
            <div className="flex items-end gap-2 h-20 sm:h-24">
              {recentMonths.map((m) => {
                const pct  = Math.round(m.accuracy);
                const meta = accuracyMeta(pct);
                const cur  = m.year === year && m.month === month + 1;
                return (
                  <div key={`${m.year}-${m.month}`} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <span className={`text-[10px] font-mono ${meta.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      {pct}%
                    </span>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${meta.bg} ${cur ? "opacity-100" : "opacity-50"}`}
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                    <span className={`text-[10px] font-mono ${cur ? "text-violet-300" : "text-white/25"}`}>
                      {MONTH_NAMES[m.month - 1].slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {selected && (
        <div className="lg:hidden">
          <DayPanel
            day={selected} year={year} month={month}
            log={dayLog} loading={dayLogLoading}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  );
}