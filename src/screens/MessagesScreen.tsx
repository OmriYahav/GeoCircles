import React, { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Avatar, Text } from "react-native-paper";

const dummyMessages = [
  {
    id: "1",
    sender: "Lena",
    message: "Hey! Are you going to the riverside night market tonight?",
    timestamp: "2m ago",
  },
  {
    id: "2",
    sender: "Me",
    message: "Absolutely. Let’s meet near the main stage around 7?",
    timestamp: "Just now",
  },
];

export default function MessagesScreen() {
  const messages = useMemo(() => dummyMessages, []);

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Avatar.Text
            size={44}
            label={item.sender === "Me" ? "ME" : item.sender[0].toUpperCase()}
            style={item.sender === "Me" ? styles.meAvatar : styles.otherAvatar}
          />
          <View style={styles.bubble}>
            <Text variant="labelMedium" style={styles.sender}>
              {item.sender}
            </Text>
            <Text variant="bodyMedium" style={styles.message}>
              {item.message}
            </Text>
            <Text variant="bodySmall" style={styles.timestamp}>
              {item.timestamp}
            </Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 24,
    gap: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bubble: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginLeft: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  sender: {
    fontWeight: "700",
    color: "rgba(0,0,0,0.7)",
  },
  message: {
    marginTop: 6,
    color: "rgba(0,0,0,0.8)",
  },
  timestamp: {
    marginTop: 10,
    color: "rgba(0,0,0,0.45)",
  },
  meAvatar: {
    backgroundColor: "#1d4ed8",
  },
  otherAvatar: {
    backgroundColor: "#9333ea",
  },
});
