import React from "react";
import { Keyboard, StyleProp, ViewStyle } from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";

export type BackToMapButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "icon" | "onPress"
> & {
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

const BackToMapButton: React.FC<BackToMapButtonProps> = ({
  style,
  mode = "contained",
  onPress,
  compact = true,
  ...rest
}) => {
  const router = useRouter();
  const handlePress = () => {
    Keyboard.dismiss();
    router.navigate({ pathname: "/(tabs)/search" });
    onPress?.();
  };

  return (
    <Button
      mode={mode}
      icon="arrow-left"
      compact={compact}
      style={style}
      onPress={handlePress}
      accessibilityLabel="Back to map"
      {...rest}
    >
      {null}
    </Button>
  );
};

export default BackToMapButton;
