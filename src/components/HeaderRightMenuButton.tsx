import React, { useEffect, useRef } from "react";
import { Animated, I18nManager, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

export type HeaderRightMenuButtonProps = {
  onPress: () => void;
  expanded?: boolean;
  accessibilityLabel?: string;
};

export default function HeaderRightMenuButton({
  onPress,
  expanded = false,
  accessibilityLabel = "פתיחת תפריט",
}: HeaderRightMenuButtonProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
    >
      <Animated.View style={[styles.animatedContainer, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={["rgba(59, 122, 87, 0.95)", "rgba(59, 122, 87, 0.75)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.iconBadge}>
            <Feather
              name="leaf"
              size={18}
              color="rgba(255,255,255,0.9)"
              style={styles.leafIcon}
            />
          </View>
          <View style={styles.lines}>
            <View style={[styles.line, styles.lineWide]} />
            <View style={[styles.line, styles.lineMedium]} />
            <View style={[styles.line, styles.lineWide]} />
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const SIZE = 46;
const BADGE_SIZE = 26;

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: "hidden",
    shadowColor: "rgba(34, 68, 41, 0.25)",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    shadowOpacity: 0.18,
  },
  animatedContainer: {
    flex: 1,
    borderRadius: SIZE / 2,
  },
  gradient: {
    flex: 1,
    borderRadius: SIZE / 2,
    paddingHorizontal: 12,
    flexDirection: I18nManager.isRTL ? "row" : "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBadge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  leafIcon: {
    transform: [{ rotate: "-12deg" }],
  },
  lines: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  line: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  lineWide: {
    width: 18,
  },
  lineMedium: {
    width: 14,
  },
});
