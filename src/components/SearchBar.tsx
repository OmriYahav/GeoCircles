import React, { forwardRef, useImperativeHandle, useRef } from "react";
import {
  ActivityIndicator,
  I18nManager,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputSubmitEditingEventData,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radii, shadows, spacing, typography } from "../theme";

export type SearchBarHandle = {
  focus: () => void;
  blur: () => void;
};

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: (text: string) => void;
  onMicPress?: () => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  isLoading?: boolean;
};

const SearchBar = (
  {
    value,
    onChangeText,
    onSubmit,
    onMicPress,
    placeholder = "Search the map",
    onFocus,
    onBlur,
    isLoading,
  }: SearchBarProps,
  ref: React.Ref<SearchBarHandle>
) => {
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = (
    event: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => {
    const text = event.nativeEvent.text ?? value;
    onSubmit(text);
  };

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
    <View style={styles.container}>
      <Ionicons
        name="search-outline"
        size={18}
        color={colors.text.muted}
        style={styles.leadingIcon}
        accessible={false}
      />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmit}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        style={[
          styles.input,
          { textAlign: I18nManager.isRTL ? "right" : "left" },
        ]}
        accessibilityLabel="Search the map"
      />
      <View style={styles.trailingContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : null}
        {onMicPress ? (
          <Pressable
            onPress={onMicPress}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Voice search"
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
          >
            <Ionicons name="mic-outline" size={18} color={colors.text.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default forwardRef<SearchBarHandle, SearchBarProps>(SearchBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    ...shadows.sm,
    zIndex: 2,
  },
  leadingIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontFamily: typography.family.medium,
    paddingVertical: 0,
  },
  trailingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonPressed: {
    backgroundColor: colors.primaryTint,
  },
});
