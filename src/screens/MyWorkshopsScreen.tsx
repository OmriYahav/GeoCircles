import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, View } from "react-native";
import dayjs from "dayjs";
import "dayjs/locale/he";
import { Text } from "react-native-paper";

import { colors, radii, shadows, spacing, typography } from "../theme";

export type SavedWorkshop = {
  id: string;
  title: string;
  date: string;
  time: string;
  createdAt: number;
  name?: string;
  phone?: string;
  email?: string;
};

type MyWorkshopsScreenProps = {
  bookings: SavedWorkshop[];
  visible: boolean;
  onDelete: (id: string) => void;
  onBack: () => void;
};

dayjs.locale("he");

export default function MyWorkshopsScreen({
  bookings,
  visible,
  onDelete,
  onBack,
}: MyWorkshopsScreenProps) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else {
      fade.setValue(0);
    }
  }, [fade, visible]);

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const first = dayjs(`${a.date}T${a.time}`);
      const second = dayjs(`${b.date}T${b.time}`);
      return first.valueOf() - second.valueOf();
    });
  }, [bookings]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fade,
          transform: [
            {
              translateY: fade.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>הסדנאות שלי</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Text style={styles.backButtonLabel}>חזרה</Text>
        </Pressable>
      </View>

      {sortedBookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>לא נשריינו סדנאות עדיין.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {sortedBookings.map((booking) => {
            const formattedDate = dayjs(`${booking.date}T${booking.time}`)
              .locale("he")
              .format("dddd, D MMMM YYYY");

            return (
              <View key={booking.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{booking.title}</Text>
                  <Text style={styles.cardSubtitle}>{`${formattedDate} • ${booking.time}`}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onDelete(booking.id)}
                  style={({ pressed }) => [
                    styles.deleteButton,
                    pressed && styles.deleteButtonPressed,
                  ]}
                >
                  <Text style={styles.deleteButtonLabel}>🗑️</Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.xl,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.lg,
    color: colors.text,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryTint,
  },
  backButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  backButtonLabel: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
    color: colors.text,
  },
  emptyState: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxxl,
    ...shadows.md,
  },
  emptyStateText: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
    color: colors.subtitle,
  },
  listContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    ...shadows.sm,
  },
  cardContent: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  cardTitle: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.md,
    color: colors.text,
    textAlign: "right",
  },
  cardSubtitle: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    color: colors.subtitle,
    textAlign: "right",
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonPressed: {
    transform: [{ scale: 0.92 }],
  },
  deleteButtonLabel: {
    fontSize: typography.size.md,
  },
});
