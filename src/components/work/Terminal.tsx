import { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, Trash, Send, Brain, Sparkles } from "lucide-react";
import { useLiveProjects } from "../../lib/catalog";
import { soundFX } from "../../lib/sound";
import { queryAI, AI_PROVIDERS, type ProviderType } from "../../lib/ai";

type Line = {
  id: string;
  type: "cmd" | "error" | "success" | "output" | "ai";
  text: React.ReactNode;
};

const shellBanner = (count: number) => `AADRIT ARCHITECTURE OS // v3.2.0-STABLE
${count} REPOSITORIES CATALOGUED // INTEGRATED AI COPILOT
AVAILABLE COMMANDS:
ls | cat <repo> | init <repo> | grep <repo> | ai <query> | ai help | aimodel <provider> | models | clear
`;

export default function Terminal() {
  // Live catalog — `ls` lists the real GitHub repositories.
  const PROJECTS = useLiveProjects();
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<ProviderType>("google");
  const [isLoading, setIsLoading] = useState(false);
  const [lines, setLines] = useState<Line[]>([
    {
      id: "1",
      type: "output",
      text: (
        <pre className="text-accent font-mono-code text-[11px] leading-tight select-none">
          {shellBanner(PROJECTS.length)}
        </pre>
      ),
    },
    {
      id: "2",
      type: "success",
      text: (
        <div className="space-y-1 font-mono-code text-xs">
          <p>✓ Telemetry initialized: {PROJECTS.length} repositories verified with live sync.</p>
          <p className="text-cyan-400">
            ✓ Neural Engine: {AI_PROVIDERS[provider].name} ({AI_PROVIDERS[provider].defaultModel})
          </p>
          <p className="text-zinc-400 text-[11px]">
            API keys pre-configured. Type <span className="text-accent font-bold">&quot;ai help&quot;</span> or ask questions with <span className="text-accent font-bold">&quot;ai &lt;query&gt;&quot;</span>.
          </p>
        </div>
      ),
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const runCommand = async (raw: string) => {
    const cmd = raw.trim();
    if (!cmd || isLoading) return;
    soundFX.playClick();

    const parts = cmd.split(/\s+/);
    const base = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ").trim();
    const next = [...lines, { id: Math.random().toString(), type: "cmd" as const, text: `$ ${cmd}` }];
    setLines(next);
    setInput("");

    try {
      switch (base) {
        case "help": {
          const helpLine: Line = {
            id: Math.random().toString(),
            type: "output",
            text: (
              <div className="text-zinc-300 space-y-1.5 font-mono-code text-xs">
                <p className="text-accent font-bold">COMMAND MANUAL:</p>
                <p><span className="text-emerald-400 font-bold">ls</span> - List all repositories</p>
                <p><span className="text-emerald-400 font-bold">cat &lt;repo&gt;</span> - Open GitHub repository link</p>
                <p><span className="text-emerald-400 font-bold">init &lt;repo&gt;</span> - View README synopsis</p>
                <p><span className="text-emerald-400 font-bold">grep &lt;repo&gt;</span> - Show detailed repository specs</p>
                <p><span className="text-cyan-400 font-bold">ai &lt;query&gt;</span> - Ask AI assistant (Gemini / Groq)</p>
                <p><span className="text-cyan-400 font-bold">ai help</span> - View AI assistant help and examples</p>
                <p><span className="text-cyan-400 font-bold">aimodel &lt;provider&gt;</span> - Switch engine: google, groq, openrouter</p>
                <p><span className="text-cyan-400 font-bold">models</span> - List active AI models</p>
                <p><span className="text-emerald-400 font-bold">clear</span> - Clear terminal buffer</p>
              </div>
            ),
          };
          setLines([...next, helpLine]);
          break;
        }

        case "ls": {
          const lsLine: Line = {
            id: Math.random().toString(),
            type: "output",
            text: (
              <div className="py-2 space-y-2 font-mono-code text-xs">
                <p className="text-zinc-400 text-[11px] mb-2">// {PROJECTS.length} ACTIVE REPOSITORIES VERIFIED:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {PROJECTS.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => runCommand(`grep ${p.id}`)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-accent hover:bg-white/10 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div>
                        <span className="text-white font-bold group-hover:text-accent block">{p.name}</span>
                        <span className="text-[10px] text-zinc-500">{p.categoryLabel}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-400 uppercase">
                        {p.language}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ),
          };
          setLines([...next, lsLine]);
          break;
        }

        case "cat": {
          const target = arg.toLowerCase();
          const p = PROJECTS.find(
            (proj) => proj.id.toLowerCase() === target || proj.name.toLowerCase() === target
          );
          if (!p) {
            const errLine: Line = {
              id: Math.random().toString(),
              type: "error",
              text: `Repository "${arg}" not found. Type "ls" for repository list.`,
            };
            setLines([...next, errLine]);
            break;
          }
          window.open(p.githubUrl, "_blank", "noopener,noreferrer");
          const outLine: Line = {
            id: Math.random().toString(),
            type: "success",
            text: (
              <div>
                <p>Opening {p.name} on GitHub: <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-accent underline">{p.githubUrl}</a></p>
                <p className="text-zinc-400 text-[11px] mt-1">{p.description}</p>
              </div>
            ),
          };
          setLines([...next, outLine]);
          break;
        }

        case "init": {
          const target = arg.toLowerCase();
          const p = PROJECTS.find(
            (proj) => proj.id.toLowerCase() === target || proj.name.toLowerCase() === target
          );
          if (!p) {
            const errLine: Line = {
              id: Math.random().toString(),
              type: "error",
              text: `Repository "${arg}" not found. Type "ls" to list repositories.`,
            };
            setLines([...next, errLine]);
            break;
          }
          const initLine: Line = {
            id: Math.random().toString(),
            type: "output",
            text: (
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2 text-xs">
                <p className="text-accent font-bold"># {p.name.toUpperCase()} // README SYNOPSIS</p>
                <p className="text-zinc-200">{p.tagline}</p>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{p.description}</p>
                <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2 text-[10px]">
                  <span className="text-zinc-500">Language: {p.language}</span>
                  <span className="text-zinc-500">|</span>
                  <span className="text-emerald-400">Status: {p.status || "active"}</span>
                  <span className="text-zinc-500">|</span>
                  <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                    View full README on GitHub →
                  </a>
                </div>
              </div>
            ),
          };
          setLines([...next, initLine]);
          break;
        }

        case "grep": {
          const target = arg.toLowerCase();
          const p = PROJECTS.find(
            (proj) => proj.id.toLowerCase() === target || proj.name.toLowerCase() === target
          );
          if (!p) {
            const errLine: Line = {
              id: Math.random().toString(),
              type: "error",
              text: `Repository "${arg}" not found. Use "ls" to see available repositories.`,
            };
            setLines([...next, errLine]);
            break;
          }
          const grepLine: Line = {
            id: Math.random().toString(),
            type: "output",
            text: (
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-accent font-bold text-sm">{p.name}</span>
                  <span className="text-emerald-400 font-mono-code text-[10px]">{p.benchmark || p.categoryLabel}</span>
                </div>
                <p className="text-zinc-300">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-zinc-300">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="pt-2 border-t border-white/10 flex gap-4 text-[10px]">
                  <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                    GitHub Repo
                  </a>
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                      Live App ↗
                    </a>
                  )}
                </div>
              </div>
            ),
          };
          setLines([...next, grepLine]);
          break;
        }

        case "aimodel": {
          const prov = arg.toLowerCase() as ProviderType;
          if (prov === "groq" || prov === "openrouter" || prov === "google") {
            setProvider(prov);
            const mLine: Line = {
              id: Math.random().toString(),
              type: "success",
              text: `AI provider switched to ${AI_PROVIDERS[prov].name} (${AI_PROVIDERS[prov].defaultModel})`,
            };
            setLines([...next, mLine]);
          } else {
            const errLine: Line = {
              id: Math.random().toString(),
              type: "error",
              text: `Invalid provider. Use: google, groq, or openrouter`,
            };
            setLines([...next, errLine]);
          }
          break;
        }

        case "models": {
          const mLine: Line = {
            id: Math.random().toString(),
            type: "output",
            text: (
              <div className="space-y-2 font-mono-code text-xs">
                <p className="text-accent font-bold">SUPPORTED AI NEURAL ENGINES:</p>
                {Object.entries(AI_PROVIDERS).map(([key, cfg]) => (
                  <div key={key} className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <p className="text-cyan-400 font-bold">{cfg.name} [{key}]</p>
                      {key === provider && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-accent/20 text-accent font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-[11px] mt-1">Default Model: {cfg.defaultModel}</p>
                    <p className="text-zinc-500 text-[10px] mt-0.5">Available: {cfg.models.join(", ")}</p>
                  </div>
                ))}
              </div>
            ),
          };
          setLines([...next, mLine]);
          break;
        }

        case "ai": {
          if (!arg || arg.toLowerCase() === "help") {
            const aiHelpLine: Line = {
              id: Math.random().toString(),
              type: "output",
              text: (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3 font-mono-code text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-accent font-bold">AI SHELL COPILOT // USER GUIDE</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Integrated with pre-configured API keys ({AI_PROVIDERS[provider].name}). Ask any question about Aadrit&apos;s repositories, full-stack architecture, cybersecurity practices, and tech stack.
                  </p>
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <p><span className="text-emerald-400 font-bold">ai &lt;query&gt;</span> - Query the AI assistant</p>
                    <p><span className="text-cyan-400 font-bold">aimodel &lt;provider&gt;</span> - Switch neural provider (<span className="text-white">google</span> | <span className="text-white">groq</span> | <span className="text-white">openrouter</span>)</p>
                    <p><span className="text-amber-400 font-bold">models</span> - List supported model backends</p>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-zinc-500 text-[10px] uppercase font-bold mb-1.5">CLICKABLE QUICK EXAMPLES:</p>
                    <div className="flex flex-col gap-1 text-[11px]">
                      <button
                        onClick={() => runCommand("ai Who is Aadrit and what are his core skills?")}
                        className="text-left text-zinc-300 hover:text-accent transition cursor-pointer"
                      >
                        ▸ ai Who is Aadrit and what are his core skills?
                      </button>
                      <button
                        onClick={() => runCommand("ai How does Conduit achieve end-to-end encryption?")}
                        className="text-left text-zinc-300 hover:text-accent transition cursor-pointer"
                      >
                        ▸ ai How does Conduit achieve end-to-end encryption?
                      </button>
                      <button
                        onClick={() => runCommand("ai What is PrintBridge and how does it work?")}
                        className="text-left text-zinc-300 hover:text-accent transition cursor-pointer"
                      >
                        ▸ ai What is PrintBridge and how does it work?
                      </button>
                    </div>
                  </div>
                </div>
              ),
            };
            setLines([...next, aiHelpLine]);
            break;
          }

          setIsLoading(true);
          const thinkingId = Math.random().toString();
          const thinkingLine: Line = {
            id: thinkingId,
            type: "output",
            text: (
              <span className="text-cyan-400 flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 animate-pulse" />
                Thinking with {AI_PROVIDERS[provider].name} ({AI_PROVIDERS[provider].defaultModel})...
              </span>
            ),
          };
          setLines([...next, thinkingLine]);

          try {
            const response = await queryAI(arg, provider);
            const aiLine: Line = {
              id: Math.random().toString(),
              type: "ai",
              text: (
                <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl whitespace-pre-wrap text-zinc-200 text-xs leading-relaxed font-sans shadow-lg">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-cyan-500/20 font-mono-code text-[10px] text-cyan-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI RESPONSE // {AI_PROVIDERS[provider].name.toUpperCase()}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{response}</div>
                </div>
              ),
            };
            setLines([...next, thinkingLine, aiLine]);
          } catch (err: any) {
            const errLine: Line = {
              id: Math.random().toString(),
              type: "error",
              text: `AI query failed: ${err.message || "Unknown error"}`,
            };
            setLines([...next, thinkingLine, errLine]);
          } finally {
            setIsLoading(false);
          }
          break;
        }

        case "clear": {
          setLines([]);
          return;
        }

        default: {
          const errLine: Line = {
            id: Math.random().toString(),
            type: "error",
            text: `Command not recognized: "${base}". Type "help" or "ai help" for available commands.`,
          };
          setLines([...next, errLine]);
          break;
        }
      }
    } catch {
      const errLine: Line = { id: Math.random().toString(), type: "error", text: "Command execution failed" };
      setLines([...next, errLine]);
    }
  };

  const QUICK_PROMPTS = [
    { label: "ai help", cmd: "ai help" },
    { label: "ai Who is Aadrit?", cmd: "ai Who is Aadrit?" },
    { label: "ai What is Conduit?", cmd: "ai What is Conduit?" },
    { label: "ls", cmd: "ls" },
    { label: "cat conduit", cmd: "cat conduit" },
    { label: "clear", cmd: "clear" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto mb-16 bg-[#090A0E] border border-white/10 rounded-3xl overflow-hidden shadow-2xl font-mono-code">
      {/* Top Title Bar */}
      <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs text-zinc-400 font-bold ml-2 flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-accent" />
            AADRIT_OS_SHELL // AI: {AI_PROVIDERS[provider].name}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q.cmd}
              onClick={() => runCommand(q.cmd)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-zinc-300 hover:text-white transition cursor-pointer disabled:opacity-50"
            >
              ${q.label}
            </button>
          ))}
          <button
            onClick={() => {
              setLines([]);
              soundFX.playClick();
            }}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Clear buffer"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Buffer */}
      <div
        data-lenis-prevent
        className="p-6 h-[460px] overflow-y-auto space-y-3 text-xs leading-relaxed overscroll-contain select-text"
      >
        {lines.map((line) => (
          <div key={line.id}>
            {line.type === "cmd" ? (
              <p className="text-white font-bold">{line.text}</p>
            ) : line.type === "error" ? (
              <p className="text-red-400">{line.text}</p>
            ) : line.type === "success" ? (
              <div className="text-emerald-400">{line.text}</div>
            ) : line.type === "ai" ? (
              <div>{line.text}</div>
            ) : (
              <div>{line.text}</div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-cyan-400">
            <Brain className="w-3.5 h-3.5 animate-pulse" />
            <span>Generating response...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Terminal Input Bar */}
      <div className="px-6 py-4 bg-white/[0.03] border-t border-white/10 flex items-center gap-3">
        <span className="text-accent font-bold">aadrit@sys:~$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runCommand(input)}
          placeholder={`Type a command or ai "What is Conduit?" (press Enter)...`}
          className="flex-1 bg-transparent text-white text-xs outline-none placeholder-zinc-600 font-mono-code"
          autoFocus
          disabled={isLoading}
        />
        <button
          onClick={() => runCommand(input)}
          disabled={isLoading}
          className="p-2 rounded-lg bg-accent hover:bg-accent/85 text-white transition cursor-pointer disabled:opacity-50"
          title="Send command"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
