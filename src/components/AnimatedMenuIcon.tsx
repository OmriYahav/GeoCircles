import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

import { colors } from "../theme";

type AnimatedMenuIconProps = {
  open: boolean;
  onPress: () => void;
  size?: number;
};

export default function AnimatedMenuIcon({
  open,
  onPress,
  size = 28,
}: AnimatedMenuIconProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: open ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
    }).start();
  }, [open, progress]);

  const rotateTop = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });
  const rotateBottom = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-45deg"],
  });
  const translate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });
  const middleOpacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.touchable, { width: size + 16, height: size + 16 }]}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <View style={styles.circle}>
        <Animated.View
          style={[
            styles.line,
            { transform: [{ translateY: -8 }, { rotate: rotateTop }] },
          ]}
        />
        <Animated.View style={[styles.line, { opacity: middleOpacity }]} />
        <Animated.View
          style={[
            styles.line,
            {
              transform: [
                { translateY: 8 },
                { translateX: translate },
                { rotate: rotateBottom },
              ],
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 10,
  },
  circle: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  line: {
    width: 26,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginVertical: 2,
  },
});
