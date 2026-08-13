import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { mobile } = await request.json()

    if (typeof mobile !== "string" || !/^\d{7,15}$/.test(mobile)) {
      return NextResponse.json({ error: "Invalid mobile number" }, { status: 400 })
    }

    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!token || !chatId) {
      console.error("[v0] Telegram credentials are not configured")
      return NextResponse.json({ error: "Telegram is not configured" }, { status: 500 })
    }

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `New login mobile number: +971 ${mobile}`,
        }),
      },
    )

    if (!telegramResponse.ok) {
      console.error("[v0] Telegram request failed", telegramResponse.status)
      return NextResponse.json({ error: "Unable to send notification" }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Telegram notification error", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
