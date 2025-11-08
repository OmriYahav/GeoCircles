import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Slot, usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  type NavigationDrawerContextValue,
  useSyncNavigationDrawerValue,
} from "../../src/contexts/NavigationDrawerContext";
import { colors } from "../../src/theme/colors";
import { radii, spacing, typography } from "../../src/theme";

const DRAWER_BACKGROUND = "#FFF9F3";
const DRAWER_TEXT = "#3B6545";

const MENU_ITEMS = [
  { icon: "🧁", label: "מתכונים בריאים", path: "/recipes" },
  { icon: "🥄", label: "סדנאות", path: "/workshops" },
  { icon: "🌿", label: "טיפולים", path: "/treatments" },
  { icon: "🍃", label: "עצות תזונה", path: "/nutrition-tips" },
  { icon: "📝", label: "בלוג", path: "/blog" },
  { icon: "💬", label: "אודות", path: "/about" },
  { icon: "📞", label: "צור קשר", path: "/contact" },
] as const;

export default function DrawerNavigationLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const drawerWidth = Math.min(width * 0.8, 340);
  const drawerVisibility = useRef<Animated.Value>(new Animated.Value(0)).current;
  const pendingRouteRef = useRef<string | null>(null);
  const [isDrawerVisible, setDrawerVisible] = useState(false);

  const animateDrawer = useCallback(
    (toValue: 0 | 1, onFinished?: () => void) => {
      Animated.timing(drawerVisibility, {
        toValue,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && onFinished) {
          onFinished();
        }
      });
    },
    [drawerVisibility]
  );

  const openDrawer = useCallback(() => {
    drawerVisibility.stopAnimation(() => {
      setDrawerVisible(true);
      animateDrawer(1);
    });
  }, [animateDrawer, drawerVisibility]);

  const closeDrawer = useCallback(
    (nextRoute?: string) => {
      if (nextRoute) {
        pendingRouteRef.current = nextRoute;
      }

      if (!isDrawerVisible) {
        const routeToOpen = pendingRouteRef.current;
        pendingRouteRef.current = null;
        if (routeToOpen && routeToOpen !== pathname) {
          router.navigate(routeToOpen as never);
        }
        return;
      }

      drawerVisibility.stopAnimation(() => {
        animateDrawer(0, () => {
          setDrawerVisible(false);
          const routeToOpen = pendingRouteRef.current;
          pendingRouteRef.current = null;
          if (routeToOpen && routeToOpen !== pathname) {
            router.navigate(routeToOpen as never);
          }
        });
      });
    },
    [animateDrawer, drawerVisibility, isDrawerVisible, pathname, router]
  );

  const toggleDrawer = useCallback(() => {
    if (isDrawerVisible) {
      closeDrawer();
      return;
    }
    openDrawer();
  }, [closeDrawer, isDrawerVisible, openDrawer]);

  const handleNavigate = useCallback(
    (path: string) => {
      if (path === pathname) {
        closeDrawer();
        return;
      }
      closeDrawer(path);
    },
    [closeDrawer, pathname]
  );

  const providerValue = useMemo<NavigationDrawerContextValue>(
    () => ({
      openDrawer,
      closeDrawer,
      toggleDrawer,
      isOpen: isDrawerVisible,
    }),
    [closeDrawer, isDrawerVisible, openDrawer, toggleDrawer]
  );

  useSyncNavigationDrawerValue(providerValue);

  const translateX = drawerVisibility.interpolate({
    inputRange: [0, 1],
    outputRange: [drawerWidth + 32, 0],
  });

  const backdropOpacity = drawerVisibility.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <Slot />
      {isDrawerVisible ? (
        <Pressable
          accessibilityLabel="סגירת תפריט"
          accessibilityRole="button"
          onPress={() => closeDrawer()}
          style={styles.backdropContainer}
        >
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          />
        </Pressable>
      ) : null}
      <Animated.View
        pointerEvents={isDrawerVisible ? "auto" : "none"}
        style={[styles.drawerWrapper, { width: drawerWidth, transform: [{ translateX }] }]}
      >
        <View
          style={[
            styles.drawerContainer,
            {
              paddingTop: insets.top + spacing.xxxl,
              paddingBottom: insets.bottom + spacing.xxxl,
            },
          ]}
        >
          <View style={styles.drawerHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="סגירת תפריט"
              onPress={() => closeDrawer()}
              hitSlop={{ top: spacing.sm, bottom: spacing.sm, left: spacing.sm, right: spacing.sm }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonLabel}>←</Text>
            </Pressable>
            <Text style={styles.drawerTitle}>Sweet Balance</Text>
            <Text style={styles.drawerSubtitle}>ניווט רך אל כל העולמות</Text>
          </View>
          <View style={styles.drawerMenu}>
            {MENU_ITEMS.map((item, index) => {
              const isActive = pathname === item.path;
              return (
                <React.Fragment key={item.path}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    onPress={() => handleNavigate(item.path)}
                    style={({ pressed }) => [
                      styles.drawerItem,
                      isActive && styles.drawerItemActive,
                      pressed && styles.drawerItemPressed,
                    ]}
                  >
                    <Text style={styles.drawerItemIcon}>{item.icon}</Text>
                    <Text style={[styles.drawerItemLabel, isActive && styles.drawerItemLabelActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                  {index < MENU_ITEMS.length - 1 ? <View style={styles.drawerDivider} /> : null}
                </React.Fragment>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backdropContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(59, 101, 69, 0.2)",
  },
  drawerWrapper: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    zIndex: 20,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: DRAWER_BACKGROUND,
    borderTopLeftRadius: radii.xl,
    borderBottomLeftRadius: radii.xl,
    paddingHorizontal: spacing.xxl,
    justifyContent: "space-between",
    shadowColor: Platform.select({ ios: DRAWER_TEXT, android: DRAWER_TEXT, default: DRAWER_TEXT }),
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: -4, height: 0 },
    elevation: 16,
    writingDirection: "rtl",
  },
  drawerHeader: {
    gap: spacing.sm,
    alignItems: "flex-end",
  },
  drawerTitle: {
    fontFamily: typography.family.heading,
    fontSize: typography.size.xl,
    color: DRAWER_TEXT,
    textAlign: "right",
  },
  drawerSubtitle: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    color: DRAWER_TEXT,
    opacity: 0.72,
    textAlign: "right",
  },
  drawerMenu: {
    flex: 1,
    marginTop: spacing.xxxl,
    gap: spacing.md,
  },
  closeButton: {
    alignSelf: "flex-end",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59, 101, 69, 0.12)",
  },
  closeButtonLabel: {
    fontSize: typography.size.xl,
    color: DRAWER_TEXT,
  },
  drawerItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  drawerItemActive: {
    backgroundColor: "rgba(59, 101, 69, 0.08)",
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
  },
  drawerItemPressed: {
    opacity: 0.85,
  },
  drawerItemIcon: {
    fontSize: typography.size.xl,
    color: DRAWER_TEXT,
  },
  drawerItemLabel: {
    flex: 1,
    textAlign: "right",
    fontFamily: typography.family.medium,
    fontSize: typography.size.lg,
    color: DRAWER_TEXT,
  },
  drawerItemLabelActive: {
    fontFamily: typography.family.semiBold,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: "rgba(59, 101, 69, 0.12)",
  },
});
