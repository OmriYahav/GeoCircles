import React, { useCallback } from "react";
import {
  Animated,
  I18nManager,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { radii, spacing, typography } from "../../theme";

type MenuItem = {
  icon: string;
  label: string;
  route: string;
};

const MENU_ITEMS: MenuItem[] = [
  { icon: "🧁", label: "מתכונים בריאים", route: "/(drawer)/recipes" },
  { icon: "🥄", label: "סדנאות", route: "/(drawer)/workshops" },
  { icon: "🌿", label: "טיפולים", route: "/(drawer)/treatments" },
  { icon: "🍃", label: "עצות תזונה", route: "/(drawer)/nutrition-tips" },
  { icon: "📝", label: "בלוג", route: "/(drawer)/blog" },
];

export type SideMenuContentProps = {
  onClose: () => void;
  topInset: number;
  bottomInset: number;
  animationValue: Animated.Value;
};

export default function SideMenuContent({
  onClose,
  topInset,
  bottomInset,
  animationValue,
}: SideMenuContentProps) {
  const router = useRouter();

  const handlePress = useCallback(
    (item: MenuItem) => {
      router.navigate(item.route);
      onClose();
    },
    [onClose, router],
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: topInset + spacing.xxxl,
          paddingBottom: bottomInset + spacing.xxxl,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="סגירת תפריט"
          onPress={onClose}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.closeButtonPressed,
          ]}
        >
          <Ionicons name="close" size={24} color="#355E3B" />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Sweet Balance</Text>
          <Animated.View
            style={[
              styles.titleUnderline,
              {
                opacity: animationValue,
                transform: [
                  {
                    scaleX: animationValue.interpolate({
                      inputRange: [0, 0.4, 1],
                      outputRange: [0.4, 0.85, 1],
                    }),
                  },
                  {
                    translateX: animationValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          />
          <Text style={styles.subtitle}>ניווט נינוח אל התוכן המתוק</Text>
        </View>
      </View>
      <View style={styles.menuItems}>
        {MENU_ITEMS.map((item, index) => {
          const isLastItem = index === MENU_ITEMS.length - 1;

          return (
            <View key={item.label} style={styles.menuItemWrapper}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => handlePress(item)}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
              >
                {({ pressed }) => (
                  <LinearGradient
                    colors={
                      pressed
                        ? ["#F7F3E9", "#FFFDF6"]
                        : ["#FFFDF6", "#F7F3E9"]
                    }
                    start={{ x: I18nManager.isRTL ? 1 : 0, y: 0 }}
                    end={{ x: I18nManager.isRTL ? 0 : 1, y: 1 }}
                    style={styles.menuItemGradient}
                  >
                    <Text style={styles.menuItemIcon}>{item.icon}</Text>
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                  </LinearGradient>
                )}
              </Pressable>
              {!isLastItem ? <View style={styles.menuDivider} /> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f4ec",
    borderTopLeftRadius: radii.xl,
    borderBottomLeftRadius: radii.xl,
    paddingHorizontal: spacing.xxl,
    justifyContent: "space-between",
    writingDirection: "rtl",
  },
  header: {
    gap: spacing.md,
    alignItems: "flex-end",
  },
  closeButton: {
    alignSelf: "flex-start",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(53, 94, 59, 0.12)",
    shadowColor: "#355E3B",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  closeButtonPressed: {
    backgroundColor: "rgba(53, 94, 59, 0.18)",
    transform: [{ scale: 0.94 }],
  },
  headerText: {
    gap: spacing.xs,
    alignItems: "flex-end",
  },
  title: {
    fontFamily: typography.family.heading,
    fontSize: typography.size.xl,
    color: "#355E3B",
    textAlign: "right",
  },
  titleUnderline: {
    alignSelf: "flex-end",
    height: 3,
    borderRadius: 3,
    backgroundColor: "rgba(53, 94, 59, 0.4)",
    width: "40%",
  },
  subtitle: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    color: "#355E3B",
    opacity: 0.75,
    textAlign: "right",
  },
  menuItems: {
    flex: 1,
    marginTop: spacing.xxxl,
  },
  menuItemWrapper: {
    marginBottom: spacing.lg,
  },
  menuItem: {
    borderRadius: radii.xxl,
    shadowColor: "#2e4c36",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 5,
    overflow: "hidden",
  },
  menuItemPressed: {
    transform: [{ scale: 0.98 }],
  },
  menuItemGradient: {
    borderRadius: radii.xxl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(53, 94, 59, 0.08)",
  },
  menuItemIcon: {
    fontSize: typography.size.xl,
    color: "#355E3B",
  },
  menuItemLabel: {
    flex: 1,
    textAlign: I18nManager.isRTL ? "right" : "left",
    fontFamily: typography.family.medium,
    fontSize: typography.size.lg,
    color: "#355E3B",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(53, 94, 59, 0.12)",
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
});
