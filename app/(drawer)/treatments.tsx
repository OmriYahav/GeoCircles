import React, { Suspense } from "react";

const TreatmentsScreen = React.lazy(() => import("../../src/screens/TreatmentsScreen"));

export default function TreatmentsRoute() {
  return (
    <Suspense fallback={null}>
      <TreatmentsScreen />
    </Suspense>
  );
}
