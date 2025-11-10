import React, { useCallback, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import AnimatedHomeButton from "../components/AnimatedHomeButton";
import HeaderRightMenuButton from "../components/HeaderRightMenuButton";
import SideMenuNew from "../components/SideMenuNew";
import { colors, gradients, spacing, typography, radius, shadows } from "../theme";
import { useMenu } from "../context/MenuContext";
import { menuRouteMap } from "../constants/menuRoutes";

type ContactItem = {
  key: string;
  icon: ImageSourcePropType;
  url: string;
  accessibilityLabel: string;
};

const CONTACT_ITEMS: ContactItem[] = [
  {
    key: "whatsapp",
    icon: require("../../photos/whatsapp.png"),
    url: "https://wa.me/972507117202",
    accessibilityLabel: "פתיחת שיחה בוואטסאפ עם בת חן",
  },
  {
    key: "facebook",
    icon: require("../../photos/facebook.png"),
    url: "https://www.facebook.com/share/17YP65zVDC/?mibextid=wwXIfr",
    accessibilityLabel: "מעבר לעמוד הפייסבוק של Sweet Balance",
  },
  {
    key: "instagram",
    icon: require("../../photos/instagram.png"),
    url: "https://www.instagram.com/batchen_naturopathy",
    accessibilityLabel: "מעבר לאינסטגרם של בת חן נטורופתיה",
  },
  {
    key: "mail",
    icon: require("../../photos/mail.png"),
    url: "mailto:batchenlev@gmail.com",
    accessibilityLabel: "שליחת מייל אל batchenlev@gmail.com",
  },
];

type ContactSectionLine = {
  text: string;
  url?: string;
};

type ContactSection = {
  key: string;
  title: string;
  description: string;
  lines: ContactSectionLine[];
};

const CONTACT_SECTIONS: ContactSection[] = [
  {
    key: "workshops",
    title: "סדנאות וטיפולים",
    description: "להצטרפות לסדנאות, טיפולים אישיים או קבוצתיים",
    lines: [
      { text: "📧 batchenlev@gmail.com", url: "mailto:batchenlev@gmail.com" },
      { text: "📞 050-7117202", url: "tel:+972507117202" },
      {
        text: "🌿 אינסטגרם: @batchen_naturopathy",
        url: "https://www.instagram.com/batchen_naturopathy",
      },
      {
        text: "🩶 פייסבוק: facebook.com/share/17YP65zVDC",
        url: "https://www.facebook.com/share/17YP65zVDC/?mibextid=wwXIfr",
      },
    ],
  },
  {
    key: "nutrition",
    title: "ייעוץ תזונתי ושאלות מקצועיות",
    description: "שאלות בנוגע למוצרים, סדנאות ותזונה",
    lines: [
      { text: "📧 batchenlev@gmail.com", url: "mailto:batchenlev@gmail.com" },
      { text: "ניתן גם ליצור קשר דרך הרשתות החברתיות" },
    ],
  },
  {
    key: "general",
    title: "פניות כלליות ומיקום",
    description: "נשמח לשוחח וללוות אתכם במסע לבריאות מאוזנת",
    lines: [
      { text: "📍 עמק יזרעאל, ישראל" },
      { text: "⏰ בתיאום אישי מראש" },
    ],
  },
];

export default function ContactScreenContent() {
  const router = useRouter();
  const { isOpen, open, close } = useMenu();
  const transition = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      Animated.timing(transition, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      return () => {
        Animated.timing(transition, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start();
      };
    }, [transition]),
  );

  const handleMenuPress = useCallback(() => {
    open();
  }, [open]);

  const handleHomePress = useCallback(() => {
    close();
    router.navigate("/");
  }, [close, router]);

  const handleContactPress = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.warn("Failed to open contact link", error);
    }
  }, []);

  const animatedCardStyle = {
    opacity: transition,
    transform: [
      {
        translateY: transition.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  } as const;

  return (
    <LinearGradient colors={gradients.primary} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <AnimatedHomeButton onPress={handleHomePress} />
          <Text style={styles.brand}>Sweet Balance</Text>
          <HeaderRightMenuButton onPress={handleMenuPress} expanded={isOpen} />
        </View>

        <View style={styles.contentWrapper}>
          <Animated.View style={[styles.card, animatedCardStyle]}>
            <Text style={styles.title}>צרו קשר</Text>

            <View style={styles.sectionsWrapper}>
              {CONTACT_SECTIONS.map((section, index) => (
                <View key={section.key} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionDescription}>{section.description}</Text>
                  <View style={styles.sectionLines}>
                    {section.lines.map((line) => {
                      if (!line.url) {
                        return (
                          <Text key={line.text} style={styles.sectionLine}>
                            {line.text}
                          </Text>
                        );
                      }

                      return (
                        <Pressable
                          key={line.text}
                          onPress={() => {
                            void handleContactPress(line.url);
                          }}
                          accessibilityRole="link"
                          accessibilityLabel={line.text}
                          style={({ pressed }) => (pressed ? styles.sectionLinePressed : undefined)}
                        >
                          <Text style={[styles.sectionLine, styles.sectionLineLink]}>{line.text}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {index < CONTACT_SECTIONS.length - 1 ? <View style={styles.sectionDivider} /> : null}
                </View>
              ))}
            </View>

            <View style={styles.socialWrapper}>
              <Text style={styles.socialLabel}>נשמח שתצרו קשר גם דרך</Text>
              <View style={styles.iconGrid}>
                {CONTACT_ITEMS.map((item) => (
                  <Pressable
                    key={item.key}
                    style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
                    accessibilityRole="button"
                    accessibilityLabel={item.accessibilityLabel}
                    onPress={() => {
                      void handleContactPress(item.url);
                    }}
                  >
                    <Image source={item.icon} style={styles.iconImage} resizeMode="cover" />
                  </Pressable>
                ))}
              </View>
            </View>
          </Animated.View>
        </View>
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
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(3),
  },
  card: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(3),
    alignItems: "stretch",
    gap: spacing(2.5),
    ...shadows.lg,
  },
  title: {
    color: colors.primary,
    fontSize: typography.title,
    fontFamily: typography.family.heading,
    textAlign: "center",
  },
  sectionsWrapper: {
    gap: spacing(2),
  },
  section: {
    gap: spacing(1.5),
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: typography.size.lg,
    fontFamily: typography.family.semiBold,
    textAlign: "right",
  },
  sectionDescription: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.relaxed,
    textAlign: "right",
    fontFamily: typography.fontFamily,
  },
  sectionLines: {
    gap: spacing(0.75),
  },
  sectionLine: {
    color: colors.text,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.relaxed,
    textAlign: "right",
    fontFamily: typography.family.regular,
  },
  sectionLineLink: {
    color: colors.primary,
  },
  sectionLinePressed: {
    opacity: 0.7,
  },
  sectionDivider: {
    marginTop: spacing(2),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DADFD8",
  },
  socialWrapper: {
    alignItems: "stretch",
    gap: spacing(1.5),
  },
  socialLabel: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
    textAlign: "right",
    fontFamily: typography.family.medium,
    letterSpacing: 0.2,
  },
  iconGrid: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  iconButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.buttonBg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...shadows.sm,
  },
  iconButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  iconImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});
