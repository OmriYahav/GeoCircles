import React, { Suspense } from "react";

import AnimatedLoader from "../../src/components/AnimatedLoader";

const TipsScreen = React.lazy(() => import("../../src/screens/TipsScreen"));

export default function TipsRoute() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <TipsScreen />
    </Suspense>
  );
}
