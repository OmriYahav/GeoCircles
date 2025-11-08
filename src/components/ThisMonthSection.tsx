import React from "react";

import Card from "./Card";

type ThisMonthSectionProps = {
  onReserve: () => void;
};

export default function ThisMonthSection({ onReserve }: ThisMonthSectionProps) {
  return (
    <Card
      title="החודש ב-Sweet Balance"
      subtitle="סדנת אפייה בריאה – 12.12.2025, 18:30 • מקומות מוגבלים"
      icon="calendar"
      onPress={onReserve}
    />
  );
}
