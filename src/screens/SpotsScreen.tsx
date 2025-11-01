import React, { useMemo } from "react";
import { FlatList, Keyboard, StyleSheet, View } from "react-native";
import { Avatar, Card, Text } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import dayjs from "dayjs";

import { useChatConversations } from "../context/ChatConversationsContext";
import { useUserProfile } from "../context/UserProfileContext";
import ScreenScaffold from "../components/layout/ScreenScaffold";
import { colors, radii, shadows, spacing, typography } from "../theme";

export default function SpotsScreen() {
  const router = useRouter();
  const { conversations } = useChatConversations();
  const { profile } = useUserProfile();

  useFocusEffect(
    React.useCallback(() => {
      Keyboard.dismiss();
      return undefined;
    }, [])
  );

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort((a, b) => b.createdAt - a.createdAt),
    [conversations]
  );

  return (
    <ScreenScaffold contentStyle={styles.screenContent}>
      <FlatList
        style={styles.container}
        data={sortedConversations}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No chats yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                Tap anywhere on the map to start a group conversation and invite friends.
              </Text>
            </Card.Content>
          </Card>
        )}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const lastMessage = item.messages[item.messages.length - 1];
          const pendingRequests = item.joinRequests.filter(
            (request) => request.status === "pending"
          );
          const isHost = item.hostId === profile.id;
          const lastMessageText = lastMessage
            ? `${lastMessage.senderName}: ${lastMessage.text}`
            : "No messages yet";

          return (
            <Card
              style={styles.card}
              onPress={() =>
                router.navigate({
                  pathname: "/conversation/[conversationId]",
                  params: { conversationId: item.id },
                })
              }
            >
              <Card.Content style={styles.cardContent}>
                <Avatar.Text
                  size={48}
                  label={item.title.slice(0, 2).toUpperCase()}
                  style={styles.cardAvatar}
                />
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{lastMessageText}</Text>
                  <Text style={styles.cardMeta}>
                    {dayjs(item.createdAt).format("MMM D, HH:mm")} · Host: {item.hostName}
                  </Text>
                  {isHost && pendingRequests.length > 0 && (
                    <Text style={styles.pendingBadge}>
                      {pendingRequests.length} pending join request
                      {pendingRequests.length > 1 ? "s" : ""}
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          );
        }}
      />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
    gap: spacing.lg,
  },
  emptyCard: {
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  emptyTitle: {
    fontFamily: typography.family.semiBold,
    marginBottom: spacing.xs,
    color: colors.text.primary,
    fontSize: typography.size.lg,
  },
  emptySubtitle: {
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed,
  },
  card: {
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  cardAvatar: {
    backgroundColor: colors.primary,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.semiBold,
    color: colors.text.primary,
  },
  cardSubtitle: {
    marginTop: spacing.xs,
    color: colors.text.secondary,
    fontFamily: typography.family.regular,
  },
  cardMeta: {
    marginTop: spacing.sm,
    fontSize: typography.size.xs,
    color: colors.text.muted,
  },
  pendingBadge: {
    marginTop: spacing.sm,
    color: colors.secondary,
    fontFamily: typography.family.medium,
  },
});
