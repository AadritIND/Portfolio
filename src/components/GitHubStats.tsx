import { useEffect, useState, useMemo } from "react";
import { animate, motion } from "framer-motion";
import {
  GitFork,
  GitBranch,
  Users,
  RefreshCw,
  Star,
  CheckCircle2,
  Calendar,
  Copy,
  Check,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { IDENTITY } from "../data/types";
import SheetTag from "./SheetTag";
import {
  fetchGitHubTelemetry,
  readFullTelemetryCache,
  relativeFrom,
  TELEMETRY_TTL,
  type FullTelemetryData,
  type CommitItem,
} from "../lib/telemetry";
import { soundFX } from "../lib/sound";

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  const [last, setLast] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (target === last && value === target) return;
    setLast(target);
    const controls = animate(value, target, {
      duration: 1.1,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, active, last, value]);

  return value;
}

interface DayCell {
  dateStr: string;
  dateObj: Date;
  dayOfWeek: number;
  count: number;
  isToday: boolean;
  level: number;
}

/**
 * Builds an authentic 7-row GitHub contribution grid for the past N weeks.
 * Rows = 0 (Sun) .. 6 (Sat)
 * Columns = week index
 */
function generateContributionWeeks(
  dailyCommits: Record<string, number>,
  numWeeks = 16
): { weeks: DayCell[][]; months: { label: string; weekIndex: number }[] } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayDayOfWeek = today.getDay(); // 0 is Sun, 6 is Sat
  const totalDays = numWeeks * 7 + (todayDayOfWeek + 1);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - totalDays + 1);

  const allDays: DayCell[] = [];
  const curr = new Date(startDate);

  while (curr <= today) {
    const yyyy = curr.getFullYear();
    const mm = String(curr.getMonth() + 1).padStart(2, "0");
    const dd = String(curr.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const count = dailyCommits[dateStr] || 0;
    let level = 0;
    if (count >= 6) level = 4;
    else if (count >= 4) level = 3;
    else if (count >= 2) level = 2;
    else if (count >= 1) level = 1;

    allDays.push({
      dateStr,
      dateObj: new Date(curr),
      dayOfWeek: curr.getDay(),
      count,
      isToday: curr.getTime() === today.getTime(),
      level,
    });

    curr.setDate(curr.getDate() + 1);
  }

  // Group into columns of 7 days (weeks)
  const weeks: DayCell[][] = [];
  let currentWeek: DayCell[] = [];

  for (let i = 0; i < allDays.length; i++) {
    currentWeek.push(allDays[i]);
    if (currentWeek.length === 7 || i === allDays.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Calculate month labels positioned over starting week of each month
  const months: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, wIdx) => {
    const firstDay = week[0]?.dateObj;
    if (firstDay && firstDay.getMonth() !== lastMonth) {
      lastMonth = firstDay.getMonth();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      months.push({ label: monthNames[lastMonth], weekIndex: wIdx });
    }
  });

  return { weeks, months };
}

export default function GitHubStats() {
  const [data, setData] = useState<FullTelemetryData | null>(() => readFullTelemetryCache());
  const [status, setStatus] = useState<"loading" | "live" | "cached" | "error">(
    () => (readFullTelemetryCache() ? "cached" : "loading")
  );
  const [activeTab, setActiveTab] = useState<"grid" | "past">("grid");
  const [hoveredDay, setHoveredDay] = useState<DayCell | null>(null);
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const cached = readFullTelemetryCache();
      if (cached && Date.now() - cached.fetchedAt < TELEMETRY_TTL) {
        if (!cancelled) {
          setData(cached);
          setStatus(cached.stale ? "cached" : "live");
        }
        return;
      }

      try {
        const next = await fetchGitHubTelemetry();
        if (!cancelled) {
          setData(next);
          setStatus("live");
        }
      } catch {
        if (!cancelled) {
          const fallback = readFullTelemetryCache();
          if (fallback) {
            setData(fallback);
            setStatus("cached");
          } else {
            setStatus("error");
          }
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const user = data?.user ?? null;
  const ready = status !== "loading";
  const reposCount = useCountUp(user?.public_repos ?? 7, ready);
  const totalStars = data?.totalStars ?? 0;
  const starsCount = useCountUp(totalStars, ready);
  const dailyCommits = data?.dailyCommits ?? {};
  const todayCommits = data?.todayCommits ?? 0;
  const recentCommits = data?.recentCommits ?? [];
  const maxDayCommits = data?.maxDayCommits ?? 0;
  const activeDays = data?.activeDays ?? 0;

  const { weeks, months } = useMemo(
    () => generateContributionWeeks(dailyCommits, 16),
    [dailyCommits]
  );

  const handleCopySha = (sha: string) => {
    soundFX.playClick();
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 1800);
  };

  const handleRefresh = async () => {
    soundFX.playClick();
    setStatus("loading");
    try {
      const refreshed = await fetchGitHubTelemetry();
      setData(refreshed);
      setStatus("live");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="telemetry"
      className="py-24 px-4 sm:px-8 bg-[#F8F9FA] text-[#0D0E12] border-t border-zinc-200 relative overflow-hidden bg-dot-matrix"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <SheetTag sheet="05" label="COMMIT LOG" meta={["GITHUB API", "DAILY MATRIX"]} className="mb-10" />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-8 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="font-tech text-[9px] uppercase tracking-[0.2em] text-accent">
                DAILY COMMIT MATRIX
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-zinc-200 font-mono-code text-[9px] text-zinc-600">
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
                {status === "live" ? "LIVE SYNC" : status === "cached" ? "CACHED" : status === "error" ? "OFFLINE" : "SYNCING"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-accent/10 to-amber-500/10 border border-accent/30 font-mono-code text-[9px] text-accent font-semibold">
                <ShieldCheck className="w-3 h-3 text-accent" />
                GitHub Developer Member
              </span>
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
              <span>GITHUB PROFILE</span>
            </a>
            <button
              onClick={handleRefresh}
              title="Force re-sync from GitHub API"
              className="p-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:text-accent hover:border-accent transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status === "loading" ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 4 Stat Cards — Notice: TOTAL COMMITS count section is removed, replaced by Developer Member & Ecosystem stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "PUBLIC REPOSITORIES",
              value: ready ? reposCount : "—",
              sub: "Active public repositories",
              icon: <GitFork className="w-4 h-4" />,
            },
            {
              label: "DEVELOPER STATUS",
              value: "MEMBER",
              sub: "GitHub Developer Program",
              icon: <ShieldCheck className="w-4 h-4" />,
              isBadge: true,
            },
            {
              label: "ON GITHUB SINCE",
              value: user ? new Date(user.created_at).getFullYear() : "2025",
              sub: "Verified developer account",
              icon: <Users className="w-4 h-4" />,
            },
            {
              label: "TOTAL STARS",
              value: ready ? starsCount : "—",
              sub: "Community repo stars",
              icon: <Star className="w-4 h-4" />,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="p-6 rounded-2xl bg-white border border-zinc-200 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition brackets"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-tech text-[8px] tracking-[0.18em] text-zinc-500">{stat.label}</span>
                <span className="text-accent">{stat.icon}</span>
              </div>
              <div className="font-display font-black text-2xl sm:text-3xl text-[#0D0E12] tracking-tight flex items-center gap-2">
                {stat.value}
                {stat.isBadge && (
                  <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    VERIFIED
                  </span>
                )}
              </div>
              <p className="font-mono-code text-[10px] text-zinc-500 mt-3 leading-relaxed">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Small, Highly Superior Commit Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl bg-white border border-zinc-200 shadow-xl overflow-hidden relative"
        >
          {/* Subtle Cyber Accent Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

          {/* Section Toolbar & Overall Day Commit HUD */}
          <div className="p-6 sm:p-8 border-b border-zinc-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 bg-zinc-50/50">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-tech text-[9px] tracking-[0.2em] text-accent uppercase font-bold">
                  OVERALL DAILY COMMITS
                </span>
                <span className="flex items-center gap-1 font-mono-code text-[9px] text-zinc-500 bg-white px-2 py-0.5 rounded border border-zinc-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  TOTAL FOR TODAY
                </span>
              </div>

              {/* Today's Overall Commits Big Feature */}
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-display font-black text-4xl sm:text-5xl text-[#0D0E12] tracking-tight">
                  {todayCommits}
                </span>
                <span className="font-mono-code text-sm sm:text-base font-bold text-zinc-700">
                  {todayCommits === 1 ? "COMMIT" : "COMMITS"} TODAY
                </span>
                <span className="font-mono-code text-xs text-zinc-400">
                  ({new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })})
                </span>
              </div>
            </div>

            {/* Quick Metrics & View Switcher */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 border border-zinc-200 bg-white px-3.5 py-2 rounded-xl font-mono-code text-xs">
                <div className="flex items-center gap-1.5 text-zinc-600">
                  <Flame className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px] text-zinc-400">PEAK DAY:</span>
                  <strong className="text-zinc-900">{maxDayCommits}</strong>
                </div>
                <span className="text-zinc-300">|</span>
                <div className="flex items-center gap-1.5 text-zinc-600">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] text-zinc-400">ACTIVE DAYS:</span>
                  <strong className="text-zinc-900">{activeDays}</strong>
                </div>
              </div>

              <div className="flex items-center gap-1 p-1 bg-zinc-200/60 rounded-xl font-tech text-[9px]">
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setActiveTab("grid");
                  }}
                  className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
                    activeTab === "grid"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  HEATMAP GRID
                </button>
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setActiveTab("past");
                  }}
                  className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
                    activeTab === "past"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  PAST COMMITS ({recentCommits.length})
                </button>
              </div>
            </div>
          </div>

          {/* Tab 1: Enhanced GitHub-Style Contribution Heat Matrix */}
          {activeTab === "grid" && (
            <div className="p-6 sm:p-8">
              <div className="flex flex-col xl:flex-row items-start justify-between gap-6 mb-6">
                <div>
                  <h4 className="font-display font-bold text-lg text-zinc-900">
                    CONTRIBUTION CALENDAR (16 WEEKS)
                  </h4>
                  <p className="font-mono-code text-[11px] text-zinc-500 mt-0.5">
                    Hover any cell to inspect overall commits recorded for that specific day.
                  </p>
                </div>

                {/* Live Day Inspector Pill */}
                <div className="px-3.5 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-mono-code flex items-center gap-2">
                  <span className="text-zinc-500">SELECTED:</span>
                  <span className="font-bold text-zinc-900">
                    {hoveredDay
                      ? `${hoveredDay.dateStr} · ${hoveredDay.count} commit${hoveredDay.count === 1 ? "" : "s"}`
                      : `${todayCommits} commit${todayCommits === 1 ? "" : "s"} today`}
                  </span>
                  {hoveredDay?.isToday && (
                    <span className="px-1.5 py-0.2 rounded bg-accent/10 text-accent text-[9px] font-bold">
                      TODAY
                    </span>
                  )}
                </div>
              </div>

              {/* The Grid Canvas Container */}
              <div className="overflow-x-auto pb-4">
                <div className="inline-block min-w-[700px]">
                  {/* Months Header Row */}
                  <div className="flex ml-8 mb-2 font-mono-code text-[10px] text-zinc-400">
                    {weeks.map((_, wIdx) => {
                      const matchedMonth = months.find((m) => m.weekIndex === wIdx);
                      return (
                        <div key={wIdx} className="w-[18px] mr-1 text-center font-semibold">
                          {matchedMonth ? matchedMonth.label : ""}
                        </div>
                      );
                    })}
                  </div>

                  {/* 7-Row Week Matrix (Mon -> Sun) */}
                  <div className="flex items-start">
                    {/* Day labels column */}
                    <div className="flex flex-col justify-between h-[126px] mr-2 text-[9px] font-mono-code text-zinc-400 select-none py-0.5">
                      <span>Mon</span>
                      <span>Wed</span>
                      <span>Fri</span>
                      <span>Sun</span>
                    </div>

                    {/* Columns of weeks */}
                    <div className="flex gap-1">
                      {weeks.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-1">
                          {week.map((day) => {
                            const isSelected = hoveredDay?.dateStr === day.dateStr;
                            return (
                              <button
                                key={day.dateStr}
                                onMouseEnter={() => setHoveredDay(day)}
                                onClick={() => {
                                  soundFX.playClick();
                                  setHoveredDay(day);
                                }}
                                className={`w-4 h-4 rounded-sm transition-all duration-200 cursor-pointer relative group ${
                                  day.isToday ? "ring-2 ring-accent ring-offset-1 ring-offset-white" : ""
                                } ${isSelected ? "scale-125 z-20 shadow-md" : "hover:scale-115 hover:z-10"}`}
                                style={{
                                  backgroundColor:
                                    day.level === 0
                                      ? "rgba(0, 0, 0, 0.04)"
                                      : day.level === 1
                                        ? "rgba(217, 72, 15, 0.28)"
                                        : day.level === 2
                                          ? "rgba(217, 72, 15, 0.54)"
                                          : day.level === 3
                                            ? "rgba(217, 72, 15, 0.78)"
                                            : "rgba(217, 72, 15, 1.0)",
                                  border:
                                    day.level > 0
                                      ? "1px solid rgba(217, 72, 15, 0.45)"
                                      : "1px solid rgba(0, 0, 0, 0.08)",
                                }}
                                title={`${day.dateStr}: ${day.count} commits`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend & Footnote */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-zinc-100 text-[10px] font-mono-code text-zinc-500">
                <div className="flex items-center gap-2">
                  <span>LESS</span>
                  {[0, 1, 2, 3, 4].map((lvl) => (
                    <span
                      key={lvl}
                      className="inline-block w-3 h-3 rounded-xs"
                      style={{
                        backgroundColor:
                          lvl === 0
                            ? "rgba(0, 0, 0, 0.04)"
                            : lvl === 1
                              ? "rgba(217, 72, 15, 0.28)"
                              : lvl === 2
                                ? "rgba(217, 72, 15, 0.54)"
                                : lvl === 3
                                  ? "rgba(217, 72, 15, 0.78)"
                                  : "rgba(217, 72, 15, 1.0)",
                        border: lvl > 0 ? "1px solid rgba(217, 72, 15, 0.4)" : "1px solid rgba(0,0,0,0.08)",
                      }}
                    />
                  ))}
                  <span>MORE</span>
                </div>

                <div className="flex items-center gap-1.5 text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Real-time aggregate sync from public GitHub API</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Past Commits Stream (Overall Chronological Feed) */}
          {activeTab === "past" && (
            <div className="p-6 sm:p-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-lg text-zinc-900">
                    PAST COMMITS STREAM
                  </h4>
                  <p className="font-mono-code text-[11px] text-zinc-500">
                    Unified chronological feed of commits across all public repositories.
                  </p>
                </div>
                <span className="font-mono-code text-xs px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-600">
                  {recentCommits.length} RECENT COMMITS
                </span>
              </div>

              {recentCommits.length === 0 ? (
                <div className="py-12 text-center font-mono-code text-xs text-zinc-400">
                  No public commit events found in the current cache window.
                </div>
              ) : (
                <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 divide-y divide-zinc-100">
                  {recentCommits.map((item, idx) => (
                    <div
                      key={`${item.sha}-${idx}`}
                      className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono-code hover:bg-zinc-50 p-2 rounded-xl transition"
                    >
                      <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                        <span className="text-zinc-400 text-[10px] shrink-0 font-bold">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold text-[10px] shrink-0">
                          {item.repo}
                        </span>
                        <span className="text-zinc-800 font-medium truncate" title={item.message}>
                          {item.message}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-zinc-400 text-[11px]">
                        <span>{relativeFrom(item.time)}</span>
                        <button
                          onClick={() => handleCopySha(item.sha)}
                          title="Copy commit SHA"
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition cursor-pointer"
                        >
                          {copiedSha === item.sha ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600 font-bold">COPIED</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-zinc-400" />
                              <span>{item.sha}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export function readCommitFeed(): readonly CommitItem[] {
  try {
    const raw = readFullTelemetryCache();
    return raw?.recentCommits ?? [];
  } catch {
    return [];
  }
}

export function readCommitCount(): number {
  try {
    const raw = readFullTelemetryCache();
    return raw?.todayCommits ?? 0;
  } catch {
    return 0;
  }
}
