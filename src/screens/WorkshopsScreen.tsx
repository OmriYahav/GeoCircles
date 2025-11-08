import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  ToastAndroid,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { Text } from "react-native-paper";

import WorkshopBookingModal from "../components/WorkshopBookingModal";
import ScreenScaffold from "../components/layout/ScreenScaffold";
import MyWorkshopsScreen, { type SavedWorkshop } from "./MyWorkshopsScreen";
import { colors, radii, shadows, spacing, typography } from "../theme";

const STORAGE_KEY = "sweet-balance.workshops";

const WORKSHOP_OPTIONS: { id: string; title: string; emoji: string }[] = [
  { id: "kids-baking", title: "אפיה בריאה לילדים", emoji: "🧁" },
  { id: "healthy-cooking", title: "בישול בריא", emoji: "🍲" },
  { id: "natural-care", title: "רוקחות טבעית", emoji: "🌿" },
  { id: "healthy-hosting", title: "אירוח בריא", emoji: "🍽️" },
];

type ActiveView = "options" | "saved";

export default function WorkshopsScreen() {
  const [bookings, setBookings] = useState<SavedWorkshop[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>("options");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null);

  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) {
          return;
        }

        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setBookings(parsed);
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
    };

    void loadBookings();
  }, []);

  const persistBookings = useCallback(async (next: SavedWorkshop[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn("Failed to store workshops", error);
    }
  }, []);

  const showConfirmationToast = useCallback((message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  }, []);

  const handleOpenModal = useCallback((workshopTitle: string) => {
    setSelectedWorkshop(workshopTitle);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedWorkshop(null);
  }, []);

  const handleConfirmBooking = useCallback(
    (payload: { title: string; date: string; time: string }) => {
      const booking: SavedWorkshop = {
        id: `${payload.title}-${payload.date}-${payload.time}-${Date.now()}`,
        title: payload.title,
        date: payload.date,
        time: payload.time,
        createdAt: Date.now(),
      };

      setBookings((current) => {
        const next = [...current, booking];
        void persistBookings(next);
        return next;
      });

      showConfirmationToast("הסדנה נשריינה בהצלחה");
      handleCloseModal();
    },
    [handleCloseModal, persistBookings, showConfirmationToast]
  );

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
              onPress={() => handleOpenModal(option.title)}
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

      <WorkshopBookingModal
        visible={modalVisible}
        workshopTitle={selectedWorkshop}
        onClose={handleCloseModal}
        onConfirm={handleConfirmBooking}
      />
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
