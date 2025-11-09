import React, { Suspense } from "react";

import AnimatedLoader from "../../src/components/AnimatedLoader";

const RecipesScreen = React.lazy(() => import("../../src/screens/RecipesScreen"));

export default function RecipesRoute() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <RecipesScreen />
    </Suspense>
  );
}
