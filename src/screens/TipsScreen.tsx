import React, { Suspense } from "react";

import AnimatedLoader from "../components/AnimatedLoader";

const LazyScreen = React.lazy(() => import("./TipsScreenContent"));

export default function TipsScreen() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <LazyScreen />
    </Suspense>
  );
}
