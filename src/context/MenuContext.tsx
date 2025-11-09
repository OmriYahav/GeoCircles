import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BackHandler } from "react-native";

export type MenuRouteName =
  | "Recipes"
  | "Workshops"
  | "Treatments"
  | "Blog"
  | "Tips"
  | "Contact";

type MenuContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const MenuContext = createContext<MenuContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export type MenuProviderProps = {
  children: ReactNode;
};

export function MenuProvider({ children }: MenuProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleBackPress = () => {
      if (!isOpen) {
        return false;
      }

      setIsOpen(false);
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );

    return () => {
      subscription.remove();
    };
  }, [isOpen]);

  const value = useMemo<MenuContextValue>(
    () => ({
      isOpen,
      open,
      close,
    }),
    [isOpen, open, close],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }

  const { isOpen, open, close } = context;

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
      return;
    }

    open();
  }, [isOpen, open, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
    menuOpen: isOpen,
    openMenu: open,
    closeMenu: close,
    toggleMenu: toggle,
  } as const;
}

export default MenuContext;
