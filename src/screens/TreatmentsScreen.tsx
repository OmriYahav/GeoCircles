import React, { Suspense } from "react";

const LazyScreen = React.lazy(() => import("./TreatmentsScreenContent"));

export default function TreatmentsScreen() {
  return (
    <Suspense fallback={null}>
      <LazyScreen />
    </Suspense>
  );
}
