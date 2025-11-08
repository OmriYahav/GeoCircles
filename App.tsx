import { I18nManager, Platform } from "react-native";

if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
  if (Platform.OS === "android") {
    // No explicit restart required in this environment.
  }
}

export { default } from "./app/_layout";
