import { useEffect, useState, type CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Command,
  Volume2,
  VolumeX,
} from "lucide-react";
import { IDENTITY } from "../data/types";
import { useUiStore } from "../store/ui";
import { SKINS, skinById, withAlpha } from "../lib/skins";
import { soundFX } from "../lib/sound";
import {
  formatUptime,
  readTelemetryCache,
  relativeFrom,
  useSystemReadout,
  type TelemetryCache,
} from "../lib/telemetry";

interface NavItem {
  id: string;
  index: string;
  label: string;
  /** Route to land on, if not the current one. */
  to?: string;
  /** Scroll target on the home page. */
  anchor?: string;
}

const NAV: NavItem[] = [
  { id: "base", index: "01", label: "BASE", to: "/" },
  { id: "works", index: "02", label: "WORKS", to: "/work" },
  { id: "about", index: "03", label: "ABOUT", to: "/", anchor: "about" },
  { id: "log", index: "04", label: "LOG", to: "/", anchor: "log" },
  { id: "activity", index: "05", label: "COMMITS", to: "/", anchor: "telemetry" },
  { id: "gh_dev", index: "06", label: "GH DEV", to: "/", anchor: "github-dev" },
  { id: "connect", index: "07", label: "CONNECT", to: "/", anchor: "contact" },
];

/**
 * Scroll-spy map: DOM section id → the nav tab it belongs to.
 */
const SPY: Array<{ nav: string; dom: string }> = [
  { nav: "about", dom: "about" },
  { nav: "log", dom: "log" },
  { nav: "activity", dom: "telemetry" },
  { nav: "gh_dev", dom: "github-dev" },
  { nav: "connect", dom: "contact" },
];

/**
 * MainframeBus — the site's chrome. A dark instrument fascia across the top:
 * numbered section tabs on the left, live readouts on the right, and a scrolling
 * telemetry bus underneath carrying real numbers (fps, heap, link class,
 * viewport, clock, GitHub figures). Always dark, on every page — the machine
 * panel the light drawing sheets hang from.
 */
export default function MainframeBus({
  context = "home",
}: {
  context?: "home" | "work";
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { fxOn, setFxOn, skin, setSkin, overclock } = useUiStore();
  const { fps, memMB, cores, net, width, height, utc, local, uptime, timezone } =
    useSystemReadout();

  const [gh, setGh] = useState<TelemetryCache | null>(() =>
    readTelemetryCache(),
  );
  const [active, setActive] = useState(context === "work" ? "works" : "base");
  const [scrollPct, setScrollPct] = useState(0);

  // GitHub numbers only change every few minutes — poll the shared cache.
  useEffect(() => {
    const id = setInterval(() => setGh(readTelemetryCache()), 15000);
    return () => clearInterval(id);
  }, []);

  // Scroll-spy for the home sections + page progress hairline.
  useEffect(() => {
    if (context === "work") {
      setActive("works");
      return;
    }
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setScrollPct(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);

      if (window.scrollY < 240) {
        setActive("base");
        return;
      }
      let current = "base";
      for (const { nav, dom } of SPY) {
        const el = document.getElementById(dom);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.45) {
          current = nav;
        }
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [context]);

  const go = (item: NavItem) => {
    soundFX.playClick();
    const onHome = location.pathname === "/";
    if (item.id === "works") {
      navigate("/work");
      return;
    }
    if (item.id === "base") {
      if (onHome) window.scrollTo({ top: 0, behavior: "smooth" });
      else navigate("/");
      return;
    }
    const anchor = item.anchor;
    if (!anchor) return;
    if (onHome) {
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
      }, 140);
    }
  };

  const openPalette = () => {
    soundFX.playClick();
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }),
    );
  };

  const cycleSkin = () => {
    const i = SKINS.findIndex((s) => s.id === skin);
    const next = SKINS[(i + 1) % SKINS.length];
    setSkin(next.id);
    soundFX.playHover();
  };

  const accentHex = skinById(skin).hex;

  const segments: Array<[string, string]> = [
    ["BUILD", "v3.2.0"],
    ["REGISTER", skinById(skin).name],
    ["REPOS", gh ? String(gh.repos).padStart(2, "0") : "--"],
    ["STARS", gh ? String(gh.stars).padStart(2, "0") : "--"],
    ["LAST PUSH", relativeFrom(gh?.latestPush ?? null)],
    ["FPS", fps ? String(fps) : "--"],
    ["HEAP", memMB !== null ? `${memMB}MB` : "N/A"],
    ["CORES", cores !== null ? String(cores) : "N/A"],
    ["LINK", net],
    ["VIEWPORT", width ? `${width}x${height}` : "--"],
    ["TZ", timezone],
    ["LOCAL", local],
    ["UTC", utc],
    ["UPTIME", formatUptime(uptime)],
    overclock ? ["MODE", "OVERCLOCK"] : ["MODE", "NOMINAL"],
  ];

  const TickerRow = () => (
    <div className="flex items-center shrink-0">
      {segments.map(([k, v], i) => (
        <span
          key={`${k}-${i}`}
          className="flex items-center gap-1.5 px-4 font-mono-code text-[10px] whitespace-nowrap"
        >
          <span className="text-zinc-600">{k}</span>
          <span className="text-zinc-300 tnum">{v}</span>
          <span className="text-zinc-700 pl-1">▚</span>
        </span>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* ── Fascia: brand · section tabs · readouts ─────────────────────── */}
      <div className="fascia border-b border-white/10">
        <div className="mx-auto flex h-12 max-w-[1600px] items-center gap-2 px-3 sm:px-5">
          {/* Brand (home) / exit (work) */}
          {context === "work" ? (
            <button
              onClick={() => {
                soundFX.playClick();
                navigate("/");
              }}
              data-cursor="GO"
              className="group flex shrink-0 items-center gap-2 border border-white/15 bg-white/5 px-2.5 py-1.5 font-tech text-[9px] tracking-[0.12em] text-zinc-200 transition hover:border-accent hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>EXIT TO BASE</span>
            </button>
          ) : (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              data-cursor="TOP"
              className="flex shrink-0 items-center gap-2.5 group cursor-pointer"
            >
              <span
                className="h-7 w-7 overflow-hidden border"
                style={{ borderColor: withAlpha(accentHex, 0.55) }}
              >
                <img
                  src={IDENTITY.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition"
                />
              </span>
              <span className="hidden flex-col items-start leading-none sm:flex">
                <span className="font-tech text-[10px] tracking-[0.16em] text-zinc-100">
                  {IDENTITY.handle}
                </span>
                <span className="font-mono-code text-[8px] tracking-[0.18em] text-zinc-500">
                  MAINFRAME {IDENTITY.role}
                </span>
              </span>
            </button>
          )}

          <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />

          {/* Section tabs */}
          <nav className="flex min-w-0 flex-1 items-center overflow-x-auto">
            {NAV.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => go(item)}
                  data-cursor="NAV"
                  aria-current={isActive ? "page" : undefined}
                  className="relative shrink-0 px-2.5 py-1.5 font-tech text-[9px] tracking-[0.12em] transition-colors sm:px-3 sm:text-[10px]"
                  style={{ color: isActive ? accentHex : "rgb(161 161 170)" }}
                >
                  <span className="mr-1.5 hidden font-mono-code text-[8px] opacity-50 md:inline">
                    {item.index}
                  </span>
                  {item.label}
                  <span
                    className="absolute inset-x-1.5 bottom-0 h-[2px] transition-opacity"
                    style={{
                      backgroundColor: accentHex,
                      opacity: isActive ? 1 : 0,
                    }}
                  />
                </button>
              );
            })}
          </nav>

          {/* Readouts */}
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="hidden items-center gap-1.5 border border-white/10 bg-black/40 px-2 py-1 font-mono-code text-[10px] text-zinc-400 md:inline-flex">
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ backgroundColor: accentHex }}
              />
              <span className="tnum text-zinc-200">{utc}</span>
              <span className="text-zinc-600">UTC</span>
            </span>

            <button
              onClick={cycleSkin}
              title={`Accent register: ${skinById(skin).name} — click to cycle`}
              className="hidden items-center gap-1.5 border border-white/10 bg-black/40 px-2 py-1 font-mono-code text-[10px] text-zinc-400 transition hover:border-accent hover:text-zinc-100 sm:inline-flex"
            >
              <span
                className="h-2.5 w-2.5"
                style={{ backgroundColor: accentHex }}
              />
              <span className="hidden lg:inline">{skinById(skin).name}</span>
            </button>

            <button
              onClick={() => setFxOn(soundFX.toggle())}
              title={fxOn ? "Mute SFX" : "Enable SFX"}
              className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono-code text-[10px] transition ${
                fxOn
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-white/10 bg-black/40 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {fxOn ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
              <span className="hidden lg:inline">FX</span>
            </button>

            <button
              onClick={openPalette}
              title="Open the command deck (Ctrl/⌘ + K)"
              className="inline-flex items-center gap-1.5 border border-white/10 bg-black/40 px-2 py-1 font-mono-code text-[10px] text-zinc-400 transition hover:border-accent hover:text-zinc-100"
            >
              <Command className="h-3.5 w-3.5" />
              <kbd className="hidden lg:inline">Ctrl K</kbd>
            </button>

            <a
              href={IDENTITY.githubUrl}
              target="_blank"
              rel="noreferrer"
              title="github.com/AadritIND"
              className="inline-flex items-center gap-1.5 border px-2 py-1 font-tech text-[9px] tracking-[0.12em] transition"
              style={{
                borderColor: withAlpha(accentHex, 0.5),
                backgroundColor: withAlpha(accentHex, 0.14),
                color: accentHex,
              }}
            >
              <span className="hidden sm:inline">GITHUB</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* page progress hairline */}
        {context === "home" && (
          <div className="h-[2px] w-full bg-white/5">
            <div
              className="h-full"
              style={{
                width: `${scrollPct * 100}%`,
                backgroundColor: accentHex,
                transition: "width 0.1s linear",
              }}
            />
          </div>
        )}
      </div>

      {/* ── Telemetry bus: real numbers, always moving ───────────────────── */}
      <div className="flex h-7 items-center overflow-hidden border-b border-white/10 bg-[#0d0e12]">
        <span className="z-10 flex h-full shrink-0 items-center gap-1.5 border-r border-white/10 bg-[#0d0e12] px-3 font-tech text-[9px] tracking-[0.16em] text-zinc-400">
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ backgroundColor: accentHex }}
          />
          LIVE BUS
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div
            className="animate-marquee"
            style={{ "--marquee-speed": "46s" } as CSSProperties}
          >
            <TickerRow />
            <TickerRow />
          </div>
        </div>
        <span className="z-10 hidden h-full shrink-0 items-center border-l border-white/10 bg-[#0d0e12] px-3 font-mono-code text-[9px] text-zinc-500 md:flex">
          {IDENTITY.githubHandle}
        </span>
      </div>
    </header>
  );
}
