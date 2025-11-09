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

import type { SavedWorkshop } from "../../types/workshops";
import { radii, shadows, spacing, typography } from "../../theme";
import AnimatedHomeButton from "../../components/AnimatedHomeButton";
import HeaderRightMenuButton from "../../components/HeaderRightMenuButton";
import SideMenuNew from "../../components/SideMenuNew";
import { useMenu } from "../../context/MenuContext";
import { menuRouteMap } from "../../constants/menuRoutes";

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

      return migrated;
    }
  } catch {
    return [];
  }

  return [];
}

export default function WorkshopReservation({
  workshopId,
  title,
  nextDate,
}: WorkshopReservationProps) {
  const router = useRouter();
  const { isOpen, open, close } = useMenu();
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

  const handleMenuPress = useCallback(() => {
    open();
  }, [open]);

  const handleHomePress = useCallback(() => {
    close();
    router.navigate("/");
  }, [close, router]);

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

      const updated = [...existing, reservation];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      showSuccessMessage();
      handleCloseModal();
    } catch {
      Alert.alert("שגיאה", "לא הצלחנו לשמור את השריון. נסי שוב מאוחר יותר.");
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
    <SafeAreaView style={styles.safe}> 
      <View style={styles.header}>
        <AnimatedHomeButton onPress={handleHomePress} />
        <Text style={styles.brand}>Sweet Balance</Text>
        <HeaderRightMenuButton onPress={handleMenuPress} expanded={isOpen} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{`המפגש הבא יתקיים ב-${formattedDate}`}</Text>
          <TouchableOpacity style={styles.heroButton} onPress={handleOpenModal}>
            <Text style={styles.heroButtonText}>שרייני מקום</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>מה מחכה לך בסדנה?</Text>
          <Text style={styles.infoParagraph}>
            מפגש חווייתי באווירה אינטימית, עם טיפים פרקטיים שתוכלי לקחת הביתה כבר באותו ערב.
            נבשל, נטעם ונלמד איך ליצור איזון נעים גם בימים העמוסים.
          </Text>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>פרטי השריון</Text>
              <TextInput
                style={styles.input}
                placeholder="שם מלא"
                placeholderTextColor={palette.placeholder}
                value={fullName}
                onChangeText={setFullName}
              />
              <TextInput
                style={styles.input}
                placeholder="טלפון"
                placeholderTextColor={palette.placeholder}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="אימייל"
                placeholderTextColor={palette.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={handleCloseModal}
                  disabled={isSaving}
                >
                  <Text style={styles.modalButtonSecondaryText}>ביטול</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleConfirm}
                  disabled={isSaving}
                >
                  <Text style={styles.modalButtonPrimaryText}>
                    {isSaving ? "שומרת..." : "אישור"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <SideMenuNew
        visible={isOpen}
        onClose={close}
        navigate={(route, params) => {
          const target = menuRouteMap[route] ?? route;
          close();
          router.navigate({ pathname: target, params: params ?? {} });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.25),
  },
  brand: {
    color: palette.text,
    fontSize: typography.subtitle,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
    flex: 1,
    textAlign: "center",
  },
  content: {
    padding: spacing(2),
    gap: spacing(2),
  },
  heroCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    padding: spacing(2),
    ...shadows.card,
    gap: spacing(1),
  },
  heroTitle: {
    color: palette.text,
    fontSize: typography.title,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
  heroSubtitle: {
    color: palette.text,
    fontSize: typography.body,
    textAlign: "right",
  },
  heroButton: {
    marginTop: spacing(1),
    backgroundColor: palette.button,
    paddingVertical: spacing(1),
    borderRadius: radii.lg,
    alignItems: "center",
  },
  heroButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    padding: spacing(2),
    gap: spacing(1),
    ...shadows.card,
  },
  infoTitle: {
    color: palette.text,
    fontSize: typography.subtitle,
    fontWeight: "700",
    textAlign: "right",
  },
  infoParagraph: {
    color: palette.text,
    fontSize: typography.body,
    lineHeight: typography.body * 1.5,
    textAlign: "right",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: palette.overlay,
    justifyContent: "center",
    padding: spacing(2),
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    padding: spacing(2),
    gap: spacing(1.5),
  },
  modalTitle: {
    color: palette.text,
    fontSize: typography.subtitle,
    fontWeight: "700",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: palette.outline,
    borderRadius: radii.lg,
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(1.5),
    color: palette.text,
    textAlign: "right",
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing(1),
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    borderRadius: radii.lg,
    paddingVertical: spacing(1),
    alignItems: "center",
  },
  modalButtonSecondary: {
    backgroundColor: "rgba(82, 115, 77, 0.12)",
  },
  modalButtonSecondaryText: {
    color: palette.button,
    fontWeight: "600",
  },
  modalButtonPrimary: {
    backgroundColor: palette.button,
  },
  modalButtonPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
