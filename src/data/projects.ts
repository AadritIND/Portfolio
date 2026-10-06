import type { Project } from "./types";

/**
 * Project catalog — every entry maps to a real repository at
 * github.com/Aadrit1234. Structure mirrors the original portfolio's catalog
 * (category, categoryLabel, tagline, description, language, tags,
 * githubUrl, liveUrl, benchmark, status, codeSnippet) with the same
 * command-shell fidelity on the /work terminal.
 */
export const PROJECTS: Project[] = [
  {
    id: "conduit",
    name: "conduit",
    category: "WEBSITES",
    categoryLabel: "Real-Time Collaboration",
    tagline: "E2E-encrypted real-time collaboration rooms: chat, WebRTC file transfer",
    description:
      "Encrypted collaboration rooms with real-time chat, WebRTC peer-to-peer file transfer, and presence — built on Vite, Fastify and PostgreSQL with end-to-end encryption by default.",
    language: "TypeScript",
    tags: ["E2EE", "WebRTC", "Fastify", "PostgreSQL", "Vite"],
    githubUrl: "https://github.com/Aadrit1234/conduit",
    liveUrl: "https://conduit-liard.vercel.app",
    benchmark: "E2E-ENCRYPTED RELAY",
    status: "active",
    codeSnippet: {
      lang: "typescript",
      filename: "room_gateway.ts",
      code: `// Conduit — encrypted room gateway
import { createServer } from 'node:http';

export class ConduitRoom {
  constructor(private roomId: string, private keyring: CryptoKey) {}

  async admit(peer: PeerConnection): Promise<void> {
    // Derive a per-room key; nothing leaves the room unencrypted.
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.keyring,
      encode(peer.metadata),
    );
    await this.relay.join(this.roomId, peer, { cipher, iv });
  }
}`,
    },
  },
  {
    id: "filemorph",
    name: "filemorph",
    category: "TOOLS",
    categoryLabel: "File Conversion & Transcription",
    tagline: "Free online file converter & audio transcriber with content preservation",
    description:
      "Documents, images and audio converted with full content preservation — LibreOffice headless, pdf2docx and Sharp pipelines behind a simple upload-and-download interface.",
    language: "CSS / JS",
    tags: ["LibreOffice", "pdf2docx", "Sharp", "Transcription", "Vercel"],
    githubUrl: "https://github.com/Aadrit1234/filemorph",
    liveUrl: "https://filemorph-dusky.vercel.app",
    benchmark: "LOSSLESS CONVERSION",
    status: "active",
    codeSnippet: {
      lang: "javascript",
      filename: "convert_pipeline.js",
      code: `// FileMorph — conversion pipeline dispatcher
import sharp from 'sharp';

export async function convert(file, target) {
  const pipeline = PIPELINES[file.kind];
  if (!pipeline) throw new Error(\`Unsupported: \${file.kind}\`);

  // Preserve metadata + structure, then transcode to the target format.
  const preserved = await pipeline.preserve(file.buffer);
  return pipeline.transcode(preserved, target, {
    quality: 'lossless-first',
    fallback: pipeline.chain,
  });
}`,
    },
  },
  {
    id: "formulavault",
    name: "FormulaVault",
    category: "APPS",
    categoryLabel: "Offline-First Study App",
    tagline: "Offline-first study app for CBSE 11/12 & JEE — 833 formula cards",
    description:
      "833 formula cards with typo-tolerant search and an AI tutor running on your own API key. Everything works offline-first: your vault, your device, zero accounts.",
    language: "HTML / JS",
    tags: ["Offline-First", "PWA", "Typo-Tolerant Search", "AI Tutor", "IndexedDB"],
    githubUrl: "https://github.com/Aadrit1234/FormulaVault",
    liveUrl: "https://formulav.vercel.app",
    benchmark: "833 FORMULA CARDS",
    status: "active",
    codeSnippet: {
      lang: "javascript",
      filename: "fuzzy_search.js",
      code: `// FormulaVault — typo-tolerant formula lookup
export function searchFormulas(query, vault) {
  const q = normalize(query);
  return vault
    .map((card) => ({
      card,
      score: trigramSimilarity(q, normalize(card.title + ' ' + card.topic)),
    }))
    .filter((r) => r.score > 0.42)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}`,
    },
  },
  {
    id: "printbridge",
    name: "printbridge",
    category: "TOOLS",
    categoryLabel: "Self-Hosted Print Server",
    tagline: "Upload from anywhere, preview exactly what prints, print unattended",
    description:
      "Self-hosted print server for Wi-Fi and USB printers: upload from any device, preview the exact output, and print unattended — no cloud, no drivers, no surprises.",
    language: "JavaScript",
    tags: ["Self-Hosted", "CUPS", "Wi-Fi Printing", "Preview", "Node.js"],
    githubUrl: "https://github.com/Aadrit1234/printbridge",
    benchmark: "UNATTENDED PRINTING",
    status: "active",
    codeSnippet: {
      lang: "javascript",
      filename: "print_queue.js",
      code: `// PrintBridge — unattended print queue
export class PrintQueue {
  constructor(printer, opts = {}) {
    this.printer = printer;
    this.mode = opts.mode ?? 'exact-preview'; // WYSIWYG or bust
  }

  async enqueue(job) {
    const preview = await this.printer.renderPreview(job);
    await this.persist(job.id, preview); // shown on the dashboard
    return this.printer.spool(job);
  }
}`,
    },
  },
  {
    id: "prompt-forge",
    name: "prompt-forge",
    category: "AI",
    categoryLabel: "AI Prompt Engineering Tool",
    tagline: "Describe the task, get the prompt that actually works",
    description:
      "A prompt compiler for AI workflows: five pluggable AI backends with per-request model selection, so you always route the task to the model that handles it best.",
    language: "JavaScript",
    tags: ["AI", "Prompt Engineering", "Multi-Backend", "Model Routing"],
    githubUrl: "https://github.com/Aadrit1234/prompt-forge",
    liveUrl: "https://prompt-forge-beige-ten.vercel.app",
    benchmark: "5 AI BACKENDS",
    status: "active",
    codeSnippet: {
      lang: "javascript",
      filename: "forge_router.js",
      code: `// PromptForge — multi-backend prompt router
const BACKENDS = {
  openai: callOpenAI,
  anthropic: callAnthropic,
  gemini: callGemini,
  groq: callGroq,
  mistral: callMistral,
};

export async function forge(task, { backend, model }) {
  const compiled = compileTask(task); // task -> structured prompt spec
  return BACKENDS[backend](compiled, { model });
}`,
    },
  },
  {
    id: "blu-blu",
    name: "blu-blu",
    category: "EXPERIMENTS",
    categoryLabel: "Experimental Build",
    tagline: "Experiment playground — where the weird ideas get tested",
    description:
      "A scratchpad for experiments and prototypes. Early-stage ideas get stress-tested here before they graduate into full repositories.",
    language: "HTML",
    tags: ["Experiment", "Prototype", "WIP"],
    githubUrl: "https://github.com/Aadrit1234/blu-blu",
    status: "building",
    codeSnippet: {
      lang: "javascript",
      filename: "scratch.js",
      code: `// blu-blu — experimental sandbox
export const EXPERIMENTS = {
  status: 'in-progress',
  rule: 'ship it when it stops being weird',
};`,
    },
  },
  {
    id: "aadrit1234",
    name: "aadrit1234",
    category: "EXPERIMENTS",
    categoryLabel: "Profile & Config Hub",
    tagline: "GitHub profile, configs and everything that glues the workflow together",
    description:
      "The profile repository — README, workspace configs, and the setup notes that keep the rest of the stack coherent.",
    language: "Markdown",
    tags: ["GitHub", "Config", "Workflow"],
    githubUrl: "https://github.com/Aadrit1234/Aadrit1234",
    status: "active",
    codeSnippet: {
      lang: "markdown",
      filename: "README.md",
      code: `# Aadrit

Full-Stack Developer · Cybersecurity & Ethical Hacking · AI/ML explorer

> Passionate about understanding technology deeply —
> not just using it, but taking it apart.`,
    },
  },
];
