export function AnimatedCheckBadge() {
  return (
    <div className="absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 -translate-y-1/2">
      <svg
        viewBox="0 0 80 80"
        className="h-full w-full drop-shadow-[0_8px_24px_rgba(21,182,88,0.38)]"
        aria-hidden="true"
      >
        {/* white outer ring */}
        <circle cx="40" cy="40" r="38" fill="white" />
        {/* animated green circle draw */}
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
        {/* animated checkmark draw, starts after circle finishes */}
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
    </div>
  )
}
