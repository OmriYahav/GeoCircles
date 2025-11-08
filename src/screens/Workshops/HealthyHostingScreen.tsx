import React, { useMemo } from "react";
import dayjs from "dayjs";

import WorkshopReservation from "./WorkshopReservation";

export default function HealthyHostingScreen() {
  const nextDate = useMemo(() => dayjs().add(35, "day").format("YYYY-MM-DD"), []);

  return (
    <WorkshopReservation
      workshopId="healthy-hosting"
      title="אירוח בריא"
      nextDate={nextDate}
    />
  );
}
