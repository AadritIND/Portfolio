import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, FileCheck } from "lucide-react";
import { IDENTITY } from "../data/types";

export interface LegalSection {
  id: string;
  heading: string;
  body: React.ReactNode;
}

/**
 * Shared layout for the legal docs — dark doc-header band with stamp +
 * metadata, light body with sticky section index, corner-bracketed cards.
 * Same visual language as the rest of the site, not a bland template.
 */
export default function LegalLayout({
  docId,
  title,
  subtitle,
  updated,
  sections,
  otherPage,
}: {
  docId: string;
  title: string;
  subtitle: string;
  updated: string;
  sections: LegalSection[];
  otherPage: { to: string; label: string };
}) {
  useEffect(() => {
    document.title = `${title} — AADRIT`;
    return () => {
      document.title = "AADRIT — Full-Stack Developer, Cybersecurity & AI/ML Explorer";
    };
  }, [title]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0D0E12] selection:bg-accent selection:text-white">
      {/* Doc header band */}
      <header className="bg-[#0D0E12] text-white border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-accent/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute inset-0 bg-noise opacity-[0.04] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-14 relative z-10">
          <div className="flex items-center justify-between mb-12">
            <Link
              to="/"
              data-cursor="GO"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-tech hover:bg-white/10 hover:border-accent transition group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>EXIT TO BASE</span>
            </Link>
            <span className="font-mono-code text-[10px] text-zinc-500 tracking-widest hidden sm:block">
              DOC.{docId} · STATUS: IN EFFECT
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-0.5 rounded-md bg-accent/20 border border-accent/40 text-accent font-tech text-[9px] tracking-[0.12em]">
                {docId}
              </span>
              <span className="font-mono-code text-[10px] text-zinc-500">
                LAST UPDATED: {updated}
              </span>
            </div>
            <h1 className="font-hero font-normal text-4xl sm:text-6xl lg:text-7xl text-white tracking-[0.03em] leading-[1.08] mb-4">
              {title}
            </h1>
            <p className="font-sub text-sm text-zinc-400 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </motion.div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Sticky index */}
          <aside className="hidden xl:block xl:col-span-3">
            <div className="sticky top-10">
              <p className="font-tech text-[8px] tracking-[0.2em] text-zinc-500 mb-4">
                DOCUMENT INDEX
              </p>
              <nav className="space-y-1 border-l border-zinc-200">
                {sections.map((s, i) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block pl-4 py-1.5 font-mono-code text-[11px] text-zinc-500 hover:text-accent hover:border-accent transition -ml-px border-l-2 border-transparent"
                  >
                    <span className="text-zinc-400 mr-2">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.heading}
                  </a>
                ))}
              </nav>
              <div className="mt-8 p-4 rounded-2xl bg-white border border-zinc-200 brackets">
                <p className="font-mono-code text-[10px] text-zinc-500 leading-relaxed">
                  TL;DR: this site collects nothing, stores preferences only in
                  your browser, and the only person who reads your contact
                  messages is the human in the footer.
                </p>
              </div>
            </div>
          </aside>

          {/* Sections */}
          <div className="xl:col-span-9 space-y-5">
            {sections.map((s, i) => (
              <motion.section
                key={s.id}
                id={s.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="scroll-mt-8 bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 hover:border-zinc-300 transition"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="font-display font-black text-2xl text-accent/25 shrink-0 w-12">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display font-bold text-lg sm:text-xl text-[#0D0E12] tracking-wide pt-1">
                    {s.heading}
                  </h2>
                </div>
                <div className="text-sm text-zinc-600 leading-relaxed font-normal space-y-3 pl-0 sm:pl-16">
                  {s.body}
                </div>
              </motion.section>
            ))}

            {/* Cross-link + contact strip */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D0E12] text-white border border-zinc-800">
              <div className="flex items-center gap-3">
                {otherPage.label.includes("PRIVACY") ? (
                  <ShieldCheck className="w-5 h-5 text-accent" />
                ) : (
                  <FileCheck className="w-5 h-5 text-accent" />
                )}
                <span className="font-mono-code text-xs text-zinc-300">
                  READ THE OTHER DOC:
                </span>
              </div>
              <Link
                to={otherPage.to}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/85 text-white font-tech text-[9px] transition"
              >
                <span>{otherPage.label}</span>
              </Link>
            </div>

            <p className="font-mono-code text-[10px] text-zinc-400 text-center pt-2">
              questions about this document →{" "}
              <a
                href={`mailto:${IDENTITY.email}`}
                className="text-accent hover:underline"
              >
                {IDENTITY.email}
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
