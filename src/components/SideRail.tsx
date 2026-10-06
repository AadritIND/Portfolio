import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { House, Layers, User, Mail, GitBranch } from "lucide-react";
import { useUiStore } from "../store/ui";
import { IDENTITY } from "../data/types";

const RAIL_W = 56;
const RAIL_W_EXPANDED = 192;

const NAV_ITEMS = [
  { id: "top", label: "SYS.INIT", Icon: House },
  { id: "works", label: "WORKS", Icon: Layers },
  { id: "about", label: "ABOUT", Icon: User },
  { id: "contact", label: "CONNECT", Icon: Mail },
];

/**
 * Left expanding rail — hover to expand with spring physics, scroll-spy
 * highlighting, avatar button and GitHub shortcut. Hidden on mobile.
 */
export default function SideRail() {
  const [active, setActive] = useState("top");
  const [isLightBg, setIsLightBg] = useState(false);
  const { isExpanded, setIsExpanded } = useUiStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      const lightSections = ["about", "contact"];
      let current = "top";
      if (window.scrollY < 200) {
        current = "top";
      } else {
        for (const id of lightSections) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= window.innerHeight / 2) {
            current = id;
          }
        }
      }
      setActive(current);
      setIsLightBg(["about", "contact"].includes(current));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    if (id === "top") window.scrollTo({ top: 0, behavior: "smooth" });
    else if (id === "works") navigate("/work");
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const bgColor = isLightBg ? "#0D0E12" : isExpanded ? "rgba(248,249,250,0.95)" : "transparent";
  const dividerColor = isLightBg ? "rgba(255,255,255,0.15)" : "rgba(161,161,170,0.4)";
  const accent = "#0052FF";
  const fg = isLightBg ? "#ffffff" : "#0a0a0a";
  const muted = isLightBg ? "rgba(255,255,255,0.45)" : "#71717a";

  return (
    <motion.header
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      initial={{ width: RAIL_W }}
      animate={{ width: isExpanded ? RAIL_W_EXPANDED : RAIL_W }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="fixed left-0 top-0 bottom-0 z-40 pointer-events-none hidden sm:flex overflow-hidden"
      style={{
        backgroundColor: bgColor,
        backdropFilter: isExpanded ? "blur(12px)" : "none",
        borderRight: isExpanded
          ? `1px solid ${isLightBg ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`
          : "1px solid transparent",
        boxShadow: isExpanded ? "4px 0 32px rgba(0,0,0,0.07)" : "none",
        transition: "background-color 0.4s, border-color 0.3s, box-shadow 0.3s",
      }}
    >
      <nav className="pointer-events-auto flex flex-col items-start justify-center gap-8 h-full w-full px-3 relative">
        {/* Avatar */}
        <button
          onClick={() => scrollTo("top")}
          data-cursor="NAV"
          className="flex items-center gap-3 group cursor-pointer w-full"
          style={{ minHeight: 44 }}
        >
          <div
            className={`w-9 h-9 shrink-0 rounded-full overflow-hidden border-2 transition-all shadow-md ${
              isLightBg
                ? "border-white/25 group-hover:border-[#0052FF]"
                : "border-zinc-300 group-hover:border-[#0052FF]"
            }`}
          >
            <img
              src={IDENTITY.avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex flex-col overflow-hidden"
              >
                <span
                  className="font-tech text-[10px] tracking-[0.12em] whitespace-nowrap"
                  style={{ color: fg }}
                >
                  {IDENTITY.handle}
                </span>
                <span
                  className="font-mono-code text-[9px] tracking-widest whitespace-nowrap"
                  style={{ color: muted }}
                >
                  {IDENTITY.role}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <motion.div
          animate={{ backgroundColor: dividerColor }}
          className="w-full h-[1px] shrink-0"
          transition={{ duration: 0.4 }}
        />

        {/* Nav items */}
        <div className="flex flex-col gap-1 w-full">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                data-cursor="NAV"
                className="flex items-center gap-3 w-full rounded-lg px-2 py-2.5 cursor-pointer group transition-colors duration-150 relative"
                style={{
                  backgroundColor: isActive
                    ? isLightBg
                      ? "rgba(0,82,255,0.15)"
                      : "rgba(0,82,255,0.08)"
                    : "transparent",
                }}
              >
                <motion.div
                  animate={{ scaleY: +!!isActive, opacity: +!!isActive }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full origin-center"
                  style={{ backgroundColor: accent }}
                />
                <div
                  className="w-5 h-5 flex items-center justify-center shrink-0 transition-colors duration-200"
                  style={{
                    color: isActive
                      ? accent
                      : isExpanded
                        ? muted
                        : isLightBg
                          ? "rgba(255,255,255,0.5)"
                          : "#a1a1aa",
                  }}
                >
                  <item.Icon className="w-[17px] h-[17px]" />
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="font-tech text-[9px] tracking-[0.12em] whitespace-nowrap"
                      style={{ color: isActive ? accent : muted }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!isExpanded && (
                  <span
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={{
                      backgroundColor: isLightBg
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.04)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <motion.div
          animate={{ backgroundColor: dividerColor }}
          className="w-full h-[1px] shrink-0"
          transition={{ duration: 0.4 }}
        />

        {/* GitHub */}
        <button
          onClick={() => window.open(IDENTITY.githubUrl, "_blank")}
          data-cursor="LINK"
          className="flex items-center gap-3 w-full rounded-lg px-2 py-2.5 cursor-pointer group transition-colors duration-150"
          style={{ marginTop: -8 }}
        >
          <div
            className="w-5 h-5 flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:text-[#0052FF]"
            style={{ color: isLightBg ? "rgba(255,255,255,0.5)" : "#a1a1aa" }}
          >
            <GitBranch className="w-[17px] h-[17px]" />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="flex items-center gap-2"
              >
                <span
                  className="font-tech text-[9px] tracking-[0.12em] whitespace-nowrap group-hover:text-[#0052FF] transition-colors"
                  style={{ color: muted }}
                >
                  GITHUB
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF] animate-pulse shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </nav>
    </motion.header>
  );
}
