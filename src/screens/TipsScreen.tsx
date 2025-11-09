import React, { Suspense } from "react";

const LazyScreen = React.lazy(() => import("./TipsScreenContent"));

export default function TipsScreen() {
  return (
    <Suspense fallback={null}>
      <LazyScreen />
    </Suspense>
  );
}
