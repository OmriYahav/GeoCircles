import React, { useCallback, useMemo, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { DrawerLayout } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";
import { Slot, usePathname, useRouter } from "expo-router";

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
  const drawerWidth = Math.min(width * 0.8, 340);
  const drawerRef = useRef<DrawerLayout | null>(null);
  const pendingRouteRef = useRef<string | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => {
    drawerRef.current?.openDrawer();
  }, []);

  const closeDrawer = useCallback(
    (nextRoute?: string) => {
      if (nextRoute) {
        pendingRouteRef.current = nextRoute;
      }

      if (!isDrawerOpen) {
        const routeToOpen = pendingRouteRef.current;
        pendingRouteRef.current = null;
        if (routeToOpen && routeToOpen !== pathname) {
          router.navigate(routeToOpen as never);
        }
        return;
      }

      drawerRef.current?.closeDrawer();
    },
    [isDrawerOpen, pathname, router]
  );

  const toggleDrawer = useCallback(() => {
    if (isDrawerOpen) {
      closeDrawer();
      return;
    }
    openDrawer();
  }, [closeDrawer, isDrawerOpen, openDrawer]);

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

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    const routeToOpen = pendingRouteRef.current;
    pendingRouteRef.current = null;
    if (routeToOpen && routeToOpen !== pathname) {
      router.navigate(routeToOpen as never);
    }
  }, [pathname, router]);

  const handleDrawerOpen = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const providerValue = useMemo<NavigationDrawerContextValue>(
    () => ({
      openDrawer,
      closeDrawer,
      toggleDrawer,
      isOpen: isDrawerOpen,
    }),
    [closeDrawer, isDrawerOpen, openDrawer, toggleDrawer]
  );

  const renderNavigation = useCallback(
    () => (
      <View style={[styles.drawerContainer, { width: drawerWidth }]}> 
        <View style={styles.drawerHeader}>
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
    ),
    [drawerWidth, handleNavigate, pathname]
  );

  useSyncNavigationDrawerValue(providerValue);

  return (
    <DrawerLayout
      ref={drawerRef}
      drawerWidth={drawerWidth}
      drawerPosition="right"
      drawerType="front"
      drawerBackgroundColor="transparent"
      overlayColor="transparent"
      renderNavigationView={renderNavigation}
      onDrawerClose={handleDrawerClose}
      onDrawerOpen={handleDrawerOpen}
      edgeWidth={0}
    >
      <View style={styles.container}>
        <Slot />
        {isDrawerOpen ? (
          <Pressable
            accessibilityLabel="סגירת תפריט"
            accessibilityRole="button"
            onPress={() => closeDrawer()}
            style={styles.backdrop}
          >
            <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
          </Pressable>
        ) : null}
      </View>
    </DrawerLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: DRAWER_BACKGROUND,
    borderTopLeftRadius: radii.xl,
    borderBottomLeftRadius: radii.xl,
    paddingVertical: spacing.xxxl,
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
