import type { StackCategory } from "./types";

export const MARQUEE_ITEMS = [
  "FULL-STACK ENGINEERING",
  "CYBERSECURITY & ETHICAL HACKING",
  "AI / ML EXPLORATION",
  "REAL-TIME WEB APPS",
  "SELF-HOSTED INFRASTRUCTURE",
  "AI-POWERED PRODUCTS",
  "NETWORK & SYSTEMS SECURITY",
];

export const STACK: StackCategory[] = [
  {
    category: "LANGUAGES",
    color: "blue",
    items: [
      "JavaScript",
      "TypeScript",
      "Python",
      "HTML",
      "CSS",
      "SQL",
      "Bash / Shell",
      "PowerShell",
    ],
  },
  {
    category: "FRAMEWORKS",
    color: "violet",
    items: [
      "React 19",
      "Next.js",
      "Node.js",
      "Express",
      "Fastify",
      "Tailwind CSS v4",
      "Vite",
      "Electron",
    ],
  },
  {
    category: "AI & ML",
    color: "pink",
    items: [
      "OpenAI API",
      "Anthropic Claude",
      "Gemini API",
      "LangChain",
      "Hugging Face",
      "ONNX",
      "MediaPipe",
      "PyTorch",
    ],
  },
  {
    category: "SECURITY",
    color: "amber",
    items: [
      "Burp Suite",
      "Nmap",
      "Wireshark",
      "Metasploit",
      "OWASP ZAP",
      "AES-256-GCM",
      "Kali Linux",
      "Nikto",
    ],
  },
  {
    category: "DATABASES",
    color: "emerald",
    items: [
      "PostgreSQL",
      "MongoDB",
      "SQLite",
      "Redis",
      "Supabase",
      "Prisma ORM",
      "Drizzle ORM",
    ],
  },
  {
    category: "REALTIME & MEDIA",
    color: "cyan",
    items: [
      "WebRTC",
      "WebSockets",
      "Socket.IO",
      "Sharp",
      "LibreOffice Headless",
      "pdf2docx",
      "FFmpeg",
    ],
  },
  {
    category: "AI CODING TOOLS",
    color: "orange",
    items: [
      "Freebuff",
      "Claude Code",
      "GitHub Copilot",
      "Cursor",
      "OpenCode",
      "Aider",
      "Continue.dev",
    ],
  },
  {
    category: "INFRA & TOOLS",
    color: "zinc",
    items: [
      "Git",
      "Docker",
      "GitHub Actions",
      "Vercel",
      "Linux",
      "VS Code",
      "Postman",
      "Figma",
    ],
  },
];

export const STACK_COLORS: Record<
  StackCategory["color"],
  { pill: string; label: string; glow: string }
> = {
  blue: {
    pill: "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100",
    label: "text-blue-600",
    glow: "bg-blue-400/10",
  },
  violet: {
    pill: "bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100",
    label: "text-violet-600",
    glow: "bg-violet-400/10",
  },
  pink: {
    pill: "bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100",
    label: "text-pink-600",
    glow: "bg-pink-400/10",
  },
  amber: {
    pill: "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
    label: "text-amber-600",
    glow: "bg-amber-400/10",
  },
  emerald: {
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
    label: "text-emerald-600",
    glow: "bg-emerald-400/10",
  },
  cyan: {
    pill: "bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100",
    label: "text-cyan-600",
    glow: "bg-cyan-400/10",
  },
  orange: {
    pill: "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100",
    label: "text-orange-600",
    glow: "bg-orange-400/10",
  },
  zinc: {
    pill: "bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-zinc-200",
    label: "text-zinc-500",
    glow: "bg-zinc-400/10",
  },
};
