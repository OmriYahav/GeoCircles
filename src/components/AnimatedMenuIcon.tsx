import React from "react";
import { type AccessibilityState } from "react-native";

import AnimatedCircleButton from "./AnimatedCircleButton";

type AnimatedMenuIconProps = {
  open: boolean;
  onPress: () => void;
  size?: number;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
};

export default function AnimatedMenuIcon({
  open,
  onPress,
  size,
  accessibilityLabel,
  accessibilityState,
}: AnimatedMenuIconProps) {
  return (
    <AnimatedCircleButton
      iconName="leaf"
      onPress={onPress}
      accessibilityLabel={
        accessibilityLabel ?? (open ? "סגירת תפריט" : "פתיחת תפריט")
      }
      accessibilityState={accessibilityState}
      size={size}
      active={open}
    />
  );
}
