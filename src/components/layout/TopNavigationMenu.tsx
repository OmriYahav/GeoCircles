import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Appbar,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";

import { colors, radii, shadows, spacing, typography } from "../../theme";

type TopNavigationMenuProps = {
  variant?: "default" | "modal";
  showSearchAction?: boolean;
  content?: React.ReactNode;
};

export default function TopNavigationMenu({
  variant: _variant = "default",
  showSearchAction = false,
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

  const handleSearch = () => {
    if (!showSearchAction) {
      return;
    }

    router.navigate({
      pathname: "/(tabs)/map",
      params: {
        triggerType: "focusSearch",
        triggerTimestamp: Date.now().toString(),
      },
    });
  };

  return (
    <Surface elevation={2} style={styles.surface}>
      <Appbar.Header
        mode="small"
        statusBarHeight={0}
        style={[styles.header, { backgroundColor: theme.colors.surface }]}
      >
        <Appbar.Action icon="chevron-left" onPress={handleBack} />
        <View
          style={[
            styles.contentContainer,
            { marginRight: showSearchAction ? spacing.lg : 0 },
          ]}
        >
          {content ?? <View style={styles.spacer} />}
        </View>
        {showSearchAction ? (
          <TouchableRipple style={styles.searchButton} onPress={handleSearch}>
            <View style={styles.searchContent}>
              <Ionicons
                name="search-outline"
                size={18}
                color={colors.primary}
              />
              <Text variant="labelSmall" style={styles.searchLabel}>
                Search
              </Text>
            </View>
          </TouchableRipple>
        ) : null}
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
  searchButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryTint,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchLabel: {
    color: colors.primary,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
    letterSpacing: 0.2,
  },
});
