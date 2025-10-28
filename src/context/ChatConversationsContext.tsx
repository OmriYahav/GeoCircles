import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { LatLng } from "react-native-maps";
import dayjs from "dayjs";

import { UserProfile } from "./UserProfileContext";

type ConversationMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  sentAt: number;
};

type JoinRequest = {
  id: string;
  userId: string;
  userName: string;
  requestedAt: number;
  status: "pending" | "approved" | "rejected";
};

type Conversation = {
  id: string;
  title: string;
  coordinate: LatLng;
  createdAt: number;
  hostId: string;
  hostName: string;
  participants: string[];
  messages: ConversationMessage[];
  joinRequests: JoinRequest[];
};

type CreateConversationPayload = {
  title: string;
  coordinate: LatLng;
  host: Pick<UserProfile, "id" | "firstName" | "lastName" | "nickname">;
};

type SendMessagePayload = {
  conversationId: string;
  sender: Pick<UserProfile, "id" | "firstName" | "lastName" | "nickname">;
  text: string;
};

type RequestJoinPayload = {
  conversationId: string;
  user: Pick<UserProfile, "id" | "firstName" | "lastName" | "nickname">;
};

type RespondJoinPayload = {
  conversationId: string;
  requestId: string;
  approve: boolean;
};

type ChatConversationsContextValue = {
  conversations: Conversation[];
  createConversation: (payload: CreateConversationPayload) => string;
  sendMessage: (payload: SendMessagePayload) => void;
  requestToJoin: (payload: RequestJoinPayload) => void;
  respondToJoinRequest: (payload: RespondJoinPayload) => void;
};

function resolveDisplayName(profile: Pick<UserProfile, "firstName" | "lastName" | "nickname">) {
  const { nickname, firstName, lastName } = profile;
  if (nickname.trim()) {
    return nickname.trim();
  }
  if (firstName.trim() || lastName.trim()) {
    return `${firstName.trim()} ${lastName.trim()}`.trim();
  }
  return "Explorer";
}

const ChatConversationsContext = createContext<ChatConversationsContextValue | undefined>(
  undefined
);

export function ChatConversationsProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const createConversation = useCallback<
    ChatConversationsContextValue["createConversation"]
  >(({ coordinate, host, title }) => {
    const id = `${Date.now()}`;
    const hostName = resolveDisplayName(host);
    const conversation: Conversation = {
      id,
      coordinate,
      createdAt: Date.now(),
      hostId: host.id,
      hostName,
      title: title.trim() || `Group near ${coordinate.latitude.toFixed(3)}, ${coordinate.longitude.toFixed(3)}`,
      participants: [host.id],
      messages: [
        {
          id: `${id}-welcome`,
          senderId: host.id,
          senderName: hostName,
          sentAt: Date.now(),
          text: `Started a new conversation at ${dayjs().format("HH:mm")}`,
        },
      ],
      joinRequests: [],
    };

    setConversations((current) => [...current, conversation]);
    return id;
  }, []);

  const sendMessage = useCallback<ChatConversationsContextValue["sendMessage"]>(
    ({ conversationId, sender, text }) => {
      setConversations((current) =>
        current.map((conversation) => {
          if (conversation.id !== conversationId) {
            return conversation;
          }

          if (!text.trim()) {
            return conversation;
          }

          const senderName = resolveDisplayName(sender);

          const message: ConversationMessage = {
            id: `${conversationId}-${Date.now()}`,
            senderId: sender.id,
            senderName,
            text: text.trim(),
            sentAt: Date.now(),
          };

          return {
            ...conversation,
            messages: [...conversation.messages, message],
          };
        })
      );
    },
    []
  );

  const requestToJoin = useCallback<ChatConversationsContextValue["requestToJoin"]>(
    ({ conversationId, user }) => {
      setConversations((current) =>
        current.map((conversation) => {
          if (conversation.id !== conversationId) {
            return conversation;
          }

          if (conversation.participants.includes(user.id)) {
            return conversation;
          }

          const existingPending = conversation.joinRequests.find(
            (request) => request.userId === user.id && request.status === "pending"
          );

          if (existingPending) {
            return conversation;
          }

          const joinRequest: JoinRequest = {
            id: `${conversationId}-request-${Date.now()}`,
            userId: user.id,
            userName: resolveDisplayName(user),
            requestedAt: Date.now(),
            status: "pending",
          };

          return {
            ...conversation,
            joinRequests: [...conversation.joinRequests, joinRequest],
          };
        })
      );
    },
    []
  );

  const respondToJoinRequest = useCallback<
    ChatConversationsContextValue["respondToJoinRequest"]
  >(({ approve, conversationId, requestId }) => {
    setConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== conversationId) {
          return conversation;
        }

        const request = conversation.joinRequests.find((item) => item.id === requestId);
        if (!request || request.status !== "pending") {
          return conversation;
        }

        const updatedRequest: JoinRequest = {
          ...request,
          status: approve ? "approved" : "rejected",
        };

        const updatedRequests = conversation.joinRequests.map((item) =>
          item.id === requestId ? updatedRequest : item
        );

        const participants = approve
          ? Array.from(new Set([...conversation.participants, request.userId]))
          : conversation.participants;

        return {
          ...conversation,
          joinRequests: updatedRequests,
          participants,
        };
      })
    );
  }, []);

  const value = useMemo(
    () => ({
      conversations,
      createConversation,
      requestToJoin,
      respondToJoinRequest,
      sendMessage,
    }),
    [conversations, createConversation, requestToJoin, respondToJoinRequest, sendMessage]
  );

  return (
    <ChatConversationsContext.Provider value={value}>
      {children}
    </ChatConversationsContext.Provider>
  );
}

export function useChatConversations() {
  const context = useContext(ChatConversationsContext);
  if (!context) {
    throw new Error(
      "useChatConversations must be used within a ChatConversationsProvider"
    );
  }
  return context;
}

export type { Conversation, ConversationMessage, JoinRequest };
