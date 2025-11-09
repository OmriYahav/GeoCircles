import React, { Suspense } from "react";

import AnimatedLoader from "../../../src/components/AnimatedLoader";

const WorkshopsScreen = React.lazy(
  () => import("../../../src/screens/WorkshopsScreen"),
);

export default function WorkshopsRoute() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <WorkshopsScreen />
    </Suspense>
  );
}
