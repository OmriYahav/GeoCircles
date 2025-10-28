import React, { useEffect, useRef, useState } from "react";
import { Keyboard, Platform, StyleSheet, View } from "react-native";
import { Button, Modal, Portal, Text } from "react-native-paper";
import type { BarCodeEvent } from "expo-barcode-scanner";

import { Colors } from "../../constants/theme";

const DEFAULT_PERMISSION_MESSAGE =
  "Camera access is required to scan QR codes. Enable it in your system settings to continue.";
const UNSUPPORTED_PLATFORM_MESSAGE =
  "QR code scanning is only available on iOS and Android devices.";
const UNAVAILABLE_MESSAGE = "QR code scanning isn't available on this device.";

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
  const [permissionMessage, setPermissionMessage] = useState(DEFAULT_PERMISSION_MESSAGE);
  const scannerModuleRef = useRef<typeof import("expo-barcode-scanner") | null>(null);
  const isNativePlatform = Platform.OS === "ios" || Platform.OS === "android";

  useEffect(() => {
    if (!visible) {
      setIsScanning(true);
      setHasPermission(null);
      setPermissionMessage(DEFAULT_PERMISSION_MESSAGE);
      return;
    }

    if (!isNativePlatform) {
      setHasPermission(false);
      setPermissionMessage(UNSUPPORTED_PLATFORM_MESSAGE);
      return;
    }

    let isMounted = true;

    const loadModuleAndRequestPermission = async () => {
      try {
        const module =
          scannerModuleRef.current ?? (await import("expo-barcode-scanner"));
        if (!isMounted) {
          return;
        }

        scannerModuleRef.current = module;

        const { status } = await module.requestPermissionsAsync();

        if (!isMounted) {
          return;
        }

        const granted = status === "granted";
        setHasPermission(granted);
        if (!granted) {
          setPermissionMessage(DEFAULT_PERMISSION_MESSAGE);
        }
      } catch (error) {
        console.warn("Failed to request camera permissions", error);
        if (isMounted) {
          setHasPermission(false);
          setPermissionMessage(UNAVAILABLE_MESSAGE);
        }
      }
    };

    loadModuleAndRequestPermission();

    return () => {
      isMounted = false;
    };
  }, [visible, isNativePlatform]);

  const handleBarCodeScanned = ({ data }: BarCodeEvent) => {
    if (!isScanning) {
      return;
    }
    setIsScanning(false);
    onScanned(data);
  };

  const ScannerView = scannerModuleRef.current?.BarCodeScanner;

  const handleDismiss = () => {
    Keyboard.dismiss();
    onDismiss();
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={styles.modal}>
        <Text style={styles.title}>Scan QR code</Text>
        {hasPermission === false ? (
          <Text style={styles.permissionText}>{permissionMessage}</Text>
        ) : (
          <View style={styles.scannerContainer}>
            {hasPermission === null ? (
              <Text style={styles.permissionText}>Checking camera permissions…</Text>
            ) : ScannerView ? (
              <ScannerView
                style={StyleSheet.absoluteFill}
                onBarCodeScanned={handleBarCodeScanned}
              />
            ) : (
              <Text style={styles.permissionText}>Preparing camera…</Text>
            )}
            <View style={styles.overlayBox} pointerEvents="none" />
          </View>
        )}
        <Button onPress={handleDismiss} style={styles.closeButton} mode="contained">
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
