import React from "react";
import { I18nManager, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export type HeaderRightMenuButtonProps = {
  onPress: () => void;
  expanded?: boolean;
  accessibilityLabel?: string;
};

export default function HeaderRightMenuButton({
  onPress,
  expanded = false,
  accessibilityLabel = "פתיחת תפריט",
}: HeaderRightMenuButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
    >
      <LinearGradient
        colors={["rgba(47, 107, 58, 0.95)", "rgba(47, 107, 58, 0.75)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconBadge}>
          <Ionicons
            name="leaf"
            size={18}
            color="rgba(255,255,255,0.9)"
            style={styles.leafIcon}
          />
        </View>
        <View style={styles.lines}>
          <View style={[styles.line, styles.lineWide]} />
          <View style={[styles.line, styles.lineMedium]} />
          <View style={[styles.line, styles.lineWide]} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const SIZE = 46;
const BADGE_SIZE = 26;

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: "hidden",
    shadowColor: "rgba(34, 68, 41, 0.25)",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    shadowOpacity: 0.18,
  },
  gradient: {
    flex: 1,
    borderRadius: SIZE / 2,
    paddingHorizontal: 12,
    flexDirection: I18nManager.isRTL ? "row" : "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBadge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  leafIcon: {
    transform: [{ rotate: "-12deg" }],
  },
  lines: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  line: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  lineWide: {
    width: 18,
  },
  lineMedium: {
    width: 14,
  },
});
