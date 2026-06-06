import { prisma } from "../../../../lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req) {
  try {
    const { email, code, newPassword } = await req.json()

    if (!email || !code || !newPassword)
      return Response.json({ message: "email, code and newPassword required" }, { status: 400 })
    if (newPassword.length < 8)
      return Response.json({ message: "Password must be at least 8 characters" }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return Response.json({ message: "Invalid request" }, { status: 400 })

    // Re-verify code
    const record = await prisma.verificationCode.findUnique({
      where: { userId_type: { userId: user.id, type: "password" } },
    })
    if (!record || record.code !== code)
      return Response.json({ message: "Invalid or expired code" }, { status: 400 })
    if (record.expiresAt < new Date())
      return Response.json({ message: "Code expired" }, { status: 410 })

    const hash = await bcrypt.hash(newPassword, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data:  { password: hash },
      }),
      prisma.verificationCode.delete({
        where: { userId_type: { userId: user.id, type: "password" } },
      }),
    ])

    return Response.json({ message: "Password reset successfully" }, { status: 200 })
  } catch (err) {
    console.error("[reset-password]", err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}