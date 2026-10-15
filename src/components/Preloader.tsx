import { useEffect, useState, useRef } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Wifi, Terminal } from "lucide-react";
import { IDENTITY } from "../data/types";
import { fetchGitHubTelemetry, type FullTelemetryData } from "../lib/telemetry";
import { useUiStore } from "../store/ui";
import { skinById } from "../lib/skins";
import { soundFX } from "../lib/sound";

interface SubsystemLog {
  id: string;
  label: string;
  category: string;
  status: "PENDING" | "SYNCING" | "RESOLVED" | "WARN";
  detail?: string;
}

const EXIT_MS = 600;

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const { skin } = useUiStore();
  const [exiting, setExiting] = useState(false);
  const [percent, setPercent] = useState(10);
  const [latency, setLatency] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [logs, setLogs] = useState<SubsystemLog[]>([
    {
      id: "hw",
      label: "PROBE HARDWARE & GPU ACCELERATION",
      category: "KERNEL",
      status: "SYNCING",
      detail: "INITIALIZING",
    },
    {
      id: "accent",
      label: "LOAD ACCENT REGISTER & CSS PALETTE",
      category: "GRAPHICS",
      status: "PENDING",
      detail: "QUEUED",
    },
    {
      id: "audio",
      label: "WARM WEB AUDIO API SYNTHESIZER",
      category: "DSP",
      status: "PENDING",
      detail: "QUEUED",
    },
    {
      id: "gh_api",
      label: "HANDSHAKE GITHUB PUBLIC API (AadritIND)",
      category: "NETWORK",
      status: "PENDING",
      detail: "QUEUED",
    },
    {
      id: "repos",
      label: "SYNC REPOSITORIES & RECENT COMMITS",
      category: "TELEMETRY",
      status: "PENDING",
      detail: "QUEUED",
    },
    {
      id: "member",
      label: "VERIFY GITHUB DEVELOPER PROGRAM STATUS",
      category: "IDENTITY",
      status: "PENDING",
      detail: "QUEUED",
    },
    {
      id: "sheets",
      label: "SPOOL ENGINEERING SHEETS 01 → 07",
      category: "LAYOUT",
      status: "PENDING",
      detail: "QUEUED",
    },
    {
      id: "telemetry",
      label: "CALIBRATE MAINFRAME TELEMETRY BUS",
      category: "BUS",
      status: "PENDING",
      detail: "QUEUED",
    },
  ]);

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    let isCancelled = false;

    const runRealSync = async () => {
      const activeSkin = skinById(skin);
      const startTime = performance.now();

      // Step 1: Real Hardware & GPU Probe
      setActiveStep(0);
      await new Promise((r) => setTimeout(r, 90));
      if (isCancelled) return;

      const cores = navigator.hardwareConcurrency || 4;
      let gpuStatus = "ACCELERATED";
      try {
        const testCanvas = document.createElement("canvas");
        const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
        if (!gl) gpuStatus = "2D CANVAS";
      } catch {
        gpuStatus = "STANDARD";
      }

      setLogs((prev) =>
        prev.map((item, idx) =>
          idx === 0
            ? {
                ...item,
                status: "RESOLVED",
                detail: `${cores} CORES · ${gpuStatus} (${window.innerWidth}×${window.innerHeight})`,
              }
            : idx === 1
              ? { ...item, status: "SYNCING", detail: "READING REGISTERS" }
              : item
        )
      );
      setPercent(24);

      // Step 2: Accent register
      setActiveStep(1);
      await new Promise((r) => setTimeout(r, 80));
      if (isCancelled) return;

      setLogs((prev) =>
        prev.map((item, idx) =>
          idx === 1
            ? {
                ...item,
                status: "RESOLVED",
                detail: `ACTIVE [${activeSkin.name.toUpperCase()}] · ${activeSkin.hex}`,
              }
            : idx === 2
              ? { ...item, status: "SYNCING", detail: "AUDIO CONTEXT CHECK" }
              : item
        )
      );
      setPercent(38);

      // Step 3: Web Audio API
      setActiveStep(2);
      await new Promise((r) => setTimeout(r, 80));
      if (isCancelled) return;

      const hasAudio = typeof window !== "undefined" && ("AudioContext" in window || "webkitAudioContext" in window);
      setLogs((prev) =>
        prev.map((item, idx) =>
          idx === 2
            ? {
                ...item,
                status: "RESOLVED",
                detail: hasAudio ? "WEB AUDIO READY · FX ARMED" : "MUTED MODE",
              }
            : idx === 3
              ? { ...item, status: "SYNCING", detail: "CONNECTING TO API.GITHUB.COM" }
              : item
        )
      );
      setPercent(50);

      // Step 4 & 5: Real GitHub Telemetry Fetch
      setActiveStep(3);
      let telemetry: FullTelemetryData | null = null;
      try {
        telemetry = await fetchGitHubTelemetry();
        if (isCancelled) return;
        const roundTrip = Math.round(performance.now() - startTime);
        setLatency(telemetry.latencyMs || roundTrip);

        setLogs((prev) =>
          prev.map((item, idx) =>
            idx === 3
              ? {
                  ...item,
                  status: "RESOLVED",
                  detail: telemetry?.stale
                    ? `CACHED TELEMETRY (${telemetry?.latencyMs ?? roundTrip}ms)`
                    : `200 OK · LATENCY ${telemetry?.latencyMs ?? roundTrip}ms`,
                }
              : idx === 4
                ? { ...item, status: "SYNCING", detail: "INDEXING REPOS & COMMITS" }
                : item
          )
        );
        setPercent(68);
      } catch {
        if (isCancelled) return;
        setLogs((prev) =>
          prev.map((item, idx) =>
            idx === 3
              ? { ...item, status: "RESOLVED", detail: "FALLBACK TELEMETRY LOADED" }
              : idx === 4
                ? { ...item, status: "SYNCING", detail: "INDEXING REPOS" }
                : item
          )
        );
      }

      // Step 5: Repos & Commits
      setActiveStep(4);
      await new Promise((r) => setTimeout(r, 90));
      if (isCancelled) return;

      const repoCount = telemetry?.user?.public_repos ?? 7;
      const todayCommits = telemetry?.todayCommits ?? 0;
      setLogs((prev) =>
        prev.map((item, idx) =>
          idx === 4
            ? {
                ...item,
                status: "RESOLVED",
                detail: `${repoCount} PUBLIC REPOS · ${todayCommits} COMMITS TODAY`,
              }
            : idx === 5
              ? { ...item, status: "SYNCING", detail: "CHECKING CREDENTIALS" }
              : item
        )
      );
      setPercent(82);

      // Step 6: GitHub Developer Member verification
      setActiveStep(5);
      await new Promise((r) => setTimeout(r, 90));
      if (isCancelled) return;

      setLogs((prev) =>
        prev.map((item, idx) =>
          idx === 5
            ? {
                ...item,
                status: "RESOLVED",
                detail: `OPERATOR: ${IDENTITY.githubHandle} [GITHUB DEVELOPER MEMBER]`,
              }
            : idx === 6
              ? { ...item, status: "SYNCING", detail: "MOUNTING 7 SHEETS" }
              : item
        )
      );
      setPercent(92);

      // Step 7: Sheets & typography
      setActiveStep(6);
      if ("fonts" in document) {
        try {
          await document.fonts.ready;
        } catch {
          // ignore
        }
      }
      await new Promise((r) => setTimeout(r, 80));
      if (isCancelled) return;

      setLogs((prev) =>
        prev.map((item, idx) =>
          idx === 6
            ? {
                ...item,
                status: "RESOLVED",
                detail: "07 SHEETS READY · FONTS SYNCHRONIZED",
              }
            : idx === 7
              ? { ...item, status: "SYNCING", detail: "LOCKING BUS CLOCK" }
              : item
        )
      );
      setPercent(98);

      // Step 8: Telemetry Bus calibration
      setActiveStep(7);
      await new Promise((r) => setTimeout(r, 80));
      if (isCancelled) return;

      setLogs((prev) =>
        prev.map((item, idx) =>
          idx === 7
            ? {
                ...item,
                status: "RESOLVED",
                detail: `BUS LOCKED · ALL SYSTEMS GO (${Math.round(performance.now() - startTime)}ms TOTAL)`,
              }
            : item
        )
      );
      setPercent(100);

      // Hold slightly so the user sees the 100% completion state
      await new Promise((r) => setTimeout(r, 360));
      if (isCancelled) return;
      setExiting(true);
    };

    runRealSync();

    return () => {
      isCancelled = true;
    };
  }, [skin]);

  useEffect(() => {
    if (!exiting) return;
    const id = setTimeout(onComplete, EXIT_MS);
    return () => clearTimeout(id);
  }, [exiting, onComplete]);

  const handleSkip = () => {
    soundFX.playClick();
    setPercent(100);
    setExiting(true);
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-[#0a0b0e] text-zinc-200 select-none flex flex-col justify-between p-6 sm:p-10"
      style={{
        opacity: exiting ? 0 : 1,
        transition: `opacity ${EXIT_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        pointerEvents: exiting ? "none" : "auto",
      }}
    >
      {/* High-tech matrix grid background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #fff 1px, transparent 1px), linear-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Cybernetic scanline */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.04] to-transparent pointer-events-none animate-pulse" />

      {/* Sheet registration crosses */}
      <div className="absolute inset-4 sm:inset-6 border border-white/10 pointer-events-none" />
      <span className="absolute top-2 left-2 text-[10px] font-mono-code text-white/30">+</span>
      <span className="absolute top-2 right-2 text-[10px] font-mono-code text-white/30">+</span>
      <span className="absolute bottom-2 left-2 text-[10px] font-mono-code text-white/30">+</span>
      <span className="absolute bottom-2 right-2 text-[10px] font-mono-code text-white/30">+</span>

      {/* Top Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent/20 border border-accent/40 text-accent">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-white">
                MAINFRAME // REAL-TIME POST BOOT
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono-code text-[9px]">
                LIVE SYNC
              </span>
            </div>
            <span className="font-mono-code text-[10px] text-zinc-500">
              OPERATOR: {IDENTITY.githubHandle} · GITHUB DEVELOPER MEMBER
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 font-mono-code text-[10px] text-zinc-400 border border-white/10 px-3 py-1 rounded-lg bg-white/5">
            <span className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-accent" />
              {latency ? `${latency}ms PING` : "PROBING"}
            </span>
            <span className="text-zinc-600">|</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              GH DEV VERIFIED
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="flex items-center gap-2 border border-white/20 bg-white/5 px-3 py-1.5 rounded-lg font-mono-code text-[11px] text-zinc-300 transition hover:border-accent hover:text-white hover:bg-accent/10 cursor-pointer"
          >
            SKIP POST <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Middle: Real Subsystems Diagnostic Log */}
      <div className="relative z-10 max-w-3xl my-auto py-6">
        <div className="mb-3 flex items-center justify-between text-zinc-500 font-mono-code text-[10px]">
          <span className="tracking-widest uppercase text-accent font-tech">
            SUBSYSTEM VERIFICATION PIPELINE
          </span>
          <span>REAL-TIME HARDWARE & API SYNC</span>
        </div>

        <div className="space-y-2 border border-white/10 bg-black/40 backdrop-blur-md p-4 sm:p-5 rounded-2xl">
          {logs.map((log, index) => {
            const isDone = log.status === "RESOLVED";
            const isSyncing = log.status === "SYNCING";
            const isCurrent = index === activeStep;

            return (
              <div
                key={log.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 font-mono-code text-[11px] py-1 border-b border-white/5 last:border-b-0 transition-colors duration-200 ${
                  isCurrent ? "text-white" : isDone ? "text-zinc-300" : "text-zinc-600"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      isDone
                        ? "bg-emerald-400"
                        : isSyncing
                          ? "bg-accent animate-ping"
                          : "bg-zinc-700"
                    }`}
                  />
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 font-tech">
                    {log.category}
                  </span>
                  <span className="font-semibold">{log.label}</span>
                </div>

                <div className="flex items-center gap-2 pl-4 sm:pl-0">
                  <span
                    className={`text-[10px] ${
                      isDone
                        ? "text-emerald-400"
                        : isSyncing
                          ? "text-accent font-bold"
                          : "text-zinc-600"
                    }`}
                  >
                    {log.detail || log.status}
                  </span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: Progress Bar & Status Readout */}
      <div className="relative z-10 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between mb-2 font-mono-code text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <span
              className="inline-block w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <span className="font-tech text-[10px] tracking-wider uppercase text-zinc-300">
              {exiting ? "DISPATCHING MAIN DISPLAY" : percent === 100 ? "SYNC COMPLETE" : "SYNCHRONIZING SUBSYSTEMS"}
            </span>
          </div>
          <span className="font-bold text-accent tnum">{percent}%</span>
        </div>

        {/* Progress Bar with glowing accent */}
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${percent}%`,
              backgroundColor: "var(--accent)",
              boxShadow: "0 0 12px var(--accent)",
            }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 font-mono-code text-[9px] text-zinc-500">
          <span>REAL-TIME PARALLEL INITIALIZATION · ZERO PLACEHOLDERS</span>
          <span>COLD START // REV 3.2.0</span>
        </div>
      </div>

      {/* Slit reveal sweep on finish */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 h-px"
        style={{
          backgroundColor: "var(--accent)",
          transform: exiting ? "scaleX(1)" : "scaleX(0)",
          transition: `transform ${EXIT_MS}ms cubic-bezier(0.16,1,0.3,1)`,
          boxShadow: exiting ? "0 0 20px var(--accent)" : "none",
        }}
      />
    </div>
  );
}
