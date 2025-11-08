import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { colors, radii, shadows, spacing, typography } from "../theme";

type MenuItem = {
  id: string;
  icon: string;
  label: string;
  route: string;
  description: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: "recipes",
    icon: "🍰",
    label: "מתכונים בריאים",
    route: "/recipes",
    description: "מתוקים ומלוחים מאוזנים היטב לכל ימות השבוע.",
  },
  {
    id: "workshops",
    icon: "🥄",
    label: "סדנאות",
    route: "/workshops",
    description: "חוויות קולינריות אינטימיות להעמקת הידע התזונתי.",
  },
  {
    id: "treatments",
    icon: "🙌",
    label: "טיפולים",
    route: "/treatments",
    description: "מפגשי ליווי אישיים להתאמה מדויקת לצרכים שלך.",
  },
  {
    id: "nutrition",
    icon: "🌿",
    label: "עצות תזונה",
    route: "/nutrition-tips",
    description: "כלים קטנים לשינויים גדולים בשגרה היומיומית.",
  },
  {
    id: "blog",
    icon: "📖",
    label: "בלוג",
    route: "/blog",
    description: "סיפורים, השראה ומחקרי עומק מעולמות הבריאות.",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.78, 360);
  const drawerTranslation = useRef(new Animated.Value(-drawerWidth)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [drawerVisible, setDrawerVisible] = useState(false);
  const isAnimatingRef = useRef(false);
  const pendingRouteRef = useRef<string | null>(null);

  useEffect(() => {
    if (!drawerVisible) {
      drawerTranslation.setValue(-drawerWidth);
    }
  }, [drawerVisible, drawerTranslation, drawerWidth]);

  const openDrawer = useCallback(() => {
    if (drawerVisible || isAnimatingRef.current) {
      return;
    }

    isAnimatingRef.current = true;
    pendingRouteRef.current = null;
    setDrawerVisible(true);
    drawerTranslation.setValue(-drawerWidth);
    overlayOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(drawerTranslation, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 220,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      isAnimatingRef.current = false;
    });
  }, [drawerTranslation, drawerVisible, drawerWidth, overlayOpacity]);

  const closeDrawer = useCallback(
    (nextRoute?: string) => {
      if (nextRoute) {
        pendingRouteRef.current = nextRoute;
      }

      if (!drawerVisible) {
        const routeToOpen = pendingRouteRef.current;
        pendingRouteRef.current = null;
        if (routeToOpen) {
          router.push(routeToOpen as never);
        }
        return;
      }

      if (isAnimatingRef.current) {
        return;
      }

      isAnimatingRef.current = true;

      Animated.parallel([
        Animated.spring(drawerTranslation, {
          toValue: -drawerWidth,
          useNativeDriver: true,
          damping: 20,
          stiffness: 220,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        isAnimatingRef.current = false;
        if (finished) {
          setDrawerVisible(false);
          const routeToOpen = pendingRouteRef.current;
          pendingRouteRef.current = null;
          if (routeToOpen) {
            router.push(routeToOpen as never);
          }
        }
      });
    },
    [drawerTranslation, drawerVisible, drawerWidth, overlayOpacity, router]
  );

  const handleMenuItemPress = useCallback(
    (item: MenuItem) => {
      closeDrawer(item.route);
    },
    [closeDrawer]
  );

  const previewItems = useMemo(() => MENU_ITEMS.slice(0, 3), []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityHint="פתחי את תפריט הניווט"
          accessibilityLabel="פתיחת תפריט"
          accessibilityRole="button"
          hitSlop={{ top: spacing.sm, bottom: spacing.sm, left: spacing.sm, right: spacing.sm }}
          onPress={openDrawer}
          style={styles.menuButton}
        >
          <Text style={styles.menuButtonLabel}>⋮</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.headerContent}>
        <Text style={styles.title}>Sweet Balance</Text>
        <Text style={styles.subtitle}>איזון רך לחיים מלאים</Text>
      </View>

      <View style={styles.introSection}>
        <Text style={styles.introParagraph}>
          נבחרת התכנים של Sweet Balance מחכה לך בצד שמאל. לחצי על תפריט האפשרויות
          כדי לגלות מתכונים נעימים, סדנאות יוצרות חוויה ומפגשים אישיים מותאמים אלייך.
        </Text>
        <Text style={styles.introParagraph}>
          לכל קטגוריה ריכזנו עבורך נקודות השראה ותוכן מקצועי, והכול מונגש בהיר ובשפה
          רכה. התחלנו עבורך עם טעימה קטנה ממה שממתין במגירה:
        </Text>
      </View>

      <View style={styles.previewList}>
        {previewItems.map((item) => (
          <View key={item.id} style={styles.previewCard}>
            <View style={styles.previewTextWrapper}>
              <Text style={styles.previewTitle}>{item.label}</Text>
              <Text style={styles.previewDescription}>{item.description}</Text>
            </View>
            <View style={styles.previewIconWrapper}>
              <Text style={styles.previewIcon}>{item.icon}</Text>
            </View>
          </View>
        ))}
      </View>

      {drawerVisible && (
        <Pressable
          onPress={() => closeDrawer()}
          style={[StyleSheet.absoluteFillObject, styles.overlayContainer]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              styles.overlay,
              { opacity: overlayOpacity },
            ]}
          />
        </Pressable>
      )}

      {drawerVisible && (
        <Animated.View
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              transform: [{ translateX: drawerTranslation }],
            },
          ]}
        >
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Sweet Balance</Text>
            <Text style={styles.drawerSubtitle}>ניווט רך וממוקד עבורך</Text>
          </View>

          <View style={styles.drawerMenu}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => handleMenuItemPress(item)}
                style={styles.drawerItem}
              >
                <Text style={styles.drawerItemIcon}>{item.icon}</Text>
                <View style={styles.drawerItemTextWrapper}>
                  <Text style={styles.drawerItemLabel}>{item.label}</Text>
                  <Text style={styles.drawerItemDescription}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  menuButtonLabel: {
    fontSize: typography.size.xl,
    color: colors.text.primary,
    marginTop: -spacing.xs / 2,
  },
  headerContent: {
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.size.xxl,
    color: colors.primary,
    fontFamily: typography.family.heading,
    textAlign: "center",
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.text.secondary,
    fontSize: typography.size.md,
    fontFamily: typography.family.regular,
    textAlign: "center",
  },
  introSection: {
    gap: spacing.md,
    writingDirection: "rtl",
  },
  introParagraph: {
    color: colors.text.primary,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.relaxed,
    textAlign: "right",
  },
  previewList: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  previewCard: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    ...shadows.sm,
    writingDirection: "rtl",
  },
  previewIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  previewIcon: {
    fontSize: typography.size.xl,
  },
  previewTextWrapper: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing.xs,
    writingDirection: "rtl",
  },
  previewTitle: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.lg,
    color: colors.text.primary,
    textAlign: "right",
  },
  previewDescription: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.comfy,
    textAlign: "right",
  },
  overlayContainer: {
    zIndex: 1,
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
    borderTopRightRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    ...shadows.lg,
    zIndex: 2,
    justifyContent: "space-between",
    writingDirection: "rtl",
  },
  drawerHeader: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  drawerTitle: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.xl,
    color: colors.primary,
    textAlign: "right",
  },
  drawerSubtitle: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    textAlign: "right",
  },
  drawerMenu: {
    flex: 1,
    marginTop: spacing.xxxl,
    gap: spacing.lg,
    writingDirection: "rtl",
  },
  drawerItem: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  drawerItemIcon: {
    fontSize: typography.size.xl,
    marginTop: 2,
  },
  drawerItemTextWrapper: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing.xs,
    writingDirection: "rtl",
  },
  drawerItemLabel: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.lg,
    color: colors.text.primary,
    textAlign: "right",
  },
  drawerItemDescription: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.comfy,
    textAlign: "right",
  },
});
