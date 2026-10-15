import { useState } from "react";
import Preloader from "../components/Preloader";
import MainframeBus from "../components/MainframeBus";
import DatumRuler from "../components/DatumRuler";
import Hero from "../components/Hero";
import SkillMarquee from "../components/SkillMarquee";
import About from "../components/About";
import Timeline from "../components/Timeline";
import GitHubStats from "../components/GitHubStats";
import GitHubDeveloper from "../components/GitHubDeveloper";
import Contact from "../components/Contact";

const SESSION_KEY = "portfolio_loaded";

/**
 * Light home experience — POST boot (once per session), the top mainframe bus,
 * drafting-sheet hero, dual-band data bus, about, trajectory log, live
 * telemetry and the contact console. The datum ruler runs down the right edge.
 */
export default function HomePage() {
  const [loaded, setLoaded] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1",
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0D0E12] relative selection:bg-accent selection:text-white">
      {!loaded && (
        <Preloader
          onComplete={() => {
            sessionStorage.setItem(SESSION_KEY, "1");
            setLoaded(true);
          }}
        />
      )}
      <MainframeBus context="home" />
      <DatumRuler tone="light" />
      <main className="w-full relative">
        <Hero
          onAbout={() =>
            document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
          }
        />
        <SkillMarquee />
        <About />
        <Timeline />
        <GitHubStats />
        <GitHubDeveloper />
        <Contact />
      </main>
    </div>
  );
}
