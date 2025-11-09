import React, { Suspense } from "react";

import ScreenFallback from "../../src/components/ScreenFallback";

const TreatmentsScreen = React.lazy(() => import("../../src/screens/TreatmentsScreen"));

export default function TreatmentsRoute() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <TreatmentsScreen />
    </Suspense>
  );
}
