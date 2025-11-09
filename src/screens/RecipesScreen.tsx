import React, { Suspense } from "react";

const LazyScreen = React.lazy(() => import("./RecipesScreenContent"));

export default function RecipesScreen() {
  return (
    <Suspense fallback={null}>
      <LazyScreen />
    </Suspense>
  );
}
