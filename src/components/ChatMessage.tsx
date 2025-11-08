import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Text } from "react-native-paper";
import dayjs from "dayjs";

import { colors, radii, spacing, typography } from "../theme";
import type { Conversation } from "../context/ChatConversationsContext";

type ChatMessageProps = {
  message: Conversation["messages"][number];
  isMine: boolean;
};

export default function ChatMessage({ message, isMine }: ChatMessageProps) {
  const senderInitials = useMemo(
    () => message.senderName.slice(0, 2).toUpperCase(),
    [message.senderName]
  );

  return (
    <View style={[styles.row, isMine && styles.rowReverse]}>
      <Avatar.Text
        size={34}
        label={senderInitials}
        style={[styles.avatar, isMine ? styles.myAvatar : styles.otherAvatar]}
      />
      <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
        {!isMine && <Text style={styles.sender}>{message.senderName}</Text>}
        <Text style={styles.message}>{message.text}</Text>
        <Text style={styles.timestamp}>{dayjs(message.sentAt).format("HH:mm")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  rowReverse: {
    flexDirection: "row-reverse",
  },
  avatar: {
    backgroundColor: colors.secondary,
  },
  myAvatar: {
    backgroundColor: colors.primary,
  },
  otherAvatar: {
    backgroundColor: colors.secondary,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  myBubble: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primarySoft,
  },
  otherBubble: {
    backgroundColor: colors.surface,
  },
  sender: {
    fontFamily: typography.family.medium,
    color: colors.subtitle,
    marginBottom: spacing.xs,
  },
  message: {
    color: colors.text,
    fontFamily: typography.family.regular,
    lineHeight: typography.lineHeight.relaxed,
  },
  timestamp: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    color: colors.textMuted,
    alignSelf: "flex-end",
  },
});
