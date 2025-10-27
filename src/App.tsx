import React from "react";
import { Platform, StatusBar, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapScreen from "./screens/MapScreen";


export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
        backgroundColor={Platform.OS === "android" ? "#000" : undefined}
      />
      <ErrorBoundary>
        <MapScreen />
      </ErrorBoundary>
    </SafeAreaView>
  );
}

// Simple error boundary to catch rendering issues
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.error("App error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.center}>
          <StatusBar barStyle="light-content" />
          <Text style={{ color: "red", fontSize: 16 }}>
            Something went wrong 😕
          </Text>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
