import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../theme";

type CardProps = {
  title: string;
  subtitle?: string;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
};

export default function Card({ title, subtitle, rightIcon, onPress }: CardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      onPressIn={() => {
        Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
      }}
      onPressOut={() => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
      }}
      style={{ marginBottom: spacing(2) }}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightIcon}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing(2),
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.subtitle,
    fontWeight: "700",
  },
  subtitle: {
    color: "#5b6d61",
    fontSize: typography.small,
    lineHeight: typography.small * 1.5,
  },
});
