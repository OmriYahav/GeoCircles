import React, { Suspense } from "react";

const WorkshopsScreen = React.lazy(
  () => import("../../../src/screens/WorkshopsScreen"),
);

export default function WorkshopsRoute() {
  return (
    <Suspense fallback={null}>
      <WorkshopsScreen />
    </Suspense>
  );
}
