import { motion } from "framer-motion";
import { Terminal, Router, Rocket, Bug, BrainCircuit, Flag } from "lucide-react";
import SheetTag from "./SheetTag";

const ENTRIES = [
  {
    phase: "PHASE 01",
    title: "FIRST CONTACT",
    icon: <Terminal className="w-4 h-4" />,
    story:
      "Found out you could right-click a webpage and hit View Source, and the internet just... showed you its insides. Never recovered from that. Started copy-pasting HTML into Notepad and breaking it on purpose to see what happened.",
  },
  {
    phase: "PHASE 02",
    title: "THE ROUTER INCIDENT",
    icon: <Router className="w-4 h-4" />,
    story:
      "Spent an entire weekend bricking — and un-bricking — the family router to understand what NAT, port forwarding and DHCP actually do. Nobody in the house was happy. I was having the time of my life.",
  },
  {
    phase: "PHASE 03",
    title: "SHIP IT",
    icon: <Rocket className="w-4 h-4" />,
    story:
      "First real deploys went live: filemorph and printbridge. Watching a document travel from my phone through my own self-hosted print server and come out of an actual physical printer hit different. That's when infra clicked.",
  },
  {
    phase: "PHASE 04",
    title: "THE DARK SIDE",
    icon: <Bug className="w-4 h-4" />,
    story:
      "Picked up Kali, Burp Suite and a lab environment. Learned that breaking things legally teaches you more about building them than any tutorial ever will. Recon → exploit → report → patch. Repeat.",
  },
  {
    phase: "PHASE 05",
    title: "AI TAKEOVER",
    icon: <BrainCircuit className="w-4 h-4" />,
    story:
      "Built prompt-forge with 5 pluggable AI backends and wired agents into every corner of my workflow. Now I spend my days reviewing code written by machines and occasionally dreaming in tokens. No regrets.",
  },
  {
    phase: "PHASE 06",
    title: "NOW",
    icon: <Flag className="w-4 h-4" />,
    story:
      "conduit is live with E2E-encrypted rooms, FormulaVault carries 833 formulas offline, and the log keeps appending. Open for collabs — bring something weird.",
  },
];

/**
 * TRAJECTORY LOG — vertical timeline of how this developer actually happened.
 * Alternating desktop rail, single-column mobile, scroll reveals.
 */
export default function Timeline() {
  return (
    <section id="log" className="py-24 px-4 sm:px-8 bg-[#0D0E12] text-white border-t border-white/10 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-[0.035] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <SheetTag
          sheet="04"
          label="TRAJECTORY LOG"
          meta={["APPEND-ONLY", "REV 3.2.0"]}
          tone="dark"
          className="mb-10"
        />
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16 pb-8 border-b border-white/10">
          <div>
            <span className="font-tech text-[9px] uppercase tracking-[0.2em] text-accent mb-3 block">
              TRAJECTORY LOG // APPEND-ONLY
            </span>
            <h2 className="font-display font-normal text-4xl sm:text-6xl text-white tracking-[0.04em] leading-[1.1]">
              HOW I GOT HERE.
            </h2>
          </div>
          <p className="font-mono-code text-xs text-zinc-500 max-w-xs leading-relaxed md:text-right">
            // no sponsored growth story. just the actual sequence of events,
            in order, unedited.
          </p>
        </div>

        {/* Rail */}
        <div className="relative">
          <div className="absolute left-[19px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-white/10" />
          <div className="absolute left-[19px] md:left-1/2 md:-translate-x-1/2 top-0 w-px h-16 bg-accent animate-pulse" />

          <div className="space-y-12 md:space-y-16">
            {ENTRIES.map((entry, i) => {
              const leftSide = i % 2 === 0;
              return (
                <motion.div
                  key={entry.phase}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative flex flex-col md:flex-row gap-4 md:gap-0 ${
                    leftSide ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Node */}
                  <div className="absolute left-[19px] md:left-1/2 top-1 -translate-x-1/2 z-10">
                    <div className="w-10 h-10 rounded-xl bg-[#14151C] border border-white/15 flex items-center justify-center text-accent shadow-lg shadow-black/40 brackets">
                      {entry.icon}
                    </div>
                  </div>

                  {/* Spacer for the other half */}
                  <div className="hidden md:block md:w-1/2" />

                  {/* Card */}
                  <div className="md:w-1/2 pl-14 md:pl-0">
                    <div
                      className={`relative bg-[#14151C] border border-white/10 rounded-2xl p-6 hover:border-accent/50 transition-colors ${
                        leftSide ? "md:mr-10" : "md:ml-10"
                      }`}
                    >
                      {/* connector */}
                      <div
                        className={`hidden md:block absolute top-7 w-10 h-px bg-white/15 ${
                          leftSide ? "-right-10" : "-left-10"
                        }`}
                      />
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono-code text-[10px] text-accent font-bold tracking-widest">
                          {entry.phase}
                        </span>
                        <span className="font-mono-code text-[10px] text-zinc-600">
                          LOG_{String(i + 1).padStart(3, "0")}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-white tracking-wide mb-2">
                        {entry.title}
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                        {entry.story}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-14 flex items-center gap-3 font-mono-code text-[11px] text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>END OF LOG // NEW ENTRIES APPEND AUTOMATICALLY</span>
        </div>
      </div>
    </section>
  );
}
