import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ScrambleText from "./ScrambleText";
import Oscilloscope from "./Oscilloscope";
import { IDENTITY } from "../data/types";
import { useLiveProjects } from "../lib/catalog";
import {
  formatUptime,
  readTelemetryCache,
  relativeFrom,
  useSystemReadout,
  type TelemetryCache,
} from "../lib/telemetry";

/**
 * SHEET 01 / MASTHEAD — an asymmetric drawing sheet instead of a centred
 * block: typed masthead on the left, live instrument panel on the right.
 * The two columns drift at different rates on scroll (differential parallax)
 * rather than the whole sheet scaling and tilting.
 */
export default function Hero({ onAbout }: { onAbout: () => void }) {
  const PROJECTS = useLiveProjects();
  const navigate = useNavigate();
  const ref = useRef<HTMLElement>(null);

  const { fps, memMB, cores, net, width, height, local, timezone, uptime } =
    useSystemReadout();
  const [gh, setGh] = useState<TelemetryCache | null>(() =>
    readTelemetryCache(),
  );

  useEffect(() => {
    const id = setInterval(() => setGh(readTelemetryCache()), 15000);
    return () => clearInterval(id);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yMasthead = useTransform(scrollYProgress, [0, 1], [0, -34]);
  const ySpec = useTransform(scrollYProgress, [0, 1], [0, -108]);
  const fade = useTransform(scrollYProgress, [0, 0.92], [1, 0.22]);

  const rows: Array<[string, string]> = [
    ["STATUS", "OPEN FOR COLLAB"],
    ["LOCAL", `${local} · ${timezone}`],
    ["REPOS", gh ? String(gh.repos).padStart(2, "0") : "--"],
    ["STARS", gh ? String(gh.stars).padStart(2, "0") : "--"],
    ["LAST PUSH", relativeFrom(gh?.latestPush ?? null)],
    ["FPS", fps ? String(fps) : "--"],
    ["HEAP", memMB !== null ? `${memMB} MB` : "n/a"],
    ["CORES", cores !== null ? String(cores) : "n/a"],
    ["LINK", net],
    ["VIEWPORT", width ? `${width}×${height}` : "--"],
    ["UPTIME", formatUptime(uptime)],
  ];

  return (
    <section
      id="top"
      ref={ref}
      className="relative overflow-hidden bg-[#F8F9FA]"
    >
      <div className="pointer-events-none absolute inset-0 bg-drafting-grid" />

      {/* sheet edge: sideways drawing label down the left margin */}
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 hidden justify-center lg:flex lg:w-8">
        <span className="text-sideways my-32 font-mono-code text-[9px] tracking-[0.32em] text-zinc-400">
          DRAWING 01 · {IDENTITY.handle} MAINFRAME · SCALE 1:1
        </span>
      </div>

      <div className="relative mx-auto max-w-[1500px] px-5 pb-16 pt-10 sm:px-8 lg:pl-14 lg:pr-16 lg:pt-14">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* ── Masthead ────────────────────────────────────────────── */}
          <motion.div
            style={{ y: yMasthead, opacity: fade }}
            className="reg-cross lg:col-span-7"
          >
            <div className="mb-6 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center border border-[#0D0E12]/15 px-2 py-1 font-tech text-[9px] tracking-[0.14em] text-[#0D0E12]">
                SHEET 01 · REV 3.2.0
              </span>
              <span
                className="inline-flex items-center gap-2 px-2 py-1 font-tech text-[9px] tracking-[0.14em] uppercase text-white"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <span className="h-1.5 w-1.5 bg-white/90" />
                OPEN FOR COLLAB
              </span>
              <span className="font-mono-code text-[10px] text-zinc-500">
                [GITHUB.COM/{IDENTITY.githubHandle} · {PROJECTS.length} REPOS]
              </span>
            </div>

            <h1 className="font-hero text-[2.55rem] leading-[0.98] tracking-[0.01em] text-[#0D0E12] sm:text-[3.5rem] lg:text-[4.3rem] xl:text-[4.9rem]">
              I BUILD THE
              <br />
              THING, THEN
              <br />
              <span className="text-accent">
                <ScrambleText text="TAKE IT APART." />
              </span>
            </h1>

            {/* dimension rule under the masthead */}
            <div
              className="mt-8 flex items-center gap-3"
              style={{ "--datum-ink": "rgba(13,14,18,0.3)" } as CSSProperties}
            >
              <span className="h-3 w-px bg-[#0D0E12]/30" />
              <div className="datum-rule min-w-6 flex-1 self-end" />
              <span className="shrink-0 font-mono-code text-[9px] tracking-[0.2em] text-zinc-400">
                MASTHEAD · AUTO-FIT
              </span>
              <div className="datum-rule min-w-6 flex-1 self-end" />
              <span className="h-3 w-px bg-[#0D0E12]/30" />
            </div>

            <p className="mt-6 max-w-xl font-sub text-sm leading-relaxed text-zinc-600 sm:text-base">
              Full-stack developer by trade, ethical-hacking enthusiast by
              curiosity, AI/ML explorer by night. I ship real-time apps,
              self-hosted tooling and AI products — then open them up to find
              out how they actually work.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/work")}
                data-cursor="EXPLORE"
                className="group relative inline-flex items-center gap-3 py-3.5 pl-4 pr-5 font-tech text-[10px] tracking-[0.14em] text-white transition"
                style={{ backgroundColor: "#0D0E12" }}
              >
                <span
                  className="absolute left-0 top-0 h-full w-1 transition-all group-hover:w-1.5"
                  style={{ backgroundColor: "var(--accent)" }}
                />
                <span className="font-mono-code text-[9px] text-zinc-500 transition group-hover:text-white/70">
                  ▶
                </span>
                PEEK THE STASH ({PROJECTS.length})
                <ArrowDownRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </button>

              <button
                onClick={onAbout}
                data-cursor="VIEW"
                className="inline-flex items-center gap-3 border border-[#0D0E12]/20 px-4 py-3.5 font-tech text-[10px] tracking-[0.14em] text-[#0D0E12] transition hover:border-[#0D0E12] hover:bg-white"
              >
                <User className="h-4 w-4 text-accent" />
                WHO IS BLUD
              </button>
            </div>
          </motion.div>

          {/* ── Live instrument panel ───────────────────────────────── */}
          <motion.div style={{ y: ySpec, opacity: fade }} className="lg:col-span-5">
            <div
              className="fascia relative border border-[#0D0E12]/25 text-zinc-300"
              style={{ boxShadow: "0 30px 70px -34px rgba(13,14,18,0.6)" }}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                <span className="flex items-center gap-2 font-tech text-[9px] tracking-[0.16em] text-zinc-200">
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                  LIVE SPEC
                </span>
                <span className="font-mono-code text-[9px] text-zinc-600">
                  SHEET 01/A · SCALE 1:1
                </span>
              </div>

              <div className="px-3 pt-3">
                <Oscilloscope tone="dark" height={104} />
                <div className="mt-1 flex items-center justify-between font-mono-code text-[8px] tracking-[0.2em] text-zinc-600">
                  <span>TRACE / ACCENT OSC</span>
                  <span>GAIN 1.0</span>
                </div>
              </div>

              <dl className="mt-3 border-t border-white/10 divide-y divide-white/5">
                {rows.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between gap-4 px-3 py-1.5"
                  >
                    <dt className="font-mono-code text-[9px] tracking-[0.14em] text-zinc-500">
                      {k}
                    </dt>
                    <dd className="truncate font-mono-code text-[10px] text-zinc-200 tnum">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="flex items-center justify-between border-t border-white/10 px-3 py-2 font-mono-code text-[8px] tracking-[0.18em] text-zinc-600">
                <span>SOURCE / GITHUB PUBLIC API</span>
                <span>UNAUTHENTICATED</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* base sheet datum */}
        <div
          className="mt-14 flex items-center gap-4"
          style={{ "--datum-ink": "rgba(13,14,18,0.26)" } as CSSProperties}
        >
          <span className="shrink-0 font-mono-code text-[9px] tracking-[0.2em] text-zinc-400">
            BASE SHEET CONTINUES ↓
          </span>
          <div className="datum-rule min-w-6 flex-1 self-end" />
          <span className="hidden shrink-0 font-mono-code text-[9px] tracking-[0.2em] text-zinc-400 sm:inline">
            07 SHEETS · REV 3.2.0
          </span>
        </div>
      </div>
    </section>
  );
}
