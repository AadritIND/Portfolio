import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { CodeXml, ExternalLink, ArrowUpRight } from "lucide-react";
import type { Project } from "../../data/types";
import { soundFX } from "../../lib/sound";

interface Props {
  project: Project;
  onInspectCode?: (project: Project) => void;
}

/**
 * Project card — mouse-tracked 3D tilt, hover glow, status/benchmark chips
 * and INSPECT CODE / live / GitHub actions. 1:1 with the original layout.
 */
export default function ProjectCard({ project, onInspectCode }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 300, damping: 25 });
  const rotateYRaw = useSpring(ry, { stiffness: 300, damping: 25 });
  const rotateY = useTransform(rotateYRaw, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateXStr = useTransform(rotateX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rx.set(px);
    ry.set(py);
  };

  const onMouseLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX: rotateXStr, rotateY, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="bg-[#14151C] border border-white/10 rounded-3xl flex flex-col justify-between hover:border-[#0052FF]/60 transition-colors duration-300 group overflow-hidden relative shadow-xl min-h-[380px]"
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0, 82, 255, 0.12) 0%, transparent 70%)",
        }}
      />

      <div>
        {/* Top row */}
        <div className="flex items-center justify-between px-7 pt-7 pb-0 gap-2">
          <div className="flex items-center gap-2">
            {project.status && (
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  project.status === "active" ? "bg-emerald-400" : "bg-blue-400"
                } animate-pulse`}
                title={
                  project.status === "active"
                    ? "Continuously updated"
                    : "In development"
                }
              />
            )}
            <span className="font-mono-code text-[11px] text-[#0052FF] font-bold uppercase tracking-wider">
              {project.categoryLabel}
            </span>
          </div>
          {project.benchmark ? (
            <span className="font-mono-code text-[10px] px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold whitespace-nowrap">
              {project.benchmark}
            </span>
          ) : (
            <span className="font-mono-code text-[11px] px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-zinc-400">
              {project.language}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col px-7 py-5">
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mb-2 group-hover:text-[#4d85ff] transition-colors duration-300 block"
          >
            {project.name}
          </a>
          <p className="font-mono-code text-xs text-zinc-400 leading-relaxed mb-4">
            {project.tagline}
          </p>
          <p className="text-sm text-zinc-300 leading-relaxed mb-5 font-normal">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {project.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/8 text-[11px] font-mono-code text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mx-7 mb-7 pt-5 border-t border-white/10 flex items-center gap-3">
        {onInspectCode ? (
          <button
            onClick={() => {
              soundFX.playClick();
              onInspectCode(project);
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0052FF] text-white text-xs font-mono-code font-bold hover:bg-blue-600 active:scale-95 transition cursor-pointer"
          >
            <CodeXml className="w-3.5 h-3.5" />
            <span>INSPECT CODE</span>
          </button>
        ) : (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0052FF] text-white text-xs font-mono-code font-bold hover:bg-blue-600 transition cursor-pointer"
          >
            <CodeXml className="w-3.5 h-3.5" />
            <span>INSPECT CODE</span>
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/15 transition"
            title="Live Demo"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <a
          href={`${project.githubUrl}#readme`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/15 transition"
          title="README"
        >
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
}
