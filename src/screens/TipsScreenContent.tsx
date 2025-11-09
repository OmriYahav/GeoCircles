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

const TIPS = [
  {
    title: "בוקר מאוזן",
    description:
      "פתחי את היום במים חמימים עם טיפה של לימון, נשימה עמוקה ורשימת כוונות קטנה. זה עוזר לגוף להתעורר בעדינות ומכניס אותך למצב של הקשבה עצמית.",
  },
  {
    title: "הפסקות נשימה",
    description:
      "קבעי לעצמך תזכורת לעצור שלוש פעמים ביום. סגרי את העיניים, קחי חמש נשימות עמוקות ושאלי את עצמך מה הגוף מבקש עכשיו — תנועה, מים או פשוט רגע של שקט.",
  },
  {
    title: "צלחת צבעונית",
    description:
      "בכל ארוחה הוסיפי מרכיב ירוק, מרכיב כתום ומרכיב מלא. הגיוון מאפשר קבלת ויטמינים ומינרלים בצורה מאוזנת ומוסיף שמחה לצלחת.",
  },
  {
    title: "שגרת ערב",
    description:
      "לפני השינה כבי מסכים, הדליקי נר ריחני או שמן אתרי לבנדר וכתבי שלושה דברים קטנים שהיו נעימים היום. הגוף יודה לך על הירידה הרכה לקראת שינה עמוקה.",
  },
];

export default function TipsScreenContent() {
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
            <Text style={styles.screenTitle}>טיפים</Text>
            <Text style={styles.screenSubtitle}>צעדים קטנים שמזכירים לגוף להיות רגוע</Text>
            {TIPS.map((tip) => (
              <View key={tip.title} style={styles.tipCard}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
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
  tipCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing(2),
    padding: spacing(2),
    gap: spacing(0.5),
    elevation: 2,
  },
  tipTitle: {
    color: colors.primary,
    fontSize: typography.size.lg,
    fontFamily: typography.family.semiBold,
    textAlign: "right",
  },
  tipDescription: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: typography.body * 1.6,
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
});
