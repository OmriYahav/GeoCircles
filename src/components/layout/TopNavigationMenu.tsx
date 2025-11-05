import React from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Surface, useTheme } from "react-native-paper";
import { useNavigation, useRouter } from "expo-router";

import { colors, radii, shadows, spacing } from "../../theme";

type TopNavigationMenuProps = {
  variant?: "default" | "modal";
  content?: React.ReactNode;
};

export default function TopNavigationMenu({
  variant: _variant = "default",
  content,
}: TopNavigationMenuProps) {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }
    router.navigate({ pathname: "/(tabs)/map" });
  };

  return (
    <Surface elevation={2} style={styles.surface}>
      <Appbar.Header
        mode="small"
        statusBarHeight={0}
        style={[styles.header, { backgroundColor: theme.colors.surface }]}
      >
        <Appbar.Action icon="chevron-left" onPress={handleBack} />
        <View style={styles.contentContainer}>
          {content ?? <View style={styles.spacer} />}
        </View>
      </Appbar.Header>
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: radii.xl,
    alignSelf: "center",
    width: "92%",
    maxWidth: 440,
    overflow: "hidden",
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  header: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: spacing.lg,
    minHeight: 68,
  },
  contentContainer: {
    flex: 1,
    marginLeft: spacing.lg,
    justifyContent: "center",
  },
  spacer: {
    flex: 1,
  },
});
