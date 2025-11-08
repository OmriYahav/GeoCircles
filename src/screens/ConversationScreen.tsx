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
import { Button, IconButton, Text } from "react-native-paper";
import dayjs from "dayjs";

import {
  Conversation,
  JoinRequest,
  useChatConversations,
} from "../context/ChatConversationsContext";
import { useUserProfile } from "../context/UserProfileContext";
import { useNearbyBusinessChat } from "../context/BusinessContext";
import { colors, spacing, typography } from "../theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";

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
      router.navigate({ pathname: "/my-spots" });
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
    ({ item }: { item: Conversation["messages"][number] }) => (
      <ChatMessage message={item} isMine={item.senderId === profile.id} />
    ),
    [profile.id]
  );

  const insets = useSafeAreaInsets();

  if (!conversation) {
    return null;
  }

  const subtitle = `${conversation.participants.length} participants · Hosted by ${conversation.hostName}`;

  const listHeader = (
    <View style={styles.listHeader}>
      {nearbyBusiness && (
        <View style={styles.infoBlock}>
          <Text style={styles.infoTitle}>
            You’re chatting near {nearbyBusiness.name}
          </Text>
          <Text style={styles.infoDescription}>
            Check the business chat to connect with other visitors and staff.
          </Text>
        </View>
      )}
      {pendingRequests.length > 0 && (
        <View style={styles.infoBlock}>
          <Text style={styles.sectionTitle}>Join requests</Text>
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
        </View>
      )}
      {!canSendMessages && !myRequest && (
        <View style={styles.infoBlock}>
          <Text style={styles.sectionTitle}>Ask to join this chat</Text>
          <Text style={styles.infoDescription}>
            Only the host can approve new participants. Send a request and we will notify the host.
          </Text>
          <Button mode="contained" onPress={handleRequestJoin}>
            Request to join
          </Button>
        </View>
      )}
      {!canSendMessages && myRequest && (
        <View style={styles.infoBlock}>
          <Text style={styles.sectionTitle}>Waiting for approval</Text>
          <Text style={styles.infoDescription}>
            {conversation.hostName} has received your request. You will be able to chat once it is approved.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoider}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.safeArea}>
          <View style={[styles.header, { paddingTop: insets.top || spacing.md }]}>
            <IconButton
              icon="arrow-left"
              onPress={() => router.back()}
              style={styles.backButton}
              size={20}
            />
            <View style={styles.headerText}>
              <Text style={styles.title}>{conversation.title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </View>

          <View style={styles.content}>
            <FlatList
              data={conversation.messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={listHeader}
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              { paddingBottom: Math.max(insets.bottom, spacing.sm) },
            ]}
          >
            <ChatInput
              value={messageDraft}
              onChangeText={setMessageDraft}
              onSend={handleSendMessage}
              placeholder={
                canSendMessages
                  ? "Write a message..."
                  : "Join the conversation to send messages"
              }
              disabled={!canSendMessages}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoider: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  backButton: {
    margin: 0,
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.size.xl,
    fontFamily: typography.family.semiBold,
    color: colors.text.primary,
  },
  subtitle: {
    color: colors.text.secondary,
    fontFamily: typography.family.regular,
  },
  content: {
    flex: 1,
  },
  requestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
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
    gap: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  listHeader: {
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  infoBlock: {
    gap: spacing.xs,
  },
  infoTitle: {
    fontFamily: typography.family.medium,
    color: colors.text.primary,
  },
  infoDescription: {
    fontFamily: typography.family.regular,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.comfortable,
  },
  sectionTitle: {
    fontFamily: typography.family.medium,
    color: colors.text.primary,
  },
  inputContainer: {
    backgroundColor: colors.surface,
  },
});
