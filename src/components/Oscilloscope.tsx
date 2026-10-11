import { useEffect, useRef } from "react";

interface OscilloscopeProps {
  height?: number;
  /** Surface the trace sits on — flips grid/stroke alpha. */
  tone?: "light" | "dark";
  /** Explicit trace color; defaults to the live --accent. */
  color?: string;
  /** Vertical gain, 0–1.5. */
  gain?: number;
  className?: string;
}

const FALLBACK_ACCENT = "#ff8a1f";

/**
 * Oscilloscope — a real animated signal trace on canvas (two summed carriers
 * plus a sweep marker), used as the mainframe's signature readout. Honors
 * prefers-reduced-motion by drawing a single static frame, and idles when
 * scrolled out of view.
 */
export default function Oscilloscope({
  height = 96,
  tone = "light",
  color,
  gain = 1,
  className = "",
}: OscilloscopeProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dark = tone === "dark";
    const gridInk = dark ? "rgba(255,255,255,0.07)" : "rgba(13,14,18,0.09)";
    const axisInk = dark ? "rgba(255,255,255,0.16)" : "rgba(13,14,18,0.2)";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const readAccent = () =>
      color ??
      (getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() ||
        FALLBACK_ACCENT);

    let accent = readAccent();

    let raf = 0;
    let visible = true;
    let phase = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const size = () => {
      const w = canvas.clientWidth || 320;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    const onResize = () => size();
    window.addEventListener("resize", onResize);

    // Re-read the accent when a skin swap rewrites :root's style attribute.
    const skinWatch = new MutationObserver(() => {
      accent = readAccent();
    });
    skinWatch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    const draw = () => {
      const w = canvas.clientWidth || 320;
      const h = height;
      const mid = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Grid: 12px minor cells with a heavier centre axis.
      ctx.lineWidth = 1;
      ctx.strokeStyle = gridInk;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 12) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
      }
      for (let y = 0; y <= h; y += 12) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
      }
      ctx.stroke();

      ctx.strokeStyle = axisInk;
      ctx.beginPath();
      ctx.moveTo(0, mid + 0.5);
      ctx.lineTo(w, mid + 0.5);
      ctx.stroke();

      // Trace: a burst carrier riding a slow envelope, so it reads as a
      // signal rather than a decorative sine wave.
      const amp = (h / 2 - 8) * gain;
      const envelope = 0.55 + 0.45 * Math.sin(phase * 0.6);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 1) {
        const t = x / w;
        const y =
          mid -
          amp * envelope * 0.5 * (
            Math.sin(t * 14 + phase * 2.1) * 0.62 +
            Math.sin(t * 37 - phase * 1.3) * 0.24 +
            Math.sin(t * 3.4 + phase * 0.4) * 0.5
          );
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 1.6;
      ctx.lineJoin = "round";
      ctx.shadowColor = accent;
      ctx.shadowBlur = 7;
      ctx.strokeStyle = accent;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Sweep marker with a hairline drop.
      const sweep = ((phase * 34) % (w + 40)) - 20;
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(sweep + 0.5, 0);
      ctx.lineTo(sweep + 0.5, h);
      ctx.stroke();
      ctx.globalAlpha = 1;

      if (!reduce) {
        phase += 0.028;
        raf = requestAnimationFrame(() => {
          if (visible) draw();
          else raf = requestAnimationFrame(() => {
            if (visible) draw();
          });
        });
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      skinWatch.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [height, tone, color, gain]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`w-full block ${className}`}
      style={{ height }}
    />
  );
}
