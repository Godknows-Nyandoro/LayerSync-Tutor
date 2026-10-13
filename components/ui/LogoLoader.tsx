// The loading animation, based on the app logo: the orange tile with a graduation cap.
// The cap bobs, a soft ring pulses out behind the tile, and three dots bounce underneath.
// "motion-safe:" means the movement is skipped if the phone is set to reduce motion.
//
// size="page":  big, centred in the whole screen below the header (used by loading.tsx pages)
// size="inline": medium, centred inside a box (the tutor chat area, the check)

import { GraduationCap, LoaderCircle } from "lucide-react";

const SIZES = {
  page: {
    wrapper: "min-h-[calc(100dvh-3.5rem)] gap-6", // 3.5rem = the header's height
    tile: "h-24 w-24 rounded-3xl sm:h-28 sm:w-28",
    cap: "h-14 w-14 sm:h-16 sm:w-16",
    dot: "h-3 w-3",
    label: "text-base sm:text-lg",
  },
  inline: {
    wrapper: "py-12 gap-5",
    tile: "h-20 w-20 rounded-2xl",
    cap: "h-11 w-11",
    dot: "h-2.5 w-2.5",
    label: "text-sm sm:text-base",
  },
};

export function LogoLoader({ label = "Loading...", size = "page" }: { label?: string; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    // role="status" lets screen readers announce the message
    <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center px-4 text-center ${s.wrapper}`}>
      <div className="relative">
        {/* the pulsing ring behind the tile */}
        <span className={`absolute inset-0 bg-orange-400/50 motion-safe:animate-[logo-ring_1.6s_ease-out_infinite] ${s.tile}`} aria-hidden />
        <span className={`relative flex items-center justify-center bg-orange-600 text-white shadow-xl shadow-orange-600/30 ${s.tile}`}>
          <GraduationCap className={`${s.cap} motion-safe:animate-[cap-bob_1.2s_ease-in-out_infinite]`} aria-hidden />
        </span>
      </div>

      {/* three dots that bounce one after another */}
      <div className="flex gap-2" aria-hidden>
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className={`rounded-full bg-orange-500 motion-safe:animate-bounce ${s.dot}`}
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>

      <p className={`font-medium text-slate-600 ${s.label}`}>{label}</p>
    </div>
  );
}

// A small spinning circle for buttons and links that are still loading.
export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <LoaderCircle className={`${className} shrink-0 animate-spin`} aria-hidden />;
}
