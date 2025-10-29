import React, { useMemo } from "react";
import { FlatList, Keyboard, StyleSheet, View } from "react-native";
import { Avatar, Card, Text } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import dayjs from "dayjs";

import { useChatConversations } from "../context/ChatConversationsContext";
import { useUserProfile } from "../context/UserProfileContext";
import BackToMapButton from "../components/BackToMapButton";
import { Palette } from "../../constants/theme";
import ScreenScaffold from "../components/layout/ScreenScaffold";

export default function MessagesScreen() {
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
        ListHeaderComponent={() => (
          <View style={styles.headerActions}>
            <BackToMapButton style={styles.backButton} />
          </View>
        )}
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
    backgroundColor: Palette.background,
  },
  list: {
    padding: 20,
    gap: 18,
  },
  headerActions: {
    marginBottom: 12,
    alignItems: "flex-end",
  },
  backButton: {
    borderRadius: 12,
  },
  emptyCard: {
    borderRadius: 20,
    backgroundColor: Palette.surface,
    shadowColor: "rgba(15, 23, 42, 0.14)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 4,
  },
  emptyTitle: {
    fontWeight: "700",
    marginBottom: 6,
    color: Palette.textPrimary,
  },
  emptySubtitle: {
    color: Palette.textMuted,
  },
  card: {
    borderRadius: 20,
    backgroundColor: Palette.surface,
    shadowColor: "rgba(15, 23, 42, 0.12)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardAvatar: {
    backgroundColor: Palette.primary,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  cardSubtitle: {
    marginTop: 6,
    color: Palette.textSecondary,
  },
  cardMeta: {
    marginTop: 8,
    fontSize: 12,
    color: Palette.textMuted,
  },
  pendingBadge: {
    marginTop: 8,
    color: Palette.accent,
    fontWeight: "600",
  },
});
