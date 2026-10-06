import { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, Trash, ExternalLink, Send } from "lucide-react";
import { PROJECTS } from "../../data/projects";
import { soundFX } from "../../lib/sound";

type Line = { id: string; type: "cmd" | "error" | "success" | "output"; text: React.ReactNode };

/**
 * Interactive shell — ls | cat <repo> | init <repo> | grep <repo> | clear,
 * clickable quick commands and repo grid output. 1:1 command semantics.
 */
const SHELL_BANNER = `AADRIT ARCHITECTURE OS // v3.2.0-STABLE
${PROJECTS.length} REPOSITORIES CATALOGUED // AVAILABLE COMMANDS:
ls | cat <repo> | init <repo> | grep <repo> | clear
`;

export default function Terminal() {
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<Line[]>([
    {
      id: "1",
      type: "output",
      text: (
        <pre className="text-[#0052FF] font-mono-code text-[11px] leading-tight select-none">
          {SHELL_BANNER}
        </pre>
      ),
    },
    {
      id: "2",
      type: "success",
      text: `Telemetry initialized: ${PROJECTS.length} repositories mapped. Type "ls" to list repositories or "help" for syntax.`,
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const findRepo = (query: string) => {
    const q = query.trim().toLowerCase();
    return PROJECTS.find(
      (p) => p.id.toLowerCase() === q || p.name.toLowerCase() === q,
    );
  };

  const runCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    soundFX.playClick();

    const parts = cmd.split(/\s+/);
    const base = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ").trim();
    const next = [...lines, { id: Math.random().toString(), type: "cmd" as const, text: `$ ${cmd}` }];

    switch (base) {
      case "help":
        next.push({
          id: Math.random().toString(),
          type: "output",
          text: (
            <div className="text-zinc-300 space-y-1.5 font-mono-code text-xs">
              <p className="text-[#0052FF] font-bold">
                COMMAND MANUAL ({PROJECTS.length} REPOSITORIES):
              </p>
              <p><span className="text-emerald-400 font-bold">ls</span>             - List all {PROJECTS.length} repositories with category &amp; status</p>
              <p><span className="text-emerald-400 font-bold">cat &lt;repo&gt;</span>    - Open GitHub repository link in a new tab</p>
              <p><span className="text-emerald-400 font-bold">init &lt;repo&gt;</span>   - Open README page in a new tab</p>
              <p><span className="text-emerald-400 font-bold">grep &lt;repo&gt;</span>   - Output detailed card metadata for &lt;repo&gt;</p>
              <p><span className="text-emerald-400 font-bold">clear</span>          - Clear terminal output buffer</p>
            </div>
          ),
        });
        break;

      case "ls":
        next.push({
          id: Math.random().toString(),
          type: "output",
          text: (
            <div className="py-2 space-y-2 font-mono-code text-xs">
              <p className="text-zinc-400 text-[11px]">
                TOTAL CATALOGUED: {PROJECTS.length} REPOSITORIES // Click any repo to run "grep &lt;repo&gt;"
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {PROJECTS.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => runCommand(`grep ${p.id}`)}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#0052FF] hover:bg-white/10 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-white font-bold group-hover:text-[#4d85ff] block">
                        {p.name}
                      </span>
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
        });
        break;

      case "cat": {
        if (!arg) {
          next.push({
            id: Math.random().toString(),
            type: "error",
            text: 'Usage: cat <repo> (e.g. "cat conduit", "cat filemorph")',
          });
          break;
        }
        const repo = findRepo(arg);
        if (repo) {
          soundFX.playCompile();
          window.open(repo.githubUrl, "_blank", "noopener,noreferrer");
          next.push({
            id: Math.random().toString(),
            type: "success",
            text: (
              <div className="font-mono-code text-xs space-y-1">
                <p>
                  [SUCCESS] Opening GitHub repository in new tab for:{" "}
                  <span className="font-bold text-white">{repo.name}</span>
                </p>
                <a
                  href={repo.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#0052FF] hover:underline"
                >
                  <span>{repo.githubUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ),
          });
        } else {
          next.push({
            id: Math.random().toString(),
            type: "error",
            text: `Repository "${arg}" not found. Type "ls" to view the ${PROJECTS.length} repositories.`,
          });
        }
        break;
      }

      case "init": {
        if (!arg) {
          next.push({
            id: Math.random().toString(),
            type: "error",
            text: 'Usage: init <repo> (e.g. "init conduit", "init prompt-forge")',
          });
          break;
        }
        const repo = findRepo(arg);
        if (repo) {
          soundFX.playCompile();
          const url = `${repo.githubUrl}#readme`;
          window.open(url, "_blank", "noopener,noreferrer");
          next.push({
            id: Math.random().toString(),
            type: "success",
            text: (
              <div className="font-mono-code text-xs space-y-1">
                <p>
                  [SUCCESS] Initializing README documentation for:{" "}
                  <span className="font-bold text-white">{repo.name}</span>
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline"
                >
                  <span>{url}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ),
          });
        } else {
          next.push({
            id: Math.random().toString(),
            type: "error",
            text: `Repository "${arg}" not found. Type "ls" to view the ${PROJECTS.length} repositories.`,
          });
        }
        break;
      }

      case "grep": {
        if (!arg) {
          next.push({
            id: Math.random().toString(),
            type: "error",
            text: 'Usage: grep <repo> (e.g. "grep conduit", "grep printbridge")',
          });
          break;
        }
        const repo = findRepo(arg);
        if (repo) {
          soundFX.playSuccess();
          next.push({
            id: Math.random().toString(),
            type: "output",
            text: (
              <div className="p-4 bg-black/60 border border-white/10 rounded-2xl font-mono-code text-xs space-y-2 text-zinc-300">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-white font-bold text-sm tracking-wide">{repo.name}</span>
                  <span className="text-[#0052FF] font-semibold text-[11px] uppercase">
                    {repo.categoryLabel}
                  </span>
                </div>
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <p>
                    <span className="text-zinc-500 uppercase">TAGLINE:</span>{" "}
                    <span className="text-zinc-300">{repo.tagline}</span>
                  </p>
                  <p>
                    <span className="text-zinc-500 uppercase">DESCRIPTION:</span>{" "}
                    <span className="text-zinc-400">{repo.description}</span>
                  </p>
                  <p>
                    <span className="text-zinc-500 uppercase">LANGUAGE:</span>{" "}
                    <span className="text-emerald-400">{repo.language}</span>
                  </p>
                  <p>
                    <span className="text-zinc-500 uppercase">STATUS:</span>{" "}
                    <span className={repo.status === "active" ? "text-emerald-400" : "text-blue-400"}>
                      {repo.status === "active" ? "ACTIVE // CONTINUOUSLY UPDATED" : "BUILDING"}
                    </span>
                  </p>
                  {repo.benchmark && (
                    <p>
                      <span className="text-zinc-500 uppercase">BENCHMARK:</span>{" "}
                      <span className="text-cyan-400">{repo.benchmark}</span>
                    </p>
                  )}
                  {repo.liveUrl && (
                    <p>
                      <span className="text-zinc-500 uppercase">LIVE:</span>{" "}
                      <a href={repo.liveUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                        {repo.liveUrl}
                      </a>
                    </p>
                  )}
                  <p>
                    <span className="text-zinc-500 uppercase">TAGS:</span>{" "}
                    <span className="text-zinc-300">{repo.tags.join(", ")}</span>
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-4 text-[11px]">
                  <a
                    href={repo.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0052FF] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{`[cat ${repo.id}] GITHUB`}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={`${repo.githubUrl}#readme`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>{`[init ${repo.id}] README`}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {repo.liveUrl && (
                    <a
                      href={repo.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>LIVE DEMO</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ),
          });
        } else {
          next.push({
            id: Math.random().toString(),
            type: "error",
            text: `Repository "${arg}" not found. Type "ls" to view the ${PROJECTS.length} repositories.`,
          });
        }
        break;
      }

      case "clear":
        setLines([]);
        return;

      default:
        next.push({
          id: Math.random().toString(),
          type: "error",
          text: `Command not recognized: "${base}". Allowed commands: ls | cat <repo> | init <repo> | grep <repo> | clear`,
        });
    }

    setLines(next);
    setInput("");
  };

  const QUICK = ["ls", "grep conduit", "cat conduit", "init conduit", "grep filemorph", "grep prompt-forge"];

  return (
    <div className="w-full max-w-7xl mx-auto mb-16 bg-[#090A0E] border border-white/10 rounded-3xl overflow-hidden shadow-2xl font-mono-code">
      {/* Title bar */}
      <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs text-zinc-400 font-bold ml-2 flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-[#0052FF]" />
            AADRIT_OS_SHELL // {PROJECTS.length} REPOSITORIES MAPPED
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => runCommand(q)}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-zinc-300 hover:text-white transition cursor-pointer"
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

      {/* Output */}
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
            ) : (
              <div>{line.text}</div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-white/[0.03] border-t border-white/10 flex items-center gap-3">
        <span className="text-[#0052FF] font-bold">aadrit@sys:~$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runCommand(input)}
          placeholder={`Allowed commands: "ls", "cat <repo>", "init <repo>", "grep <repo>", "clear"...`}
          className="flex-1 bg-transparent text-white text-xs outline-none placeholder-zinc-600 font-mono-code"
          autoFocus
        />
        <button
          onClick={() => runCommand(input)}
          className="p-2 rounded-lg bg-[#0052FF] hover:bg-blue-600 text-white transition cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
