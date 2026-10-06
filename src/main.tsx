import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// External links open in a new tab (same hardening as the original).
document.addEventListener(
  "click",
  (e) => {
    const anchor = (e.target as Element | null)?.closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") ?? "";
    if (
      !(
        href.startsWith("/") ||
        href.startsWith("#") ||
        href.startsWith(window.location.origin)
      ) &&
      (href.startsWith("http://") || href.startsWith("https://"))
    ) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }
  },
  true,
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
