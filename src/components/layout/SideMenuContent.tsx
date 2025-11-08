import React, { useCallback } from "react";
import {
  I18nManager,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

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
};

export default function SideMenuContent({
  onClose,
  topInset,
  bottomInset,
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
          <Text style={styles.closeButtonLabel}>←</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Sweet Balance</Text>
          <Text style={styles.subtitle}>ניווט נינוח אל התוכן המתוק</Text>
        </View>
      </View>
      <View style={styles.menuItems}>
        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => handlePress(item)}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
          >
            <Text style={styles.menuItemIcon}>{item.icon}</Text>
            <Text style={styles.menuItemLabel}>{item.label}</Text>
          </Pressable>
        ))}
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
  },
  closeButtonPressed: {
    backgroundColor: "rgba(53, 94, 59, 0.18)",
  },
  closeButtonLabel: {
    fontSize: typography.size.xl,
    color: "#355E3B",
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
    gap: spacing.lg,
  },
  menuItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.xxl,
    backgroundColor: "#fffdf8",
    shadowColor: "#355E3B",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(53, 94, 59, 0.08)",
  },
  menuItemPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
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
});
