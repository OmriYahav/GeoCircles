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

import { Colors, Palette } from "../../constants/theme";

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
        color={Colors.light.icon}
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
        placeholderTextColor="rgba(60, 60, 67, 0.6)"
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
          <ActivityIndicator size="small" color={Colors.light.tint} />
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
            <Ionicons name="mic-outline" size={18} color={Colors.light.icon} />
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
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: Palette.surface,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 2,
  },
  leadingIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 0,
  },
  trailingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonPressed: {
    backgroundColor: Palette.primaryTint,
  },
});
