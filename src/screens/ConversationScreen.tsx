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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import AnimatedHomeButton from "../components/AnimatedHomeButton";
import HeaderRightMenuButton from "../components/HeaderRightMenuButton";
import SideMenuNew from "../components/SideMenuNew";
import { useMenu } from "../context/MenuContext";
import { menuRouteMap } from "../constants/menuRoutes";

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
  const { isOpen, open, close } = useMenu();

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
    [conversations, params.conversationId],
  );

  const [messageDraft, setMessageDraft] = useState("");

  useEffect(() => {
    if (!conversation) {
      router.navigate({ pathname: "/my-spots" });
    }
  }, [conversation, router]);

  const isHost = conversation?.hostId === profile.id;
  const isParticipant = Boolean(
    conversation && conversation.participants.includes(profile.id),
  );

  const myRequest = useMemo<JoinRequest | undefined>(() => {
    if (!conversation) {
      return undefined;
    }
    return conversation.joinRequests.find(
      (item) => item.userId === profile.id && item.status === "pending",
    );
  }, [conversation, profile.id]);

  const canSendMessages = isHost || isParticipant;

  const pendingRequests = useMemo(
    () =>
      conversation && isHost
        ? conversation.joinRequests.filter((item) => item.status === "pending")
        : [],
    [conversation, isHost],
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
    [conversation, respondToJoinRequest],
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
    [conversation, respondToJoinRequest],
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
    [profile.id],
  );

  const insets = useSafeAreaInsets();

  const handleMenuPress = useCallback(() => {
    open();
  }, [open]);

  const handleHomePress = useCallback(() => {
    close();
    router.navigate("/");
  }, [close, router]);

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
                  Reject
                </Button>
              </View>
            </View>
          ))}
        </View>
      )}
      {!canSendMessages && !myRequest ? (
        <View style={styles.infoBlock}>
          <Text style={styles.infoTitle}>Request to join</Text>
          <Text style={styles.infoDescription}>
            Send a request so the host can add you to the conversation.
          </Text>
          <Button mode="contained" onPress={handleRequestJoin}>
            Request access
          </Button>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top }]}> 
        <AnimatedHomeButton onPress={handleHomePress} />
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>{conversation.title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
        <HeaderRightMenuButton onPress={handleMenuPress} expanded={isOpen} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.body}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 60}
        >
          <FlatList
            data={conversation.messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={listHeader}
            contentContainerStyle={styles.listContent}
            inverted
          />

          <ChatInput
            value={messageDraft}
            onChangeText={setMessageDraft}
            onSend={handleSendMessage}
            disabled={!canSendMessages}
          />
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <SideMenuNew
        visible={isOpen}
        onClose={close}
        navigate={(route, params) => {
          const target = menuRouteMap[route] ?? route;
          close();
          router.navigate({ pathname: target, params: params ?? {} });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(1),
  },
  headerTextBlock: {
    flex: 1,
    marginHorizontal: spacing(1.5),
  },
  headerTitle: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontWeight: "700",
    fontFamily: typography.fontFamily,
    textAlign: "right",
  },
  headerSubtitle: {
    color: colors.subtitle,
    fontSize: typography.small,
    textAlign: "right",
  },
  body: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(2),
    gap: spacing(1),
  },
  listHeader: {
    gap: spacing(1.5),
    marginBottom: spacing(2),
  },
  infoBlock: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing(1.5),
    gap: spacing(1),
    shadowColor: "rgba(0,0,0,0.06)",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  infoTitle: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: "700",
    textAlign: "right",
  },
  infoDescription: {
    color: colors.text,
    fontSize: typography.small,
    textAlign: "right",
    lineHeight: typography.small * 1.6,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: "700",
    textAlign: "right",
  },
  requestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing(1),
    marginTop: spacing(0.5),
  },
  requestName: {
    color: colors.primary,
    fontSize: typography.body,
    textAlign: "right",
  },
  requestTime: {
    color: colors.subtitle,
    fontSize: typography.small,
    textAlign: "right",
  },
  requestActions: {
    flexDirection: "row",
    gap: spacing(0.5),
  },
});
