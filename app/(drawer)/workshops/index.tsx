import React, { Suspense } from "react";

import ScreenFallback from "../../../src/components/ScreenFallback";

const WorkshopsScreen = React.lazy(
  () => import("../../../src/screens/WorkshopsScreen"),
);

export default function WorkshopsRoute() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <WorkshopsScreen />
    </Suspense>
  );
}
