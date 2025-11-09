import React, { Suspense } from "react";

const NaturalCosmeticsScreen = React.lazy(
  () => import("../../../src/screens/Workshops/NaturalCosmeticsScreen"),
);

export default function NaturalCosmeticsRoute() {
  return (
    <Suspense fallback={null}>
      <NaturalCosmeticsScreen />
    </Suspense>
  );
}
