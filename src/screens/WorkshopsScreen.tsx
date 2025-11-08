import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import "dayjs/locale/he";

import AnimatedMenuIcon from "../components/AnimatedMenuIcon";
import Card from "../components/Card";
import CTAButton from "../components/CTAButton";
import { colors, radius, spacing, typography } from "../theme";
import { useMenu } from "../context/MenuContext";
import type { SavedWorkshop } from "./MyWorkshopsScreen";

const STORAGE_KEY = "sweet-balance.workshops";

type WorkshopOption = {
  id: string;
  title: string;
  emoji: string;
  route: string;
  description: string;
};

const WORKSHOP_OPTIONS: WorkshopOption[] = [
  {
    id: "kids-baking",
    title: "אפיה בריאה לילדים",
    emoji: "🧁",
    route: "/(drawer)/workshops/healthy-baking",
    description: "הכנת קינוחים מאוזנים לכל המשפחה",
  },
  {
    id: "healthy-cooking",
    title: "בישול בריא",
    emoji: "🍲",
    route: "/(drawer)/workshops/healthy-cooking",
    description: "מנות חמות עם ירקות עונתיים וטעמים מרעננים",
  },
  {
    id: "natural-care",
    title: "רוקחות טבעית",
    emoji: "🌿",
    route: "/(drawer)/workshops/natural-cosmetics",
    description: "סדנת יצירה לטיפוח גוף טבעי ומזין",
  },
  {
    id: "healthy-hosting",
    title: "אירוח בריא",
    emoji: "🍽️",
    route: "/(drawer)/workshops/healthy-hosting",
    description: "שולחן מפנק לאירועים קטנים עם נגיעות ירוקות",
  },
];

type ActiveView = "options" | "saved";

dayjs.locale("he");

export default function WorkshopsScreen() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { menuOpen, toggleMenu, closeMenu } = useMenu();
  const [bookings, setBookings] = useState<SavedWorkshop[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>("options");

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
                (item as SavedWorkshop).id ?? `${title}-${date}-${time}-${Date.now()}`,
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
                    (item as SavedWorkshop).id ?? `${title}-${date}-${time}-${Date.now()}`,
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
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

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
    [persistBookings],
  );

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((first, second) => {
      const a = dayjs(`${first.date}T${first.time}`);
      const b = dayjs(`${second.date}T${second.time}`);
      return a.valueOf() - b.valueOf();
    });
  }, [bookings]);

  const handleMenuPress = useCallback(() => {
    if (typeof navigation?.toggleDrawer === "function") {
      navigation.toggleDrawer();
      return;
    }

    toggleMenu();
  }, [navigation, toggleMenu]);

  const handleNavigateOption = useCallback(
    (route: string) => {
      closeMenu();
      router.push(route);
    },
    [closeMenu, router],
  );

  return (
    <LinearGradient colors={[colors.bgFrom, colors.bgTo]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.brand}>Sweet Balance</Text>
          <AnimatedMenuIcon open={menuOpen} onPress={handleMenuPress} />
        </View>

        <Animated.View style={[styles.animatedContent, { opacity: fadeAnim }]}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.screenTitle}>סדנאות</Text>
            <Text style={styles.screenSubtitle}>
              בחרי סדנה שתרצי לשריין והתחילי לתכנן את הרגע המיוחד הבא שלך.
            </Text>

            <View style={styles.tabRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: activeView === "options" }}
                onPress={() => setActiveView("options")}
                style={[styles.tabButton, activeView === "options" && styles.tabButtonActive]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeView === "options" && styles.tabLabelActive,
                  ]}
                >
                  סדנאות זמינות
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: activeView === "saved" }}
                onPress={() => setActiveView("saved")}
                style={[styles.tabButton, activeView === "saved" && styles.tabButtonActive]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeView === "saved" && styles.tabLabelActive,
                  ]}
                >
                  הסדנאות שלי
                </Text>
              </Pressable>
            </View>

            {activeView === "options" ? (
              <View style={styles.optionsList}>
                {WORKSHOP_OPTIONS.map((option) => (
                  <View key={option.id} style={styles.optionCard}>
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <Card
                      title={option.title}
                      subtitle={option.description}
                      onPress={() => handleNavigateOption(option.route)}
                    />
                  </View>
                ))}
                <CTAButton
                  title="שרייני מקום"
                  onPress={() => setActiveView("saved")}
                />
              </View>
            ) : (
              <View style={styles.savedList}>
                {sortedBookings.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateTitle}>עוד לא נשריין מקום</Text>
                    <Text style={styles.emptyStateSubtitle}>
                      לחצי על ״סדנאות זמינות״ כדי לבחור את החוויה הבאה שלך.
                    </Text>
                    <CTAButton title="לסדנאות" onPress={() => setActiveView("options")} />
                  </View>
                ) : (
                  sortedBookings.map((booking) => {
                    const formattedDate = dayjs(`${booking.date}T${booking.time}`)
                      .locale("he")
                      .format("dddd, D MMMM YYYY");

                    return (
                      <View key={booking.id} style={styles.bookingCard}>
                        <View style={styles.bookingDetails}>
                          <Text style={styles.bookingTitle}>{booking.title}</Text>
                          <Text style={styles.bookingSubtitle}>{`${formattedDate} • ${booking.time}`}</Text>
                          {booking.name ? (
                            <Text style={styles.bookingMeta}>{`לשם: ${booking.name}`}</Text>
                          ) : null}
                        </View>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => handleDeleteBooking(booking.id)}
                          style={({ pressed }) => [
                            styles.deleteButton,
                            pressed && styles.deleteButtonPressed,
                          ]}
                        >
                          <Text style={styles.deleteLabel}>מחקי</Text>
                        </Pressable>
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  brand: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
  },
  animatedContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(6),
    gap: spacing(2),
  },
  screenTitle: {
    color: colors.primary,
    fontSize: typography.title,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
  screenSubtitle: {
    color: colors.subtitle,
    fontSize: typography.subtitle,
    fontFamily: typography.fontFamily,
    textAlign: "right",
    lineHeight: typography.subtitle * 1.4,
  },
  tabRow: {
    marginTop: spacing(2),
    flexDirection: "row-reverse",
    gap: spacing(1),
  },
  tabButton: {
    flex: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing(1),
    backgroundColor: "rgba(47, 110, 68, 0.12)",
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    textAlign: "center",
    color: colors.primary,
    fontSize: typography.small,
    fontFamily: typography.fontFamily,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: "#fff",
  },
  optionsList: {
    marginTop: spacing(3),
    gap: spacing(2),
  },
  optionCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing(2),
  },
  optionEmoji: {
    fontSize: typography.title,
    marginTop: spacing(1),
  },
  savedList: {
    marginTop: spacing(3),
    gap: spacing(2),
  },
  emptyState: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing(3),
    alignItems: "center",
    gap: spacing(1.5),
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  emptyStateTitle: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    color: colors.subtitle,
    fontSize: typography.body,
    fontFamily: typography.fontFamily,
    textAlign: "center",
    lineHeight: typography.body * 1.5,
  },
  bookingCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing(2),
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing(2),
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  bookingDetails: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing(0.5),
  },
  bookingTitle: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontWeight: "600",
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
  bookingSubtitle: {
    color: colors.subtitle,
    fontSize: typography.body,
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
  bookingMeta: {
    color: colors.subtitle,
    fontSize: typography.small,
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
  deleteButton: {
    borderRadius: radius.pill,
    paddingVertical: spacing(0.5),
    paddingHorizontal: spacing(1.5),
    backgroundColor: "rgba(47, 110, 68, 0.12)",
  },
  deleteButtonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: "rgba(47, 110, 68, 0.2)",
  },
  deleteLabel: {
    color: colors.primary,
    fontSize: typography.small,
    fontFamily: typography.fontFamily,
  },
});
