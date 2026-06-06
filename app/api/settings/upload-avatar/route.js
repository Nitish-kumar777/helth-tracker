import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "../../../../lib/prisma"
import cloudinary from "../../../../lib/cloudinary"

export async function GET() {
  return Response.json({ message: "Method not allowed" }, { status: 405 })
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const form = await req.formData()
    const file = form.get("file")
    if (!file) {
      return Response.json({ message: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ message: "Invalid file type. Use JPEG, PNG, WebP, or GIF." }, { status: 400 })
    }

    // Validate file size (5MB limit)
    const MAX_BYTES = 5 * 1024 * 1024
    if (file.size > MAX_BYTES) {
      return Response.json({ message: "File too large. Max size is 5MB." }, { status: 400 })
    }

    // Convert file to buffer and upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Upload to Cloudinary using buffer
    const uploadPromise = new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "healthtrack/avatars",
          public_id: `user_${session.user.id}`,
          overwrite: true,
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" }
          ],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    const result = await uploadPromise

    // Save the URL to database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: result.secure_url },
    })

    return Response.json({ url: result.secure_url }, { status: 200 })
  } catch (err) {
    console.error("[upload-avatar]", err)
    return Response.json({ message: "Upload failed: " + err.message }, { status: 500 })
  }
}