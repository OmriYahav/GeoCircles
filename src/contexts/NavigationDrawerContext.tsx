import React from "react";

export type NavigationDrawerContextValue = {
  openDrawer: () => void;
  closeDrawer: (nextRoute?: string) => void;
  toggleDrawer: () => void;
  isOpen: boolean;
};

const noop = () => {
  // Intentionally empty: provides safe fallbacks before the drawer mounts.
};

const defaultValue: NavigationDrawerContextValue = {
  openDrawer: noop,
  closeDrawer: noop,
  toggleDrawer: noop,
  isOpen: false,
};

type NavigationDrawerContextState = {
  value: NavigationDrawerContextValue;
  setValue: React.Dispatch<React.SetStateAction<NavigationDrawerContextValue>>;
};

const NavigationDrawerContext = React.createContext<
  NavigationDrawerContextState | undefined
>(undefined);

export function NavigationDrawerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [value, setValue] = React.useState<NavigationDrawerContextValue>(
    defaultValue
  );

  const contextValue = React.useMemo(
    () => ({
      value,
      setValue,
    }),
    [value]
  );

  return (
    <NavigationDrawerContext.Provider value={contextValue}>
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
  return context.value;
}

export function useSyncNavigationDrawerValue(
  value: NavigationDrawerContextValue
) {
  const context = React.useContext(NavigationDrawerContext);
  if (!context) {
    throw new Error(
      "useSyncNavigationDrawerValue must be used within a NavigationDrawerProvider"
    );
  }

  React.useEffect(() => {
    context.setValue(value);
    return () => {
      context.setValue(defaultValue);
    };
  }, [context, value]);
}
