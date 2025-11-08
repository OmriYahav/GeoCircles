import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, TextInput } from "react-native-paper";

import HebrewCalendar from "../components/HebrewCalendar";
import ScreenScaffold from "../components/layout/ScreenScaffold";
import { colors, radii, shadows, spacing, typography } from "../theme";

type WorkshopBooking = {
  id: string;
  date: string;
  title: string;
  description?: string;
  time: string;
  createdAt: number;
};

const STORAGE_KEY = "sweet-balance.workshops";

const TIME_SLOTS = (() => {
  const slots: string[] = [];
  for (let hour = 8; hour <= 21; hour += 1) {
    for (const minute of [0, 30]) {
      const hoursLabel = hour.toString().padStart(2, "0");
      const minutesLabel = minute.toString().padStart(2, "0");
      slots.push(`${hoursLabel}:${minutesLabel}`);
    }
  }
  return slots;
})();

export default function WorkshopsScreen() {
  const [bookings, setBookings] = useState<Record<string, WorkshopBooking[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHebrewLabel, setSelectedHebrewLabel] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState<string>(TIME_SLOTS[0]);
  const [titleError, setTitleError] = useState(false);
  const [timeError, setTimeError] = useState(false);

  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: Record<string, WorkshopBooking[]> = JSON.parse(stored);
          setBookings(parsed);
        }
      } catch (error) {
        console.warn("Failed to load workshops", error);
      }
    };

    void loadBookings();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      modalOpacity.setValue(0);
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [modalOpacity, modalVisible]);

  const bookedDateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(bookings).forEach(([date, list]) => {
      if (list.length > 0) {
        counts[date] = list.length;
      }
    });
    return counts;
  }, [bookings]);

  const selectedBookings = selectedDate ? bookings[selectedDate] ?? [] : [];

  const handleSelectDate = useCallback((isoDate: string, context: { label: string }) => {
    setSelectedDate(isoDate);
    setSelectedHebrewLabel(context.label);
  }, []);

  const handleReservePress = useCallback(() => {
    if (!selectedDate) {
      return;
    }
    setTitle("");
    setDescription("");
    setTime(TIME_SLOTS[0]);
    setTitleError(false);
    setTimeError(false);
    setModalVisible(true);
  }, [selectedDate]);

  const persistBookings = useCallback(async (next: Record<string, WorkshopBooking[]>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn("Failed to store workshops", error);
    }
  }, []);

  const handleConfirmBooking = useCallback(() => {
    if (!selectedDate) {
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setTitleError(true);
      return;
    }

    if (!time) {
      setTimeError(true);
      return;
    }

    const booking: WorkshopBooking = {
      id: `${selectedDate}-${Date.now()}`,
      date: selectedDate,
      title: trimmedTitle,
      description: trimmedDescription.length > 0 ? trimmedDescription : undefined,
      time,
      createdAt: Date.now(),
    };

    setBookings((current) => {
      const updatedList = [...(current[selectedDate] ?? []), booking];
      const next = { ...current, [selectedDate]: updatedList };
      void persistBookings(next);
      return next;
    });

    setModalVisible(false);
  }, [description, persistBookings, selectedDate, time, title]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const topContent = (
    <View style={styles.topContent}>
      <Text style={styles.topTitle}>סדנאות</Text>
      <Text style={styles.topSubtitle}>בחרי תאריכים בלוח העברי כדי לשריין מפגשים עתידיים.</Text>
    </View>
  );

  return (
    <ScreenScaffold topContent={topContent}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HebrewCalendar
          bookedDates={bookedDateCounts}
          selectedDate={selectedDate}
          onSelectDate={(isoDate, context) =>
            handleSelectDate(isoDate, {
              label: context.hDate.render("he"),
            })
          }
          style={styles.calendar}
        />

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>תכנון הסדנאות שלך</Text>
          <Text style={styles.infoDescription}>
            {selectedHebrewLabel
              ? `התאריך שנבחר: ${selectedHebrewLabel}`
              : "בחרי תאריך עתידי בלוח כדי להתחיל."}
          </Text>

          {selectedBookings.length > 0 ? (
            <View style={styles.bookingsList}>
              <Text style={styles.bookingsListTitle}>סדנאות שכבר שריינת לתאריך זה</Text>
              {selectedBookings.map((booking) => (
                <View key={booking.id} style={styles.bookingItem}>
                  <Text style={styles.bookingItemTitle}>{booking.title}</Text>
                  <Text style={styles.bookingItemMeta}>
                    {booking.time}
                    {booking.description ? ` · ${booking.description}` : ""}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={!selectedDate}
            onPress={handleReservePress}
            style={({ pressed }) => [
              styles.reserveButton,
              !selectedDate && styles.reserveButtonDisabled,
              pressed && selectedDate && styles.reserveButtonPressed,
            ]}
          >
            <Text style={styles.reserveButtonLabel}>שריין סדנה</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackdrop}>
          <Animated.View
            style={[
              styles.modalCard,
              {
                opacity: modalOpacity,
                transform: [
                  {
                    translateY: modalOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.modalTitle}>פרטי הסדנה</Text>
            <Text style={styles.modalSubtitle}>
              {selectedHebrewLabel
                ? `התאריך הנבחר: ${selectedHebrewLabel}`
                : "בחרי תאריך בלוח כדי להמשיך."}
            </Text>

            <TextInput
              mode="outlined"
              label="כותרת הסדנה"
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                if (titleError && value.trim()) {
                  setTitleError(false);
                }
              }}
              style={styles.textInput}
              contentStyle={styles.textInputContent}
              placeholder="הקלידי שם קצר לסדנה"
            />
            {titleError ? (
              <Text style={styles.errorText}>נא להזין כותרת לסדנה.</Text>
            ) : null}

            <TextInput
              mode="outlined"
              label="תיאור (לא חובה)"
              value={description}
              onChangeText={setDescription}
              style={styles.textInput}
              contentStyle={styles.textInputContent}
              placeholder="הוסיפי פרטים ורעיונות לסדנה"
              multiline
            />

            <View style={styles.modalSection}>
              <Text style={styles.sectionLabel}>בחרי שעה</Text>
              <View style={styles.timeGrid}>
                {TIME_SLOTS.map((slot) => {
                  const isSelected = time === slot;
                  return (
                    <Pressable
                      key={slot}
                      accessibilityRole="button"
                      onPress={() => {
                        setTime(slot);
                        if (timeError) {
                          setTimeError(false);
                        }
                      }}
                      style={({ pressed }) => [
                        styles.timeOption,
                        isSelected && styles.timeOptionSelected,
                        pressed && styles.timeOptionPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeOptionLabel,
                          isSelected && styles.timeOptionLabelSelected,
                        ]}
                      >
                        {slot}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {timeError ? (
                <Text style={styles.errorText}>נא לבחור שעה מתאימה.</Text>
              ) : null}
            </View>

            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={handleCloseModal}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
              >
                <Text style={styles.secondaryButtonLabel}>בטל</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleConfirmBooking}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
              >
                <Text style={styles.primaryButtonLabel}>אישור</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: spacing.xxxl,
    gap: spacing.xxl,
  },
  topContent: {
    flexDirection: "column",
    alignItems: "flex-end",
    paddingRight: spacing.lg,
  },
  topTitle: {
    fontFamily: typography.family.heading,
    fontSize: typography.size.xl,
    color: colors.text.primary,
  },
  topSubtitle: {
    marginTop: spacing.xs,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    textAlign: "right",
  },
  calendar: {
    width: "100%",
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
    ...shadows.md,
  },
  infoTitle: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.lg,
    color: colors.text.primary,
    textAlign: "right",
  },
  infoDescription: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.comfy,
    textAlign: "right",
  },
  bookingsList: {
    gap: spacing.sm,
  },
  bookingsListTitle: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    textAlign: "right",
  },
  bookingItem: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  bookingItemTitle: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.md,
    color: colors.text.primary,
  },
  bookingItemMeta: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.xs,
    color: colors.text.muted,
  },
  reserveButton: {
    marginTop: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  reserveButtonDisabled: {
    backgroundColor: colors.primaryTint,
  },
  reserveButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  reserveButtonLabel: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.md,
    color: colors.text.inverse,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.32)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
    ...shadows.lg,
  },
  modalTitle: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.lg,
    color: colors.text.primary,
    textAlign: "right",
  },
  modalSubtitle: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    textAlign: "right",
  },
  textInput: {
    direction: "rtl",
  },
  textInputContent: {
    textAlign: "right",
  },
  modalSection: {
    gap: spacing.sm,
    alignItems: "flex-end",
  },
  sectionLabel: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
    color: colors.text.primary,
  },
  timeGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "flex-start",
  },
  timeOption: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
  },
  timeOptionSelected: {
    backgroundColor: colors.primary,
  },
  timeOptionPressed: {
    transform: [{ scale: 0.97 }],
  },
  timeOptionLabel: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
    color: colors.text.primary,
  },
  timeOptionLabelSelected: {
    color: colors.text.inverse,
  },
  modalActions: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonPressed: {
    opacity: 0.85,
  },
  secondaryButtonLabel: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
    color: colors.primary,
  },
  primaryButton: {
    flex: 1,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonLabel: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.md,
    color: colors.text.inverse,
  },
  errorText: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.xs,
    color: "#B71C1C",
    textAlign: "right",
  },
});
