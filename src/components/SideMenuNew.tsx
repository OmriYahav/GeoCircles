import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { type MenuRouteName } from "../context/MenuContext";
import { colors } from "../theme/colors";
import { colors as tokenColors, font, radius, spacing } from "../theme/tokens";

export type SideMenuNewProps = {
  visible: boolean;
  onClose: () => void;
  navigate: (routeName: MenuRouteName, params?: object) => void;
};

type MenuItem = {
  key: MenuRouteName;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const MENU_ITEMS: MenuItem[] = [
  {
    key: "Recipes",
    title: "מתכונים בריאים",
    subtitle: "רעיון למתוק ללא רגשות אשם",
    icon: "fast-food-outline",
  },
  {
    key: "Workshops",
    title: "סדנאות",
    subtitle: "קביעת מקום לאירוע הבא",
    icon: "people-outline",
  },
  {
    key: "Treatments",
    title: "טיפולים",
    subtitle: "תמיכה אישית וקבוצתית",
    icon: "leaf-outline",
  },
  {
    key: "Tips",
    title: "עצות תזונה",
    subtitle: "טיפים יומיומיים לאיזון",
    icon: "sparkles-outline",
  },
  {
    key: "Blog",
    title: "בלוג",
    subtitle: "מאמרים והשראה שבועית",
    icon: "book-outline",
  },
  {
    key: "Contact",
    title: "צרו קשר",
    subtitle: "ערוצים מהירים לשיחה",
    icon: "chatbubble-ellipses-outline",
  },
];

const BACKDROP_OPACITY = 0.55;
const MAX_PANEL_WIDTH = 360;

export default function SideMenuNew({ visible, onClose, navigate }: SideMenuNewProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [isRendered, setIsRendered] = useState(visible);
  const fadeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(visible ? 0 : 1)).current;

  const panelWidth = useMemo(() => Math.min(windowWidth * 0.84, MAX_PANEL_WIDTH), [windowWidth]);
  const slideDistance = panelWidth + 48;

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsRendered(false);
      }
    });
  }, [fadeAnim, slideAnim, visible]);

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
        opacity: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, BACKDROP_OPACITY],
        }),
      },
    ],
    [fadeAnim],
  );

  const animatedPanelStyle = useMemo(
    () => [
      styles.panel,
      {
        width: panelWidth,
        opacity: fadeAnim,
        transform: [
          {
            translateX: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, (I18nManager.isRTL ? -1 : 1) * slideDistance],
            }),
          },
        ],
      },
    ],
    [fadeAnim, panelWidth, slideAnim, slideDistance],
  );

  if (!isRendered) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View pointerEvents={pointerEvents} style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View style={animatedBackdropStyle} />
        </Pressable>
      </Animated.View>

      <Animated.View pointerEvents={pointerEvents} style={animatedPanelStyle}>
        <LinearGradient
          colors={[tokenColors.bg0, tokenColors.bg1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.brandPrimary}>Sweet</Text>
              <Text style={styles.brandSecondary}>Balance</Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="סגירת תפריט"
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
            >
              <Ionicons name="close" size={22} color={tokenColors.accent} />
            </Pressable>
          </View>

          <Text style={styles.tagline}>בחרי לאן להמשיך במסע המתוק שלך</Text>

          <ScrollView
            contentContainerStyle={styles.menuContent}
            showsVerticalScrollIndicator={false}
          >
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => handleNavigate(item)}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}. ${item.subtitle}`}
              >
                <View style={styles.menuItemBody}>
                  <View style={styles.textBlock}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <View style={styles.iconBubble}>
                    <Ionicons name={item.icon} size={22} color={tokenColors.accent} />
                  </View>
                </View>
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={tokenColors.accent}
                  style={styles.menuChevron}
                />
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerIcon}>
              <Ionicons name="sparkles" size={18} color={colors.text.inverse} />
            </View>
            <View style={styles.footerTextBlock}>
              <Text style={styles.footerTitle}>איזון טבעי</Text>
              <Text style={styles.footerSubtitle}>זמן לעצמך, רגע לנשום</Text>
            </View>
          </View>
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
    shadowOpacity: 0.2,
    shadowRadius: 28,
    shadowOffset: { width: -6, height: 12 },
    elevation: 24,
    zIndex: 9999,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: "space-between",
    writingDirection: "rtl",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerText: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  brandPrimary: {
    color: tokenColors.accent,
    fontSize: font.h1,
    fontWeight: "700",
    lineHeight: 32,
  },
  brandSecondary: {
    color: tokenColors.accent,
    fontSize: font.h2,
    fontWeight: "700",
    lineHeight: 28,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0,0,0,0.12)",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  closeButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  tagline: {
    fontSize: font.body,
    color: "rgba(47, 107, 58, 0.7)",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: "right",
  },
  menuContent: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  menuItem: {
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.92)",
    shadowColor: "rgba(0,0,0,0.08)",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuItemPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.95,
  },
  menuItemBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    gap: spacing.lg,
  },
  textBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  menuTitle: {
    color: tokenColors.accent,
    fontSize: font.h2,
    fontWeight: "700",
    textAlign: "right",
  },
  menuSubtitle: {
    marginTop: 4,
    color: "rgba(34,68,41,0.7)",
    fontSize: font.small,
    textAlign: "right",
  },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(46,107,59,0.1)",
    borderWidth: 1,
    borderColor: "rgba(46,107,59,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuChevron: {
    marginRight: spacing.sm,
  },
  footer: {
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: "rgba(47,107,58,0.1)",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  footerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokenColors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0,0,0,0.2)",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  footerTextBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  footerTitle: {
    color: colors.text.primary,
    fontWeight: "700",
    fontSize: font.body,
  },
  footerSubtitle: {
    color: colors.text.secondary,
    fontSize: font.small,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "#000",
  },
});
