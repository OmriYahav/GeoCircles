import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  Appbar,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, usePathname, useRouter, useSegments } from "expo-router";

import { Palette } from "../../../constants/theme";

const TAB_LINKS = [
  { key: "search", label: "Search", icon: "search-outline" as const },
  { key: "favorites", label: "Favorites", icon: "heart-outline" as const },
  { key: "messages", label: "Messages", icon: "chatbubbles-outline" as const },
  { key: "profile", label: "Profile", icon: "person-circle-outline" as const },
];

type TopNavigationMenuProps = {
  variant?: "default" | "modal";
};

export default function TopNavigationMenu({
  variant = "default",
}: TopNavigationMenuProps) {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const segments = useSegments();
  const pathname = usePathname();

  const activeTab = useMemo(() => {
    const parent = navigation.getParent?.();
    const parentState = parent?.getState();
    if (parentState && typeof parentState.index === "number") {
      const current = parentState.routes[parentState.index];
      if (typeof current?.name === "string") {
        return current.name;
      }
    }
    if (segments[0] === "(tabs)" && typeof segments[1] === "string") {
      return segments[1];
    }
    if (pathname?.startsWith("/(tabs)/") && typeof segments[1] === "string") {
      return segments[1];
    }
    return undefined;
  }, [navigation, segments, pathname]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }
    router.navigate({ pathname: "/(tabs)/search" });
  };

  const handleClose = () => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }
    router.navigate({ pathname: "/(tabs)/search" });
  };

  const handleNavigate = (tabKey: string) => {
    if (tabKey === "search") {
      router.navigate({
        pathname: "/(tabs)/search",
        params: {
          triggerType: "focusSearch",
          triggerTimestamp: Date.now().toString(),
        },
      });
      return;
    }

    router.navigate({ pathname: `/(tabs)/${tabKey}` });
  };

  return (
    <Surface elevation={1} style={styles.surface}>
      <Appbar.Header
        mode="small"
        statusBarHeight={0}
        style={[styles.header, { backgroundColor: theme.colors.surface }]}
      >
        <Appbar.Action icon="chevron-left" onPress={handleBack} />
        <Appbar.Action
          icon={variant === "modal" ? "close" : "close"}
          onPress={handleClose}
        />
        <View style={styles.divider} />
        <View style={styles.tabRow}>
          {TAB_LINKS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableRipple
                key={tab.key}
                onPress={() => handleNavigate(tab.key)}
                borderless
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <View style={styles.tabContent}>
                  <Ionicons
                    name={tab.icon}
                    size={18}
                    color={isActive ? Palette.primary : Palette.textMuted}
                  />
                  <Text
                    variant="labelSmall"
                    style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                  >
                    {tab.label}
                  </Text>
                </View>
              </TouchableRipple>
            );
          })}
        </View>
      </Appbar.Header>
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 4,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 8,
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: Palette.border,
    marginHorizontal: 8,
    opacity: 0.5,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-start",
    gap: 4,
  },
  tabButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tabButtonActive: {
    backgroundColor: Palette.primaryTint,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabLabel: {
    color: Palette.textMuted,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: Palette.primary,
  },
});
