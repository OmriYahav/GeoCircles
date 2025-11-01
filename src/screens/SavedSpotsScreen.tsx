import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

import ScreenScaffold from "../components/layout/ScreenScaffold";
import { useFavorites } from "../context/FavoritesContext";
import { useChatConversations } from "../context/ChatConversationsContext";
import useUserLocation from "../hooks/useUserLocation";
import { calculateDistanceMeters } from "../utils/business";
import { colors, radii, shadows, spacing, typography } from "../theme";

const AnimatedView = Animated.createAnimatedComponent(View);

type SavedSpotType = "favorite" | "pinned";

type SavedSpot = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: SavedSpotType;
  createdAt: number;
};

type EnrichedSavedSpot = SavedSpot & {
  distanceKm: number | null;
};

type FilterType = "all" | "favorites";
type SortMode = "distance" | "recent";

type SavedSpotRowProps = {
  spot: EnrichedSavedSpot;
  onRequestDelete: (closeRow?: () => void) => void;
  onViewOnMap: () => void;
  onNavigate: () => void;
};

const SegmentedOption = ({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ selected: isActive }}
    onPress={onPress}
    style={({ pressed }) => [
      styles.segment,
      isActive && styles.segmentActive,
      pressed && styles.segmentPressed,
    ]}
  >
    <Text style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}>
      {label}
    </Text>
  </Pressable>
);

const SavedSpotRow = React.memo(function SavedSpotRow({
  spot,
  onRequestDelete,
  onViewOnMap,
  onNavigate,
}: SavedSpotRowProps) {
  const swipeableRef = useRef<Swipeable | null>(null);
  const highlight = useSharedValue(0);

  const animatedHighlightStyle = useAnimatedStyle(() => ({
    opacity: highlight.value,
  }));

  const triggerHighlight = useCallback(() => {
    highlight.value = 0;
    highlight.value = withTiming(0.15, { duration: 90 }, () => {
      highlight.value = withTiming(0, { duration: 240 });
    });
  }, [highlight]);

  const handleCardPress = () => {
    triggerHighlight();
  };

  const renderRightActions = () => (
    <Pressable
      onPress={() => onRequestDelete(() => swipeableRef.current?.close())}
      style={({ pressed }) => [
        styles.deleteAction,
        pressed && styles.deleteActionPressed,
      ]}
    >
      <Ionicons name="trash" size={20} color={colors.surface} />
      <Text style={styles.deleteActionLabel}>Delete</Text>
    </Pressable>
  );

  const distanceLabel =
    spot.distanceKm !== null
      ? `${spot.distanceKm.toFixed(2)} km away`
      : "Distance unavailable";

  return (
    <AnimatedView
      entering={FadeInDown.springify().damping(18)}
      exiting={FadeOutUp.springify()}
    >
      <Swipeable
        ref={swipeableRef}
        overshootRight={false}
        renderRightActions={renderRightActions}
      >
        <Pressable
          onPress={handleCardPress}
          style={({ pressed }) => [
            styles.card,
            pressed && styles.cardPressed,
          ]}
        >
          <Animated.View style={[styles.highlightOverlay, animatedHighlightStyle]} />
          <View style={styles.cardHeader}>
            <View style={styles.titleColumn}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {spot.name}
              </Text>
              <Text style={styles.cardCoordinates}>
                {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                spot.type === "pinned" ? styles.badgePinned : styles.badgeFavorite,
              ]}
            >
              <Text
                style={[
                  styles.badgeLabel,
                  spot.type === "pinned"
                    ? styles.badgeLabelPinned
                    : styles.badgeLabelFavorite,
                ]}
              >
                {spot.type === "pinned" ? "Pinned" : "Favorite"}
              </Text>
            </View>
          </View>
          <Text style={styles.distanceLabel}>{distanceLabel}</Text>
          <View style={styles.actionsRow}>
            <Pressable
              onPress={onViewOnMap}
              style={({ pressed }) => [
                styles.actionChip,
                pressed && styles.actionChipPressed,
              ]}
            >
              <Ionicons name="map-outline" size={18} color={colors.primary} />
              <Text style={styles.actionChipLabel}>View on Map</Text>
            </Pressable>
            <Pressable
              onPress={onNavigate}
              style={({ pressed }) => [
                styles.actionChip,
                pressed && styles.actionChipPressed,
              ]}
            >
              <Ionicons name="navigate-outline" size={18} color={colors.primary} />
              <Text style={styles.actionChipLabel}>Navigate</Text>
            </Pressable>
          </View>
        </Pressable>
      </Swipeable>
    </AnimatedView>
  );
});

SavedSpotRow.displayName = "SavedSpotRow";

export default function SavedSpotsScreen() {
  const router = useRouter();
  const { favorites, removeFavorite } = useFavorites();
  const { conversations, removeConversation } = useChatConversations();
  const { location } = useUserLocation();

  const [filter, setFilter] = useState<FilterType>("all");
  const [sortMode, setSortMode] = useState<SortMode>("distance");

  const savedSpots = useMemo<SavedSpot[]>(() => {
    const favoriteSpots: SavedSpot[] = favorites.map((favorite) => ({
      id: favorite.id,
      name: favorite.title,
      latitude: favorite.latitude,
      longitude: favorite.longitude,
      createdAt: favorite.addedAt,
      type: "favorite",
    }));

    const pinnedSpots: SavedSpot[] = conversations.map((conversation) => ({
      id: conversation.id,
      name: conversation.title,
      latitude: conversation.coordinate.latitude,
      longitude: conversation.coordinate.longitude,
      createdAt: conversation.createdAt,
      type: "pinned",
    }));

    return [...pinnedSpots, ...favoriteSpots];
  }, [conversations, favorites]);

  const userCoords = location.coords;

  const spotsWithDistance = useMemo<EnrichedSavedSpot[]>(() => {
    return savedSpots.map((spot) => {
      if (!userCoords) {
        return { ...spot, distanceKm: null };
      }
      const distanceInMeters = calculateDistanceMeters(
        userCoords.latitude,
        userCoords.longitude,
        spot.latitude,
        spot.longitude
      );
      return {
        ...spot,
        distanceKm: Number.isFinite(distanceInMeters)
          ? distanceInMeters / 1000
          : null,
      };
    });
  }, [savedSpots, userCoords]);

  const displayedSpots = useMemo<EnrichedSavedSpot[]>(() => {
    const filtered =
      filter === "favorites"
        ? spotsWithDistance.filter((spot) => spot.type === "favorite")
        : spotsWithDistance;

    const sorted = [...filtered];

    if (sortMode === "distance") {
      sorted.sort((a, b) => {
        const distanceA = a.distanceKm ?? Number.POSITIVE_INFINITY;
        const distanceB = b.distanceKm ?? Number.POSITIVE_INFINITY;
        if (distanceA === distanceB) {
          return b.createdAt - a.createdAt;
        }
        return distanceA - distanceB;
      });
    } else {
      sorted.sort((a, b) => b.createdAt - a.createdAt);
    }

    return sorted;
  }, [filter, sortMode, spotsWithDistance]);

  const handleExport = useCallback(async () => {
    if (displayedSpots.length === 0) {
      Alert.alert("Export saved spots", "There are no saved spots to export.");
      return;
    }

    const header = "name,latitude,longitude,type,created_at";
    const rows = displayedSpots.map((spot) =>
      [
        JSON.stringify(spot.name),
        spot.latitude.toFixed(6),
        spot.longitude.toFixed(6),
        spot.type,
        new Date(spot.createdAt).toISOString(),
      ].join(",")
    );

    const csv = [header, ...rows].join("\n");

    try {
      await Share.share({
        title: "Saved spots export",
        message: csv,
      });
    } catch (error) {
      console.warn("Failed to share saved spots", error);
      Alert.alert(
        "Export failed",
        "We couldn't share the CSV file. Please try again later."
      );
    }
  }, [displayedSpots]);

  const handleNavigate = useCallback(async (spot: EnrichedSavedSpot) => {
    const wazeUrl = `waze://?ll=${spot.latitude},${spot.longitude}&navigate=yes`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`;

    try {
      const canOpenWaze = await Linking.canOpenURL(wazeUrl);
      if (canOpenWaze) {
        await Linking.openURL(wazeUrl);
        return;
      }
    } catch (error) {
      console.warn("Failed to open Waze", error);
    }

    try {
      const canOpenMaps = await Linking.canOpenURL(mapsUrl);
      if (canOpenMaps) {
        await Linking.openURL(mapsUrl);
        return;
      }
    } catch (error) {
      console.warn("Failed to open Google Maps", error);
    }

    Alert.alert(
      "Navigation unavailable",
      "We couldn't open a navigation app on your device."
    );
  }, []);

  const handleViewOnMap = useCallback(
    (spot: EnrichedSavedSpot) => {
      router.navigate({
        pathname: "/(tabs)/search",
        params: {
          lat: spot.latitude.toString(),
          lng: spot.longitude.toString(),
          focusTimestamp: Date.now().toString(),
        },
      });
    },
    [router]
  );

  const handleDelete = useCallback(
    (spot: EnrichedSavedSpot, closeRow?: () => void) => {
      Alert.alert(
        "Delete saved spot",
        `Are you sure you want to remove "${spot.name}" from saved spots?`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => closeRow?.(),
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              closeRow?.();
              if (spot.type === "favorite") {
                removeFavorite(spot.id).catch((error) => {
                  console.warn("Failed to remove favorite", error);
                  Alert.alert(
                    "Delete failed",
                    "We couldn't remove this favorite. Please try again."
                  );
                });
              } else {
                removeConversation(spot.id);
              }
            },
          },
        ]
      );
    },
    [removeConversation, removeFavorite]
  );

  const renderItem = useCallback(
    ({ item }: { item: EnrichedSavedSpot }) => (
      <SavedSpotRow
        spot={item}
        onRequestDelete={(closeRow) => handleDelete(item, closeRow)}
        onViewOnMap={() => handleViewOnMap(item)}
        onNavigate={() => handleNavigate(item)}
      />
    ),
    [handleDelete, handleNavigate, handleViewOnMap]
  );

  const keyExtractor = useCallback(
    (item: EnrichedSavedSpot) => `${item.type}-${item.id}`,
    []
  );

  return (
    <ScreenScaffold contentStyle={styles.screenContent}>
      <FlatList
        data={displayedSpots}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Saved Spots</Text>
              <Pressable
                onPress={handleExport}
                style={({ pressed }) => [
                  styles.exportButton,
                  pressed && styles.exportButtonPressed,
                ]}
                accessibilityRole="button"
              >
                <Ionicons name="share-outline" size={18} color={colors.primary} />
                <Text style={styles.exportLabel}>Export</Text>
              </Pressable>
            </View>
            <View style={styles.segmentedGroup}>
              <View style={styles.segmentedContainer}>
                <SegmentedOption
                  label="All"
                  isActive={filter === "all"}
                  onPress={() => setFilter("all")}
                />
                <SegmentedOption
                  label="Favorites"
                  isActive={filter === "favorites"}
                  onPress={() => setFilter("favorites")}
                />
              </View>
              <View style={styles.segmentedContainer}>
                <SegmentedOption
                  label="Nearest"
                  isActive={sortMode === "distance"}
                  onPress={() => setSortMode("distance")}
                />
                <SegmentedOption
                  label="Recent"
                  isActive={sortMode === "recent"}
                  onPress={() => setSortMode("recent")}
                />
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No saved spots yet.</Text>
            <Text style={styles.emptySubtitle}>
              Save a spot from the map to see it here.
            </Text>
            <Pressable
              onPress={() =>
                router.navigate({ pathname: "/(tabs)/search" })
              }
              style={({ pressed }) => [
                styles.emptyCta,
                pressed && styles.emptyCtaPressed,
              ]}
            >
              <Text style={styles.emptyCtaLabel}>Go to Map</Text>
            </Pressable>
          </View>
        )}
      />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.size.xl,
    fontFamily: typography.family.semiBold,
    color: colors.text.primary,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryTint,
  },
  exportButtonPressed: {
    opacity: 0.85,
  },
  exportLabel: {
    fontFamily: typography.family.medium,
    color: colors.primary,
    fontSize: typography.size.sm,
  },
  segmentedGroup: {
    gap: spacing.sm,
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    padding: 4,
    gap: 4,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  segment: {
    flex: 1,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: colors.primaryTint,
  },
  segmentPressed: {
    opacity: 0.9,
  },
  segmentLabel: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  segmentLabelActive: {
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  card: {
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    ...shadows.sm,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.97,
  },
  highlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  titleColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    fontFamily: typography.family.semiBold,
    color: colors.text.primary,
    fontSize: typography.size.lg,
  },
  cardCoordinates: {
    fontFamily: typography.family.regular,
    color: colors.text.muted,
    fontSize: typography.size.sm,
  },
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgePinned: {
    backgroundColor: colors.secondarySoft,
  },
  badgeFavorite: {
    backgroundColor: colors.primaryTint,
  },
  badgeLabel: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.xs,
  },
  badgeLabelPinned: {
    color: colors.secondary,
  },
  badgeLabelFavorite: {
    color: colors.primary,
  },
  distanceLabel: {
    marginTop: spacing.md,
    fontFamily: typography.family.medium,
    color: colors.text.secondary,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  actionChipPressed: {
    opacity: 0.85,
  },
  actionChipLabel: {
    fontFamily: typography.family.medium,
    color: colors.primary,
    fontSize: typography.size.sm,
  },
  deleteAction: {
    width: 96,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.danger ?? "#ff3b30",
    borderTopRightRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  deleteActionPressed: {
    opacity: 0.85,
  },
  deleteActionLabel: {
    color: colors.surface,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  emptyState: {
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxl,
    backgroundColor: colors.background,
    marginTop: spacing.xxl,
  },
  emptyTitle: {
    fontFamily: typography.family.semiBold,
    color: colors.text.primary,
    fontSize: typography.size.lg,
  },
  emptySubtitle: {
    fontFamily: typography.family.regular,
    color: colors.text.secondary,
    textAlign: "center",
  },
  emptyCta: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  emptyCtaPressed: {
    opacity: 0.85,
  },
  emptyCtaLabel: {
    fontFamily: typography.family.medium,
    color: colors.surface,
  },
});
