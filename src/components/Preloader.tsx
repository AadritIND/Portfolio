import { useEffect, useState, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { IDENTITY } from "../data/types";

/**
 * BOOT / POST — the site opens on a POST diagnostic sheet: a left-aligned
 * self-test log where each subsystem reports in, a datum-rule progress scale,
 * then a single slit reveal. Deliberately not a centred percentage counter.
 * Shown once per session; skippable.
 */

const POST: Array<[string, string]> = [
  ["mount /dev/mainframe", "OK"],
  ["verify operator → " + IDENTITY.githubHandle, "OK"],
  ["resolve accent register", "OK"],
  ["warm canvas / webgl layer", "OK"],
  ["handshake github public api", "LINKED"],
  ["load 7 repositories", "OK"],
  ["spool sheets 01→06", "OK"],
  ["arm cursor + sound fx", "OK"],
  ["queue the fun stuff", "OK"],
];

const LINE_MS = 125;
const HOLD_MS = 320;
const EXIT_MS = 520;

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [shown, setShown] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (shown >= POST.length) {
      const hold = setTimeout(() => setExiting(true), HOLD_MS);
      return () => clearTimeout(hold);
    }
    const id = setTimeout(() => setShown((n) => n + 1), LINE_MS);
    return () => clearTimeout(id);
  }, [shown]);

  useEffect(() => {
    if (!exiting) return;
    const id = setTimeout(onComplete, EXIT_MS);
    return () => clearTimeout(id);
  }, [exiting, onComplete]);

  const skip = () => {
    setShown(POST.length);
  };

  const pct = Math.round((shown / POST.length) * 100);

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden fascia text-zinc-300"
      style={{
        opacity: exiting ? 0 : 1,
        transition: `opacity ${EXIT_MS}ms cubic-bezier(0.16,1,0.3,1)`,
        pointerEvents: exiting ? "none" : "auto",
      }}
    >
      {/* faint drawing grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #fff 1px, transparent 1px), linear-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* sheet frame + registration crosses */}
      <div className="absolute inset-4 sm:inset-6 border border-white/10" />
      <span
        className="absolute top-[6px] left-[6px] h-3 w-3 sm:top-[10px] sm:left-[10px]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,.35)), linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,.35))",
          backgroundSize: "1px 100%, 100% 1px",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <span
        className="absolute bottom-[6px] right-[6px] h-3 w-3 sm:bottom-[10px] sm:right-[10px]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,.35)), linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,.35))",
          backgroundSize: "1px 100%, 100% 1px",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-8 sm:p-12">
        {/* header strip */}
        <div className="flex items-center justify-between gap-4">
          <span className="font-tech text-[10px] tracking-[0.2em] text-zinc-400">
            POST / BOOT
          </span>
          <span className="hidden font-mono-code text-[10px] text-zinc-600 sm:inline">
            REV 3.2.0 · SHEET 00 · COLD START
          </span>
          <button
            onClick={skip}
            className="flex items-center gap-1.5 border border-white/15 px-2.5 py-1 font-mono-code text-[10px] text-zinc-400 transition hover:border-accent hover:text-zinc-100 cursor-pointer"
          >
            SKIP POST <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* POST log */}
        <div className="max-w-2xl">
          <ul className="space-y-1.5">
            {POST.map(([label, status], i) => {
              const live = i < shown;
              // the last line resolves once everything has reported in
              const resolved = i < shown - 1 || shown >= POST.length;
              return (
                <li
                  key={label}
                  className="flex items-baseline gap-3 font-mono-code text-[11px] sm:text-xs"
                  style={{
                    opacity: live ? 1 : 0.18,
                    transform: live ? "none" : "translateX(-6px)",
                    transition: "opacity 220ms ease-out, transform 220ms ease-out",
                  }}
                >
                  <span className="text-zinc-600">▸</span>
                  <span className="text-zinc-300">{label}</span>
                  <span className="flex-1 min-w-4 border-b border-dotted border-white/10" />
                  <span
                    className={`shrink-0 ${resolved ? "text-accent" : "text-zinc-600"}`}
                  >
                    {resolved ? status : "····"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* progress scale */}
        <div>
          <div
            className="flex items-center gap-4"
            style={{ "--datum-ink": "rgba(255,255,255,0.24)" } as CSSProperties}
          >
            <span className="font-tech text-[10px] tracking-[0.18em] text-zinc-400">
              {exiting ? "ENGAGING UI" : "SELF TEST"}
            </span>
            <div className="flex-1 datum-rule self-end" />
            <span className="font-mono-code text-xs text-zinc-300 tnum">
              {String(pct).padStart(3, "0")}%
            </span>
          </div>
        </div>
      </div>

      {/* slit reveal — one accent sweep, not five panels */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 h-px"
        style={{
          backgroundColor: "var(--accent)",
          transform: exiting ? "scaleX(1)" : "scaleX(0)",
          transition: `transform ${EXIT_MS}ms cubic-bezier(0.16,1,0.3,1)`,
        }}
      />
    </div>
  );
}
