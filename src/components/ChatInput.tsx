import React, { useCallback } from "react";
import { Keyboard, StyleSheet, TextInput, View } from "react-native";
import { IconButton } from "react-native-paper";

import { colors, radii, spacing } from "../theme";

type ChatInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder: string;
  disabled?: boolean;
};

export default function ChatInput({
  value,
  onChangeText,
  onSend,
  placeholder,
  disabled = false,
}: ChatInputProps) {
  const handleSend = useCallback(() => {
    if (disabled || !value.trim()) {
      return;
    }
    onSend();
    Keyboard.dismiss();
  }, [disabled, onSend, value]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          style={styles.input}
          multiline
          textAlignVertical="top"
          returnKeyType="send"
          onSubmitEditing={handleSend}
          editable={!disabled}
        />
        <IconButton
          icon="send"
          size={20}
          onPress={handleSend}
          disabled={disabled || !value.trim()}
          style={styles.sendButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    fontSize: 16,
    color: colors.text.primary,
    paddingRight: spacing.sm,
  },
  sendButton: {
    margin: 0,
  },
});
