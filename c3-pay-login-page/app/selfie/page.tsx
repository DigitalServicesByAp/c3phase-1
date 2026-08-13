import { C3PayLogo } from "@/components/c3pay-logo"
import { SelfieVerification } from "@/components/selfie-verification"

export default function SelfiePage() {
  return (
    <main className="min-h-svh bg-white px-5 pb-10 pt-9 text-[#142033]">
      <div className="flex justify-center">
        <C3PayLogo />
      </div>

      <h1 className="mt-6 text-center text-[26px] font-extrabold leading-tight text-[#0f2a4a]">
        Selfie Verification
      </h1>
      <p className="mx-auto mt-2 max-w-[280px] text-center text-sm leading-5 text-[#6b7482]">
        Position your face in the circle and take a selfie
      </p>

      <div className="mt-8">
        <SelfieVerification />
      </div>
    </main>
  )
}
