import React, { Suspense } from "react";

import ScreenFallback from "../../../src/components/ScreenFallback";

const HealthyBakingScreen = React.lazy(
  () => import("../../../src/screens/Workshops/HealthyBakingScreen"),
);

export default function HealthyBakingRoute() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <HealthyBakingScreen />
    </Suspense>
  );
}
