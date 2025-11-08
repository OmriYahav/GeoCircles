import React, { useMemo } from "react";
import dayjs from "dayjs";

import WorkshopReservation from "./WorkshopReservation";

export default function NaturalCosmeticsScreen() {
  const nextDate = useMemo(() => dayjs().add(28, "day").format("YYYY-MM-DD"), []);

  return (
    <WorkshopReservation
      workshopId="natural-care"
      title="רוקחות טבעית"
      nextDate={nextDate}
    />
  );
}
