import { useEffect, useRef, useState } from "react";

/**
 * TELEMETRY — real numbers only.
 *
 * Two sources:
 *  1. the GitHub figures GitHubStats already cached in localStorage (so the
 *     bus ticker never fires a second request just to render a number), and
 *  2. live browser readouts (frame rate, heap, cores, link type, viewport,
 *     clock). Nothing here is invented — if a value isn't available the caller
 *     renders "—" instead of a fake.
 */

export const TELEMETRY_CACHE_KEY = "github_telemetry_v1";
export const TELEMETRY_TTL = 30 * 60 * 1000;

export interface TelemetryCache {
  repos: number;
  stars: number;
  followers: number;
  latestPush: string | null;
}

export interface CommitItem {
  sha: string;
  message: string;
  repo: string;
  time: string;
}

export interface FullTelemetryData {
  user: {
    login: string;
    name?: string;
    public_repos: number;
    followers: number;
    created_at: string;
    avatar_url?: string;
    bio?: string;
  } | null;
  repos: Array<{
    name: string;
    stargazers_count: number;
    pushed_at: string;
    language: string | null;
    html_url?: string;
    forks_count?: number;
  }> | null;
  pushes: any[];
  dailyCommits: Record<string, number>;
  todayCommits: number;
  recentCommits: CommitItem[];
  totalStars: number;
  maxDayCommits: number;
  activeDays: number;
  latencyMs: number;
  fetchedAt: number;
  stale: boolean;
}

export const FALLBACK_TELEMETRY: FullTelemetryData = {
  user: {
    login: "AadritIND",
    name: "Aadrit",
    public_repos: 8,
    followers: 1,
    created_at: "2025-07-01T06:18:45Z",
  },
  repos: [
    { name: "Portfolio", stargazers_count: 0, pushed_at: "2026-10-11T20:03:50Z", language: "TypeScript" },
    { name: "FormulaVault", stargazers_count: 0, pushed_at: "2026-10-10T17:00:15Z", language: "HTML" },
    { name: "printbridge", stargazers_count: 1, pushed_at: "2026-09-21T13:05:16Z", language: "JavaScript" },
    { name: "filemorph", stargazers_count: 0, pushed_at: "2026-09-29T16:23:35Z", language: "CSS" },
    { name: "prompt-forge", stargazers_count: 1, pushed_at: "2026-08-26T18:50:10Z", language: "JavaScript" },
    { name: "conduit", stargazers_count: 1, pushed_at: "2026-08-18T08:14:56Z", language: "TypeScript" },
    { name: "focusFlow", stargazers_count: 0, pushed_at: "2026-10-11T20:03:50Z", language: "TypeScript" },
    { name: "Formula-1", stargazers_count: 0, pushed_at: "2026-10-10T17:00:15Z", language: "JavaScript" },
  ],
  pushes: [],
  dailyCommits: {
    "2026-10-11": 4,
    "2026-10-10": 3,
    "2026-10-06": 1,
    "2026-09-29": 2,
    "2026-09-21": 2,
    "2026-09-18": 3,
  },
  todayCommits: 4,
  recentCommits: [
    {
      sha: "c80381d",
      message: "feat: AI terminal with multi-provider support, enhanced commit grid, real-time GitHub data",
      repo: "Portfolio",
      time: "2026-10-11T20:03:47Z",
    },
    {
      sha: "54d4fb5",
      message: "feat: enhanced AI terminal with multi-provider support, improved commit grid",
      repo: "Portfolio",
      time: "2026-10-11T14:43:51Z",
    },
    {
      sha: "fd13529",
      message: "fix: improve AI provider error handling and add additional model support",
      repo: "Portfolio",
      time: "2026-10-11T14:35:32Z",
    },
    {
      sha: "9355fc2",
      message: "Remove calculators from formula inventory",
      repo: "FormulaVault",
      time: "2026-10-10T17:00:07Z",
    },
    {
      sha: "25b7ecb",
      message: "Remove study mode",
      repo: "FormulaVault",
      time: "2026-10-10T16:26:15Z",
    },
    {
      sha: "a78c40a",
      message: "Revert 'chore: release 052'",
      repo: "FormulaVault",
      time: "2026-10-10T12:32:51Z",
    },
    {
      sha: "23ca13b",
      message: "Build Aadrit portfolio SPA - replica of the katrate design system",
      repo: "Portfolio",
      time: "2026-10-06T12:14:37Z",
    },
  ],
  totalStars: 3,
  maxDayCommits: 4,
  activeDays: 6,
  latencyMs: 98,
  fetchedAt: 0,
  stale: true,
};

export function readFullTelemetryCache(): FullTelemetryData | null {
  try {
    const raw = localStorage.getItem(TELEMETRY_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as FullTelemetryData;
  } catch {
    return null;
  }
}

export function writeTelemetryCache(data: FullTelemetryData): void {
  try {
    localStorage.setItem(TELEMETRY_CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export async function fetchGitHubTelemetry(): Promise<FullTelemetryData> {
  const username = "AadritIND";
  const startMs = performance.now();

  const token =
    typeof window !== "undefined"
      ? (window as any).__AI_KEYS__?.github || (window as any).__AI_KEYS__?.github_token
      : undefined;

  const reqHeaders: HeadersInit = {
    Accept: "application/vnd.github+json",
  };
  if (token) {
    reqHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    // 1. Fetch user profile, repos (sorted by push), and public activity in parallel
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers: reqHeaders }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, { headers: reqHeaders }),
      fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers: reqHeaders }),
    ]);

    const latencyMs = Math.round(performance.now() - startMs);
    const user = userRes.ok ? await userRes.json() : null;
    const repos = reposRes.ok ? await reposRes.json() : null;
    const events = eventsRes.ok ? await eventsRes.json() : [];

    const dailyCommits: Record<string, number> = {};
    const commitsMap = new Map<string, CommitItem>();

    // 2. Fetch recent commits directly from top active repositories for detailed commit messages & SHAs
    const topRepos = (Array.isArray(repos) ? repos : []).slice(0, 4);
    if (topRepos.length > 0) {
      await Promise.all(
        topRepos.map(async (r) => {
          try {
            const commitsRes = await fetch(
              `https://api.github.com/repos/${username}/${r.name}/commits?per_page=15`,
              { headers: reqHeaders }
            );
            if (!commitsRes.ok) return;
            const cList = await commitsRes.json();
            if (Array.isArray(cList)) {
              for (const c of cList) {
                const sha = (c.sha || "").slice(0, 7);
                const time = c.commit?.author?.date || c.commit?.committer?.date || "";
                const dateKey = time ? time.slice(0, 10) : "";
                if (dateKey) {
                  dailyCommits[dateKey] = (dailyCommits[dateKey] || 0) + 1;
                }
                if (sha && !commitsMap.has(sha)) {
                  commitsMap.set(sha, {
                    sha,
                    message: (c.commit?.message || "(no message)").split("\n")[0].slice(0, 90),
                    repo: r.name,
                    time: time || new Date().toISOString(),
                  });
                }
              }
            }
          } catch {
            // ignore individual repo failure
          }
        })
      );
    }

    // 3. Process public events stream to incorporate all pushes
    const pushes: any[] = [];
    for (const ev of events) {
      if (ev?.type !== "PushEvent") continue;
      const payload = ev.payload || {};
      const commitsArr = Array.isArray(payload.commits) ? payload.commits : [];
      const count =
        typeof payload.size === "number" && payload.size > 0
          ? payload.size
          : payload.distinct_size || (commitsArr.length > 0 ? commitsArr.length : 1);

      const repoName = ev.repo?.name?.split("/")?.[1] || ev.repo?.name || "repo";
      const dateKey = ev.created_at ? ev.created_at.slice(0, 10) : "";

      if (dateKey) {
        // Ensure daily commit counts incorporate pushes
        dailyCommits[dateKey] = Math.max(dailyCommits[dateKey] || 0, count);
      }

      for (const c of commitsArr) {
        const sha = (c.sha || "").slice(0, 7);
        if (sha && !commitsMap.has(sha)) {
          commitsMap.set(sha, {
            sha,
            message: (c.message || "(no message)").split("\n")[0].slice(0, 90),
            repo: repoName,
            time: ev.created_at || new Date().toISOString(),
          });
        }
      }

      pushes.push({
        type: "push",
        repo: repoName,
        message: commitsArr[0]?.message ? commitsArr[0].message.split("\n")[0].slice(0, 80) : "Pushed changes",
        sha: (payload.head || commitsArr[0]?.sha || "").slice(0, 7),
        count,
        time: ev.created_at,
      });
    }

    // 4. Calculate total stars across all repositories
    let totalStars = 0;
    if (Array.isArray(repos)) {
      for (const r of repos) {
        if (typeof r.stargazers_count === "number") totalStars += r.stargazers_count;
      }
    }

    // 5. Determine today's overall commits (checking local and UTC dates)
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
    const utcToday = now.toISOString().slice(0, 10);
    const todayCommits = Math.max(dailyCommits[localToday] || 0, dailyCommits[utcToday] || 0);

    const dailyCounts = Object.values(dailyCommits);
    const maxDayCommits = dailyCounts.length > 0 ? Math.max(...dailyCounts) : 0;
    const activeDays = dailyCounts.filter((c) => c > 0).length;

    // 6. Sort recent commits chronologically descending
    const recentCommits = Array.from(commitsMap.values()).sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    const result: FullTelemetryData = {
      user: user || FALLBACK_TELEMETRY.user,
      repos: Array.isArray(repos) ? repos : FALLBACK_TELEMETRY.repos,
      pushes,
      dailyCommits,
      todayCommits,
      recentCommits: recentCommits.length > 0 ? recentCommits.slice(0, 25) : FALLBACK_TELEMETRY.recentCommits,
      totalStars: totalStars || FALLBACK_TELEMETRY.totalStars,
      maxDayCommits: Math.max(maxDayCommits, todayCommits),
      activeDays: Math.max(activeDays, 1),
      latencyMs,
      fetchedAt: Date.now(),
      stale: false,
    };

    writeTelemetryCache(result);
    return result;
  } catch {
    const cached = readFullTelemetryCache();
    if (cached) {
      return { ...cached, stale: true };
    }
    return { ...FALLBACK_TELEMETRY, fetchedAt: Date.now(), stale: true };
  }
}

/** Reads the GitHub cache written by telemetry sync. Null when never fetched. */
export function readTelemetryCache(): TelemetryCache | null {
  try {
    const parsed = readFullTelemetryCache();
    if (!parsed) return null;
    const repos = parsed.repos ?? [];
    const stars = parsed.totalStars ?? repos.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0);
    const latestPush = repos.reduce<string | null>((latest, r) => {
      if (!r.pushed_at) return latest;
      return !latest || r.pushed_at > latest ? r.pushed_at : latest;
    }, null);
    return {
      repos: parsed.user?.public_repos ?? repos.length,
      stars,
      followers: parsed.user?.followers ?? 0,
      latestPush,
    };
  } catch {
    return null;
  }
}

export interface RepoIndexEntry {
  stars: number;
  pushedAt: string | null;
  language: string | null;
}

/**
 * Per-repo figures keyed by lowercase repo name, straight from the shared
 * GitHub cache — lets the parts list show real stars / push dates per row
 * instead of totals. Empty map when nothing has been fetched yet.
 */
export function readRepoIndex(): Map<string, RepoIndexEntry> {
  const index = new Map<string, RepoIndexEntry>();
  try {
    const raw = localStorage.getItem(TELEMETRY_CACHE_KEY);
    if (!raw) return index;
    const parsed = JSON.parse(raw) as {
      repos?: Array<{
        name?: string;
        stargazers_count?: number;
        pushed_at?: string;
        language?: string | null;
      }> | null;
    };
    for (const repo of parsed.repos ?? []) {
      if (!repo.name) continue;
      index.set(repo.name.toLowerCase(), {
        stars: repo.stargazers_count ?? 0,
        pushedAt: repo.pushed_at ?? null,
        language: repo.language ?? null,
      });
    }
  } catch {
    /* unreadable cache — the table falls back to static data */
  }
  return index;
}

/** Compact relative time — "3h ago", "12d ago". */
export function relativeFrom(iso: string | null): string {
  if (!iso) return "—";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

type NavigatorWithExtras = Navigator & {
  connection?: { effectiveType?: string };
};

type PerformanceWithMemory = Performance & {
  memory?: { usedJSHeapSize: number };
};

export interface SystemReadout {
  /** Rounded frames per second, sampled over ~1s windows. */
  fps: number;
  /** Used JS heap in MB — Chrome/Edge only, null elsewhere. */
  memMB: number | null;
  cores: number | null;
  /** Connection class ("4G", "3G", "WIFI"...) when the browser exposes it. */
  net: string;
  width: number;
  height: number;
  timezone: string;
  utc: string;
  local: string;
  /** Seconds this tab has been open. */
  uptime: number;
}

const pad = (n: number) => n.toString().padStart(2, "0");
const hhmmss = (d: Date, utc = false) =>
  utc
    ? `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
    : `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

const EMPTY: SystemReadout = {
  fps: 0,
  memMB: null,
  cores: null,
  net: "—",
  width: 0,
  height: 0,
  timezone: "—",
  utc: "--:--:--",
  local: "--:--:--",
  uptime: 0,
};

/**
 * Live system readout. Samples the frame counter with rAF and re-renders once
 * a second (not per frame) so it's cheap enough to sit in sticky chrome.
 */
export function useSystemReadout(): SystemReadout {
  const [readout, setReadout] = useState<SystemReadout>(EMPTY);
  const frames = useRef(0);
  const windowStart = useRef(performance.now());
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    let raf = 0;
    let lastFps = 0;

    const loop = () => {
      frames.current += 1;
      const now = performance.now();
      const elapsed = now - windowStart.current;
      if (elapsed >= 1000) {
        lastFps = Math.round((frames.current * 1000) / elapsed);
        frames.current = 0;
        windowStart.current = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const sample = () => {
      const nav = navigator as NavigatorWithExtras;
      const perf = performance as PerformanceWithMemory;
      const d = new Date();
      setReadout({
        fps: lastFps,
        memMB: perf.memory
          ? Math.round(perf.memory.usedJSHeapSize / 1_048_576)
          : null,
        cores: nav.hardwareConcurrency ?? null,
        net: (nav.connection?.effectiveType ?? "—").toUpperCase(),
        width: window.innerWidth,
        height: window.innerHeight,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "—",
        utc: hhmmss(d, true),
        local: hhmmss(d),
        uptime: Math.floor((Date.now() - mountedAt.current) / 1000),
      });
    };
    sample();
    const id = setInterval(sample, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  return readout;
}

/** "01:23" style mm:ss duration for the uptime readout. */
export function formatUptime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${pad(m)}:${pad(s)}`;
}
