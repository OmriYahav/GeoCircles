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

  if (FILE_PATH) {
    try {
      const info = await FileSystem.getInfoAsync(FILE_PATH);
      if (info.exists) {
        const raw = await FileSystem.readAsStringAsync(FILE_PATH);
        const parsed = ensureArray(JSON.parse(raw));
        if (parsed) {
          return parsed;
        }
      } else {
        await FileSystem.writeAsStringAsync(FILE_PATH, JSON.stringify(baseRecipes, null, 2));
      }
    } catch {
      // Ignore file read/write issues and fall back to AsyncStorage/default recipes.
    }
  }

  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = ensureArray(JSON.parse(stored));
      if (parsed) {
        return mergeRecipes(baseRecipes, parsed);
      }
    }
  } catch {
    // Ignore storage read issues and fall back to bundled recipes.
  }

  return baseRecipes;
};

export const saveRecipes = async (recipes: Recipe[]) => {
  if (FILE_PATH) {
    try {
      await FileSystem.writeAsStringAsync(FILE_PATH, JSON.stringify(recipes, null, 2));
    } catch {
      // Continue to persist via AsyncStorage even if the file write fails.
    }
  }

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch {
    // Ignore storage write failures to avoid blocking the UI.
  }
};
