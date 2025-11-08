import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Text } from "react-native-paper";
import { gematriya, HDate, Locale } from "@hebcal/core";
import "@hebcal/core/dist/esm/locale";

import { colors, radii, shadows, spacing, typography } from "../theme";

type CalendarDay = {
  hDate: HDate;
  gregorian: Date;
  isoDate: string;
};

type HebrewCalendarProps = {
  selectedDate: string | null;
  bookedDates: Record<string, number>;
  onSelectDate: (isoDate: string, context: { hDate: HDate; gregorian: Date }) => void;
  style?: StyleProp<ViewStyle>;
};

const WEEKDAY_LABELS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

function toISODate(date: Date) {
  const normalized = new Date(date.getTime());
  normalized.setHours(0, 0, 0, 0);
  const offsetMs = normalized.getTimezoneOffset() * 60000;
  return new Date(normalized.getTime() - offsetMs).toISOString().split("T")[0];
}

function getMonthLabel(monthStart: HDate) {
  const englishName = monthStart.getMonthName();
  const hebrewName =
    Locale.lookupTranslation(englishName, "he") || Locale.gettext(englishName, "he");
  const hebrewYear = gematriya(monthStart.getFullYear());
  return `${hebrewName} ${hebrewYear}`;
}

export default function HebrewCalendar({
  selectedDate,
  bookedDates,
  onSelectDate,
  style,
}: HebrewCalendarProps) {
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const todayHDate = new HDate();
    return new HDate(1, todayHDate.getMonth(), todayHDate.getFullYear());
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, currentMonth]);

  const days = useMemo(() => {
    const firstDay = new HDate(currentMonth);
    const calendarDays: (CalendarDay | null)[] = [];
    const startDayOfWeek = firstDay.getDay();

    for (let i = 0; i < startDayOfWeek; i += 1) {
      calendarDays.push(null);
    }

    const totalDays = firstDay.daysInMonth();
    for (let day = 1; day <= totalDays; day += 1) {
      const hDate = new HDate(day, currentMonth.getMonth(), currentMonth.getFullYear());
      const gregorian = hDate.greg();
      const isoDate = toISODate(gregorian);
      calendarDays.push({ hDate, gregorian, isoDate });
    }

    while (calendarDays.length % 7 !== 0) {
      calendarDays.push(null);
    }

    return calendarDays;
  }, [currentMonth]);

  const weeks = useMemo(() => {
    const chunked: (CalendarDay | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      chunked.push(days.slice(i, i + 7));
    }
    return chunked;
  }, [days]);

  const handleSelectDay = (day: CalendarDay) => {
    const isPast = day.gregorian.getTime() < today.getTime();
    if (isPast) {
      return;
    }
    onSelectDate(day.isoDate, { hDate: day.hDate, gregorian: day.gregorian });
  };

  const handleNextMonth = () => {
    const next = currentMonth.add(1, "month");
    setCurrentMonth(new HDate(1, next.getMonth(), next.getFullYear()));
  };

  const handlePrevMonth = () => {
    const prev = currentMonth.add(-1, "month");
    setCurrentMonth(new HDate(1, prev.getMonth(), prev.getFullYear()));
  };

  const monthLabel = useMemo(() => getMonthLabel(currentMonth), [currentMonth]);

  return (
    <Animated.View style={[styles.container, style, { opacity: fadeAnim }]}> 
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={handleNextMonth}
          style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
        >
          <Text style={styles.navButtonLabel}>הבא</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={handlePrevMonth}
          style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
        >
          <Text style={styles.navButtonLabel}>הקודם</Text>
        </Pressable>
      </View>

      <View style={styles.weekHeader}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={styles.weekdayCell}>
            <Text style={styles.weekdayLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.weeksWrapper}>
        {weeks.map((week, index) => (
          <View key={`week-${index}`} style={styles.weekRow}>
            {week.map((day, dayIndex) => {
              if (!day) {
                return <View key={`empty-${index}-${dayIndex}`} style={styles.dayCellPlaceholder} />;
              }

              const isPast = day.gregorian.getTime() < today.getTime();
              const isSelected = selectedDate === day.isoDate;
              const hasBooking = Boolean(bookedDates[day.isoDate]);

              return (
                <Pressable
                  key={day.isoDate}
                  accessibilityRole="button"
                  disabled={isPast}
                  onPress={() => handleSelectDay(day)}
                  style={({ pressed }) => [
                    styles.dayCell,
                    isPast && styles.dayCellDisabled,
                    isSelected && styles.dayCellSelected,
                    pressed && !isPast && styles.dayCellPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayLabel,
                      isPast && styles.dayLabelDisabled,
                      isSelected && styles.dayLabelSelected,
                    ]}
                  >
                    {gematriya(day.hDate.getDate())}
                  </Text>
                  {hasBooking ? (
                    <View
                      style={[
                        styles.bookingDot,
                        isSelected && styles.bookingDotSelected,
                      ]}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    ...shadows.lg,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  monthLabel: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.lg,
    color: colors.text.primary,
  },
  navButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted ?? "#F9F4ED",
  },
  navButtonPressed: {
    opacity: 0.85,
  },
  navButtonLabel: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
    color: colors.primary,
  },
  weekHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
  },
  weekdayLabel: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  weeksWrapper: {
    gap: spacing.xs,
  },
  weekRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceElevated ?? "#F5ECDC",
    justifyContent: "center",
    alignItems: "center",
  },
  dayCellPlaceholder: {
    flex: 1,
    aspectRatio: 1,
  },
  dayCellDisabled: {
    backgroundColor: colors.surfaceMuted ?? "#F9F4ED",
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayCellPressed: {
    transform: [{ scale: 0.97 }],
  },
  dayLabel: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.lg,
    color: colors.text.primary,
  },
  dayLabelDisabled: {
    color: colors.text.muted,
    opacity: 0.6,
  },
  dayLabelSelected: {
    color: colors.text.inverse,
  },
  bookingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
    marginTop: spacing.xs,
  },
  bookingDotSelected: {
    backgroundColor: colors.surface,
  },
});
