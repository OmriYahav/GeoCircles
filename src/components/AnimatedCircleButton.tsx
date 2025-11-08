import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  type AccessibilityState,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "../theme";

type AnimatedCircleButtonProps = {
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityState?: AccessibilityState;
  size?: number;
  active?: boolean;
};

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

export default function AnimatedCircleButton({
  iconName,
  onPress,
  accessibilityLabel,
  accessibilityState,
  size = 26,
  active = false,
}: AnimatedCircleButtonProps) {
  const swayAnim = useRef(new Animated.Value(0)).current;
  const activeProgress = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(activeProgress, {
      toValue: active ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
    }).start();
  }, [active, activeProgress]);

  const rotate = swayAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-8deg", "0deg", "8deg"],
  });

  const scale = activeProgress.interpolate({
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
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      onPress={handlePress}
      style={[styles.touchable, { width: size + spacing(1), height: size + spacing(1) }]}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
        <AnimatedIcon
          name={iconName}
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
    zIndex: 30,
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
