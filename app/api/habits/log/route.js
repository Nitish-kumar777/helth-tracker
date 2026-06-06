import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "../../auth/[...nextauth]/route"

const prisma = new PrismaClient()

// ── Helpers ───────────────────────────────────────────────────────────────────
function toUTCMidnight(date = new Date()) {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

/** Recalculate dailyAccuracy + totalCompleted from an entries array */
function calcStats(habits) {
  const total     = habits.length
  const completed = habits.filter((h) => h.completed).length
  return {
    totalCompleted: completed,
    dailyAccuracy:  total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

// ── GET /api/habits/log?date=YYYY-MM-DD ──────────────────────────────────────
// Returns the HabitLog for a given day (defaults to today).
// If no log exists for that date, scaffolds one from the user's current habits.
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const dateParam  = searchParams.get("date") // "YYYY-MM-DD" or null
    const targetDate = toUTCMidnight(dateParam ? new Date(dateParam) : new Date())

    let log = await prisma.habitLog.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date:   targetDate,
        },
      },
    })

    // If no log exists yet, scaffold one from the user's current habits
    if (!log) {
      const userHabits = await prisma.habit.findMany({
        where:   { userId: session.user.id },
        orderBy: { createdAt: "asc" },
      })

      if (userHabits.length === 0) {
        return Response.json({ log: null, message: "No habits configured" }, { status: 200 })
      }

      log = await prisma.habitLog.create({
        data: {
          userId:         session.user.id,
          date:           targetDate,
          totalCompleted: 0,
          dailyAccuracy:  0,
          habits: userHabits.map((h) => ({
            habitId:         h.habitId,
            habitName:       h.habitName,
            completed:       false,
            value:           null,
            targetValue:     h.targetValue  ?? null,
            unit:            h.unit         ?? "boolean",
            completedAt:     null,
            notes:           null,
            timeWindowStart: h.timeWindowStart ?? null,
            timeWindowEnd:   h.timeWindowEnd   ?? null,
          })),
        },
      })
    }

    return Response.json({ log }, { status: 200 })
  } catch (err) {
    console.error("[GET /api/habits/log]", err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}

// ── POST /api/habits/log ──────────────────────────────────────────────────────
// Body: { action, habitId, date?, ...actionPayload }
//
// Actions:
//   "check"         – mark a habit complete
//   "uncheck"       – mark a habit incomplete
//   "update_value"  – set value (minutes/pages), auto-completes if target met
//   "add_note"      – attach a journal note to a habit entry
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body   = await req.json()
    const { action, habitId, date: dateParam } = body

    if (!action || !habitId) {
      return Response.json(
        { message: "action and habitId are required" },
        { status: 400 }
      )
    }

    const targetDate = toUTCMidnight(dateParam ? new Date(dateParam) : new Date())

    // Load the log (must exist — call GET first to scaffold it)
    const log = await prisma.habitLog.findUnique({
      where: { userId_date: { userId, date: targetDate } },
    })

    if (!log) {
      return Response.json(
        { message: "No log found for this date. Call GET first to create it." },
        { status: 404 }
      )
    }

    // Find the entry
    const entryIndex = log.habits.findIndex((h) => h.habitId === habitId)
    if (entryIndex === -1) {
      return Response.json(
        { message: `Habit ${habitId} not found in log` },
        { status: 404 }
      )
    }

    // Clone habits array (Prisma embedded type — update the full array)
    const updatedHabits = log.habits.map((h) => ({ ...h }))
    const entry         = updatedHabits[entryIndex]

    // ── Apply action ──────────────────────────────────────────────────────────
    switch (action) {

      case "check":
        entry.completed   = true
        entry.completedAt = new Date()
        if (entry.unit === "boolean") entry.value = 1
        break

      case "uncheck":
        entry.completed   = false
        entry.completedAt = null
        if (entry.unit === "boolean") entry.value = null
        break

      case "update_value": {
        const { value } = body
        if (value === undefined || value === null) {
          return Response.json(
            { message: "value is required for update_value" },
            { status: 400 }
          )
        }
        const numVal    = parseFloat(value)
        entry.value     = numVal
        // Auto-complete when value meets or exceeds target
        if (entry.targetValue != null && numVal >= entry.targetValue) {
          entry.completed   = true
          entry.completedAt = entry.completedAt ?? new Date()
        } else {
          entry.completed   = false
          entry.completedAt = null
        }
        break
      }

      case "add_note": {
        const { notes } = body
        if (!notes?.trim()) {
          return Response.json(
            { message: "notes is required for add_note" },
            { status: 400 }
          )
        }
        entry.notes = notes.trim()
        break
      }

      default:
        return Response.json(
          { message: "Invalid action. Use: check | uncheck | update_value | add_note" },
          { status: 400 }
        )
    }

    // Recalculate daily stats
    const { totalCompleted, dailyAccuracy } = calcStats(updatedHabits)

    // Persist
    const updatedLog = await prisma.habitLog.update({
      where: { userId_date: { userId, date: targetDate } },
      data: {
        habits:         updatedHabits,
        totalCompleted,
        dailyAccuracy,
        updatedAt:      new Date(),
      },
    })

    return Response.json({ log: updatedLog }, { status: 200 })

  } catch (err) {
    console.error("[POST /api/habits/log]", err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}