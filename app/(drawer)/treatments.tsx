import React, { Suspense } from "react";

import AnimatedLoader from "../../src/components/AnimatedLoader";

const TreatmentsScreen = React.lazy(() => import("../../src/screens/TreatmentsScreen"));

export default function TreatmentsRoute() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <TreatmentsScreen />
    </Suspense>
  );
}
