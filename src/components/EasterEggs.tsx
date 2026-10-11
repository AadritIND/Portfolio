import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Zap, Radio } from "lucide-react";
import { getAccentHex } from "../lib/skins";
import { soundFX } from "../lib/sound";
import { useUiStore } from "../store/ui";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

interface Toast {
  id: number;
  title: string;
  sub?: string;
  icon: "zap" | "radio";
}

/**
 * Hidden layer — konami code engages OVERCLOCK MODE (CRT scanlines, fast
 * marquee, flicker), typing "aadrit" pings back. Toasts keep it self-contained.
 */
export default function EasterEggs() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { overclock, setOverclock } = useUiStore();
  const seqRef = useRef<string[]>([]);
  const nameBuf = useRef("");
  const toastId = useRef(0);

  const pushToast = useCallback((title: string, sub?: string, icon: Toast["icon"] = "zap") => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, title, sub, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  const toggleOverclock = useCallback(() => {
    const next = !overclock;
    setOverclock(next);
    if (next) {
      soundFX.playCompile();
      confetti({
        particleCount: 90,
        spread: 100,
        origin: { y: 0.6 },
        colors: [getAccentHex(), "#0D0E12", "#FFFFFF"],
      });
      pushToast("OVERCLOCK MODE ENGAGED", "fans spinning at maximum respect", "zap");
    } else {
      soundFX.playClick();
      pushToast("CLOCK SPEEDS RESTORED", "was getting hot in here", "zap");
    }
  }, [overclock, setOverclock, pushToast]);

  useEffect(() => {
    const isTypingTarget = (t: EventTarget | null) =>
      t instanceof HTMLElement &&
      (t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT" ||
        t.isContentEditable);

    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      // Konami tracker
      seqRef.current = [...seqRef.current, e.key].slice(-KONAMI.length);
      if (seqRef.current.length === KONAMI.length &&
          seqRef.current.every((k, i) => k.toLowerCase() === KONAMI[i].toLowerCase())) {
        seqRef.current = [];
        toggleOverclock();
        return;
      }

      // Typed name easter egg
      if (e.key.length === 1) {
        nameBuf.current = (nameBuf.current + e.key.toLowerCase()).slice(-10);
        if (nameBuf.current.endsWith("aadrit")) {
          nameBuf.current = "";
          soundFX.playSuccess();
          pushToast("SUP. THAT'S ME.", "you typed my name into a portfolio. respect.", "radio");
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleOverclock, pushToast]);

  return (
    <>
      {/*
       * OVERCLOCK overlay — CRT scanlines + roaming sweep + accent vignette.
       * Always mounted, opacity-driven: AnimatePresence exit unmount stalls on
       * React 19 (same family as the About tab bug), so we don't rely on it.
       */}
      <motion.div
        initial={false}
        animate={{ opacity: overclock ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[65] pointer-events-none"
        style={{ visibility: overclock ? "visible" : "hidden" }}
      >
        <div className="absolute inset-0 bg-scanlines opacity-60 mix-blend-multiply" />
        <div className="absolute inset-0 animate-scan-sweep bg-gradient-to-b from-transparent via-accent/10 to-transparent h-[30vh]" />
        <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.55)]" />
      </motion.div>

      {/* Toast stack — entry springs only; removal unmounts instantly */}
      <div className="fixed bottom-6 right-6 z-[80] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="glass-panel-dark rounded-2xl px-4 py-3 flex items-start gap-3 max-w-xs pointer-events-auto"
          >
              <div className="p-2 rounded-xl bg-accent/15 text-accent shrink-0">
                {t.icon === "zap" ? <Zap className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="font-tech text-[10px] tracking-[0.12em] text-white">
                  {t.title}
                </p>
                {t.sub && (
                  <p className="font-mono-code text-[10px] text-zinc-400 mt-1 leading-relaxed">
                    {t.sub}
                  </p>
                )}
              </div>
            </motion.div>
        ))}
      </div>
    </>
  );
}
