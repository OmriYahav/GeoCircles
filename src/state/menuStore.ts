import { create } from "zustand";

type MenuState = {
  open: boolean;
  setOpen: (value: boolean) => void;
  toggle: () => void;
};

export const useMenuStore = create<MenuState>((set) => ({
  open: false,
  setOpen: (value) => set({ open: value }),
  toggle: () => set((state) => ({ open: !state.open })),
}));
