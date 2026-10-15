import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Copy, Check, X, ExternalLink, Sparkles, Brain, Code2, RefreshCw } from "lucide-react";
import type { Project } from "../../data/types";
import { getAccentHex } from "../../lib/skins";
import { soundFX } from "../../lib/sound";
import { queryAI } from "../../lib/ai";

/**
 * Code inspector modal — dark console panel showing the project's snippet
 * with copy-to-clipboard confetti, repository link, and live AI Architecture Audit.
 */
export default function CodeModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"code" | "ai">("code");
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!project) return null;

  const handleRunAiAudit = async () => {
    if (isAnalyzing || !project) return;
    soundFX.playClick();
    setIsAnalyzing(true);
    setTab("ai");

    try {
      const prompt = `Provide a crisp architectural analysis of this implementation from Aadrit's project "${project.name}" (${project.codeSnippet.filename}):
Code snippet:
\`\`\`${project.codeSnippet.lang}
${project.codeSnippet.code}
\`\`\`
Please explain:
1. Architectural Pattern & Core Mechanism
2. Security & Performance Highlights
3. Why this implementation choice matters.`;

      const response = await queryAI(prompt, "google");
      setAiAnalysis((prev) => ({ ...prev, [project.id]: response }));
    } catch (err: any) {
      setAiAnalysis((prev) => ({
        ...prev,
        [project.id]: `AI Analysis error: ${err.message || "Failed to generate analysis"}.`,
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentAnalysis = aiAnalysis[project.id];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl bg-[#0D0E12] border border-white/15 rounded-3xl overflow-hidden shadow-2xl z-10 text-white"
        >
          {/* Title bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              <div>
                <h3 className="font-display font-bold text-base text-white tracking-wide">
                  {project.name}
                </h3>
                <span className="font-mono-code text-[11px] text-zinc-400">
                  {project.codeSnippet.filename}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(project.codeSnippet.code);
                  setCopied(true);
                  confetti({
                    particleCount: 30,
                    spread: 50,
                    origin: { y: 0.6 },
                    colors: [getAccentHex(), "#FFFFFF"],
                  });
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono-code text-zinc-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY SOURCE</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="px-6 pt-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-1 font-mono-code text-xs">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setTab("code");
                }}
                className={`px-3 py-1.5 rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
                  tab === "code"
                    ? "bg-white/10 text-white font-bold border-b-2 border-accent"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>SOURCE CODE</span>
              </button>

              <button
                onClick={() => {
                  if (!currentAnalysis) {
                    handleRunAiAudit();
                  } else {
                    soundFX.playClick();
                    setTab("ai");
                  }
                }}
                className={`px-3 py-1.5 rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
                  tab === "ai"
                    ? "bg-white/10 text-cyan-400 font-bold border-b-2 border-cyan-400"
                    : "text-zinc-400 hover:text-cyan-300"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI ARCHITECTURE AUDIT</span>
              </button>
            </div>

            {tab === "ai" && (
              <button
                onClick={handleRunAiAudit}
                disabled={isAnalyzing}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono-code text-zinc-300 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isAnalyzing ? "animate-spin" : ""}`} />
                <span>RE-ANALYZE</span>
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4 font-mono-code text-xs">
              <span className="text-accent font-semibold">SPECS:</span>
              {project.benchmark && (
                <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-400">
                  {project.benchmark}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
                {project.categoryLabel}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                LANG: {project.language}
              </span>
            </div>

            {tab === "code" ? (
              <div className="bg-black/60 rounded-2xl p-5 border border-white/10 font-mono-code text-xs sm:text-sm overflow-x-auto max-h-[380px]">
                <pre className="text-zinc-200 leading-relaxed">
                  <code>{project.codeSnippet.code}</code>
                </pre>
              </div>
            ) : (
              <div className="bg-cyan-950/20 rounded-2xl p-5 border border-cyan-500/20 text-xs sm:text-sm overflow-y-auto max-h-[380px] leading-relaxed text-zinc-200 space-y-3 font-sans">
                {isAnalyzing ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-cyan-400 font-mono-code text-xs">
                    <Brain className="w-8 h-8 animate-pulse text-cyan-400" />
                    <span>Analyzing code architecture &amp; patterns with Gemini...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{currentAnalysis}</div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-white/10 bg-white/5 flex items-center justify-between font-mono-code text-xs text-zinc-400">
            <span>RUNTIME VERIFIED // COMPILED RELEASE</span>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline flex items-center gap-1"
            >
              <span>VIEW ON GITHUB</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
