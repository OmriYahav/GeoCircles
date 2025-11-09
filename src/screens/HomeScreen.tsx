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
import { useRouter } from "expo-router";
import AnimatedHomeButton from "../components/AnimatedHomeButton";
import HeaderRightMenuButton from "../components/HeaderRightMenuButton";
import Card from "../components/Card";
import ScrollToTopButton from "../components/ScrollToTopButton";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import ThisMonthSection from "../components/ThisMonthSection";
import SideMenuNew from "../components/SideMenuNew";
import { colors, spacing, typography } from "../theme";
import { useMenu } from "../context/MenuContext";
import { menuRouteMap } from "../constants/menuRoutes";

export default function HomeScreen() {
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { isOpen, open, close } = useMenu();

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
    open();
  }, [open]);

  const handleHomePress = useCallback(() => {
    close();
    router.navigate("/");
  }, [close, router]);

  const navigateTo = useCallback(
    (path: string) => {
      close();
      router.navigate(path);
    },
    [close, router],
  );

  return (
    <LinearGradient colors={[colors.bgFrom, colors.bgTo]} style={styles.gradient}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <AnimatedHomeButton onPress={handleHomePress} />
          <Text style={styles.brand}>Sweet Balance</Text>
          <HeaderRightMenuButton onPress={handleMenuPress} expanded={isOpen} />
        </View>

        <Animated.View style={[styles.animatedContent, { opacity: fadeAnim }]}>
          <ScrollView
            ref={scrollRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={styles.heroSubtitle}>איזון רך לחיים מלאים</Text>
            <Text style={styles.heroBody}>
              ברוכה הבאה ל-Sweet Balance — מקום של טעם, תזונה ורגעי רוגע. בתפריט מחכה לך
              אוסף עשיר של מתכונים, סדנאות, טיפולים ותכנים מעוררי השראה.
            </Text>

            <View style={styles.cardsSection}>
              <Card
                title="מתכונים בריאים"
                subtitle="קינוחים מאזנים, ארוחות קלילות ומשביעות"
                icon="coffee"
                onPress={() => navigateTo(menuRouteMap.Recipes)}
              />
              <Card
                title="סדנאות"
                subtitle="לוח סדנאות קרובות + שריון מקום"
                icon="users"
                onPress={() => navigateTo(menuRouteMap.Workshops)}
              />
              <Card
                title="טיפולים"
                subtitle="מפגשים אישיים וקבוצתיים"
                icon="leaf"
                onPress={() => navigateTo(menuRouteMap.Treatments)}
              />
              <Card
                title="בלוג"
                subtitle="מאמרים, תובנות והשראה"
                icon="feather"
                onPress={() => navigateTo(menuRouteMap.Blog)}
              />
            </View>

            <View style={styles.sectionSpacing}>
              <ThisMonthSection onReserve={() => navigateTo(menuRouteMap.Workshops)} />
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
  animatedContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(4),
    gap: spacing(2),
  },
  heroSubtitle: {
    color: colors.primary,
    fontSize: typography.size.xxl,
    fontFamily: typography.fontFamily,
    fontWeight: "700",
    textAlign: "right",
  },
  heroBody: {
    color: colors.subtitle,
    fontSize: typography.body,
    lineHeight: typography.body * 1.6,
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
  cardsSection: {
    gap: spacing(1.5),
    marginTop: spacing(1),
  },
  sectionSpacing: {
    marginTop: spacing(2),
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: typography.title,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
    textAlign: "right",
    marginBottom: spacing(1),
  },
});
