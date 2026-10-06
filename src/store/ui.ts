import { create } from "zustand";

interface UiState {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isExpanded: false,
  setIsExpanded: (expanded) => set({ isExpanded: expanded }),
}));
