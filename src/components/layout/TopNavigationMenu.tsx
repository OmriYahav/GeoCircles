import React from "react";
import { StyleSheet, Text, View } from "react-native";

import AnimatedHomeButton from "../AnimatedHomeButton";
import AnimatedMenuIcon from "../AnimatedMenuIcon";
import { colors, typography } from "../../theme";

const HEADER_HEIGHT = 60;
const HEADER_PADDING = 16;

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
      <AnimatedHomeButton onPress={onPressHome} />
      <Text accessibilityRole="header" style={styles.title}>
        Sweet Balance
      </Text>
      <AnimatedMenuIcon
        open={isMenuOpen}
        onPress={onPressMenu}
        accessibilityState={{ expanded: isMenuOpen }}
      />
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
    color: colors.primary,
    textAlign: "center",
    flex: 1,
  },
});
