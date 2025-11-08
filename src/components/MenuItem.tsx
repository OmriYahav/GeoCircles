import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";

import { colors, radius, spacing, font } from "../theme/tokens";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  testID?: string;
};

export default function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  testID,
}: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <Pressable
        testID={testID}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 120 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 120 });
        }}
        onPress={onPress}
        style={styles.btn}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color={colors.accent} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        </View>
        <Ionicons name="chevron-back" size={18} color={colors.accent} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginVertical: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  btn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.bg1,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(46,107,59,0.08)",
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginLeft: spacing.md,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: "600",
    textAlign: "right",
  },
  sub: {
    color: "rgba(34,68,41,0.6)",
    fontSize: font.small,
    marginTop: 2,
    textAlign: "right",
  },
});
