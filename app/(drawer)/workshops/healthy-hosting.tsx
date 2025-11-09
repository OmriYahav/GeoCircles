import React, { Suspense } from "react";

import ScreenFallback from "../../../src/components/ScreenFallback";

const HealthyHostingScreen = React.lazy(
  () => import("../../../src/screens/Workshops/HealthyHostingScreen"),
);

export default function HealthyHostingRoute() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <HealthyHostingScreen />
    </Suspense>
  );
}
