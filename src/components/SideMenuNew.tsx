import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { type MenuRouteName } from "../context/MenuContext";
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
  icon: keyof typeof Feather.glyphMap;
};

const MENU_ITEMS: MenuItem[] = [
  {
    key: "Recipes",
    title: "מתכונים בריאים",
    subtitle: "רעיון למתוק ללא רגשות אשם",
    icon: "coffee",
  },
  {
    key: "Workshops",
    title: "סדנאות",
    subtitle: "קביעת מקום לאירוע הבא",
    icon: "users",
  },
  {
    key: "Treatments",
    title: "טיפולים",
    subtitle: "תמיכה אישית וקבוצתית",
    icon: "leaf",
  },
  {
    key: "Tips",
    title: "עצות תזונה",
    subtitle: "טיפים יומיומיים לאיזון",
    icon: "apple",
  },
  {
    key: "Blog",
    title: "בלוג",
    subtitle: "מאמרים והשראה שבועית",
    icon: "book",
  },
  {
    key: "Contact",
    title: "צרו קשר",
    subtitle: "ערוצים מהירים לשיחה",
    icon: "message-circle",
  },
];

const BACKDROP_OPACITY = 0.55;
const MAX_PANEL_WIDTH = 360;

export default function SideMenuNew({ visible, onClose, navigate }: SideMenuNewProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [isRendered, setIsRendered] = useState(visible);
  const fadeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(visible ? 0 : 100)).current;

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
        Animated.spring(slideAnim, {
          toValue: 0,
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
      Animated.spring(slideAnim, {
        toValue: 100,
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
              inputRange: [0, 100],
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
        {visible ? (
          <BlurView
            intensity={25}
            tint="light"
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        ) : null}
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
              <Feather name="x" size={22} color={tokenColors.accent} />
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
                <View style={styles.iconContainer}>
                  <Feather name={item.icon} size={22} color={tokenColors.accent} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Feather name="chevron-left" size={22} color={tokenColors.accent} />
              </Pressable>
            ))}
          </ScrollView>

          <TouchableOpacity
            accessibilityRole="button"
            style={styles.ctaButton}
            onPress={() => {
              navigate("Treatments");
              onClose();
            }}
            accessibilityLabel="איזון טבעי – מעבר לטיפולים"
          >
            <Feather name="wind" size={20} color="#FFFFFF" />
            <Text style={styles.ctaText}>איזון טבעי – רגע לנשום</Text>
          </TouchableOpacity>
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
    fontFamily: "Heebo_700Bold",
    lineHeight: 32,
  },
  brandSecondary: {
    color: tokenColors.accent,
    fontSize: font.h2,
    fontFamily: "Heebo_700Bold",
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
    fontFamily: "Heebo_400Regular",
    color: "rgba(59, 122, 87, 0.75)",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: "right",
  },
  menuContent: {
    paddingBottom: spacing.xl + 40,
  },
  menuItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginVertical: 8,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  menuItemPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.95,
  },
  iconContainer: {
    backgroundColor: "#E8F3EA",
    borderRadius: 50,
    padding: 10,
    marginLeft: 10,
  },
  textContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  menuTitle: {
    color: tokenColors.accent,
    fontSize: 18,
    fontFamily: "Heebo_700Bold",
    textAlign: "right",
  },
  menuSubtitle: {
    fontSize: 14,
    color: "#6B6B6B",
    marginTop: 2,
    fontFamily: "Heebo_400Regular",
    textAlign: "right",
  },
  ctaButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B7A57",
    borderRadius: 30,
    paddingVertical: 12,
    marginTop: 20,
    gap: 8,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Heebo_600SemiBold",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "#000",
  },
});
