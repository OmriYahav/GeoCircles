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
    url: "https://wa.me/0507117202",
    accessibilityLabel: "פתיחת שיחה בוואצאפ עם Sweet Balance",
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
    url: "https://www.instagram.com/batchenlev",
    accessibilityLabel: "מעבר לאינסטגרם של Sweet Balance",
  },
  {
    key: "mail",
    icon: require("../../photos/mail.png"),
    url: "mailto:batchenlev@gmail.com",
    accessibilityLabel: "שליחת מייל אל batchenlev@gmail.com",
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
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(2.5),
    alignItems: "center",
    gap: spacing(2),
    ...shadows.lg,
  },
  title: {
    color: colors.primary,
    fontSize: typography.title,
    fontFamily: typography.family.heading,
    textAlign: "center",
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
