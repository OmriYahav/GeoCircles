import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import TopNavigationMenu from "./TopNavigationMenu";
import { colors, spacing } from "../../theme";
import SideMenuContent from "./SideMenuContent";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ScreenScaffoldProps = {
  children: React.ReactNode;
  variant?: "default" | "modal";
  contentStyle?: StyleProp<ViewStyle>;
  showTopNavigation?: boolean;
  topContent?: React.ReactNode;
  flatTopNavigation?: boolean;
};

export default function ScreenScaffold({
  children,
  variant: _variant = "default",
  contentStyle,
  showTopNavigation = true,
  topContent,
  flatTopNavigation: _flatTopNavigation = false,
}: ScreenScaffoldProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const menuWidth = useMemo(() => Math.min(width * 0.8, 320), [width]);

  useEffect(() => {
    if (isMenuOpen) {
      setMenuVisible(true);
      Animated.timing(menuAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    if (!isMenuVisible) {
      return;
    }

    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 260,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setMenuVisible(false);
      }
    });
  }, [isMenuOpen, isMenuVisible, menuAnim]);

  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleToggleMenu = useCallback(() => {
    setIsMenuOpen((previous) => !previous);
  }, []);

  const handleNavigateHome = useCallback(() => {
    setIsMenuOpen(false);
    router.navigate("/");
  }, [router]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {showTopNavigation ? (
        <TopNavigationMenu
          isMenuOpen={isMenuOpen}
          onPressHome={handleNavigateHome}
          onPressMenu={handleToggleMenu}
        />
      ) : null}
      {topContent ? <View style={styles.topContent}>{topContent}</View> : null}
      <View style={[styles.content, contentStyle]}>{children}</View>
      {isMenuVisible ? (
        <>
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="סגירת תפריט"
            onPress={handleCloseMenu}
            style={[
              styles.overlay,
              {
                opacity: menuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.45],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.sideMenu,
              {
                width: menuWidth,
                opacity: menuAnim,
                transform: [
                  {
                    translateX: menuAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [menuWidth, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <SideMenuContent
              bottomInset={insets.bottom}
              onClose={handleCloseMenu}
              topInset={insets.top}
            />
          </Animated.View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 100,
  },
  sideMenu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    zIndex: 100,
  },
  topContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
});
