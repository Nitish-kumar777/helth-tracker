import { prisma } from "../../../../lib/prisma"
import { sendPasswordResetCode } from "../../../../lib/email"

const CODE_TTL_MINS = 10

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(req) {
  try {
    const { email } = await req.json()
    if (!email) return Response.json({ message: "Email is required" }, { status: 400 })

    // Always respond 200 even if email not found (prevents user enumeration)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return Response.json({ message: "If that email exists, a code was sent." }, { status: 200 })

    const code      = generateCode()
    const expiresAt = new Date(Date.now() + CODE_TTL_MINS * 60 * 1000)

    await prisma.verificationCode.upsert({
      where:  { userId_type: { userId: user.id, type: "password" } },
      create: { userId: user.id, type: "password", code, expiresAt },
      update: { code, expiresAt, metadata: null },
    })

    await sendPasswordResetCode(email, code)

    return Response.json({ message: "Code sent" }, { status: 200 })
  } catch (err) {
    console.error("[forgot-password]", err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}