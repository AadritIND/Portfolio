import { useEffect, useState, type CSSProperties } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import { PROJECTS } from "../../data/projects";
import {
  readRepoIndex,
  readTelemetryCache,
  relativeFrom,
  type RepoIndexEntry,
} from "../../lib/telemetry";

/**
 * SHEET 02/B — PARTS LIST. The catalog as a dense engineering parts list
 * rather than cards: one row per repository, live star counts and push dates
 * read from the same GitHub cache the telemetry sheet uses. Rows that have no
 * live data show "—" instead of inventing numbers.
 */
export default function SpecTable() {
  const [index, setIndex] = useState<Map<string, RepoIndexEntry>>(() =>
    readRepoIndex(),
  );
  const totals = readTelemetryCache();

  useEffect(() => {
    const id = setInterval(() => setIndex(readRepoIndex()), 15000);
    return () => clearInterval(id);
  }, []);

  const live = index.size > 0;

  return (
    <div
      className="relative border border-white/10 bg-[#101118]"
      style={{ "--datum-ink": "rgba(255,255,255,0.22)" } as CSSProperties}
    >
      {/* sheet header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <span className="font-tech text-[10px] tracking-[0.16em] text-zinc-200">
          PARTS LIST // {PROJECTS.length} ENTRIES
        </span>
        <span className="flex items-center gap-3 font-mono-code text-[9px] text-zinc-500">
          <span>
            LIVE FIGURES:{" "}
            <span className={live ? "text-emerald-400" : "text-amber-400"}>
              {live ? "SYNCED" : "AWAITING SYNC"}
            </span>
          </span>
          <span className="hidden sm:inline">SCALE 1:1 · REV 3.2.0</span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 font-mono-code text-[9px] uppercase tracking-[0.14em] text-zinc-500">
              <th className="px-4 py-2.5 font-normal">Id</th>
              <th className="px-4 py-2.5 font-normal">Repository</th>
              <th className="px-4 py-2.5 font-normal">Domain</th>
              <th className="px-4 py-2.5 font-normal">Stack</th>
              <th className="px-4 py-2.5 text-right font-normal">Stars</th>
              <th className="px-4 py-2.5 text-right font-normal">Last Push</th>
              <th className="px-4 py-2.5 text-right font-normal">Links</th>
            </tr>
          </thead>
          <tbody>
            {PROJECTS.map((project, i) => {
              const entry = index.get(project.name.toLowerCase());
              return (
                <tr
                  key={project.id}
                  className="group border-b border-white/5 transition-colors hover:bg-white/[0.04]"
                >
                  <td className="px-4 py-3 font-mono-code text-[10px] text-zinc-600 tnum">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="OPEN"
                      className="font-mono-code text-xs font-bold text-zinc-100 transition group-hover:text-accent"
                    >
                      {project.name}
                    </a>
                    <span className="ml-2 font-mono-code text-[9px] text-zinc-500">
                      {project.language}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="border border-white/10 px-2 py-0.5 font-tech text-[8px] tracking-[0.14em] text-zinc-400">
                      {project.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono-code text-[10px] text-zinc-500">
                    {project.tags.slice(0, 3).join(" · ")}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-code text-[10px] text-zinc-300 tnum">
                    {entry ? (
                      <span className="inline-flex items-center justify-end gap-1">
                        <Star className="h-3 w-3 text-zinc-600" />
                        {entry.stars}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-code text-[10px] text-zinc-400 tnum">
                    {entry?.pushedAt ? relativeFrom(entry.pushedAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center justify-end gap-3">
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono-code text-[10px] text-zinc-500 transition hover:text-accent"
                      >
                        REPO
                      </a>
                      {project.liveUrl ? (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono-code text-[10px] text-emerald-400 transition hover:text-emerald-300"
                        >
                          LIVE <ArrowUpRight className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="font-mono-code text-[10px] text-zinc-700">
                          NO DEPLOY
                        </span>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* sheet footer — totals */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 font-mono-code text-[9px] text-zinc-500">
        <span>
          TOTAL PARTS {PROJECTS.length} · LICENSED WORKS {PROJECTS.length} ·
          UNCLAIMED 00
        </span>
        <span className="flex items-center gap-3">
          <span>
            STARS {totals ? String(totals.stars).padStart(2, "0") : "—"}
          </span>
          <span>
            LAST PUSH {totals ? relativeFrom(totals.latestPush) : "—"}
          </span>
        </span>
      </div>
    </div>
  );
}
