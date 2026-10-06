import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Copy, Check, X, ExternalLink } from "lucide-react";
import type { Project } from "../../data/types";

/**
 * Code inspector modal — dark console panel showing the project's snippet
 * with copy-to-clipboard confetti and repository link.
 */
export default function CodeModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!project) return null;

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
              <span className="w-2.5 h-2.5 rounded-full bg-[#0052FF] animate-pulse" />
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
                    colors: ["#0052FF", "#FFFFFF"],
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

          {/* Specs + code */}
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="font-mono-code text-xs text-[#0052FF] font-semibold">
                SPECS:
              </span>
              {project.benchmark && (
                <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono-code text-emerald-400">
                  {project.benchmark}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono-code text-zinc-300">
                {project.categoryLabel}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono-code text-zinc-400">
                LANG: {project.language}
              </span>
            </div>
            <div className="bg-black/60 rounded-2xl p-5 border border-white/10 font-mono-code text-xs sm:text-sm overflow-x-auto max-h-[380px]">
              <pre className="text-zinc-200 leading-relaxed">
                <code>{project.codeSnippet.code}</code>
              </pre>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-white/10 bg-white/5 flex items-center justify-between font-mono-code text-xs text-zinc-400">
            <span>RUNTIME VERIFIED // COMPILED RELEASE</span>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#0052FF] hover:underline flex items-center gap-1"
            >
              <span>VIEW IN REPOSITORY</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
