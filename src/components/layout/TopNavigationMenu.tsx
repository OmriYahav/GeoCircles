import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, typography } from "../../theme";

const HEADER_HEIGHT = 60;
const HEADER_PADDING = 16;
const ICON_COLOR = "#355E3B";

type TopNavigationMenuProps = {
  isMenuOpen: boolean;
  onPressHome: () => void;
  onPressMenu: () => void;
};

export default function TopNavigationMenu({
  isMenuOpen,
  onPressHome,
  onPressMenu,
}: TopNavigationMenuProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityLabel="חזרה למסך הבית"
        accessibilityRole="button"
        onPress={onPressHome}
        style={styles.iconPressable}
      >
        <View style={styles.iconButton}>
          <Ionicons name="home" size={24} color={ICON_COLOR} />
        </View>
      </TouchableOpacity>
      <Text accessibilityRole="header" style={styles.title}>
        Sweet Balance
      </Text>
      <TouchableOpacity
        accessibilityLabel={isMenuOpen ? "סגירת תפריט" : "פתיחת תפריט"}
        accessibilityRole="button"
        accessibilityState={{ expanded: isMenuOpen }}
        onPress={onPressMenu}
        style={styles.iconPressable}
      >
        <View style={styles.iconButton}>
          <Ionicons name="menu" size={28} color={ICON_COLOR} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    paddingHorizontal: HEADER_PADDING,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    shadowColor: "rgba(59, 101, 69, 0.14)",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    writingDirection: "ltr",
    zIndex: 30,
  },
  title: {
    fontFamily: typography.family.heading,
    fontSize: typography.size.xl,
    color: ICON_COLOR,
    textAlign: "center",
  },
  iconPressable: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButton: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    backgroundColor: "rgba(53, 94, 59, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
});
