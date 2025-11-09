import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Animated,
  Image,
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
import ScrollToTopButton from "../components/ScrollToTopButton";
import SideMenuNew from "../components/SideMenuNew";
import { colors, spacing, typography } from "../theme";
import { useMenu } from "../context/MenuContext";
import { menuRouteMap } from "../constants/menuRoutes";

const homeLogo = require("../photos/batchen.jpg");

export default function HomeScreen() {
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const { isOpen, open, close } = useMenu();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowScrollTop(event.nativeEvent.contentOffset.y > 240);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const parallaxTranslate = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  const parallaxScale = scrollY.interpolate({
    inputRange: [-150, 0, 150],
    outputRange: [1.3, 1, 0.9],
    extrapolate: "clamp",
  });

  const handleMenuPress = useCallback(() => {
    open();
  }, [open]);

  const handleHomePress = useCallback(() => {
    close();
    router.navigate("/");
  }, [close, router]);

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
          <Animated.ScrollView
            ref={scrollRef}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true, listener: handleScroll },
            )}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={styles.heroTitle}>איזון רך לחיים מלאים</Text>
            <Text style={styles.heroDescription}>
              ברוכה הבאה ל-Sweet Balance — מקום של רוגע, ריפוי והרמוניה. כאן תמצאי טיפול
              בפרחי באך, שמנים אתריים והדרכה לאיזון גוף ונפש.
            </Text>

            <Animated.View
              style={[
                styles.parallaxContainer,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
              ]}
            >
              <Animated.View
                style={[
                  styles.parallaxInner,
                  {
                    transform: [
                      { translateY: parallaxTranslate },
                      { scale: parallaxScale },
                    ],
                  },
                ]}
              >
                <View
                  style={{
                    width: "100%",
                    aspectRatio: 1,
                    borderRadius: 12,
                    overflow: "hidden",
                    backgroundColor: "#f4e9db",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={homeLogo}
                    style={{
                      width: "100%",
                      height: "100%",
                      resizeMode: "cover",
                      borderRadius: 12,
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  />
                </View>
              </Animated.View>
            </Animated.View>

            <View style={styles.descriptionWrapper}>
              <Text style={styles.descriptionText}>
                השילוב בין פרחי באך לשמנים אתריים מאפשר ריפוי עדין, טבעי ומאוזן — חיבור בין
                הגוף, הרגש והנפש. כל תמצית וכל שמן נבחרים בקפידה כדי לסייע לך לשחרר מתחים,
                לחזק אנרגיה פנימית ולהביא שלווה ורוגע ביום יום.
              </Text>

              <Text style={styles.descriptionText}>
                בטיפולים האישיים שלנו תיהני מתהליך ריפוי מותאם אישית, תוך שילוב של מגע, ריח,
                אנרגיה והקשבה לגוף ולנפש.
              </Text>
            </View>
          </Animated.ScrollView>
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
    alignItems: "center",
  },
  heroTitle: {
    color: colors.primary,
    fontSize: typography.size.xxl,
    fontFamily: typography.fontFamily,
    fontWeight: "700",
    textAlign: "center",
  },
  heroDescription: {
    color: colors.subtitle,
    fontSize: typography.body,
    lineHeight: typography.body * 1.6,
    fontFamily: typography.fontFamily,
    textAlign: "center",
  },
  parallaxContainer: {
    width: "100%",
    borderRadius: spacing(2.5),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    alignItems: "center",
  },
  parallaxInner: {
    width: "100%",
    height: 260,
  },
  descriptionWrapper: {
    gap: spacing(1.5),
    paddingHorizontal: spacing(0.5),
  },
  descriptionText: {
    color: colors.subtitle,
    fontSize: typography.body,
    lineHeight: typography.body * 1.6,
    fontFamily: typography.fontFamily,
    textAlign: "center",
  },
});
