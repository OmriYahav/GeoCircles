import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { useRouter } from "expo-router";

import type { SavedWorkshop } from "../MyWorkshopsScreen";
import { radii, shadows, spacing, typography } from "../../theme";

const STORAGE_KEY = "sweet-balance.workshops";

const palette = {
  background: "#F7F5F0",
  text: "#3C5233",
  button: "#52734D",
  surface: "#FFFFFF",
  overlay: "rgba(0, 0, 0, 0.25)",
  outline: "#52734D",
  placeholder: "rgba(60, 82, 51, 0.45)",
};

const DEFAULT_WORKSHOP_TIME = "18:00";

type WorkshopReservationProps = {
  workshopId: string;
  title: string;
  nextDate: string;
};

function parseStoredReservations(raw: unknown): SavedWorkshop[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;

    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const title = (item as SavedWorkshop).title ?? "סדנה";
          const date = (item as SavedWorkshop).date ?? dayjs().format("YYYY-MM-DD");
          const time = (item as SavedWorkshop).time ?? DEFAULT_WORKSHOP_TIME;

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
    }

    if (parsed && typeof parsed === "object") {
      const migrated: SavedWorkshop[] = [];
      Object.values(parsed).forEach((value) => {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item && typeof item === "object") {
              const title = (item as SavedWorkshop).title ?? "סדנה";
              const date = (item as SavedWorkshop).date ?? dayjs().format("YYYY-MM-DD");
              const time = (item as SavedWorkshop).time ?? DEFAULT_WORKSHOP_TIME;

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

      return migrated;
    }
  } catch (error) {
    console.warn("Failed to parse stored reservations", error);
  }

  return [];
}

export default function WorkshopReservation({
  workshopId,
  title,
  nextDate,
}: WorkshopReservationProps) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const formattedDate = useMemo(() => {
    const safeDate = dayjs(nextDate);
    if (!safeDate.isValid()) {
      return nextDate;
    }

    return safeDate.format("D.M.YYYY");
  }, [nextDate]);

  const normalizedDate = useMemo(() => {
    const safeDate = dayjs(nextDate);
    if (!safeDate.isValid()) {
      return nextDate;
    }

    return safeDate.format("YYYY-MM-DD");
  }, [nextDate]);

  const handleOpenModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setFullName("");
    setPhone("");
    setEmail("");
  }, []);

  const showSuccessMessage = useCallback(() => {
    const message = "השריון שלך נקלט בהצלחה!";

    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedPhone || !trimmedEmail) {
      Alert.alert("נא למלא את כל הפרטים");
      return;
    }

    setIsSaving(true);

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const existing = parseStoredReservations(raw);

      const reservation: SavedWorkshop = {
        id: `${workshopId}-${normalizedDate}-${Date.now()}`,
        title,
        date: normalizedDate,
        time: DEFAULT_WORKSHOP_TIME,
        createdAt: Date.now(),
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
      };

      const nextReservations = [...existing, reservation];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextReservations));

      showSuccessMessage();
      handleCloseModal();
    } catch (error) {
      console.warn("Failed to store reservation", error);
      Alert.alert("אירעה שגיאה בשמירת השריון. נסי שוב מאוחר יותר.");
    } finally {
      setIsSaving(false);
    }
  }, [
    email,
    fullName,
    handleCloseModal,
    normalizedDate,
    phone,
    showSuccessMessage,
    title,
    workshopId,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            accessibilityLabel="חזרה"
            accessibilityRole="button"
            hitSlop={{ top: spacing.sm, bottom: spacing.sm, left: spacing.sm, right: spacing.sm }}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonLabel}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>בחרי תאריך ושרייני מקום לסדנה שלך</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>המועד הקרוב</Text>
          <Text style={styles.cardDate}>{formattedDate}</Text>

          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleOpenModal}
            style={styles.reserveButton}
          >
            <Text style={styles.reserveButtonLabel}>שריין מקום</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={handleCloseModal}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalContainer}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>פרטי השריון</Text>

              <View style={styles.inputs}>
                <TextInput
                  accessibilityLabel="שם מלא"
                  autoCapitalize="words"
                  onChangeText={setFullName}
                  placeholder="שם מלא"
                  placeholderTextColor={palette.placeholder}
                  style={styles.input}
                  textAlign="right"
                  value={fullName}
                />
                <TextInput
                  accessibilityLabel="טלפון"
                  keyboardType="phone-pad"
                  onChangeText={setPhone}
                  placeholder="טלפון"
                  placeholderTextColor={palette.placeholder}
                  style={styles.input}
                  textAlign="right"
                  value={phone}
                />
                <TextInput
                  accessibilityLabel="כתובת מייל"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="כתובת מייל"
                  placeholderTextColor={palette.placeholder}
                  style={styles.input}
                  textAlign="right"
                  value={email}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={isSaving}
                  onPress={handleConfirm}
                  style={[styles.confirmButton, isSaving && styles.buttonDisabled]}
                >
                  <Text style={styles.confirmButtonLabel}>אישור שריון</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={handleCloseModal}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonLabel}>בטל</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xxl,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(82, 115, 77, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonLabel: {
    fontSize: typography.size.xl,
    color: palette.text,
  },
  textBlock: {
    gap: spacing.sm,
    alignItems: "flex-end",
  },
  title: {
    fontFamily: typography.family.heading,
    fontSize: typography.size.xxl,
    color: palette.text,
    textAlign: "right",
  },
  subtitle: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    color: palette.text,
    textAlign: "right",
    opacity: 0.85,
    lineHeight: typography.lineHeight.relaxed,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxxl,
    alignItems: "center",
    gap: spacing.lg,
    ...shadows.md,
  },
  cardLabel: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
    color: palette.text,
    opacity: 0.7,
  },
  cardDate: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.xl,
    color: palette.text,
  },
  reserveButton: {
    marginTop: spacing.sm,
    backgroundColor: palette.button,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  reserveButtonLabel: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
    color: "#FFFFFF",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: palette.overlay,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },
  modalContainer: {
    width: "100%",
  },
  modalCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
    gap: spacing.xl,
    ...shadows.lg,
  },
  modalTitle: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.lg,
    color: palette.text,
    textAlign: "right",
  },
  inputs: {
    gap: spacing.md,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.outline,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    color: palette.text,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  modalActions: {
    gap: spacing.md,
  },
  confirmButton: {
    backgroundColor: palette.button,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    ...shadows.sm,
  },
  confirmButtonLabel: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
    color: "#FFFFFF",
  },
  cancelButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.button,
    paddingVertical: spacing.md,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  cancelButtonLabel: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
    color: palette.button,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
