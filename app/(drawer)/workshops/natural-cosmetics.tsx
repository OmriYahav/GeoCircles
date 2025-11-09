import React, { Suspense } from "react";

import ScreenFallback from "../../../src/components/ScreenFallback";

const NaturalCosmeticsScreen = React.lazy(
  () => import("../../../src/screens/Workshops/NaturalCosmeticsScreen"),
);

export default function NaturalCosmeticsRoute() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <NaturalCosmeticsScreen />
    </Suspense>
  );
}
