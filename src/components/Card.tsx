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
          <Feather name={icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Feather name="chevron-left" size={24} color={colors.primary} />
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
    gap: 12,
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  textWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  title: {
    color: colors.primary,
    fontSize: typography.size.lg,
    fontFamily: "Heebo_700Bold",
    textAlign: "right",
  },
  subtitle: {
    color: colors.subtitle,
    fontSize: typography.small,
    lineHeight: typography.small * 1.6,
    fontFamily: "Heebo_400Regular",
    textAlign: "right",
  },
  iconContainer: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    padding: 10,
    marginLeft: 8,
  },
});
