import React, { Suspense } from "react";

const TipsScreen = React.lazy(() => import("../../src/screens/TipsScreen"));

export default function TipsRoute() {
  return (
    <Suspense fallback={null}>
      <TipsScreen />
    </Suspense>
  );
}
