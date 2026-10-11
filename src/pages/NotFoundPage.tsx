import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Layers } from "lucide-react";
import ScrambleText from "../components/ScrambleText";

/**
 * 404 — SIGNAL LOST. Glitched numeral, the dead route echoed back, and a
 * hex-dump strip for flavor. Same dark systems aesthetic as /work.
 */
export default function NotFoundPage() {
  const location = useLocation();

  useEffect(() => {
    document.title = "404 — SIGNAL LOST // AADRIT";
    return () => {
      document.title = "AADRIT — Full-Stack Developer, Cybersecurity & AI/ML Explorer";
    };
  }, []);

  const hexDump = useMemo(
    () =>
      Array.from({ length: 8 }, () =>
        Array.from({ length: 6 }, () =>
          Math.floor(Math.random() * 256)
            .toString(16)
            .padStart(2, "0"),
        ).join(" "),
      ),
    [],
  );

  return (
    <div className="min-h-screen bg-[#0D0E12] text-white relative overflow-hidden flex flex-col selection:bg-accent selection:text-white">
      <div className="absolute inset-0 bg-noise opacity-[0.04] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <div className="font-tech text-[9px] tracking-[0.25em] text-accent mb-6 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            ERROR // ROUTE NOT FOUND IN ARCHITECTURE
          </div>

          <h1
            className="text-glitch font-accent text-[100px] sm:text-[160px] leading-none text-white select-none"
            data-text="404"
          >
            404
          </h1>

          <p className="font-display font-bold text-xl sm:text-2xl mt-8 mb-3">
            <ScrambleText text="SIGNAL LOST." />
          </p>

          <p className="font-mono-code text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
            the path{" "}
            <span className="text-accent break-all">{location.pathname}</span>{" "}
            doesn&apos;t route to anything. either it was moved, renamed, or
            you typed it in with your elbow.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            <Link
              to="/"
              data-cursor="GO"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent hover:bg-accent/85 text-white font-tech text-[10px] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO BASE</span>
            </Link>
            <Link
              to="/work"
              data-cursor="VIEW"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 text-zinc-200 font-tech text-[10px] transition"
            >
              <Layers className="w-4 h-4" />
              <span>VIEW WORKS INSTEAD</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Fake hex dump footer strip */}
      <div className="relative z-10 border-t border-white/10 bg-black/40 py-3 overflow-hidden select-none">
        <div className="max-w-7xl mx-auto px-6 font-mono-code text-[9px] text-zinc-700 flex flex-wrap gap-x-6 gap-y-1 justify-center">
          {hexDump.map((row, i) => (
            <span key={i} className="whitespace-nowrap">
              <span className="text-zinc-800">0x{(i * 48).toString(16).padStart(4, "0")}</span>{" "}
              {row}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
