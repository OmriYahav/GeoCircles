import React, { Suspense } from "react";

import ScreenFallback from "../../src/components/ScreenFallback";

const HomeScreen = React.lazy(() => import("../../src/screens/HomeScreen"));

export default function DrawerHomeScreen() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <HomeScreen />
    </Suspense>
  );
}
