import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import {
  Avatar,
  Button,
  Chip,
  Divider,
  Text,
  TextInput,
  Surface,
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
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenScaffold from "../components/layout/ScreenScaffold";

export type ConversationScreenParams = {
  conversationId?: string | string[];
};

export default function ConversationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ConversationScreenParams>();
  const { profile } = useUserProfile();
  const { conversations, sendMessage, respondToJoinRequest, requestToJoin } =
    useChatConversations();
  const { nearbyBusiness } = useNearbyBusinessChat();

  const conversation = useMemo<Conversation | undefined>(
    () => {
      const conversationId = Array.isArray(params.conversationId)
        ? params.conversationId[0]
        : params.conversationId;
      if (!conversationId) {
        return undefined;
      }
      return conversations.find((item) => item.id === conversationId);
    },
    [conversations, params.conversationId]
  );

  const [messageDraft, setMessageDraft] = useState("");

  useEffect(() => {
    if (!conversation) {
      router.navigate({ pathname: "/(tabs)/messages" });
    }
  }, [conversation, router]);

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
    <ScreenScaffold variant="modal" contentStyle={styles.screenContent}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={120}
      >
        <Surface style={styles.headerSurface} elevation={2}>
          <Text style={styles.title}>{conversation.title}</Text>
          <Text style={styles.subtitle}>
            Hosted by {conversation.hostName} · {conversation.messages.length} messages
          </Text>
        </Surface>

        {nearbyBusiness && (
          <Surface style={styles.businessBanner} elevation={1}>
            <Text style={styles.businessBannerTitle}>
              You’re chatting near {nearbyBusiness.name}
            </Text>
            <Text style={styles.businessBannerHint}>
              Check the business chat to connect with other visitors and staff.
            </Text>
          </Surface>
        )}

        <Surface style={styles.metaSection} elevation={1}>
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
        </Surface>

        {pendingRequests.length > 0 && (
          <Surface style={styles.requestsSection} elevation={1}>
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
          </Surface>
        )}

        {!canSendMessages && !myRequest && (
          <Surface style={styles.joinBanner} elevation={1}>
            <Text style={styles.joinTitle}>Ask to join this chat</Text>
            <Text style={styles.joinSubtitle}>
              Only the host can approve new participants. Send a request and we will notify the host.
            </Text>
            <Button mode="contained" onPress={handleRequestJoin}>
              Request to join
            </Button>
          </Surface>
        )}

        {!canSendMessages && myRequest && (
          <Surface style={styles.joinBanner} elevation={1}>
            <Text style={styles.joinTitle}>Waiting for approval</Text>
            <Text style={styles.joinSubtitle}>
              {conversation.hostName} has received your request. You will be able to chat once it is approved.
            </Text>
          </Surface>
        )}

        <FlatList
          data={conversation.messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
        />

        <Surface style={styles.composer} elevation={5}>
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
        </Surface>
      </KeyboardAvoidingView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  headerSurface: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: Palette.surface,
    shadowColor: "rgba(15, 23, 42, 0.12)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 12,
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
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: Palette.surface,
    marginBottom: 12,
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
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: Palette.surface,
    marginBottom: 12,
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
    paddingHorizontal: 4,
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
    borderRadius: 24,
    marginTop: 12,
  },
  input: {
    maxHeight: 120,
  },
  businessBanner: {
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
