// import { NextResponse } from "next/server"
// import { getServerSession } from "next-auth"
// import { authOptions } from "../auth/[...nextauth]/route"
// import { prisma } from "../../../lib/prisma"

// function toUTCDateStr(date) {
//   // Always produce "YYYY-MM-DD" from a Date object using UTC fields
//   const y = date.getUTCFullYear()
//   const m = String(date.getUTCMonth() + 1).padStart(2, "0")
//   const d = String(date.getUTCDate()).padStart(2, "0")
//   return `${y}-${m}-${d}`
// }
 
// function todayUTC()     { return toUTCDateStr(new Date()) }
// function yesterdayUTC() {
//   const d = new Date()
//   d.setUTCDate(d.getUTCDate() - 1)
//   return toUTCDateStr(d)
// }
 
// function diffDays(aStr, bStr) {
//   // Positive = bStr is bStr days after aStr
//   return (new Date(bStr + "T00:00:00Z") - new Date(aStr + "T00:00:00Z")) / 86_400_000
// }
 
// function getISOWeek(dateStr) {
//   const d = new Date(dateStr + "T00:00:00Z")
//   d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
//   const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
//   return {
//     week:  Math.ceil((((d - yearStart) / 86_400_000) + 1) / 7),
//     year:  d.getUTCFullYear(),
//   }
// }
 
// // ─────────────────────────────────────────────────────────────────────────────
// // Core calculation — derives every stat field from raw HabitLog rows
// // ─────────────────────────────────────────────────────────────────────────────
// function computeStats(logs) {
//   // logs must be sorted oldest → newest and each must have .date, .dailyAccuracy,
//   // .totalCompleted, .habits (array)
 
//   // ── Per-day accuracy values (only logs that have habits) ─────────────────
//   const activeLogs = logs.filter(l => Array.isArray(l.habits) && l.habits.length > 0)
 
//   // ── totals ────────────────────────────────────────────────────────────────
//   let totalPerfectDays   = 0
//   let totalCompletedDays = 0
 
//   for (const l of activeLogs) {
//     const acc = l.dailyAccuracy ?? 0
//     const done = l.totalCompleted ?? 0
//     if (acc === 100) totalPerfectDays++
//     if (done > 0)   totalCompletedDays++
//   }
 
//   // ── Overall accuracy (mean of all active log accuracies) ─────────────────
//   const overallAccuracy = activeLogs.length
//     ? activeLogs.reduce((s, l) => s + (l.dailyAccuracy ?? 0), 0) / activeLogs.length
//     : 0
 
//   // ── Streak — counts consecutive days where totalCompleted > 0 ────────────
//   // We walk the active logs in order and detect gaps between consecutive dates.
//   // A gap of more than 1 calendar day resets the running streak.
//   const dailyStreakHistory = []
//   let runningStreak = 0
//   let longestStreak = 0
//   let prevDateStr   = null
 
//   for (const l of activeLogs) {
//     const dateStr = toUTCDateStr(l.date)
//     const done    = (l.totalCompleted ?? 0) > 0
 
//     if (!done) {
//       // User had a log for this day but completed nothing → break streak
//       runningStreak = 0
//       prevDateStr   = null
//     } else {
//       if (prevDateStr === null) {
//         // First active day or restart after a break
//         runningStreak = 1
//       } else {
//         const gap = diffDays(prevDateStr, dateStr)
//         if (gap === 1) {
//           // Consecutive calendar day → extend streak
//           runningStreak += 1
//         } else if (gap === 0) {
//           // Same day (duplicate log — shouldn't happen, but be safe)
//           // keep streak as-is
//         } else {
//           // Gap > 1 → streak broken
//           runningStreak = 1
//         }
//       }
//       prevDateStr = dateStr
//     }
 
//     longestStreak = Math.max(longestStreak, runningStreak)
//     dailyStreakHistory.push({ date: dateStr, streakCount: runningStreak })
//   }
 
//   // ── Current streak ────────────────────────────────────────────────────────
//   // The streak is "live" only if the last active log is today or yesterday.
//   // If the last log was 2+ days ago the user broke their streak.
//   let currentStreak = 0
//   if (activeLogs.length > 0) {
//     const lastDateStr = toUTCDateStr(activeLogs[activeLogs.length - 1].date)
//     const today       = todayUTC()
//     const yesterday   = yesterdayUTC()
 
//     if (lastDateStr === today || lastDateStr === yesterday) {
//       currentStreak = runningStreak
//     }
//     // else: streak was broken more than a day ago → 0
//   }
 
//   // ── Weekly accuracy ───────────────────────────────────────────────────────
//   const weekMap = new Map()
//   for (const l of activeLogs) {
//     const dateStr = toUTCDateStr(l.date)
//     const { week, year } = getISOWeek(dateStr)
//     const key = `${year}-W${String(week).padStart(2, "0")}`
//     if (!weekMap.has(key)) weekMap.set(key, { week: key, vals: [] })
//     weekMap.get(key).vals.push(l.dailyAccuracy ?? 0)
//   }
//   const weeklyAccuracy = Array.from(weekMap.values())
//     .map(({ week, vals }) => ({
//       week,
//       accuracy: vals.reduce((s, v) => s + v, 0) / vals.length,
//     }))
//     // sorted oldest → newest
//     .sort((a, b) => a.week.localeCompare(b.week))
 
//   // ── Monthly accuracy ──────────────────────────────────────────────────────
//   const monthMap = new Map()
//   for (const l of activeLogs) {
//     const d     = l.date                        // already a Date from Prisma
//     const year  = d.getUTCFullYear()
//     const month = d.getUTCMonth() + 1           // 1-12
//     const key   = `${year}-${String(month).padStart(2, "0")}`
//     if (!monthMap.has(key)) monthMap.set(key, { year, month, vals: [] })
//     monthMap.get(key).vals.push(l.dailyAccuracy ?? 0)
//   }
//   const monthlyAccuracy = Array.from(monthMap.values())
//     .map(({ year, month, vals }) => ({
//       year,
//       month,
//       accuracy: vals.reduce((s, v) => s + v, 0) / vals.length,
//     }))
//     .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
 
//   // ── Last active date ──────────────────────────────────────────────────────
//   const lastActiveDate = activeLogs.length
//     ? activeLogs[activeLogs.length - 1].date
//     : null
 
//   return {
//     currentStreak,
//     longestStreak,
//     totalPerfectDays,
//     totalCompletedDays,
//     overallAccuracy,
//     weeklyAccuracy,
//     monthlyAccuracy,
//     dailyStreakHistory,
//     lastActiveDate,
//   }
// }
 
// // ─────────────────────────────────────────────────────────────────────────────
// // GET /api/stats
// // Always recomputes live from HabitLog so the response is never stale.
// // Also persists the freshly computed values back to UserStats.
// // ─────────────────────────────────────────────────────────────────────────────
// export async function GET(request) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user?.id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
//     }
 
//     const userId = session.user.id
 
//     // Load all habit logs oldest → newest
//     const logs = await prisma.habitLog.findMany({
//       where:   { userId },
//       orderBy: { date: "asc" },
//     })
 
//     // Compute all fields from scratch
//     const computed = computeStats(logs)
 
//     // Upsert into UserStats so the DB stays in sync
//     const stats = await prisma.userStats.upsert({
//       where:  { userId },
//       create: { userId, ...computed },
//       update: { ...computed },
//       include: {
//         monthlyReports: {
//           orderBy: [{ year: "desc" }, { month: "desc" }],
//           take: 12,
//         },
//       },
//     })
 
//     return NextResponse.json({ stats }, { status: 200 })
//   } catch (err) {
//     console.error("[GET /api/stats]", err)
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 })
//   }
// }
 
// // ─────────────────────────────────────────────────────────────────────────────
// // POST /api/stats
// // Explicit recalculate + persist trigger (call after logging habits,
// // from a cron, or after bulk imports). Returns the updated stats.
// // ─────────────────────────────────────────────────────────────────────────────
// export async function POST(request) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user?.id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
//     }
 
//     const userId = session.user.id
 
//     const logs = await prisma.habitLog.findMany({
//       where:   { userId },
//       orderBy: { date: "asc" },
//     })
 
//     if (logs.length === 0) {
//       // No logs yet — return zeroed record
//       const stats = await prisma.userStats.upsert({
//         where:  { userId },
//         create: {
//           userId,
//           currentStreak:      0,
//           longestStreak:      0,
//           totalPerfectDays:   0,
//           totalCompletedDays: 0,
//           overallAccuracy:    0,
//           weeklyAccuracy:     [],
//           monthlyAccuracy:    [],
//           dailyStreakHistory:  [],
//         },
//         update: {
//           currentStreak:      0,
//           longestStreak:      0,
//           totalPerfectDays:   0,
//           totalCompletedDays: 0,
//           overallAccuracy:    0,
//           weeklyAccuracy:     [],
//           monthlyAccuracy:    [],
//           dailyStreakHistory:  [],
//         },
//         include: { monthlyReports: { orderBy: [{ year:"desc" },{ month:"desc" }], take: 12 } },
//       })
//       return NextResponse.json({ stats, message: "No logs yet" }, { status: 200 })
//     }
 
//     const computed = computeStats(logs)
 
//     const stats = await prisma.userStats.upsert({
//       where:  { userId },
//       create: { userId, ...computed },
//       update: { ...computed },
//       include: {
//         monthlyReports: {
//           orderBy: [{ year: "desc" }, { month: "desc" }],
//           take: 12,
//         },
//       },
//     })
 
//     return NextResponse.json({ stats }, { status: 200 })
//   } catch (err) {
//     console.error("[POST /api/stats]", err)
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 })
//   }
// }


import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "../../../lib/prisma"

function toUTCDateStr(date) {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function todayUTC() { return toUTCDateStr(new Date()) }
function yesterdayUTC() {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return toUTCDateStr(d)
}

function diffDays(aStr, bStr) {
  return (new Date(bStr + "T00:00:00Z") - new Date(aStr + "T00:00:00Z")) / 86_400_000
}

function getISOWeek(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return {
    week: Math.ceil((((d - yearStart) / 86_400_000) + 1) / 7),
    year: d.getUTCFullYear(),
  }
}

function computeStats(logs) {
  // ── Only logs that have habits and at least 1 completion ─────────────────
  // BUG FIX: Previously included zero-completion days in accuracy averages.
  // Now activeLogs = days where the user actually did something.
  const activeLogs = logs.filter(
    l => Array.isArray(l.habits) && l.habits.length > 0 && (l.totalCompleted ?? 0) > 0
  )

  // ── Totals ────────────────────────────────────────────────────────────────
  let totalPerfectDays = 0
  let totalCompletedDays = 0

  for (const l of activeLogs) {
    if ((l.dailyAccuracy ?? 0) === 100) totalPerfectDays++
    totalCompletedDays++
  }

  // ── Overall accuracy ──────────────────────────────────────────────────────
  const overallAccuracy = activeLogs.length
    ? activeLogs.reduce((s, l) => s + (l.dailyAccuracy ?? 0), 0) / activeLogs.length
    : 0

  // ── Streak calculation ────────────────────────────────────────────────────
  // We iterate ALL logs (including zero-completion days) because a zero day
  // breaks the streak — but we only push to dailyStreakHistory for real dates.
  const allLogsWithDates = logs.filter(l => Array.isArray(l.habits) && l.habits.length > 0)

  const dailyStreakHistory = []
  let runningStreak = 0
  let longestStreak = 0
  let prevDateStr = null

  for (const l of allLogsWithDates) {
    const dateStr = toUTCDateStr(l.date)
    const done = (l.totalCompleted ?? 0) > 0

    if (!done) {
      runningStreak = 0
      prevDateStr = null
    } else {
      if (prevDateStr === null) {
        runningStreak = 1
      } else {
        const gap = diffDays(prevDateStr, dateStr)
        if (gap === 1) {
          runningStreak += 1
        } else if (gap === 0) {
          // duplicate — keep as-is
        } else {
          runningStreak = 1
        }
      }
      prevDateStr = dateStr
    }

    longestStreak = Math.max(longestStreak, runningStreak)
    dailyStreakHistory.push({ date: dateStr, streakCount: runningStreak })
  }

  // ── Current streak ────────────────────────────────────────────────────────
  // BUG FIX: Old code used the last log's runningStreak. If today's log
  // has 0 completions it resets runningStreak to 0 — even if yesterday
  // had a valid streak. Now we walk backwards to find the most recent
  // non-zero entry, then verify it falls within today or yesterday.
  let currentStreak = 0
  const today = todayUTC()
  const yesterday = yesterdayUTC()

  for (let i = dailyStreakHistory.length - 1; i >= 0; i--) {
    const entry = dailyStreakHistory[i]
    if (entry.streakCount > 0) {
      // Found most recent active day — is it still within the valid window?
      if (entry.date === today || entry.date === yesterday) {
        currentStreak = entry.streakCount
      }
      break // stop either way — older entries don't matter
    }
  }

  // ── Weekly accuracy ───────────────────────────────────────────────────────
  // BUG FIX: Now uses activeLogs only, so zero-completion days don't
  // drag down weekly averages.
  const weekMap = new Map()
  for (const l of activeLogs) {
    const dateStr = toUTCDateStr(l.date)
    const { week, year } = getISOWeek(dateStr)
    const key = `${year}-W${String(week).padStart(2, "0")}`
    if (!weekMap.has(key)) weekMap.set(key, { week: key, vals: [] })
    weekMap.get(key).vals.push(l.dailyAccuracy ?? 0)
  }
  const weeklyAccuracy = Array.from(weekMap.values())
    .map(({ week, vals }) => ({
      week,
      accuracy: vals.reduce((s, v) => s + v, 0) / vals.length,
    }))
    .sort((a, b) => a.week.localeCompare(b.week))

  // ── Monthly accuracy ──────────────────────────────────────────────────────
  // BUG FIX: Same — activeLogs only.
  const monthMap = new Map()
  for (const l of activeLogs) {
    const d = l.date
    const year = d.getUTCFullYear()
    const month = d.getUTCMonth() + 1
    const key = `${year}-${String(month).padStart(2, "0")}`
    if (!monthMap.has(key)) monthMap.set(key, { year, month, vals: [] })
    monthMap.get(key).vals.push(l.dailyAccuracy ?? 0)
  }
  const monthlyAccuracy = Array.from(monthMap.values())
    .map(({ year, month, vals }) => ({
      year,
      month,
      accuracy: vals.reduce((s, v) => s + v, 0) / vals.length,
    }))
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)

  const lastActiveDate = activeLogs.length
    ? activeLogs[activeLogs.length - 1].date
    : null

  return {
    currentStreak,
    longestStreak,
    totalPerfectDays,
    totalCompletedDays,
    overallAccuracy,
    weeklyAccuracy,
    monthlyAccuracy,
    dailyStreakHistory,
    lastActiveDate,
  }
}

// Shared upsert helper
async function recalculateAndPersist(userId) {
  const logs = await prisma.habitLog.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  })

  if (logs.length === 0) {
    return prisma.userStats.upsert({
      where: { userId },
      create: {
        userId, currentStreak: 0, longestStreak: 0,
        totalPerfectDays: 0, totalCompletedDays: 0,
        overallAccuracy: 0, weeklyAccuracy: [],
        monthlyAccuracy: [], dailyStreakHistory: [],
      },
      update: {
        currentStreak: 0, longestStreak: 0,
        totalPerfectDays: 0, totalCompletedDays: 0,
        overallAccuracy: 0, weeklyAccuracy: [],
        monthlyAccuracy: [], dailyStreakHistory: [],
      },
      include: {
        monthlyReports: {
          orderBy: [{ year: "desc" }, { month: "desc" }],
          take: 12,
        },
      },
    })
  }

  const computed = computeStats(logs)
  return prisma.userStats.upsert({
    where: { userId },
    create: { userId, ...computed },
    update: { ...computed },
    include: {
      monthlyReports: {
        orderBy: [{ year: "desc" }, { month: "desc" }],
        take: 12,
      },
    },
  })
}

// GET /api/stats — called on page load, also refreshes on every request
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const stats = await recalculateAndPersist(session.user.id)
    return NextResponse.json({ stats }, { status: 200 })
  } catch (err) {
    console.error("[GET /api/stats]", err)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST /api/stats — explicit trigger (after logging habits, on login, cron)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const stats = await recalculateAndPersist(session.user.id)
    return NextResponse.json({ stats }, { status: 200 })
  } catch (err) {
    console.error("[POST /api/stats]", err)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}