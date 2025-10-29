import React from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Palette } from "../../constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type FloatingActionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

export default function FloatingActionButton({
  icon,
  onPress,
  accessibilityLabel,
  style,
}: FloatingActionButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.92, { duration: 120 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 160 });
  };

  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, style, animatedStyle]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={Palette.primary} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Palette.surface,
    shadowColor: "rgba(15, 23, 42, 0.15)",
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 9,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.primaryTint,
  },
});
