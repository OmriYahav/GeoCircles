import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { Text } from "react-native-paper";

import { colors, radii, shadows, spacing, typography } from "../theme";

type WorkshopBookingModalProps = {
  visible: boolean;
  workshopTitle: string | null;
  onClose: () => void;
  onConfirm: (payload: { title: string; date: string; time: string }) => void;
};

const DEFAULT_HOUR = 18;

export default function WorkshopBookingModal({
  visible,
  workshopTitle,
  onClose,
  onConfirm,
}: WorkshopBookingModalProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const [selectedDate, setSelectedDate] = useState(() =>
    dayjs().add(1, "day").startOf("day").toDate()
  );
  const [selectedTime, setSelectedTime] = useState(() =>
    dayjs().hour(DEFAULT_HOUR).minute(0).second(0).millisecond(0).toDate()
  );

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

  useEffect(() => {
    if (visible) {
      setSelectedDate(dayjs().add(1, "day").startOf("day").toDate());
      setSelectedTime(
        dayjs().hour(DEFAULT_HOUR).minute(0).second(0).millisecond(0).toDate()
      );
    }
  }, [visible, workshopTitle]);

  const dateValue = useMemo(() => selectedDate, [selectedDate]);
  const timeValue = useMemo(() => selectedTime, [selectedTime]);

  const handleConfirm = () => {
    if (!workshopTitle) {
      return;
    }

    const dateString = dayjs(dateValue).format("YYYY-MM-DD");
    const timeString = dayjs(timeValue).format("HH:mm");

    onConfirm({
      title: workshopTitle,
      date: dateString,
      time: timeString,
    });
  };

  const modalContent = (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fade,
          transform: [
            {
              translateY: fade.interpolate({
                inputRange: [0, 1],
                outputRange: [28, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.title}>{workshopTitle ?? ""}</Text>
      <Text style={styles.subtitle}>בחרי תאריך ושעה לסדנה שלך</Text>

      <View style={styles.pickerSection}>
        <Text style={styles.sectionLabel}>תאריך</Text>
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={dateValue}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "calendar"}
            locale="he-IL"
            themeVariant="light"
            onChange={(event, value) => {
              if (value && event.type !== "dismissed") {
                setSelectedDate(dayjs(value).startOf("day").toDate());
              }
            }}
          />
        </View>
      </View>

      <View style={styles.pickerSection}>
        <Text style={styles.sectionLabel}>שעה</Text>
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={timeValue}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "clock"}
            locale="he-IL"
            is24Hour
            onChange={(event, value) => {
              if (value && event.type !== "dismissed") {
                const next = dayjs(timeValue)
                  .set("hour", dayjs(value).hour())
                  .set("minute", dayjs(value).minute())
                  .second(0)
                  .millisecond(0)
                  .toDate();
                setSelectedTime(next);
              }
            }}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonLabel}>בטל</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={handleConfirm}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
        >
          <Text style={styles.primaryButtonLabel}>אישור שריון</Text>
        </Pressable>
      </View>
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {modalContent}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
    gap: spacing.lg,
    alignItems: "stretch",
    ...shadows.lg,
  },
  title: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.lg,
    color: colors.text,
    textAlign: "right",
  },
  subtitle: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    color: colors.subtitle,
    textAlign: "right",
  },
  pickerSection: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
    color: colors.text,
    textAlign: "right",
  },
  pickerContainer: {
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  actions: {
    flexDirection: "row-reverse",
    gap: spacing.md,
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
    opacity: 0.8,
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
    ...shadows.sm,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonLabel: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.md,
    color: colors.textInverse,
  },
});
