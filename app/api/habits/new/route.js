import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "../../../../lib/prisma"

// ── Helpers ───────────────────────────────────────────────────────────────────

const MAX_HABITS = 10
const HABIT_ID_PREFIX = "H"

/** Generate the next available habitId (H1–H10) for a user */
async function nextHabitId(userId) {
  const existing = await prisma.habit.findMany({
    where: { userId, isActive: true },
    select: { habitId: true },
  })
  const usedNums = new Set(
    existing.map((h) => parseInt(h.habitId.replace(HABIT_ID_PREFIX, ""), 10))
  )
  for (let i = 1; i <= MAX_HABITS; i++) {
    if (!usedNums.has(i)) return `${HABIT_ID_PREFIX}${i}`
  }
  return null // all slots full
}


export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const habits = await prisma.habit.findMany({
      where: { userId: session.user.id, isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    })

    return Response.json({ habits }, { status: 200 })
  } catch (err) {
    console.error("[GET /api/habits/new]", err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const { action } = body

    if (!action) {
      return Response.json({ message: "action is required" }, { status: 400 })
    }

    // ── ADD ───────────────────────────────────────────────────────────────────
    if (action === "add") {
      const { habitName, unit = "boolean", targetValue, timeWindowStart, timeWindowEnd, notes } = body

      if (!habitName?.trim()) {
        return Response.json({ message: "habitName is required" }, { status: 400 })
      }

      const validUnits = ["boolean", "minutes", "pages"]
      if (!validUnits.includes(unit)) {
        return Response.json(
          { message: `unit must be one of: ${validUnits.join(", ")}` },
          { status: 400 }
        )
      }

      if (unit !== "boolean" && (targetValue == null || isNaN(parseFloat(targetValue)))) {
        return Response.json(
          { message: "targetValue is required for minutes/pages habits" },
          { status: 400 }
        )
      }

      // Count active habits
      const activeCount = await prisma.habit.count({
        where: { userId, isActive: true },
      })
      if (activeCount >= MAX_HABITS) {
        return Response.json(
          { message: `Maximum of ${MAX_HABITS} habits allowed` },
          { status: 400 }
        )
      }

      // Assign next available slot
      const habitId = await nextHabitId(userId)
      if (!habitId) {
        return Response.json({ message: "No habit slots available" }, { status: 400 })
      }

      const habit = await prisma.habit.create({
        data: {
          userId,
          habitId,
          habitName: habitName.trim(),
          unit,
          targetValue: unit !== "boolean" ? parseFloat(targetValue) : null,
          timeWindowStart: timeWindowStart || null,
          timeWindowEnd: timeWindowEnd || null,
          notes: notes?.trim() || null,
          order: activeCount,     // append to end
          isActive: true,
        },
      })

      return Response.json({ habit }, { status: 201 })
    }

    // ── REMOVE ────────────────────────────────────────────────────────────────
   if (action === "remove") {
  const { id } = body; // Extract 'id' instead of 'habitId'

  if (!id) {
    return Response.json({ message: "id is required" }, { status: 400 });
  }

  // Verify ownership
  const habit = await prisma.habit.findFirst({
    where: { userId, id }, // Query using the 'id'
  });

  if (!habit) {
    return Response.json({ message: "Habit not found" }, { status: 404 });
  }

  // Hard delete
  await prisma.habit.delete({
    where: { id: habit.id },
  });

  return Response.json({ message: "Habit removed", id }, { status: 200 });
}
    return Response.json(
      { message: "Invalid action. Use: add | remove" },
      { status: 400 }
    )

  } catch (err) {
    console.error("[POST /api/habits/new]", err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}