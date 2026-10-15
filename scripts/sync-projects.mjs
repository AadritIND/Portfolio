#!/usr/bin/env node
/**
 * sync-projects.mjs — keeps src/data/projects.ts in sync with the real
 * github.com/AadritIND repositories.
 *
 *   - New public repos on GitHub get added to the catalog automatically.
 *   - Deleted repos are removed from the catalog automatically.
 *   - Existing curated entries (taglines, descriptions, live URLs, snippets)
 *     are preserved by name; new repos get generated defaults.
 *
 * Runs automatically before every build (`prebuild`). If the GitHub API is
 * unreachable it exits 0 and leaves the file untouched so builds never break.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "src", "data", "projects.ts");
const OWNER = "AadritIND";

const CATEGORY_RULES = [
  { match: /(ai|llm|prompt|gpt|agent|ml|neural|forge)/i, category: "AI", categoryLabel: "AI Tooling" },
  { match: /(site|web|portfolio|landing|page|blog)/i, category: "WEBSITES", categoryLabel: "Website" },
  { match: /(tool|cli|convert|print|util|server|bridge|morph|vault)/i, category: "TOOLS", categoryLabel: "Developer Tool" },
  { match: /(flow|focus|tracker|app|manager|board|notes)/i, category: "APPS", categoryLabel: "Application" },
];

/**
 * Curated copy for known repositories. Keys are lowercase repo names. Any repo
 * not listed here is still synced automatically with generated defaults, so a
 * brand-new repo shows up on /work without touching this file.
 */
const CURATED = {
  focusflow: {
    category: "APPS",
    categoryLabel: "Real-Time Study Timer",
    tagline: "Shared study timer — permanent room codes and live multi-device sync",
    description:
      "A shared study timer: permanent room codes, live multi-device sync, and history that keeps every session. Cloudflare Workers + D1 + React.",
    tags: ["Cloudflare Workers", "D1", "React", "Real-Time"],
    benchmark: "LIVE MULTI-DEVICE",
    codeSnippet: {
      lang: "typescript",
      filename: "worker.ts",
      code: `// focusFlow — shared room timer (Cloudflare Worker)\nexport default {\n  async fetch(req: Request, env: Env) {\n    const room = new URL(req.url).searchParams.get('room');\n    const state = await env.DB.prepare('SELECT * FROM rooms WHERE code = ?').bind(room).first();\n    return Response.json({ room, state, synced: Date.now() });\n  },\n};`,
    },
  },
  "formula-1": {
    category: "WEBSITES",
    categoryLabel: "F1 Fan Site",
    tagline: "APEX Race Culture — multi-backend Formula 1 fan site",
    description:
      "APEX Race Culture — a multi-backend Formula 1 fan site for race culture, season data and visuals.",
    tags: ["F1", "Fan Site", "Multi-Backend"],
    benchmark: "MULTI-BACKEND",
    codeSnippet: {
      lang: "javascript",
      filename: "apex.js",
      code: `// Formula-1 — APEX Race Culture data layer\nexport const BACKENDS = ['races', 'drivers', 'constructors'];\nexport const fetchSeason = (year, backend) =>\n  BACKENDS.includes(backend) ? api(\`/\${year}/\${backend}\`) : null;`,
    },
  },
  conduit: {
    category: "WEBSITES",
    categoryLabel: "Real-Time Collaboration",
    tagline: "E2E-encrypted real-time collaboration rooms: chat, WebRTC file transfer",
    description:
      "Encrypted collaboration rooms with real-time chat, WebRTC peer-to-peer file transfer, and presence — built on Vite, Fastify and PostgreSQL with end-to-end encryption by default.",
    tags: ["E2EE", "WebRTC", "Fastify", "PostgreSQL", "Vite"],
    benchmark: "E2E-ENCRYPTED RELAY",
    codeSnippet: {
      lang: "typescript",
      filename: "room_gateway.ts",
      code: `// Conduit — encrypted room gateway\nimport { createServer } from 'node:http';\n\nexport const gateway = createServer((req, res) => {\n  // Rooms are end-to-end encrypted; the relay only sees ciphertext.\n  res.writeHead(200, { 'content-type': 'application/json' });\n  res.end(JSON.stringify({ e2ee: true, rooms: ['lobby'] }));\n});`,
    },
  },
  filemorph: {
    category: "TOOLS",
    categoryLabel: "File Conversion & Transcription",
    tagline: "Free online file converter & audio transcriber with content preservation",
    description:
      "Documents, images and audio converted with full content preservation — LibreOffice headless, pdf2docx and Sharp pipelines behind a simple upload-and-download interface.",
    tags: ["LibreOffice", "pdf2docx", "Sharp", "Transcription", "Vercel"],
    benchmark: "LOSSLESS CONVERSION",
    codeSnippet: {
      lang: "javascript",
      filename: "convert_pipeline.js",
      code: `// FileMorph — conversion pipeline dispatcher\nimport sharp from 'sharp';\n\nexport async function convert(file, target) {\n  const pipeline = PIPELINES[file.kind];\n  if (!pipeline) throw new Error(\`Unsupported: \${file.kind}\`);\n  return pipeline.preserve(file).to(target);\n}`,
    },
  },
  formulavault: {
    category: "APPS",
    categoryLabel: "Offline-First Study App",
    tagline: "Offline-first study app for CBSE 11/12 & JEE — 833 formula cards",
    description:
      "Offline-first study app for CBSE 11/12 and JEE — 833 formula cards, typo-tolerant search, and an AI tutor that runs on your own API key.",
    tags: ["PWA", "Offline-First", "Search", "AI Tutor"],
    benchmark: "833 FORMULA CARDS",
    codeSnippet: {
      lang: "javascript",
      filename: "search.js",
      code: `// FormulaVault — typo-tolerant formula search\nexport const search = (q, cards) => {\n  const needle = q.toLowerCase().trim();\n  return cards\n    .map((c) => ({ c, score: fuzzy(c.title, needle) }))\n    .filter(({ score }) => score > 0.6)\n    .sort((a, b) => b.score - a.score);\n};`,
    },
  },
  printbridge: {
    category: "TOOLS",
    categoryLabel: "Self-Hosted Print Server",
    tagline: "Upload from anywhere, preview exactly what prints, print unattended",
    description:
      "Self-hosted print server: upload from anywhere, preview exactly what prints, and print on a Wi-Fi or USB printer — unattended.",
    tags: ["CUPS", "Printing", "Self-Hosted", "Preview"],
    benchmark: "UNATTENDED PRINTING",
    codeSnippet: {
      lang: "javascript",
      filename: "queue.js",
      code: `// printbridge — job queue\nexport async function enqueue(job) {\n  const preview = await render(job.file);\n  return cups.submit({ ...job, preview, unattended: true });\n}`,
    },
  },
  "prompt-forge": {
    category: "AI",
    categoryLabel: "AI Prompt Engineering Tool",
    tagline: "Describe the task, get the prompt that actually works",
    description:
      "Describe the task, get the prompt that actually works. Five pluggable AI backends with per-request model selection.",
    tags: ["AI", "Prompts", "Multi-Backend", "Model Selection"],
    benchmark: "5 AI BACKENDS",
    codeSnippet: {
      lang: "javascript",
      filename: "forge.js",
      code: `// prompt-forge — backend registry\nexport async function forge(task, { backend, model }) {\n  const compiled = compileTask(task); // task -> structured prompt spec\n  return BACKENDS[backend](compiled, { model });\n}`,
    },
  },
  aadritind: {
    category: "EXPERIMENTS",
    categoryLabel: "Profile & Config Hub",
    tagline: "GitHub profile, configs and everything that glues the workflow together",
    language: "Markdown",
    description:
      "The profile repository — README, workspace configs, and the setup notes that keep the rest of the stack coherent.",
    tags: ["GitHub", "Config", "Workflow"],
    benchmark: "PROFILE HUB",
    codeSnippet: {
      lang: "markdown",
      filename: "README.md",
      code: `# Aadrit\n\nFull-Stack Developer · Cybersecurity & Ethical Hacking · AI/ML explorer\n\n> Passionate about understanding technology deeply —\n> not just using it, but taking it apart.`,
    },
  },
};

function guessCategory(name, topics = []) {
  const haystack = `${name} ${topics.join(" ")}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.match.test(haystack)) return { category: rule.category, categoryLabel: rule.categoryLabel };
  }
  return { category: "APPS", categoryLabel: "Application" };
}

function snippetFor(name, description, language) {
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

/** Read whatever is currently in projects.ts so curated metadata survives. */
function readExisting() {
  try {
    const raw = fs.readFileSync(dataPath, "utf8");
    const decl = raw.indexOf("= [");
    const start = decl === -1 ? -1 : decl + 1;
    const end = raw.lastIndexOf("]");
    if (start === -1 || end === -1 || end < start) return [];
    const parsed = JSON.parse(raw.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeProjects(projects) {
  const header = `import type { Project } from "./types";

/**
 * Project catalog — every entry maps to a real repository at
 * github.com/${OWNER}. Regenerated by scripts/sync-projects.mjs from the live
 * GitHub API (curated metadata is preserved by repo name). Hand edits to
 * existing entries survive; entries are added/removed automatically.
 */
export const PROJECTS: Project[] = `;
  fs.writeFileSync(dataPath, `${header}${JSON.stringify(projects, null, 2)};\n`);
}

async function main() {
  const existing = readExisting();
  const byName = new Map(existing.map((p) => [String(p.name).toLowerCase(), p]));

  const res = await fetch(
    `https://api.github.com/users/${OWNER}/repos?per_page=100&sort=pushed`,
    { headers: { Accept: "application/vnd.github+json" } }
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const repos = await res.json();

  const live = repos.filter((r) => !r.archived && !r.fork && r.name !== "Portfolio");

  const projects = live.map((r) => {
    const key = r.name.toLowerCase();
    const curated = byName.get(key);
    const override = CURATED[key];
    const desc = override?.description || r.description || curated?.tagline || `Public repository — ${r.name}.`;
    const guessed = guessCategory(r.name, r.topics || []);

    // Merge priority: curated override (authored copy) > existing file entry
    // (hand edits survive) > generated defaults for a brand-new repo.
    const base = override ? { ...curated, ...override } : curated;
    const merged = {
      category: guessed.category,
      categoryLabel: guessed.categoryLabel,
      tagline: desc.slice(0, 120),
      description: desc,
      language: r.language || "Other",
      tags: (r.topics || []).slice(0, 5).length ? (r.topics || []).slice(0, 5) : [r.language || "Code", "GitHub"],
      status: "active",
      ...(base || {}),
    };

    return {
      ...merged,
      id: r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: r.name,
      language: merged.language || r.language || "Other",
      githubUrl: r.html_url,
      ...(r.homepage && !merged.liveUrl ? { liveUrl: r.homepage } : {}),
      codeSnippet: merged.codeSnippet || snippetFor(r.name, desc, r.language),
    };
  });

  const before = JSON.stringify(existing);
  const after = JSON.stringify(projects);
  if (before === after) {
    console.log(`sync-projects: unchanged (${projects.length} repos)`);
    return;
  }

  const added = projects.filter((p) => !byName.has(String(p.name).toLowerCase())).map((p) => p.name);
  const removed = existing.filter((p) => !projects.some((q) => q.name === p.name)).map((p) => p.name);
  writeProjects(projects);
  console.log(
    `sync-projects: ${projects.length} repos` +
      (added.length ? ` | added: ${added.join(", ")}` : "") +
      (removed.length ? ` | removed: ${removed.join(", ")}` : "")
  );
}

main().catch((err) => {
  console.warn(`sync-projects: skipped (${err.message}) — keeping existing catalog`);
  process.exit(0);
});
