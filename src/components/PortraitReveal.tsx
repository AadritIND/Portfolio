import { useEffect } from "react";

declare global {
  interface Window {
    AC_PORTRAIT_SRC?: string;
  }
}

/** Scroll-driven portrait reveal between the data bus and the About section. */
export default function PortraitReveal() {
  useEffect(() => {
    const root = document.getElementById("portrait-reveal");
    if (!root) return;
    window.AC_PORTRAIT_SRC = "/aadrit-portrait.jpg";

    const script = document.createElement("script");
    script.src = "/portrait-reveal.js";
    script.async = true;
    document.body.appendChild(script);

    return () => script.remove();
  }, []);

  return (
    <section
      className="ac-reveal"
      id="portrait-reveal"
      aria-label="Aadrit Chandravanci portrait reveal"
      data-intro="Aadrit"
      data-first="Aadrit"
      data-last="Chandravanci"
    >
      <div className="ac-stage">
        <canvas className="ac-canvas" aria-hidden="true" />
        <img className="ac-fallback" alt="" aria-hidden="true" />
        <div className="ac-dot" aria-hidden="true" />
        <h2 className="ac-title">
          <span className="ac-sr">Aadrit Chandravanci</span>
          <span className="ac-line ac-l1" aria-hidden="true" />
          <span className="ac-line ac-l2" aria-hidden="true" />
        </h2>
        <div className="ac-hint" aria-hidden="true">Scroll</div>
      </div>
    </section>
  );
}
