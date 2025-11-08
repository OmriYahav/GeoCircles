import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";

import { useMenuStore } from "../state/menuStore";

type MenuContextValue = {
  menuOpen: boolean;
  toggleMenu: () => void;
  openMenu: () => void;
  closeMenu: () => void;
};

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

type MenuProviderProps = {
  children: ReactNode;
};

export function MenuProvider({ children }: MenuProviderProps) {
  const menuOpen = useMenuStore((state) => state.open);
  const toggle = useMenuStore((state) => state.toggle);
  const setOpen = useMenuStore((state) => state.setOpen);

  const openMenu = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const value = useMemo(
    () => ({
      menuOpen,
      toggleMenu: toggle,
      openMenu,
      closeMenu,
    }),
    [menuOpen, toggle, openMenu, closeMenu],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }

  return context;
}

export default MenuProvider;
