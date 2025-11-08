import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SideMenuContent from "../components/layout/SideMenuContent";
import { colors } from "../theme";

type MenuContextValue = {
  menuOpen: boolean;
  toggleMenu: () => void;
  openMenu: () => void;
  closeMenu: () => void;
};

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

type MenuProviderProps = {
  children: React.ReactNode;
  overlayStyle?: StyleProp<ViewStyle>;
};

export function MenuProvider({ children, overlayStyle }: MenuProviderProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (menuOpen) {
      setVisible(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(animation, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setVisible(false);
      }
    });
  }, [animation, menuOpen]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((previous) => !previous);
  }, []);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const value = useMemo(
    () => ({ menuOpen, toggleMenu, openMenu, closeMenu }),
    [menuOpen, toggleMenu, openMenu, closeMenu],
  );

  return (
    <MenuContext.Provider value={value}>
      <View style={styles.container}>
        {children}
        {visible ? (
          <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, overlayStyle]}>
            <Animated.View
              pointerEvents="box-none"
              style={[
                StyleSheet.absoluteFill,
                styles.backdrop,
                {
                  opacity: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.45],
                  }),
                },
              ]}
            >
              <Pressable
                accessibilityLabel="סגירת תפריט"
                accessibilityRole="button"
                onPress={closeMenu}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.menuContainer,
                {
                  width: Math.min(width * 0.8, 320),
                  paddingTop: insets.top,
                  paddingBottom: insets.bottom,
                  transform: [
                    {
                      translateX: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [260, 0],
                      }),
                    },
                  ],
                  opacity: animation,
                },
              ]}
            >
              <SideMenuContent
                onClose={closeMenu}
                animationValue={animation}
                topInset={insets.top}
                bottomInset={insets.bottom}
              />
            </Animated.View>
          </View>
        ) : null}
      </View>
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }

  return context;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgFrom,
  },
  backdrop: {
    backgroundColor: "#000",
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: -4, height: 0 },
    elevation: 12,
  },
});

export default MenuProvider;
