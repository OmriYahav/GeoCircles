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
import { Button, Text } from "react-native-paper";
import dayjs from "dayjs";

import {
  Conversation,
  JoinRequest,
  useChatConversations,
} from "../context/ChatConversationsContext";
import { useUserProfile } from "../context/UserProfileContext";
import { useNearbyBusinessChat } from "../context/BusinessContext";
import { colors, spacing, typography } from "../theme";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import AnimatedHomeButton from "../components/AnimatedHomeButton";
import AnimatedLeafMenuIcon from "../components/AnimatedLeafMenuIcon";
import { useMenu } from "../context/MenuContext";

export type ConversationScreenParams = {
  conversationId?: string | string[];
};

export default function ConversationScreen() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const params = useLocalSearchParams<ConversationScreenParams>();
  const { profile } = useUserProfile();
  const { conversations, sendMessage, respondToJoinRequest, requestToJoin } =
    useChatConversations();
  const { nearbyBusiness } = useNearbyBusinessChat();
  const { menuOpen, toggleMenu, closeMenu } = useMenu();

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

  const handleMenuPress = useCallback(() => {
    if (typeof navigation?.toggleDrawer === "function") {
      navigation.toggleDrawer();
      return;
    }

    toggleMenu();
  }, [navigation, toggleMenu]);

  const handleHomePress = useCallback(() => {
    closeMenu();
    router.navigate("/");
  }, [closeMenu, router]);

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
            <AnimatedHomeButton onPress={handleHomePress} />
            <View style={styles.headerText}>
              <Text style={styles.title}>{conversation.title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <AnimatedLeafMenuIcon
              open={menuOpen}
              onPress={handleMenuPress}
              accessibilityState={{ expanded: menuOpen }}
            />
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
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    zIndex: 40,
  },
  headerText: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.size.xl,
    fontFamily: typography.family.semiBold,
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    color: colors.subtitle,
    fontFamily: typography.family.regular,
    textAlign: "center",
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
    color: colors.text,
  },
  requestTime: {
    color: colors.subtitle,
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
    color: colors.text,
  },
  infoDescription: {
    fontFamily: typography.family.regular,
    color: colors.subtitle,
    lineHeight: typography.lineHeight.comfortable,
  },
  sectionTitle: {
    fontFamily: typography.family.medium,
    color: colors.text,
  },
  inputContainer: {
    backgroundColor: colors.surface,
  },
});
