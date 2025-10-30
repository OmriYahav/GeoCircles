import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Modal, Portal, Text, TextInput } from "react-native-paper";
import { LatLng } from "../types/coordinates";
import { colors, radii, shadows, spacing, typography } from "../theme";

type CreateConversationModalProps = {
  coordinate: LatLng | null;
  visible: boolean;
  onDismiss: () => void;
  onCreate: (title: string) => void;
};

export default function CreateConversationModal({
  coordinate,
  visible,
  onDismiss,
  onCreate,
}: CreateConversationModalProps) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!visible) {
      setTitle("");
    }
  }, [visible]);

  const subtitle = useMemo(() => {
    if (!coordinate) {
      return "Choose a spot on the map to start a conversation";
    }
    return `Latitude ${coordinate.latitude.toFixed(4)}, longitude ${coordinate.longitude.toFixed(4)}`;
  }, [coordinate]);

  const handleCreate = () => {
    onCreate(title.trim());
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Start a new chat circle</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          label="Conversation name"
          placeholder="Friends meetup, hiking crew..."
          style={styles.input}
        />
        <View style={styles.actions}>
          <Button mode="text" onPress={onDismiss}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleCreate}
            disabled={!coordinate}
          >
            Create
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    ...shadows.lg,
  },
  title: {
    fontSize: typography.size.xl,
    fontFamily: typography.family.semiBold,
    color: colors.text.primary,
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.text.secondary,
    fontFamily: typography.family.regular,
  },
  input: {
    marginTop: spacing.xl,
  },
  actions: {
    marginTop: spacing.xxl,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.lg,
  },
});
