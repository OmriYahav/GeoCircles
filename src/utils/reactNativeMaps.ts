import Constants from "expo-constants";

const appOwnership = Constants.appOwnership ?? "standalone";
const isExpoGo = appOwnership === "expo";

let reactNativeMaps: typeof import("react-native-maps") | null = null;
let unavailableReason: "expo-go" | "not-installed" | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  reactNativeMaps = require("react-native-maps");
} catch (error) {
  if (__DEV__) {
    console.warn("react-native-maps could not be loaded", error);
  }

  if (isExpoGo) {
    unavailableReason = "expo-go";
  } else {
    unavailableReason = "not-installed";
  }
}

export const reactNativeMapsUnavailableReason = unavailableReason;

export const reactNativeMapsModule = reactNativeMaps;

export const isReactNativeMapsAvailable = reactNativeMapsModule != null;
