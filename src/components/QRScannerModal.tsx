import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Modal, Portal, Text } from "react-native-paper";
import { BarCodeEvent, BarCodeScanner } from "expo-barcode-scanner";

import { Colors } from "../../constants/theme";

type QRScannerModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onScanned: (data: string) => void;
};

export default function QRScannerModal({
  visible,
  onDismiss,
  onScanned,
}: QRScannerModalProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!visible) {
      setIsScanning(true);
      return;
    }

    BarCodeScanner.requestPermissionsAsync()
      .then(({ status }) => {
        setHasPermission(status === "granted");
      })
      .catch((error) => {
        console.warn("Failed to request camera permissions", error);
        setHasPermission(false);
      });
  }, [visible]);

  const handleBarCodeScanned = ({ data }: BarCodeEvent) => {
    if (!isScanning) {
      return;
    }
    setIsScanning(false);
    onScanned(data);
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text style={styles.title}>Scan QR code</Text>
        {hasPermission === false ? (
          <Text style={styles.permissionText}>
            Camera access is required to scan QR codes. Enable it in your system settings
            to continue.
          </Text>
        ) : (
          <View style={styles.scannerContainer}>
            {hasPermission === null ? (
              <Text style={styles.permissionText}>Checking camera permissions…</Text>
            ) : (
              <BarCodeScanner
                style={StyleSheet.absoluteFill}
                onBarCodeScanned={handleBarCodeScanned}
              />
            )}
            <View style={styles.overlayBox} pointerEvents="none" />
          </View>
        )}
        <Button onPress={onDismiss} style={styles.closeButton} mode="contained">
          Close
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
    backgroundColor: "rgba(0, 0, 0, 0.92)",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  permissionText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },
  scannerContainer: {
    height: 280,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#000",
  },
  overlayBox: {
    position: "absolute",
    left: 24,
    right: 24,
    top: 40,
    bottom: 40,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  closeButton: {
    alignSelf: "flex-end",
    borderRadius: 12,
  },
});
