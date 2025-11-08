import React, { useCallback, useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "../theme";

type AnimatedMenuIconProps = {
  open: boolean;
  onPress: () => void;
  size?: number;
};

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

export default function AnimatedMenuIcon({
  open,
  onPress,
  size = 26,
}: AnimatedMenuIconProps) {
  const swayAnim = useRef(new Animated.Value(0)).current;
  const openProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(openProgress, {
      toValue: open ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
    }).start();
  }, [open, openProgress]);

  const rotate = swayAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-8deg", "0deg", "8deg"],
  });

  const scale = openProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(swayAnim, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(swayAnim, {
        toValue: -1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(swayAnim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onPress();
      }
    });
  }, [onPress, swayAnim]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={handlePress}
      style={[styles.touchable, { width: size + spacing(1), height: size + spacing(1) }]}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
        <AnimatedIcon
          name="leaf"
          size={size}
          color={colors.primary}
          style={{ transform: [{ rotate }] }}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  circle: {
    backgroundColor: colors.buttonBg,
    borderRadius: radius.lg,
    padding: spacing(0.75),
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
});
