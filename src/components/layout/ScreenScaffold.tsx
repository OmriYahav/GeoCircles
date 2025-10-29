import React from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TopNavigationMenu from "./TopNavigationMenu";
import { Palette } from "../../../constants/theme";

type ScreenScaffoldProps = {
  children: React.ReactNode;
  variant?: "default" | "modal";
  contentStyle?: StyleProp<ViewStyle>;
};

export default function ScreenScaffold({
  children,
  variant = "default",
  contentStyle,
}: ScreenScaffoldProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, backgroundColor: Palette.background },
      ]}
    >
      <TopNavigationMenu variant={variant} />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
