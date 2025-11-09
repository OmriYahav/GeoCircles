import React, { Suspense } from "react";

const HealthyCookingScreen = React.lazy(
  () => import("../../../src/screens/Workshops/HealthyCookingScreen"),
);

export default function HealthyCookingRoute() {
  return (
    <Suspense fallback={null}>
      <HealthyCookingScreen />
    </Suspense>
  );
}
