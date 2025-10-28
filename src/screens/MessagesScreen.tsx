import React, { useMemo } from "react";
import { FlatList, Keyboard, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Text } from "react-native-paper";
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import dayjs from "dayjs";

import { useChatConversations } from "../context/ChatConversationsContext";
import { useUserProfile } from "../context/UserProfileContext";
import { Colors } from "../../constants/theme";
import type {
  MessagesStackParamList,
  RootTabParamList,
} from "../navigation/AppNavigator";

export default function MessagesScreen() {
  const navigation =
    useNavigation<NavigationProp<MessagesStackParamList>>();
  const parentNavigation = navigation.getParent<NavigationProp<RootTabParamList>>();
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

  const handleBackToMap = () => {
    Keyboard.dismiss();
    parentNavigation?.navigate("Search", {
      screen: "Map",
    });
  };

  return (
    <FlatList
      data={sortedConversations}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={() => (
        <View style={styles.headerActions}>
          <Button mode="contained" onPress={handleBackToMap} style={styles.backButton}>
            Back to map
          </Button>
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
              navigation.navigate("Conversation", {
                conversationId: item.id,
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
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 18,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  emptyTitle: {
    fontWeight: "700",
    marginBottom: 6,
    color: Colors.light.text,
  },
  emptySubtitle: {
    color: Colors.light.icon,
  },
  card: {
    borderRadius: 18,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardAvatar: {
    backgroundColor: "#2563eb",
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
  },
  cardSubtitle: {
    marginTop: 6,
    color: Colors.light.icon,
  },
  cardMeta: {
    marginTop: 8,
    fontSize: 12,
    color: "rgba(17, 24, 39, 0.5)",
  },
  pendingBadge: {
    marginTop: 8,
    color: "#d97706",
    fontWeight: "600",
  },
});
