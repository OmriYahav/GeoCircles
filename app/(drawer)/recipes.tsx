import React, { Suspense } from "react";

const RecipesScreen = React.lazy(() => import("../../src/screens/RecipesScreen"));

export default function RecipesRoute() {
  return (
    <Suspense fallback={null}>
      <RecipesScreen />
    </Suspense>
  );
}
