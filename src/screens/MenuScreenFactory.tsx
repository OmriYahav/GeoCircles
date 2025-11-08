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
import { useNavigation } from "expo-router";

import AnimatedMenuIcon from "../components/AnimatedMenuIcon";
import { colors, spacing, typography } from "../theme";
import { useMenu } from "../context/MenuContext";

export type MenuScreenConfig = {
  icon?: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
};

export function createMenuScreen(config: MenuScreenConfig) {
  function MenuScreen() {
    const navigation = useNavigation<any>();
    const { menuOpen, toggleMenu } = useMenu();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, [fadeAnim]);

    const handleMenuPress = useCallback(() => {
      if (typeof navigation?.toggleDrawer === "function") {
        navigation.toggleDrawer();
        return;
      }

      toggleMenu();
    }, [navigation, toggleMenu]);

    return (
      <LinearGradient colors={[colors.bgFrom, colors.bgTo]} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <Text style={styles.brand}>Sweet Balance</Text>
            <AnimatedMenuIcon open={menuOpen} onPress={handleMenuPress} />
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
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  brand: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
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
