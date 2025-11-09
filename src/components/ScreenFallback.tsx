import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, typography } from "../theme";

export default function ScreenFallback() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.label}>טוען עבורך את החוויה המתוקה...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: 12,
  },
  label: {
    color: colors.text,
    fontSize: typography.body,
    fontFamily: typography.fontFamily,
  },
});
