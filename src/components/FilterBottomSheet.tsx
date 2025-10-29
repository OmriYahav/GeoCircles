import React from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { Button, Modal, Portal, Switch, Text } from "react-native-paper";

import { Colors } from "../../constants/theme";

type FilterOptionKey = "traffic" | "hiking" | "transport" | "night";

export type FilterState = Record<FilterOptionKey, boolean>;

type FilterBottomSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  filters: FilterState;
  onChange: (next: FilterState) => void;
};

export default function FilterBottomSheet({
  visible,
  onDismiss,
  filters,
  onChange,
}: FilterBottomSheetProps) {
  const toggle = (key: FilterOptionKey) => {
    onChange({ ...filters, [key]: !filters[key] });
  };

  const handleBackToMap = () => {
    Keyboard.dismiss();
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleBackToMap}
        contentContainerStyle={styles.modal}
      >
        <Text style={styles.title}>Map Filters</Text>
        <Text style={styles.subtitle}>Control the layers you want to see in real time.</Text>
        <View style={styles.optionRow}>
          <View>
            <Text style={styles.optionTitle}>Traffic</Text>
            <Text style={styles.optionDescription}>Highlight busy routes around you.</Text>
          </View>
          <Switch value={filters.traffic} onValueChange={() => toggle("traffic")} />
        </View>
        <View style={styles.optionRow}>
          <View>
            <Text style={styles.optionTitle}>Hiking Trails</Text>
            <Text style={styles.optionDescription}>Surface curated outdoor paths.</Text>
          </View>
          <Switch value={filters.hiking} onValueChange={() => toggle("hiking")} />
        </View>
        <View style={styles.optionRow}>
          <View>
            <Text style={styles.optionTitle}>Public Transport</Text>
            <Text style={styles.optionDescription}>Show nearby stations and stops.</Text>
          </View>
          <Switch
            value={filters.transport}
            onValueChange={() => toggle("transport")}
          />
        </View>
        <View style={styles.optionRow}>
          <View>
            <Text style={styles.optionTitle}>Night mode</Text>
            <Text style={styles.optionDescription}>Dim the map for late-night navigation.</Text>
          </View>
          <Switch value={filters.night} onValueChange={() => toggle("night")} />
        </View>
        <Button
          mode="contained"
          icon="arrow-left"
          onPress={handleBackToMap}
          style={styles.closeButton}
        >
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
    marginBottom: 6,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.light.icon,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  optionDescription: {
    fontSize: 13,
    color: Colors.light.icon,
    marginTop: 4,
    maxWidth: 220,
  },
  closeButton: {
    marginTop: 16,
    borderRadius: 14,
  },
});
