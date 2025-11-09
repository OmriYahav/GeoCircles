import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Easing, ViewStyle } from "react-native";

import { colors } from "../theme";

type AnimatedLoaderProps = {
  containerStyle?: ViewStyle;
};

export default function AnimatedLoader({ containerStyle }: AnimatedLoaderProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    loop.start();

    return () => {
      loop.stop();
      spinValue.setValue(0);
    };
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        {
          justifyContent: "center",
          alignItems: "center",
          transform: [{ rotate: spin }],
        },
        containerStyle,
      ]}
    >
      <ActivityIndicator size="small" color={colors.primary} />
    </Animated.View>
  );
}
