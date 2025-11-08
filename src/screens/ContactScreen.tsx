import { useMemo, type ReactElement } from "react";
import {
  Alert,
  I18nManager,
  Linking,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import ScreenScaffold from "../components/layout/ScreenScaffold";
import { Feather, FontAwesome } from "@expo/vector-icons";

I18nManager.allowRTL(true);

type ContactItemKey = "whatsapp" | "instagram" | "facebook" | "email";

type ContactItem = {
  key: ContactItemKey;
  url: string;
  a11y: string;
  renderIcon: () => ReactElement;
  bg: string;
};

const CONTACT_ITEMS: ContactItem[] = [
  {
    key: "whatsapp",
    url: "https://wa.me/972507117202",
    a11y: "שליחת הודעה בוואטסאפ",
    bg: "#25D366",
    renderIcon: () => <FontAwesome name="whatsapp" size={36} color="#fff" />,
  },
  {
    key: "instagram",
    url: "https://www.instagram.com/batchenlev?igsh=MXJjNDJjaHEzNTlyaw==",
    a11y: "כניסה לפרופיל אינסטגרם",
    bg: "#C13584",
    renderIcon: () => <Feather name="instagram" size={36} color="#fff" />,
  },
  {
    key: "facebook",
    url: "https://www.facebook.com/share/17YP65zVDC/?mibextid=wwXIfr",
    a11y: "פתיחת פייסבוק",
    bg: "#1877F2",
    renderIcon: () => <Feather name="facebook" size={36} color="#fff" />,
  },
  {
    key: "email",
    url: "mailto:batchenlev@gmail.com",
    a11y: "שליחת מייל",
    bg: "#4CAF50",
    renderIcon: () => <Feather name="mail" size={34} color="#fff" />,
  },
];

async function openUrl(url: string) {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      throw new Error("cannot open");
    }

    await Linking.openURL(url);
  } catch (error) {
    console.warn("Failed to open contact link", error);
    Alert.alert("שגיאה", "לא הצלחתי לפתוח את הקישור. נסו שוב מאוחר יותר.");
  }
}

const CIRCLE = 86;
const GAP = 18;

export default function ContactScreen() {
  const { width } = useWindowDimensions();
  const columns = width >= 600 ? 4 : 2;

  const gridStyle = useMemo(() => {
    const totalWidth = columns * (CIRCLE + GAP);
    return {
      maxWidth: totalWidth,
    };
  }, [columns]);

  return (
    <ScreenScaffold contentStyle={styles.scaffoldContent}>
      <View style={styles.container}>
        <View style={[styles.grid, gridStyle]}>
          {CONTACT_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.a11y}
              onPress={() => openUrl(item.url)}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              style={({ pressed }) => [
                styles.circle,
                { backgroundColor: item.bg },
                pressed && styles.pressed,
              ]}
            >
              {item.renderIcon()}
            </Pressable>
          ))}
        </View>
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  scaffoldContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F6F1EA",
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    direction: "rtl",
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: GAP / 2,
    marginVertical: GAP / 2,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
});
