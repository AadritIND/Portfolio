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

const CACHE_KEY = "github_telemetry_v1";

export interface TelemetryCache {
  repos: number;
  stars: number;
  followers: number;
  latestPush: string | null;
}

/** Reads the GitHub cache written by <GitHubStats />. Null when never fetched. */
export function readTelemetryCache(): TelemetryCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      user?: { public_repos?: number; followers?: number };
      repos?: Array<{ stargazers_count?: number; pushed_at?: string }> | null;
    };
    const repos = parsed.repos ?? [];
    const stars = repos.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0);
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
    const raw = localStorage.getItem(CACHE_KEY);
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
