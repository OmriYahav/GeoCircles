import React, { Suspense } from "react";

import ScreenFallback from "../../src/components/ScreenFallback";

const TipsScreen = React.lazy(() => import("../../src/screens/TipsScreen"));

export default function TipsRoute() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <TipsScreen />
    </Suspense>
  );
}
