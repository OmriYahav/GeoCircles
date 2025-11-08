import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { radii, spacing, typography } from "../../theme";

const MENU_ITEMS = [
  { icon: "🧁", label: "מתכונים בריאים" },
  { icon: "🥄", label: "סדנאות" },
  { icon: "🌿", label: "טיפולים" },
  { icon: "🍃", label: "עצות תזונה" },
  { icon: "📝", label: "בלוג" },
] as const;

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
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="סגירת תפריט"
          onPress={onClose}
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonLabel}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Sweet Balance</Text>
          <Text style={styles.subtitle}>ניווט נינוח אל התוכן המתוק</Text>
        </View>
      </View>
      <View style={styles.menuItems}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={onClose}
            style={styles.menuItem}
          >
            <Text style={styles.menuItemIcon}>{item.icon}</Text>
            <Text style={styles.menuItemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6EC",
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
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
  },
  menuItemIcon: {
    fontSize: typography.size.xl,
    color: "#355E3B",
  },
  menuItemLabel: {
    flex: 1,
    textAlign: "right",
    fontFamily: typography.family.medium,
    fontSize: typography.size.lg,
    color: "#355E3B",
  },
});
