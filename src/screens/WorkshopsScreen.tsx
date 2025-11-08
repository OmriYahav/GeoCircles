import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { Text } from "react-native-paper";

import ScreenScaffold from "../components/layout/ScreenScaffold";
import MyWorkshopsScreen, { type SavedWorkshop } from "./MyWorkshopsScreen";
import { colors, radii, shadows, spacing, typography } from "../theme";

const STORAGE_KEY = "sweet-balance.workshops";

const WORKSHOP_OPTIONS: {
  id: string;
  title: string;
  emoji: string;
  route: string;
}[] = [
  {
    id: "kids-baking",
    title: "אפיה בריאה לילדים",
    emoji: "🧁",
    route: "/workshops/healthy-baking",
  },
  {
    id: "healthy-cooking",
    title: "בישול בריא",
    emoji: "🍲",
    route: "/workshops/healthy-cooking",
  },
  {
    id: "natural-care",
    title: "רוקחות טבעית",
    emoji: "🌿",
    route: "/workshops/natural-cosmetics",
  },
  {
    id: "healthy-hosting",
    title: "אירוח בריא",
    emoji: "🍽️",
    route: "/workshops/healthy-hosting",
  },
];

type ActiveView = "options" | "saved";

export default function WorkshopsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<SavedWorkshop[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>("options");

  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  const loadBookings = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (!stored) {
        setBookings([]);
        return;
      }

      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        const normalized = parsed
          .filter((item) => item && typeof item === "object")
          .map((item) => {
            const title = (item as SavedWorkshop).title ?? "סדנה";
            const date = (item as SavedWorkshop).date ?? dayjs().format("YYYY-MM-DD");
            const time = (item as SavedWorkshop).time ?? "18:00";

            return {
              id:
                (item as SavedWorkshop).id ??
                `${title}-${date}-${time}-${Date.now()}`,
              title,
              date,
              time,
              createdAt: (item as SavedWorkshop).createdAt ?? Date.now(),
              name: (item as SavedWorkshop).name,
              phone: (item as SavedWorkshop).phone,
              email: (item as SavedWorkshop).email,
            } satisfies SavedWorkshop;
          });

        setBookings(normalized);
        return;
      }

      if (parsed && typeof parsed === "object") {
        const migrated: SavedWorkshop[] = [];
        Object.values(parsed).forEach((value) => {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              if (item && typeof item === "object") {
                const title = (item as SavedWorkshop).title ?? "סדנה";
                const date = (item as SavedWorkshop).date ?? dayjs().format("YYYY-MM-DD");
                const time = (item as SavedWorkshop).time ?? "18:00";
                migrated.push({
                  id:
                    (item as SavedWorkshop).id ??
                    `${title}-${date}-${time}-${Date.now()}`,
                  title,
                  date,
                  time,
                  createdAt: (item as SavedWorkshop).createdAt ?? Date.now(),
                  name: (item as SavedWorkshop).name,
                  phone: (item as SavedWorkshop).phone,
                  email: (item as SavedWorkshop).email,
                });
              }
            });
          }
        });

        setBookings(migrated);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      }
    } catch (error) {
      console.warn("Failed to load workshops", error);
    }
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  useFocusEffect(
    useCallback(() => {
      void loadBookings();
    }, [loadBookings])
  );

  const persistBookings = useCallback(async (next: SavedWorkshop[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn("Failed to store workshops", error);
    }
  }, []);

  const handleDeleteBooking = useCallback(
    (bookingId: string) => {
      setBookings((current) => {
        const next = current.filter((booking) => booking.id !== bookingId);
        void persistBookings(next);
        return next;
      });
    },
    [persistBookings]
  );

  const sortedOptions = useMemo(() => WORKSHOP_OPTIONS, []);

  const topContent = (
    <View style={styles.topContent}>
      <View style={styles.topHeader}>
        <Text style={styles.topTitle}>סדנאות</Text>
        <Pressable
          accessibilityRole="button"
          disabled={activeView === "saved"}
          onPress={() => setActiveView("saved")}
          style={({ pressed }) => [
            styles.myWorkshopsButton,
            activeView === "saved" && styles.myWorkshopsButtonDisabled,
            pressed && activeView !== "saved" && styles.myWorkshopsButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.myWorkshopsLabel,
              activeView === "saved" && styles.myWorkshopsLabelDisabled,
            ]}
          >
            הסדנאות שלי
          </Text>
        </Pressable>
      </View>
      <Text style={styles.topSubtitle}>
        בחרי סדנה שתרצי לשריין והתחילי לתכנן את הרגע המיוחד הבא שלך.
      </Text>
    </View>
  );

  return (
    <ScreenScaffold
      contentStyle={styles.scaffoldContent}
      flatTopNavigation
      topContent={topContent}
    >
      {activeView === "saved" ? (
        <MyWorkshopsScreen
          bookings={bookings}
          visible={activeView === "saved"}
          onBack={() => setActiveView("options")}
          onDelete={handleDeleteBooking}
        />
      ) : (
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={[
            styles.animatedScroll,
            {
              opacity: fade,
              transform: [
                {
                  translateY: fade.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {sortedOptions.map((option) => (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              onPress={() => router.push(option.route)}
              style={({ pressed }) => [
                styles.optionButton,
                pressed && styles.optionButtonPressed,
              ]}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  {option.emoji} {option.title}
                </Text>
                <Text style={styles.optionDescription}>
                  לחצי כדי לבחור תאריך ושעה לסדנה זו.
                </Text>
              </View>
            </Pressable>
          ))}
        </Animated.ScrollView>
      )}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  scaffoldContent: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.background,
  },
  topContent: {
    flexDirection: "column",
    gap: spacing.sm,
    paddingRight: spacing.lg,
    paddingBottom: spacing.md,
  },
  topHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topTitle: {
    fontFamily: typography.family.heading,
    fontSize: typography.size.xl,
    color: colors.text.primary,
  },
  topSubtitle: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    textAlign: "right",
    lineHeight: typography.lineHeight.comfy,
  },
  myWorkshopsButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  myWorkshopsButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  myWorkshopsButtonDisabled: {
    backgroundColor: colors.surfaceMuted,
    shadowOpacity: 0,
  },
  myWorkshopsLabel: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
    color: colors.text.primary,
  },
  myWorkshopsLabelDisabled: {
    color: colors.text.secondary,
  },
  scrollContent: {
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  animatedScroll: {
    flex: 1,
  },
  optionButton: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    alignItems: "flex-end",
    gap: spacing.sm,
    ...shadows.md,
  },
  optionButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  optionContent: {
    gap: spacing.xs,
    alignItems: "flex-end",
  },
  optionTitle: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.lg,
    color: colors.text.primary,
    textAlign: "right",
  },
  optionDescription: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    textAlign: "right",
  },
});
