import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "../../../lib/prisma"


export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const badges = await prisma.badge.findMany({
      where:   { userId: session.user.id },
      orderBy: { unlockedAt: "desc" },
    })

    return Response.json({ badges }, { status: 200 })
  } catch (err) {
    console.error("[GET /api/badges]", err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}

// ── POST /api/badges ──────────────────────────────────────────────────────────
// Evaluates and awards any newly earned badges based on current UserStats.
// Safe to call repeatedly — uses upsert so badges are never duplicated.
// Call this after POST /api/stats to check for new unlocks.
//
// Returns: { awarded: Badge[], alreadyHad: number }
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const stats = await prisma.userStats.findUnique({ where: { userId } })
    if (!stats) {
      return Response.json({ message: "No stats found — call POST /api/stats first" }, { status: 404 })
    }

    const candidates = []

    // ── Accuracy badges ───────────────────────────────────────────────────────
    const acc = stats.overallAccuracy
    const ACCURACY_THRESHOLDS = [
      { level: "BRONZE",  min: 60 },
      { level: "SILVER",  min: 75 },
      { level: "GOLD",    min: 90 },
      { level: "DIAMOND", min: 95 },
    ]
    for (const { level, min } of ACCURACY_THRESHOLDS) {
      if (acc >= min) {
        candidates.push({ badgeType: "ACCURACY", badgeLevel: level, accuracyRequired: min })
      }
    }

    // ── Streak badges ─────────────────────────────────────────────────────────
    const streak = stats.longestStreak
    const STREAK_THRESHOLDS = [
      { level: "MILESTONE_7",   min: 7   },
      { level: "MILESTONE_30",  min: 30  },
      { level: "MILESTONE_60",  min: 60  },
      { level: "MILESTONE_90",  min: 90  },
      { level: "MILESTONE_180", min: 180 },
    ]
    for (const { level, min } of STREAK_THRESHOLDS) {
      if (streak >= min) {
        candidates.push({ badgeType: "STREAK", badgeLevel: level, accuracyRequired: 0 })
      }
    }

    // ── Perfect week / month ──────────────────────────────────────────────────
    // Perfect week: 7+ consecutive perfect days (proxy via currentStreak or
    // by scanning dailyStreakHistory for a run of 7)
    const history = Array.isArray(stats.dailyStreakHistory) ? stats.dailyStreakHistory : []
    const maxRunInHistory = history.reduce((max, h) => Math.max(max, h.streakCount ?? 0), 0)

    if (maxRunInHistory >= 7) {
      candidates.push({ badgeType: "PERFECT_WEEK", badgeLevel: "MILESTONE_7", accuracyRequired: 0 })
    }
    if (maxRunInHistory >= 30) {
      candidates.push({ badgeType: "PERFECT_MONTH", badgeLevel: "MILESTONE_30", accuracyRequired: 0 })
    }

    // ── Award via upsert (skip existing) ─────────────────────────────────────
    const awarded = []
    for (const c of candidates) {
      try {
        const badge = await prisma.badge.upsert({
          where: {
            userId_badgeType_badgeLevel: {
              userId,
              badgeType:  c.badgeType,
              badgeLevel: c.badgeLevel,
            },
          },
          update: {}, // already awarded — no-op
          create: {
            userId,
            badgeType:        c.badgeType,
            badgeLevel:       c.badgeLevel,
            accuracyRequired: c.accuracyRequired,
            unlockedAt:       new Date(),
          },
        })
        awarded.push(badge)
      } catch (e) {
        console.error("Badge upsert error:", e)
      }
    }

    // Mark newly awarded badges (celebrationShown = false) as "new"
    const newBadges = awarded.filter(b => !b.celebrationShown)

    return Response.json(
      { awarded: newBadges, total: awarded.length },
      { status: 200 }
    )
  } catch (err) {
    console.error("[POST /api/badges]", err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}

// ── PATCH /api/badges ─────────────────────────────────────────────────────────
// Mark badges as celebration-shown.
// Body: { badgeIds: string[] }
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { badgeIds } = await req.json()
    if (!Array.isArray(badgeIds) || badgeIds.length === 0) {
      return Response.json({ message: "badgeIds array required" }, { status: 400 })
    }

    await prisma.badge.updateMany({
      where: { id: { in: badgeIds }, userId: session.user.id },
      data:  { celebrationShown: true },
    })

    return Response.json({ message: "Updated" }, { status: 200 })
  } catch (err) {
    console.error("[PATCH /api/badges]", err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}