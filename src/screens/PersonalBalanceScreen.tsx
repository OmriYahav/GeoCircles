import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors, spacing, typography } from "../theme";

export default function PersonalBalanceScreen() {
  return (
    <LinearGradient colors={[colors.bgFrom, colors.bgTo]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Personal Balance</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing(2),
  },
  title: {
    color: colors.primary,
    fontSize: typography.size.xl,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
    textAlign: "center",
  },
});
