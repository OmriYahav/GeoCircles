import React, { useCallback } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import AnimatedHomeButton from "../components/AnimatedHomeButton";
import HeaderRightMenuButton from "../components/HeaderRightMenuButton";
import SideMenuNew from "../components/SideMenuNew";
import { useMenu } from "../context/MenuContext";
import { colors, spacing, typography } from "../theme";
import { menuRouteMap } from "../constants/menuRoutes";

export default function PersonalBalanceScreen() {
  const router = useRouter();
  const { isOpen, open, close } = useMenu();

  const handleMenuPress = useCallback(() => {
    open();
  }, [open]);

  const handleHomePress = useCallback(() => {
    close();
    router.navigate("/");
  }, [close, router]);

  return (
    <LinearGradient colors={[colors.bgFrom, colors.bgTo]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <AnimatedHomeButton onPress={handleHomePress} />
          <Text style={styles.brand}>Sweet Balance</Text>
          <HeaderRightMenuButton onPress={handleMenuPress} expanded={isOpen} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Personal Balance</Text>
        </View>
      </SafeAreaView>

      <SideMenuNew
        visible={isOpen}
        onClose={close}
        navigate={(route, params) => {
          const target = menuRouteMap[route] ?? route;
          close();
          router.navigate({ pathname: target, params: params ?? {} });
        }}
      />
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
