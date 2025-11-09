import React, { Suspense } from "react";

import ScreenFallback from "../../src/components/ScreenFallback";

const RecipesScreen = React.lazy(() => import("../../src/screens/RecipesScreen"));

export default function RecipesRoute() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <RecipesScreen />
    </Suspense>
  );
}
