import { useEffect, useState } from "react";
import { PROJECTS } from "../data/projects";
import type { Project } from "../data/types";
import {
  TELEMETRY_TTL,
  fetchGitHubTelemetry,
  readFullTelemetryCache,
  type FullTelemetryData,
} from "./telemetry";

/**
 * LIVE CATALOG — the bridge between the curated `PROJECTS` catalog and the
 * real github.com/AadritIND repositories.
 *
 * `mergeProjects()` keeps curated entries (taglines, snippets, benchmarks) by
 * repo name, drops repos that no longer exist, and auto-generates cards for
 * brand-new repos straight from the GitHub API. `useLiveProjects()` wires that
 * into React with a single deduplicated network fetch, so the /work page
 * reflects the true repository list the moment you add or delete a repo —
 * no rebuild required.
 */

interface LiveRepo {
  name: string;
  language?: string | null;
  html_url?: string;
  description?: string | null;
  homepage?: string | null;
  stargazers_count?: number;
  pushed_at?: string;
  topics?: string[];
  archived?: boolean;
  fork?: boolean;
}

const OWNER = "AadritIND";
const OWNER_URL = `https://github.com/${OWNER}`;

const CATEGORY_RULES: Array<{
  match: RegExp;
  category: Project["category"];
  categoryLabel: string;
}> = [
  { match: /(ai|llm|prompt|gpt|agent|ml|neural|forge)/i, category: "AI", categoryLabel: "AI Tooling" },
  { match: /(site|web|portfolio|landing|page|blog)/i, category: "WEBSITES", categoryLabel: "Website" },
  {
    match: /(tool|cli|convert|print|util|server|bridge|morph|vault)/i,
    category: "TOOLS",
    categoryLabel: "Developer Tool",
  },
  {
    match: /(flow|focus|tracker|app|manager|board|notes)/i,
    category: "APPS",
    categoryLabel: "Application",
  },
];

function guessCategory(name: string, topics: string[] = []) {
  const haystack = `${name} ${topics.join(" ")}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.match.test(haystack)) {
      return { category: rule.category, categoryLabel: rule.categoryLabel };
    }
  }
  return { category: "APPS" as const, categoryLabel: "Application" };
}

function snippetFor(
  name: string,
  description: string,
  language: string | null | undefined,
): Project["codeSnippet"] {
  if (/markdown/i.test(language || "")) {
    return { lang: "markdown", filename: "README.md", code: `# ${name}\n\n${description}\n` };
  }
  if (/(html|css)/i.test(language || "")) {
    return {
      lang: "html",
      filename: "index.html",
      code: `<!-- ${name} — ${description} -->\n<section id="${name.toLowerCase()}">\n  <!-- shipped -->\n</section>`,
    };
  }
  return {
    lang: "javascript",
    filename: "index.js",
    code: `// ${name} — ${description}\nexport const REPO = {\n  name: '${name}',\n  owner: '${OWNER}',\n  status: 'active',\n};`,
  };
}

function repoToProject(repo: LiveRepo): Project {
  const desc = repo.description || `Public repository — ${repo.name}.`;
  const guessed = guessCategory(repo.name, repo.topics || []);
  const topics = (repo.topics || []).slice(0, 5);
  return {
    id: repo.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: repo.name,
    category: guessed.category,
    categoryLabel: guessed.categoryLabel,
    tagline: desc.slice(0, 120),
    description: desc,
    language: repo.language || "Other",
    tags: topics.length ? topics : [repo.language || "Code", "GitHub"],
    githubUrl: repo.html_url || `${OWNER_URL}/${repo.name}`,
    ...(repo.homepage ? { liveUrl: repo.homepage } : {}),
    status: "active",
    codeSnippet: snippetFor(repo.name, desc, repo.language),
  };
}

/** Merge the curated catalog with a live repo list. */
export function mergeProjects(telemetry: FullTelemetryData | null): Project[] {
  const repos = telemetry?.repos as LiveRepo[] | null | undefined;
  if (!Array.isArray(repos) || repos.length === 0) return PROJECTS;

  const byName = new Map(PROJECTS.map((p) => [p.name.toLowerCase(), p]));
  const merged: Project[] = [];

  for (const repo of repos) {
    if (!repo?.name) continue;
    if (repo.name === "Portfolio" || repo.archived || repo.fork) continue;
    const key = repo.name.toLowerCase();
    // Curated copy wins; a brand-new repo gets a generated card.
    merged.push(byName.get(key) ?? repoToProject(repo));
  }

  // If nothing matched at all (unexpected payload), don't blank the page.
  return merged.length > 0 ? merged : PROJECTS;
}

/** Deduplicate the GitHub telemetry fetch across concurrent hooks. */
let inFlight: Promise<FullTelemetryData> | null = null;
function ensureTelemetry(): Promise<FullTelemetryData> {
  if (!inFlight) {
    inFlight = fetchGitHubTelemetry().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

/**
 * Reactive project catalog: curated entries enriched with the live GitHub repo
 * list. Hydrates from cache instantly, then refreshes when the cache is stale.
 */
export function useLiveProjects(): Project[] {
  const [projects, setProjects] = useState<Project[]>(() =>
    mergeProjects(readFullTelemetryCache()),
  );

  useEffect(() => {
    let cancelled = false;

    const cached = readFullTelemetryCache();
    const fresh = cached && !cached.stale && Date.now() - cached.fetchedAt < TELEMETRY_TTL;
    if (fresh) return;

    (async () => {
      try {
        const telemetry = await ensureTelemetry();
        if (!cancelled) setProjects(mergeProjects(telemetry));
      } catch {
        // keep the current list on network failure
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return projects;
}
