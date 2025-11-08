import { type MenuRouteName } from "../context/MenuContext";

export const menuRouteMap: Record<MenuRouteName, string> = {
  Recipes: "/(drawer)/recipes",
  Workshops: "/(drawer)/workshops",
  Treatments: "/(drawer)/treatments",
  Tips: "/(drawer)/nutrition-tips",
  Blog: "/(drawer)/blog",
  Contact: "/(drawer)/contact",
};

export const menuRouteParams: Partial<Record<MenuRouteName, object>> = {};
