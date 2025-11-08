import React, { useCallback } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import TopNavigationMenu from "./TopNavigationMenu";
import { colors, spacing } from "../../theme";
import SideMenuNew from "../SideMenuNew";
import { useMenu, type MenuRouteName } from "../../context/MenuContext";
import { menuRouteMap, menuRouteParams } from "../../constants/menuRoutes";

type ScreenScaffoldProps = {
  children: React.ReactNode;
  variant?: "default" | "modal";
  contentStyle?: StyleProp<ViewStyle>;
  showTopNavigation?: boolean;
  topContent?: React.ReactNode;
  flatTopNavigation?: boolean;
};

export default function ScreenScaffold({
  children,
  contentStyle,
  showTopNavigation = true,
  topContent,
}: ScreenScaffoldProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isOpen, close } = useMenu();

  const handleNavigateHome = useCallback(() => {
    close();
    router.navigate("/");
  }, [close, router]);

  const handleNavigate = useCallback(
    (route: MenuRouteName, params?: object) => {
      const target = menuRouteMap[route] ?? route;
      const presetParams = menuRouteParams[route];
      close();
      router.navigate({
        pathname: target,
        params: {
          ...(presetParams ?? {}),
          ...(params ?? {}),
        },
      });
    },
    [close, router],
  );

  return (
    <LinearGradient colors={[colors.bgFrom, colors.bgTo]} style={styles.gradient}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {showTopNavigation ? (
          <TopNavigationMenu onPressHome={handleNavigateHome} />
        ) : null}
        {topContent ? <View style={styles.topContent}>{topContent}</View> : null}
        <View style={[styles.content, contentStyle]}>{children}</View>
        <SideMenuNew visible={isOpen} onClose={close} navigate={handleNavigate} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: "transparent",
  },
  topContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
});
