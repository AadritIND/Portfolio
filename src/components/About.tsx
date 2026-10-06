import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ShieldCheck,
  Wrench,
  Database,
  BrainCircuit,
  LayoutDashboard,
  LaptopMinimal,
  Bot,
  Coffee,
  Zap,
} from "lucide-react";
import { STACK, STACK_COLORS } from "../data/stack";
import { IDENTITY } from "../data/types";

/**
 * About — three tabbed panels: intro (dark bio card + passion cards),
 * stack (color-coded taxonomy grid) and setup (workstation / AI stack /
 * power source). All copy adapted to Aadrit.
 */
export default function About() {
  const [tab, setTab] = useState("intro");

  const passionCards = [
    {
      title: "TECHNICAL",
      desc: "This is the thing which drives me. Digging deep down to see how things work and recreating them myself for my custom use is the best experience.",
      icon: <Wrench className="w-5 h-5 text-[#0052FF]" />,
    },
    {
      title: "CYBERSECURITY",
      desc: "Ethical hacking enthusiast. Understanding how systems break is how you learn to build them properly — recon, web exploitation, and hardening.",
      icon: <Database className="w-5 h-5 text-[#0052FF]" />,
    },
    {
      title: "AI & AUTOMATION",
      desc: "My lifeline, the thing I depend on most. AI and automation are my fav part. Solving hard and complex problems together to deliver crazy outcomes.",
      icon: <BrainCircuit className="w-5 h-5 text-[#0052FF]" />,
    },
    {
      title: "FRONTEND",
      desc: "AHMMM, TBH this is a bottleneck, but dw will figure out something for this too.",
      icon: <LayoutDashboard className="w-5 h-5 text-[#0052FF]" />,
    },
  ];

  const setupCards = [
    {
      icon: <LaptopMinimal className="w-5 h-5 text-[#0052FF]" />,
      label: "WORKSTATION",
      title: "LINUX / WINDOWS",
      desc: "Daily-driving Linux for dev & security labs, Windows for the rest. Dual boot, because toolbox > ideology.",
    },
    {
      icon: <Bot className="w-5 h-5 text-[#0052FF]" />,
      label: "AI CODING STACK",
      title: "AI Agents",
      desc: "Full library of AI agents working in parallel — Freebuff, Claude, OpenCode — each on different things.",
    },
    {
      icon: <Coffee className="w-5 h-5 text-[#0052FF]" />,
      label: "POWER SOURCE",
      title: "CAFFEINE",
      desc: "OFC this is the thing keeping me pushing. Coffee & chai — the only two dependencies that never break.",
    },
  ];

  return (
    <section
      id="about"
      className="py-24 px-4 sm:px-8 bg-white border-t border-zinc-200 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-zinc-200">
          <div>
            <span className="font-tech text-[9px] uppercase tracking-[0.2em] text-[#0052FF] mb-3 block">
              ABOUT // AADRIT
            </span>
            <h2 className="font-display font-normal text-4xl sm:text-6xl text-[#0D0E12] tracking-[0.04em] leading-[1.1]">
              WHO TF IS AADRIT?
            </h2>
          </div>
          <a
            href={IDENTITY.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D0E12] text-white hover:bg-zinc-800 transition font-tech text-[9px] self-end"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>GITHUB.COM/AADRIT1234</span>
          </a>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-zinc-100 p-1.5 rounded-2xl w-max mb-10 border border-zinc-200/80 font-tech text-[9px]">
          {[
            { id: "intro", label: "01 // WHO I AM" },
            { id: "stack", label: "02 // TECH STACK" },
            { id: "setup", label: "03 // MY SETUP" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl font-medium transition cursor-pointer ${
                tab === t.id
                  ? "bg-white text-zinc-950 shadow-sm border border-black/5 font-semibold"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/*
         * Tab panels — keyed wrapper remounts on tab change so the enter
         * animation always plays. (AnimatePresence mode="wait" can stall
         * when swapping conditional children on React 19.)
         */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* ============ INTRO ============ */}
          {tab === "intro" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-[#0D0E12] text-white p-8 md:p-10 rounded-3xl border border-zinc-800 shadow-xl flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#0052FF]/10 border-l-2 border-[#0052FF] text-[#0052FF] font-bold uppercase tracking-wider text-xs font-mono-code">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    AVAILABLE FOR COLLABORATION
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mb-4 leading-tight">
                    Builder of apps, breaker of systems, student of everything
                    in between.
                  </h3>
                  <div className="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                    <p>
                      I&apos;m <strong className="text-white">Aadrit</strong> —
                      a full-stack developer and cybersecurity enthusiast who
                      wants to understand technology deeply, not just use it. I
                      don&apos;t stop at the API; I take the stack apart to see
                      what makes it tick.
                    </p>
                    <p>
                      My work spans real-time collaboration tools, self-hosted
                      infrastructure, AI-powered products, and security
                      labs. I&apos;m obsessed with low-level understanding,
                      ethical hacking, and making software that feels{" "}
                      <em>alive</em>.
                    </p>
                    <p>
                      When I&apos;m not shipping web apps, I&apos;m probing
                      targets in a lab, training ML models on my own datasets,
                      or automating away the boring parts of development.
                    </p>
                    <blockquote className="border-l-2 border-[#0052FF] pl-4 italic text-zinc-400 mt-6 py-1">
                      &quot;At some point you touched a computer and the
                      computer did what you wanted, you made it do what you
                      wanted it to do and you realized that you were a God...
                      a small God in a very small world&quot;
                      <footer className="text-xs text-zinc-500 mt-2 font-mono-code not-italic">
                        — Robert C. Martin
                      </footer>
                    </blockquote>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 font-mono-code text-xs">
                  {[
                    { label: "REPOS", value: "7+" },
                    { label: "LIVE APPS", value: "4" },
                    { label: "AI BACKENDS", value: "5" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="text-2xl font-display font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-zinc-500 text-[11px] mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-4">
                {passionCards.map((card, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm hover:border-zinc-400 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-zinc-100">{card.icon}</div>
                      <h4 className="font-display font-bold text-base text-zinc-900">
                        {card.title}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed font-normal pl-11">
                      {card.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ STACK ============ */}
          {tab === "stack" && (
            <div className="space-y-6">
              <p className="font-mono-code text-xs text-zinc-400 mb-2">
                // Everything I actually touch on a day-to-day basis — no
                padding, no fluff.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {STACK.map((cat) => {
                  const colors = STACK_COLORS[cat.color];
                  return (
                    <div
                      key={cat.category}
                      className="relative rounded-2xl bg-white border border-zinc-200 p-5 overflow-hidden hover:border-zinc-300 hover:shadow-md transition"
                    >
                      <div
                        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl ${colors.glow} pointer-events-none`}
                      />
                      <span
                        className={`font-mono-code text-[11px] font-bold uppercase tracking-wider block mb-4 ${colors.label}`}
                      >
                        {cat.category}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {cat.items.map((item) => (
                          <span
                            key={item}
                            className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-mono-code font-medium transition cursor-default ${colors.pill}`}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-zinc-100 font-mono-code text-xs text-zinc-400">
                <span className="text-zinc-900 font-bold text-sm">
                  {STACK.reduce((acc, c) => acc + c.items.length, 0)}
                </span>
                <span>
                  TOOLS &amp; TECHNOLOGIES ACROSS {STACK.length} CATEGORIES
                </span>
              </div>
            </div>
          )}

          {/* ============ SETUP ============ */}
          {tab === "setup" && (
            <div className="bg-[#0D0E12] text-white p-8 md:p-10 rounded-3xl border border-zinc-800 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {setupCards.map((card, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-xl bg-white/5">{card.icon}</div>
                      <span className="font-mono-code text-xs text-[#0052FF] font-semibold">
                        {card.label}
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-xl text-white mb-2">
                      {card.title}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-mono-code">
                      {card.desc}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-8 border-t border-white/10 flex items-center gap-3 font-mono-code text-xs text-zinc-400">
                <Zap className="w-4 h-4 text-[#0052FF]" />
                <span>
                  POWERED BY CAFFEINE AND A CONVICTION THAT MACHINES SHOULD DO
                  WHAT YOU TELL THEM.
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
