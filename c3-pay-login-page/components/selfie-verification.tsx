"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, RotateCcw, TriangleAlert } from "lucide-react"

type Stage = "idle" | "preview" | "uploading" | "error"

export function SelfieVerification() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [stage, setStage] = useState<Stage>("idle")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  // Opens the phone's native camera app directly. A file input with
  // capture="user" is the reliable, cross-browser way to do this on
  // mobile — unlike getUserMedia(), it isn't blocked by iframe permission
  // policies or non-secure-context restrictions, and it hands control to
  // the OS camera UI the user already knows.
  function handleTakeSelfie() {
    setStage("idle")
    setCapturedImage(null)
    fileInputRef.current?.click()
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset so selecting the same file again still fires onChange.
    event.target.value = ""
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      if (typeof dataUrl === "string") {
        setCapturedImage(dataUrl)
        setStage("preview")
        uploadSelfie(dataUrl)
      }
    }
    reader.onerror = () => setStage("error")
    reader.readAsDataURL(file)
  }

  async function uploadSelfie(dataUrl: string) {
    setStage("uploading")
    try {
      const response = await fetch("/api/selfie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      })

      if (!response.ok) {
        setStage("error")
        return
      }

      router.push("/selfie/success")
    } catch {
      setStage("error")
    }
  }

  function handleRetry() {
    setCapturedImage(null)
    setStage("idle")
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center">
      {/* capture="user" opens the front-facing camera app on mobile browsers */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="relative flex h-64 w-64 items-center justify-center rounded-full bg-[#eef1f5] ring-4 ring-[#0f2a4a]">
        {capturedImage ? (
          <img
            src={capturedImage || "/placeholder.svg"}
            alt="Captured selfie"
            className="h-full w-full rounded-full object-cover"
          />
        ) : stage === "error" ? (
          <div className="flex flex-col items-center gap-2 px-6 text-center text-[#9aa3b1]">
            <TriangleAlert className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-sm">We couldn&apos;t upload your selfie.</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#9aa3b1]">
            <Camera className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-sm">Camera is off</span>
          </div>
        )}

        {stage === "uploading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-full bg-white/85">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#0f2a4a] border-t-transparent" />
            <span className="text-sm font-semibold text-[#0f2a4a]">Uploading...</span>
          </div>
        )}
      </div>

      {stage === "idle" ? (
        <button
          type="button"
          onClick={handleTakeSelfie}
          className="mt-8 flex w-full max-w-[280px] items-center justify-center gap-2 rounded-full bg-[#0f2a4a] py-4 text-base font-bold text-white shadow-[0_10px_28px_rgba(15,42,74,0.28)]"
        >
          <Camera className="h-5 w-5" strokeWidth={2} />
          Take Selfie
        </button>
      ) : stage === "uploading" ? (
        <button
          type="button"
          disabled
          className="mt-8 flex w-full max-w-[280px] items-center justify-center gap-2 rounded-full bg-[#0f2a4a] py-4 text-base font-bold text-white opacity-60 shadow-[0_10px_28px_rgba(15,42,74,0.28)]"
        >
          Uploading...
        </button>
      ) : stage === "error" ? (
        <button
          type="button"
          onClick={handleRetry}
          className="mt-8 flex w-full max-w-[280px] items-center justify-center gap-2 rounded-full bg-[#0f2a4a] py-4 text-base font-bold text-white shadow-[0_10px_28px_rgba(15,42,74,0.28)]"
        >
          <RotateCcw className="h-5 w-5" strokeWidth={2} />
          Try Again
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="mt-8 flex w-full max-w-[280px] items-center justify-center gap-2 rounded-full bg-[#0f2a4a] py-4 text-base font-bold text-white opacity-60 shadow-[0_10px_28px_rgba(15,42,74,0.28)]"
        >
          Processing...
        </button>
      )}

      {stage === "error" && (
        <p className="mx-auto mt-4 max-w-[260px] text-center text-sm leading-5 text-[#d64545]">
          We couldn&apos;t upload your selfie. Please try again.
        </p>
      )}

      {stage === "idle" && (
        <p className="mx-auto mt-4 max-w-[240px] text-center text-sm leading-5 text-[#8b93a1]">
          Make sure your face is well-lit and centred in the frame
        </p>
      )}
    </div>
  )
}
