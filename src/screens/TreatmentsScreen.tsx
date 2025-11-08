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

const PARAGRAPHS = [
  "במפגשי הטיפול נעמיק בהקשבה לגוף ונבנה תוכנית המשלבת תזונה, תנועה וטכניקות הרפיה מותאמות.",
  "הקליניקה מציעה פגישות אחד על אחד, ליווי מרחוק ובדיקות מעקב שמבטיחות שהגוף מקבל את כל מה שהוא צריך.",
  "כל טיפול מתחיל בשיחה פתוחה וממשיך בבחירה משותפת של הקצב והיעדים שמתאימים לך באמת.",
];

export default function TreatmentsScreen() {
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
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.screenTitle}>טיפולים</Text>
            <Text style={styles.screenSubtitle}>מגע אישי וקשוב לצרכים שלך</Text>
            {PARAGRAPHS.map((paragraph) => (
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
  },
  screenTitle: {
    color: colors.primary,
    fontSize: typography.title,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
  screenSubtitle: {
    color: colors.subtitle,
    fontSize: typography.subtitle,
    fontFamily: typography.fontFamily,
    textAlign: "right",
    marginBottom: spacing(1),
  },
  paragraph: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: typography.body * 1.6,
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
});
