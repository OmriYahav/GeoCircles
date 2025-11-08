import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import ScreenScaffold from "../components/layout/ScreenScaffold";
import { colors, radii, shadows, spacing, typography } from "../theme";

type PreviewItem = {
  id: string;
  icon: string;
  label: string;
  description: string;
};

const PREVIEW_ITEMS: PreviewItem[] = [
  {
    id: "recipes",
    icon: "🧁",
    label: "מתכונים בריאים",
    description:
      "קינוחים מאוזנים ומאפים מזינים שנבנו בקפידה לשגרה מתוקה ובריאה.",
  },
  {
    id: "workshops",
    icon: "🥄",
    label: "סדנאות",
    description:
      "מפגשים אינטימיים ללמידה חווייתית עם מדריכות מתמחות וקהילה מחבקת.",
  },
  {
    id: "treatments",
    icon: "🌿",
    label: "טיפולים",
    description:
      "ליווי אישי ומדויק שמאזן בין הגוף לנפש ומעניק אנרגיה מחודשת.",
  },
  {
    id: "nutrition",
    icon: "🍃",
    label: "עצות תזונה",
    description:
      "טיפים קטנים לשינויים גדולים בשגרת היומיום שלך וברווחה הכללית.",
  },
  {
    id: "blog",
    icon: "📝",
    label: "בלוג",
    description:
      "השראה, ידע מקצועי וסיפורים מתוקים מהקהילה שלנו ברחבי הארץ.",
  },
];

export default function HomeScreen() {
  const previewItems = useMemo(() => PREVIEW_ITEMS.slice(0, 4), []);

  return (
    <ScreenScaffold contentStyle={styles.screenContent}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Sweet Balance</Text>
          <Text style={styles.heroSubtitle}>איזון רך לחיים מלאים</Text>
        </View>

        <View style={styles.introSection}>
          <Text style={styles.introParagraph}>
            ברוכה הבאה ל-Sweet Balance – מקום שבו טעם, תזונה ורגעים של רוגע נפגשים.
            בתפריט שלנו מחכה לך אוסף עשיר של מתכונים, סדנאות, טיפולים ותכנים מעוררי
            השראה שיעזרו לך לבנות שגרה בריאה ונעימה.
          </Text>
          <Text style={styles.introParagraph}>
            תוכלי לנווט לכל חלקי האפליקציה באמצעות תפריט ההמבורגר שבחלק העליון.
            אספנו עבורך טעימה קטנה מתוך התכנים שחיכו לך בסל הקניות הרגוע שלנו:
          </Text>
        </View>

        <View style={styles.previewList}>
          {previewItems.map((item) => (
            <View key={item.id} style={styles.previewCard}>
              <View style={styles.previewTextWrapper}>
                <Text style={styles.previewTitle}>{item.label}</Text>
                <Text style={styles.previewDescription}>{item.description}</Text>
              </View>
              <View style={styles.previewIconWrapper}>
                <Text style={styles.previewIcon}>{item.icon}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.callout}>
          <Text style={styles.calloutTitle}>הכול נמצא בהישג יד</Text>
          <Text style={styles.calloutBody}>
            פתחי את התפריט בכל רגע, בחרי את התחום שמסקרן אותך ותני לעצמך מקום של
            הקשבה, איזון והשראה. אנחנו כאן כדי ללוות אותך בצעדים קטנים ומתוקים לכל
            אורך הדרך.
          </Text>
        </View>
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    paddingHorizontal: 0,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xxl,
  },
  hero: {
    alignItems: "center",
    gap: spacing.xs,
  },
  heroTitle: {
    fontFamily: typography.family.heading,
    fontSize: typography.size.xxl,
    color: colors.text.primary,
  },
  heroSubtitle: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    color: colors.text.secondary,
  },
  introSection: {
    gap: spacing.md,
    writingDirection: "rtl",
  },
  introParagraph: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.relaxed,
    color: colors.text.primary,
    textAlign: "right",
  },
  previewList: {
    gap: spacing.lg,
  },
  previewCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    ...shadows.sm,
    writingDirection: "rtl",
  },
  previewTextWrapper: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  previewTitle: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.lg,
    color: colors.text.primary,
    textAlign: "right",
  },
  previewDescription: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.comfy,
    textAlign: "right",
  },
  previewIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  previewIcon: {
    fontSize: typography.size.xl,
  },
  callout: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
    ...shadows.sm,
    writingDirection: "rtl",
  },
  calloutTitle: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.lg,
    color: colors.text.primary,
    textAlign: "right",
  },
  calloutBody: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed,
    textAlign: "right",
  },
});
