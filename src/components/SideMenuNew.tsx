import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { type MenuRouteName } from "../context/MenuContext";
import {
  colors as tokenColors,
  font,
  lineHeight,
  radius,
  spacing,
} from "../theme/tokens";

export type SideMenuNewProps = {
  visible: boolean;
  onClose: () => void;
  navigate: (routeName: MenuRouteName, params?: object) => void;
};

type MenuItem = {
  key: MenuRouteName;
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
};

const MENU_ITEMS: MenuItem[] = [
  {
    key: "Recipes",
    title: "מתכונים בריאים",
    subtitle: "מתוק מאוזן ומחבק",
    icon: "coffee",
  },
  {
    key: "Workshops",
    title: "סדנאות",
    subtitle: "ללמוד, ליצור ולהתחבר",
    icon: "users",
  },
  {
    key: "Treatments",
    title: "טיפולים",
    subtitle: "איזון מותאם בדיוק בשבילך",
    icon: "heart",
  },
  {
    key: "Tips",
    title: "עצות תזונה",
    subtitle: "הכוונה רכה ליום-יום",
    icon: "book-open",
  },
  {
    key: "Blog",
    title: "בלוג",
    subtitle: "השראה, סיפורים וטעמים",
    icon: "feather",
  },
  {
    key: "Contact",
    title: "צרו קשר",
    subtitle: "נשמח לשיחה מתוקה",
    icon: "message-circle",
  },
];

const BACKDROP_OPACITY = 0.45;
const MAX_PANEL_WIDTH = 360;
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function SideMenuNew({ visible, onClose, navigate }: SideMenuNewProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [isRendered, setIsRendered] = useState(visible);
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;

  const panelWidth = useMemo(
    () => Math.min(windowWidth * 0.9, MAX_PANEL_WIDTH),
    [windowWidth],
  );
  const slideDistance = panelWidth + 48;

  useEffect(() => {
    let isMounted = true;
    if (visible) {
      setIsRendered(true);
    }

    progress.stopAnimation();
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: 150,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (!visible && finished && isMounted) {
        setIsRendered(false);
      }
    });

    return () => {
      isMounted = false;
      animation.stop();
    };
  }, [progress, visible]);

  const handleNavigate = useCallback(
    (item: MenuItem) => {
      navigate(item.key);
      onClose();
    },
    [navigate, onClose],
  );

  const pointerEvents = visible ? "auto" : "none";

  const animatedBackdropStyle = useMemo(
    () => [
      styles.backdrop,
      {
        opacity: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, BACKDROP_OPACITY],
        }),
      },
    ],
    [progress],
  );

  const animatedPanelStyle = useMemo(
    () => [
      styles.panel,
      {
        width: panelWidth,
        opacity: progress,
        transform: [
          {
            translateX: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [
                (I18nManager.isRTL ? -1 : 1) * slideDistance,
                0,
              ],
            }),
          },
        ],
      },
    ],
    [panelWidth, progress, slideDistance],
  );

  if (!isRendered) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View pointerEvents={pointerEvents} style={StyleSheet.absoluteFill}>
        <AnimatedBlurView
          intensity={28}
          tint="light"
          style={[StyleSheet.absoluteFill, { opacity: progress }]}
          pointerEvents="none"
        />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View style={animatedBackdropStyle} />
        </Pressable>
      </Animated.View>

      <Animated.View pointerEvents={pointerEvents} style={animatedPanelStyle}>
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.brandTitle}>Sweet Balance</Text>
              <Text style={styles.brandSubtitle}>ניווט נינוח אל המרכז המתוק שלך</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="סגירת תפריט"
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            >
              <Feather name="x" size={18} color={tokenColors.text} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.menuContent}
            showsVerticalScrollIndicator={false}
          >
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => handleNavigate(item)}
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}. ${item.subtitle}`}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.iconContainer}>
                    <Feather name={item.icon} size={24} color={tokenColors.text} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Feather
                    name={I18nManager.isRTL ? "chevron-left" : "chevron-right"}
                    size={22}
                    color={tokenColors.text}
                  />
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    borderTopLeftRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
    overflow: "hidden",
    shadowColor: tokenColors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 26,
    shadowOffset: { width: -8, height: 14 },
    elevation: 24,
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xl,
    justifyContent: "space-between",
    writingDirection: "rtl",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  brandTitle: {
    color: tokenColors.text,
    fontSize: font.h1,
    fontFamily: "Heebo_700Bold",
    textAlign: "center",
    lineHeight: lineHeight.h1,
  },
  brandSubtitle: {
    color: "#707070",
    fontSize: font.small,
    fontFamily: "Heebo_400Regular",
    textAlign: "center",
    marginTop: 6,
    lineHeight: lineHeight.small,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokenColors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  menuContent: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  menuItem: {
    borderRadius: 20,
    backgroundColor: "#F7F7EE",
  },
  menuItemPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  menuItemContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokenColors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4,
  },
  menuTitle: {
    color: tokenColors.text,
    fontSize: font.lead,
    fontFamily: "Heebo_600SemiBold",
    textAlign: "right",
    lineHeight: lineHeight.lead,
  },
  menuSubtitle: {
    color: "#707070",
    fontSize: font.body,
    fontFamily: "Heebo_400Regular",
    textAlign: "right",
    lineHeight: lineHeight.body,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "#000",
  },
});
