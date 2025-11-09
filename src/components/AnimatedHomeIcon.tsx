import React, { useMemo, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { colors } from "../theme";

type AnimatedHomeIconProps = {
  onPress: () => void;
  size?: number;
  accessibilityLabel?: string;
  active?: boolean;
};

const DEFAULT_SIZE = 36;

export default function AnimatedHomeIcon({
  onPress,
  size = DEFAULT_SIZE,
  accessibilityLabel = "Home",
}: AnimatedHomeIconProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
      },
    ],
    [size],
  );

  const iconSize = Math.round(size * 0.55);

  return (
    <Pressable
      accessibilityRole="button"
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
      <Animated.View style={[containerStyle, { transform: [{ scale }] }]}> 
        <Feather name="home" size={iconSize} color="#FFFFFF" />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pressed: {
    opacity: 0.9,
  },
});
