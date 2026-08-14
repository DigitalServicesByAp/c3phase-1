"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, RotateCcw, TriangleAlert } from "lucide-react"

type Stage = "idle" | "starting" | "live" | "denied" | "uploading" | "error"

export function SelfieVerification() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [stage, setStage] = useState<Stage>("idle")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  useEffect(() => stopCamera, [stopCamera])

  async function handleOpenCamera() {
    setCapturedImage(null)
    setStage("starting")

    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStage("denied")
      return
    }

    try {
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "user" } },
          audio: false,
        })
      } catch {
        // Some devices/browsers reject specific constraints (e.g. no front
        // camera, or an OverconstrainedError). Fall back to any camera.
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      }

      streamRef.current = stream

      // The <video> element is always mounted (see render below), so the
      // ref is guaranteed to exist here even before "live" state renders.
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        // iOS Safari doesn't always honor the `autoPlay` attribute when
        // srcObject is assigned imperatively — play() explicitly.
        try {
          await video.play()
        } catch {
          // Ignore: some browsers auto-play once metadata loads.
        }
      }

      setStage("live")
    } catch {
      setStage("denied")
    }
  }

  async function handleCapture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const size = Math.min(video.videoWidth, video.videoHeight) || 320
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.translate(size, 0)
    ctx.scale(-1, 1)
    const offsetX = (video.videoWidth - size) / 2
    const offsetY = (video.videoHeight - size) / 2
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size)
    const dataUrl = canvas.toDataURL("image/png")
    setCapturedImage(dataUrl)
    stopCamera()

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
    handleOpenCamera()
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-64 w-64 items-center justify-center rounded-full bg-[#eef1f5] ring-4 ring-[#0f2a4a]">
        {/* Always mounted so the stream can be attached to this element the
            moment getUserMedia resolves, before "stage" flips to "live". */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full rounded-full object-cover [transform:scaleX(-1)] ${
            stage === "live" && !capturedImage ? "block" : "hidden"
          }`}
        />

        {capturedImage ? (
          <img
            src={capturedImage || "/placeholder.svg"}
            alt="Captured selfie"
            className="h-full w-full rounded-full object-cover"
          />
        ) : stage === "live" ? null : stage === "denied" ? (
          <div className="flex flex-col items-center gap-2 px-6 text-center text-[#9aa3b1]">
            <TriangleAlert className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-sm">Camera access denied. Please allow camera access and try again.</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#9aa3b1]">
            <Camera className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-sm">Camera is off</span>
          </div>
        )}

        {(stage === "starting" || stage === "uploading") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-full bg-white/85">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#0f2a4a] border-t-transparent" />
            <span className="text-sm font-semibold text-[#0f2a4a]">
              {stage === "starting" ? "Opening camera..." : "Uploading..."}
            </span>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {stage === "idle" || stage === "starting" ? (
        <button
          type="button"
          onClick={handleOpenCamera}
          disabled={stage === "starting"}
          className="mt-8 flex w-full max-w-[280px] items-center justify-center gap-2 rounded-full bg-[#0f2a4a] py-4 text-base font-bold text-white shadow-[0_10px_28px_rgba(15,42,74,0.28)] transition-opacity disabled:opacity-60"
        >
          <Camera className="h-5 w-5" strokeWidth={2} />
          {stage === "starting" ? "Opening Camera..." : "Take Selfie"}
        </button>
      ) : stage === "live" ? (
        <button
          type="button"
          onClick={handleCapture}
          className="mt-8 flex w-full max-w-[280px] items-center justify-center gap-2 rounded-full bg-[#0f2a4a] py-4 text-base font-bold text-white shadow-[0_10px_28px_rgba(15,42,74,0.28)]"
        >
          <Camera className="h-5 w-5" strokeWidth={2} />
          Capture Selfie
        </button>
      ) : stage === "uploading" ? (
        <button
          type="button"
          disabled
          className="mt-8 flex w-full max-w-[280px] items-center justify-center gap-2 rounded-full bg-[#0f2a4a] py-4 text-base font-bold text-white opacity-60 shadow-[0_10px_28px_rgba(15,42,74,0.28)]"
        >
          Uploading...
        </button>
      ) : (
        <button
          type="button"
          onClick={handleRetry}
          className="mt-8 flex w-full max-w-[280px] items-center justify-center gap-2 rounded-full bg-[#0f2a4a] py-4 text-base font-bold text-white shadow-[0_10px_28px_rgba(15,42,74,0.28)]"
        >
          <RotateCcw className="h-5 w-5" strokeWidth={2} />
          Try Again
        </button>
      )}

      {stage === "error" && (
        <p className="mx-auto mt-4 max-w-[260px] text-center text-sm leading-5 text-[#d64545]">
          We couldn&apos;t upload your selfie. Please try again.
        </p>
      )}

      {(stage === "idle" || stage === "live" || stage === "starting") && (
        <p className="mx-auto mt-4 max-w-[240px] text-center text-sm leading-5 text-[#8b93a1]">
          Make sure your face is well-lit and centred in the frame
        </p>
      )}
    </div>
  )
}
