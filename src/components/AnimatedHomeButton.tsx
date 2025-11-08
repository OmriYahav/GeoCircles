import React from "react";

import AnimatedHomeIcon from "./AnimatedHomeIcon";

type AnimatedHomeButtonProps = {
  onPress: () => void;
  size?: number;
  accessibilityLabel?: string;
  active?: boolean;
};

export default function AnimatedHomeButton({
  onPress,
  size,
  accessibilityLabel,
  active,
}: AnimatedHomeButtonProps) {
  return (
    <AnimatedHomeIcon
      onPress={onPress}
      size={size}
      accessibilityLabel={accessibilityLabel ?? "Home"}
      active={active}
    />
  );
}
