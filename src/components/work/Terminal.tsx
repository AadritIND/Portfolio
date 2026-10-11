import { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, Trash, ExternalLink, Send, Brain } from "lucide-react";
import { PROJECTS } from "../../data/projects";
import { soundFX } from "../../lib/sound";
import { queryAI, AI_PROVIDERS, type ProviderType } from "../../lib/ai";

type Line = { id: string; type: "cmd" | "error" | "success" | "output" | "ai"; text: React.ReactNode };

const SHELL_BANNER = `AADRIT ARCHITECTURE OS // v3.2.0-STABLE
${PROJECTS.length} REPOSITORIES CATALOGUED // AVAILABLE COMMANDS:
ls | cat <repo> | init <repo> | grep <repo> | clear | ai <query> | aimodel <provider> | models
`;

export default function Terminal() {
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<ProviderType>("groq");
  const [isLoading, setIsLoading] = useState(false);
  const [lines, setLines] = useState<Line[]>([
    {
      id: "1",
      type: "output",
      text: (
        <pre className="text-accent font-mono-code text-[11px] leading-tight select-none">
          {SHELL_BANNER}
        </pre>
      ),
    },
    {
      id: "2",
      type: "success",
      text: (
        <div className="space-y-1">
          <p>Telemetry initialized: {PROJECTS.length} repositories mapped.</p>
          <p className="text-cyan-400">AI Engine: {AI_PROVIDERS[provider].name} ({AI_PROVIDERS[provider].defaultModel})</p>
          <p>Type "ai help" for AI commands or "help" for syntax.</p>
        </div>
      ),
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const findRepo = (query: string) => {
    const q = query.trim().toLowerCase();
    return PROJECTS.find((p) => p.id.toLowerCase() === q || p.name.toLowerCase() === q);
  };

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
          const helpLine = {
            id: Math.random().toString(),
            type: "output" as const,
            text: (
              <div className="text-zinc-300 space-y-1.5 font-mono-code text-xs">
                <p className="text-accent font-bold">COMMAND MANUAL:</p>
                <p><span className="text-emerald-400 font-bold">ls</span> - List all repositories</p>
                <p><span className="text-emerald-400 font-bold">cat &lt;repo&gt;</span> - Open GitHub repo</p>
                <p><span className="text-emerald-400 font-bold">init &lt;repo&gt;</span> - Open README</p>
                <p><span className="text-emerald-400 font-bold">grep &lt;repo&gt;</span> - Repo details</p>
                <p><span className="text-cyan-400 font-bold">ai &lt;query&gt;</span> - AI assistant query</p>
                <p><span className="text-cyan-400 font-bold">aimodel &lt;provider&gt;</span> - Switch AI provider</p>
                <p><span className="text-cyan-400 font-bold">models</span> - List AI models</p>
                <p><span className="text-emerald-400 font-bold">clear</span> - Clear terminal</p>
              </div>
            ),
          };
          setLines([...next, helpLine]);
          break;
        }

        case "ls": {
          const lsLine = {
            id: Math.random().toString(),
            type: "output" as const,
            text: (
              <div className="py-2 space-y-2 font-mono-code text-xs">
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

        case "aimodel": {
          const prov = arg.toLowerCase() as ProviderType;
          if (prov === "groq" || prov === "openrouter" || prov === "google") {
            setProvider(prov);
            const mLine = {
              id: Math.random().toString(),
              type: "success" as const,
              text: `AI provider switched to ${AI_PROVIDERS[prov].name}`,
            };
            setLines([...next, mLine]);
          } else {
            const errLine = {
              id: Math.random().toString(),
              type: "error" as const,
              text: `Invalid provider. Use: groq, openrouter, or google`,
            };
            setLines([...next, errLine]);
          }
          break;
        }

        case "models": {
          const mLine = {
            id: Math.random().toString(),
            type: "output" as const,
            text: (
              <div className="space-y-2 font-mono-code text-xs">
                {Object.entries(AI_PROVIDERS).map(([key, cfg]) => (
                  <div key={key} className="p-2 bg-white/5 rounded border border-white/10">
                    <p className="text-cyan-400 font-bold">{cfg.name} [{key}]</p>
                    <p className="text-zinc-400 text-[10px]">Default: {cfg.defaultModel}</p>
                  </div>
                ))}
              </div>
            ),
          };
          setLines([...next, mLine]);
          break;
        }

        case "ai": {
          if (!arg) {
            const errLine = {
              id: Math.random().toString(),
              type: "error" as const,
              text: 'Usage: ai <query>',
            };
            setLines([...next, errLine]);
            break;
          }
          setIsLoading(true);
          const thinkingLine = {
            id: Math.random().toString(),
            type: "output" as const,
            text: <span className="text-cyan-400">Thinking with {AI_PROVIDERS[provider].name}...</span>,
          };
          setLines([...next, thinkingLine]);

          try {
            const response = await queryAI(arg, provider);
            const aiLine = {
              id: Math.random().toString(),
              type: "ai" as const,
              text: (
                <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-lg whitespace-pre-wrap text-zinc-200">
                  {response}
                </div>
              ),
            };
            setLines([...next, thinkingLine, aiLine]);
          } catch (err: any) {
            const errLine = {
              id: Math.random().toString(),
              type: "error" as const,
              text: err.message || "AI query failed",
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
          const errLine = {
            id: Math.random().toString(),
            type: "error" as const,
            text: `Command not recognized: "${base}". Type "help" for available commands.`,
          };
          setLines([...next, errLine]);
          break;
        }
      }
    } catch (e) {
      const errLine = { id: Math.random().toString(), type: "error" as const, text: "Command execution failed" };
      setLines([...next, errLine]);
    }
  };

  const QUICK = ["ls", "ai explain quantum computing", "aimodel groq", "models", "clear"];

  return (
    <div className="w-full max-w-7xl mx-auto mb-16 bg-[#090A0E] border border-white/10 rounded-3xl overflow-hidden shadow-2xl font-mono-code">
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
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => runCommand(q)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-zinc-300 hover:text-white transition cursor-pointer disabled:opacity-50"
            >
              ${q}
            </button>
          ))}
          <button
            onClick={() => {
              setLines([]);
              soundFX.playClick();
            }}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
            title="Clear buffer"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

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
            <Brain className="w-3 h-3 animate-pulse" />
            <span>Processing...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="px-6 py-4 bg-white/[0.03] border-t border-white/10 flex items-center gap-3">
        <span className="text-accent font-bold">aadrit@sys:~$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runCommand(input)}
          placeholder={`ai "ask something"...`}
          className="flex-1 bg-transparent text-white text-xs outline-none placeholder-zinc-600 font-mono-code"
          autoFocus
          disabled={isLoading}
        />
        <button
          onClick={() => runCommand(input)}
          disabled={isLoading}
          className="p-2 rounded-lg bg-accent hover:bg-accent/85 text-white transition cursor-pointer disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
