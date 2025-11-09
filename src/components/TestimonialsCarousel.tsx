import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../theme";

type TestimonialsCarouselProps = {
  items: { name: string; quote: string }[];
};

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function TestimonialsCarousel({ items }: TestimonialsCarouselProps) {
  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={{ marginVertical: spacing(2) }}
      contentContainerStyle={{ paddingHorizontal: spacing(2) }}
    >
      {items.map((item, index) => (
        <View
          key={`${item.name}-${index}`}
          style={[styles.slide, { width: SCREEN_WIDTH - spacing(4) }]}
        >
          <Text style={styles.quote}>{`“${item.quote}”`}</Text>
          <Text style={styles.name}>{`— ${item.name}`}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  slide: {
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: spacing(2),
    marginHorizontal: spacing(1),
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  quote: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: Math.round(typography.body * 1.45),
    fontFamily: typography.family.regular,
  },
  name: {
    color: "#5b6d61",
    marginTop: 6,
    fontSize: typography.size.sm,
    fontFamily: typography.family.medium,
    lineHeight: Math.round(typography.size.sm * 1.35),
  },
});
