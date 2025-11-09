import React, { Suspense } from "react";

import ScreenFallback from "../../../src/components/ScreenFallback";

const HealthyCookingScreen = React.lazy(
  () => import("../../../src/screens/Workshops/HealthyCookingScreen"),
);

export default function HealthyCookingRoute() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <HealthyCookingScreen />
    </Suspense>
  );
}
