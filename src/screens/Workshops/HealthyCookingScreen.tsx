import React, { useMemo } from "react";
import dayjs from "dayjs";

import WorkshopReservation from "./WorkshopReservation";

export default function HealthyCookingScreen() {
  const nextDate = useMemo(() => dayjs().add(21, "day").format("YYYY-MM-DD"), []);

  return (
    <WorkshopReservation
      workshopId="healthy-cooking"
      title="בישול בריא"
      nextDate={nextDate}
    />
  );
}
