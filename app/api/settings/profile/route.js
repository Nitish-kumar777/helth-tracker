// app/api/settings/profile/route.js
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "../../../../lib/prisma"

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ message: "Unauthorized" }, { status: 401 })

    const { name, image } = await req.json()
    if (!name?.trim()) return Response.json({ message: "Name is required" }, { status: 400 })

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name:  name.trim(),
        image: image ?? undefined,
      },
      select: { id: true, name: true, image: true },
    })

    return Response.json({ user }, { status: 200 })
  } catch (err) {
    console.error("[profile PATCH]", err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}