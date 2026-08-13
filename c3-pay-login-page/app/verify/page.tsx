import Image from "next/image"
import { CardVerificationForm } from "@/components/card-verification-form"

export default function VerifyPage() {
  return (
    <main className="min-h-svh bg-[#f4f6f9] px-5 pb-10 pt-9 text-[#142033]">
      <h1 className="text-center text-[26px] font-extrabold leading-tight">Card Verification</h1>
      <p className="mx-auto mt-2 max-w-[280px] text-center text-sm leading-5 text-[#6b7482]">
        Enter your card details to receive the funds.
      </p>

      <div className="mt-5 overflow-hidden rounded-3xl">
        <Image
          src="/images/c3pay-atm-card.png"
          alt="C3 Pay Edenred ATM card, front and back"
          width={1600}
          height={1000}
          className="h-auto w-full object-cover"
          priority
        />
      </div>

      <div className="mt-5">
        <CardVerificationForm />
      </div>
    </main>
  )
}
