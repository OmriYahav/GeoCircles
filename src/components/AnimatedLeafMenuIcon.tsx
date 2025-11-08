import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  type AccessibilityState,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors, radius, spacing } from "../theme";

type AnimatedLeafMenuIconProps = {
  open: boolean;
  onPress: () => void;
  size?: number;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
};

const LEAF_COLORS: [string, string] = ["#6DAA7F", "#3F704D"];
const BREATH_DURATION = 3200;
const TOGGLE_DURATION = 260;

export default function AnimatedLeafMenuIcon({
  open,
  onPress,
  size = 26,
  accessibilityLabel,
  accessibilityState,
}: AnimatedLeafMenuIconProps) {
  const openProgress = useRef(new Animated.Value(open ? 1 : 0)).current;
  const breath = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(openProgress, {
      toValue: open ? 1 : 0,
      duration: TOGGLE_DURATION,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [open, openProgress]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: BREATH_DURATION / 2,
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: BREATH_DURATION / 2,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [breath]);

  const containerScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.04],
  });

  const leaves = useMemo(() => {
    const baseOffset = size * 0.32;
    const leafHeight = size * 0.35;
    const leafWidth = size * 1.15;
    const containerSize = size * 1.4;

    return [
      {
        key: "top",
        baseRotate: "-10deg",
        openRotate: "45deg",
        baseTranslateY: -baseOffset,
        openTranslateY: 0,
        baseTranslateX: -size * 0.08,
        openTranslateX: 0,
      },
      {
        key: "middle",
        baseRotate: "0deg",
        openRotate: "0deg",
        baseTranslateY: 0,
        openTranslateY: 0,
        baseTranslateX: 0,
        openTranslateX: 0,
      },
      {
        key: "bottom",
        baseRotate: "10deg",
        openRotate: "-45deg",
        baseTranslateY: baseOffset,
        openTranslateY: 0,
        baseTranslateX: size * 0.08,
        openTranslateX: 0,
      },
    ].map((leaf) => {
      const rotate = openProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [leaf.baseRotate, leaf.openRotate],
      });
      const translateY = openProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [leaf.baseTranslateY, leaf.openTranslateY],
      });
      const translateX = openProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [leaf.baseTranslateX, leaf.openTranslateX],
      });
      const opacity =
        leaf.key === "middle"
          ? openProgress.interpolate({
              inputRange: [0, 0.6, 1],
              outputRange: [1, 0.2, 0],
            })
          : undefined;
      const scale =
        leaf.key === "middle"
          ? openProgress.interpolate({
              inputRange: [0, 0.6, 1],
              outputRange: [1, 0.8, 0.4],
            })
          : openProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.02],
            });

      return {
        key: leaf.key,
        style: {
          transform: [
            { translateY },
            { translateX },
            { rotate },
            { scale },
          ],
          opacity,
          width: leafWidth,
          height: leafHeight,
          borderRadius: leafHeight,
          shadowColor: colors.shadow,
          shadowOpacity: 0.18,
          shadowRadius: leafHeight * 0.7,
          shadowOffset: { width: 0, height: leafHeight * 0.18 },
          elevation: 3,
          position: "absolute" as const,
          top: containerSize / 2 - leafHeight / 2,
          left: containerSize / 2 - leafWidth / 2,
        },
      };
    });
  }, [openProgress, size]);

  const label = accessibilityLabel ?? (open ? "Close menu" : "Open menu");
  const mergedAccessibilityState = useMemo(() => {
    if (!accessibilityState) {
      return { expanded: open };
    }
    return { ...accessibilityState, expanded: open };
  }, [accessibilityState, open]);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={mergedAccessibilityState}
      onPress={onPress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={styles.touchable}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            width: size + spacing(1.5),
            height: size + spacing(1.5),
            borderRadius: radius.lg,
            transform: [{ scale: containerScale }],
          },
        ]}
      >
        <View
          style={[styles.leafContainer, { width: size * 1.4, height: size * 1.4 }]}
        >
          {leaves.map((leaf) => (
            <Animated.View key={leaf.key} style={leaf.style}>
              <LinearGradient
                colors={LEAF_COLORS}
                start={{ x: 0.1, y: 0.2 }}
                end={{ x: 1, y: 0.9 }}
                style={styles.leaf}
              />
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    </Pressable>
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
    padding: spacing(0.75),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  leaf: {
    flex: 1,
    borderRadius: 999,
    overflow: "hidden",
  },
  leafContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

