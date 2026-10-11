import { useEffect, useState } from "react";

interface DatumRulerProps {
  tone?: "light" | "dark";
  /** Sideways label printed down the ruler. */
  label?: string;
}

/**
 * DatumRuler — fixed measuring scale down the right edge of the page with a
 * marker tracking scroll position. Pure drafting furniture: it gives every
 * scroll a readout without adding another floating panel.
 */
export default function DatumRuler({
  tone = "light",
  label = "AADRIT // MAINFRAME",
}: DatumRulerProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setProgress(p);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const dark = tone === "dark";
  const ink = dark ? "rgba(255,255,255,0.22)" : "rgba(13,14,18,0.22)";
  const strong = dark ? "rgba(255,255,255,0.4)" : "rgba(13,14,18,0.42)";
  const text = dark ? "text-zinc-500" : "text-zinc-400";

  return (
    <div
      aria-hidden="true"
      className="hidden xl:flex fixed right-0 top-0 bottom-0 w-11 z-30 flex-col items-center justify-between py-24 pointer-events-none"
    >
      {/* minor ticks */}
      <div
        className="absolute inset-y-0 right-3 w-px"
        style={{
          backgroundImage: `repeating-linear-gradient(to bottom, ${ink} 0 1px, transparent 1px 10px)`,
        }}
      />
      {/* major ticks */}
      <div
        className="absolute inset-y-0 right-3 w-2.5"
        style={{
          backgroundImage: `repeating-linear-gradient(to bottom, ${strong} 0 1px, transparent 1px 50px)`,
          backgroundPosition: "right top",
          backgroundSize: "6px 100%",
          backgroundRepeat: "no-repeat",
        }}
      />

      <span
        className={`font-mono-code text-[9px] tracking-[0.2em] ${text} tnum`}
      >
        {String(Math.round(progress * 100)).padStart(3, "0")}
      </span>

      <span
        className={`text-sideways font-tech text-[9px] tracking-[0.3em] ${text} my-6`}
      >
        {label}
      </span>

      <span className={`font-mono-code text-[9px] ${text}`}>SHEET</span>

      {/* scroll marker */}
      <div
        className="absolute right-0 w-3 h-3 border-r-2 border-y-2"
        style={{
          top: `calc(6rem + ${progress} * (100% - 12rem))`,
          borderColor: "var(--accent)",
          transition: "top 0.08s linear",
        }}
      />
    </div>
  );
}
