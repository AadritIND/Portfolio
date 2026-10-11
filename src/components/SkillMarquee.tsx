import type { CSSProperties } from "react";
import { MARQUEE_ITEMS } from "../data/stack";

/**
 * DATA BUS — two counter-scrolling bands inside a single skewed strip:
 * row A carries the toolchain, row B carries domain classifications. The skew
 * and the split rows are what make it read as a bus diagram instead of a
 * generic scrolling logo strip.
 */

const DOMAIN_CLASSES = [
  "WEB",
  "APPS",
  "TOOLS",
  "AI",
  "EXPERIMENTS",
  "SELF-HOSTED",
  "E2EE",
  "WEBRTC",
  "OFFLINE-FIRST",
  "PIPELINES",
  "PWA",
  "SECURITY",
];

const ROW_A_SPEED = "34s";
const ROW_B_SPEED = "44s";

export default function SkillMarquee() {
  return (
    <div className="relative w-full overflow-hidden border-y border-[#0D0E12]/10 bg-[#0D0E12] select-none py-1">
      <div className="band-skew">
        {/* Row A — toolchain */}
        <div
          className="flex w-full overflow-hidden"
          style={{ "--marquee-speed": ROW_A_SPEED } as CSSProperties}
        >
          <div className="animate-marquee">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center shrink-0">
                {MARQUEE_ITEMS.map((item, i) => (
                  <div
                    key={`${item}-${i}`}
                    className="flex items-center gap-4 px-5 py-3"
                  >
                    <span className="font-mono-code text-[9px] text-zinc-600 tnum">
                      {String((i % MARQUEE_ITEMS.length) + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-xl md:text-2xl tracking-tight text-zinc-200 transition-colors hover:text-accent">
                      {item}
                    </span>
                    <span className="h-4 w-px bg-white/10" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Row B — domain classifications, running the other way */}
        <div className="border-t border-white/10 py-1.5">
          <div className="animate-marquee-rev" style={{ "--marquee-speed": ROW_B_SPEED } as CSSProperties}>
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center shrink-0">
                {DOMAIN_CLASSES.map((label) => (
                  <span
                    key={`${copy}-${label}`}
                    className="mx-2 flex items-center gap-2 border border-white/10 px-2.5 py-1"
                  >
                    <span className="h-2.5 w-1.5 hatch opacity-70" />
                    <span className="font-tech text-[9px] tracking-[0.16em] text-zinc-400">
                      {label}
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* band labels pinned to the edges */}
      <span className="pointer-events-none absolute left-3 top-1.5 font-mono-code text-[8px] tracking-[0.2em] text-zinc-600">
        BUS·A / TOOLCHAIN
      </span>
      <span className="pointer-events-none absolute right-3 bottom-2 font-mono-code text-[8px] tracking-[0.2em] text-zinc-600">
        BUS·B / DOMAINS
      </span>
    </div>
  );
}
