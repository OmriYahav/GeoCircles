import React, { Suspense } from "react";

import AnimatedLoader from "../components/AnimatedLoader";

const LazyScreen = React.lazy(() => import("./TreatmentsScreenContent"));

export default function TreatmentsScreen() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <LazyScreen />
    </Suspense>
  );
}
