import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

import defaultRecipes from "../data/recipes.json";

type RawRecipe = (typeof defaultRecipes)[number];

export type Recipe = RawRecipe & { id: number };

const STORAGE_KEY = "sweet-balance:recipes";
const resolveDocumentDirectory = (): string | null => {
  const directory = (FileSystem as { documentDirectory?: string | null }).documentDirectory;
  return directory ?? null;
};

const FILE_PATH = (() => {
  const directory = resolveDocumentDirectory();
  return directory ? `${directory}recipes.json` : null;
})();

const ensureArray = (value: unknown): Recipe[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }
  return value.filter((item): item is Recipe =>
    item && typeof item === "object" && typeof item.id === "number" && typeof item.title === "string"
  );
};

const mergeRecipes = (base: Recipe[], additions: Recipe[]) => {
  const map = new Map<number, Recipe>();
  base.forEach((recipe) => {
    map.set(recipe.id, recipe);
  });
  additions.forEach((recipe) => {
    map.set(recipe.id, recipe);
  });
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
};

export const loadRecipes = async (): Promise<Recipe[]> => {
  const baseRecipes = defaultRecipes as Recipe[];

  try {
    const info = FILE_PATH ? await FileSystem.getInfoAsync(FILE_PATH) : { exists: false };
    if (info.exists) {
      const raw = await FileSystem.readAsStringAsync(FILE_PATH);
      const parsed = ensureArray(JSON.parse(raw));
      if (parsed) {
        return parsed;
      }
    } else if (FILE_PATH) {
      await FileSystem.writeAsStringAsync(FILE_PATH, JSON.stringify(baseRecipes, null, 2));
    }
  } catch (error) {
    console.warn("Recipes file access failed, falling back to AsyncStorage", error);
  }

  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = ensureArray(JSON.parse(stored));
      if (parsed) {
        return mergeRecipes(baseRecipes, parsed);
      }
    }
  } catch (error) {
    console.warn("Recipes AsyncStorage read failed", error);
  }

  return baseRecipes;
};

export const saveRecipes = async (recipes: Recipe[]) => {
  try {
    if (FILE_PATH) {
      await FileSystem.writeAsStringAsync(FILE_PATH, JSON.stringify(recipes, null, 2));
    }
  } catch (error) {
    console.warn("Recipes file write failed, persisting to AsyncStorage", error);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    return;
  }

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch (error) {
    console.warn("Recipes AsyncStorage write failed", error);
  }
};
