import { type MenuRouteName } from "../context/MenuContext";

export const menuRouteMap: Record<MenuRouteName, string> = {
  Recipes: "/(drawer)/recipes",
  Workshops: "/(drawer)/workshops",
  Treatments: "/(drawer)/treatments",
  Blog: "/(drawer)/blog",
  Tips: "/(drawer)/tips",
};

export const menuRouteParams: Partial<Record<MenuRouteName, object>> = {};
