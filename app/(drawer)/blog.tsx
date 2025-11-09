import React, { Suspense } from "react";

import ScreenFallback from "../../src/components/ScreenFallback";

const BlogScreen = React.lazy(() => import("../../src/screens/BlogScreen"));

export default function BlogRoute() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <BlogScreen />
    </Suspense>
  );
}
