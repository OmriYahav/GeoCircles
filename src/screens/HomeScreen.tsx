import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRouter } from "expo-router";

import AnimatedMenuIcon from "../components/AnimatedMenuIcon";
import Card from "../components/Card";
import CTAButton from "../components/CTAButton";
import ScrollToTopButton from "../components/ScrollToTopButton";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import ThisMonthSection from "../components/ThisMonthSection";
import { colors, spacing, typography } from "../theme";
import { useMenu } from "../context/MenuContext";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { menuOpen, toggleMenu, closeMenu } = useMenu();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowScrollTop(event.nativeEvent.contentOffset.y > 240);
  };

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

  const navigateTo = (path: string) => {
    closeMenu();
    router.push(path);
  };

  return (
    <LinearGradient colors={[colors.bgFrom, colors.bgTo]} style={styles.gradient}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.brand}>Sweet Balance</Text>
          <AnimatedMenuIcon
            open={menuOpen}
            onPress={handleMenuPress}
          />
        </View>

        <Animated.View style={[styles.animatedContent, { opacity: fadeAnim }]}>
          <ScrollView
            ref={scrollRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={styles.heroTitle}>Sweet Balance</Text>
            <Text style={styles.heroSubtitle}>איזון רך לחיים מלאים</Text>
            <Text style={styles.heroBody}>
              ברוכה הבאה ל-Sweet Balance — מקום של טעם, תזונה ורגעי רוגע. בתפריט מחכה לך
              אוסף עשיר של מתכונים, סדנאות, טיפולים ותכנים מעוררי השראה.
            </Text>

            <CTAButton
              title="🍃 גלי את הסדנאות"
              onPress={() => navigateTo("/(drawer)/workshops")}
            />

            <View style={styles.cardsSection}>
              <Card
                title="מתכונים בריאים"
                subtitle="קינוחים מאזנים, ארוחות קלילות ומשביעות"
                onPress={() => navigateTo("/(drawer)/recipes")}
              />
              <Card
                title="סדנאות"
                subtitle="לוח סדנאות קרובות + שריון מקום"
                onPress={() => navigateTo("/(drawer)/workshops")}
              />
              <Card
                title="טיפולים"
                subtitle="מפגשים אישיים וקבוצתיים"
                onPress={() => navigateTo("/(drawer)/treatments")}
              />
              <Card
                title="עצות תזונה"
                subtitle="מדריכים קצרים ופרקטיים"
                onPress={() => navigateTo("/(drawer)/nutrition-tips")}
              />
              <Card
                title="בלוג"
                subtitle="מאמרים, תובנות והשראה"
                onPress={() => navigateTo("/(drawer)/blog")}
              />
            </View>

            <View style={styles.sectionSpacing}>
              <ThisMonthSection onReserve={() => navigateTo("/(drawer)/workshops")} />
            </View>

            <View style={styles.sectionSpacing}>
              <Text style={styles.sectionTitle}>מה אומרים עלינו</Text>
              <TestimonialsCarousel
                items={[
                  { name: "שירי", quote: "האווירה נעימה וכל מתכון הצליח לי בבית." },
                  { name: "נועה", quote: "סדנאות מקצועיות עם טיפים שאפשר ליישם מייד." },
                  { name: "דנה", quote: "מצאתי איזון עדין שמחזיק לאורך זמן." },
                ]}
              />
            </View>
          </ScrollView>
        </Animated.View>

        <ScrollToTopButton
          visible={showScrollTop}
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing(2),
    paddingTop: spacing(1),
    paddingBottom: spacing(1),
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
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
    paddingBottom: spacing(6),
    gap: spacing(2),
  },
  heroTitle: {
    color: colors.primary,
    fontSize: typography.title,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
    marginBottom: spacing(0.5),
    textAlign: "right",
  },
  heroSubtitle: {
    color: colors.subtitle,
    fontSize: typography.subtitle,
    marginBottom: spacing(1),
    textAlign: "right",
  },
  heroBody: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: typography.body * 1.6,
    fontFamily: typography.fontFamily,
    marginBottom: spacing(2),
    textAlign: "right",
  },
  cardsSection: {
    marginTop: spacing(3),
  },
  sectionSpacing: {
    marginTop: spacing(3),
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
    marginBottom: spacing(1),
    textAlign: "right",
  },
});
