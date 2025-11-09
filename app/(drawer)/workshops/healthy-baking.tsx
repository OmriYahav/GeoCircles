import React, { Suspense } from "react";

const HealthyBakingScreen = React.lazy(
  () => import("../../../src/screens/Workshops/HealthyBakingScreen"),
);

export default function HealthyBakingRoute() {
  return (
    <Suspense fallback={null}>
      <HealthyBakingScreen />
    </Suspense>
  );
}
