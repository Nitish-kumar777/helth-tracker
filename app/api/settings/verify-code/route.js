import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "../../../../lib/prisma"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ message: "Unauthorized" }, { status: 401 })

    const { type, code } = await req.json()
    if (!type || !code) return Response.json({ message: "type and code required" }, { status: 400 })

    const record = await prisma.verificationCode.findUnique({
      where: { userId_type: { userId: session.user.id, type } },
    })

    if (!record)              return Response.json({ message: "No code found. Request a new one." }, { status: 404 })
    if (record.code !== code) return Response.json({ message: "Incorrect code" },                   { status: 400 })
    if (record.expiresAt < new Date()) return Response.json({ message: "Code expired. Request a new one." }, { status: 410 })

    // Don't delete yet — change-password / change-email routes will use it
    return Response.json({ message: "Code verified" }, { status: 200 })
  } catch (err) {
    console.error("[verify-code]", err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}