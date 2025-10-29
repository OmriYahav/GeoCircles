import React from "react";
import { Keyboard, StyleProp, ViewStyle } from "react-native";
import { Button } from "react-native-paper";
import { navigationRef } from "../navigation/navigationRef";

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
  const handlePress = () => {
    Keyboard.dismiss();
    if (navigationRef.isReady()) {
      navigationRef.navigate("Search" as never, { screen: "Map" } as never);
    }
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
