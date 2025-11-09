import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing, typography } from "../theme";

const palette = {
  background: "#F4E8D5",
  primary: "#4F6A54",
};

type SweetBalanceLogoProps = {
  size?: number;
};

export default function SweetBalanceLogo({ size = 220 }: SweetBalanceLogoProps) {
  const leafHeight = size * 0.44;
  const leafWidth = size * 0.22;
  const stemWidth = Math.max(4, Math.round(size * 0.06));
  const stemHeight = size * 0.42;
  const branchOffset = size * 0.14;
  const titleFontSize = size * 0.28;
  const subtitleFontSize = size * 0.11;

  const leafBaseStyle = {
    width: leafWidth,
    height: leafHeight,
    borderRadius: leafWidth,
    backgroundColor: palette.primary,
  } as const;

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingVertical: size * 0.22,
          paddingHorizontal: size * 0.32,
          borderRadius: size * 0.6,
        },
      ]}
    >
      <View style={styles.logoArt}>
        <View style={styles.leafCluster}>
          <View
            style={[
              leafBaseStyle,
              {
                transform: [{ rotate: "-32deg" }],
                marginRight: size * 0.08,
                marginTop: size * 0.12,
              },
            ]}
          />
          <View
            style={[
              leafBaseStyle,
              {
                transform: [{ rotate: "0deg" }],
                marginTop: 0,
              },
            ]}
          />
          <View
            style={[
              leafBaseStyle,
              {
                transform: [{ rotate: "32deg" }],
                marginLeft: size * 0.08,
                marginTop: size * 0.12,
              },
            ]}
          />
        </View>

        <View style={styles.stems}>
          <View
            style={[
              styles.stem,
              {
                width: stemWidth,
                height: stemHeight,
                borderRadius: stemWidth,
              },
            ]}
          />
          <View
            style={[
              styles.sideStem,
              {
                width: stemWidth,
                height: stemHeight * 0.7,
                borderRadius: stemWidth,
                right: branchOffset,
                transform: [{ rotate: "-35deg" }],
              },
            ]}
          />
          <View
            style={[
              styles.sideStem,
              {
                width: stemWidth,
                height: stemHeight * 0.7,
                borderRadius: stemWidth,
                left: branchOffset,
                transform: [{ rotate: "35deg" }],
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text
          accessibilityRole="header"
          style={[
            styles.title,
            {
              fontSize: titleFontSize,
              lineHeight: titleFontSize * 1.05,
            },
          ]}
        >
          Sweet
        </Text>
        <Text
          accessibilityRole="header"
          style={[
            styles.title,
            {
              fontSize: titleFontSize,
              lineHeight: titleFontSize * 1.05,
              marginTop: spacing(0.25),
            },
          ]}
        >
          Balance
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              fontSize: subtitleFontSize,
              marginTop: spacing(0.5),
            },
          ]}
        >
          by Bat-Chen Lev
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: palette.background,
    alignItems: "center",
    justifyContent: "center",
  },
  logoArt: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  leafCluster: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  stems: {
    marginTop: spacing(0.5),
    alignItems: "center",
    justifyContent: "center",
  },
  stem: {
    backgroundColor: palette.primary,
  },
  sideStem: {
    position: "absolute",
    top: spacing(0.5),
    backgroundColor: palette.primary,
  },
  textBlock: {
    alignItems: "center",
    marginTop: spacing(0.75),
  },
  title: {
    color: palette.primary,
    fontFamily: typography.family.heading,
    textAlign: "center",
  },
  subtitle: {
    color: palette.primary,
    fontFamily: typography.family.medium,
    textAlign: "center",
  },
});

