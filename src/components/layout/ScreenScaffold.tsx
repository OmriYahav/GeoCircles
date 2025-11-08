import React from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TopNavigationMenu from "./TopNavigationMenu";
import { colors, spacing } from "../../theme";

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
  variant = "default",
  contentStyle,
  showTopNavigation = true,
  topContent,
  flatTopNavigation = false,
}: ScreenScaffoldProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: showTopNavigation ? insets.top : 0 }]}>
      {showTopNavigation ? (
        <TopNavigationMenu
          variant={variant}
          content={topContent}
          flat={flatTopNavigation}
        />
      ) : null}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
});
