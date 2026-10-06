export interface CodeSnippet {
  lang: string;
  filename: string;
  code: string;
}

export interface Project {
  id: string;
  name: string;
  category: "WEBSITES" | "APPS" | "TOOLS" | "AI" | "EXPERIMENTS";
  categoryLabel: string;
  tagline: string;
  description: string;
  language: string;
  tags: string[];
  githubUrl: string;
  liveUrl?: string;
  benchmark?: string;
  status?: "active" | "building";
  codeSnippet: CodeSnippet;
}

export type StackColorKey =
  | "blue"
  | "violet"
  | "pink"
  | "amber"
  | "emerald"
  | "cyan"
  | "orange"
  | "zinc";

export interface StackCategory {
  category: string;
  color: StackColorKey;
  items: string[];
}

export const IDENTITY = {
  handle: "AADRIT",
  role: "DEV",
  githubHandle: "AADRIT1234",
  githubUrl: "https://github.com/Aadrit1234",
  avatarUrl: "https://avatars.githubusercontent.com/u/218725417?v=4",
  email: "aadritchandravanci23@gmail.com",
} as const;
