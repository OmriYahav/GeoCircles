import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import MenuItem from "./MenuItem";
import { colors, radius, spacing, font } from "../theme/tokens";
import { useMenuStore } from "../state/menuStore";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.88, 420);

const MENU_ITEMS = [
  {
    icon: "fast-food-outline" as const,
    title: "מתכונים בריאים",
    subtitle: "רעיון למתוק ללא רגשות אשם",
    path: "/(drawer)/recipes",
    testID: "menu-recipes",
  },
  {
    icon: "restaurant-outline" as const,
    title: "סדנאות",
    subtitle: "קביעת מקום לאירוע הבא",
    path: "/(drawer)/workshops",
    testID: "menu-workshops",
  },
  {
    icon: "leaf-outline" as const,
    title: "טיפולים",
    subtitle: "אישי וקבוצתי",
    path: "/(drawer)/treatments",
    testID: "menu-treatments",
  },
  {
    icon: "nutrition-outline" as const,
    title: "עצות תזונה",
    subtitle: "טיפים יומיומיים",
    path: "/(drawer)/nutrition-tips",
    testID: "menu-nutrition",
  },
  {
    icon: "book-outline" as const,
    title: "בלוג",
    subtitle: "מאמרים והשראה",
    path: "/(drawer)/blog",
    testID: "menu-blog",
  },
  {
    icon: "chatbubble-ellipses-outline" as const,
    title: "צרו קשר",
    subtitle: "ערוצים מהירים לשיחה",
    path: "/(drawer)/contact",
    testID: "menu-contact",
  },
];

export default function SideMenu() {
  const { open, setOpen } = useMenuStore();
  const router = useRouter();
  const [visible, setVisible] = useState(open);
  const progress = useSharedValue(open ? 1 : 0);

  useEffect(() => {
    if (open) {
      setVisible(true);
    }

    progress.value = withTiming(open ? 1 : 0, {
      duration: open ? 260 : 220,
      easing: Easing.out(Easing.quad),
    });

    if (!open) {
      const timeout = setTimeout(() => {
        setVisible(false);
      }, 240);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [open, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [PANEL_WIDTH, 0]),
      },
    ],
  }));

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleNavigate = useCallback(
    (path: string) => {
      closeMenu();
      router.navigate(path);
    },
    [closeMenu, router],
  );

  const renderedItems = useMemo(
    () =>
      MENU_ITEMS.map((item) => (
        <MenuItem
          key={item.title}
          icon={item.icon}
          title={item.title}
          subtitle={item.subtitle}
          onPress={() => handleNavigate(item.path)}
          testID={item.testID}
        />
      )),
    [handleNavigate],
  );

  if (!visible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <Pressable onPress={closeMenu} style={styles.backdropPressable}>
          <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.panel, panelStyle]} pointerEvents="box-none">
        <SafeAreaView edges={["top", "right", "left"]} style={styles.safeArea}>
          <LinearGradient colors={[colors.bg0, colors.bg1]} style={StyleSheet.absoluteFill} />
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.brand}>Sweet{"\n"}Balance</Text>
              <Pressable
                accessibilityLabel="סגור תפריט"
                accessibilityRole="button"
                onPress={closeMenu}
                style={styles.close}
              >
                <Ionicons name="close" size={22} color={colors.accent} />
              </Pressable>
            </View>
            <Text style={styles.tagline}>ניווט נינוח אל התוכן המתוק</Text>

            <View style={styles.section}>{renderedItems}</View>

            <View style={styles.divider} />
            <View style={styles.footer}>
              <Ionicons name="leaf-outline" size={18} color={colors.accent} />
              <Text style={styles.footerText}>טבעי. רגוע. מדויק.</Text>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  panel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    borderTopLeftRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.bg0,
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: -6, height: 6 },
    elevation: 18,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: spacing.lg,
  },
  brand: {
    color: colors.accent,
    fontSize: font.h1,
    lineHeight: 36,
    fontWeight: "700",
    textAlign: "right",
    flex: 1,
  },
  close: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  tagline: {
    color: "rgba(34,68,41,0.7)",
    fontSize: font.body,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    textAlign: "right",
  },
  section: {
    paddingHorizontal: spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xl,
    marginHorizontal: spacing.xl,
    borderRadius: 1,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    color: "rgba(34,68,41,0.7)",
    fontSize: font.small,
    textAlign: "right",
  },
  backdropPressable: {
    flex: 1,
  },
});
