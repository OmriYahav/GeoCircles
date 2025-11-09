import React, { Suspense } from "react";

const LazyScreen = React.lazy(() => import("./BlogScreenContent"));

export default function BlogScreen() {
  return (
    <Suspense fallback={null}>
      <LazyScreen />
    </Suspense>
  );
}
