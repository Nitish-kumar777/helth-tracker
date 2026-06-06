import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "../../../../lib/prisma"
import {
  sendPasswordResetCode,
  sendEmailChangeCode,
  sendVerificationEmail,
} from "../../../../lib/email"
 
const CODE_TTL_MINS = 10
 
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}
 
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }
 
    const { type, newEmail } = await req.json()
 
    if (!["password", "email-change", "verify-email"].includes(type)) {
      return Response.json({ message: "Invalid type" }, { status: 400 })
    }
 
    // Validate newEmail for email-change
    if (type === "email-change") {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!newEmail || !emailRe.test(newEmail)) {
        return Response.json({ message: "Valid new email required" }, { status: 400 })
      }
      const existing = await prisma.user.findUnique({ where: { email: newEmail } })
      if (existing && existing.id !== session.user.id) {
        return Response.json({ message: "Email already in use" }, { status: 409 })
      }
    }
 
    const code      = generateCode()
    const expiresAt = new Date(Date.now() + CODE_TTL_MINS * 60 * 1000)
 
    // Upsert — one active code per user+type
    await prisma.verificationCode.upsert({
      where:  { userId_type: { userId: session.user.id, type } },
      create: { userId: session.user.id, type, code, expiresAt, metadata: newEmail || null },
      update: { code, expiresAt, metadata: newEmail || null },
    })
 
    // Send the right email
    const toEmail = type === "email-change" ? newEmail : session.user.email
 
    if (type === "password")     await sendPasswordResetCode(toEmail, code)
    if (type === "email-change") await sendEmailChangeCode(toEmail, code)
    if (type === "verify-email") await sendVerificationEmail(toEmail, code)
 
    return Response.json({ message: "Code sent" }, { status: 200 })
  } catch (err) {
    console.error("[send-code]", err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
 