import React, { useCallback, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigationDrawer } from "../../contexts/NavigationDrawerContext";
import { colors, spacing, typography } from "../../theme";

const HEADER_HEIGHT = 60;
const HEADER_PADDING = 16;
const ICON_COLOR = "#3B6545";

function NavigationIconButton({
  icon,
  accessibilityLabel,
  onPress,
}: {
  icon: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = useCallback(
    (value: number) => {
      Animated.spring(scale, {
        toValue: value,
        useNativeDriver: true,
        speed: 18,
        bounciness: 8,
      }).start();
    },
    [scale]
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => animateTo(0.94)}
      onPressOut={() => animateTo(1)}
      onPress={onPress}
      hitSlop={{ top: spacing.sm, bottom: spacing.sm, left: spacing.sm, right: spacing.sm }}
      style={styles.iconPressable}
    >
      <Animated.View style={[styles.iconButton, { transform: [{ scale }] }]}>
        <Text style={styles.iconLabel}>{icon}</Text>
      </Animated.View>
    </Pressable>
  );
}

type TopNavigationMenuProps = {
  variant?: "default" | "modal";
  content?: React.ReactNode;
  flat?: boolean;
};

export default function TopNavigationMenu(_props: TopNavigationMenuProps) {
  const { closeDrawer, toggleDrawer } = useNavigationDrawer();

  const handleHomePress = useCallback(() => {
    closeDrawer("/");
  }, [closeDrawer]);

  const handleMenuPress = useCallback(() => {
    toggleDrawer();
  }, [toggleDrawer]);

  return (
    <View style={styles.container}>
      <NavigationIconButton
        accessibilityLabel="חזרה למסך הבית"
        icon="🏠"
        onPress={handleHomePress}
      />
      <Text accessibilityRole="header" style={styles.title}>
        Sweet Balance
      </Text>
      <NavigationIconButton
        accessibilityLabel="פתיחת תפריט"
        icon="☰"
        onPress={handleMenuPress}
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
    backgroundColor: "rgba(59, 101, 69, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLabel: {
    fontSize: typography.size.lg,
    color: ICON_COLOR,
  },
});
