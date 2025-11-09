import { useMemo, type ReactElement } from "react";
import {
  Alert,
  I18nManager,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";

import ScreenScaffold from "../components/layout/ScreenScaffold";
import { colors, spacing, typography } from "../theme";

I18nManager.allowRTL(true);

type ContactItemKey = "whatsapp" | "instagram" | "facebook" | "email";

type ContactItem = {
  key: ContactItemKey;
  url: string;
  a11y: string;
  renderIcon: () => ReactElement;
  bg: string;
  iconColor: string;
};

const CONTACT_ITEMS: ContactItem[] = [
  {
    key: "whatsapp",
    url: "https://wa.me/972507117202",
    a11y: "שליחת הודעה בוואטסאפ",
    bg: colors.primarySoft,
    iconColor: colors.primary,
    renderIcon: () => <FontAwesome name="whatsapp" size={28} color={colors.primary} />,
  },
  {
    key: "instagram",
    url: "https://www.instagram.com/batchenlev",
    a11y: "כניסה לפרופיל אינסטגרם",
    bg: colors.primarySoft,
    iconColor: colors.primary,
    renderIcon: () => <Feather name="instagram" size={28} color={colors.primary} />,
  },
  {
    key: "facebook",
    url: "https://www.facebook.com/share/17YP65zVDC/?mibextid=wwXIfr",
    a11y: "פתיחת פייסבוק",
    bg: colors.primarySoft,
    iconColor: colors.primary,
    renderIcon: () => <Feather name="facebook" size={28} color={colors.primary} />,
  },
  {
    key: "email",
    url: "mailto:batchenlev@gmail.com",
    a11y: "שליחת מייל",
    bg: colors.primarySoft,
    iconColor: colors.primary,
    renderIcon: () => <Feather name="mail" size={28} color={colors.primary} />,
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

const CIRCLE = 60;
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
    <ScreenScaffold
      contentStyle={styles.scaffoldContent}
      topContent={
        <View style={styles.pageHeader}>
          <Text style={styles.title}>צור קשר</Text>
        </View>
      }
    >
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
                { backgroundColor: item.bg, borderColor: item.iconColor },
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
  pageHeader: {
    paddingBottom: spacing(1.5),
    alignItems: "center",
  },
  title: {
    fontFamily: typography.family.heading,
    fontSize: typography.size.xl,
    color: colors.primary,
    textAlign: "center",
  },
  container: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing(2),
    backgroundColor: colors.background,
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
    borderWidth: 1,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 1.05 }],
  },
});
