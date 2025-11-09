import React, { Suspense } from "react";

import AnimatedLoader from "../components/AnimatedLoader";

const LazyScreen = React.lazy(() => import("./WorkshopsScreenContent"));

export default function WorkshopsScreen() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <LazyScreen />
    </Suspense>
  );
}
