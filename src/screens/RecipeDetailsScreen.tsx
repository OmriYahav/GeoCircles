import React, { useMemo } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";

import { colors, spacing, typography } from "../theme";

type ParamValue = string | string[] | undefined;

type RecipeParams = {
  title?: ParamValue;
  image?: ParamValue;
  ingredients?: ParamValue;
  instructions?: ParamValue;
  nutrition?: ParamValue;
};

const ensureString = (value: ParamValue) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return typeof value === "string" ? value : undefined;
};

const parseListParam = (value: ParamValue) => {
  const raw = ensureString(value);
  if (!raw) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    // Ignore JSON parsing errors and fallback to manual parsing.
  }

  return raw
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export default function RecipeDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<RecipeParams>();

  const title = ensureString(params.title);
  const image = ensureString(params.image);
  const nutrition = ensureString(params.nutrition);

  const ingredients = useMemo(() => parseListParam(params.ingredients), [params.ingredients]);
  const instructions = useMemo(() => parseListParam(params.instructions), [params.instructions]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.backButtonText}>← חזרה</Text>
        </TouchableOpacity>

        {title ? <Text style={styles.title}>{title}</Text> : null}

        {image ? <Image source={{ uri: image }} style={styles.image} contentFit="cover" /> : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>מרכיבים</Text>
          {ingredients.length > 0 ? (
            ingredients.map((item, index) => (
              <Text key={`${index}-${item}`} style={styles.sectionText}>
                • {item}
              </Text>
            ))
          ) : (
            <Text style={styles.emptyText}>רשימת מרכיבים לא זמינה.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>אופן הכנה</Text>
          {instructions.length > 0 ? (
            instructions.map((step, index) => (
              <Text key={`${index}-${step}`} style={styles.sectionText}>
                {index + 1}. {step}
              </Text>
            ))
          ) : (
            <Text style={styles.emptyText}>שלבי הכנה לא זמינים.</Text>
          )}
        </View>

        {nutrition ? (
          <View style={styles.nutrition}>
            <Text style={styles.nutritionTitle}>הערך התזונתי</Text>
            <Text style={styles.nutritionText}>{nutrition}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(4),
    gap: spacing(2.5),
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
    borderRadius: spacing(2),
  },
  backButtonText: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: typography.body,
  },
  title: {
    color: colors.primary,
    fontSize: typography.title,
    fontFamily: typography.fontFamily,
    fontWeight: "700",
    textAlign: "right",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: spacing(2),
    overflow: "hidden",
  },
  section: {
    gap: spacing(1),
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontFamily: typography.fontFamily,
    fontWeight: "600",
    textAlign: "right",
  },
  sectionText: {
    color: colors.text,
    fontSize: typography.body,
    fontFamily: typography.fontFamily,
    textAlign: "right",
    lineHeight: typography.body * 1.5,
  },
  emptyText: {
    color: colors.subtitle,
    fontSize: typography.body,
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
  nutrition: {
    backgroundColor: colors.primarySoft,
    padding: spacing(2),
    borderRadius: spacing(2),
    gap: spacing(0.5),
  },
  nutritionTitle: {
    color: colors.primary,
    fontSize: typography.body,
    fontFamily: typography.fontFamily,
    fontWeight: "600",
    textAlign: "right",
  },
  nutritionText: {
    color: colors.primary,
    fontSize: typography.body,
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
});
