import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  I18nManager,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";

import ScreenScaffold from "../components/layout/ScreenScaffold";
import { colors, shadows, spacing, typography } from "../theme";

type ContactMethod = {
  key: string;
  label: string;
  url: string;
  colors: string[];
  pressedColors: string[];
  icon: keyof typeof FontAwesome.glyphMap;
};

const brightenColor = (hex: string, amount = 0.15) => {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return hex;
  }

  const num = parseInt(normalized, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;

  const liftChannel = (channel: number) =>
    Math.min(255, Math.round(channel + (255 - channel) * amount));

  const toHex = (channel: number) => channel.toString(16).padStart(2, "0");

  return `#${toHex(liftChannel(r))}${toHex(liftChannel(g))}${toHex(
    liftChannel(b),
  )}`.toUpperCase();
};

const lightenGradient = (baseColors: string[]) =>
  baseColors.map((color) => brightenColor(color, 0.18));

const CONTACT_METHODS: ContactMethod[] = [
  {
    key: "whatsapp",
    label: "וואצאפ 💬",
    url: "https://wa.me/972XXXXXXXXX",
    colors: ["#25D366", "#25D366"],
    pressedColors: lightenGradient(["#25D366", "#25D366"]),
    icon: "whatsapp",
  },
  {
    key: "facebook",
    label: "פייסבוק 📘",
    url: "https://www.facebook.com/yourpage",
    colors: ["#1877F2", "#1877F2"],
    pressedColors: lightenGradient(["#1877F2", "#1877F2"]),
    icon: "facebook",
  },
  {
    key: "instagram",
    label: "אינסטגרם 📷",
    url: "https://www.instagram.com/yourprofile",
    colors: ["#F58529", "#DD2A7B", "#8134AF", "#515BD4"],
    pressedColors: lightenGradient([
      "#F58529",
      "#DD2A7B",
      "#8134AF",
      "#515BD4",
    ]),
    icon: "instagram",
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ContactButtonProps = {
  method: ContactMethod;
};

const ContactButton = ({ method }: ContactButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressFeedback = useCallback(() => {
    scale.stopAnimation(() => {
      scale.setValue(1);
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 150,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 150,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [scale]);

  const handlePress = useCallback(() => {
    Linking.openURL(method.url).catch((error) => {
      console.warn(`Failed to open contact url: ${method.url}`, error);
    });
  }, [method.url]);

  const gradientOrientation = useMemo(
    () => ({
      start: { x: I18nManager.isRTL ? 1 : 0, y: 0.5 },
      end: { x: I18nManager.isRTL ? 0 : 1, y: 0.5 },
    }),
    [],
  );

  return (
    <Animated.View
      style={[
        styles.buttonWrapper,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={method.label}
        accessibilityHint="פתיחה בקישור חיצוני"
        onPressIn={handlePressFeedback}
        onPress={handlePress}
        style={styles.button}
      >
        {({ pressed }) => (
          <LinearGradient
            colors={pressed ? method.pressedColors : method.colors}
            start={gradientOrientation.start}
            end={gradientOrientation.end}
            style={styles.buttonGradient}
          >
            <View style={styles.buttonContent}>
              <FontAwesome
                name={method.icon}
                size={30}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>{method.label}</Text>
            </View>
          </LinearGradient>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
};

const ContactScreen = () => {
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const animatedStyle = useMemo(
    () => ({
      opacity: entrance,
      transform: [
        {
          translateX: entrance.interpolate({
            inputRange: [0, 1],
            outputRange: [48, 0],
          }),
        },
      ],
    }),
    [entrance],
  );

  return (
    <ScreenScaffold contentStyle={styles.scaffoldContent}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.mainContent}>
          <View style={styles.header}>
            <Text style={styles.title}>צרו קשר</Text>
            <Text style={styles.subtitle}>
              שלחנו אהבה בכל אחד מהערוצים הבאים
            </Text>
          </View>
          <View style={styles.buttonsContainer}>
            {CONTACT_METHODS.map((method) => (
              <ContactButton key={method.key} method={method} />
            ))}
          </View>
        </View>
        <Text style={styles.footer}>נשמח לשמוע מכם 💚</Text>
      </Animated.View>
    </ScreenScaffold>
  );
};

export default ContactScreen;

const styles = StyleSheet.create({
  scaffoldContent: {
    flex: 1,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mainContent: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxl,
  },
  header: {
    alignItems: "center",
    gap: spacing.xs,
  },
  title: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.xxl,
    color: colors.primary,
    textAlign: "center",
    writingDirection: "rtl",
  },
  subtitle: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
    color: colors.subtitle,
    textAlign: "center",
    writingDirection: "rtl",
  },
  buttonsContainer: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "stretch",
  },
  buttonWrapper: {
    marginVertical: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    ...shadows.lg,
  },
  button: {
    borderRadius: 20,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  buttonIcon: {
    marginTop: -2,
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: typography.family.bold,
    fontSize: typography.size.lg,
    fontWeight: "700",
    textAlign: "center",
    writingDirection: "rtl",
  },
  footer: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
    color: "#4C8052",
    fontStyle: "italic",
    textAlign: "center",
    writingDirection: "rtl",
  },
});
