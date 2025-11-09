import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { colors } from "../theme";

export type HeaderRightMenuButtonProps = {
  onPress: () => void;
  expanded?: boolean;
  accessibilityLabel?: string;
};

const SIZE = 36;

export default function HeaderRightMenuButton({
  onPress,
  expanded = false,
  accessibilityLabel = "פתיחת תפריט",
}: HeaderRightMenuButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={() => {
        Animated.spring(scale, {
          toValue: 0.94,
          useNativeDriver: true,
          bounciness: 0,
          speed: 16,
        }).start();
      }}
      onPressOut={() => {
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 0,
          speed: 16,
        }).start();
      }}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Animated.View
        style={[
          styles.container,
          expanded && styles.containerActive,
          { transform: [{ scale }] },
        ]}
      >
        <View style={styles.menuLines}>
          <View style={styles.line} />
          <View style={styles.line} />
          <View style={styles.line} />
        </View>
        <Feather name="leaf" size={12} color={colors.buttonBg} style={styles.leaf} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  containerActive: {
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.9,
  },
  menuLines: {
    width: 18,
    gap: 3,
    alignItems: "center",
  },
  line: {
    width: "100%",
    height: 2,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  leaf: {
    position: "absolute",
    top: 6,
    right: 6,
    transform: [{ rotate: "-16deg" }],
  },
});
