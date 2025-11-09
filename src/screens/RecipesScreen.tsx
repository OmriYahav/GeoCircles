import React, { Suspense } from "react";

import AnimatedLoader from "../components/AnimatedLoader";

const LazyScreen = React.lazy(() => import("./RecipesScreenContent"));

export default function RecipesScreen() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <LazyScreen />
    </Suspense>
  );
}
