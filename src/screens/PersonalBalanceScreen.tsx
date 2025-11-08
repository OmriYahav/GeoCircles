import React, { useCallback } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRouter } from "expo-router";

import AnimatedHomeButton from "../components/AnimatedHomeButton";
import AnimatedMenuIcon from "../components/AnimatedMenuIcon";
import { useMenu } from "../context/MenuContext";
import { colors, spacing, typography } from "../theme";

export default function PersonalBalanceScreen() {
  const navigation = useNavigation<any>();
  const router = useRouter();
  const { menuOpen, toggleMenu, closeMenu } = useMenu();

  const handleMenuPress = useCallback(() => {
    if (typeof navigation?.toggleDrawer === "function") {
      navigation.toggleDrawer();
      return;
    }

    toggleMenu();
  }, [navigation, toggleMenu]);

  const handleHomePress = useCallback(() => {
    closeMenu();
    router.navigate("/");
  }, [closeMenu, router]);

  return (
    <LinearGradient colors={[colors.bgFrom, colors.bgTo]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <AnimatedHomeButton onPress={handleHomePress} />
          <Text style={styles.brand}>Sweet Balance</Text>
          <AnimatedMenuIcon open={menuOpen} onPress={handleMenuPress} />
        </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    zIndex: 20,
  },
  brand: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
    flex: 1,
    textAlign: "center",
  },
  title: {
    color: colors.primary,
    fontSize: typography.size.xl,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
    textAlign: "center",
  },
});
