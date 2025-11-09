import React, { Suspense } from "react";

import AnimatedLoader from "../../../src/components/AnimatedLoader";

const NaturalCosmeticsScreen = React.lazy(
  () => import("../../../src/screens/Workshops/NaturalCosmeticsScreen"),
);

export default function NaturalCosmeticsRoute() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <NaturalCosmeticsScreen />
    </Suspense>
  );
}
