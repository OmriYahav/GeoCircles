import React, { Suspense } from "react";

import AnimatedLoader from "../components/AnimatedLoader";

const LazyScreen = React.lazy(() => import("./BlogScreenContent"));

export default function BlogScreen() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <LazyScreen />
    </Suspense>
  );
}
