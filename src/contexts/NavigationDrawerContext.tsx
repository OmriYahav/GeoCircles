import React from "react";

export type NavigationDrawerContextValue = {
  openDrawer: () => void;
  closeDrawer: (nextRoute?: string) => void;
  toggleDrawer: () => void;
  isOpen: boolean;
};

const NavigationDrawerContext = React.createContext<
  NavigationDrawerContextValue | undefined
>(undefined);

export function NavigationDrawerProvider({
  value,
  children,
}: {
  value: NavigationDrawerContextValue;
  children: React.ReactNode;
}) {
  return (
    <NavigationDrawerContext.Provider value={value}>
      {children}
    </NavigationDrawerContext.Provider>
  );
}

export function useNavigationDrawer() {
  const context = React.useContext(NavigationDrawerContext);
  if (!context) {
    throw new Error(
      "useNavigationDrawer must be used within a NavigationDrawerProvider"
    );
  }
  return context;
}
