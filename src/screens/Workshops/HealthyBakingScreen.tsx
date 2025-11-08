import React, { useMemo } from "react";
import dayjs from "dayjs";

import WorkshopReservation from "./WorkshopReservation";

export default function HealthyBakingScreen() {
  const nextDate = useMemo(() => dayjs().add(14, "day").format("YYYY-MM-DD"), []);

  return (
    <WorkshopReservation
      workshopId="kids-baking"
      title="אפיה בריאה לילדים"
      nextDate={nextDate}
    />
  );
}
