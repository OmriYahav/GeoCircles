import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors, radius, spacing } from "../theme";

type AnimatedHomeIconProps = {
  onPress: () => void;
  size?: number;
  accessibilityLabel?: string;
  active?: boolean;
};

const HOUSE_OUTLINE = "#3F704D";
const LEAF_GRADIENT: [string, string] = ["#6DAA7F", "#3F704D"];
const DOOR_COLOR = "#A9D8B2";
const BREATH_DURATION = 3600;
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function AnimatedHomeIcon({
  onPress,
  size = 34,
  accessibilityLabel = "Home",
  active = false,
}: AnimatedHomeIconProps) {
  const containerPadding = spacing(0.75);
  const containerSize = size + containerPadding * 2;
  const houseWidth = size * 0.82;
  const houseHeight = size * 0.68;
  const roofLeafWidth = size * 0.86;
  const roofLeafHeight = size * 0.38;
  const roofLeafRadius = roofLeafHeight * 0.92;
  const doorWidth = houseWidth * 0.28;
  const doorHeight = houseHeight * 0.52;

  const breath = useRef(new Animated.Value(0)).current;
  const leafOpen = useRef(new Animated.Value(0)).current;
  const focusGlow = useRef(new Animated.Value(0)).current;
  const pressProgress = useRef(new Animated.Value(0)).current;
  const activeProgress = useRef(new Animated.Value(active ? 1 : 0)).current;

  const [isFocusOrHover, setIsFocusOrHover] = useState(false);

  useEffect(() => {
    Animated.timing(activeProgress, {
      toValue: active ? 1 : 0,
      duration: 260,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [active, activeProgress]);

  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;
    if (active) {
      animation = Animated.loop(
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
    } else {
      breath.stopAnimation();
      breath.setValue(0);
    }

    return () => {
      animation?.stop();
    };
  }, [active, breath]);

  useEffect(() => {
    Animated.timing(focusGlow, {
      toValue: isFocusOrHover ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [focusGlow, isFocusOrHover]);

  const handlePressIn = useCallback(() => {
    Animated.spring(pressProgress, {
      toValue: 1,
      bounciness: 0,
      speed: 16,
      useNativeDriver: true,
    }).start();
  }, [pressProgress]);

  const handlePressOut = useCallback(() => {
    Animated.spring(pressProgress, {
      toValue: 0,
      bounciness: 0,
      speed: 16,
      useNativeDriver: true,
    }).start();
  }, [pressProgress]);

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(leafOpen, {
        toValue: 1,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(leafOpen, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onPress();
      }
    });
  }, [leafOpen, onPress]);

  const handleFocus = useCallback(() => setIsFocusOrHover(true), []);
  const handleBlur = useCallback(() => setIsFocusOrHover(false), []);
  const handleHoverIn = useCallback(() => setIsFocusOrHover(true), []);
  const handleHoverOut = useCallback(() => setIsFocusOrHover(false), []);

  const breathScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1.03],
  });

  const pressScale = pressProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
  });

  const breathDelta = Animated.subtract(breathScale, 1);
  const activeBreath = Animated.add(
    1,
    Animated.multiply(activeProgress, breathDelta)
  );
  const totalScale = Animated.multiply(activeBreath, pressScale);

  const roofTilt = useMemo(() => {
    const baseTilt = 26;
    const openExtra = 16;
    return {
      left: leafOpen.interpolate({
        inputRange: [0, 1],
        outputRange: [-(baseTilt), -(baseTilt + openExtra)],
      }),
      right: leafOpen.interpolate({
        inputRange: [0, 1],
        outputRange: [baseTilt, baseTilt + openExtra],
      }),
    };
  }, [leafOpen]);

  const roofLift = leafOpen.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -size * 0.06],
  });

  const glowOpacity = focusGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.9],
  });

  const activeShadowStyle = useMemo(() => {
    const baseShadow = {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 12,
      shadowOpacity: 0.22,
      elevation: 4,
    } as const;

    if (!active) {
      return baseShadow;
    }

    return {
      ...baseShadow,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 18,
      shadowOpacity: 0.26,
      elevation: 6,
    } as const;
  }, [active]);

  const focusGlowStyle = useMemo(() => {
    const glowRadius = containerSize * 0.52;
    const glowStyle = {
      borderRadius: glowRadius,
      width: containerSize,
      height: containerSize,
      backgroundColor: "rgba(117, 187, 140, 0.28)",
      transform: [{ scale: 1.12 }],
    } as const;

    if (Platform.OS === "web") {
      return {
        ...glowStyle,
        boxShadow: "0 0 18px rgba(111, 171, 130, 0.45)",
      } as const;
    }

    return glowStyle;
  }, [containerSize]);

  return (
    <View style={styles.wrapper}>
      <Animated.View
        pointerEvents="none"
        style={[styles.glow, focusGlowStyle, { opacity: glowOpacity }]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        aria-label={accessibilityLabel}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={({ pressed }) => [
          styles.pressable,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: radius.lg,
          },
          pressed && Platform.OS === "web" ? { cursor: "pointer" } : null,
        ]}
      >
        <Animated.View
          style={[
            styles.inner,
            activeShadowStyle,
            {
              padding: containerPadding,
              borderRadius: radius.lg,
              transform: [{ scale: totalScale }],
            },
          ]}
        >
          <View
            style={{
              width: houseWidth,
              height: houseHeight,
              borderRadius: houseHeight * 0.42,
              borderWidth: Math.max(1.5, size * 0.04),
              borderColor: HOUSE_OUTLINE,
              backgroundColor: "#E9F4EB",
              overflow: "hidden",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <LinearGradient
              colors={["#F2FBF4", "#D8EEDD"]}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 1 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <Animated.View
              style={{
                ...StyleSheet.absoluteFillObject,
                opacity: activeProgress,
              }}
            >
              <AnimatedLinearGradient
                colors={["#C7F0D1", "#6DAA7F"]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
            </Animated.View>
            <View
              style={{
                width: doorWidth,
                height: doorHeight,
                backgroundColor: DOOR_COLOR,
                borderTopLeftRadius: doorHeight,
                borderTopRightRadius: doorHeight,
                borderBottomLeftRadius: doorWidth,
                borderBottomRightRadius: doorWidth,
                marginBottom: houseHeight * 0.12,
                transform: [{ scaleY: -1 }],
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.35)", "rgba(169,216,178,0.8)"]}
                start={{ x: 0.3, y: 0 }}
                end={{ x: 0.7, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          </View>

          <Animated.View
            style={{
              position: "absolute",
              top: containerPadding - roofLeafHeight * 0.6,
              left: containerSize / 2 - roofLeafWidth / 2,
              width: roofLeafWidth,
              height: roofLeafHeight,
              flexDirection: "row",
              justifyContent: "space-between",
              transform: [{ translateY: roofLift }],
            }}
          >
            {["left", "right"].map((side) => {
              const isLeft = side === "left";
              return (
                <AnimatedLinearGradient
                  key={side}
                  colors={LEAF_GRADIENT}
                  start={{ x: isLeft ? 0.1 : 0.4, y: 0.2 }}
                  end={{ x: isLeft ? 0.9 : 0.6, y: 1 }}
                  style={{
                    width: roofLeafWidth * 0.5,
                    height: roofLeafHeight,
                    borderRadius: roofLeafRadius,
                    marginHorizontal: roofLeafWidth * 0.01,
                    transform: [
                      {
                        rotate:
                          side === "left"
                            ? roofTilt.left
                            : roofTilt.right,
                      },
                    ],
                    shadowColor: HOUSE_OUTLINE,
                    shadowOpacity: 0.14,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                  }}
                />
              );
            })}
          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 30,
  },
  glow: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  pressable: {
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    backgroundColor: colors.buttonBg,
  },
});
