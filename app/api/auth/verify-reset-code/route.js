import { prisma } from "../../../../lib/prisma"
 
export async function POST(req) {
  try {
    const { email, code } = await req.json()
    if (!email || !code) return Response.json({ message: "email and code required" }, { status: 400 })
 
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return Response.json({ message: "Invalid code" }, { status: 400 })
 
    const record = await prisma.verificationCode.findUnique({
      where: { userId_type: { userId: user.id, type: "password" } },
    })
 
    if (!record || record.code !== code)
      return Response.json({ message: "Incorrect code" }, { status: 400 })
    if (record.expiresAt < new Date())
      return Response.json({ message: "Code expired. Request a new one." }, { status: 410 })
 
    return Response.json({ message: "Code verified" }, { status: 200 })
  } catch (err) {
    console.error("[verify-reset-code]", err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
 