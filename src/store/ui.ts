import { create } from "zustand";
import { applySkin, getStoredSkin, type SkinId } from "../lib/skins";
import { soundFX } from "../lib/sound";

interface UiState {
  /** Accent skin id — drives the --accent CSS var site-wide. */
  skin: SkinId;
  setSkin: (id: SkinId) => void;
  /** Sound FX master switch (shared by WorkPage header + command palette). */
  fxOn: boolean;
  setFxOn: (on: boolean) => void;
  /** OVERCLOCK MODE — konami code / command palette. */
  overclock: boolean;
  setOverclock: (on: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  skin: applySkin(getStoredSkin()),
  setSkin: (id) => set({ skin: applySkin(id) }),
  fxOn: soundFX.enabled,
  setFxOn: (on) => {
    soundFX.enabled = on;
    set({ fxOn: on });
  },
  overclock: false,
  setOverclock: (on) => {
    document.documentElement.classList.toggle("overclock", on);
    set({ overclock: on });
  },
}));
