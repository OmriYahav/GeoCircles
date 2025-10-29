import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import {
  Avatar,
  Button,
  Chip,
  Divider,
  Text,
  TextInput,
} from "react-native-paper";
import dayjs from "dayjs";

import {
  Conversation,
  JoinRequest,
  useChatConversations,
} from "../context/ChatConversationsContext";
import { useUserProfile } from "../context/UserProfileContext";
import { useNearbyBusinessChat } from "../context/BusinessContext";
import { Colors, Palette } from "../../constants/theme";

export type ConversationScreenParams = {
  conversationId: string;
};

type ConversationRoute = RouteProp<
  { Conversation: ConversationScreenParams },
  "Conversation"
>;

export default function ConversationScreen() {
  const navigation = useNavigation();
  const route = useRoute<ConversationRoute>();
  const { profile } = useUserProfile();
  const { conversations, sendMessage, respondToJoinRequest, requestToJoin } =
    useChatConversations();
  const { nearbyBusiness } = useNearbyBusinessChat();

  const conversation = useMemo<Conversation | undefined>(
    () => conversations.find((item) => item.id === route.params.conversationId),
    [conversations, route.params.conversationId]
  );

  const [messageDraft, setMessageDraft] = useState("");

  useEffect(() => {
    if (!conversation) {
      navigation.goBack();
    }
  }, [conversation, navigation]);

  const isHost = conversation?.hostId === profile.id;
  const isParticipant = Boolean(
    conversation && conversation.participants.includes(profile.id)
  );

  const myRequest = useMemo<JoinRequest | undefined>(() => {
    if (!conversation) {
      return undefined;
    }
    return conversation.joinRequests.find(
      (item) => item.userId === profile.id && item.status === "pending"
    );
  }, [conversation, profile.id]);

  const canSendMessages = isHost || isParticipant;

  const pendingRequests = useMemo(
    () =>
      conversation && isHost
        ? conversation.joinRequests.filter((item) => item.status === "pending")
        : [],
    [conversation, isHost]
  );

  const handleApprove = useCallback(
    (requestId: string) => {
      if (!conversation) {
        return;
      }
      respondToJoinRequest({
        conversationId: conversation.id,
        requestId,
        approve: true,
      });
    },
    [conversation, respondToJoinRequest]
  );

  const handleReject = useCallback(
    (requestId: string) => {
      if (!conversation) {
        return;
      }
      respondToJoinRequest({
        conversationId: conversation.id,
        requestId,
        approve: false,
      });
    },
    [conversation, respondToJoinRequest]
  );

  const handleSendMessage = useCallback(() => {
    if (!conversation || !messageDraft.trim()) {
      return;
    }
    sendMessage({
      conversationId: conversation.id,
      sender: profile,
      text: messageDraft,
    });
    setMessageDraft("");
  }, [conversation, messageDraft, profile, sendMessage]);

  const handleRequestJoin = useCallback(() => {
    if (!conversation) {
      return;
    }
    requestToJoin({ conversationId: conversation.id, user: profile });
  }, [conversation, profile, requestToJoin]);

  const renderMessage = useCallback(
    ({ item }: { item: Conversation["messages"][number] }) => {
      const isMine = item.senderId === profile.id;
      return (
        <View
          style={[styles.messageRow, isMine && styles.messageRowReverse]}
        >
          <Avatar.Text
            size={38}
            label={item.senderName.slice(0, 2).toUpperCase()}
            style={isMine ? styles.myAvatar : styles.otherAvatar}
          />
          <View
            style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}
          >
            <Text style={styles.sender}>{item.senderName}</Text>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestamp}>{dayjs(item.sentAt).format("HH:mm")}</Text>
          </View>
        </View>
      );
    },
    [profile.id]
  );

  if (!conversation) {
    return null;
  }

  const participantsWithoutHost = conversation.participants.filter(
    (participantId) => participantId !== conversation.hostId
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={86}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{conversation.title}</Text>
          <Text style={styles.subtitle}>
            Hosted by {conversation.hostName} · {conversation.messages.length} messages
          </Text>
        </View>
        <Button mode="text" onPress={() => navigation.goBack()}>
          Close
        </Button>
      </View>

      {nearbyBusiness && (
        <View style={styles.businessBanner}>
          <Text style={styles.businessBannerTitle}>
            You’re chatting near {nearbyBusiness.name}
          </Text>
          <Text style={styles.businessBannerHint}>
            Check the business chat to connect with other visitors and staff.
          </Text>
        </View>
      )}

      <View style={styles.metaSection}>
        <Text style={styles.metaTitle}>Participants</Text>
        <View style={styles.participantsRow}>
          <Chip icon="account-circle">{conversation.hostName} (Host)</Chip>
          {participantsWithoutHost.length === 0 && (
            <Chip icon="account-plus" mode="outlined">
              Waiting for friends
            </Chip>
          )}
          {participantsWithoutHost.map((participantId) => {
            const joinRecord = conversation.joinRequests.find(
              (request) =>
                request.userId === participantId && request.status === "approved"
            );
            const label = joinRecord?.userName ?? "Member";
            return (
              <Chip key={participantId} icon="account-check">
                {label}
              </Chip>
            );
          })}
        </View>
      </View>

      {pendingRequests.length > 0 && (
        <View style={styles.requestsSection}>
          <Text style={styles.metaTitle}>Join requests</Text>
          {pendingRequests.map((request) => (
            <View key={request.id} style={styles.requestRow}>
              <View>
                <Text style={styles.requestName}>{request.userName}</Text>
                <Text style={styles.requestTime}>
                  Requested at {dayjs(request.requestedAt).format("HH:mm")}
                </Text>
              </View>
              <View style={styles.requestActions}>
                <Button
                  mode="contained"
                  compact
                  onPress={() => handleApprove(request.id)}
                >
                  Approve
                </Button>
                <Button
                  mode="text"
                  compact
                  onPress={() => handleReject(request.id)}
                >
                  Decline
                </Button>
              </View>
            </View>
          ))}
          <Divider style={styles.sectionDivider} />
        </View>
      )}

      {!canSendMessages && !myRequest && (
        <View style={styles.joinBanner}>
          <Text style={styles.joinTitle}>Ask to join this chat</Text>
          <Text style={styles.joinSubtitle}>
            Only the host can approve new participants. Send a request and we will notify the host.
          </Text>
          <Button mode="contained" onPress={handleRequestJoin}>
            Request to join
          </Button>
        </View>
      )}

      {!canSendMessages && myRequest && (
        <View style={styles.joinBanner}>
          <Text style={styles.joinTitle}>Waiting for approval</Text>
          <Text style={styles.joinSubtitle}>
            {conversation.hostName} has received your request. You will be able to chat once it is approved.
          </Text>
        </View>
      )}

      <FlatList
        data={conversation.messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.composer}>
        <TextInput
          value={messageDraft}
          onChangeText={setMessageDraft}
          mode="outlined"
          placeholder={
            canSendMessages
              ? "Write a message..."
              : "Join the conversation to send messages"
          }
          style={styles.input}
          multiline
          numberOfLines={3}
          editable={canSendMessages}
        />
        <Button
          mode="contained"
          onPress={handleSendMessage}
          disabled={!canSendMessages || !messageDraft.trim()}
        >
          Send
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.border,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.text,
  },
  subtitle: {
    color: Colors.light.icon,
    marginTop: 4,
  },
  metaSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  metaTitle: {
    fontWeight: "700",
    marginBottom: 8,
    color: Colors.light.text,
  },
  participantsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  requestsSection: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  requestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  requestName: {
    fontWeight: "600",
    color: Colors.light.text,
  },
  requestTime: {
    color: Colors.light.icon,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionDivider: {
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  messageRowReverse: {
    flexDirection: "row-reverse",
  },
  bubble: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    shadowColor: "rgba(15, 23, 42, 0.12)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },
  myBubble: {
    backgroundColor: Palette.primaryTint,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.primarySoft,
  },
  otherBubble: {
    backgroundColor: Palette.surface,
  },
  myAvatar: {
    backgroundColor: Palette.primary,
  },
  otherAvatar: {
    backgroundColor: Palette.accent,
  },
  sender: {
    fontWeight: "700",
    color: Colors.light.text,
  },
  messageText: {
    marginTop: 6,
    color: Palette.textSecondary,
  },
  timestamp: {
    marginTop: 10,
    color: Colors.light.icon,
    fontSize: 12,
  },
  composer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 18,
    backgroundColor: Palette.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.border,
    gap: 10,
  },
  input: {
    maxHeight: 120,
  },
  businessBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: Palette.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.primary,
  },
  businessBannerTitle: {
    fontWeight: "700",
    marginBottom: 4,
    color: Palette.primary,
  },
  businessBannerHint: {
    color: Palette.textSecondary,
  },
  joinBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: Palette.primaryTint,
  },
  joinTitle: {
    fontWeight: "700",
    color: Colors.light.text,
  },
  joinSubtitle: {
    marginTop: 6,
    color: Palette.textMuted,
    marginBottom: 12,
  },
});
