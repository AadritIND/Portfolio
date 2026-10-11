import { useEffect, useState } from "react";
import { animate, motion } from "framer-motion";
import { GitCommitVertical, GitFork, GitBranch, Users, RefreshCw, Star } from "lucide-react";
import { IDENTITY } from "../data/types";
import SheetTag from "./SheetTag";

const CACHE_KEY = "github_telemetry_v1";
const TTL = 30 * 60 * 1000;
const MAX_PUSHES = 30;
const GRID_DAYS = 60;

const FALLBACK = {
  user: { public_repos: 0, followers: 0, created_at: "2025-01-01T00:00:00Z" },
  repos: null,
  pushes: [],
  totalCommits: 0,
  totalStars: 0,
  fetchedAt: 0,
  stale: true,
} as any;

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  const [last, setLast] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (target === last && value === target) return;
    setLast(target);
    const controls = animate(value, target, {
      duration: 1.2,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, active, last, value]);

  return value;
}



function buildGrid(pushes: any[]): number[] {
  const grid = new Array(GRID_DAYS).fill(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;

  for (const p of pushes) {
    try {
      const d = new Date(p.time);
      d.setHours(0, 0, 0, 0);
      const diff = Math.floor((today.getTime() - d.getTime()) / dayMs);
      if (diff >= 0 && diff < GRID_DAYS) {
        grid[GRID_DAYS - 1 - diff] += p.count;
      }
    } catch {
      // skip
    }
  }
  return grid;
}

function readCache(): any | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(t: any) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(t));
  } catch {
    // ignore
  }
}

async function fetchTelemetry(): Promise<any> {
  const username = "AadritIND";
  try {
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers: { Accept: "application/vnd.github+json" } }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers: { Accept: "application/vnd.github+json" } }),
      fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers: { Accept: "application/vnd.github+json" } }),
    ]);

    const user = userRes.ok ? await userRes.json() : null;
    const repos = reposRes.ok ? await reposRes.json() : null;
    const events = eventsRes.ok ? await eventsRes.json() : [];

    const pushes: any[] = [];
    let totalCommitsFromEvents = 0;

    for (const ev of events) {
      if (ev?.type !== "PushEvent") continue;
      const payload = ev.payload || {};
      const commitsArr = Array.isArray(payload.commits) ? payload.commits : [];
      const count = typeof payload.size === "number" ? payload.size : commitsArr.length;
      if (count <= 0) continue;
      const repoName = ev.repo?.name?.split("/")?.[1] || ev.repo?.name || "unknown";
      const sha = commitsArr[0]?.sha || "";
      const message = commitsArr[0]?.message || "(no commit message)";
      pushes.push({
        type: "push",
        repo: repoName,
        message: message.split("\n")[0].slice(0, 100),
        sha: sha.slice(0, 7),
        count,
        time: ev.created_at,
      });
      totalCommitsFromEvents += count;
      if (pushes.length >= MAX_PUSHES) break;
    }

    let totalStars = 0;
    if (Array.isArray(repos)) {
      for (const r of repos) {
        if (typeof r.stargazers_count === "number") totalStars += r.stargazers_count;
      }
    }

    const result = {
      user,
      repos,
      pushes,
      totalCommits: totalCommitsFromEvents,
      totalStars,
      fetchedAt: Date.now(),
      stale: false,
    };
    return result;
  } catch (e) {
    const cached = readCache();
    if (cached) {
      return { ...cached, stale: true };
    }
    return { ...FALLBACK, fetchedAt: Date.now(), stale: true };
  }
}

export default function GitHubStats() {
  const [data, setData] = useState<any | null>(null);
  const [status, setStatus] = useState<"loading" | "live" | "cached" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const cached = readCache();
      if (cached && Date.now() - cached.fetchedAt < TTL) {
        if (!cancelled) {
          setData(cached);
          setStatus(cached.stale ? "cached" : "live");
        }
        return;
      }

      try {
        const next = await fetchTelemetry();
        if (!cancelled) {
          setData(next);
          setStatus("live");
          writeCache(next);
        }
      } catch {
        if (!cancelled) {
          const fallback = readCache() ?? FALLBACK;
          setData(fallback);
          setStatus("error");
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const user = data?.user ?? null;
  const pushes = data?.pushes ?? [];
  const commits = data?.totalCommits ?? 0;
  const reposCount = useCountUp(user?.public_repos ?? 0, status !== "loading");
  const commitsCount = useCountUp(commits, status !== "loading");
  const totalStars = data?.totalStars ?? 0;
  const starsCount = useCountUp(totalStars, status !== "loading");

  const grid = buildGrid(pushes);
  const rows = Array.from({ length: Math.ceil(grid.length / 12) }, (_, r) => grid.slice(r * 12, (r + 1) * 12));
  const ready = status !== "loading";

  return (
    <section
      id="telemetry"
      className="py-24 px-4 sm:px-8 bg-[#F8F9FA] text-[#0D0E12] border-t border-zinc-200 relative overflow-hidden bg-dot-matrix"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <SheetTag sheet="05" label="COMMIT LOG" meta={["PUBLIC API", "REAL-TIME"]} className="mb-10" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-8 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="font-tech text-[9px] uppercase tracking-[0.2em] text-accent">COMMIT ACTIVITY</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-zinc-200 font-mono-code text-[9px] text-zinc-500">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    status === "live"
                      ? "bg-emerald-500 animate-pulse"
                      : status === "cached"
                        ? "bg-amber-500"
                        : status === "error"
                          ? "bg-rose-500"
                          : "bg-zinc-300"
                  }`}
                />
                {status === "live" ? "LIVE" : status === "cached" ? "CACHED" : status === "error" ? "ERROR" : "SYNCING"}
              </span>
              {user?.created_at && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/30 font-mono-code text-[9px] text-accent">
                  GitHub Developer
                </span>
              )}
            </div>
            <h2 className="font-display font-normal text-4xl sm:text-6xl text-[#0D0E12] tracking-[0.04em] leading-[1.1]">
              ACTIVITY STREAM
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={IDENTITY.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D0E12] text-white hover:bg-accent transition font-tech text-[9px]"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>VIEW GITHUB</span>
            </a>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem(CACHE_KEY);
                } catch {
                  /* noop */
                }
                setStatus("loading");
                setData(null);
              }}
              title="Re-sync telemetry from GitHub"
              className="p-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:text-accent hover:border-accent transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status === "loading" ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "PUBLIC REPOSITORIES",
              value: ready ? reposCount : "—",
              sub: "Real-time count from GitHub API",
              icon: <GitFork className="w-4 h-4" />,
            },
            {
              label: "TOTAL COMMITS",
              value: ready ? commitsCount : "—",
              sub: "Overall commit activity",
              icon: <GitCommitVertical className="w-4 h-4" />,
            },
            {
              label: "ON GITHUB SINCE",
              value: user ? new Date(user.created_at).getFullYear() : "—",
              sub: "GitHub journey timeline",
              icon: <Users className="w-4 h-4" />,
            },
            {
              label: "TOTAL STARS",
              value: ready ? starsCount : "—",
              sub: "Across all public repositories",
              icon: <Star className="w-4 h-4" />,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="p-6 rounded-2xl bg-white border border-zinc-200 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition brackets"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-tech text-[8px] tracking-[0.18em] text-zinc-500">{stat.label}</span>
                <span className="text-accent">{stat.icon}</span>
              </div>
              <div className="font-display font-black text-3xl sm:text-4xl text-[#0D0E12] tracking-tight">{stat.value}</div>
              <p className="font-mono-code text-[10px] text-zinc-500 mt-3 leading-relaxed">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="p-6 sm:p-8 rounded-2xl bg-white border border-zinc-200 flex flex-col relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <span className="font-tech text-[8px] tracking-[0.18em] text-accent">DAILY COMMIT GRID</span>
                  <h3 className="font-display font-normal text-2xl sm:text-4xl text-[#0D0E12] mt-2 tracking-tight">
                    {commits} TOTAL COMMITS OVER LAST 60 DAYS
                  </h3>
                  <p className="font-mono-code text-[10px] text-zinc-500 mt-2">
                    Superior contribution visualization • Auto-updates on repo changes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {["0", "1-2", "3-5", "6+"].map((lbl, i) => (
                  <span key={lbl} className="flex items-center gap-1.5 font-mono-code text-[9px] text-zinc-500">
                    <span
                      className="inline-block w-3 h-3 rounded-sm border border-zinc-300/40"
                      style={{
                        backgroundColor: i === 0 ? "rgba(0,0,0,0.06)" : `rgba(217, 72, 15, ${0.18 + i * 0.22})`,
                      }}
                    />
                    {lbl}
                  </span>
                ))}
              </div>

              <div className="grid gap-1 mb-4" style={{ gridTemplateColumns: "repeat(12, 1fr)" }}>
                {rows.map((row, ri) =>
                  row.map((day, di) => {
                    const intensity = day === 0 ? 0 : day <= 1 ? 1 : day <= 3 ? 2 : day <= 6 ? 3 : 4;
                    const filled = intensity > 0;
                    return (
                      <div
                        key={`${ri}-${di}`}
                        className="rounded-sm transition-all duration-300 hover:scale-110 hover:z-20 cursor-pointer"
                        style={{
                          backgroundColor: filled
                            ? `rgba(217, 72, 15, ${0.22 + intensity * 0.28})`
                            : "rgba(0,0,0,0.05)",
                          border: filled ? "1px solid rgba(217, 72, 15, 0.5)" : "1px solid rgba(0,0,0,0.1)",
                          aspectRatio: "1/1",
                          minHeight: 10,
                        }}
                        title={`${day} commit${day !== 1 ? "s" : ""}`}
                      />
                    );
                  })
                )}
              </div>

              <div className="flex justify-between items-center text-[9px] font-mono-code text-zinc-400 mb-2">
                <span>LESS</span>
                <span>MORE</span>
              </div>
              <p className="font-mono-code text-[9px] text-zinc-500">
                * Real-time from GitHub public API • Auto-syncs every 30 min
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function readCommitFeed(): readonly any[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.pushes) ? parsed.pushes : [];
  } catch {
    return [];
  }
}

export function readCommitCount(): number {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Number.isFinite(parsed.totalCommits) ? parsed.totalCommits : 0;
  } catch {
    return 0;
  }
}
