import React, { Suspense } from "react";

const LazyScreen = React.lazy(() => import("./WorkshopsScreenContent"));

export default function WorkshopsScreen() {
  return (
    <Suspense fallback={null}>
      <LazyScreen />
    </Suspense>
  );
}
