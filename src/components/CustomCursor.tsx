import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  Copy,
  Volume2,
  X,
  Type,
  CodeXml,
  Compass,
  Eye,
  GitBranch,
  Layers,
  Send,
  Zap,
} from "lucide-react";

type CursorMode =
  | "default"
  | "copy"
  | "audio"
  | "close"
  | "input"
  | "code"
  | "nav"
  | "terminal"
  | "link"
  | "view"
  | "explore"
  | "send"
  | "action";

/**
 * Custom cursor — tracks intent via [data-cursor] attributes and content
 * heuristics, draws a labeled tag + outline highlight + trailing dot.
 * Disabled on coarse pointers.
 */
export default function CustomCursor() {
  const [mode, setMode] = useState<CursorMode>("default");
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const highlighted = useRef<Element | null>(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const spring = { damping: 24, stiffness: 300, mass: 0.35 };
  const tagX = useSpring(x, spring);
  const tagY = useSpring(y, spring);
  const dotX = useSpring(x, { damping: 32, stiffness: 480, mass: 0.1 });
  const dotY = useSpring(y, { damping: 32, stiffness: 480, mass: 0.1 });

  const setHighlight = (el: Element | null, color: string) => {
    if (highlighted.current && highlighted.current !== el) {
      const prev = highlighted.current as HTMLElement;
      prev.style.outline = "";
      prev.style.outlineOffset = "";
      prev.style.transition = "";
      highlighted.current = null;
    }
    if (el) {
      const h = el as HTMLElement;
      h.style.outline = `2px solid ${color}`;
      h.style.outlineOffset = "4px";
      h.style.transition = "outline 0.12s ease, outline-offset 0.12s ease";
      highlighted.current = el;
    }
  };

  const clearHighlight = () => {
    if (!highlighted.current) return;
    const h = highlighted.current as HTMLElement;
    h.style.outline = "";
    h.style.outlineOffset = "";
    highlighted.current = null;
  };

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMouseMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as Element | null;
      if (!target) return;

      // Explicit data-cursor hints win
      const hinted = target.closest("[data-cursor]");
      if (hinted) {
        setIsPressed(true);
        const hint = (hinted.getAttribute("data-cursor") || "").toUpperCase();
        if (hint === "COPY") { setMode("copy"); setHighlight(hinted, "#10B981"); }
        else if (hint === "CODE") { setMode("code"); setHighlight(hinted, "#0052FF"); }
        else if (hint === "LINK" || hint === "EXT") { setMode("link"); setHighlight(hinted, "#0052FF"); }
        else if (hint === "NAV" || hint === "GO" || hint === "TOP") { setMode("nav"); setHighlight(hinted, "#0052FF"); }
        else if (hint === "AUDIO" || hint === "SOUND") { setMode("audio"); setHighlight(hinted, "#6366F1"); }
        else if (hint === "RUN" || hint === "TERMINAL") { setMode("terminal"); setHighlight(hinted, "#10B981"); }
        else if (hint === "VIEW") { setMode("view"); setHighlight(hinted, "#0052FF"); }
        else if (hint === "EXPLORE") { setMode("explore"); setHighlight(hinted, "#F59E0B"); }
        else if (hint === "CLOSE") { setMode("close"); setHighlight(hinted, "#EF4444"); }
        else if (hint === "SEND") { setMode("send"); setHighlight(hinted, "#0052FF"); }
        else { setMode("action"); setHighlight(hinted, "#0052FF"); }
        return;
      }

      const interactive = target.closest(
        'button, a, input, textarea, select, [role="button"]',
      );
      if (interactive) {
        setIsPressed(true);
        const text = (interactive.textContent || "").toUpperCase();
        const aria = (interactive.getAttribute("aria-label") || "").toUpperCase();
        const title = (interactive.getAttribute("title") || "").toUpperCase();
        const href = interactive.getAttribute("href") || "";

        if (interactive.tagName === "INPUT" || interactive.tagName === "TEXTAREA") {
          setMode("input"); setHighlight(interactive, "#0052FF");
        } else if (text.includes("COPY") || aria.includes("COPY") || text.includes("GMAIL")) {
          setMode("copy"); setHighlight(interactive, "#10B981");
        } else if (text.includes("SEND") || text.includes("SUBMIT") || aria.includes("SEND")) {
          setMode("send"); setHighlight(interactive, "#0052FF");
        } else if (text.includes("INSPECT") || text.includes("CODE") || aria.includes("CODE")) {
          setMode("code"); setHighlight(interactive, "#0052FF");
        } else if (title.includes("MUTE") || title.includes("SOUND") || text.includes("FX:")) {
          setMode("audio"); setHighlight(interactive, "#6366F1");
        } else if (
          interactive.closest("header, nav") ||
          text.includes("EXIT") || text.includes("BACK") || text.includes("SYS.INIT") ||
          text.includes("WORKS") || text.includes("ABOUT") || text.includes("CONNECT") ||
          text.includes("GITHUB") || href.startsWith("#") || href === "/"
        ) {
          setMode("nav"); setHighlight(interactive, "#0052FF");
        } else if (
          interactive.getAttribute("target") === "_blank" ||
          href.includes("github.com") || title.includes("GITHUB") ||
          text.includes("LIVE DEMO") || aria.includes("LIVE DEMO")
        ) {
          setMode("link"); setHighlight(interactive, "#0052FF");
        } else if (title.includes("CLEAR") || aria.includes("CLOSE") || text === "✕" || text === "×") {
          setMode("close"); setHighlight(interactive, "#EF4444");
        } else if (text.includes("BENTO") || text.includes("TERMINAL") || interactive.closest('[role="tablist"]')) {
          setMode("view"); setHighlight(interactive, "#0052FF");
        } else if (text.includes("PEEK") || text.includes("STASH") || text.includes("EXPLORE")) {
          setMode("explore"); setHighlight(interactive, "#F59E0B");
        } else {
          setMode("action"); setHighlight(interactive, "#0052FF");
        }
      } else {
        setIsPressed(false);
        setMode("default");
        clearHighlight();
      }
    };

    const onMouseDown = () => setIsDown(true);
    const onMouseUp = () => setIsDown(false);
    const onMouseLeave = () => {
      setIsVisible(false);
      clearHighlight();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      clearHighlight();
    };
  }, [isVisible, x, y]);

  if (!isVisible) return null;

  const tagIcon = () => {
    switch (mode) {
      case "copy": return <Copy className="w-3 h-3 text-white" />;
      case "audio": return <Volume2 className="w-3 h-3 text-white" />;
      case "close": return <X className="w-3 h-3 text-white" />;
      case "input": return <Type className="w-3 h-3 text-white" />;
      case "code": return <CodeXml className="w-3 h-3 text-white" />;
      case "nav": return <Compass className="w-3 h-3 text-white" />;
      case "terminal": return <CodeXml className="w-3 h-3 text-emerald-300" />;
      case "link": return <GitBranch className="w-3 h-3 text-white" />;
      case "view": return <Layers className="w-3 h-3 text-white" />;
      case "explore": return <Eye className="w-3 h-3 text-amber-300" />;
      case "send": return <Send className="w-3 h-3 text-white" />;
      case "action": return <Zap className="w-3 h-3 text-white" />;
      default: return null;
    }
  };

  const tagColor = () => {
    switch (mode) {
      case "copy": return "rgba(16, 185, 129, 0.9)";
      case "audio": return "rgba(99, 102, 241, 0.9)";
      case "close": return "rgba(239, 68, 68, 0.9)";
      case "input": return "rgba(0, 82, 255, 0.85)";
      case "code": return "rgba(0, 82, 255, 0.9)";
      case "nav": return "rgba(0, 82, 255, 0.9)";
      case "terminal": return "rgba(13, 14, 18, 0.95)";
      case "link": return "rgba(0, 82, 255, 0.9)";
      case "view": return "rgba(0, 82, 255, 0.9)";
      case "explore": return "rgba(245, 158, 11, 0.9)";
      case "send": return "rgba(0, 82, 255, 0.9)";
      case "action": return "rgba(0, 82, 255, 0.9)";
      default: return "transparent";
    }
  };

  const icon = tagIcon();
  const tagLift = isPressed && icon ? 28 : 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {isPressed && icon && (
        <motion.div
          style={{ x: tagX, y: tagY, translateX: 12, translateY: -tagLift - 4 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isDown ? 0.85 : 1,
            opacity: 1,
            backgroundColor: tagColor(),
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 380 }}
          className="fixed top-0 left-0 w-7 h-7 rounded-lg flex items-center justify-center shadow-lg shadow-black/20"
        >
          {icon}
        </motion.div>
      )}
      <motion.div
        style={{
          x: dotX,
          y: dotY,
          translateX: -3,
          translateY: -3,
          boxShadow: "0 0 6px rgba(0, 82, 255, 0.6)",
        }}
        animate={{
          scale: isDown ? 1.8 : isPressed ? 0.5 : 1,
          opacity: isDown ? 0.6 : 1,
          backgroundColor: isDown ? tagColor() : "#0052FF",
        }}
        transition={{ type: "spring", damping: 30, stiffness: 500 }}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none"
      />
    </div>
  );
}
