import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Sparkles,
  Globe,
  Smartphone,
  Wrench,
  FlaskConical,
  BrainCircuit,
  ArrowUpRight,
} from "lucide-react";
import { PROJECTS } from "../../data/projects";
import { IDENTITY } from "../../data/types";
import { soundFX } from "../../lib/sound";
import ProjectCard from "./ProjectCard";
import type { Project } from "../../data/types";

const FILTERS = [
  { id: "ALL", label: "All Work" },
  { id: "WEBSITES", label: "Websites" },
  { id: "APPS", label: "Apps" },
  { id: "TOOLS", label: "Tools" },
  { id: "AI", label: "AI" },
  { id: "EXPERIMENTS", label: "Experiments" },
];

/**
 * Bento catalog — live search, domain filter pills, animated 3-column grid
 * of tilt cards. 1:1 with the original's layout and empty state.
 */
export default function WorksGrid({ onInspectCode }: { onInspectCode: (p: Project) => void }) {
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");

  const filtered = PROJECTS.filter((p) => {
    const matchesFilter = filter === "ALL" || p.category === filter;
    const q = query.toLowerCase();
    const matchesQuery =
      p.name.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.language.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    return matchesFilter && matchesQuery;
  });

  const counts = Object.fromEntries(
    FILTERS.map((f) => [f.id, f.id === "ALL" ? PROJECTS.length : PROJECTS.filter((p) => p.category === f.id).length]),
  );

  const FILTER_ICONS: Record<string, React.ReactNode> = {
    ALL: <Sparkles className="w-3.5 h-3.5" />,
    WEBSITES: <Globe className="w-3.5 h-3.5" />,
    APPS: <Smartphone className="w-3.5 h-3.5" />,
    TOOLS: <Wrench className="w-3.5 h-3.5" />,
    AI: <BrainCircuit className="w-3.5 h-3.5" />,
    EXPERIMENTS: <FlaskConical className="w-3.5 h-3.5" />,
  };

  return (
    <section id="works" className="relative bg-transparent text-white py-12 px-4 sm:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <span className="font-mono-code text-xs uppercase tracking-widest text-[#0052FF] mb-2 block">
            FULL CATALOG // GITHUB.COM/AADRIT1234
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            EXPLORE BY DOMAIN.
          </h2>
        </div>
        <div className="flex items-center gap-3 self-end">
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0052FF] font-mono-code transition"
            />
          </div>
          <a
            href={IDENTITY.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition font-mono-code text-xs font-semibold"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* Filter pills */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 mb-10">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setFilter(f.id);
              soundFX.playClick();
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono-code text-xs font-semibold transition cursor-pointer ${
              filter === f.id
                ? "bg-[#0052FF] text-white shadow-lg shadow-blue-500/20"
                : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {FILTER_ICONS[f.id]}
            <span>
              {f.label} ({counts[f.id]})
            </span>
          </button>
        ))}
      </div>

      {/* Grid — cards animate in on mount; filtering swaps instantly */}
      <div className="max-w-7xl mx-auto">
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} onInspectCode={onInspectCode} />
          ))}
        </motion.div>
        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-mono-code text-sm text-zinc-600">
              NO RESULTS FOR &quot;{query.toUpperCase()}&quot;
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
