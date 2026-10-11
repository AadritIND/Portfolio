import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Rows3, Terminal as TerminalIcon } from "lucide-react";
import ParticleField from "../components/ParticleField";
import MainframeBus from "../components/MainframeBus";
import DatumRuler from "../components/DatumRuler";
import WorksGrid from "../components/work/WorksGrid";
import Terminal from "../components/work/Terminal";
import CodeModal from "../components/work/CodeModal";
import SpecTable from "../components/work/SpecTable";
import { soundFX } from "../lib/sound";
import { PROJECTS } from "../data/projects";
import type { Project } from "../data/types";

/**
 * /work — dark systems-catalog page. The top mainframe bus carries the nav,
 * clock and FX switch; the page itself is the catalog: hero stats row,
 * BENTO/TERMINAL perspective switcher (keys 1 and 2), and the code-inspect
 * modal.
 */
export default function WorkPage() {
  const [view, setView] = useState("BENTO_GRID");
  const [inspectProject, setInspectProject] = useState<Project | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "1") {
        setView("BENTO_GRID");
        soundFX.playClick();
      } else if (e.key === "2") {
        setView("TERMINAL_CLI");
        soundFX.playClick();
      } else if (e.key === "3") {
        setView("SPEC_TABLE");
        soundFX.playClick();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0E12] text-white relative selection:bg-accent selection:text-white overflow-x-hidden">
      <ParticleField />
      <div className="pointer-events-none fixed inset-0 bg-drafting-grid-dark" />
      <DatumRuler tone="dark" label="WORKS // SHEET 02" />

      <MainframeBus context="work" />

      <main className="relative z-10 w-full px-4 sm:px-8 pt-10 pb-28">
        {/* Hero */}
        <section className="max-w-7xl mx-auto mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-md bg-accent/20 border border-accent/40 text-accent font-tech text-[9px] tracking-[0.12em] uppercase">
                  SYSTEMS CATALOG // v3.2
                </span>
                <span className="text-zinc-500 font-mono-code text-xs">
                  {PROJECTS.length} REPOSITORIES VERIFIED
                </span>
              </div>
              <h1 className="font-hero font-normal text-4xl sm:text-6xl lg:text-7xl text-white tracking-[0.04em] leading-[1.1]">
                ENGINEERED WORKS.
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 font-tech text-[9px]">
              <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-zinc-500 block text-[10px]">
                  TOTAL ARTIFACTS
                </span>
                <span className="text-white font-bold">
                  {PROJECTS.length} REPOSITORIES
                </span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-zinc-500 block text-[10px]">
                  CORE DOMAINS
                </span>
                <span className="text-emerald-400 font-bold">
                  WEB · APPS · TOOLS · AI
                </span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-zinc-500 block text-[10px]">STATUS</span>
                <span className="text-accent font-bold">ALL SYSTEMS LIVE</span>
              </div>
            </div>
          </div>
        </section>

        {/* View switcher */}
        <section className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 bg-[#12131A] border border-white/10 rounded-2xl">
            <span className="font-mono-code text-xs text-zinc-400 px-3">
              SELECT INTERFACE PERSPECTIVE:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => {
                  setView("BENTO_GRID");
                  soundFX.playClick();
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono-code text-xs font-bold transition cursor-pointer ${
                  view === "BENTO_GRID"
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>BENTO CATALOG (3D TILT)</span>
                <kbd className="text-[10px] opacity-60 bg-black/30 px-1.5 py-0.5 rounded">
                  1
                </kbd>
              </button>
              <button
                onClick={() => {
                  setView("TERMINAL_CLI");
                  soundFX.playClick();
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono-code text-xs font-bold transition cursor-pointer ${
                  view === "TERMINAL_CLI"
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <TerminalIcon className="w-3.5 h-3.5" />
                <span>HACKER TERMINAL CLI</span>
                <kbd className="text-[10px] opacity-60 bg-black/30 px-1.5 py-0.5 rounded">
                  2
                </kbd>
              </button>
              <button
                onClick={() => {
                  setView("SPEC_TABLE");
                  soundFX.playClick();
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono-code text-xs font-bold transition cursor-pointer ${
                  view === "SPEC_TABLE"
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Rows3 className="w-3.5 h-3.5" />
                <span>PARTS LIST (LIVE)</span>
                <kbd className="text-[10px] opacity-60 bg-black/30 px-1.5 py-0.5 rounded">
                  3
                </kbd>
              </button>
            </div>
          </div>
        </section>

        {/*
         * Views — keyed wrapper remounts on switch so the enter animation
         * always plays (avoids AnimatePresence mode="wait" stalls on React 19).
         */}
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {view === "BENTO_GRID" ? (
            <WorksGrid onInspectCode={setInspectProject} />
          ) : view === "TERMINAL_CLI" ? (
            <Terminal />
          ) : (
            <SpecTable />
          )}
        </motion.div>
      </main>

      <CodeModal project={inspectProject} onClose={() => setInspectProject(null)} />
    </div>
  );
}
