import React, { useEffect, useState } from "react";
import { FlatList, Keyboard, Pressable, StyleSheet, View } from "react-native";
import { Button, Modal, Portal, Text, TextInput } from "react-native-paper";

import { Colors } from "../../constants/theme";
import { SearchResult, searchPlaces } from "../services/MapService";

type RoutePlannerModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onPlan: (params: { start: SearchResult; destination: SearchResult }) => void;
};

type ActiveField = "start" | "destination";

export default function RoutePlannerModal({
  visible,
  onDismiss,
  onPlan,
}: RoutePlannerModalProps) {
  const [startQuery, setStartQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [startResult, setStartResult] = useState<SearchResult | null>(null);
  const [destinationResult, setDestinationResult] = useState<SearchResult | null>(
    null
  );
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeField, setActiveField] = useState<ActiveField>("start");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setStartQuery("");
      setDestinationQuery("");
      setResults([]);
      setStartResult(null);
      setDestinationResult(null);
      setActiveField("start");
    }
  }, [visible]);

  useEffect(() => {
    const controller = new AbortController();
    const query = activeField === "start" ? startQuery : destinationQuery;
    if (!query.trim()) {
      setResults([]);
      return () => controller.abort();
    }

    setIsLoading(true);
    searchPlaces(query)
      .then((items) => {
        setResults(items);
      })
      .catch((error) => {
        console.warn("Failed to search route locations", error);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [activeField, startQuery, destinationQuery]);

  const handleSelectResult = (item: SearchResult) => {
    if (activeField === "start") {
      setStartResult(item);
      setStartQuery(item.displayName);
      setActiveField("destination");
    } else {
      setDestinationResult(item);
      setDestinationQuery(item.displayName);
    }
    setResults([]);
  };

  const canSubmit = Boolean(startResult && destinationResult);

  const handleDismiss = () => {
    Keyboard.dismiss();
    onDismiss();
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={styles.modal}>
        <Text style={styles.title}>Plan a route</Text>
        <Text style={styles.subtitle}>Choose where you’d like to start and finish.</Text>
        <TextInput
          label="Start"
          mode="outlined"
          value={startQuery}
          onChangeText={(text) => {
            setStartQuery(text);
            setActiveField("start");
            setStartResult(null);
          }}
          onFocus={() => setActiveField("start")}
          style={styles.input}
        />
        <TextInput
          label="Destination"
          mode="outlined"
          value={destinationQuery}
          onChangeText={(text) => {
            setDestinationQuery(text);
            setActiveField("destination");
            setDestinationResult(null);
          }}
          onFocus={() => setActiveField("destination")}
          style={styles.input}
        />
        {results.length > 0 && (
          <View style={styles.resultsContainer}>
            <FlatList
              keyboardShouldPersistTaps="handled"
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelectResult(item)}
                  style={({ pressed }) => [
                    styles.resultItem,
                    pressed && styles.resultItemPressed,
                  ]}
                >
                  <Text style={styles.resultTitle}>{item.displayName}</Text>
                  <Text style={styles.resultSubtitle}>
                    {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        )}
        <Button
          mode="contained"
          disabled={!canSubmit || isLoading}
          onPress={() => {
            if (startResult && destinationResult) {
              onPlan({ start: startResult, destination: destinationResult });
            }
          }}
          style={styles.planButton}
        >
          {isLoading ? "Searching…" : "Show route"}
        </Button>
        <Button icon="arrow-left" onPress={handleDismiss} style={styles.cancelButton}>
          Back to map
        </Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.97)",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.icon,
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  resultsContainer: {
    maxHeight: 200,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "rgba(250,250,250,0.95)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.05)",
  },
  resultItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  resultItemPressed: {
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  resultTitle: {
    color: Colors.light.text,
    fontSize: 15,
    fontWeight: "600",
  },
  resultSubtitle: {
    color: Colors.light.icon,
    fontSize: 12,
    marginTop: 4,
  },
  planButton: {
    marginTop: 8,
    borderRadius: 14,
  },
  cancelButton: {
    marginTop: 4,
  },
});
