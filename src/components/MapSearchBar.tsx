import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Colors } from "../../constants/theme";

type MapSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  onMicPress?: () => void;
  isLoading?: boolean;
  autoFocus?: boolean;
};

export type MapSearchBarHandle = {
  focus: () => void;
  blur: () => void;
};

const MapSearchBar = (
  {
    value,
    onChangeText,
    onSubmitEditing,
    onFocus,
    placeholder = "Search the map",
    onMicPress,
    isLoading,
    autoFocus,
  }: MapSearchBarProps,
  ref: React.Ref<MapSearchBarHandle>
) => {
  const inputRef = useRef<TextInput>(null);
  const focusAnimation = useSharedValue(0);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    focusAnimation.value = withTiming(1, { duration: 180 });
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    focusAnimation.value = withTiming(0, { duration: 200 });
    setIsFocused(false);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(focusAnimation.value, [0, 1], [0.1, 0.25]),
    transform: [
      {
        scale: interpolate(focusAnimation.value, [0, 1], [1, 1.01]),
      },
    ],
  }));

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        inputRef.current?.focus();
      },
      blur() {
        inputRef.current?.blur();
      },
    }),
    []
  );

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.leadingIconContainer}>
        <Ionicons name="search-outline" size={20} color={Colors.light.icon} />
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor="rgba(60, 60, 67, 0.6)"
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        autoFocus={autoFocus}
      />
      <View style={styles.trailingIcons}>
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.light.tint} />
        ) : (
          <>
            <Pressable
              accessibilityLabel="Voice search"
              onPress={onMicPress}
              hitSlop={12}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconPressed,
              ]}
            >
              <Ionicons name="mic-outline" size={18} color={Colors.light.icon} />
            </Pressable>
            {isFocused && (
              <Pressable
                accessibilityLabel="Hide keyboard"
                onPress={() => {
                  inputRef.current?.blur();
                  Keyboard.dismiss();
                }}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconPressed,
                ]}
              >
                <Ionicons
                  name="chevron-down-outline"
                  size={18}
                  color={Colors.light.icon}
                />
              </Pressable>
            )}
          </>
        )}
      </View>
    </Animated.View>
  );
};

export default forwardRef<MapSearchBarHandle, MapSearchBarProps>(MapSearchBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 10,
  },
  leadingIconContainer: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 0,
    marginHorizontal: 8,
  },
  trailingIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
});
