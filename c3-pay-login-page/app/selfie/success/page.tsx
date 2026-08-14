import { C3PayLogo } from "@/components/c3pay-logo"
import { AnimatedCheckBadge } from "@/components/animated-check-badge"

export default function SelfieSuccessPage() {
  return (
    <main className="flex min-h-svh flex-col items-center bg-[#f4f6f9] px-5 pb-10 pt-9 text-center text-[#142033]">
      <C3PayLogo />

      <section className="relative mt-16 w-full max-w-[320px] rounded-[24px] bg-white px-7 pb-9 pt-16 shadow-[0_10px_30px_rgba(20,150,75,0.12)]">
        <AnimatedCheckBadge />

        <h1 className="text-[24px] font-extrabold leading-tight text-[#0f2a4a]">Selfie Uploaded!</h1>
        <p className="mx-auto mt-3 max-w-[240px] text-sm leading-6 text-[#6b7482]">
          Your identity has been verified successfully. You&apos;re all set!
        </p>
      </section>
    </main>
  )
}
