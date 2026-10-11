/**
 * Skin system — the whole site's accent color reads from the --accent CSS
 * var, so a skin swap re-tints cursors, confetti, particles, buttons and
 * glows everywhere. Persisted in localStorage; applied pre-paint in
 * index.html to avoid a flash of default blue.
 */
export const SKINS = [
  { id: "sodium", name: "SODIUM", hex: "#D9480F" },
  { id: "signal", name: "SIGNAL BLUE", hex: "#0052FF" },
  { id: "ice", name: "ICE", hex: "#0891B2" },
  { id: "phosphor", name: "PHOSPHOR", hex: "#22C55E" },
  { id: "solar", name: "SOLAR FLARE", hex: "#F59E0B" },
  { id: "redline", name: "REDLINE", hex: "#F43F5E" },
  { id: "violet", name: "VIOLET FLUX", hex: "#8B5CF6" },
  { id: "graphite", name: "GRAPHITE", hex: "#475569" },
] as const;

export type SkinId = (typeof SKINS)[number]["id"];

const STORAGE_KEY = "portfolio_skin_v2";

export function isSkinId(value: unknown): value is SkinId {
  return typeof value === "string" && SKINS.some((s) => s.id === value);
}

export function getStoredSkin(): SkinId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isSkinId(raw) ? raw : "sodium";
  } catch {
    return "sodium";
  }
}

export function skinById(id: SkinId) {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}

/** Applies the skin to :root and persists it. */
export function applySkin(id: SkinId): SkinId {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* private mode — skin applies for the session only */
  }
  document.documentElement.style.setProperty("--accent", skinById(id).hex);
  return id;
}

/** Current accent hex, straight from the computed style (works for confetti/canvas). */
export function getAccentHex(): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent")
    .trim();
  return raw || "#D9480F";
}

/** hex #RRGGBB -> rgba() string with the given alpha. */
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
