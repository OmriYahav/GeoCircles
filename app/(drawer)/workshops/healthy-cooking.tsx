import React, { Suspense } from "react";

import AnimatedLoader from "../../../src/components/AnimatedLoader";

const HealthyCookingScreen = React.lazy(
  () => import("../../../src/screens/Workshops/HealthyCookingScreen"),
);

export default function HealthyCookingRoute() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <HealthyCookingScreen />
    </Suspense>
  );
}
