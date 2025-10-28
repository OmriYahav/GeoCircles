import Constants from "expo-constants";

const appOwnership = Constants.appOwnership ?? "standalone";
const isExpoGo = appOwnership === "expo";

export const reactNativeMapsUnavailableReason = isExpoGo ? "expo-go" : null;

export const reactNativeMapsModule: typeof import("react-native-maps") | null =
  isExpoGo
    ? null
    : // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("react-native-maps");

export const isReactNativeMapsAvailable = reactNativeMapsModule != null;
