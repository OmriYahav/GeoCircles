import React from "react";
import { StyleSheet, Text, View } from "react-native";

import AnimatedHomeButton from "../AnimatedHomeButton";
import HeaderRightMenuButton from "../HeaderRightMenuButton";
import { colors, typography } from "../../theme";
import { useMenu } from "../../context/MenuContext";

const HEADER_HEIGHT = 60;
const HEADER_PADDING = 16;

type TopNavigationMenuProps = {
  onPressHome: () => void;
};

export default function TopNavigationMenu({ onPressHome }: TopNavigationMenuProps) {
  const { isOpen, open } = useMenu();

  return (
    <View style={styles.container}>
      <AnimatedHomeButton onPress={onPressHome} />
      <Text accessibilityRole="header" style={styles.title}>
        Sweet Balance
      </Text>
      <HeaderRightMenuButton onPress={open} expanded={isOpen} />
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
