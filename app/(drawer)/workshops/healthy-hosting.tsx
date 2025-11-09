import React, { Suspense } from "react";

import AnimatedLoader from "../../../src/components/AnimatedLoader";

const HealthyHostingScreen = React.lazy(
  () => import("../../../src/screens/Workshops/HealthyHostingScreen"),
);

export default function HealthyHostingRoute() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <HealthyHostingScreen />
    </Suspense>
  );
}
