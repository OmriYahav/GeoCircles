import React, { Suspense } from "react";

import AnimatedLoader from "../../src/components/AnimatedLoader";

const HomeScreen = React.lazy(() => import("../../src/screens/HomeScreen"));

export default function DrawerHomeScreen() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <HomeScreen />
    </Suspense>
  );
}
