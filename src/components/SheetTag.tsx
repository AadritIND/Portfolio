import type { CSSProperties } from "react";

interface SheetTagProps {
  /** Drawing sheet number, e.g. "03". */
  sheet: string;
  /** Sheet title, e.g. "TRAJECTORY LOG". */
  label: string;
  /** Small right-aligned annotations, e.g. ["SCALE 1:1", "REV 3.2.0"]. */
  meta?: string[];
  tone?: "light" | "dark";
  className?: string;
}

/**
 * SheetTag — the drafted-drawing header that marks every section: sheet
 * number, a datum rule with measurement ticks, and revision annotations.
 * This is the repeating signature that ties the site together.
 */
export default function SheetTag({
  sheet,
  label,
  meta = [],
  tone = "light",
  className = "",
}: SheetTagProps) {
  const dark = tone === "dark";
  const ink = dark ? "rgba(255,255,255,0.26)" : "rgba(13,14,18,0.26)";
  const label3 = dark ? "text-zinc-300" : "text-[#0D0E12]";
  const muted = dark ? "text-zinc-500" : "text-zinc-500";

  return (
    <div
      className={`flex items-center gap-3 sm:gap-5 select-none ${className}`}
      style={{ "--datum-ink": ink } as CSSProperties}
    >
      <span
        className={`shrink-0 font-mono-code text-[10px] font-bold px-1.5 py-0.5 border ${
          dark ? "text-accent" : "text-accent"
        }`}
        style={{ borderColor: "var(--accent)" }}
      >
        SHEET {sheet}
      </span>

      <span
        className={`shrink-0 font-tech text-[9px] sm:text-[10px] tracking-[0.14em] ${label3}`}
      >
        {label}
      </span>

      <div className="flex-1 datum-rule self-end min-w-4" />

      {meta.length > 0 && (
        <span
          className={`hidden sm:flex items-center gap-3 shrink-0 font-mono-code text-[9px] tracking-wider ${muted}`}
        >
          {meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </span>
      )}
    </div>
  );
}
