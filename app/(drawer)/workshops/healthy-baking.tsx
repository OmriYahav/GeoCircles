import React, { Suspense } from "react";

import AnimatedLoader from "../../../src/components/AnimatedLoader";

const HealthyBakingScreen = React.lazy(
  () => import("../../../src/screens/Workshops/HealthyBakingScreen"),
);

export default function HealthyBakingRoute() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <HealthyBakingScreen />
    </Suspense>
  );
}
