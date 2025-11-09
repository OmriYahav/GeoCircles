import React, { Suspense } from "react";

const HealthyHostingScreen = React.lazy(
  () => import("../../../src/screens/Workshops/HealthyHostingScreen"),
);

export default function HealthyHostingRoute() {
  return (
    <Suspense fallback={null}>
      <HealthyHostingScreen />
    </Suspense>
  );
}
