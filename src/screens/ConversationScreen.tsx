import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
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
import { colors, radii, shadows, spacing, typography } from "../theme";
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
    <KeyboardAvoidingView
      style={styles.keyboardAvoider}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScreenScaffold variant="modal" contentStyle={styles.screenContent}>
          <View style={styles.container}>
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

            <View style={styles.messagesWrapper}>
              <FlatList
                data={conversation.messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
              />
            </View>

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
          </View>
        </ScreenScaffold>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoider: {
    flex: 1,
  },
  screenContent: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  headerSurface: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    ...shadows.md,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size.xl,
    fontFamily: typography.family.semiBold,
    color: colors.text.primary,
  },
  subtitle: {
    color: colors.text.secondary,
    marginTop: spacing.xs,
    fontFamily: typography.family.regular,
  },
  metaSection: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  metaTitle: {
    fontFamily: typography.family.medium,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  participantsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  requestsSection: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  requestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  requestName: {
    fontFamily: typography.family.medium,
    color: colors.text.primary,
  },
  requestTime: {
    color: colors.text.secondary,
    marginTop: spacing.xs / 2,
  },
  requestActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionDivider: {
    marginTop: spacing.sm,
  },
  messagesWrapper: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.lg,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  messageRowReverse: {
    flexDirection: "row-reverse",
  },
  bubble: {
    flex: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  myBubble: {
    backgroundColor: colors.primaryTint,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primarySoft,
  },
  otherBubble: {
    backgroundColor: colors.surface,
  },
  myAvatar: {
    backgroundColor: colors.primary,
  },
  otherAvatar: {
    backgroundColor: colors.secondary,
  },
  sender: {
    fontFamily: typography.family.medium,
    color: colors.text.primary,
  },
  messageText: {
    marginTop: spacing.xs,
    color: colors.text.secondary,
    fontFamily: typography.family.regular,
    lineHeight: typography.lineHeight.relaxed,
  },
  timestamp: {
    marginTop: spacing.sm,
    color: colors.text.muted,
    fontSize: typography.size.xs,
  },
  composer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? spacing.xxl : spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    gap: spacing.md,
    borderRadius: radii.xl,
    marginTop: spacing.lg,
  },
  input: {
    maxHeight: 120,
  },
  businessBanner: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
  },
  businessBannerTitle: {
    fontFamily: typography.family.medium,
    marginBottom: spacing.xs,
    color: colors.primary,
  },
  businessBannerHint: {
    color: colors.text.secondary,
    fontFamily: typography.family.regular,
  },
  joinBanner: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryTint,
  },
  joinTitle: {
    fontFamily: typography.family.semiBold,
    color: colors.text.primary,
  },
  joinSubtitle: {
    marginTop: spacing.xs,
    color: colors.text.muted,
    marginBottom: spacing.md,
    fontFamily: typography.family.regular,
  },
});
