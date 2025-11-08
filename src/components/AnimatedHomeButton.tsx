import React from "react";

import AnimatedCircleButton from "./AnimatedCircleButton";

type AnimatedHomeButtonProps = {
  onPress: () => void;
  size?: number;
  accessibilityLabel?: string;
};

export default function AnimatedHomeButton({
  onPress,
  size,
  accessibilityLabel,
}: AnimatedHomeButtonProps) {
  return (
    <AnimatedCircleButton
      iconName="home"
      onPress={onPress}
      size={size}
      accessibilityLabel={accessibilityLabel ?? "חזרה למסך הבית"}
    />
  );
}
