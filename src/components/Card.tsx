import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { colors, spacing, typography } from "../theme";

type CardProps = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Feather.glyphMap;
  onPress?: () => void;
};

export default function Card({ title, subtitle, icon = "leaf", onPress }: CardProps) {
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
        <View style={styles.iconContainer}>
          <Feather name={icon} size={22} color="#3B7A57" />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Feather name="chevron-left" size={22} color="#3B7A57" />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing(2),
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  textWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  title: {
    color: "#3B7A57",
    fontSize: typography.size.lg,
    fontFamily: "Heebo_700Bold",
    textAlign: "right",
  },
  subtitle: {
    color: "#6B6B6B",
    fontSize: typography.small,
    lineHeight: typography.small * 1.6,
    fontFamily: "Heebo_400Regular",
    textAlign: "right",
  },
  iconContainer: {
    backgroundColor: "#E8F3EA",
    borderRadius: 50,
    padding: 10,
    marginLeft: 10,
  },
});
