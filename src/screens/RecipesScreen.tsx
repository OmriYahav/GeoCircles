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
import { useNavigation, useRouter } from "expo-router";

import AnimatedHomeButton from "../components/AnimatedHomeButton";
import AnimatedMenuIcon from "../components/AnimatedMenuIcon";
import { colors, spacing, typography } from "../theme";
import { useMenu } from "../context/MenuContext";

const PARAGRAPHS = [
  "אנו בוחרים עבורך חומרי גלם עונתיים, משלבים תבלינים עדינים ומייצרים קינוחים קלים לצד מאפים מלוחים מזינים.",
  "בכל מתכון תמצאי חלופות ללא גלוטן, הצעות להמתקה טבעית וטיפים להגשה שמעצימים את החוויה המשפחתית.",
  "התפריט מתעדכן מדי שבוע ופתוח לגמרי לשינויים שתבקשי לפי הטעמים האישיים שלך.",
];

export default function RecipesScreen() {
  const navigation = useNavigation<any>();
  const router = useRouter();
  const { menuOpen, toggleMenu, closeMenu } = useMenu();
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

  const handleHomePress = useCallback(() => {
    closeMenu();
    router.navigate("/");
  }, [closeMenu, router]);

  return (
    <LinearGradient colors={[colors.bgFrom, colors.bgTo]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <AnimatedHomeButton onPress={handleHomePress} />
          <Text style={styles.brand}>Sweet Balance</Text>
          <AnimatedMenuIcon open={menuOpen} onPress={handleMenuPress} />
        </View>

        <Animated.View style={[styles.animatedContent, { opacity: fadeAnim }]}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.screenTitle}>מתכונים בריאים</Text>
            <Text style={styles.screenSubtitle}>איזון של טעם ותזונה בכל ביס</Text>
            {PARAGRAPHS.map((paragraph) => (
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
