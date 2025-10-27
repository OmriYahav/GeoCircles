import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export default function MapScreen() {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; height: 100%; }
          iframe { border: 0; width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193571.43830260472!2d-74.11808643851677!3d40.70582543401667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzIxLjAiTiA3NMKwMDcnMzAuMCJX!5e0!3m2!1sen!2sus!4v1699999999999"
          allowfullscreen=""
          loading="lazy">
        </iframe>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView originWhitelist={["*"]} source={{ html }} style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
