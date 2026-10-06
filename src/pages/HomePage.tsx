import { useState } from "react";
import Preloader from "../components/Preloader";
import SideRail from "../components/SideRail";
import Hero from "../components/Hero";
import SkillMarquee from "../components/SkillMarquee";
import About from "../components/About";
import Contact from "../components/Contact";

const SESSION_KEY = "portfolio_loaded";

/**
 * Light home experience — boot preloader (once per session), expanding
 * side rail, parallax hero, skill marquee, tabbed about and contact.
 */
export default function HomePage() {
  const [loaded, setLoaded] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1",
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0D0E12] relative selection:bg-[#0052FF] selection:text-white">
      {!loaded && (
        <Preloader
          onComplete={() => {
            sessionStorage.setItem(SESSION_KEY, "1");
            setLoaded(true);
          }}
        />
      )}
      <SideRail />
      <main className="w-full relative sm:pl-14 transition-all duration-300">
        <Hero
          onAbout={() =>
            document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
          }
        />
        <SkillMarquee />
        <About />
        <Contact />
      </main>
    </div>
  );
}
