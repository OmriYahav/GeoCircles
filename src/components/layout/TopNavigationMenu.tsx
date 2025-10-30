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

import { Palette } from "../../../constants/theme";

type TopNavigationMenuProps = {
  variant?: "default" | "modal";
};

export default function TopNavigationMenu({
  variant: _variant = "default",
}: TopNavigationMenuProps) {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }
    router.navigate({ pathname: "/(tabs)/search" });
  };

  const handleSearch = () => {
    router.navigate({
      pathname: "/(tabs)/search",
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
        <View style={styles.spacer} />
        <TouchableRipple style={styles.searchButton} onPress={handleSearch}>
          <View style={styles.searchContent}>
            <Ionicons
              name="search-outline"
              size={18}
              color={Palette.primary}
            />
            <Text variant="labelSmall" style={styles.searchLabel}>
              Search
            </Text>
          </View>
        </TouchableRipple>
      </Appbar.Header>
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: 28,
    alignSelf: "center",
    width: "92%",
    maxWidth: 420,
    overflow: "hidden",
    backgroundColor: Palette.surface,
    shadowColor: "rgba(15, 23, 42, 0.12)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
  },
  header: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 12,
    minHeight: 68,
  },
  spacer: {
    flex: 1,
  },
  searchButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Palette.primaryTint,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  searchLabel: {
    color: Palette.primary,
    fontWeight: "600",
  },
});
