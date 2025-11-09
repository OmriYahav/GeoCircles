import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

import AnimatedHomeButton from "../components/AnimatedHomeButton";
import HeaderRightMenuButton from "../components/HeaderRightMenuButton";
import SideMenuNew from "../components/SideMenuNew";
import { colors, spacing, typography } from "../theme";
import { useMenu } from "../context/MenuContext";
import { menuRouteMap } from "../constants/menuRoutes";
import { loadRecipes, Recipe, saveRecipes } from "../utils/recipesStorage";

const PARAGRAPHS = [
  "אנו בוחרים עבורך חומרי גלם עונתיים, משלבים תבלינים עדינים ומייצרים קינוחים קלים לצד מאפים מלוחים מזינים.",
  "בכל מתכון תמצאי חלופות ללא גלוטן, הצעות להמתקה טבעית וטיפים להגשה שמעצימים את החוויה המשפחתית.",
  "התפריט מתעדכן מדי שבוע ופתוח לגמרי לשינויים שתבקשי לפי הטעמים האישיים שלך.",
];

export default function RecipesScreen() {
  const router = useRouter();
  const { isOpen, open, close } = useMenu();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [nutrition, setNutrition] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    let mounted = true;

    const fetchRecipes = async () => {
      try {
        const loaded = await loadRecipes();
        if (mounted) {
          setRecipes(loaded);
        }
      } catch (error) {
        console.warn("Failed to load recipes", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRecipes();

    return () => {
      mounted = false;
    };
  }, []);

  const handleMenuPress = useCallback(() => {
    open();
  }, [open]);

  const handleHomePress = useCallback(() => {
    close();
    router.navigate("/");
  }, [close, router]);

  const handleSecretTap = useCallback(() => {
    setIsAdmin((prev) => !prev);
  }, []);

  const handleRecipePress = useCallback(
    (recipe: Recipe) => {
      router.push({
        pathname: "/(drawer)/recipe-details",
        params: {
          id: String(recipe.id),
          title: recipe.title,
          image: recipe.image,
          ingredients: JSON.stringify(recipe.ingredients),
          instructions: JSON.stringify(recipe.instructions),
          nutrition: recipe.nutrition ?? "",
        },
      });
    },
    [router]
  );

  const resetForm = useCallback(() => {
    setTitle("");
    setImage("");
    setIngredients("");
    setInstructions("");
    setNutrition("");
  }, []);

  const parsedFormValues = useMemo(() => {
    const parseLines = (value: string) =>
      value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    return {
      title: title.trim(),
      image: image.trim(),
      ingredients: parseLines(ingredients),
      instructions: parseLines(instructions),
      nutrition: nutrition.trim(),
    };
  }, [ingredients, instructions, image, nutrition, title]);

  const handleSaveRecipe = useCallback(async () => {
    if (!parsedFormValues.title || parsedFormValues.ingredients.length === 0 || parsedFormValues.instructions.length === 0) {
      return;
    }

    setIsSaving(true);
    try {
      const newRecipe: Recipe = {
        id: Date.now(),
        title: parsedFormValues.title,
        image:
          parsedFormValues.image ||
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
        ingredients: parsedFormValues.ingredients,
        instructions: parsedFormValues.instructions,
        nutrition: parsedFormValues.nutrition || "",
      };

      const updated = [...recipes, newRecipe];
      setRecipes(updated);
      await saveRecipes(updated);
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.warn("Failed to save recipe", error);
    } finally {
      setIsSaving(false);
    }
  }, [parsedFormValues, recipes, resetForm]);

  return (
    <LinearGradient colors={[colors.bgFrom, colors.bgTo]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <AnimatedHomeButton onPress={handleHomePress} />
          <Pressable
            style={styles.brandPressable}
            onLongPress={handleSecretTap}
            hitSlop={12}
            android_ripple={{ color: "transparent" }}
          >
            <Text style={styles.brand}>Sweet Balance</Text>
          </Pressable>
          <HeaderRightMenuButton onPress={handleMenuPress} expanded={isOpen} />
        </View>

        {isAdmin && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Admin Mode ✅</Text>
          </View>
        )}

        <Animated.View style={[styles.animatedContent, { opacity: fadeAnim }]}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.screenTitle}>מתכונים בריאים</Text>
            <Text style={styles.screenSubtitle}>איזון של טעם ותזונה בכל ביס</Text>
            {PARAGRAPHS.map((paragraph) => (
              <Text key={paragraph} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}

            <View style={styles.recipeSectionHeader}>
              <Text style={styles.sectionTitle}>המתכונים שלנו</Text>
              <Text style={styles.sectionSubtitle}>הצעות עדינות לאיזון מושלם לאורך היום</Text>
            </View>

            {isLoading ? (
              <View style={styles.loaderWrapper}>
                <ActivityIndicator color={colors.primary} size="small" />
              </View>
            ) : (
              <View style={styles.recipeList}>
                {recipes.map((recipe) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={styles.recipeCard}
                    activeOpacity={0.9}
                    onPress={() => handleRecipePress(recipe)}
                  >
                    <Image source={{ uri: recipe.image }} style={styles.recipeImage} contentFit="cover" />
                    <View style={styles.recipeContent}>
                      <Text style={styles.recipeTitle}>{recipe.title}</Text>

                      <Text style={styles.recipeLabel}>מרכיבים</Text>
                      {recipe.ingredients.map((item, index) => (
                        <Text key={`${recipe.id}-ingredient-${index}`} style={styles.recipeText}>
                          • {item}
                        </Text>
                      ))}

                      <Text style={[styles.recipeLabel, styles.recipeLabelSpacing]}>אופן הכנה</Text>
                      {recipe.instructions.map((step, index) => (
                        <Text key={`${recipe.id}-instruction-${index}`} style={styles.recipeText}>
                          {index + 1}. {step}
                        </Text>
                      ))}

                      {recipe.nutrition ? (
                        <View style={styles.nutritionTag}>
                          <Text style={styles.nutritionText}>{recipe.nutrition}</Text>
                        </View>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </SafeAreaView>

      {isAdmin && (
        <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => setShowModal(true)}>
          <Text style={styles.fabIcon}>➕</Text>
          <Text style={styles.fabLabel}>הוסף מתכון חדש</Text>
        </TouchableOpacity>
      )}

      <Modal animationType="slide" transparent visible={showModal} onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: "padding", android: undefined })}
            style={styles.modalWrapper}
          >
            <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.formTitle}>הוסף מתכון חדש</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="שם המתכון 🍲"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
              <TextInput
                value={image}
                onChangeText={setImage}
                placeholder="קישור לתמונה"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
              <TextInput
                value={ingredients}
                onChangeText={setIngredients}
                placeholder="מרכיבים (הפרד בשורה)"
                placeholderTextColor={colors.textMuted}
                multiline
                style={[styles.input, styles.multiline]}
              />
              <TextInput
                value={instructions}
                onChangeText={setInstructions}
                placeholder="אופן הכנה (הפרד בשורה)"
                placeholderTextColor={colors.textMuted}
                multiline
                style={[styles.input, styles.multiline]}
              />
              <TextInput
                value={nutrition}
                onChangeText={setNutrition}
                placeholder="הערך התזונתי"
                placeholderTextColor={colors.textMuted}
                multiline
                style={[styles.input, styles.multiline]}
              />
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={[styles.saveButton, styles.cancelButton]}
                  onPress={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  <Text style={[styles.saveText, styles.cancelText]}>ביטול</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveRecipe}
                  disabled={isSaving}
                  activeOpacity={0.85}
                >
                  <Text style={styles.saveText}>{isSaving ? "שומר..." : "שמור מתכון"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

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
    textAlign: "center",
  },
  brandPressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  adminBadge: {
    alignSelf: "center",
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.5),
    borderRadius: spacing(2),
    marginBottom: spacing(1),
  },
  adminBadgeText: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: typography.small,
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
  recipeSectionHeader: {
    marginTop: spacing(2),
    gap: spacing(0.5),
    alignItems: "flex-end",
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
  },
  sectionSubtitle: {
    color: colors.subtitle,
    fontSize: typography.body,
    fontFamily: typography.fontFamily,
  },
  loaderWrapper: {
    marginTop: spacing(2),
    alignItems: "center",
  },
  recipeList: {
    gap: spacing(2),
    marginTop: spacing(1.5),
  },
  recipeCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing(2.5),
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  recipeImage: {
    width: "100%",
    height: 180,
  },
  recipeContent: {
    padding: spacing(2),
    gap: spacing(1),
  },
  recipeTitle: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontFamily: typography.fontFamily,
    fontWeight: "700",
    textAlign: "right",
  },
  recipeLabel: {
    color: colors.primary,
    fontSize: typography.body,
    fontFamily: typography.fontFamily,
    fontWeight: "600",
    textAlign: "right",
  },
  recipeLabelSpacing: {
    marginTop: spacing(1),
  },
  recipeText: {
    color: colors.text,
    fontSize: typography.body,
    fontFamily: typography.fontFamily,
    textAlign: "right",
    lineHeight: typography.body * 1.5,
  },
  nutritionTag: {
    alignSelf: "flex-end",
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.5),
    borderRadius: spacing(2),
  },
  nutritionText: {
    color: colors.primary,
    fontSize: typography.small,
    fontFamily: typography.fontFamily,
  },
  fab: {
    position: "absolute",
    bottom: spacing(3),
    right: spacing(2),
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    borderRadius: spacing(3),
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1),
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  fabIcon: {
    fontSize: typography.subtitle,
    color: colors.primary,
  },
  fabLabel: {
    fontSize: typography.body,
    color: colors.primary,
    fontFamily: typography.fontFamily,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: spacing(2),
  },
  modalWrapper: {
    backgroundColor: colors.surface,
    borderRadius: spacing(2.5),
    maxHeight: "90%",
    overflow: "hidden",
    width: "100%",
  },
  formContainer: {
    padding: spacing(2),
    gap: spacing(1.5),
  },
  formTitle: {
    fontSize: typography.subtitle,
    fontFamily: typography.fontFamily,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing(1.5),
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1),
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  formActions: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: spacing(1),
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: spacing(2),
    paddingVertical: spacing(1.2),
    alignItems: "center",
  },
  saveText: {
    color: colors.textInverse,
    fontFamily: typography.fontFamily,
    fontSize: typography.body,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    color: colors.primary,
  },
});
