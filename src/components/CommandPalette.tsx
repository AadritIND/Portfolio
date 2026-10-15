import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  House,
  Layers,
  User,
  History,
  Mail,
  ShieldCheck,
  FileLock2,
  Copy,
  Volume2,
  VolumeX,
  Zap,
  Github,
  Palette,
  CornerDownLeft,
  Search,
} from "lucide-react";
import { IDENTITY } from "../data/types";
import { soundFX } from "../lib/sound";
import { SKINS, type SkinId } from "../lib/skins";
import { useUiStore } from "../store/ui";

interface Action {
  id: string;
  label: string;
  hint?: string;
  group: "NAVIGATE" | "ACTIONS" | "SKINS";
  icon: React.ReactNode;
  run: () => void;
}

/**
 * Command deck — Ctrl+K / Cmd+K anywhere. Fuzzy-ish filter, keyboard nav,
 * routes, easter-egg toggles and skin switching. The thing that makes this
 * site feel like an OS, not a brochure.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { fxOn, setFxOn, overclock, setOverclock, setSkin } = useUiStore();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const scrollToId = useCallback(
    (id: string) => {
      const go = () =>
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(go, 180);
      } else {
        go();
      }
    },
    [location.pathname, navigate],
  );

  const actions: Action[] = useMemo(
    () => [
      {
        id: "home",
        label: "GO HOME",
        hint: "/",
        group: "NAVIGATE",
        icon: <House className="w-4 h-4" />,
        run: () => navigate("/"),
      },
      {
        id: "work",
        label: "OPEN WORKS CATALOG",
        hint: "/work",
        group: "NAVIGATE",
        icon: <Layers className="w-4 h-4" />,
        run: () => navigate("/work"),
      },
      {
        id: "about",
        label: "WHO IS BLUD — ABOUT",
        hint: "#about",
        group: "NAVIGATE",
        icon: <User className="w-4 h-4" />,
        run: () => scrollToId("about"),
      },
      {
        id: "log",
        label: "TRAJECTORY LOG",
        hint: "#log",
        group: "NAVIGATE",
        icon: <History className="w-4 h-4" />,
        run: () => scrollToId("log"),
      },
      {
        id: "telemetry",
        label: "DAILY COMMIT MATRIX",
        hint: "#telemetry",
        group: "NAVIGATE",
        icon: <Layers className="w-4 h-4" />,
        run: () => scrollToId("telemetry"),
      },
      {
        id: "github-dev",
        label: "GITHUB DEVELOPER PROGRAM",
        hint: "#github-dev",
        group: "NAVIGATE",
        icon: <Github className="w-4 h-4" />,
        run: () => scrollToId("github-dev"),
      },
      {
        id: "contact",
        label: "CONTACT TERMINAL",
        hint: "#contact",
        group: "NAVIGATE",
        icon: <Mail className="w-4 h-4" />,
        run: () => scrollToId("contact"),
      },
      {
        id: "privacy",
        label: "PRIVACY POLICY",
        hint: "/privacy",
        group: "NAVIGATE",
        icon: <ShieldCheck className="w-4 h-4" />,
        run: () => navigate("/privacy"),
      },
      {
        id: "terms",
        label: "TERMS OF OPERATION",
        hint: "/terms",
        group: "NAVIGATE",
        icon: <FileLock2 className="w-4 h-4" />,
        run: () => navigate("/terms"),
      },
      {
        id: "copy-email",
        label: "COPY EMAIL ADDRESS",
        hint: IDENTITY.email,
        group: "ACTIONS",
        icon: <Copy className="w-4 h-4" />,
        run: () => {
          navigator.clipboard.writeText(IDENTITY.email);
          soundFX.playSuccess();
        },
      },
      {
        id: "fx",
        label: fxOn ? "MUTE SOUND FX" : "ENABLE SOUND FX",
        hint: "audio",
        group: "ACTIONS",
        icon: fxOn ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />,
        run: () => setFxOn(soundFX.toggle()),
      },
      {
        id: "overclock",
        label: overclock ? "DISENGAGE OVERCLOCK MODE" : "ENGAGE OVERCLOCK MODE",
        hint: "↑↑↓↓←→←→BA",
        group: "ACTIONS",
        icon: <Zap className="w-4 h-4" />,
        run: () => {
          setOverclock(!overclock);
          soundFX.playCompile();
        },
      },
      {
        id: "github",
        label: "OPEN GITHUB PROFILE",
        hint: "@aadritind",
        group: "ACTIONS",
        icon: <Github className="w-4 h-4" />,
        run: () => window.open(IDENTITY.githubUrl, "_blank", "noopener,noreferrer"),
      },
      ...SKINS.map(
        (s): Action => ({
          id: `skin-${s.id}`,
          label: `SKIN // ${s.name}`,
          hint: s.hex,
          group: "SKINS" as const,
          icon: <Palette className="w-4 h-4" />,
          run: () => setSkin(s.id as SkinId),
        }),
      ),
    ],
    [fxOn, overclock, navigate, scrollToId, setFxOn, setOverclock, setSkin],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.group.toLowerCase().includes(q) ||
        (a.hint ?? "").toLowerCase().includes(q),
    );
  }, [actions, query]);

  // Global hotkey + escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setActive(0);
      } else if (e.key === "Escape" && open) {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Focus input + scroll lock while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
  }, [open]);

  const execute = (action: Action | undefined) => {
    if (!action) return;
    soundFX.playClick();
    close();
    // Let the overlay unmount before scrolling/routing feels snappy
    setTimeout(action.run, 30);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      execute(filtered[active]);
    }
  };

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md flex items-start justify-center px-4"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl mt-[14vh] bg-[#0D0E12]/95 border border-white/15 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 brackets"
          >
            {/* Input row */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
              <Search className="w-4 h-4 text-accent shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="TYPE A COMMAND..."
                spellCheck={false}
                className="flex-1 bg-transparent font-mono-code text-sm text-white placeholder-zinc-600 focus:outline-none tracking-wider"
              />
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[10px] font-mono-code text-zinc-400">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[46vh] overflow-y-auto py-2">
              {filtered.length === 0 && (
                <div className="px-5 py-10 text-center font-mono-code text-xs text-zinc-500">
                  NO SIGNALS MATCHED &quot;{query.toUpperCase()}&quot;
                </div>
              )}
              {filtered.map((a, i) => {
                const showGroup = a.group !== lastGroup;
                lastGroup = a.group;
                return (
                  <div key={a.id}>
                    {showGroup && (
                      <div className="px-5 pt-3 pb-1 font-tech text-[8px] tracking-[0.2em] text-zinc-600">
                        {a.group}
                      </div>
                    )}
                    <button
                      data-idx={i}
                      data-cursor="RUN"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => execute(a)}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors cursor-pointer ${
                        i === active
                          ? "bg-accent/15 border-l-2 border-accent"
                          : "border-l-2 border-transparent hover:bg-white/5"
                      }`}
                    >
                      <span className={i === active ? "text-accent" : "text-zinc-500"}>
                        {a.icon}
                      </span>
                      <span
                        className={`flex-1 font-mono-code text-xs font-semibold tracking-wider ${
                          i === active ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        {a.label}
                      </span>
                      {a.hint && (
                        <span className="font-mono-code text-[10px] text-zinc-600 truncate max-w-[140px]">
                          {a.hint}
                        </span>
                      )}
                      {i === active && (
                        <CornerDownLeft className="w-3.5 h-3.5 text-accent shrink-0" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-white/[0.03] font-mono-code text-[10px] text-zinc-500">
              <span>↑↓ NAVIGATE · ENTER EXECUTE</span>
              <span className="text-zinc-600">AADRIT_DECK v1.0</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
