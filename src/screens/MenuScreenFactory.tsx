import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import AnimatedHomeButton from "../components/AnimatedHomeButton";
import HeaderRightMenuButton from "../components/HeaderRightMenuButton";
import SideMenuNew from "../components/SideMenuNew";
import { colors, spacing, typography } from "../theme";
import { useMenu } from "../context/MenuContext";
import { menuRouteMap } from "../constants/menuRoutes";

export type MenuScreenConfig = {
  icon?: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
};

export function createMenuScreen(config: MenuScreenConfig) {
  function MenuScreen() {
    const router = useRouter();
    const { isOpen, open, close } = useMenu();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, [fadeAnim]);

    const handleMenuPress = useCallback(() => {
      open();
    }, [open]);

    const handleHomePress = useCallback(() => {
      close();
      router.navigate("/");
    }, [close, router]);

    return (
      <LinearGradient colors={[colors.bgFrom, colors.bgTo]} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <AnimatedHomeButton onPress={handleHomePress} />
            <Text style={styles.brand}>Sweet Balance</Text>
            <HeaderRightMenuButton onPress={handleMenuPress} expanded={isOpen} />
          </View>

          <Animated.View style={[styles.animatedContent, { opacity: fadeAnim }]}>
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {config.icon ? <Text style={styles.icon}>{config.icon}</Text> : null}
              <Text style={styles.title}>{config.title}</Text>
              <Text style={styles.subtitle}>{config.subtitle}</Text>
              {config.paragraphs.map((paragraph) => (
                <Text key={paragraph} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}
            </ScrollView>
          </Animated.View>
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

  return MenuScreen;
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
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
  animatedContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(4),
    gap: spacing(1.5),
    alignItems: "flex-end",
  },
  icon: {
    fontSize: typography.title,
  },
  title: {
    color: colors.primary,
    fontSize: typography.title,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
  subtitle: {
    color: colors.subtitle,
    fontSize: typography.subtitle,
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
  paragraph: {
    width: "100%",
    color: colors.text,
    fontSize: typography.body,
    lineHeight: typography.body * 1.6,
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
});

export default createMenuScreen;
