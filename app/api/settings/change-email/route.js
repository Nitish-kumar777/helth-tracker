import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "../../../../lib/prisma"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ message: "Unauthorized" }, { status: 401 })

    const { code, newEmail } = await req.json()
    if (!code || !newEmail) return Response.json({ message: "code and newEmail required" }, { status: 400 })

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(newEmail)) return Response.json({ message: "Valid email required" }, { status: 400 })

    const record = await prisma.verificationCode.findUnique({
      where: { userId_type: { userId: session.user.id, type: "email-change" } },
    })
    if (!record || record.code !== code)     return Response.json({ message: "Invalid or expired code" }, { status: 400 })
    if (record.expiresAt < new Date())       return Response.json({ message: "Code expired" },            { status: 410 })
    if (record.metadata !== newEmail)        return Response.json({ message: "Email mismatch" },          { status: 400 })

    // Check uniqueness again
    const existing = await prisma.user.findUnique({ where: { email: newEmail } })
    if (existing && existing.id !== session.user.id)
      return Response.json({ message: "Email already in use" }, { status: 409 })

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data:  { email: newEmail, emailVerified: new Date() },
      }),
      prisma.verificationCode.delete({
        where: { userId_type: { userId: session.user.id, type: "email-change" } },
      }),
    ])

    return Response.json({ message: "Email updated" }, { status: 200 })
  } catch (err) {
    console.error("[change-email]", err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}