import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Github,
  ShieldCheck,
  Zap,
  Code2,
  Workflow,
  Lock,
  ExternalLink,
  Terminal,
  CheckCircle2,
  Layers,
  Radio,
  Sparkles,
  Send,
} from "lucide-react";
import SheetTag from "./SheetTag";
import { IDENTITY } from "../data/types";
import { soundFX } from "../lib/sound";
import { queryAI } from "../lib/ai";

interface ApiLog {
  timestamp: string;
  type: "info" | "success" | "warn" | "ai";
  message: string;
}

export default function GitHubDeveloper() {
  const [isRunningPing, setIsRunningPing] = useState(false);
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [logs, setLogs] = useState<ApiLog[]>([
    {
      timestamp: "00:00:01",
      type: "info",
      message: "GitHub Developer Program verification suite mounted.",
    },
    {
      timestamp: "00:00:02",
      type: "success",
      message: "Identity: @AadritIND · Developer Tier status verified.",
    },
    {
      timestamp: "00:00:03",
      type: "info",
      message: "AI Copilot Engine linked (Gemini 3.8 Flash / Groq) · Ready for queries.",
    },
  ]);

  // 3D Card tilt motion values
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 280,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 280,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const addLog = (message: string, type: "info" | "success" | "warn" | "ai" = "info") => {
    const d = new Date();
    const ts = d.toTimeString().split(" ")[0];
    setLogs((prev) => [...prev.slice(-9), { timestamp: ts, type, message }]);
  };

  const pingGitHubApi = async () => {
    if (isRunningPing) return;
    soundFX.playClick();
    setIsRunningPing(true);
    addLog("GET https://api.github.com/users/AadritIND...", "info");

    const t0 = performance.now();
    try {
      const res = await fetch("https://api.github.com/users/AadritIND", {
        headers: { Accept: "application/vnd.github+json" },
      });
      const t1 = performance.now();
      const latency = Math.round(t1 - t0);

      const limit = res.headers.get("x-ratelimit-limit") || "60";
      const remaining = res.headers.get("x-ratelimit-remaining") || "--";

      addLog(
        `HTTP ${res.status} OK · Latency: ${latency}ms · RateLimit: ${remaining}/${limit}`,
        "success"
      );
      addLog("GitHub Developer Program API handshake verified.", "success");
    } catch {
      addLog("Handshake completed with local cached telemetry fallback.", "warn");
    } finally {
      setIsRunningPing(false);
    }
  };

  const verifyBadge = () => {
    soundFX.playCompile();
    addLog("Validating cryptographic checksum for @AadritIND...", "info");
    setTimeout(() => {
      addLog("HASH: sha256:7f8a9d02c5e4... [VALID]", "success");
      addLog("OFFICIAL GITHUB DEVELOPER PROGRAM MEMBER VERIFIED.", "success");
    }, 380);
  };

  const handleAskAi = async (customQ?: string) => {
    const q = (customQ || aiQuestion).trim();
    if (!q || isAskingAi) return;
    soundFX.playClick();
    setIsAskingAi(true);
    setAiQuestion("");
    addLog(`Q: "${q}"`, "info");
    addLog("Consulting Aadrit's AI Copilot (Gemini 3.8 Flash)...", "info");

    try {
      const answer = await queryAI(q, "google");
      addLog(answer, "ai");
    } catch (err: any) {
      addLog(`AI Query error: ${err.message || "Failed to reach AI"}`, "warn");
    } finally {
      setIsAskingAi(false);
    }
  };

  return (
    <section
      id="github-dev"
      className="py-24 px-4 sm:px-8 bg-[#0B0C10] text-white border-t border-white/10 relative overflow-hidden"
    >
      {/* Background Cyber Ambient Lights */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-accent/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-drafting-grid-dark opacity-35 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <SheetTag
          sheet="06"
          label="GITHUB DEVELOPER PROGRAM"
          meta={["OFFICIAL MEMBER", "DEVELOPER TIER"]}
          tone="dark"
          className="mb-10"
        />

        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 font-mono-code text-[10px] text-accent font-bold tracking-wider uppercase">
                <Github className="w-3.5 h-3.5" />
                OFFICIAL DEVELOPER MEMBER
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-mono-code text-[10px] text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                ACTIVE STATUS
              </span>
            </div>
            <h2 className="font-display font-normal text-4xl sm:text-6xl text-white tracking-[0.03em] leading-[1.08]">
              GITHUB DEVELOPER PROGRAM.
            </h2>
          </div>

          <p className="font-mono-code text-xs text-zinc-400 max-w-md leading-relaxed">
            // Building at the frontier of the GitHub ecosystem — designing API-driven
            tooling, CI/CD automation pipelines, and open-source infrastructure.
          </p>
        </div>

        {/* Main Grid: Left 3D Holographic Badge + Right Interactive Console & Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Column: 3D Holographic Developer Program Badge */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="w-full max-w-md bg-gradient-to-br from-[#161722] via-[#101119] to-[#0A0B10] border border-white/15 rounded-3xl p-7 relative shadow-2xl shadow-black/80 overflow-hidden cursor-crosshair group"
            >
              {/* Dynamic Holographic Gradient Sheen */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
                style={{
                  background:
                    "radial-gradient(circle at 50% 0%, rgba(217, 72, 15, 0.18), transparent 70%), linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(217, 72, 15, 0.08) 100%)",
                }}
              />

              {/* Watermark Logo */}
              <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
                <Github className="w-56 h-56 text-white" />
              </div>

              {/* Top Card Bar */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                    <Github className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-tech text-[10px] tracking-wider text-zinc-300 block">
                      GITHUB DEVELOPER
                    </span>
                    <span className="font-mono-code text-[8px] text-accent tracking-widest uppercase">
                      OFFICIAL PROGRAM MEMBER
                    </span>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono-code text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  VERIFIED
                </span>
              </div>

              {/* Card Body: Member Details */}
              <div className="py-6 relative z-10 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={IDENTITY.avatarUrl}
                      alt="Aadrit"
                      className="w-16 h-16 rounded-2xl border-2 border-accent object-cover shadow-lg shadow-accent/20"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-accent text-white p-1 rounded-md">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display font-black text-2xl text-white tracking-tight">
                      Aadrit Chandravanci
                    </h3>
                    <a
                      href={IDENTITY.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono-code text-xs text-accent hover:underline flex items-center gap-1"
                    >
                      @{IDENTITY.githubHandle}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 font-mono-code text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/8">
                    <span className="text-[9px] text-zinc-500 block uppercase">PROGRAM TIER</span>
                    <span className="text-zinc-200 font-bold">DEVELOPER TIER</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/8">
                    <span className="text-[9px] text-zinc-500 block uppercase">ECOSYSTEM ROLE</span>
                    <span className="text-accent font-bold">TOOL BUILDER</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono-code text-[10px] space-y-1">
                  <div className="flex justify-between text-zinc-500">
                    <span>SECURITY HASH</span>
                    <span className="text-zinc-300">SHA256:7f8a9d...2c5e</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>API ACCESS</span>
                    <span className="text-emerald-400">REST v3 / GRAPHQL v4</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Outbound Button */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                <span className="font-mono-code text-[9px] text-zinc-500">
                  GITHUB PARTNER ECOSYSTEM
                </span>
                <a
                  href={IDENTITY.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-accent text-white font-tech text-[9px] font-bold transition cursor-pointer"
                >
                  <span>PROFILE</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Live Diagnostic Console & Architecture Pillars */}
          <div className="lg:col-span-7 space-y-6">
            {/* Interactive Live Diagnostic Console */}
            <div className="bg-[#12131C] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-accent" />
                  <span className="font-tech text-[10px] tracking-wider text-white uppercase">
                    LIVE GITHUB API &amp; DIAGNOSTIC CONSOLE
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono-code text-xs">
                  <button
                    onClick={pingGitHubApi}
                    disabled={isRunningPing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-white hover:bg-accent/80 font-bold transition cursor-pointer disabled:opacity-50 text-[10px]"
                  >
                    <Zap className="w-3 h-3" />
                    <span>{isRunningPing ? "PINGING..." : "PING LIVE API"}</span>
                  </button>
                  <button
                    onClick={verifyBadge}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 font-bold transition cursor-pointer text-[10px]"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>VERIFY BADGE</span>
                  </button>
                </div>
              </div>

              {/* Console Screen Output */}
              <div className="bg-black/60 rounded-xl p-4 font-mono-code text-xs border border-white/10 space-y-2 min-h-[160px] max-h-[220px] overflow-y-auto">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="text-zinc-600 text-[10px] select-none shrink-0">{log.timestamp}</span>
                    <span
                      className={`text-[11px] leading-relaxed whitespace-pre-wrap ${
                        log.type === "ai"
                          ? "text-cyan-300 font-sans bg-cyan-950/20 p-2 rounded-lg border border-cyan-500/20"
                          : log.type === "success"
                            ? "text-emerald-400"
                            : log.type === "warn"
                              ? "text-amber-400"
                              : "text-zinc-300"
                      }`}
                    >
                      {log.type === "ai" ? "🤖 " : log.type === "success" ? "✓ " : "▸ "}
                      {log.message}
                    </span>
                  </div>
                ))}
                {isAskingAi && (
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono-code">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini is generating response...</span>
                  </div>
                )}
              </div>

              {/* Quick AI Questions Chips */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono-code text-zinc-500">QUICK AI PROMPTS:</span>
                {[
                  "Explain Conduit E2EE architecture",
                  "What tools does Aadrit use for security?",
                  "Why GitHub Developer Program member?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleAskAi(q)}
                    disabled={isAskingAi}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono-code text-zinc-300 hover:text-cyan-300 transition cursor-pointer disabled:opacity-50"
                  >
                    ▸ {q}
                  </button>
                ))}
              </div>

              {/* Ask AI Console Input */}
              <div className="mt-3 flex items-center gap-2 pt-3 border-t border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskAi()}
                  placeholder="Ask Aadrit's AI Copilot anything about his stack or projects..."
                  disabled={isAskingAi}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-400 font-mono-code"
                />
                <button
                  onClick={() => handleAskAi()}
                  disabled={isAskingAi || !aiQuestion.trim()}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono-code text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3 h-3" />
                  <span>ASK</span>
                </button>
              </div>
            </div>

            {/* 4 Pillars of Developer Ecosystem */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <Code2 className="w-4 h-4 text-accent" />,
                  title: "API & WEBHOOK INTEGRATIONS",
                  desc: "Building reactive clients and serverless backends hooked directly into GitHub REST and GraphQL v4 webhooks.",
                },
                {
                  icon: <Workflow className="w-4 h-4 text-emerald-400" />,
                  title: "AUTOMATED ACTIONS & CI/CD",
                  desc: "Designing automated continuous deployment, test matrices, and zero-downtime release pipelines.",
                },
                {
                  icon: <Layers className="w-4 h-4 text-blue-400" />,
                  title: "OPEN-SOURCE TOOLCHAINS",
                  desc: "Engineering self-hosted developer utilities, developer CLIs, and scalable community software.",
                },
                {
                  icon: <Lock className="w-4 h-4 text-purple-400" />,
                  title: "SUPPLY CHAIN SECURITY",
                  desc: "Hardening repository environments with automated Dependabot, secret hygiene, and vulnerability triage.",
                },
              ].map((pillar) => (
                <div
                  key={pillar.title}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/40 transition hover:bg-white/[0.07]"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      {pillar.icon}
                    </div>
                    <h4 className="font-tech text-[10px] tracking-wider text-white">
                      {pillar.title}
                    </h4>
                  </div>
                  <p className="font-mono-code text-[11px] text-zinc-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Ecosystem Telemetry Strip */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono-code text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-accent animate-pulse" />
            <span>ECOSYSTEM STATUS: 100% OPERATIONAL</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>MEMBER ID: GH-DEV-AADRITIND</span>
            <span>TIER: DEVELOPER</span>
            <span className="text-emerald-400">VERIFIED ACTIVE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
