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
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import "dayjs/locale/he";

import AnimatedHomeButton from "../components/AnimatedHomeButton";
import HeaderRightMenuButton from "../components/HeaderRightMenuButton";
import Card from "../components/Card";
import CTAButton from "../components/CTAButton";
import SideMenuNew from "../components/SideMenuNew";
import { colors, radius, spacing, typography } from "../theme";
import { useMenu } from "../context/MenuContext";
import { menuRouteMap } from "../constants/menuRoutes";
import type { SavedWorkshop } from "./MyWorkshopsScreen";

const STORAGE_KEY = "sweet-balance.workshops";

type WorkshopIconName = "smile" | "aperture" | "droplet" | "users";

type WorkshopOption = {
  id: string;
  title: string;
  icon: WorkshopIconName;
  route: string;
  description: string;
};

const WORKSHOP_OPTIONS: WorkshopOption[] = [
  {
    id: "kids-baking",
    title: "אפיה בריאה לילדים",
    icon: "smile",
    route: "/(drawer)/workshops/healthy-baking",
    description: "הכנת קינוחים מאוזנים לכל המשפחה",
  },
  {
    id: "healthy-cooking",
    title: "בישול בריא",
    icon: "aperture",
    route: "/(drawer)/workshops/healthy-cooking",
    description: "מנות חמות עם ירקות עונתיים וטעמים מרעננים",
  },
  {
    id: "natural-care",
    title: "רוקחות טבעית",
    icon: "droplet",
    route: "/(drawer)/workshops/natural-cosmetics",
    description: "סדנת יצירה לטיפוח גוף טבעי ומזין",
  },
  {
    id: "healthy-hosting",
    title: "אירוח בריא",
    icon: "users",
    route: "/(drawer)/workshops/healthy-hosting",
    description: "שולחן מפנק לאירועים קטנים עם נגיעות ירוקות",
  },
];

type ActiveView = "options" | "saved";

dayjs.locale("he");

export default function WorkshopsScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { isOpen, open, close } = useMenu();
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
    open();
  }, [open]);

  const handleHomePress = useCallback(() => {
    close();
    router.navigate("/");
  }, [close, router]);

  const handleNavigateOption = useCallback(
    (route: string) => {
      close();
      router.push(route);
    },
    [close, router],
  );

  return (
    <LinearGradient colors={[colors.bgFrom, colors.bgTo]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <AnimatedHomeButton onPress={handleHomePress} />
          <Text style={styles.brand}>Sweet Balance</Text>
          <HeaderRightMenuButton onPress={handleMenuPress} expanded={isOpen} />
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
                    <Card
                      title={option.title}
                      subtitle={option.description}
                      icon={option.icon}
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

            <View style={styles.moreSection}>
              <Text style={styles.moreTitle}>עוד השראה מחכה לך</Text>
              <Text style={styles.moreSubtitle}>
                קפצי לבלוג או למתכונים לקבלת רעיונות מרעננים בין הסדנאות.
              </Text>
              <View style={styles.moreLinks}>
                <CTAButton
                  title="לבלוג"
                  onPress={() => {
                    close();
                    router.navigate(menuRouteMap.Blog);
                  }}
                />
                <CTAButton
                  title="למתכונים"
                  onPress={() => {
                    close();
                    router.navigate(menuRouteMap.Recipes);
                  }}
                />
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>

      <SideMenuNew
        visible={isOpen}
        onClose={close}
        navigate={(route, params) => {
          const target = menuRouteMap[route] ?? route;
          close();
          router.navigate({ pathname: target, params: params ?? {} });
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    zIndex: 20,
  },
  brand: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
    flex: 1,
    textAlign: "center",
  },
  animatedContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(4),
    gap: spacing(1.5),
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
  },
  tabRow: {
    flexDirection: "row",
    gap: spacing(1),
    marginTop: spacing(1.5),
  },
  tabButton: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingVertical: spacing(0.75),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  tabButtonActive: {
    backgroundColor: colors.surfaceElevated,
  },
  tabLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontFamily: typography.fontFamily,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  optionsList: {
    gap: spacing(1.5),
    marginTop: spacing(2),
  },
  optionCard: {
    width: "100%",
  },
  savedList: {
    gap: spacing(1),
    marginTop: spacing(2),
  },
  emptyState: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: radius.xl,
    padding: spacing(2),
    alignItems: "center",
    gap: spacing(1),
  },
  emptyStateTitle: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
  },
  emptyStateSubtitle: {
    color: colors.text,
    fontSize: typography.body,
    textAlign: "center",
    lineHeight: typography.body * 1.5,
  },
  bookingCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    shadowColor: "rgba(0,0,0,0.08)",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  bookingDetails: {
    flex: 1,
    marginLeft: spacing(1),
  },
  bookingTitle: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
  bookingSubtitle: {
    color: colors.text,
    fontSize: typography.body,
    textAlign: "right",
    marginTop: 4,
  },
  bookingMeta: {
    color: colors.text,
    fontSize: typography.small,
    marginTop: 2,
    textAlign: "right",
  },
  deleteButton: {
    paddingVertical: spacing(0.75),
    paddingHorizontal: spacing(1.5),
    borderRadius: radius.lg,
    backgroundColor: "rgba(209, 67, 67, 0.1)",
  },
  deleteButtonPressed: {
    backgroundColor: "rgba(209, 67, 67, 0.18)",
  },
  deleteLabel: {
    color: "#B44747",
    fontWeight: "600",
  },
  moreSection: {
    marginTop: spacing(2.5),
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: radius.xl,
    padding: spacing(2),
    gap: spacing(1),
  },
  moreTitle: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
  moreSubtitle: {
    color: colors.text,
    fontSize: typography.body,
    textAlign: "right",
    lineHeight: typography.body * 1.4,
  },
  moreLinks: {
    flexDirection: "row",
    gap: spacing(1),
  },
});
