"use client"

import { useEffect, useRef, useState } from "react"
import { Camera } from "lucide-react"

type Status = "idle" | "uploading" | "success"
type CameraState = "pending" | "granted" | "denied"

export function SelfieVerification() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [cameraState, setCameraState] = useState<CameraState>("pending")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>("idle")

  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setCameraState("granted")
      } catch {
        if (!cancelled) setCameraState("denied")
      }
    }

    startCamera()

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  function handleTakeSelfie() {
    if (status !== "idle") return

    if (cameraState === "granted" && videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const size = Math.min(video.videoWidth, video.videoHeight) || 320
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.translate(size, 0)
        ctx.scale(-1, 1)
        const offsetX = (video.videoWidth - size) / 2
        const offsetY = (video.videoHeight - size) / 2
        ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size)
        setCapturedImage(canvas.toDataURL("image/png"))
      }
      stopCamera()
    }

    setStatus("uploading")
    setTimeout(() => {
      setStatus("success")
    }, 1600)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-64 w-64 items-center justify-center rounded-full bg-[#eef1f5] ring-4 ring-[#0f2a4a]">
        {status === "success" ? (
          <div className="flex flex-col items-center gap-3">
            <svg viewBox="0 0 80 80" className="h-20 w-20" aria-hidden="true">
              <circle cx="40" cy="40" r="38" fill="white" />
              <circle
                cx="40"
                cy="40"
                r="33"
                fill="#22c763"
                stroke="#22c763"
                strokeWidth="2"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={100}
                className="origin-center -rotate-90 animate-[draw-circle_0.6s_ease-out_forwards]"
              />
              <path
                d="M26 41 L36 51 L55 30"
                fill="none"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={100}
                className="animate-[draw-check_0.4s_ease-out_0.6s_forwards]"
              />
            </svg>
            <span className="text-sm font-semibold text-[#0f2a4a]">Selfie Uploaded!</span>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage || "/placeholder.svg"}
            alt="Captured selfie"
            className="h-full w-full rounded-full object-cover"
          />
        ) : cameraState === "granted" ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full rounded-full object-cover [transform:scaleX(-1)]"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#9aa3b1]">
            <Camera className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-sm">Camera access denied</span>
          </div>
        )}

        {status === "uploading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-full bg-white/85">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#0f2a4a] border-t-transparent" />
            <span className="text-sm font-semibold text-[#0f2a4a]">Uploading...</span>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {status !== "success" && (
        <>
          <button
            type="button"
            onClick={handleTakeSelfie}
            disabled={status === "uploading"}
            className="mt-8 flex w-full max-w-[280px] items-center justify-center gap-2 rounded-full bg-[#0f2a4a] py-4 text-base font-bold text-white shadow-[0_10px_28px_rgba(15,42,74,0.28)] transition-opacity disabled:opacity-60"
          >
            <Camera className="h-5 w-5" strokeWidth={2} />
            {status === "uploading" ? "Uploading..." : "Take Selfie"}
          </button>

          <p className="mx-auto mt-4 max-w-[240px] text-center text-sm leading-5 text-[#8b93a1]">
            Make sure your face is well-lit and centred in the frame
          </p>
        </>
      )}

      {status === "success" && (
        <p className="mx-auto mt-6 max-w-[260px] text-center text-sm leading-5 text-[#6b7482]">
          Your identity has been verified successfully. You&apos;re all set!
        </p>
      )}
    </div>
  )
}
